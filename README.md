# Ghost Schema

Represents gRPC schema for Oddin.gg Ghost visualization service.

## K6 gRPC Tests

The k6 gRPC tests for Ghost now live in
[`oddin-gg/mimir-qa-utils`](https://github.com/oddin-gg/mimir-qa-utils) under `k6/ghost/`,
with the other Mimir QA suites (DATA-1901). They run there daily against
staging, and on demand for a whole suite or a subset. They load the protos
from this repo's `proto/` at run time, so the protos stay owned here.
