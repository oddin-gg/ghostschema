import grpc from 'k6/net/grpc';
import { check } from 'k6';

const bragiClient = new grpc.Client();
bragiClient.load(['bragi_proto'], 'bragi/bragi_service.proto');

const ghostClient = new grpc.Client();
ghostClient.load(['../proto'], 'ghost/ghost.proto');

export const options = {
  thresholds: {
    checks: ['rate==1.0'],
  },
};

const BRAGI_ADDR = __ENV.BRAGI_ADDR || 'api-bragi-test.integration.oddin.dev:443';
const GHOST_ADDR = __ENV.GHOST_ADDR || 'api-ghost-grpc-test-integration.oddin.dev:443';

const BRAGI_TOKEN = __ENV.BRAGI_TOKEN;
if (!BRAGI_TOKEN) {
  throw new Error('Missing required environment variable: BRAGI_TOKEN');
}

const GHOST_TOKEN = __ENV.GHOST_TOKEN;
if (!GHOST_TOKEN) {
  throw new Error('Missing required environment variable: GHOST_TOKEN');
}

const BRAGI_METADATA = { metadata: { token: BRAGI_TOKEN } };
const GHOST_METADATA = { metadata: { token: GHOST_TOKEN } };

const VALID_STATUSES = [
  'MATCH_STATUS_UNKNOWN',
  'MATCH_STATUS_AVAILABLE',
  'MATCH_STATUS_UNAVAILABLE',
];

export function setup() {
  // Resolve match URNs from Bragi once before test iterations
  bragiClient.connect(BRAGI_ADDR);

  let matches = [];
  try {
    const timelineRes = bragiClient.invoke('bragi.Bragi/MatchTimeline', { liveOnly: false }, BRAGI_METADATA);

    check(timelineRes, {
      '[Setup] Bragi MatchTimeline status is OK': (r) => r.status === grpc.StatusOK,
    });

    matches = timelineRes.message?.matches || [];
  } finally {
    bragiClient.close();
  }

  if (matches.length === 0) {
    console.warn('No matches available from Bragi — live-match tests will be skipped');
  }

  return {
    matchUrn: __ENV.MATCH_URN || (matches.length > 0 ? matches[0].matchUrn : null),
    secondMatchUrn: matches.length > 1 ? matches[1].matchUrn : null,
  };
}

export default function (data) {
  ghostClient.connect(GHOST_ADDR);

  try {
    // --- Tests 1 & 2: Live-match-dependent (skipped when no matches available) ---
    if (data.matchUrn) {
      const statusRes = ghostClient.invoke('ghost.Ghost/GetMatchStatus', { matchUrn: data.matchUrn }, GHOST_METADATA);

      check(statusRes, {
        '[MatchStatus] Status is OK': (r) => r.status === grpc.StatusOK,
        '[MatchStatus] Response message is not null': (r) => r.message != null,
      });

      if (statusRes.message) {
        check(statusRes.message, {
          '[MatchStatus] Has matchStatus field': (m) => typeof m.matchStatus === 'string',
          '[MatchStatus] matchStatus is a valid enum': (m) => VALID_STATUSES.includes(m.matchStatus),
        });
      }

      if (data.secondMatchUrn) {
        const statusRes2 = ghostClient.invoke('ghost.Ghost/GetMatchStatus', { matchUrn: data.secondMatchUrn }, GHOST_METADATA);

        check(statusRes2, {
          '[MatchStatus2] Status is OK': (r) => r.status === grpc.StatusOK,
          '[MatchStatus2] Response message is not null': (r) => r.message != null,
          '[MatchStatus2] matchStatus is a valid enum': (r) =>
            r.message != null && VALID_STATUSES.includes(r.message.matchStatus),
        });
      }
    }

    // --- Test 3: GetMatchStatus with nonexistent match URN ---
    const invalidRes = ghostClient.invoke('ghost.Ghost/GetMatchStatus', { matchUrn: 'od:match:999999999' }, GHOST_METADATA);

    check(invalidRes, {
      '[InvalidMatch] Status is OK': (r) => r.status === grpc.StatusOK,
      '[InvalidMatch] Returns a valid status enum': (r) =>
        r.message != null && VALID_STATUSES.includes(r.message.matchStatus),
    });

    // --- Test 4: GetMatchStatus with empty URN ---
    const emptyRes = ghostClient.invoke('ghost.Ghost/GetMatchStatus', { matchUrn: '' }, GHOST_METADATA);

    check(emptyRes, {
      '[EmptyURN] Returns expected error': (r) => r.status === grpc.StatusInvalidArgument,
    });
  } finally {
    ghostClient.close();
  }
}
