# Survey Explorer 1 — Codebase Architecture & UI/Telemetry Survey Report

**Author**: Survey Explorer 1 (Codebase Architecture & UI/Telemetry Explorer)  
**Target Path**: `C:\Users\imthe\.gemini\antigravity\scratch\boardcheck-edge\.agents\explorer_survey_1\handoff.md`  
**Timestamp**: 2026-08-18T05:01:00Z  

---

## 1. Observation

Direct inspection of the codebase in `C:\Users\imthe\.gemini\antigravity\scratch\boardcheck-edge` yielded the following findings across all configuration, source, test, and asset files.

### 1.1 Project Structure & File Map
```
C:\Users\imthe\.gemini\antigravity\scratch\boardcheck-edge/
├── ORIGINAL_REQUEST.md          # User & platform requirements (R1..R4)
├── README.md                    # Platform overview, quickstart, pricing, MCP config
├── package.json                 # Dependencies, npm scripts, module definition
├── package-lock.json            # Lockfile
├── tsconfig.json                # TypeScript ES2022 / NodeNext config
├── wrangler.toml                # Cloudflare Workers configuration (nodejs_compat)
├── bin/
│   └── boardcheck-edge.js       # CLI executable for local JSON listing auditing
├── examples/
│   └── sample-check.json        # Sample scam listing batch (AMS-001 + AMS-004)
├── scripts/
│   └── generate-wallet.ts       # Utility generating Solana keypair for payments
├── wallet/
│   └── receiver.json            # Dedicated Solana receiver wallet keypair
├── src/
│   ├── index.ts                 # Hono app entry point, SSE MCP server, route mounting
│   ├── engine/
│   │   ├── types.ts             # AMS standard interfaces, severities, verdicts, thresholds
│   │   └── scanner.ts           # AMS-001..AMS-005 rule implementations & verdict logic
│   ├── mcp/
│   │   └── server.ts            # McpServer tool definitions (scan, verify, spec_info)
│   ├── payment/
│   │   ├── keystore.ts          # API key generation, quota consumption, and in-memory store
│   │   └── solana.ts            # SolanaPayVerifier, PAYMENT_TIERS, on-chain signature parser
│   └── routes/
│       ├── api.ts               # REST API endpoints (/health, /scan, /verify, /key/info)
│       ├── pay.ts               # Payment endpoints (/tiers, /invoice, /verify, /free-key)
│       └── ui.ts                # Web portal HTML string renderer (renderWebPortal)
└── test/
    ├── api.test.ts              # Node test runner suite for REST & payment endpoints
    └── engine.test.ts           # Node test runner suite for AMS scanner & KeyStore
```

### 1.2 Package Dependencies & Scripts (`package.json`)
- **Runtime Dependencies**:
  - `@hono/node-server`: `^1.13.8` (Node runtime adapter for local development)
  - `@modelcontextprotocol/sdk`: `^1.6.1` (Official MCP TypeScript SDK)
  - `@solana/web3.js`: `^1.98.0` (Solana blockchain RPC & transaction inspection)
  - `hono`: `^4.7.2` (Lightweight edge web framework)
  - `zod`: `^3.24.2` (Schema validation for MCP tool inputs)
- **Dev Dependencies**:
  - `@types/node`: `^22.13.5`
  - `tsup`: `^8.5.1` (Fast esbuild-based bundler for ESM + DTS)
  - `tsx`: `^4.19.3` (TypeScript runtime executor)
  - `typescript`: `^5.9.3`
- **NPM Scripts**:
  - `dev`: `tsx src/index.ts`
  - `build`: `tsup src/index.ts src/engine/scanner.ts src/engine/types.ts --format esm --dts`
  - `test`: `node --test dist/test/*.test.js || tsx test/engine.test.ts`
  *(Note: See Logic Chain for script defect where `npm test` ignores `test/api.test.ts` and exits 0 when dist has no compiled tests)*.

### 1.3 TypeScript & Edge Runtimes
- **`tsconfig.json`**:
  - `target: ES2022`, `module: NodeNext`, `moduleResolution: NodeNext`, `strict: true`.
  - Compiles `src/**/*` and `test/**/*` into `dist/`.
- **`wrangler.toml`**:
  - Cloudflare Worker name: `boardcheck-edge`
  - Main: `src/index.ts`
  - `compatibility_date: 2024-09-23`
  - `compatibility_flags: ["nodejs_compat"]`
  - `vars`: `ENVIRONMENT="production"`, `SOLANA_NETWORK="mainnet-beta"`, `RECIPIENT_WALLET="3wbinZDnWmDxHMLtACNrskwZvRwg4KYbBWw1wuviXXHT"`, `DEFAULT_FREE_CREDITS="100"`.

### 1.4 API Routes & Endpoint Inventory
| Method | Route | Handler / Purpose | Auth / Quota |
|---|---|---|---|
| `GET` | `/` | `renderWebPortal()` in `src/routes/ui.ts` | Public |
| `GET` | `/mcp` | SSE Transport initialization (`@modelcontextprotocol/sdk/server/sse.js`) | Optional Bearer |
| `POST` | `/messages` | SSE message dispatch router (`transport.handlePostMessage`) | SSE Session |
| `GET` | `/api/v1/health` | Health status, version, standard (`AMS-001..AMS-005`) | Public |
| `POST` | `/api/v1/scan` | Bulk listings scan (`scanListings()`) | `apiKeyMiddleware` (-1 credit) |
| `POST` | `/api/v1/verify` | Fast pre-flight check on single listing (`scanListings([task])`) | `apiKeyMiddleware` (-1 credit) |
| `GET` | `/api/v1/key/info` | Inspect API key credits, tier, and wallet without consuming | `Bearer <KEY>` |
| `GET` | `/api/v1/pay/tiers` | Return available tiers (Starter, Fleet, Enterprise) and wallet | Public |
| `POST` | `/api/v1/pay/invoice` | Generate `solana:` transfer URI with reference key | Public |
| `POST` | `/api/v1/pay/verify` | Verify on-chain tx signature via RPC and issue/top-up API key | Public |
| `POST` | `/api/v1/pay/free-key` | Instant zero-KYC free trial key generator (100 credits) | Public |

### 1.5 AMS Fraud Indicators (Standard AMS-001..AMS-005)
- **`AMS-001` (`view_application_inversion`)**:
  - Rule: `applications > views`.
  - Severity: `high` if `views === 0 && applications > 0`, else `warn`.
  - Rationale: A candidate cannot apply without opening the listing; inverted metrics indicate falsified activity counters.
- **`AMS-002` (`batch_creation_clustering`)**:
  - Rule: $\ge 4$ listings (`minClusterSize`) sharing creation timestamp to the second (`clusterWindowSeconds = 1`).
  - Severity: `high`.
  - Rationale: High-burst programmatic insertion typical of artificial marketplace seeding.
- **`AMS-003` (`self_advertisement_ratio`)**:
  - Rule: `is_self_advertisement === true` ratio $\ge 50\%$ (`selfAdRatioCutoff = 0.5`) across listings with the flag.
  - Severity: `high` if ratio $\ge 80\%$, else `warn`.
  - Rationale: Disguises supply glut (service sellers) as legitimate buyer demand.
- **`AMS-004` (`unpaid_work_risk`)**:
  - Rule: `budget > 0 && has_escrow === false && has_payment_evidence === false`.
  - Severity: `high`.
  - Rationale: Workers/agents deliver computation/code with zero collateral or guarantee of payment settlement.
- **`AMS-005` (`high_budget_bait`)**:
  - Rule: Budget $\ge 3.0\times$ platform median (`highBudgetMultiplier = 3.0`) with `views === 0` (for sample size $\ge 5$).
  - Severity: `warn`.
  - Rationale: Outlier bounties with zero views designed as clickbait to harvest agent bids.

### 1.6 Solana Pay & Keystore Mechanics
- **Pricing Tiers**:
  - `tier_starter`: 0.05 SOL $\rightarrow$ 5,000 credits ($0.00001 SOL/call)
  - `tier_fleet`: 0.20 SOL $\rightarrow$ 25,000 credits ($0.000008 SOL/call)
  - `tier_enterprise`: 0.75 SOL $\rightarrow$ 150,000 credits ($0.000005 SOL/call)
- **Payment Verification**: `SolanaPayVerifier.verifyAndCreditTransaction()` queries `connection.getParsedTransaction(signature)` to confirm account balances, verifies receiver received $\ge 98\%$ expected lamports (accounting for network fees), and generates or updates a `bc_live_*` API key record.
- **Key Store**: In-memory `Map<string, ApiKeyRecord>` with `registerOrTopUp()` and `validateAndConsume()`.

### 1.7 Current UI Analysis (`src/routes/ui.ts`)
- **Render Architecture**: Single raw HTML/JS template string returned by `renderWebPortal()`.
- **CSS / Assets**: Tailwind CSS CDN (`https://cdn.tailwindcss.com`), Google Fonts (`JetBrains Mono`, `Plus Jakarta Sans`).
- **Dark Mode Styling**: Static dark background (`#0b0f19`), slate panels, and purple/indigo brand accents.
- **Interactive Sandbox**:
  - Textarea for raw JSON input.
  - Two buttons (`loadSample('scam')`, `loadSample('clean')`).
  - Output is a simple text card rendering list of findings.
- **Solana Pay UX**:
  - Uses browser `prompt()` to display the `solana:...` URI.
  - Requires user to manually copy URI, pay externally, and paste signature into another `prompt()`.
  - No visual QR code is rendered!
- **1-Click Config Generators**:
  - Only two static text snippets (Claude Desktop JSON, basic Python requests script).
  - No Cursor config (`.cursor/mcp.json`), no Antigravity / Gemini config, no Node.js / TypeScript SDK, no cURL / CLI snippet.
  - No automatic API key insertion into snippets.
- **Animations / Telemetry**:
  - No live animated telemetry or radar/gauge charts.
  - No visual indicator firing pulses or multi-stage edge scan simulation.

---

## 2. Logic Chain

1. **Premise**: Boardcheck's mission is to be the premier zero-maintenance edge oracle and Remote MCP server for AI agent marketplace auditing. To convert visitors into on-chain credit buyers (R1), the web portal must provide an irresistible, state-of-the-art interactive experience.
2. **Observation**: `src/routes/ui.ts` currently provides only a basic form, text-based findings, browser `prompt()` dialogs for payments, no QR code, and minimal integration snippets.
3. **Inference**: High-converting enterprise platforms require:
   - Visual telemetry: Real-time attack scenario simulations (Ghost Syndicate, Unpaid Work Trap, Supply Flood, Clean Verified), animated diagnostic matrices showing AMS-001..AMS-005 firing with micro-status badges, and a circular Safety Index risk gauge.
   - Polished Solana Pay Checkout: In-browser SVG QR code rendering (zero-dependency SVG generator), Phantom/Solflare 1-click deep links, simulated transaction confirmation, and instant key issuance banner.
   - Comprehensive 1-Click Config Matrix: Multi-tab copyable configs for Claude Desktop, Cursor IDE, Antigravity / Gemini agents, Python SDK, TypeScript / Node.js, and cURL CLI with automatic API key interpolation.
   - Modern Toast Notifications: Replacing native browser `prompt()` and `alert()` with slick, non-blocking toast popups.
4. **Observation**: Requirements R2 and R3 demand immediate discovery manifests (`smithery.yaml`, `mcp-index.json`, `llms.txt`) and a complete launch kit (Show HN, Product Hunt, X thread, sample agent bots).
5. **Observation**: Running `npx tsx --test test/engine.test.ts test/api.test.ts` passes 12/12 tests in ~750ms, confirming the underlying engine and routing are structurally sound. However, the package script `npm test` must be updated to ensure `test/api.test.ts` is always included.

---

## 3. Caveats

- **No Caveats on Core Engine**: The scanner, AMS rules, and MCP endpoints are completely functional.
- **Edge Deployment Environment**: In production Cloudflare Workers, `KeyStore` memory is ephemeral across cold starts unless backed by Cloudflare KV or durable storage. The existing codebase has placeholder KV bindings in `wrangler.toml`.
- **Solana Network**: In test/devnet mode, transaction verification permits simulated signatures for testing without consuming live mainnet SOL.
- **Wallet Address Consistency**: Notice default addresses in `wrangler.toml` (`3wbin...`), `wallet/receiver.json` (`3StZed...`), and `src/routes/pay.ts` (`9WzDX...`). The production deployment should standardize on the configured environment variable `RECIPIENT_WALLET`.

---

## 4. Conclusion

The Boardcheck Edge codebase is a well-structured, high-performance foundation. To satisfy all requirements of `ORIGINAL_REQUEST.md`, the implementation plan should proceed across three parallel tracks:

1. **Track 1 (UI & Telemetry Visualizer - `src/routes/ui.ts`)**:
   - Re-architect `renderWebPortal()` into a cutting-edge, high-converting enterprise portal.
   - Add animated AMS diagnostic matrix (AMS-001..AMS-005 status indicators, execution timers, threat classification).
   - Add circular SVG Risk Gauge (0-100 score with animated sweep).
   - Add rich Scenario Presets (Ghost Syndicate, Unpaid Labor Trap, Supply Flood Disguise, Verified Autonomous Bounties).
   - Add inline SVG Solana Pay QR generator and modal checkout with 1-click key issuance.
   - Add multi-tab 1-click config generator (Claude Desktop, Cursor, Antigravity, Python SDK, Node/TS, cURL) with live key binding.
   - Add toast notification system.

2. **Track 2 (MCP Discovery Manifests & Launch Assets - R2 & R3)**:
   - Create `smithery.yaml` configured for Boardcheck Remote MCP.
   - Create `mcp-index.json` registry listing.
   - Create comprehensive `llms.txt` and `public/llms.txt` for autonomous agent discovery.
   - Package complete launch kit (`LAUNCH_KIT.md`) with Show HN, Product Hunt, and X launch threads.
   - Build standalone developer integration sample bots (`examples/agent-guard.py`, `examples/agent-guard.ts`).

3. **Track 3 (Test Suite & Latency Benchmarks - R4)**:
   - Add latency benchmark test verifying sub-50ms execution on batch scans.
   - Fix `package.json` test script to `tsx --test test/*.test.ts`.

---

## 5. Verification Method

### 5.1 Test Execution Command
Execute the full test suite via TypeScript executor:
```powershell
npx tsx --test test/engine.test.ts test/api.test.ts
```
Expected output: 12 tests across 3 suites passing with 0 failures in under 1 second.

### 5.2 Build Command
Verify bundle compilation:
```powershell
npx tsup src/index.ts src/engine/scanner.ts src/engine/types.ts --format esm --dts
```
Expected output: ESM and DTS builds succeed with zero errors.

### 5.3 Local Server & Visual Inspection
Start development server:
```powershell
npx tsx src/index.ts
```
Verify `http://localhost:3000` renders the web portal, `/mcp` handles SSE handshakes, and `/api/v1/health` returns HTTP 200.
