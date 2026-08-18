/**
 * Boardcheck Remote MCP SSE Client (TypeScript / Node.js)
 * Connects directly to the Boardcheck Remote MCP server via Server-Sent Events (SSE)
 * using the official @modelcontextprotocol/sdk.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const BOARDCHECK_MCP_URL = process.env.BOARDCHECK_MCP_URL || "http://localhost:3000/mcp";
const API_KEY = process.env.BOARDCHECK_KEY || "bc_live_FREE_KEY";

async function main() {
  console.log("=".repeat(70));
  console.log("📡 Boardcheck Remote MCP SSE Client (@modelcontextprotocol/sdk)");
  console.log(`🔗 Target Endpoint: ${BOARDCHECK_MCP_URL}`);
  console.log("=".repeat(70));

  // Initialize MCP Client
  const client = new Client(
    {
      name: "boardcheck-example-agent",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  console.log("\n[1] Connecting via SSE transport...");
  const transport = new SSEClientTransport(new URL(BOARDCHECK_MCP_URL), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    },
  });

  try {
    await client.connect(transport);
    console.log("✅ Successfully connected to Boardcheck Remote MCP Server!");

    // 1. List Available Tools
    console.log("\n[2] Discovering available MCP tools...");
    const toolsResult = await client.listTools();
    console.log("  Registered Tools:");
    for (const tool of toolsResult.tools) {
      console.log(`   - ${tool.name}: ${tool.description}`);
    }

    // 2. Call Tool: boardcheck_verify_single_task
    console.log("\n[3] Calling 'boardcheck_verify_single_task' tool for an unescrowed bounty...");
    const scamCheck = await client.callTool({
      name: "boardcheck_verify_single_task",
      arguments: {
        id: "bounty-node-scam-999",
        budget: 3200,
        has_escrow: false,
        has_payment_evidence: false,
        views: 0,
        applications: 18,
      },
    });

    console.log("  Response from MCP Server:");
    if (scamCheck.content && scamCheck.content.length > 0) {
      console.log("  " + JSON.stringify(JSON.parse((scamCheck.content[0] as any).text), null, 2));
    }

    // 3. Call Tool: boardcheck_spec_info
    console.log("\n[4] Looking up indicator specification for AMS-004 (Unpaid Work Risk)...");
    const specInfo = await client.callTool({
      name: "boardcheck_spec_info",
      arguments: {
        indicator_id: "AMS-004",
      },
    });
    console.log("  Specification Info:");
    if (specInfo.content && specInfo.content.length > 0) {
      console.log("  " + JSON.stringify(JSON.parse((specInfo.content[0] as any).text), null, 2));
    }

    await client.close();
    console.log("\n" + "=".repeat(70));
    console.log("🎉 Remote MCP session completed successfully!");
    console.log("=".repeat(70));
  } catch (err: any) {
    console.error(`\n❌ MCP Connection Error: ${err.message}`);
    console.log("\nNote: Make sure the Boardcheck server is running (`npm run dev`) or test against a live endpoint.");
  }
}

main().catch(console.error);
