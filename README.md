# Ghost Schema

Represents gRPC schema for Oddin.gg Ghost visualization service.

## K6 gRPC Tests

Automated gRPC integration tests for Ghost using [K6](https://k6.io/). Tests use Bragi to fetch live match URNs, then validate Ghost endpoints.

### Running locally

Auth tokens must be supplied via environment variables:

```bash
k6 run \
  -e BRAGI_TOKEN=your-bragi-token \
  -e GHOST_TOKEN=your-ghost-token \
  k6/ghost_match_status.js
```

To also override endpoints:

```bash
k6 run \
  -e BRAGI_TOKEN=your-bragi-token \
  -e GHOST_TOKEN=your-ghost-token \
  -e GHOST_ADDR=your-ghost-host:443 \
  k6/ghost_match_status.js
```

### Test files

| File | gRPC Method | Description |
|------|-------------|-------------|
| `ghost_match_status.js` | `GetMatchStatus` | Validates match status enum values |
| `ghost_match_info.js` | `GetMatchInfo` | Validates CS2/Dota2 match info fields |

### CI/CD

Tests run automatically via GitHub Actions:
- **Schedule**: Daily at 06:00 UTC
- **Manual**: Trigger via `workflow_dispatch` in the Actions tab

#### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `BRAGI_TOKEN` | Auth token for the Bragi gRPC API |
| `GHOST_TOKEN` | Auth token for the Ghost gRPC API |

#### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BRAGI_ADDR` | `api-bragi-test.integration.oddin.dev:443` | Bragi gRPC endpoint |
| `GHOST_ADDR` | `api-ghost-grpc-test-integration.oddin.dev:443` | Ghost gRPC endpoint |
| `BRAGI_TOKEN` | *(required)* | Bragi auth token |
| `GHOST_TOKEN` | *(required)* | Ghost auth token |
