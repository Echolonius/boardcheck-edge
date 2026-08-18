# Master Launch Guide & Distribution Checklist: Boardcheck Edge

This document outlines the end-to-end launch plan, distribution schedule, community outreach channels, registry submissions, and KPI targets for **Boardcheck Edge**.

---

## 1. Launch Overview & Core Value Proposition

- **Product**: Boardcheck Edge (`boardcheck-edge`)
- **Category**: AI Agent Infrastructure, Anti-Fraud Oracle, Remote MCP Server, Solana Pay
- **Primary Narrative**: Solving **"The Penniless Agent Problem"** — enabling autonomous AI bots to purchase sub-50ms fraud protection on-chain with zero KYC and zero human intervention.
- **Repository**: https://github.com/echolonius/boardcheck-edge
- **Live Edge Portal**: https://boardcheck.workers.dev
- **Remote MCP Endpoint**: https://boardcheck.workers.dev/mcp

---

## 2. Launch Timeline & Execution Schedule

| Time | Phase | Target Platform / Action | Responsible Owner | Deliverables / Artifacts |
| :--- | :--- | :--- | :--- | :--- |
| **T-24h** | Pre-Flight & Healthcheck | Cloudflare Workers / Vercel Edge | DevOps / QA | Verify `/health`, `/mcp`, `/api/v1/pay/tiers`, sub-50ms benchmark pass |
| **T-0 (08:00 UTC)** | Primary Launch | Hacker News (`Show HN`) | Marketing / DevRel | `launch/SHOW_HN.md` |
| **T+15m** | Product Directory | Product Hunt | Marketing / Founder | `launch/PRODUCT_HUNT.md` + Screenshots |
| **T+30m** | Social Viral Push | X (Twitter) 8-Tweet Thread | Social Lead | `launch/TWITTER_THREAD.md` |
| **T+1h** | Registry Submissions | Smithery, Glama, MCP Index | Integration Specialist | `smithery.yaml`, `glama.json`, `mcp-index.json` |
| **T+2h** | Developer Communities | Reddit (r/LocalLLaMA, r/solanadev) | DevRel | Tailored subreddit discussions |
| **T+4h** | Agent Ecosystems | Discord (Anthropic, CrewAI, LangChain) | DevRel | Framework integration code snippets |
| **T+24h** | Day 1 Review & Support | GitHub Issues & In-Bound Q&A | Core Team | Support incoming devs, monitor API key issuance |
| **T+7d** | Milestone Retro | Analytics & Metrics Review | All | Review on-chain SOL volume, active MCP connections |

---

## 3. Multi-Channel Distribution Strategy

### A. Hacker News (`Show HN`)
- **Target URL**: https://news.ycombinator.com/submit
- **Submission Title**: `Show HN: Boardcheck – Zero-KYC anti-fraud oracle & Remote MCP for autonomous AI agents`
- **Copy Source**: `launch/SHOW_HN.md`
- **Engagement Strategy**: Founder in comments answering questions about the AMS standard, edge performance, and Solana Pay integration.

### B. Product Hunt
- **Target URL**: https://www.producthunt.com/posts/new
- **Copy Source**: `launch/PRODUCT_HUNT.md`
- **Assets**: 4 screenshots (Visualizer matrix, SVG QR checkout, Claude Desktop config generator, benchmark terminal).

### C. X / Twitter
- **Copy Source**: `launch/TWITTER_THREAD.md`
- **Hashtags / Tags**: `#AI #MCP #Solana #AgenticAI #LangChain #CrewAI #ClaudeDesktop`
- **Media**: Short video/GIF of interactive fraud matrix firing and QR code checkout.

### D. Targeted Reddit Communities
1. **r/LocalLLaMA**:
   - *Angle*: Running autonomous agents locally or via API? How to prevent your bots from wasting tokens on ghost bounties.
2. **r/solanadev**:
   - *Angle*: Real-world autonomous on-chain commerce: how AI agents use Solana Pay to purchase edge API credits with zero KYC.
3. **r/ClaudeAI**:
   - *Angle*: Connecting Remote MCP servers to Claude Desktop in 2026.
4. **r/artificial & r/machinelearning**:
   - *Angle*: The AMS (Agent Market Signals) open standard for task integrity.

### E. AI & Developer Discord Communities
- **Anthropic Discord** (`#mcp-servers` / `#tools-and-integrations`): Share Remote MCP URL and Claude Desktop configuration.
- **LangChain Discord** (`#ecosystem-tools`): Share `examples/python/02_langchain_agent.py`.
- **CrewAI Discord** (`#show-and-tell`): Share `examples/python/03_crewai_agent.py` multi-agent scout setup.
- **Hugging Face Discord** (`#smolagents`): Share `examples/python/04_smolagents_bot.py`.
- **Solana Developers Discord** (`#solana-pay` / `#ai-hackathon`): Share `05_autonomous_solana_buyer.py` and zero-KYC credit issuance architecture.

### F. MCP Directories & Registries
- **Smithery.ai**: Registered via root `smithery.yaml`.
- **Glama.ai**: Registered via root `glama.json`.
- **MCP Index**: Registered via root `mcp-index.json`.
- **Agentic Crawlers**: Indexed via `/llms.txt` and `/llms-full.txt`.

---

## 4. Key Talking Points & Objection Handling

| Objection / Question | Recommended Answer |
| :--- | :--- |
| **"Why not just use Stripe or credit cards?"** | Autonomous AI agents cannot hold fiat bank accounts, do not have government IDs for KYC, and cannot legally hold credit cards. Solana Pay provides native, permissionless micro-transactions in SOL and USDC. |
| **"Isn't edge verification slow compared to local regex?"** | Boardcheck's AMS engine executes in under 2ms with zero database roundtrips. p99 edge latency is under 50ms worldwide, which is negligible compared to an LLM's 500ms+ inference latency. |
| **"Can I run this locally without paying SOL?"** | Yes! Boardcheck is 100% open source under the MIT license, can be run via `npx boardcheck-edge`, and provides 100 free scan credits via `POST /api/v1/pay/free-key`. |
| **"What if marketplace data doesn't have escrow tags?"** | Boardcheck evaluates multiple complementary indicators (view-to-application ratios, timestamp clustering, budget anomalies) so high risk can still be detected even with incomplete metadata. |

---

## 5. Success Metrics & KPIs (Target 30-Day Goals)

- **GitHub Stars**: 500+ stars
- **Smithery / Glama Installs**: 1,000+ active MCP sessions
- **Free Developer Keys Claimed**: 2,500+ keys
- **On-Chain Solana Pay Volume**: 50+ SOL in credit top-ups
- **Multi-Agent Integrations**: 100+ production agent deployments using Boardcheck pre-flight gating
