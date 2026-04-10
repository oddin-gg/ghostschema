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

export default function () {
  // --- Step 1: Get live match URNs from Bragi (Ghost only has data for live/visualized matches) ---
  bragiClient.connect(BRAGI_ADDR);

  const cs2Res = bragiClient.invoke(
    'bragi.Bragi/MatchTimeline',
    { liveOnly: true, sport: 'SPORT_CS2' },
    BRAGI_METADATA
  );

  const dota2Res = bragiClient.invoke(
    'bragi.Bragi/MatchTimeline',
    { liveOnly: true, sport: 'SPORT_DOTA2' },
    BRAGI_METADATA
  );

  check(cs2Res, {
    '[Setup] Bragi CS2 timeline status is OK': (r) => r.status === grpc.StatusOK,
  });

  check(dota2Res, {
    '[Setup] Bragi Dota2 timeline status is OK': (r) => r.status === grpc.StatusOK,
  });

  const cs2Matches = cs2Res.message?.matches || [];
  const dota2Matches = dota2Res.message?.matches || [];
  bragiClient.close();

  const allMatches = [...cs2Matches, ...dota2Matches];
  check(allMatches, {
    '[Setup] Bragi returned at least one live CS2 or Dota2 match': (m) => m.length > 0,
  });
  if (allMatches.length === 0) {
    throw new Error('No live CS2/Dota2 matches available from Bragi; failing instead of skipping Ghost tests');
  }

  // --- Step 2: Connect to Ghost ---
  ghostClient.connect(GHOST_ADDR);

  // --- Test 1: GetMatchInfo for a live CS2 match ---
  if (cs2Matches.length > 0) {
    const cs2MatchUrn = cs2Matches[0].matchUrn;

    const infoRes = ghostClient.invoke('ghost.Ghost/GetMatchInfo', { matchUrn: cs2MatchUrn }, GHOST_METADATA);

    // Ghost returns NOT_FOUND (5) for matches without visualization data — this is valid
    check(infoRes, {
      '[CS2Info] Status is OK or NOT_FOUND': (r) =>
        r.status === grpc.StatusOK || r.status === grpc.StatusNotFound,
      '[CS2Info] Response message is not null when status is OK': (r) =>
        r.status !== grpc.StatusOK || r.message != null,
    });

    if (infoRes.status === grpc.StatusOK && infoRes.message) {
      check(infoRes.message, {
        '[CS2Info] Has host field': (m) => typeof m.host === 'string',
      });

      if (infoRes.message.cs2) {
        check(infoRes.message.cs2, {
          '[CS2Info] Has mapName': (c) => typeof c.mapName === 'string',
          '[CS2Info] Has mapAssetName': (c) => typeof c.mapAssetName === 'string',
          '[CS2Info] Has gameVersion': (c) => typeof c.gameVersion === 'string',
          '[CS2Info] Has assetUrl': (c) => typeof c.assetUrl === 'string',
          '[CS2Info] assetUrl is a valid URL or empty': (c) =>
            typeof c.assetUrl === 'string' &&
            (c.assetUrl === '' || c.assetUrl.startsWith('http://') || c.assetUrl.startsWith('https://')),
        });
      }
    }

    // --- Test 2: GetMatchInfo for CS2 with lang parameter ---
    const langRes = ghostClient.invoke('ghost.Ghost/GetMatchInfo', { matchUrn: cs2MatchUrn, lang: 'en' }, GHOST_METADATA);

    check(langRes, {
      '[CS2InfoLang] Status is OK or NOT_FOUND': (r) =>
        r.status === grpc.StatusOK || r.status === grpc.StatusNotFound,
      '[CS2InfoLang] Response message is not null when status is OK': (r) =>
        r.status !== grpc.StatusOK || r.message != null,
    });
  }

  // --- Test 3: GetMatchInfo for a live Dota2 match ---
  if (dota2Matches.length > 0) {
    const dota2MatchUrn = dota2Matches[0].matchUrn;

    const infoRes = ghostClient.invoke('ghost.Ghost/GetMatchInfo', { matchUrn: dota2MatchUrn }, GHOST_METADATA);

    check(infoRes, {
      '[Dota2Info] Status is OK or NOT_FOUND': (r) =>
        r.status === grpc.StatusOK || r.status === grpc.StatusNotFound,
      '[Dota2Info] Response message is not null when status is OK': (r) =>
        r.status !== grpc.StatusOK || r.message != null,
    });

    if (infoRes.status === grpc.StatusOK && infoRes.message) {
      check(infoRes.message, {
        '[Dota2Info] Has host field': (m) => typeof m.host === 'string',
      });

      if (infoRes.message.dota2) {
        check(infoRes.message.dota2, {
          '[Dota2Info] Has gameVersion': (d) => typeof d.gameVersion === 'string',
          '[Dota2Info] Has assetUrl': (d) => typeof d.assetUrl === 'string',
          '[Dota2Info] assetUrl is a valid URL or empty': (d) =>
            typeof d.assetUrl === 'string' &&
            (d.assetUrl === '' || d.assetUrl.startsWith('http://') || d.assetUrl.startsWith('https://')),
        });
      }
    }
  }

  // --- Test 4: GetMatchInfo with nonexistent match URN (NOT_FOUND expected, OK also accepted) ---
  const invalidRes = ghostClient.invoke('ghost.Ghost/GetMatchInfo', { matchUrn: 'od:match:999999999' }, GHOST_METADATA);

  check(invalidRes, {
    '[InvalidMatch] Returns NOT_FOUND or OK': (r) =>
      r.status === grpc.StatusNotFound || r.status === grpc.StatusOK,
  });

  // --- Test 5: GetMatchInfo with empty URN ---
  const emptyRes = ghostClient.invoke('ghost.Ghost/GetMatchInfo', { matchUrn: '' }, GHOST_METADATA);

  check(emptyRes, {
    '[EmptyURN] Returns expected error': (r) => r.status === grpc.StatusInvalidArgument,
  });

  ghostClient.close();
}
