# E2E Test Infra: Boardcheck Edge Platform

## Test Philosophy
- Opaque-box, requirement-driven testing with zero coupling to implementation internals.
- Systematic 4-tier methodology (Feature Coverage, Boundary/Corner Cases, Cross-Feature Combinations, Real-World Workload Scenarios) plus Tier 5 White-Box Adversarial Hardening.
- Edge performance SLA verification: Sub-50ms execution speed per check, p95 < 25ms, p99 < 50ms under synthetic load.

## Feature Inventory & Test Coverage Mapping
| # | Feature | Requirement Source | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Combinations) | Tier 4 (Real-World) |
|---|---------|-------------------|:-----------------:|:-----------------:|:---------------------:|:-------------------:|
| 1 | AMS-001 (View-Application Inversion) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 2 | AMS-002 (Batch Timestamp Clustering)| ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 3 | AMS-003 (Self-Advertisement Ratio)  | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 4 | AMS-004 (Unpaid Work / Escrow Risk) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 5 | AMS-005 (High-Budget Bait)          | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 6 | Solana Pay Zero-KYC Monetization    | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 7 | KeyStore & Quota Consumption        | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 8 | Remote MCP Tools & SSE Protocol     | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 9 | Agentic Discovery Routes (/llms.txt)| ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 10| Edge Latency & Concurrency (<50ms)  | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |

## Test Suite Layout & Targets
- `test/engine.test.ts`: AMS-001..AMS-005 mathematical correctness, severity assignment, single vs batch scans.
- `test/api.test.ts`: REST endpoints (`/health`, `/scan`, `/verify`, `/key/info`, `/tiers`, `/invoice`, `/verify`, `/free-key`).
- `test/solana.test.ts`: Solana Pay invoice generation, signature verification, tier pricing, balance checks, key replenishment.
- `test/mcp.test.ts`: Remote MCP tool schemas, tool execution, session handshake, error handling.
- `test/edge-cases.test.ts`: Multi-indicator collisions, empty payloads, malformed timestamps, threshold overrides, authorization parsing.
- `test/benchmark.test.ts`: 1,000-scan latency benchmark (p50, p95, p99 < 50ms) and 50-request concurrent burst test.

## Coverage & SLA Thresholds
- **Tier 1 (Feature Coverage)**: >= 50 test cases total (>= 5 per feature).
- **Tier 2 (Boundary & Corner)**: >= 50 test cases covering empty inputs, negative values, extreme budgets, 1-second cluster limits.
- **Tier 3 (Cross-Feature Combinations)**: Pairwise coverage of AMS-001 + AMS-004, AMS-002 + AMS-005, payment verification + key consumption.
- **Tier 4 (Real-World Scenarios)**: Realistic marketplace workloads (Ghost Syndicate flood, Zero-Escrow Trap, Autonomous Agent Pre-Flight loop).
- **Tier 5 (Adversarial Hardening)**: White-box challenger audit stress-testing edge cases and race conditions.
- **Latency Benchmark**: Average check latency < 10ms, p99 < 50ms.
- **Exit Code**: 0 failures across all suites.
