# Show HN: Boardcheck – Zero-KYC anti-fraud oracle & Remote MCP for autonomous AI agents

Hey HN! We're excited to show you **Boardcheck** (https://github.com/echolonius/boardcheck-edge), a cloud-native edge oracle and Remote Model Context Protocol (MCP) server designed to protect autonomous AI agents from marketplace fraud, ghost listings, and uncollateralized labor.

---

### The Problem: The Penniless Agent Problem & Scam Bounties

In 2026, autonomous AI agents—powered by Claude Desktop, Cursor, LangChain, CrewAI, and Smolagents—are actively querying task boards, freelance marketplaces, and GitHub issue trackers to write code and solve problems autonomously.

However, two major structural blockers prevent safe agentic commerce:

1. **Marketplace Fraud & Scam Bounties**: Malicious actors flood platforms with high-budget bounties that have zero escrow backing or fake metrics. An autonomous bot that attempts these tasks burns irreversible GPU/LLM compute tokens or gives away proprietary code for zero compensation.
2. **The Penniless Agent Problem**: Autonomous software agents cannot pass Stripe KYC, hold fiat bank accounts, or sign up with personal credit cards. If a security oracle or API service requires traditional SaaS billing, autonomous agents are completely locked out.

---

### What Boardcheck Does

Boardcheck runs at the serverless edge (Cloudflare Workers / Vercel Edge with Hono) with sub-10ms response times and zero database dependencies. It evaluates marketplace tasks against the open **AMS (Agent Market Signals) Standard**:

- **AMS-001: View-Application Inversion** — Detects listings where bids/applications exceed total views (statistically impossible under organic user behavior).
- **AMS-002: Batch Creation Clustering** — Identifies sybil burst activity where multiple listings are created in the exact same second.
- **AMS-003: Self-Advertisement Ratio** — Flags marketplace feeds where over 50% of listings are bots advertising their own services rather than genuine buyer demand.
- **AMS-004: Unpaid Work Risk** — High-severity detection of priced tasks that lack verifiable on-chain or platform escrow.
- **AMS-005: High-Budget Bait** — Detects outlier bounties with 0 views designed to harvest agent compute.

---

### Autonomous On-Chain Monetization (Solana Pay)

To solve the Penniless Agent Problem, Boardcheck implements native **Solana Pay** integration:

1. An agent requests a payment invoice (`POST /api/v1/pay/invoice`).
2. The agent executes a SOL or USDC transfer directly to the treasury wallet.
3. The agent submits the transaction signature to `POST /api/v1/pay/verify`.
4. The edge verifier confirms the transaction on Solana in < 500ms and issues an active `bc_live_...` API key with instant credits—**zero KYC, zero human intervention, 100% autonomous**.

---

### 1-Click Remote MCP Setup

You can connect Boardcheck directly to **Claude Desktop**, **Cursor**, **Antigravity**, or any MCP-compatible agent host:

```json
{
  "mcpServers": {
    "boardcheck": {
      "url": "https://boardcheck.workers.dev/mcp",
      "headers": {
        "Authorization": "Bearer bc_live_YOUR_KEY"
      }
    }
  }
}
```

Once connected, your agent gains 3 tools:
- `boardcheck_verify_single_task`: Instant pre-flight gate before running code.
- `boardcheck_scan_listings`: Bulk audit of job/task feeds.
- `boardcheck_spec_info`: Look up exact AMS-001..AMS-005 rules and severities.

---

### Quick Example: 3-Line Python Pre-Flight Check

```python
import requests

task = {"id": "bounty-101", "budget": 1500, "has_escrow": False, "views": 0, "applications": 8}
report = requests.post("https://boardcheck.workers.dev/api/v1/verify", json=task).json()

if not report["is_safe_to_execute"]:
    print(f"Aborting: {report['advisory']}")
```

---

### Architecture & Performance
- **Edge Engine**: Pure TypeScript O(N) single-pass scanner with sub-50ms p99 latency SLA (average < 2ms in benchmarks).
- **Standards Compliant**: Full MCP 2026 SSE protocol support and machine-readable agent manifests (`/llms.txt`, `smithery.yaml`, `mcp-index.json`).
- **Open Standard**: The AMS-001..AMS-005 specification is completely open and vendor-neutral.

---

### Try It Live & Free Developer Credits
- **Interactive Visualizer & Portal**: https://boardcheck.workers.dev
- **Free 100-Credit Sandbox Key**: `curl -X POST https://boardcheck.workers.dev/api/v1/pay/free-key`
- **GitHub Repository**: https://github.com/echolonius/boardcheck-edge

We would love your feedback on the AMS standard rules, edge latency benchmarks, and how you are securing your autonomous agent pipelines!
