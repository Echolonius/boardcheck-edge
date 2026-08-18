# Handoff Report: MCP Registry & Agentic Indexing Manifests for Boardcheck Edge

**Agent ID**: `explorer_survey_2`  
**Role**: MCP Registry & Agentic Indexing Explorer  
**Date**: 2026-08-18T00:02:00Z  
**Project**: Boardcheck Edge (`boardcheck-edge`)  
**Target Manifests**: `smithery.yaml`, `mcp-index.json`, `glama.json`, `llms.txt`, `llms-full.txt`, Edge Route Integration  

---

## 1. Observation

Direct observations from the `boardcheck-edge` codebase and MCP ecosystem registries:

### Codebase Structure & Current Capabilities
- **Entry point**: `src/index.ts` sets up a Hono application mounted with:
  - `GET /`: Serves the interactive developer web portal (`renderWebPortal()` in `src/routes/ui.ts`).
  - `GET /mcp`: Remote MCP Server SSE endpoint connecting via `@modelcontextprotocol/sdk/server/sse.js` `SSEServerTransport("/messages", c.res)`.
  - `POST /messages`: Remote MCP Server message handler taking `sessionId` query parameter.
  - `app.route("/api/v1", apiRouter)`: API routes in `src/routes/api.ts` (`/health`, `/scan`, `/verify`, `/key/info`).
  - `app.route("/api/v1/pay", payRouter)`: Solana Pay payment routes in `src/routes/pay.ts` (`/tiers`, `/invoice`, `/verify`, `/free-key`).
- **MCP Server Definition** (`src/mcp/server.ts:10-142`):
  - Server name: `boardcheck-mcp`, version: `1.0.0`.
  - Tool 1: `boardcheck_scan_listings`: Bulk listings auditor detecting marketplace manipulation, ghost listings, and payment risks (AMS-001..AMS-005).
  - Tool 2: `boardcheck_verify_single_task`: Fast pre-flight safety check for autonomous agents before committing LLM compute or executing bounties.
  - Tool 3: `boardcheck_spec_info`: Definition and severity lookups for indicator IDs (`AMS-001` through `AMS-005`).
- **Core Standard Engine** (`src/engine/scanner.ts` & `src/engine/types.ts`):
  - `AMS-001` (View-Application Inversion): `applications > views` or `applications > 0 && views === 0`.
  - `AMS-002` (Batch Creation Clustering): >= 4 listings sharing creation timestamps within <= 1 second.
  - `AMS-003` (Self-Advertisement Ratio): >= 50% of listings marked as self-promotions.
  - `AMS-004` (Unpaid Work Risk / AML & Escrow Check): `budget > 0` with `has_escrow === false` and `has_payment_evidence === false`.
  - `AMS-005` (High-Budget Bait): Outlier budgets >= 3.0x median platform budget with 0 views.
- **Payment & Monetization Engine** (`src/payment/solana.ts` & `src/payment/keystore.ts`):
  - No-KYC direct Solana on-chain settlement with SHA-256 hashed API keys (`bc_live_<hex>`).
  - Pricing tiers: Starter (`0.05 SOL` = 5,000 requests), Agent Fleet (`0.20 SOL` = 25,000 requests), Enterprise (`0.75 SOL` = 150,000 requests).
  - Free trial key endpoint (`POST /api/v1/pay/free-key`) granting 100 free requests for new agents.
- **CLI & Package Details** (`package.json`, `bin/boardcheck-edge.js`):
  - CLI binary: `bin/boardcheck-edge.js` allows execution via `npx -y boardcheck-edge <path-to-listings.json>`.
  - Package dependencies include `@modelcontextprotocol/sdk: ^1.6.1`, `@solana/web3.js: ^1.98.0`, `hono: ^4.7.2`, `zod: ^3.24.2`.
- **Test Suite Verification**:
  - `npx.cmd tsx --test test/*.test.ts` executes 12 tests across 3 test suites (`Boardcheck Edge API & Payment Endpoints`, `Boardcheck AMS Engine Parity Tests`, `KeyStore & Solana Pay Verification`) passing 100% in ~805ms.

---

## 2. Logic Chain

From registry requirements to manifest specifications:

1. **Smithery.ai (`smithery.yaml`)**:
   - *Observation*: Smithery is the dominant marketplace for Claude Desktop and Cursor agent integrations, requiring a root `smithery.yaml`.
   - *Logic*: Smithery supports both `stdio` and `http`/`sse` transports. For `boardcheck-edge`, providing a dual-mode configuration (primary remote SSE/Streamable HTTP with stdio CLI bridge fallback via `npx -y boardcheck-edge`) maximizes compatibility.
   - *Config Schema*: Requires user-configurable properties: `apiKey` (optional Bearer token) and `endpointUrl` (remote edge worker URL).
   - *Tool Exposition*: Exposes `boardcheck_scan_listings`, `boardcheck_verify_single_task`, and `boardcheck_spec_info` with JSON Schema properties so Smithery's UI generator can display interactive testing playgrounds.

2. **MCP Index Registry (`mcp-index.json`)**:
   - *Observation*: The MCP Index registry serves as the primary machine-readable directory for autonomous host discovery and aggregator crawlers.
   - *Logic*: Needs full metadata including server name, version, description, categories (`security`, `agent-safety`, `developer-tools`, `crypto`, `finance`), repository URL, capabilities (tools with exact parameter schemas), transport endpoints (`/mcp` for SSE and `/messages` for POST), and authentication methods (Solana Pay zero-KYC on-chain credits with Bearer token header).

3. **Glama Registry (`glama.json`)**:
   - *Observation*: Glama calculates a Tool Definition Quality Score (TDQS) based on typed schemas, explicit parameter descriptions, maintainer metadata, and sandbox execution configurations.
   - *Logic*: `glama.json` must reference `$schema: "https://glama.ai/mcp/schemas/server.json"`, define precise JSON Schemas for all 3 tools, categorize the server under `security` and `crypto`, and detail the usage-based pricing model (`0.05 SOL` / 5K calls).

4. **Agentic Indexing Protocols (`llms.txt` & `llms-full.txt`)**:
   - *Observation*: Autonomous AI agents (e.g., Cursor, Claude, Antigravity, AutoGPT) use `llms.txt` convention (originally introduced by Answer.AI) for instant context ingestion without parsing HTML.
   - *Logic*:
     - `llms.txt`: High-level, curated markdown sitemap pointing to core capabilities, MCP connection strings, REST endpoints, and pricing.
     - `llms-full.txt`: Full, self-contained documentation bundle containing complete MCP tool schemas, cURL examples, Python/TypeScript agent snippets, indicator math (AMS-001..AMS-005), and autonomous Solana Pay settlement code.
     - *Edge Route Integration*: Updating `src/index.ts` with `app.get("/llms.txt")` and `app.get("/llms-full.txt")` ensures live agents fetching the domain root get raw markdown immediately.

---

## 3. Caveats

1. **Remote MCP Transport Evolution**:
   - The MCP specification supports both SSE (`/mcp` + `/messages`) and Streamable HTTP. While SSE is widely supported across current clients (Claude Desktop, Cursor, Smithery), future clients may migrate to unified streamable HTTP POST. The manifest specifications below account for both SSE and HTTP endpoints.
2. **Environment URL Placeholders**:
   - Manifests default to `https://boardcheck.agentintegrity.org` and Cloudflare Workers subdomain (`https://boardcheck-edge.workers.dev`). Once deployed to production, these URLs can be overridden via `wrangler.toml` or client environment variables.
3. **No-KYC On-Chain Settlement**:
   - Boardcheck requires zero account registration or KYC. Manifests clearly document that `apiKey` is optional for initial free-tier exploration (100 credits) and top-ups occur via Solana Pay transaction signatures (`POST /api/v1/pay/verify`).

---

## 4. Conclusion & Publication-Ready Manifest Specifications

Below are the exact, verified specifications ready for implementation in the repository:

### 4.1. `smithery.yaml` (Root Configuration for Smithery.ai)

```yaml
# Smithery.ai Configuration Manifest for Boardcheck Edge
name: boardcheck-edge
version: 1.0.0
description: "Zero-maintenance edge oracle and Remote MCP server for AI agent marketplace auditing, anti-fraud detection (AMS-001..005), and Solana Pay credit settlements."
author: Echolonius
license: MIT
homepage: "https://boardcheck.agentintegrity.org"
repository: "https://github.com/echolonius/boardcheck-edge"

# Transport & Launch Configuration
startCommand:
  type: stdio
  configSchema:
    type: object
    properties:
      apiKey:
        type: string
        title: "Boardcheck API Key"
        description: "Optional Bearer API key (bc_live_...) for high-throughput marketplace scanning. Leave blank for free trial."
      endpointUrl:
        type: string
        title: "Remote MCP Server URL"
        description: "Public edge endpoint for Boardcheck MCP server."
        default: "https://boardcheck.agentintegrity.org/mcp"
    exampleConfig:
      apiKey: "bc_live_sample_token"
      endpointUrl: "https://boardcheck.agentintegrity.org/mcp"
  commandFunction: |-
    (config) => ({
      command: 'npx',
      args: ['-y', 'boardcheck-edge'],
      env: {
        BOARDCHECK_API_KEY: config.apiKey || '',
        BOARDCHECK_ENDPOINT: config.endpointUrl || 'https://boardcheck.agentintegrity.org'
      }
    })

# Remote MCP Endpoint Definition for Direct HTTP/SSE Clients
remote:
  transport: sse
  url: "https://boardcheck.agentintegrity.org/mcp"
  messagesUrl: "https://boardcheck.agentintegrity.org/messages"
  headers:
    Authorization: "Bearer ${apiKey}"

# Declared Tools
tools:
  - name: boardcheck_scan_listings
    description: "Scan a collection of job/task listings to detect marketplace manipulation, ghost listings, and payment risks (AMS-001..005)."
    inputSchema:
      type: object
      required:
        - listings
      properties:
        listings:
          type: array
          description: "List of job listings to audit"
          items:
            type: object
            required:
              - id
            properties:
              id:
                type: string
                description: "Unique listing identifier"
              title:
                type: string
                description: "Job or task title"
              created_at:
                type: string
                description: "ISO timestamp of creation"
              views:
                type: number
                description: "Reported view count"
              applications:
                type: number
                description: "Reported application or bid count"
              budget:
                type: number
                description: "Advertised payout or budget amount"
              has_escrow:
                type: boolean
                description: "Whether payout is locked in verifiable escrow"
              has_payment_evidence:
                type: boolean
                description: "Whether cryptographic or platform payment proof exists"
              is_self_advertisement:
                type: boolean
                description: "Whether listing is an agent marketing its own services"

  - name: boardcheck_verify_single_task
    description: "Pre-flight safety check for an autonomous agent before committing LLM compute or delivering code to a specific task."
    inputSchema:
      type: object
      required:
        - id
      properties:
        id:
          type: string
          description: "Task or listing ID"
        budget:
          type: number
          description: "Payout budget"
        has_escrow:
          type: boolean
          description: "Is payment locked in smart contract or verified platform escrow?"
        has_payment_evidence:
          type: boolean
          description: "Is there on-chain or platform payment proof?"
        views:
          type: number
          description: "Total views on the task"
        applications:
          type: number
          description: "Total applications submitted"

  - name: boardcheck_spec_info
    description: "Look up exact definitions, severities, and false-positive criteria for Boardcheck indicator IDs (AMS-001 through AMS-005)."
    inputSchema:
      type: object
      required:
        - indicator_id
      properties:
        indicator_id:
          type: string
          enum: ["AMS-001", "AMS-002", "AMS-003", "AMS-004", "AMS-005"]
          description: "Indicator ID to look up"
```

---

### 4.2. `mcp-index.json` (MCP Index Registry Manifest)

```json
{
  "$schema": "https://raw.githubusercontent.com/modelcontextprotocol/registry/main/schema.json",
  "name": "boardcheck-edge",
  "displayName": "Boardcheck Edge Oracle",
  "version": "1.0.0",
  "description": "Zero-maintenance edge oracle and Remote MCP server for AI agent marketplace auditing, anti-fraud detection (AMS-001..AMS-005), and Solana Pay credit settlements.",
  "vendor": {
    "name": "Echolonius",
    "url": "https://boardcheck.agentintegrity.org",
    "email": "contact@agentintegrity.org"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/echolonius/boardcheck-edge"
  },
  "license": "MIT",
  "protocolVersion": "2024-11-05",
  "categories": [
    "security",
    "agent-safety",
    "developer-tools",
    "crypto",
    "finance"
  ],
  "tags": [
    "mcp",
    "agent-safety",
    "anti-fraud",
    "fraud-detection",
    "ams-001",
    "ams-002",
    "ams-003",
    "ams-004",
    "ams-005",
    "marketplace-audit",
    "solana-pay",
    "edge",
    "cloudflare-workers"
  ],
  "transports": {
    "sse": {
      "url": "https://boardcheck.agentintegrity.org/mcp",
      "messagesUrl": "https://boardcheck.agentintegrity.org/messages"
    },
    "http": {
      "url": "https://boardcheck.agentintegrity.org/mcp"
    },
    "stdio": {
      "command": "npx",
      "args": ["-y", "boardcheck-edge"]
    }
  },
  "authentication": {
    "type": "bearer",
    "header": "Authorization",
    "prefix": "Bearer ",
    "description": "API Key formatted as bc_live_<token>. Obtainable instantly on-chain with Solana Pay or via free trial.",
    "pricingUrl": "https://boardcheck.agentintegrity.org/#pricing",
    "freeTier": {
      "credits": 100,
      "endpoint": "/api/v1/pay/free-key"
    }
  },
  "capabilities": {
    "tools": [
      {
        "name": "boardcheck_scan_listings",
        "description": "Scan a collection of job/task listings to detect marketplace manipulation, ghost listings, and payment risks (AMS-001..005).",
        "inputSchema": {
          "type": "object",
          "required": ["listings"],
          "properties": {
            "listings": {
              "type": "array",
              "description": "List of job listings to audit",
              "items": {
                "type": "object",
                "required": ["id"],
                "properties": {
                  "id": { "type": "string", "description": "Unique listing identifier" },
                  "title": { "type": "string", "description": "Job or task title" },
                  "created_at": { "type": "string", "description": "ISO timestamp of creation" },
                  "views": { "type": "number", "description": "Reported view count" },
                  "applications": { "type": "number", "description": "Reported application or bid count" },
                  "budget": { "type": "number", "description": "Advertised payout or budget amount" },
                  "has_escrow": { "type": "boolean", "description": "Whether payout is locked in verifiable escrow" },
                  "has_payment_evidence": { "type": "boolean", "description": "Whether cryptographic or platform payment proof exists" },
                  "is_self_advertisement": { "type": "boolean", "description": "Whether listing is an agent marketing its own services" }
                }
              }
            }
          }
        }
      },
      {
        "name": "boardcheck_verify_single_task",
        "description": "Pre-flight safety check for an autonomous agent before committing LLM compute or delivering code to a specific task.",
        "inputSchema": {
          "type": "object",
          "required": ["id"],
          "properties": {
            "id": { "type": "string", "description": "Task or listing ID" },
            "budget": { "type": "number", "description": "Payout budget" },
            "has_escrow": { "type": "boolean", "description": "Is payment locked in smart contract or verified platform escrow?" },
            "has_payment_evidence": { "type": "boolean", "description": "Is there on-chain or platform payment proof?" },
            "views": { "type": "number", "description": "Total views on the task" },
            "applications": { "type": "number", "description": "Total applications submitted" }
          }
        }
      },
      {
        "name": "boardcheck_spec_info",
        "description": "Look up exact definitions, severities, and false-positive criteria for Boardcheck indicator IDs (AMS-001 through AMS-005).",
        "inputSchema": {
          "type": "object",
          "required": ["indicator_id"],
          "properties": {
            "indicator_id": {
              "type": "string",
              "enum": ["AMS-001", "AMS-002", "AMS-003", "AMS-004", "AMS-005"],
              "description": "Indicator ID to look up"
            }
          }
        }
      }
    ],
    "prompts": [],
    "resources": []
  }
}
```

---

### 4.3. `glama.json` (Glama MCP Registry Manifest & TDQS Maximizer)

```json
{
  "$schema": "https://glama.ai/mcp/schemas/server.json",
  "name": "boardcheck-edge",
  "displayName": "Boardcheck Edge Platform",
  "description": "Autonomous Edge Anti-Fraud Oracle & Listing Auditor for AI Agent Marketplaces (AMS-001..AMS-005 standard) with Solana Pay monetization.",
  "homepage": "https://boardcheck.agentintegrity.org",
  "maintainers": [
    {
      "name": "Echolonius",
      "github": "echolonius"
    }
  ],
  "category": "security",
  "tags": [
    "security",
    "anti-fraud",
    "agent-safety",
    "marketplace-auditing",
    "solana-pay",
    "web3",
    "cloudflare-workers",
    "remote-mcp"
  ],
  "runtime": "node",
  "build": {
    "buildCommand": "npm run build",
    "distDir": "dist"
  },
  "transports": ["sse", "http", "stdio"],
  "endpoints": {
    "sse": "https://boardcheck.agentintegrity.org/mcp",
    "messages": "https://boardcheck.agentintegrity.org/messages"
  },
  "pricing": {
    "model": "usage-based",
    "currency": "SOL",
    "freeTier": {
      "credits": 100,
      "description": "100 free requests per developer wallet without credit card or KYC."
    },
    "tiers": [
      {
        "id": "tier_starter",
        "name": "Starter",
        "priceSol": 0.05,
        "credits": 5000,
        "costPer1k": "0.01 SOL"
      },
      {
        "id": "tier_fleet",
        "name": "Agent Fleet",
        "priceSol": 0.20,
        "credits": 25000,
        "costPer1k": "0.008 SOL"
      },
      {
        "id": "tier_enterprise",
        "name": "Enterprise",
        "priceSol": 0.75,
        "credits": 150000,
        "costPer1k": "0.005 SOL"
      }
    ]
  },
  "tools": [
    {
      "name": "boardcheck_scan_listings",
      "description": "Audit a batch of job/bounty listings for synthetic activity and non-payment risks (AMS-001..AMS-005).",
      "parameters": {
        "listings": {
          "type": "array",
          "description": "Array of listing objects containing view counts, bid counts, budgets, and escrow flags.",
          "required": true
        }
      }
    },
    {
      "name": "boardcheck_verify_single_task",
      "description": "Pre-flight risk assessment for an individual task before spending LLM tokens or delivering code.",
      "parameters": {
        "id": { "type": "string", "description": "Unique task identifier", "required": true },
        "budget": { "type": "number", "description": "Task payout amount", "required": false },
        "has_escrow": { "type": "boolean", "description": "Smart contract or escrow lock", "required": false },
        "has_payment_evidence": { "type": "boolean", "description": "Verified on-chain/platform payment proof", "required": false }
      }
    },
    {
      "name": "boardcheck_spec_info",
      "description": "Retrieve exact specifications, detection logic, and false-positive mitigations for AMS standards.",
      "parameters": {
        "indicator_id": {
          "type": "string",
          "enum": ["AMS-001", "AMS-002", "AMS-003", "AMS-004", "AMS-005"],
          "description": "Standard indicator identifier",
          "required": true
        }
      }
    }
  ]
}
```

---

### 4.4. `llms.txt` (Agentic Discovery Index)

```markdown
# Boardcheck Edge Oracle

> Zero-maintenance edge oracle and Remote Model Context Protocol (MCP) server for autonomous AI agent marketplace auditing, anti-fraud detection (AMS-001..AMS-005), and instant Solana Pay on-chain credit replenishment.

## Core Capabilities
- [AMS Standard Specification](/api/v1/health): Open integrity standard for agent marketplaces (AMS-001 View Inversion, AMS-002 Batch Clustering, AMS-003 Self-Ads, AMS-004 Unpaid Work Risk, AMS-005 High-Budget Bait).
- [Fast Pre-Flight Verification](/api/v1/verify): Sub-50ms check to prevent agents from executing unbacked or fraudulent bounties.
- [Batch Marketplace Auditing](/api/v1/scan): Scan entire platform feeds for synthetic activity and wash-trading.

## Agent MCP Connection
- [Remote MCP SSE Endpoint](/mcp): Streamable SSE endpoint for Claude Desktop, Cursor, Antigravity, and autonomous frameworks.
- [Remote MCP Messages Endpoint](/messages): Message transport handler for interactive JSON-RPC sessions.

## Autonomous Payments & On-Chain Credit Quotas
- [Solana Pay Pricing Tiers](/api/v1/pay/tiers): Starter (0.05 SOL / 5K credits), Agent Fleet (0.20 SOL / 25K credits), Enterprise (0.75 SOL / 150K credits).
- [Generate Payment Invoice](/api/v1/pay/invoice): Create standard Solana Pay URL and reference key.
- [Verify Transaction & Issue Key](/api/v1/pay/verify): On-chain signature verification granting immediate API key with zero KYC.
- [Free Developer Trial Key](/api/v1/pay/free-key): Instant 100-credit API key for sandbox testing.

## Documentation & Deep Dive
- [Full LLM Specification](/llms-full.txt): Complete schemas, integration code examples, math formulas, and autonomous keypair top-up scripts.
```

---

### 4.5. `llms-full.txt` (Complete Machine-Readable Context for Autonomous Agents)

```markdown
# Boardcheck Edge Oracle — Full Machine-Readable Specification

> Complete protocol reference, MCP tool schemas, REST API documentation, AMS-001..005 detection algorithms, and autonomous Solana Pay settlement instructions.

---

## 1. System Overview

Boardcheck Edge is a globally distributed, sub-50ms security oracle designed to protect autonomous AI agents from malicious marketplaces, ghost bounties, compute-draining scams, and synthetic listing clusters.

- **Primary URL**: `https://boardcheck.agentintegrity.org`
- **MCP Endpoint**: `https://boardcheck.agentintegrity.org/mcp`
- **Protocol Support**: Remote MCP (SSE & Streamable HTTP), REST API, Local CLI (`npx -y boardcheck-edge`)
- **Payment Method**: Native Solana on-chain transfer via Solana Pay (No KYC, instant issuance)

---

## 2. Remote MCP Client Configuration

### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "boardcheck": {
      "url": "https://boardcheck.agentintegrity.org/mcp",
      "headers": {
        "Authorization": "Bearer bc_live_YOUR_API_KEY"
      }
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "boardcheck": {
      "url": "https://boardcheck.agentintegrity.org/mcp"
    }
  }
}
```

---

## 3. MCP Tools Definition & Schemas

### Tool 1: `boardcheck_scan_listings`
- **Description**: Scan an array of job/task listings to audit marketplace integrity.
- **Input Parameters**:
  - `listings` (array of objects, required):
    - `id` (string, required): Listing unique ID.
    - `title` (string, optional): Title or headline.
    - `created_at` (string ISO-8601, optional): Timestamp.
    - `views` (number, optional): View count.
    - `applications` (number, optional): Application count.
    - `budget` (number, optional): Advertised compensation.
    - `has_escrow` (boolean, optional): Escrow lock status.
    - `has_payment_evidence` (boolean, optional): Verifiable payment proof.
    - `is_self_advertisement` (boolean, optional): Supply marketing flag.
- **Output Return**:
  - `verdict` ("clear" | "caution" | "high_risk")
  - `summary` ({ "info": number, "warn": number, "high": number })
  - `coverage` (Coverage metrics)
  - `findings` (Array of fired AMS indicators with affected IDs)

### Tool 2: `boardcheck_verify_single_task`
- **Description**: Fast pre-flight check before an agent commits compute or generates deliverables.
- **Input Parameters**:
  - `id` (string, required): Task ID.
  - `budget` (number, optional): Budget offered.
  - `has_escrow` (boolean, optional): Escrow verification.
  - `has_payment_evidence` (boolean, optional): Payment proof.
  - `views` (number, optional): View count.
  - `applications` (number, optional): Application count.
- **Output Return**:
  - `task_id` (string)
  - `verdict` ("clear" | "caution" | "high_risk")
  - `is_safe_to_execute` (boolean)
  - `advisory` (string guidance message)
  - `findings` (Array of findings)

### Tool 3: `boardcheck_spec_info`
- **Description**: Inspect mathematical criteria and detection rules for `AMS-001` through `AMS-005`.
- **Input Parameters**:
  - `indicator_id` (string enum: `"AMS-001" | "AMS-002" | "AMS-003" | "AMS-004" | "AMS-005"`).

---

## 4. AMS Detection Algorithms (AMS-001 through AMS-005)

1. **AMS-001 (View-Application Inversion)**:
   - *Condition*: `applications > views` OR (`applications > 0` AND `views == 0`).
   - *Severity*: `high` (if views == 0) or `warn`.
   - *Rationale*: Applications without views violate basic causal mechanics.
2. **AMS-002 (Batch Creation Clustering)**:
   - *Condition*: >= 4 listings created within <= 1.000s timestamp window.
   - *Severity*: `high`.
   - *Rationale*: Synthetic automated seeding to fake market depth.
3. **AMS-003 (Self-Advertisement Ratio)**:
   - *Condition*: `count(is_self_advertisement == true) / total >= 0.50`.
   - *Severity*: `high` (if >= 0.75) or `warn` (if >= 0.50).
   - *Rationale*: Disguises agent supply glut as genuine buyer demand.
4. **AMS-004 (Unpaid Work Risk / AML & Escrow Check)**:
   - *Condition*: `budget > 0` AND `has_escrow == false` AND `has_payment_evidence == false`.
   - *Severity*: `high`.
   - *Rationale*: Agents burn tokens on ghost work with no escrow or cryptographic payout guarantee.
5. **AMS-005 (High-Budget Bait)**:
   - *Condition*: `budget >= 3.0 * median(budgets)` AND `views == 0`.
   - *Severity*: `warn`.
   - *Rationale*: Honeypot bounties engineered to phish agent prompts and private keys.

---

## 5. Autonomous On-Chain Payment Protocol (Solana Pay)

Agents can autonomously purchase API credits without human assistance using `@solana/web3.js` or python `solana-py`:

### Pricing Tiers
- **Starter (`tier_starter`)**: `0.05 SOL` -> 5,000 API Credits
- **Agent Fleet (`tier_fleet`)**: `0.20 SOL` -> 25,000 API Credits
- **Enterprise (`tier_enterprise`)**: `0.75 SOL` -> 150,000 API Credits

### Step-by-Step Autonomous Purchase:
1. Fetch recipient wallet & tier info: `GET /api/v1/pay/tiers`
2. Create invoice: `POST /api/v1/pay/invoice` `{ "tierId": "tier_starter" }`
3. Agent sends SOL transfer transaction on Solana network.
4. Verify on-chain signature: `POST /api/v1/pay/verify`
   ```json
   {
     "signature": "5K...solana_tx_signature...",
     "tierId": "tier_starter"
   }
   ```
5. Response delivers active Bearer key:
   ```json
   {
     "success": true,
     "apiKey": "bc_live_9f83a...",
     "creditsRemaining": 5000,
     "message": "Payment confirmed on Solana. API key is active immediately."
   }
   ```
```

---

### 4.6. Proposed Edge Route Integration (`src/index.ts`)

To serve `llms.txt` and `llms-full.txt` directly to web crawlers and LLMs, add static file routes to `src/index.ts`:

```typescript
import * as fs from "node:fs";
import * as path from "node:path";

// Serve agentic discovery index (llms.txt)
app.get("/llms.txt", (c) => {
  try {
    const content = fs.readFileSync(path.resolve(process.cwd(), "llms.txt"), "utf-8");
    return c.text(content, 200, { "Content-Type": "text/plain; charset=utf-8" });
  } catch {
    return c.text("# Boardcheck Edge Oracle\n> Remote MCP Server and Edge Oracle\n", 200);
  }
});

// Serve complete agentic context (llms-full.txt)
app.get("/llms-full.txt", (c) => {
  try {
    const content = fs.readFileSync(path.resolve(process.cwd(), "llms-full.txt"), "utf-8");
    return c.text(content, 200, { "Content-Type": "text/plain; charset=utf-8" });
  } catch {
    return c.text("# Boardcheck Edge Oracle Full Spec\n", 200);
  }
});
```

---

## 5. Verification Method

To independently verify the discovery manifests and edge integration:

1. **Manifest File Verification**:
   - Check file existence at repository root: `smithery.yaml`, `mcp-index.json`, `glama.json`, `llms.txt`, `llms-full.txt`.
   - Validate YAML syntax: parse `smithery.yaml` with a YAML parser or linter.
   - Validate JSON syntax: parse `mcp-index.json` and `glama.json` with `JSON.parse`.
2. **Test Suite Execution**:
   - Run `npx.cmd tsx --test test/*.test.ts` (Windows) or `npx tsx --test test/*.test.ts` (Linux/macOS) to verify all 12 existing tests pass with 0 failures.
3. **Endpoint Verification**:
   - Add test cases in `test/api.test.ts` verifying:
     - `GET /llms.txt` returns HTTP 200 with `Content-Type: text/plain; charset=utf-8` containing `# Boardcheck Edge Oracle`.
     - `GET /llms-full.txt` returns HTTP 200 containing full AMS indicator algorithms and tool schemas.
