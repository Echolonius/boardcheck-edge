# Boardcheck Edge & Remote MCP Platform

> [!WARNING]
> **Status: unfinished prototype, never launched.** This was an experiment with a hosted, pay-per-use version of Boardcheck. There is no running service: no hosted endpoint, and no API keys or credits for sale. **Do not send payments** to any wallet address in this repository or its history; nobody is selling anything here.
>
> **Known flaw:** the payment verifier (`src/payment/solana.ts`) credits any confirmed Solana transaction that did not fail, whatever its amount or recipient, and can credit the same one more than once. This prototype must not be deployed.
>
> For the real project (free, open source, with a demo you can try in your browser), see **[Echolonius/boardcheck](https://github.com/Echolonius/boardcheck)**.

> **Zero-Maintenance Edge Oracle for AI Agent Marketplace Integrity & Fraud Prevention**

Boardcheck Edge is a TypeScript prototype (built on Hono) with its own port of the **AMS-001..AMS-005** checks, a REST API, a **Remote Model Context Protocol (MCP)** endpoint and a local web page. It was written for Cloudflare Workers and sketches pay-per-use **Solana Pay** credits, but it was never launched: the credits were never offered to anyone, and the code is kept for reference only.

---

## Key Features

- ⚡ **Written for Cloudflare Workers, never launched**: there is no hosted service, and this prototype must not be deployed (see [Deployment](#deployment-do-not-deploy)). Run it only as a local dev server.
- 📡 **Modern Remote MCP**: Native HTTP + SSE streaming endpoint (`/mcp`) supporting Claude Desktop, Cursor, Antigravity, and autonomous agent frameworks.
- 💳 **Draft Solana Pay credits, never offered**: code for selling API credits for SOL (draft tiers in `src/payment/solana.ts`). No one was ever offered or sold these credits, and the payment check is unsafe (see the warning above).
- 🛡️ **Its own port of AMS-001..AMS-005**, not the same as the reference in [Echolonius/boardcheck](https://github.com/Echolonius/boardcheck): some thresholds and severities differ (for example, AMS-002 here needs 4 listings in the same second and is `high`; the reference needs 3 and is `warn`):
  - `AMS-001` View-Application Inversion (fabricated engagement)
  - `AMS-002` Batch Creation Clustering (automated artificial seeding)
  - `AMS-003` Self-Advertisement Ratio (supply glut disguised as buyer demand)
  - `AMS-004` Unpaid Work Risk (priced work with no escrow and no payment proof)
  - `AMS-005` High-Budget Bait (outlier bounties with zero views)
- 🌐 **Local web page**: dark-mode page with a JSON auditor, sample scam/clean loaders and MCP config snippets. Its credit and checkout panels are draft code: nothing on them was ever offered.

---

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Run test suite
npm test

# Start the local dev server (it starts only when ENVIRONMENT=development)
ENVIRONMENT=development npm run dev
```

The page is then at `http://localhost:3000`.

---

## Deployment: do not deploy

This prototype must not be deployed. It was never launched, its credits were never offered, and its payment check would issue paid API keys for transactions that paid nothing (see the warning above). `wrangler.toml` and `workflows/deploy.yml` are kept only as part of the code; GitHub runs workflows only from `.github/workflows/`, not from `workflows/`.

---

## Remote MCP Configuration

Add this to your `claude_desktop_config.json` or `cursor.json` (it points at your local dev server; there is no hosted endpoint):

```json
{
  "mcpServers": {
    "boardcheck": {
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer bc_live_YOUR_KEY"
      }
    }
  }
}
```

### Available MCP Tools:
1. `boardcheck_scan_listings`: Audit a collection of job/task listings for fraud patterns.
2. `boardcheck_verify_single_task`: Fast pre-flight check before committing LLM compute or delivering code.
3. `boardcheck_spec_info`: Look up definitions and severity criteria for any `AMS-*` indicator.

---

## REST API Endpoints

### 1. Fast Pre-Flight Task Check (`POST /api/v1/verify`)
```bash
curl -X POST http://localhost:3000/api/v1/verify \
  -H "Authorization: Bearer bc_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "id": "bounty-402",
    "budget": 500.0,
    "has_escrow": false,
    "has_payment_evidence": false
  }'
```

**Response:**
```json
{
  "task_id": "bounty-402",
  "verdict": "high_risk",
  "is_safe_to_execute": false,
  "advisory": "CRITICAL: High risk of unpaid work or ghost listing. Do NOT commit compute without upfront escrow.",
  "findings": [
    {
      "id": "AMS-004",
      "indicator": "unpaid_work_risk",
      "severity": "high",
      "detail": "1 listing(s) offer paid compensation with zero escrow backing and no verifiable payment proof."
    }
  ]
}
```

---

## Payments (prototype only)

The code sketches pay-per-use credits bought with Solana Pay (draft tiers in `src/payment/solana.ts`). They were never offered to anyone: no one sells these credits, and a payment would get you nothing. Don't send SOL or USDC to any address in this repository.

---

## License

MIT © 2026 Echolonius. See [LICENSE](LICENSE).
