import * as fs from "node:fs";
import * as path from "node:path";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { apiRouter } from "./routes/api.js";
import { payRouter } from "./routes/pay.js";
import { renderWebPortal } from "./routes/ui.js";
import { createBoardcheckMcpServer } from "./mcp/server.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const app = new Hono();

// Serve developer web portal and live auditor UI
app.get("/", (c) => {
  return c.html(renderWebPortal());
});

// Serve agentic discovery index (llms.txt)
app.get("/llms.txt", (c) => {
  try {
    const filePath = path.resolve(process.cwd(), "llms.txt");
    const content = fs.readFileSync(filePath, "utf-8");
    return c.text(content, 200, {
      "Content-Type": "text/plain; charset=utf-8",
    });
  } catch {
    return c.text(
      "# Boardcheck Edge Oracle\n> Zero-maintenance edge oracle and Remote Model Context Protocol (MCP) server for autonomous AI agent marketplace auditing, anti-fraud detection (AMS-001..AMS-005), and instant Solana Pay on-chain credit replenishment.\n",
      200,
      { "Content-Type": "text/plain; charset=utf-8" }
    );
  }
});

// Serve complete agentic context (llms-full.txt)
app.get("/llms-full.txt", (c) => {
  try {
    const filePath = path.resolve(process.cwd(), "llms-full.txt");
    const content = fs.readFileSync(filePath, "utf-8");
    return c.text(content, 200, {
      "Content-Type": "text/plain; charset=utf-8",
    });
  } catch {
    return c.text(
      "# Boardcheck Edge Oracle — Full Machine-Readable Specification\n> Complete protocol reference, MCP tool schemas, REST API documentation, AMS-001..005 detection algorithms, and autonomous Solana Pay settlement instructions.\n",
      200,
      { "Content-Type": "text/plain; charset=utf-8" }
    );
  }
});

// Mount API & Payment routes
app.route("/api/v1", apiRouter);
app.route("/api/v1/pay", payRouter);

// Map of active SSE MCP transports for remote agent sessions
const transports: Map<string, SSEServerTransport> = new Map();
const mcpServer = createBoardcheckMcpServer();

// Remote MCP Server - SSE Endpoint (GET /mcp or GET /sse)
app.get("/mcp", async (c) => {
  // Extract optional Bearer token
  const authHeader = c.req.header("Authorization") || "";
  
  // Set up SSE headers
  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");

  const transport = new SSEServerTransport("/messages", c.res as any);
  await mcpServer.connect(transport);
  
  if (transport.sessionId) {
    transports.set(transport.sessionId, transport);
  }

  return new Response("SSE Connection established", {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
});

// Remote MCP Server - Message Handler Endpoint (POST /messages)
app.post("/messages", async (c) => {
  const sessionId = c.req.query("sessionId");
  if (!sessionId || !transports.has(sessionId)) {
    return c.text("Session not found or expired", 404);
  }

  const transport = transports.get(sessionId)!;
  await transport.handlePostMessage(c.req.raw as any, c.res as any);
  return c.text("OK", 200);
});

// Start local dev server if executed directly (and not during tests)
const port = Number(process.env.PORT) || 3000;
if (process.env.NODE_ENV !== "test" && process.env.ENVIRONMENT === "development" && typeof serve === "function") {
  console.log(`\n🚀 Boardcheck Edge Platform running on http://localhost:${port}`);
  console.log(`📡 Remote MCP endpoint: http://localhost:${port}/mcp`);
  console.log(`💳 Solana Pay endpoint: http://localhost:${port}/api/v1/pay/tiers`);
  serve({
    fetch: app.fetch,
    port,
  });
}

export default app;
