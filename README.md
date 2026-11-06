# Boardcheck Edge & Remote MCP Platform

> [!WARNING]
> **Status: unfinished prototype, never launched.** This was an experiment with a hosted, pay-per-use version of Boardcheck. There is no running service: no hosted endpoint, and no API keys or credits for sale. **Do not send payments** to any wallet address in this repository or its history; nobody is selling anything here.
>
> For the real project (free, open source, with a demo you can try in your browser), see **[Echolonius/boardcheck](https://github.com/Echolonius/boardcheck)**.

> **Zero-Maintenance Edge Oracle for AI Agent Marketplace Integrity & Fraud Prevention**

Boardcheck Edge is a cloud-native, high-performance implementation of the **AMS-001..AMS-005** open standard. It runs on serverless edge runtimes (Cloudflare Workers / Vercel), providing real-time listing audits, pre-flight safety checks for autonomous agents, and a streamable **Remote Model Context Protocol (MCP)** endpoint—monetized via direct, no-KYC **Solana Pay** on-chain credits.

---

## Key Features

- ⚡ **Zero Local Hosting**: Runs 100% on Cloudflare Workers / Vercel Edge. Zero server maintenance, zero databases to manage.
- 📡 **Modern Remote MCP**: Native HTTP + SSE streaming endpoint (`/mcp`) supporting Claude Desktop, Cursor, Antigravity, and autonomous agent frameworks.
- 💳 **No-KYC Solana Pay Monetization**: Users and autonomous agents purchase API credits directly in SOL/USDC to your personal Solana wallet address. The edge verifier confirms on-chain transaction signatures and issues API keys instantly.
- 🛡️ **Full AMS-001..AMS-005 Parity**:
  - `AMS-001` View-Application Inversion (fabricated engagement)
  - `AMS-002` Batch Creation Clustering (automated artificial seeding)
  - `AMS-003` Self-Advertisement Ratio (supply glut disguised as buyer demand)
  - `AMS-004` Unpaid Work Risk (priced work with no escrow and no payment proof)
  - `AMS-005` High-Budget Bait (outlier bounties with zero views)
- 🌐 **Interactive Developer Portal**: Inlined dark-mode UI with live JSON auditor, sample scam/clean loaders, and 1-click config generators.

---

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Run test suite
npm test

# Start local edge server
npm run dev
```

The portal will be available at `http://localhost:3000`.

---

## 1-Command Edge Deployment

### Deploy to Cloudflare Workers (Recommended)

1. Set your Solana wallet address in `wrangler.toml` (or via environment secret):
```toml
[vars]
RECIPIENT_WALLET = "YOUR_SOLANA_WALLET_ADDRESS"
SOLANA_NETWORK = "mainnet-beta"
```

2. Deploy:
```bash
npx wrangler deploy
```

Your platform is live worldwide with sub-50ms latency.

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

MIT © 2026 Echolonius
