import grpc from 'k6/net/grpc';
import { check } from 'k6';

const bragiClient = new grpc.Client();
bragiClient.load(['bragi_proto'], 'bragi_service.proto');

const ghostClient = new grpc.Client();
ghostClient.load(['../proto'], 'ghost/ghost.proto');

export const options = {
  thresholds: {
    checks: ['rate==1.0'],
  },
};

const BRAGI_ADDR = __ENV.BRAGI_ADDR || 'api-bragi-test.integration.oddin.dev:443';
const GHOST_ADDR = __ENV.GHOST_ADDR || 'api-ghost-grpc-test-integration.oddin.dev:443';
const BRAGI_METADATA = { metadata: { token: __ENV.BRAGI_TOKEN || 'a9122914-31ee-4975-80f4-cb458d71d756' } };
const GHOST_METADATA = { metadata: { token: __ENV.GHOST_TOKEN || '7bbed918-89e7-4f3d-afd8-c7fd43238e53' } };

const VALID_STATUSES = [
  'MATCH_STATUS_UNKNOWN',
  'MATCH_STATUS_AVAILABLE',
  'MATCH_STATUS_UNAVAILABLE',
];

export default function () {
  // --- Step 1: Get real match URNs from Bragi ---
  bragiClient.connect(BRAGI_ADDR);

  const timelineRes = bragiClient.invoke('bragi.Bragi/MatchTimeline', { live_only: false }, BRAGI_METADATA);

  check(timelineRes, {
    '[Setup] Bragi MatchTimeline status is OK': (r) => r.status === grpc.StatusOK,
  });

  const matches = timelineRes.message?.matches || [];
  bragiClient.close();

  if (matches.length === 0) {
    console.log('No matches available from Bragi — skipping Ghost tests');
    return;
  }

  // --- Step 2: Connect to Ghost ---
  ghostClient.connect(GHOST_ADDR);

  // --- Test 1: GetMatchStatus with a live/planned match ---
  const matchUrn = matches[0].matchUrn;

  const statusRes = ghostClient.invoke('ghost.Ghost/GetMatchStatus', { match_urn: matchUrn }, GHOST_METADATA);

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

  // --- Test 2: GetMatchStatus with multiple matches (validate consistency) ---
  const secondMatchUrn = matches.length > 1 ? matches[1].matchUrn : null;

  if (secondMatchUrn) {
    const statusRes2 = ghostClient.invoke('ghost.Ghost/GetMatchStatus', { match_urn: secondMatchUrn }, GHOST_METADATA);

    check(statusRes2, {
      '[MatchStatus2] Status is OK': (r) => r.status === grpc.StatusOK,
      '[MatchStatus2] Response message is not null': (r) => r.message != null,
      '[MatchStatus2] matchStatus is a valid enum': (r) =>
        r.message != null && VALID_STATUSES.includes(r.message.matchStatus),
    });
  }

  // --- Test 3: GetMatchStatus with nonexistent match URN ---
  const invalidRes = ghostClient.invoke('ghost.Ghost/GetMatchStatus', { match_urn: 'od:match:999999999' }, GHOST_METADATA);

  check(invalidRes, {
    '[InvalidMatch] Request completes without crash': (r) => r.status !== undefined,
  });

  if (invalidRes.message) {
    check(invalidRes.message, {
      '[InvalidMatch] Returns a valid status enum': (m) => VALID_STATUSES.includes(m.matchStatus),
    });
  }

  // --- Test 4: GetMatchStatus with empty URN ---
  const emptyRes = ghostClient.invoke('ghost.Ghost/GetMatchStatus', { match_urn: '' }, GHOST_METADATA);

  check(emptyRes, {
    '[EmptyURN] Request completes without crash': (r) => r.status !== undefined,
  });

  ghostClient.close();
}
