import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { KeyStore } from "../src/payment/keystore.js";
import { SolanaPayVerifier, PAYMENT_TIERS } from "../src/payment/solana.js";
import { createBoardcheckMcpServer } from "../src/mcp/server.js";
import app from "../src/index.js";

describe("Adversarial Protocol, Security & Manifest Challenger Suite", () => {
  let mcpClient: Client;
  let clientTransport: InMemoryTransport;
  let serverTransport: InMemoryTransport;
  const mcpServer = createBoardcheckMcpServer();

  before(async () => {
    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await mcpServer.connect(serverTransport);

    mcpClient = new Client(
      { name: "adversarial-challenger-agent", version: "1.0.0" },
      { capabilities: {} }
    );
    await mcpClient.connect(clientTransport);
  });

  after(async () => {
    await mcpClient.close();
  });

  // =========================================================================
  // 1. MANIFEST & SCHEMA COMPLIANCE
  // =========================================================================
  describe("1. Manifest Schema & Registration Parity", () => {
    test("smithery.yaml: syntax, structure and tools parity", () => {
      const filePath = path.resolve(process.cwd(), "smithery.yaml");
      assert.ok(fs.existsSync(filePath), "smithery.yaml must exist at project root");
      const content = fs.readFileSync(filePath, "utf-8");

      // Verify core top-level fields
      assert.match(content, /^name:\s*boardcheck-edge/m, "Manifest must specify name");
      assert.match(content, /^version:\s*1\.0\.0/m, "Manifest must specify version 1.0.0");
      assert.match(content, /^description:/m, "Manifest must specify description");
      assert.match(content, /^license:\s*MIT/m, "Manifest must specify MIT license");

      // Verify transport configuration
      assert.match(content, /startCommand:\s*\n\s*type:\s*stdio/, "startCommand must define stdio transport");
      assert.match(content, /commandFunction:/, "Must define commandFunction for dynamic startup");
      assert.match(content, /remote:\s*\n\s*transport:\s*sse/, "Must define remote sse configuration");
      assert.match(content, /url:\s*"https:\/\/boardcheck\.agentintegrity\.org\/mcp"/, "Must define remote SSE URL");

      // Verify all 3 tools declared in smithery.yaml
      assert.ok(content.includes("boardcheck_scan_listings"), "Must declare boardcheck_scan_listings");
      assert.ok(content.includes("boardcheck_verify_single_task"), "Must declare boardcheck_verify_single_task");
      assert.ok(content.includes("boardcheck_spec_info"), "Must declare boardcheck_spec_info");
      assert.ok(content.includes("AMS-001"), "Must reference AMS-001");
      assert.ok(content.includes("AMS-005"), "Must reference AMS-005");
    });

    test("mcp-index.json: JSON schema and registry standard compliance", () => {
      const filePath = path.resolve(process.cwd(), "mcp-index.json");
      assert.ok(fs.existsSync(filePath), "mcp-index.json must exist at project root");
      const raw = fs.readFileSync(filePath, "utf-8");
      
      let manifest: any;
      assert.doesNotThrow(() => {
        manifest = JSON.parse(raw);
      }, "mcp-index.json must be valid JSON");

      assert.equal(manifest.name, "boardcheck-edge");
      assert.equal(manifest.version, "1.0.0");
      assert.equal(manifest.protocolVersion, "2024-11-05");
      assert.ok(Array.isArray(manifest.categories) && manifest.categories.includes("security"));
      assert.ok(Array.isArray(manifest.tags) && manifest.tags.includes("anti-fraud"));

      // Verify transports
      assert.ok(manifest.transports.sse && manifest.transports.sse.url.endsWith("/mcp"));
      assert.ok(manifest.transports.sse.messagesUrl.endsWith("/messages"));
      assert.ok(manifest.transports.stdio && manifest.transports.stdio.command === "npx");

      // Verify authentication specs
      assert.equal(manifest.authentication.type, "bearer");
      assert.equal(manifest.authentication.freeTier.credits, 100);

      // Verify declared tools
      const toolNames = manifest.capabilities.tools.map((t: any) => t.name);
      assert.deepEqual(toolNames.sort(), ["boardcheck_scan_listings", "boardcheck_spec_info", "boardcheck_verify_single_task"].sort());

      // Verify inputSchemas have required fields
      const scanTool = manifest.capabilities.tools.find((t: any) => t.name === "boardcheck_scan_listings");
      assert.deepEqual(scanTool.inputSchema.required, ["listings"]);

      const specTool = manifest.capabilities.tools.find((t: any) => t.name === "boardcheck_spec_info");
      assert.deepEqual(specTool.inputSchema.required, ["indicator_id"]);
      assert.deepEqual(specTool.inputSchema.properties.indicator_id.enum, ["AMS-001", "AMS-002", "AMS-003", "AMS-004", "AMS-005"]);
    });

    test("glama.json: TDQS specification and schema validation", () => {
      const filePath = path.resolve(process.cwd(), "glama.json");
      assert.ok(fs.existsSync(filePath), "glama.json must exist at project root");
      const raw = fs.readFileSync(filePath, "utf-8");
      
      let glama: any;
      assert.doesNotThrow(() => {
        glama = JSON.parse(raw);
      }, "glama.json must be valid JSON");

      assert.equal(glama.name, "boardcheck-edge");
      assert.equal(glama.runtime, "node");
      assert.deepEqual(glama.transports, ["sse", "http", "stdio"]);
      assert.equal(glama.endpoints.sse, "https://boardcheck.agentintegrity.org/mcp");
      assert.equal(glama.endpoints.messages, "https://boardcheck.agentintegrity.org/messages");

      // Verify pricing structure
      assert.equal(glama.pricing.model, "usage-based");
      assert.equal(glama.pricing.currency, "SOL");
      assert.equal(glama.pricing.freeTier.credits, 100);
      assert.equal(glama.pricing.tiers.length, 3);
      assert.equal(glama.pricing.tiers[0].priceSol, 0.05);
      assert.equal(glama.pricing.tiers[1].priceSol, 0.20);
      assert.equal(glama.pricing.tiers[2].priceSol, 0.75);

      // Verify tools structure
      assert.equal(glama.tools.length, 3);
      const toolNames = glama.tools.map((t: any) => t.name);
      assert.ok(toolNames.includes("boardcheck_scan_listings"));
      assert.ok(toolNames.includes("boardcheck_verify_single_task"));
      assert.ok(toolNames.includes("boardcheck_spec_info"));
    });

    test("llms.txt and llms-full.txt: agentic discovery and endpoint resolution", async () => {
      const res1 = await app.request("/llms.txt");
      assert.equal(res1.status, 200);
      const txt1 = await res1.text();
      assert.ok(txt1.includes("# Boardcheck Edge Oracle"));
      assert.ok(txt1.includes("/api/v1/verify"));
      assert.ok(txt1.includes("/mcp"));

      const res2 = await app.request("/llms-full.txt");
      assert.equal(res2.status, 200);
      const txt2 = await res2.text();
      assert.ok(txt2.includes("Boardcheck Edge Oracle — Full Machine-Readable Specification"));
      assert.ok(txt2.includes("AMS-001"));
      assert.ok(txt2.includes("tier_starter"));
      assert.ok(txt2.includes("https://boardcheck.agentintegrity.org"));
    });
  });

  // =========================================================================
  // 2. KEYSTORE SECURITY & OVERDRAFT STRESS-TESTING
  // =========================================================================
  describe("2. KeyStore Security, Overdraft & Concurrency Resilience", () => {
    test("Overdraft prevention: zero remaining credits returns invalid and does not underflow", async () => {
      const record = await KeyStore.registerOrTopUp("overdraft_test_wallet", 5, "paid");
      const key = record.key;

      // Consume all 5 credits
      for (let i = 0; i < 5; i++) {
        const res = await KeyStore.validateAndConsume(key, 1);
        assert.equal(res.valid, true);
        assert.equal(res.record?.creditsRemaining, 4 - i);
      }

      // Attempt 6th consumption (overdraft attempt)
      const overdraft = await KeyStore.validateAndConsume(key, 1);
      assert.equal(overdraft.valid, false);
      assert.match(overdraft.error || "", /Insufficient API credits/);
      assert.equal(overdraft.record?.creditsRemaining, 0);

      // Attempt multi-credit overdraft (requesting 10 credits when 0 available)
      const largeOverdraft = await KeyStore.validateAndConsume(key, 10);
      assert.equal(largeOverdraft.valid, false);
      assert.equal(largeOverdraft.record?.creditsRemaining, 0, "Credits must stay 0 and never become negative");
    });

    test("Concurrent quota deduction: 100 parallel requests on 10 credits allow exactly 10 and reject 90", async () => {
      const record = await KeyStore.registerOrTopUp("race_test_wallet", 10, "paid");
      const key = record.key;

      const promises = Array.from({ length: 100 }, () => KeyStore.validateAndConsume(key, 1));
      const results = await Promise.all(promises);

      const passed = results.filter((r) => r.valid).length;
      const failed = results.filter((r) => !r.valid).length;

      assert.equal(passed, 10, "Exactly 10 concurrent requests must pass");
      assert.equal(failed, 90, "Exactly 90 concurrent requests must be rejected");

      const finalRecord = await KeyStore.getKeyInfo(key);
      assert.equal(finalRecord?.creditsRemaining, 0, "Final credit balance must be exactly 0");
    });

    test("HTTP API Authentication: Expired, invalid, tampered and malicious bearer tokens", async () => {
      // 1. Missing Authorization header -> Free tier baseline
      const noAuthRes = await app.request("/api/v1/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listings: [{ id: "task-free-1", views: 10, applications: 2 }] }),
      });
      assert.equal(noAuthRes.status, 200);
      const noAuthJson: any = await noAuthRes.json();
      assert.equal(noAuthJson.credits_remaining, "free_tier");

      // 2. Malformed token prefix
      const badTokenRes = await app.request("/api/v1/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer bc_live_NON_EXISTENT_KEY_FORGERY",
        },
        body: JSON.stringify({ listings: [{ id: "task-bad-1" }] }),
      });
      assert.equal(badTokenRes.status, 402, "Must reject invalid API key with HTTP 402");
      const badJson: any = await badTokenRes.json();
      assert.match(badJson.error, /Invalid API key/);

      // 3. SQL Injection / Payload injection in token
      const injectionRes = await app.request("/api/v1/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer '; DROP TABLE keys; --",
        },
        body: JSON.stringify({ listings: [{ id: "task-sqli-1" }] }),
      });
      assert.equal(injectionRes.status, 402);

      // 4. Case-insensitive bearer prefix variations
      const keyRec = await KeyStore.registerOrTopUp("case_test_wallet", 5, "paid");
      const variations = [
        `Bearer ${keyRec.key}`,
        `bearer ${keyRec.key}`,
        `BEARER ${keyRec.key}`,
        `Bearer   ${keyRec.key}`,
      ];

      for (const authHdr of variations) {
        const res = await app.request("/api/v1/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": authHdr,
          },
          body: JSON.stringify({ listings: [{ id: "task-var-1" }] }),
        });
        assert.equal(res.status, 200, `Must accept header format: ${authHdr}`);
      }

      // 5. Exhausted API key via HTTP route
      const exhaustedKeyRecord = await KeyStore.registerOrTopUp("depleted_wallet", 1, "paid");
      const exhaustedKey = exhaustedKeyRecord.key;

      // First call succeeds
      const call1 = await app.request("/api/v1/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${exhaustedKey}`,
        },
        body: JSON.stringify({ listings: [{ id: "task-valid-1" }] }),
      });
      assert.equal(call1.status, 200);

      // Second call fails with 402
      const call2 = await app.request("/api/v1/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${exhaustedKey}`,
        },
        body: JSON.stringify({ listings: [{ id: "task-valid-2" }] }),
      });
      assert.equal(call2.status, 402);
      const call2Json: any = await call2.json();
      assert.match(call2Json.error, /Insufficient API credits/);
      assert.equal(call2Json.creditsRemaining, 0);
    });

    test("Key info route rejects unauthenticated or invalid queries", async () => {
      // Missing header
      const missing = await app.request("/api/v1/key/info");
      assert.equal(missing.status, 400);

      // Non-existent key
      const notFound = await app.request("/api/v1/key/info", {
        headers: { Authorization: "Bearer bc_live_bogus999" },
      });
      assert.equal(notFound.status, 404);
    });
  });

  // =========================================================================
  // 3. SOLANA PAY SIGNATURE VERIFICATION & REPLAY SECURITY
  // =========================================================================
  describe("3. Solana Pay Signature Verification & On-Chain Security", () => {
    const verifier = new SolanaPayVerifier();

    test("Signature validation: Rejects forged, truncated, or invalid base58 signatures gracefully", async () => {
      // 1. Completely forged random signature
      const forgedSig = "5J1GkG9d8e7c6b5a4z3y2x1wVUTSRQPONMLKJIHGFEDCBA987654321_FORGED";
      const res = await verifier.verifyAndCreditTransaction(forgedSig, "tier_starter");
      // Must not throw uncaught error; must return success: false
      assert.equal(res.success, false);
      assert.ok(res.error && res.error.length > 0);

      // 2. Empty signature via API
      const emptyRes = await app.request("/api/v1/pay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId: "tier_starter" }), // missing signature
      });
      assert.equal(emptyRes.status, 400);
      const emptyJson: any = await emptyRes.json();
      assert.match(emptyJson.error, /Transaction signature is required/);
    });

    test("Mock on-chain transaction: Failed transaction with meta.err is rejected", async () => {
      // Mock verifier connection returning failed tx
      const mockVerifier = new SolanaPayVerifier();
      (mockVerifier as any).connection = {
        getParsedTransaction: async () => ({
          meta: {
            err: { InstructionError: [0, "CustomProgramError"] },
            preBalances: [1000000000],
            postBalances: [990000000],
          },
          transaction: {
            message: {
              accountKeys: ["MockPayerWallet11111111111111111111111111111"],
            },
          },
        }),
      };

      const res = await mockVerifier.verifyAndCreditTransaction("mock_failed_sig_123", "tier_starter");
      assert.equal(res.success, false);
      assert.match(res.error || "", /Transaction failed on the Solana blockchain/);
    });

    test("Mock on-chain transaction: Unconfirmed / Not found transaction is rejected", async () => {
      const mockVerifier = new SolanaPayVerifier();
      (mockVerifier as any).connection = {
        getParsedTransaction: async () => null, // null indicates not confirmed/not found
      };

      const res = await mockVerifier.verifyAndCreditTransaction("mock_unconfirmed_sig_456", "tier_fleet");
      assert.equal(res.success, false);
      assert.match(res.error || "", /Transaction not found on-chain/);
    });

    test("Solana Pay invoice generation: Validates tier selection and custom reference keys", () => {
      // Default tier fallback
      const invDefault = verifier.generateSolanaPayUrl("unknown_tier_id");
      assert.equal(invDefault.tier.id, "tier_starter");
      assert.equal(invDefault.tier.priceSol, 0.05);

      // Specific enterprise tier with reference key
      const refKey = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
      const invEnt = verifier.generateSolanaPayUrl("tier_enterprise", refKey);
      assert.equal(invEnt.tier.id, "tier_enterprise");
      assert.equal(invEnt.tier.priceSol, 0.75);
      assert.ok(invEnt.url.includes("amount=0.75"));
      assert.ok(invEnt.url.includes(`reference=${refKey}`));
    });

    test("Key top-up continuity: Existing key preserves identity and accumulates credits", async () => {
      const initial = await KeyStore.registerOrTopUp("dev_wallet_topup", 100, "free");
      const originalKey = initial.key;
      assert.equal(initial.creditsRemaining, 100);

      // Top up with tier_starter (5,000 credits) using the same key
      const toppedUp = await KeyStore.registerOrTopUp("dev_wallet_topup", 5000, "paid", originalKey);
      assert.equal(toppedUp.key, originalKey, "Key string must remain identical");
      assert.equal(toppedUp.creditsRemaining, 5100, "Credits must sum accurately");
      assert.equal(toppedUp.totalCreditsPurchased, 5100);
      assert.equal(toppedUp.tier, "paid");
    });
  });

  // =========================================================================
  // 4. REMOTE MCP TOOL INPUT VALIDATION & RPC ROBUSTNESS
  // =========================================================================
  describe("4. Remote MCP Tool Input Validation & Schema Guardrails", () => {
    test("boardcheck_spec_info rejects invalid indicator IDs and executes valid ones", async () => {
      // Valid indicator IDs pass
      for (const id of ["AMS-001", "AMS-002", "AMS-003", "AMS-004", "AMS-005"]) {
        const res = await mcpClient.callTool({
          name: "boardcheck_spec_info",
          arguments: { indicator_id: id },
        });
        assert.equal(res.isError, undefined);
        const data = JSON.parse((res.content[0] as any).text);
        assert.ok(data.name, `Spec for ${id} must contain name`);
      }

      // Invalid indicator IDs fail Zod validation
      const invalidCalls = ["AMS-006", "AMS-999", "ams-001", "UNKNOWN", "'; DROP TABLE;"];
      for (const badId of invalidCalls) {
        const badRes = await mcpClient.callTool({
          name: "boardcheck_spec_info",
          arguments: { indicator_id: badId as any },
        });
        assert.equal(badRes.isError, true, `Schema should reject invalid indicator_id: ${badId}`);
      }
    });

    test("boardcheck_verify_single_task rejects payloads missing required id or with invalid types", async () => {
      // 1. Missing id
      const missingIdRes = await mcpClient.callTool({
        name: "boardcheck_verify_single_task",
        arguments: { budget: 100 } as any,
      });
      assert.equal(missingIdRes.isError, true);

      // 2. Invalid id type (number instead of string)
      const invalidTypeRes = await mcpClient.callTool({
        name: "boardcheck_verify_single_task",
        arguments: { id: 12345 } as any,
      });
      assert.equal(invalidTypeRes.isError, true);

      // 3. Valid payload executes cleanly
      const validRes = await mcpClient.callTool({
        name: "boardcheck_verify_single_task",
        arguments: { id: "valid-task-001", budget: 50, has_escrow: true },
      });
      assert.equal(validRes.isError, undefined);
      const parsed = JSON.parse((validRes.content[0] as any).text);
      assert.equal(parsed.verdict, "clear");
      assert.equal(parsed.task_id, "valid-task-001");
    });

    test("boardcheck_scan_listings rejects malformed payloads and handles large batch scales", async () => {
      // 1. Missing listings
      const missingListings = await mcpClient.callTool({
        name: "boardcheck_scan_listings",
        arguments: {} as any,
      });
      assert.equal(missingListings.isError, true);

      // 2. listings is not array
      const notArray = await mcpClient.callTool({
        name: "boardcheck_scan_listings",
        arguments: { listings: "not-an-array" } as any,
      });
      assert.equal(notArray.isError, true);

      // 3. listings array with items missing required id
      const missingItemId = await mcpClient.callTool({
        name: "boardcheck_scan_listings",
        arguments: { listings: [{ title: "missing id" }] } as any,
      });
      assert.equal(missingItemId.isError, true);

      // 4. Large batch scale test (500 items)
      const largeBatch = Array.from({ length: 500 }, (_, i) => ({
        id: `scale-item-${i}`,
        title: `Task #${i}`,
        views: 10 + (i % 5),
        applications: 1,
        budget: 25.0,
        has_escrow: true,
      }));

      const scanRes = await mcpClient.callTool({
        name: "boardcheck_scan_listings",
        arguments: { listings: largeBatch },
      });
      assert.equal(scanRes.isError, undefined);
      const scanJson = JSON.parse((scanRes.content[0] as any).text);
      assert.equal(scanJson.verdict, "clear");
      assert.equal(scanJson.coverage.total_listings, 500);
      assert.equal(scanJson.summary.high, 0);
    });

    test("HTTP REST Scan endpoint rejects corrupted JSON and missing listings payload", async () => {
      // 1. Missing listings property in object
      const res1 = await app.request("/api/v1/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wrongField: [] }),
      });
      assert.equal(res1.status, 400);

      // 2. Verify endpoint with empty object
      const res2 = await app.request("/api/v1/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      assert.equal(res2.status, 400);
    });
  });
});
