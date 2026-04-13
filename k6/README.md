# Ghost gRPC Service — K6 Test Collection

Automated test collection for the **Ghost** gRPC service (`ghost.Ghost`) using [Grafana K6](https://k6.io/).
Covers both RPCs (unary calls).

## Prerequisites

- **K6** installed (`winget install k6 --source winget`)
- **VPN** connected (required to reach Ghost test endpoints)
- Valid **auth tokens** for both Ghost and Bragi (Bragi is used to resolve live match URNs)
- **Bragi protos** fetched (see Setup below)

## Project Structure

```
ghostschema/
├── proto/                                # Proto definitions (existing)
│   └── ghost/
│       └── ghost.proto                   # Ghost service definition (2 RPCs)
│
└── k6/                                   # K6 test collection
    ├── bragi_proto/                      # Bragi protos (fetched via setup_protos.sh, gitignored)
    │   └── bragi_service.proto
    ├── ghost_match_status.js             # GetMatchStatus (unary)
    ├── ghost_match_info.js               # GetMatchInfo (unary)
    ├── setup_protos.sh                   # Fetches bragi protos from bragischema repo
    ├── run_tests.ps1                     # PowerShell runner with summary
    └── README.md                         # This file
```

## Setup

Fetch bragi proto definitions before running tests (one-time, re-run to update):

```bash
cd k6
bash setup_protos.sh
```

## Running Tests

Run a single test (tokens are required via env vars):

```bash
cd k6
k6 run -e BRAGI_TOKEN=your-bragi-token -e GHOST_TOKEN=your-ghost-token ghost_match_status.js
```

Run all Ghost tests with summary:

```powershell
cd k6
.\run_tests.ps1
```

## Configuration

| Parameter | Value |
|-----------|-------|
| **Ghost Endpoint** | `api-ghost-grpc-test-integration.oddin.dev:443` |
| **Bragi Endpoint** | `api-bragi-test.integration.oddin.dev:443` (used for match URN resolution) |
| **TLS** | Enabled (default for port 443) |
| **Ghost Auth** | Token passed via `metadata.token` |
| **Bragi Auth** | Separate token passed via `metadata.token` |
| **MATCH_URN** | *(optional)* Overrides the dynamically resolved match URN from Bragi; useful for deterministic CI runs |
| **Threshold** | `checks rate==1.0` (all checks must pass) |

### Ghost Server Environments

| Env | WebSocket | gRPC |
|-----|-----------|------|
| **TEST MAIN** | `api-ghost-test.oddin.dev` | `api-ghost-grpc-test.oddin.dev` |
| **TEST INT** | `api-ghost-test-integration.oddin.dev` | `api-ghost-grpc-test-integration.oddin.dev` |
| **PROD MAIN** | `api-ghost.oddin.gg` | `api-ghost-grpc.oddin.gg` |
| **PROD INT** | `api-ghost-integration.oddin.gg` | `api-ghost-grpc-integration.oddin.gg` |

Tokens must be supplied via environment variables. Endpoints can be overridden the same way:

```bash
k6 run \
  -e BRAGI_TOKEN=your-bragi-token \
  -e GHOST_TOKEN=your-ghost-token \
  -e GHOST_ADDR=custom-ghost-host:443 \
  -e BRAGI_ADDR=custom-bragi-host:443 \
  ghost_match_status.js
```

## Service Overview

The Ghost service provides match visualization data for esports matches. It supports CS2 and Dota2 games.

**Proto:** `proto/ghost/ghost.proto`
**Package:** `ghost`

| RPC | Type | Request | Response |
|-----|------|---------|----------|
| `GetMatchStatus` | unary | `MatchStatusRequest` | `MatchStatusResponse` |
| `GetMatchInfo` | unary | `MatchInfoRequest` | `MatchInfoResponse` |

### Key Types

**MatchStatus enum:**
| Value | Description |
|-------|-------------|
| `MATCH_STATUS_UNKNOWN` | Status not determined |
| `MATCH_STATUS_AVAILABLE` | Visualization data available |
| `MATCH_STATUS_UNAVAILABLE` | Visualization data not available |

**MatchInfoResponse:**
- `host` (string) — server host
- `cs2` (CS2MatchInfoResponse) — CS2-specific info (oneof)
- `dota2` (Dota2MatchInfoResponse) — Dota2-specific info (oneof)

**CS2MatchInfoResponse:**
- `map_name` — map display name
- `map_asset_name` — map asset identifier
- `game_version` — CS2 game version
- `asset_url` — URL for match visualization assets

**Dota2MatchInfoResponse:**
- `game_version` — Dota 2 game version
- `asset_url` — URL for match visualization assets

---

## Test Specifications

### 1. `ghost_match_status.js` — GetMatchStatus

**RPC:** `GetMatchStatus` (unary)
**Proto:** `MatchStatusRequest` → `MatchStatusResponse`

**Dependency:** Uses Bragi `MatchTimeline` to resolve real match URNs dynamically.

| # | Check | Description |
|---|-------|-------------|
| 1 | `[Setup] Bragi MatchTimeline status is OK` | Fetches match URNs from Bragi |
| 2 | `[Setup] Bragi returned at least one match` | Ensures Bragi returned match data |
| 3 | `[MatchStatus] Status is OK` | gRPC status code is 0 for first match |
| 4 | `[MatchStatus] Response message is not null` | Server returned a response body |
| 5 | `[MatchStatus] Has matchStatus field` | matchStatus field is a string |
| 6 | `[MatchStatus] matchStatus is a valid enum` | One of: UNKNOWN, AVAILABLE, UNAVAILABLE |
| 7 | `[MatchStatus2] Status is OK` | gRPC status code is 0 for second match |
| 8 | `[MatchStatus2] Response message is not null` | Response body present |
| 9 | `[MatchStatus2] matchStatus is a valid enum` | Valid enum for second match |
| 10 | `[InvalidMatch] Status is OK` | Nonexistent URN returns OK status |
| 11 | `[InvalidMatch] Returns a valid status enum` | Returns valid enum even for unknown match |
| 12 | `[EmptyURN] Returns expected error` | Empty URN returns InvalidArgument error |

**Scenarios tested:**
- Valid match URN (1st match from Bragi timeline)
- Valid match URN (2nd match — consistency check)
- Nonexistent match URN (`od:match:999999999`)
- Empty match URN
- Enum validation on all responses

---

### 2. `ghost_match_info.js` — GetMatchInfo

**RPC:** `GetMatchInfo` (unary)
**Proto:** `MatchInfoRequest` → `MatchInfoResponse`

**Dependency:** Uses Bragi `MatchTimeline` with `liveOnly: true` to resolve live match URNs. Ghost only returns match info for matches that are actively being visualized, so non-live matches return `NOT_FOUND` — this is expected and valid.

| # | Check | Description |
|---|-------|-------------|
| 1 | `[Setup] Bragi CS2 timeline status is OK` | Fetches live CS2 match URNs |
| 2 | `[Setup] Bragi Dota2 timeline status is OK` | Fetches live Dota2 match URNs |
| 3 | `[Setup] Bragi returned at least one live CS2 or Dota2 match` | Ensures Bragi returned match data |
| 4 | `[CS2Info] Status is OK or NOT_FOUND` | OK if visualized, NOT_FOUND if not |
| 5 | `[CS2Info] Response message is not null when status is OK` | Response body present when OK |
| 6 | `[CS2Info] Has host field` | Host string present (when OK) |
| 7 | `[CS2Info] Has mapName` | CS2 map name (when OK + CS2 data) |
| 8 | `[CS2Info] Has mapAssetName` | CS2 map asset name (when OK + CS2 data) |
| 9 | `[CS2Info] Has gameVersion` | CS2 game version (when OK + CS2 data) |
| 10 | `[CS2Info] Has assetUrl` | Asset URL present (when OK + CS2 data) |
| 11 | `[CS2Info] assetUrl is a valid URL or empty` | URL format validation |
| 12 | `[CS2InfoLang] Status is OK or NOT_FOUND` | Same request with `lang: "en"` |
| 13 | `[CS2InfoLang] Response message is not null when status is OK` | Lang variant returns body when OK |
| 14 | `[Dota2Info] Status is OK or NOT_FOUND` | OK if visualized, NOT_FOUND if not |
| 15 | `[Dota2Info] Response message is not null when status is OK` | Response body present when OK |
| 16 | `[Dota2Info] Has host field` | Host string present (when OK) |
| 17 | `[Dota2Info] Has gameVersion` | Dota2 game version (when OK + Dota2 data) |
| 18 | `[Dota2Info] Has assetUrl` | Asset URL present (when OK + Dota2 data) |
| 19 | `[Dota2Info] assetUrl is a valid URL or empty` | URL format validation |
| 20 | `[InvalidMatch] Returns NOT_FOUND or OK` | Nonexistent URN returns NOT_FOUND |
| 21 | `[EmptyURN] Returns expected error` | Empty URN returns InvalidArgument error |

**Note:** Checks 6–11 and 16–19 only execute when the server returns `StatusOK` with CS2/Dota2 data. The number of checks varies depending on whether live matches with visualization data are available.

**Scenarios tested:**
- Live CS2 match (dynamically resolved from Bragi)
- Live CS2 match with `lang: "en"` parameter
- Live Dota2 match (dynamically resolved from Bragi)
- CS2-specific response fields: mapName, mapAssetName, gameVersion, assetUrl
- Dota2-specific response fields: gameVersion, assetUrl
- Asset URL format validation
- Nonexistent match URN → expects NOT_FOUND
- Empty match URN → expects graceful handling

---

## RPC Coverage Matrix

| RPC | Type | Test File | Checks |
|-----|------|-----------|--------|
| `GetMatchStatus` | unary | `ghost_match_status.js` | 12 |
| `GetMatchInfo` | unary | `ghost_match_info.js` | up to 21 |
| **Total** | | **2 files** | **up to 33** |

## Architecture Notes

### Cross-Service Dependency

Ghost tests depend on Bragi to resolve match URNs dynamically:

```
Bragi MatchTimeline (liveOnly: true)
    │
    ├── CS2 match URN ──→ Ghost GetMatchInfo (CS2)
    ├── Dota2 match URN ─→ Ghost GetMatchInfo (Dota2)
    └── Any match URN ───→ Ghost GetMatchStatus
```

This ensures tests always use real, currently active match URNs rather than hardcoded values.

### NOT_FOUND vs Error

`GetMatchInfo` returns `NOT_FOUND` (gRPC status 5) for matches that exist in Bragi but don't have visualization data in Ghost. This is **expected behavior**, not an error. The tests treat both `OK` and `NOT_FOUND` as valid responses.

`GetMatchStatus` always returns `OK` with a status enum — even for nonexistent matches it returns `MATCH_STATUS_UNKNOWN`.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `code: 16, invalid token` | Wrong Ghost token | Check `GHOST_TOKEN` env var |
| `code: 7, access denied` on Bragi calls | Wrong Bragi token or VPN off | Connect VPN, check `BRAGI_TOKEN` env var |
| All GetMatchInfo return NOT_FOUND | No live matches with visualization | Wait for live matches or test during active match hours |
| `k6: command not found` | K6 not installed or not in PATH | Install k6 (`winget install k6 --source winget`) and ensure it is in your PATH |
| CS2/Dota2 specific checks not running | No live matches for that sport | Expected — checks are conditional on live data |
