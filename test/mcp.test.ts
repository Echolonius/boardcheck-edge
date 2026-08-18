import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createBoardcheckMcpServer } from "../src/mcp/server.js";

describe("Remote Model Context Protocol (MCP) Server & Tools Suite", () => {
  let client: Client;
  let clientTransport: InMemoryTransport;
  let serverTransport: InMemoryTransport;
  const mcpServer = createBoardcheckMcpServer();

  before(async () => {
    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await mcpServer.connect(serverTransport);

    client = new Client(
      { name: "test-mcp-agent", version: "1.0.0" },
      { capabilities: {} }
    );
    await client.connect(clientTransport);
  });

  after(async () => {
    await client.close();
  });

  describe("Tool Registration & Discovery", () => {
    it("registers all 3 official Boardcheck Remote MCP tools", async () => {
      const response = await client.listTools();
      const toolNames = response.tools.map((t) => t.name);

      assert.ok(toolNames.includes("boardcheck_scan_listings"), "boardcheck_scan_listings must be registered");
      assert.ok(toolNames.includes("boardcheck_verify_single_task"), "boardcheck_verify_single_task must be registered");
      assert.ok(toolNames.includes("boardcheck_spec_info"), "boardcheck_spec_info must be registered");
      assert.equal(toolNames.length, 3);
    });

    it("verifies tool schemas and parameter descriptions", async () => {
      const response = await client.listTools();
      const scanTool = response.tools.find((t) => t.name === "boardcheck_scan_listings");
      const verifyTool = response.tools.find((t) => t.name === "boardcheck_verify_single_task");
      const specTool = response.tools.find((t) => t.name === "boardcheck_spec_info");

      assert.ok(scanTool?.description?.includes("AMS-001..005"));
      assert.ok(scanTool?.inputSchema);
      assert.equal(scanTool?.inputSchema.type, "object");

      assert.ok(verifyTool?.description?.includes("Pre-flight safety check"));
      assert.ok(verifyTool?.inputSchema.properties?.id);

      assert.ok(specTool?.description?.includes("AMS-001 through AMS-005"));
      assert.ok(specTool?.inputSchema.properties?.indicator_id);
    });
  });

  describe("Tool Execution: boardcheck_scan_listings", () => {
    it("executes batch scan on clean listings and returns clear report JSON", async () => {
      const result = await client.callTool({
        name: "boardcheck_scan_listings",
        arguments: {
          listings: [
            {
              id: "clean-job-1",
              title: "Smart Contract Audit",
              views: 100,
              applications: 4,
              budget: 500,
              has_escrow: true,
              has_payment_evidence: true,
            },
            {
              id: "clean-job-2",
              title: "Frontend UI Redesign",
              views: 80,
              applications: 2,
              budget: 350,
              has_escrow: true,
              has_payment_evidence: true,
            },
          ],
        },
      });

      assert.ok(result.content);
      assert.equal(result.content.length, 1);
      const textContent = (result.content[0] as any).text;
      const parsed = JSON.parse(textContent);

      assert.equal(parsed.verdict, "clear");
      assert.equal(parsed.summary.high, 0);
      assert.equal(parsed.summary.warn, 0);
      assert.equal(parsed.coverage.total_listings, 2);
      assert.deepEqual(parsed.findings, []);
    });

    it("executes batch scan on malicious listings and flags AMS violations", async () => {
      const result = await client.callTool({
        name: "boardcheck_scan_listings",
        arguments: {
          listings: [
            {
              id: "scam-1",
              title: "Urgent Python Script",
              views: 0,
              applications: 15, // AMS-001
              budget: 1200,
              has_escrow: false, // AMS-004
              has_payment_evidence: false,
            },
          ],
        },
      });

      const parsed = JSON.parse((result.content[0] as any).text);
      assert.equal(parsed.verdict, "high_risk");
      assert.ok(parsed.findings.some((f: any) => f.id === "AMS-001"));
      assert.ok(parsed.findings.some((f: any) => f.id === "AMS-004"));
    });
  });

  describe("Tool Execution: boardcheck_verify_single_task", () => {
    it("approves legitimate task with verified escrow and PASS advisory", async () => {
      const result = await client.callTool({
        name: "boardcheck_verify_single_task",
        arguments: {
          id: "safe-task-401",
          budget: 800,
          has_escrow: true,
          has_payment_evidence: true,
          views: 50,
          applications: 3,
        },
      });

      const parsed = JSON.parse((result.content[0] as any).text);
      assert.equal(parsed.task_id, "safe-task-401");
      assert.equal(parsed.verdict, "clear");
      assert.match(parsed.advisory, /PASS: Listing passes baseline honest market checks/);
      assert.deepEqual(parsed.findings, []);
    });

    it("rejects unpaid risky task with CRITICAL advisory", async () => {
      const result = await client.callTool({
        name: "boardcheck_verify_single_task",
        arguments: {
          id: "unpaid-task-999",
          budget: 2000,
          has_escrow: false,
          has_payment_evidence: false,
          views: 10,
          applications: 1,
        },
      });

      const parsed = JSON.parse((result.content[0] as any).text);
      assert.equal(parsed.task_id, "unpaid-task-999");
      assert.equal(parsed.verdict, "high_risk");
      assert.match(parsed.advisory, /CRITICAL: High risk of unpaid work or ghost listing/);
      assert.ok(parsed.findings.length > 0);
    });

    it("returns CAUTION advisory for inverted metrics with views > 0", async () => {
      const result = await client.callTool({
        name: "boardcheck_verify_single_task",
        arguments: {
          id: "caution-task-500",
          budget: 0,
          views: 10,
          applications: 12, // Inversion with views > 0 -> caution
        },
      });

      const parsed = JSON.parse((result.content[0] as any).text);
      assert.equal(parsed.verdict, "caution");
      assert.match(parsed.advisory, /CAUTION: Unverified listing metrics/);
    });
  });

  describe("Tool Execution: boardcheck_spec_info", () => {
    it("returns correct standard specs for all 5 AMS indicator IDs", async () => {
      const indicators = ["AMS-001", "AMS-002", "AMS-003", "AMS-004", "AMS-005"] as const;

      for (const id of indicators) {
        const result = await client.callTool({
          name: "boardcheck_spec_info",
          arguments: { indicator_id: id },
        });

        const parsed = JSON.parse((result.content[0] as any).text);
        assert.ok(parsed.name, `Spec for ${id} must include name`);
        assert.ok(parsed.severity, `Spec for ${id} must include severity`);
        assert.ok(parsed.description, `Spec for ${id} must include description`);
        assert.ok(parsed.why_it_matters, `Spec for ${id} must include why_it_matters`);
      }
    });
  });

  describe("Input Schema Validation & Error Handling", () => {
    it("handles invalid indicator_id parameter gracefully", async () => {
      const res = await client.callTool({
        name: "boardcheck_spec_info",
        arguments: { indicator_id: "AMS-999" as any },
      });
      // In MCP SDK, schema validation failure returns isError: true
      assert.equal(res.isError, true);
    });

    it("handles boardcheck_verify_single_task when missing required id", async () => {
      const res = await client.callTool({
        name: "boardcheck_verify_single_task",
        arguments: { budget: 500 } as any,
      });
      assert.equal(res.isError, true);
    });

    it("handles boardcheck_scan_listings when missing required listings array", async () => {
      const res = await client.callTool({
        name: "boardcheck_scan_listings",
        arguments: {} as any,
      });
      assert.equal(res.isError, true);
    });
  });
});
