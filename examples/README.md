# Boardcheck Edge: Multi-Framework Developer Examples

This directory contains production-ready integration examples, pre-flight safety checks, and autonomous Solana Pay buying scripts for Python and Node.js / TypeScript.

---

## Directory Structure

```
examples/
├── sample-check.json                    # Sample payload for REST API testing
├── python/                              # Python Agent Frameworks & Tooling
│   ├── requirements.txt                 # Dependencies for Python bots
│   ├── README.md                        # Setup & quickstart guide for Python
│   ├── 01_preflight_verifier.py         # Lightweight zero-dependency pre-flight verifier
│   ├── 02_langchain_agent.py            # LangChain StructuredTool integration
│   ├── 03_crewai_agent.py               # CrewAI Market Fraud Auditor agent
│   ├── 04_smolagents_bot.py             # Hugging Face Smolagents Tool integration
│   └── 05_autonomous_solana_buyer.py    # Autonomous on-chain credit buyer via Solana Pay
└── node/                                # Node.js & TypeScript Integrations
    ├── README.md                        # Quickstart guide for TypeScript / Node.js
    ├── 01_mcp_sse_client.ts             # Remote MCP client using @modelcontextprotocol/sdk
    ├── 02_preflight_check.ts            # Fast REST pre-flight verifier & batch scanner
    └── 03_autonomous_buyer.ts           # Autonomous Solana Pay buyer & API key manager
```

---

## Integration Framework Matrix

| Framework / Language | Script Path | Protocol | Use Case |
| :--- | :--- | :--- | :--- |
| **Python (Standard)** | `examples/python/01_preflight_verifier.py` | REST (`/api/v1/verify`) | Fast pre-flight check before executing any task |
| **LangChain** | `examples/python/02_langchain_agent.py` | Tool Call (`@tool`) | Gating task execution in LangChain React agents |
| **CrewAI** | `examples/python/03_crewai_agent.py` | Multi-Agent Tool | Dedicated Fraud Auditor agent inspecting bounties |
| **Smolagents** | `examples/python/04_smolagents_bot.py` | Hugging Face Tool | Guarding code-generation bots against fake bounties |
| **Python Solana Pay** | `examples/python/05_autonomous_solana_buyer.py` | Solana Pay (`/pay/*`) | Autonomous on-chain API credit acquisition |
| **Node.js (Remote MCP)** | `examples/node/01_mcp_sse_client.ts` | MCP SSE (`/mcp`) | Calling Boardcheck tools via standard MCP SDK |
| **Node.js (TypeScript)** | `examples/node/02_preflight_check.ts` | REST (`/api/v1/verify`) | Fast zero-dependency TypeScript task verifier |
| **Node.js Solana Pay** | `examples/node/03_autonomous_buyer.ts` | Solana Pay (`/pay/*`) | On-chain credit top-up for Node.js agent daemons |

---

## Getting a Free Developer API Key

For instant testing with 100 free credits without connecting a wallet:

```bash
# Using cURL
curl -X POST https://boardcheck.workers.dev/api/v1/pay/free-key \
  -H "Content-Type: application/json" \
  -d '{"wallet": "dev_test_wallet"}'
```

Or pass `Authorization: Bearer bc_live_FREE_KEY` in local/mock environments.
