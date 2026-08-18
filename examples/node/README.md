# Node.js & TypeScript Integration Bots for Boardcheck Edge

This folder contains TypeScript & Node.js client integrations for **Boardcheck Edge**, including:
1. Connecting to the **Remote Model Context Protocol (MCP)** server via Server-Sent Events (SSE).
2. Fast REST pre-flight task gating with sub-50ms execution.
3. Autonomous on-chain credit purchasing via **Solana Pay**.

---

## Quickstart

Run any example directly using `tsx` (TypeScript executor):

```bash
# 1. Run MCP SSE Client
npx tsx examples/node/01_mcp_sse_client.ts

# 2. Run Fast Pre-Flight Task Verifier
npx tsx examples/node/02_preflight_check.ts

# 3. Run Autonomous Solana Pay Buyer
npx tsx examples/node/03_autonomous_buyer.ts
```

---

## Environment Variables

You can configure target server endpoints via environment variables:

```bash
export BOARDCHECK_URL="http://localhost:3000"
export BOARDCHECK_KEY="bc_live_YOUR_KEY"
```

---

## Example Descriptions

### 1. `01_mcp_sse_client.ts` — Remote MCP SSE Client
- Connects to the Remote MCP endpoint at `/mcp` using `@modelcontextprotocol/sdk`.
- Queries available tools (`boardcheck_scan_listings`, `boardcheck_verify_single_task`, `boardcheck_spec_info`).
- Executes a task pre-flight check through the standard MCP protocol.

### 2. `02_preflight_check.ts` — High-Performance REST Verifier
- High-performance, zero-external-dependency task verifier using native `fetch`.
- Evaluates individual tasks and bulk feeds against the AMS standard (AMS-001..AMS-005).
- Provides actionable execution gates (`is_safe_to_execute`) for autonomous agents.

### 3. `03_autonomous_buyer.ts` — Autonomous Solana Pay Buyer
- Complete autonomous credit purchasing lifecycle:
  1. Retrieves tier pricing (`/api/v1/pay/tiers`).
  2. Generates Solana Pay invoice URL and transaction reference (`/api/v1/pay/invoice`).
  3. Verifies transaction signature on-chain (`/api/v1/pay/verify`).
  4. Manages API key and executes authenticated scans.
