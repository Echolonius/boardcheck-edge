import { Hono } from "hono";
import { scanListings } from "../engine/scanner.js";
import { Listing } from "../engine/types.js";
import { KeyStore } from "../payment/keystore.js";

export const apiRouter = new Hono();

// Middleware: API Key verification (optional for free trial, required for high-throughput)
async function apiKeyMiddleware(c: any, next: any) {
  const authHeader = c.req.header("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  // If free trial header or test key provided, allow up to free quota
  if (!token) {
    // Grant baseline free usage without key
    return await next();
  }

  const result = await KeyStore.validateAndConsume(token, 1);
  if (!result.valid) {
    return c.json({ error: result.error, creditsRemaining: result.record?.creditsRemaining ?? 0 }, 402);
  }

  c.set("apiKeyRecord", result.record);
  await next();
}

// Health check
apiRouter.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "boardcheck-edge",
    version: "1.0.0",
    standard: "AMS-001..AMS-005",
    timestamp: new Date().toISOString(),
  });
});

// Bulk listings scan endpoint
apiRouter.post("/scan", apiKeyMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const listings: Listing[] = Array.isArray(body) ? body : body.listings;

    if (!Array.isArray(listings)) {
      return c.json({ error: "Invalid payload: Expected an array of listings or { listings: [...] }" }, 400);
    }

    const report = scanListings(listings, body.thresholds);
    const keyRecord = c.get("apiKeyRecord");

    return c.json({
      ...report,
      credits_remaining: keyRecord ? keyRecord.creditsRemaining : "free_tier",
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Fast single-task pre-flight verification endpoint
apiRouter.post("/verify", apiKeyMiddleware, async (c) => {
  try {
    const task: Listing = await c.req.json();
    if (!task || !task.id) {
      return c.json({ error: "Invalid payload: Task object with an 'id' is required" }, 400);
    }

    const report = scanListings([task]);
    const isRisky = report.verdict === "high_risk";

    return c.json({
      task_id: task.id,
      verdict: report.verdict,
      is_safe_to_execute: !isRisky,
      advisory: isRisky
        ? "CRITICAL: High risk of unpaid work or ghost listing. Do NOT commit compute without upfront escrow."
        : report.verdict === "caution"
        ? "CAUTION: Unverified listing metrics. Proceed with strict payment safeguards."
        : "PASS: Listing passes baseline honest market checks.",
      findings: report.findings,
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Check API key credits info
apiRouter.get("/key/info", async (c) => {
  const authHeader = c.req.header("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return c.json({ error: "Authorization header with Bearer <KEY> is required" }, 400);
  }

  const record = await KeyStore.getKeyInfo(token);
  if (!record) {
    return c.json({ error: "API Key not found" }, 404);
  }

  return c.json({
    key: `${token.substring(0, 10)}...`,
    payerWallet: record.payerWallet,
    creditsRemaining: record.creditsRemaining,
    totalCreditsPurchased: record.totalCreditsPurchased,
    tier: record.tier,
    createdAt: record.createdAt,
  });
});
