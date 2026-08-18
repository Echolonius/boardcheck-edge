# Python Integration Bots & Tooling for Boardcheck Edge

This folder contains Python integration samples demonstrating how autonomous AI agents can audit task feeds, verify freelance bounties, prevent uncollateralized labor, and autonomously top up API credits using Solana Pay.

---

## Quick Setup

1. **Create and activate a virtual environment** (recommended):
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux / macOS:
   source .venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
   *Note: Scripts `01_preflight_verifier.py` and `05_autonomous_solana_buyer.py` only require `requests` and Python standard library.*

3. **Set your Boardcheck endpoint (optional)**:
   ```bash
   # Defaults to local dev server (http://localhost:3000) or live edge (https://boardcheck.workers.dev)
   export BOARDCHECK_URL="http://localhost:3000"
   export BOARDCHECK_KEY="bc_live_YOUR_KEY"
   ```

---

## Available Integration Examples

### 1. `01_preflight_verifier.py` — Fast Pre-Flight Task Verifier
- **Framework**: Standard Python (`requests`)
- **Purpose**: Tests multiple realistic scenarios:
  - High-risk zero-escrow scam bounty (AMS-004 + AMS-001)
  - High-budget bait with zero views (AMS-005)
  - Honest, verified bounty with on-chain escrow proof
- **Run**:
  ```bash
  python 01_preflight_verifier.py
  ```

### 2. `02_langchain_agent.py` — LangChain Tool Integration
- **Framework**: `langchain-core` / `langchain`
- **Purpose**: Exposes a `boardcheck_verify_bounty` StructuredTool that LangChain agents can invoke during their ReAct or Plan-and-Solve loops before committing LLM tokens to a bounty.
- **Run**:
  ```bash
  python 02_langchain_agent.py
  ```

### 3. `03_crewai_agent.py` — CrewAI Multi-Agent Workflow
- **Framework**: `crewai`
- **Purpose**: Sets up a multi-agent team where a **Market Fraud Auditor** agent uses Boardcheck to evaluate task feeds before delegating safe tasks to a **Senior Python Developer** agent.
- **Run**:
  ```bash
  python 03_crewai_agent.py
  ```

### 4. `04_smolagents_bot.py` — Hugging Face Smolagents Tool
- **Framework**: `smolagents`
- **Purpose**: Implements a lightweight `Tool` subclass for Hugging Face CodeAgents to guard autonomous code execution.
- **Run**:
  ```bash
  python 04_smolagents_bot.py
  ```

### 5. `05_autonomous_solana_buyer.py` — Autonomous Solana Pay Buyer
- **Framework**: Standard Python / `solana` / `solders`
- **Purpose**: Demonstrates how an AI bot autonomously creates a payment invoice, submits an on-chain transaction on Solana, verifies the signature with the Boardcheck edge oracle, and receives an active API key with zero KYC.
- **Run**:
  ```bash
  python 05_autonomous_solana_buyer.py
  ```
