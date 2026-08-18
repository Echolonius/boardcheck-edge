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
