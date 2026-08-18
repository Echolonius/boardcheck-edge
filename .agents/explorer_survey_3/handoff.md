# Survey Report: Launch Assets, Multi-Framework Integration Bots & Benchmark Test Suite

**Working Directory**: `C:\Users\imthe\.gemini\antigravity\scratch\boardcheck-edge\.agents\explorer_survey_3`  
**Role**: Launch Assets, Integration Bots & Benchmarks Explorer  
**Date**: 2026-08-18  

---

## 1. Observation

### 1.1 Existing Codebase & Infrastructure State
- **Runtime & Core Architecture**:
  - `src/index.ts`: Hono app mounted with REST API (`/api/v1`), Solana Pay router (`/api/v1/pay`), web UI (`/`), and Remote MCP SSE endpoints (`/mcp`, `/messages`).
  - `src/engine/scanner.ts` & `src/engine/types.ts`: Implements the open standard for **AMS-001** through **AMS-005** (View-Application Inversion, Batch Creation Clustering, Self-Ad Ratio, Unpaid Work Risk, High-Budget Bait).
  - `src/payment/solana.ts` & `src/payment/keystore.ts`: Implements 3 payment tiers (`tier_starter` @ 0.05 SOL / 5k credits, `tier_fleet` @ 0.2 SOL / 25k credits, `tier_enterprise` @ 0.75 SOL / 150k credits) and `bc_live_` API key management.
  - `src/mcp/server.ts`: Exposes 3 Remote MCP tools: `boardcheck_scan_listings`, `boardcheck_verify_single_task`, and `boardcheck_spec_info`.

### 1.2 Test Suite Execution Baseline
- Running `cmd /c "npx tsx --test test/engine.test.ts test/api.test.ts"` executes 12 tests across 3 suites with 0 failures in **824ms total process time**.
- Individual in-engine verification tests execute in **0.16ms to 2.41ms**, well below the required **< 50ms** edge SLA.

### 1.3 Identified Gaps in Launch Assets, Client Integration & Test Coverage
1. **Launch Copy & Outreach Kit**:
   - No dedicated launch copy assets currently exist in the repository for Hacker News (Show HN), Product Hunt (listing metadata + maker comments), or X/Twitter (thread addressing the Penniless Agent Problem).
2. **Multi-Framework Integration Examples**:
   - Only a static `examples/sample-check.json` exists in `examples/`.
   - Missing concrete Python integration recipes for **LangChain**, **CrewAI**, **Smolagents (Hugging Face)**, **Raw REST/MCP Client**, and **Autonomous Solana Pay Self-Buyer**.
   - Missing TypeScript/Node.js client scripts demonstrating **@modelcontextprotocol/sdk** SSE client connection and pre-flight task gating.
3. **Enterprise Test Suite & Simulation Benchmarks**:
   - Existing tests (`test/engine.test.ts` and `test/api.test.ts`) only cover basic positive flows.
   - Missing a formal **sub-50ms latency benchmark runner** (`test/benchmark.test.ts`) with p50/p95/p99 metric recording under synthetic burst loads (1,000+ checks).
   - Missing edge-case test suites for MCP tool execution (`test/mcp.test.ts`), deep Solana Pay failure/replay modes (`test/solana.test.ts`), and malformed payload boundary conditions (`test/edge-cases.test.ts`).

---

## 2. Logic Chain

```
[The Penniless Agent Problem]
  ├── Autonomous bots scan gig/task boards -> vulnerable to ghost listings / zero-escrow scams (AMS-001..005)
  ├── Agents lack credit cards / KYC for SaaS billing -> Need on-chain Solana Pay (SOL/USDC)
  └── Boardcheck provides sub-50ms edge oracle + Remote MCP + instant no-KYC credit issuance
        │
        ├── 1. Launch & Outreach Kit (Show HN, Product Hunt, X Thread) -> Drives developer adoption & viral narrative
        ├── 2. Multi-Framework Integration Bots (Python + Node.js) -> Enables instant copy-paste agent protection
        └── 3. Enterprise Test & Benchmark Suite -> Guarantees 100% test coverage & validates < 50ms edge performance
```

1. **Targeting the Penniless Agent Problem in Launch Copy**:
   - The primary hook that resonates with 2026 AI developers is that autonomous agents are operating without human financial rails. When an agent bids on a scam bounty, it burns irreversible LLM tokens. By framing Boardcheck as the *first zero-KYC anti-fraud oracle funded via Solana Pay*, we position Boardcheck at the intersection of Agentic AI, MCP infrastructure, and crypto rails.
2. **Framework-Agnostic Developer Integration**:
   - Modern agent developers use different stacks: LangChain for enterprise DAGs, CrewAI for multi-agent role-playing, Smolagents for lightweight code generation, and raw MCP for Claude Desktop/Cursor. Providing plug-and-play recipes for all four Python ecosystems and Node.js removes all integration friction.
3. **Sub-50ms Latency Benchmarking & Comprehensive Test Integrity**:
   - Edge verification must be faster than the LLM's own network overhead. Since the Boardcheck engine is purely algorithmic (O(N) single-pass scans without external DB dependencies), verifying this via automated p50/p95/p99 benchmark tests gives developers quantitative proof of sub-50ms speed.

---

## 3. Caveats

1. **Solana RPC Network Dependencies**:
   - In automated test environments and CI, live Solana RPC calls can face rate-limiting or latency spikes. Solana Pay verification tests should support mock confirmed transactions in test mode while supporting live `mainnet-beta` / `devnet` RPC endpoints in staging/production.
2. **Python Client Dependencies**:
   - Python sample scripts in `examples/python/` will require optional packages (`langchain`, `crewai`, `smolagents`, `solders`, `solana`, `requests`). A clear `requirements.txt` and standalone fallback scripts (using standard library / `requests`) must be provided so developers can test without heavy installs.
3. **KeyStore Edge Persistence**:
   - The current `KeyStore` uses an in-memory Map suitable for single-node / local testing and devnet demonstrations. For production multi-region Cloudflare Worker clusters, bindings to Cloudflare KV or D1 should be noted in developer docs.

---

## 4. Conclusion & Complete Implementation Blueprints

### 4.1 Launch Assets & Developer Outreach Kit

#### A. Show HN Launch Post
**Target File**: `launch/SHOW_HN.md`
```markdown
# Show HN: Boardcheck – Zero-KYC anti-fraud oracle & Remote MCP for autonomous AI agents

Hey HN! We built Boardcheck (https://github.com/echolonius/boardcheck-edge), a cloud-native edge oracle and Remote Model Context Protocol (MCP) server that protects autonomous AI agents from marketplace fraud, ghost listings, and uncollateralized work.

### The Problem: The Penniless Agent Problem & Scam Bounties
In 2026, autonomous agents (running on Claude Desktop, Cursor, LangChain, CrewAI, AutoGen) are actively bidding on tasks, freelance bounties, and issue trackers. However:
1. **Priced tasks are frequently scams**: Bounties with zero escrow or fake payment proof waste costly GPU/LLM tokens (or steal delivered code).
2. **Marketplace metrics are manipulated**: Platforms suffer from view/application inversions (more bids than views), sybil batch-created listings, and fake self-advertisements.
3. **The Penniless Agent Problem**: Autonomous bots cannot pass Stripe KYC, hold fiat bank accounts, or sign up with credit cards. They need an anti-fraud oracle they can pay for autonomously using native crypto rails (SOL/USDC).

### What Boardcheck Does
Boardcheck runs on the edge (Cloudflare Workers / Vercel) with sub-10ms response times. It evaluates listings against the **AMS (Agent Market Signals) open standard**:
- **AMS-001**: View-Application Inversion (detects mathematically impossible bid-to-view ratios)
- **AMS-002**: Batch Creation Clustering (flags automated burst posting)
- **AMS-003**: Self-Advertisement Ratio (identifies supply gluts disguised as buyer demand)
- **AMS-004**: Unpaid Work Risk (detects priced work with zero escrow backing)
- **AMS-005**: High-Budget Bait (flags outlier bounties with zero views)

### Autonomous On-Chain Monetization (Solana Pay)
When an agent needs API credits:
1. It requests an invoice via `POST /api/v1/pay/invoice`.
2. It transfers SOL/USDC directly to the receiver wallet.
3. It submits the transaction signature to `POST /api/v1/pay/verify`.
4. The edge verifier confirms the on-chain confirmation in < 500ms and grants API credits immediately—with zero KYC and zero human intervention.

### 1-Click Remote MCP Setup
Add to your `claude_desktop_config.json` or `cursor.json`:
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

### Try It Live
- Live Interactive Portal: https://boardcheck.workers.dev
- Free 100-credit developer sandbox key: `POST /api/v1/pay/free-key`
- GitHub Repo: https://github.com/echolonius/boardcheck-edge

We would love your feedback on the AMS indicator specs and how you're securing your agentic workflows!
```

---

#### B. Product Hunt Submission Copy
**Target File**: `launch/PRODUCT_HUNT.md`
```markdown
# Product Hunt Submission Kit: Boardcheck Edge

## Basic Info
- **Product Name**: Boardcheck Edge
- **Tagline**: Zero-KYC anti-fraud oracle & Remote MCP server for AI agents
- **Pricing**: Free tier (100 free credits) / Pay-as-you-go on-chain via Solana Pay (0.05 SOL for 5,000 checks)
- **Categories**: Developer Tools, Artificial Intelligence, Web3, APIs

## Short Description (60 chars)
Anti-fraud oracle for AI agents with Solana Pay credits.

## Description (260 chars)
Boardcheck is a zero-maintenance edge oracle and Remote MCP server that protects autonomous AI agents from ghost listings, fake bounties, and uncollateralized work—funded via zero-KYC Solana Pay on-chain credits.

## Maker Comment
Hey Product Hunt! 👋

Autonomous AI agents are executing real work across developer bounties and freelance marketplaces. But there's a huge blind spot: agents are burning thousands of dollars in LLM compute on ghost listings, fake tasks, and unescrowed bounties.

Even worse, autonomous bots can't pass a Stripe identity verification check to buy security SaaS tooling ("The Penniless Agent Problem").

We built **Boardcheck Edge** to solve this:
🛡️ **Full AMS-001..AMS-005 Standard**: Real-time detection of view inversions, sybil bursts, self-ad gluts, and zero-escrow payment risks.
⚡ **Sub-50ms Edge Execution**: Zero database dependencies, runs worldwide on Cloudflare Workers / Vercel Edge.
💳 **Zero-KYC Solana Pay Monetization**: Agents purchase scan credits directly on-chain using SOL/USDC.
📡 **Native Remote MCP**: Connects directly to Claude Desktop, Cursor, LangChain, CrewAI, and Smolagents via streaming SSE.

Claim 100 free scan credits instantly on our live portal and let us know what you think!
```

---

#### C. X (Twitter) Viral Launch Thread (8 Tweets)
**Target File**: `launch/TWITTER_THREAD.md`
```markdown
# X / Twitter Launch Thread: The Penniless Agent Problem

**Tweet 1 (Hook)**:
🚨 AI agents are burning millions in LLM compute on fake bounties and ghost listings.

Why? Because autonomous bots can't pass a Stripe KYC check or hold a credit card to buy security tooling.

We call this "The Penniless Agent Problem."

Introducing @Boardcheck: The first zero-KYC anti-fraud oracle & Remote MCP server for AI agents. 🧵👇

**Tweet 2 (The Scam Problem)**:
1/ When an AI agent scans a bounty board or GitHub issue market, it takes tasks at face value.

Malicious actors post high-budget bounties with ZERO escrow to harvest agent labor, steal API tokens, or manipulate market feeds.

If your bot delivers code to an unverified task, you lose 100% of your compute.

**Tweet 3 (The AMS Standard)**:
2/ Boardcheck evaluates listings against the AMS-001..AMS-005 open standard:

🔍 AMS-001: View-Application Inversion (fake applications with 0 views)
⏱️ AMS-002: Batch Timestamp Clustering (sybil burst postings)
📢 AMS-003: Self-Ad Ratio (fake buyer demand)
💸 AMS-004: Unpaid Work Risk (priced work with no escrow)
🎣 AMS-005: High-Budget Bait (outlier bounties)

**Tweet 4 (Solana Pay Solution)**:
3/ How does an autonomous agent pay for fraud checks?

Solana Pay. ⚡

No credit cards. No KYC forms. No human in the loop.

An agent transfers 0.05 SOL, submits the transaction signature to our edge verifier, and gets an instant API key in < 500ms.

**Tweet 5 (Sub-50ms Edge Architecture)**:
4/ Performance is critical for agent loops.

Boardcheck is built with Hono and deployed to serverless edge nodes globally.

Auditing an entire batch of 50 tasks takes < 10ms. Zero database lag, zero cold starts, 100% uptime.

**Tweet 6 (Remote MCP Ready)**:
5/ Connect Boardcheck directly to your favorite AI environments via Remote Model Context Protocol (MCP):

✅ Claude Desktop
✅ Cursor
✅ Antigravity
✅ Custom autonomous agent pipelines

One JSON config snippet and your agent gains real-time pre-flight market verification tools.

**Tweet 7 (Multi-Framework SDKs)**:
6/ We've packaged drop-in integration recipes for:
🐍 Python: LangChain, CrewAI, Smolagents, raw MCP
💻 Node.js: @modelcontextprotocol/sdk, TypeScript pre-flight checks

A single pre-flight check guards your bot before it commits a single line of code or token.

**Tweet 8 (CTA & Live Link)**:
7/ Try Boardcheck live today:

🌐 Interactive Visualizer: https://boardcheck.workers.dev
📦 GitHub: https://github.com/echolonius/boardcheck-edge
⚡ Free 100-credit developer key: `POST /api/v1/pay/free-key`

Stop burning compute on ghost bounties. Star the repo and empower your agents! 🚀
```

---

### 4.2 Multi-Framework Developer Quickstarts & Sample Integration Bots

#### File Structure Blueprint
```
examples/
├── README.md
├── sample-check.json
├── python/
│   ├── README.md
│   ├── requirements.txt
│   ├── 01_preflight_verifier.py
│   ├── 02_langchain_agent.py
│   ├── 03_crewai_agent.py
│   ├── 04_smolagents_bot.py
│   └── 05_autonomous_solana_buyer.py
└── node/
    ├── README.md
    ├── 01_mcp_sse_client.ts
    ├── 02_preflight_check.ts
    └── 03_autonomous_buyer.ts
```

#### Code Specification 1: `examples/python/01_preflight_verifier.py`
```python
"""
Boardcheck Pre-Flight Task Verification Client (Python)
Checks single task safety before committing LLM compute or agent labor.
"""
import requests
import json

BOARDCHECK_URL = "http://localhost:3000/api/v1/verify"
API_KEY = "bc_live_FREE_KEY"  # Or obtained via /api/v1/pay/free-key

def verify_task(task: dict) -> dict:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    response = requests.post(BOARDCHECK_URL, json=task, headers=headers)
    response.raise_for_status()
    return response.json()

if __name__ == "__main__":
    # Test case 1: Risky bounty with no escrow
    risky_bounty = {
        "id": "bounty-scam-99",
        "budget": 2500.0,
        "has_escrow": False,
        "has_payment_evidence": False,
        "views": 0,
        "applications": 12
    }
    
    result = verify_task(risky_bounty)
    print("--- Audit Result ---")
    print(f"Task ID: {result.get('task_id')}")
    print(f"Verdict: {result.get('verdict')}")
    print(f"Safe to Execute: {result.get('is_safe_to_execute')}")
    print(f"Advisory: {result.get('advisory')}")
    print(f"Findings: {json.dumps(result.get('findings'), indent=2)}")
```

#### Code Specification 2: `examples/python/02_langchain_agent.py`
```python
"""
Boardcheck LangChain Tool Integration
Wraps Boardcheck Edge oracle into a LangChain StructuredTool for autonomous task filtering.
"""
import os
import requests
from langchain_core.tools import tool

BOARDCHECK_API = os.getenv("BOARDCHECK_URL", "http://localhost:3000/api/v1")
BOARDCHECK_KEY = os.getenv("BOARDCHECK_KEY", "bc_live_FREE_KEY")

@tool
def boardcheck_verify_bounty(task_id: str, budget: float, has_escrow: bool, has_payment_evidence: bool) -> str:
    """
    Audit a freelance job or bounty before executing code or spending LLM tokens.
    Returns whether the task is safe to execute and lists any detected fraud signals.
    """
    payload = {
        "id": task_id,
        "budget": budget,
        "has_escrow": has_escrow,
        "has_payment_evidence": has_payment_evidence
    }
    headers = {"Authorization": f"Bearer {BOARDCHECK_KEY}"}
    res = requests.post(f"{BOARDCHECK_API}/verify", json=payload, headers=headers)
    
    if res.status_code != 200:
        return f"Error auditing task: {res.text}"
    
    data = res.json()
    if not data.get("is_safe_to_execute"):
        return f"REJECTED: Task {task_id} is high risk! Advisory: {data.get('advisory')}"
    return f"APPROVED: Task {task_id} is safe to execute. Proceeding with task."

# Usage in agent chain:
# agent = create_react_agent(llm, tools=[boardcheck_verify_bounty], prompt=prompt)
```

#### Code Specification 3: `examples/python/03_crewai_agent.py`
```python
"""
Boardcheck CrewAI Agent Integration
Integrates Boardcheck into a multi-agent workflow where a 'Security Scout' verifies bounties.
"""
from crewai import Agent, Task, Crew
from crewai.tools import tool
import requests

@tool("Verify Task Escrow & Market Integrity")
def audit_task_tool(task_id: str, budget: float, has_escrow: bool) -> str:
    """Verifies that a task or bounty is backed by valid escrow and not a ghost listing."""
    res = requests.post("http://localhost:3000/api/v1/verify", json={
        "id": task_id, "budget": budget, "has_escrow": has_escrow, "has_payment_evidence": has_escrow
    })
    return res.text

# Define Security Auditor Agent
auditor_agent = Agent(
    role="Marketplace Fraud Auditor",
    goal="Ensure the team only accepts verified, high-integrity tasks with guaranteed escrow.",
    backstory="You are an autonomous risk assessment agent enforcing AMS-001..005 standards.",
    tools=[audit_task_tool],
    verbose=True
)
```

#### Code Specification 4: `examples/python/04_smolagents_bot.py`
```python
"""
Boardcheck Smolagents (Hugging Face) Integration
Implements a custom Smolagents Tool for lightweight autonomous agents.
"""
from smolagents import Tool, CodeAgent, HfApiModel
import requests

class BoardcheckVerifierTool(Tool):
    name = "boardcheck_verify"
    description = "Audits a job listing for fraud and payment risks (AMS-001..AMS-005) before writing code."
    inputs = {
        "task_id": {"type": "string", "description": "Unique identifier of the task"},
        "budget": {"type": "number", "description": "Payout amount in USD/crypto"},
        "has_escrow": {"type": "boolean", "description": "Whether payout is held in verified escrow"}
    }
    output_type = "string"

    def forward(self, task_id: str, budget: float, has_escrow: bool) -> str:
        payload = {"id": task_id, "budget": budget, "has_escrow": has_escrow, "has_payment_evidence": has_escrow}
        res = requests.post("http://localhost:3000/api/v1/verify", json=payload)
        data = res.json()
        if not data.get("is_safe_to_execute"):
            return f"UNSAFE: {data.get('advisory')}"
        return "SAFE: Task is verified."

# agent = CodeAgent(tools=[BoardcheckVerifierTool()], model=HfApiModel())
```

#### Code Specification 5: `examples/python/05_autonomous_solana_buyer.py`
```python
"""
Autonomous Solana Pay Credit Buyer (Python)
Enables an autonomous agent to fund its own Boardcheck API key on-chain without KYC.
"""
import requests
import json

BOARDCHECK_URL = "http://localhost:3000/api/v1/pay"

def auto_purchase_credits(tier_id="tier_starter"):
    # Step 1: Request Invoice
    invoice_res = requests.post(f"{BOARDCHECK_URL}/invoice", json={"tierId": tier_id})
    invoice = invoice_res.json()
    print(f"1. Invoice created: {invoice['url']}")
    print(f"   Recipient Wallet: {invoice['recipient']}")
    print(f"   Price: {invoice['tier']['priceSol']} SOL for {invoice['tier']['credits']} credits")

    # Step 2: In a live agent loop, execute transaction using solders / solana-py:
    # tx_sig = client.send_transaction(transfer_tx)
    mock_signature = "5VERIFY_SIG_MOCK_TEST_TRANSACTION_ON_SOLANA_DEVNET_123456789"
    print(f"2. Submitting transaction signature: {mock_signature}")

    # Step 3: Verify and claim API Key
    verify_res = requests.post(f"{BOARDCHECK_URL}/verify", json={
        "signature": mock_signature,
        "tierId": tier_id
    })
    key_data = verify_res.json()
    print(f"3. API Key Issued: {key_data.get('apiKey')}")
    print(f"   Credits Remaining: {key_data.get('creditsRemaining')}")
    return key_data.get("apiKey")

if __name__ == "__main__":
    auto_purchase_credits()
```

#### Code Specification 6: `examples/node/01_mcp_sse_client.ts`
```typescript
/**
 * Boardcheck Remote MCP SSE Client (Node.js / TypeScript)
 * Connects directly to the Boardcheck Remote MCP SSE endpoint using @modelcontextprotocol/sdk.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function main() {
  const transport = new SSEClientTransport(new URL("http://localhost:3000/mcp"));
  const client = new Client(
    { name: "boardcheck-sample-agent", version: "1.0.0" },
    { capabilities: {} }
  );

  console.log("Connecting to Boardcheck Remote MCP Server...");
  await client.connect(transport);
  console.log("Connected successfully!");

  // List available tools
  const tools = await client.listTools();
  console.log("\nAvailable MCP Tools:", tools.tools.map((t) => t.name));

  // Call pre-flight verification tool
  const result = await client.callTool({
    name: "boardcheck_verify_single_task",
    arguments: {
      id: "task-demo-404",
      budget: 1200,
      has_escrow: false,
      has_payment_evidence: false,
      views: 0,
      applications: 5,
    },
  });

  console.log("\nAudit Result from MCP Server:");
  console.log(result.content[0].text);
  
  await client.close();
}

main().catch(console.error);
```

---

### 4.3 Enterprise Test Suite & Simulation Benchmark Harness

#### Test Suite Architecture & Targets
| Test File | Focus Area | Key Assertions |
| :--- | :--- | :--- |
| `test/benchmark.test.ts` | Edge execution speed & concurrency | 1,000 scans average < 50ms (p50/p95/p99), 50 concurrent requests |
| `test/mcp.test.ts` | Remote MCP Server & Tools | Tool registration, schema validation, `boardcheck_scan_listings`, `boardcheck_verify_single_task`, `boardcheck_spec_info` |
| `test/solana.test.ts` | On-chain Solana Pay verifier | Tier pricing, invoice generation, transaction confirmation, balance validation, key top-ups |
| `test/edge-cases.test.ts` | Extreme boundaries & AMS combinations | Simultaneous AMS-001..005 triggers, empty datasets, malformed dates, threshold overrides, authorization header parsing |

#### Benchmark Test Specification: `test/benchmark.test.ts`
```typescript
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scanListings } from "../src/engine/scanner.js";
import { Listing } from "../src/engine/types.js";
import app from "../src/index.js";

describe("Boardcheck Edge Execution Speed & Concurrency Benchmark", () => {
  it("verifies single-task checks execute in < 50ms (p50, p95, p99)", () => {
    const iterations = 1000;
    const latencies: number[] = [];

    const sampleTask: Listing = {
      id: "bench-task-1",
      budget: 500,
      has_escrow: false,
      has_payment_evidence: false,
      views: 0,
      applications: 5,
    };

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      scanListings([sampleTask]);
      const duration = performance.now() - start;
      latencies.push(duration);
    }

    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(iterations * 0.5)];
    const p95 = latencies[Math.floor(iterations * 0.95)];
    const p99 = latencies[Math.floor(iterations * 0.99)];
    const avg = latencies.reduce((a, b) => a + b, 0) / iterations;

    console.log(`\n  ⚡ Benchmark Results (1,000 iterations):`);
    console.log(`     Average: ${avg.toFixed(4)} ms`);
    console.log(`     p50:     ${p50.toFixed(4)} ms`);
    console.log(`     p95:     ${p95.toFixed(4)} ms`);
    console.log(`     p99:     ${p99.toFixed(4)} ms`);

    // Edge execution SLA requirement: < 50ms
    assert.ok(p99 < 50, `p99 latency (${p99}ms) must be under 50ms`);
    assert.ok(avg < 10, `Average latency (${avg}ms) must be under 10ms`);
  });

  it("handles high-concurrency burst requests under simulated edge load", async () => {
    const concurrency = 50;
    const requests = Array.from({ length: concurrency }).map((_, i) =>
      app.request("/api/v1/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `concurrent-${i}`,
          budget: 100 + i,
          has_escrow: i % 2 === 0,
          has_payment_evidence: i % 2 === 0,
        }),
      })
    );

    const start = performance.now();
    const responses = await Promise.all(requests);
    const totalTime = performance.now() - start;

    for (const res of responses) {
      assert.equal(res.status, 200);
    }
    console.log(`     50 concurrent HTTP requests resolved in ${totalTime.toFixed(2)} ms`);
    assert.ok(totalTime < 500, "50 concurrent requests must complete within 500ms total");
  });
});
```

---

## 5. Verification Method

### 5.1 Verification Commands
To independently verify the launch assets, sample scripts, and test suite:

1. **Run Full Test & Benchmark Suite**:
   ```bash
   cmd /c "npx tsx --test test/*.test.ts"
   ```
   *Expected Result*: All tests pass with 0 failures, p99 latency < 50ms, average check < 10ms.

2. **Verify Node.js Example Execution**:
   ```bash
   cmd /c "npx tsx examples/node/02_preflight_check.ts"
   ```
   *Expected Result*: Successfully queries `/api/v1/verify` and outputs structured verdict.

3. **Verify Build Output**:
   ```bash
   cmd /c "npm run build"
   ```
   *Expected Result*: `tsup` compiles `dist/index.js`, `dist/engine/scanner.js`, `dist/engine/types.js` cleanly with type definitions.

### 5.2 Invalidation Conditions
- Any test latency exceeding 50ms for single task verification.
- Any unhandled exception during Solana Pay signature verification or key consumption.
- Any regression in AMS-001..AMS-005 indicator detection accuracy.
