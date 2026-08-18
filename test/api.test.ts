import { describe, it } from "node:test";
import assert from "node:assert/strict";
import app from "../src/index.js";

describe("Boardcheck Edge API & Payment Endpoints", () => {
  it("GET /api/v1/health returns ok", async () => {
    const res = await app.request("/api/v1/health");
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
    assert.equal(body.standard, "AMS-001..AMS-005");
  });

  it("POST /api/v1/pay/free-key issues a 100-credit API key", async () => {
    const res = await app.request("/api/v1/pay/free-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: "test_dev_wallet" }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.success);
    assert.ok(body.apiKey.startsWith("bc_live_"));
    assert.equal(body.creditsRemaining, 100);
  });

  it("POST /api/v1/verify performs fast pre-flight check", async () => {
    // Unsafe bounty with no escrow
    const res = await app.request("/api/v1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "unsafe-job-99",
        budget: 1500,
        has_escrow: false,
        has_payment_evidence: false,
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.task_id, "unsafe-job-99");
    assert.equal(body.verdict, "high_risk");
    assert.equal(body.is_safe_to_execute, false);
    assert.match(body.advisory, /CRITICAL/);
  });

  it("POST /api/v1/scan audits a batch of listings", async () => {
    const res = await app.request("/api/v1/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        { id: "clean-1", created_at: "2026-08-17T10:00:00Z", views: 50, applications: 2, budget: 100, has_escrow: true, has_payment_evidence: true },
        { id: "clean-2", created_at: "2026-08-17T11:00:00Z", views: 40, applications: 1, budget: 120, has_escrow: true, has_payment_evidence: true },
      ]),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.verdict, "clear");
    assert.equal(body.summary.high, 0);
    assert.equal(body.summary.warn, 0);
  });

  it("POST /api/v1/pay/invoice generates standard Solana Pay URL", async () => {
    const res = await app.request("/api/v1/pay/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tierId: "tier_fleet" }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.url.startsWith("solana:"));
    assert.equal(body.tier.priceSol, 0.2);
    assert.equal(body.tier.credits, 25000);
  });
});
