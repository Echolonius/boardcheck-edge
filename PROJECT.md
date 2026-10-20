# Project: Boardcheck Edge Platform & Autonomous Distribution Engine

## Architecture
Boardcheck Edge is an enterprise-grade, globally distributed anti-fraud oracle and Remote Model Context Protocol (MCP) server running on Cloudflare Workers / Vercel Edge with Hono. It evaluates marketplace tasks against the AMS-001..AMS-005 open integrity standard with sub-50ms execution speed, zero database dependencies, and instant zero-KYC Solana Pay on-chain credit issuance.

```
                   ┌────────────────────────────────────────┐
                   │           Client Entry Points          │
                   │  - Web Portal (Interactive Visualizer) │
                   │  - Remote MCP Clients (Claude, Cursor) │
                   │  - Agent Frameworks (LangChain/CrewAI) │
                   │  - REST API & CLI (npx boardcheck-edge)│
                   └───────────────────┬────────────────────┘
                                       │
                                       ▼
                   ┌────────────────────────────────────────┐
                   │        Boardcheck Edge Gateway         │
                   │       (Hono / Cloudflare Workers)      │
                   ├───────────────────┬────────────────────┤
                   │   /mcp & /messages│  /api/v1 (REST)    │
                   │   Remote MCP SSE  │  Scan & Verify API │
                   │   Transport Server│  AMS-001..AMS-005  │
                   └─────────┬─────────┴──────────┬─────────┘
                             │                    │
                             ▼                    ▼
             ┌─────────────────────────┐  ┌─────────────────────────┐
             │  AMS Standard Engine    │  │   Solana Pay Keystore   │
             │  - AMS-001 View Invert  │  │  - Zero-KYC On-Chain Pay│
             │  - AMS-002 Clustering   │  │  - Starter (0.05 SOL)   │
             │  - AMS-003 Self-Ad Glut │  │  - Fleet (0.20 SOL)     │
             │  - AMS-004 Escrow Risk  │  │  - Enterprise (0.75 SOL)│
             │  - AMS-005 Budget Bait  │  │  - Free Trial (100 cr)  │
             └─────────────────────────┘  └─────────────────────────┘
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Interactive UI Telemetry & Live Firing | Animated telemetry, SVG risk gauges, live AMS-001..005 firing matrix, threat indicators | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Scenario Presets & Instant Simulation | Attack scenario presets (Ghost Syndicate, Unpaid Trap, Supply Flood, Verified) with live execution | M1 | ORIGINAL_REQUEST §R1 |
| 3 | In-Browser SVG Solana Pay Checkout | Zero-dependency SVG QR code generator, Phantom/Solflare deep links, instant key issuance | M1 | ORIGINAL_REQUEST §R1 |
| 4 | 1-Click Multi-Agent Config Generator | Dynamic copyable configs for Claude Desktop, Cursor, Antigravity, Python, Node/TS, cURL | M1 | ORIGINAL_REQUEST §R1 |
| 5 | Toast Notification System | Non-blocking enterprise toast system replacing browser alerts/prompts | M1 | Explorer Survey 1 |
| 6 | Smithery Registry Manifest | `smithery.yaml` for 1-click deployment to Smithery.ai catalog | M2 | ORIGINAL_REQUEST §R2 |
| 7 | MCP Index Registry Manifest | `mcp-index.json` machine-readable directory metadata and capabilities | M2 | ORIGINAL_REQUEST §R2 |
| 8 | Glama Registry Manifest | `glama.json` TDQS-compliant specification for Glama registry | M2 | Explorer Survey 2 |
| 9 | Agentic Discovery (`llms.txt` / `llms-full.txt`) | Standardized agent discovery context and dynamic edge routes in `src/index.ts` | M2 | ORIGINAL_REQUEST §R2 |
| 10 | Launch & Outreach Copy Kit | Show HN, Product Hunt, viral X thread (Penniless Agent Problem narrative) in `launch/` | M3 | ORIGINAL_REQUEST §R3 |
| 11 | Multi-Framework Python Sample Bots | Python client, LangChain tool, CrewAI agent, Smolagents tool, autonomous Solana buyer | M3 | ORIGINAL_REQUEST §R3 |
| 12 | TypeScript & Node.js Integration Bots | `@modelcontextprotocol/sdk` SSE client, pre-flight check, autonomous buyer | M3 | ORIGINAL_REQUEST §R3 |
| 13 | Edge Latency Benchmarks (<50ms SLA) | Benchmark test harness recording p50, p95, p99 latencies under burst load | M4 | ORIGINAL_REQUEST §R4 |
| 14 | Deep Solana Pay Test Suite | Signature verification, tier pricing, balance checks, key replenishment | M4 | ORIGINAL_REQUEST §R4 |
| 15 | Edge Case & Boundary Verification | Empty datasets, multi-indicator collisions, malformed timestamps, header auth | M4 | ORIGINAL_REQUEST §R4 |
| 16 | Remote MCP Tool Execution Tests | Tool discovery, schema validation, streaming session integrity | M4 | ORIGINAL_REQUEST §R4 |
| 17 | Final E2E 100% Pass & Tier 5 Hardening | Publish `TEST_READY.md`, pass all tests, conduct white-box adversarial verification | M5 | ORIGINAL_REQUEST §R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | High-End Interactive Visualizer & Conversion Portal | Redesign `src/routes/ui.ts` with real-time animated telemetry, AMS diagnostic matrix, circular SVG risk gauge, preset attack scenarios, in-browser Solana Pay QR code generator, multi-agent 1-click config generators (Claude Desktop, Cursor, Antigravity, Python, Node/TS, cURL), and modern toast notifications | none | DONE |
| M2 | MCP Directory & Discovery Manifests | Author `smithery.yaml`, `mcp-index.json`, `glama.json`, `llms.txt`, `llms-full.txt`, and integrate `/llms.txt` and `/llms-full.txt` edge routes into `src/index.ts` | none | DONE |
| M3 | Automated Launch & Outreach Kit | Create `launch/SHOW_HN.md`, `launch/PRODUCT_HUNT.md`, `launch/TWITTER_THREAD.md`, `launch/LAUNCH_KIT.md`, and multi-framework integration bots in `examples/python/*` and `examples/node/*` | M2 | DONE |
| M4 | E2E Test Suite & Enterprise Parity Harness | Build `test/benchmark.test.ts`, `test/solana.test.ts`, `test/edge-cases.test.ts`, `test/mcp.test.ts`, update `package.json` test scripts, and publish `TEST_READY.md` | M1, M2 | DONE |
| M5 | Final Verification & Tier 5 Adversarial Coverage | Run full test suite, verify 100% pass, execute Tier 5 white-box adversarial verification with Challenger and Forensic Auditor | M1, M2, M3, M4 | DONE |

## Interface Contracts
### `src/routes/ui.ts` ↔ Browser / Client
- Export: `renderWebPortal(): string`
- Endpoints consumed: `POST /api/v1/scan`, `POST /api/v1/verify`, `GET /api/v1/pay/tiers`, `POST /api/v1/pay/invoice`, `POST /api/v1/pay/verify`, `POST /api/v1/pay/free-key`
- Assets: Zero external heavy JS frameworks; inline vanilla JS + SVG generators + Tailwind CDN + Lucide/SVG icons.

### `src/index.ts` ↔ Agentic Indexing
- `GET /llms.txt` -> Returns raw markdown sitemap (HTTP 200, `text/plain; charset=utf-8`)
- `GET /llms-full.txt` -> Returns complete protocol and schema reference (HTTP 200, `text/plain; charset=utf-8`)

### `src/payment/solana.ts` & `src/payment/keystore.ts` ↔ Test / API Routers
- Free key issuance: `POST /api/v1/pay/free-key` -> `{ success: true, apiKey: "bc_live_...", creditsRemaining: 100 }`
- Verified payment issuance: `POST /api/v1/pay/verify` -> `{ success: true, apiKey: "bc_live_...", creditsRemaining: number }`

## Code Layout
```
boardcheck-edge/
├── ORIGINAL_REQUEST.md
├── PROJECT.md
├── TEST_INFRA.md
├── TEST_READY.md
├── DEAD_ENDS.md
├── GATE_STATUS.md
├── smithery.yaml
├── mcp-index.json
├── glama.json
├── llms.txt
├── llms-full.txt
├── package.json
├── tsconfig.json
├── wrangler.toml
├── bin/
│   └── boardcheck-edge.js
├── launch/
│   ├── LAUNCH_KIT.md
│   ├── SHOW_HN.md
│   ├── PRODUCT_HUNT.md
│   └── TWITTER_THREAD.md
├── examples/
│   ├── sample-check.json
│   ├── python/
│   │   ├── README.md
│   │   ├── requirements.txt
│   │   ├── 01_preflight_verifier.py
│   │   ├── 02_langchain_agent.py
│   │   ├── 03_crewai_agent.py
│   │   ├── 04_smolagents_bot.py
│   │   └── 05_autonomous_solana_buyer.py
│   └── node/
│       ├── README.md
│       ├── 01_mcp_sse_client.ts
│       ├── 02_preflight_check.ts
│       └── 03_autonomous_buyer.ts
├── src/
│   ├── index.ts
│   ├── engine/
│   │   ├── types.ts
│   │   └── scanner.ts
│   ├── mcp/
│   │   └── server.ts
│   ├── payment/
│   │   ├── keystore.ts
│   │   └── solana.ts
│   └── routes/
│       ├── api.ts
│       ├── pay.ts
│       └── ui.ts
└── test/
    ├── api.test.ts
    ├── engine.test.ts
    ├── benchmark.test.ts
    ├── solana.test.ts
    ├── mcp.test.ts
    └── edge-cases.test.ts
```
