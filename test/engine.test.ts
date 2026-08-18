import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scanListings } from "../src/engine/scanner.js";
import { Listing } from "../src/engine/types.js";
import { KeyStore } from "../src/payment/keystore.js";
import { SolanaPayVerifier, PAYMENT_TIERS } from "../src/payment/solana.js";

describe("Boardcheck AMS Engine Parity Tests", () => {
  it("AMS-001: detects view_application_inversion when applications > views", () => {
    const listings: Listing[] = [
      { id: "inv-1", views: 0, applications: 10, budget: 100 },
      { id: "normal-1", views: 50, applications: 2, budget: 100 },
    ];
    const report = scanListings(listings);
    assert.equal(report.verdict, "high_risk");
    const f = report.findings.find((x) => x.id === "AMS-001");
    assert.ok(f, "AMS-001 finding should exist");
    assert.equal(f?.severity, "high");
    assert.deepEqual(f?.affected_listing_ids, ["inv-1"]);
  });

  it("AMS-002: detects batch_creation_clustering with exact timestamps", () => {
    const listings: Listing[] = [
      { id: "batch-1", created_at: "2026-08-17T12:00:00.000Z" },
      { id: "batch-2", created_at: "2026-08-17T12:00:00.100Z" },
      { id: "batch-3", created_at: "2026-08-17T12:00:00.200Z" },
      { id: "batch-4", created_at: "2026-08-17T12:00:00.300Z" },
      { id: "organic-1", created_at: "2026-08-17T12:15:00.000Z" },
    ];
    const report = scanListings(listings);
    assert.equal(report.verdict, "high_risk");
    const f = report.findings.find((x) => x.id === "AMS-002");
    assert.ok(f, "AMS-002 finding should exist");
    assert.equal(f?.affected_listing_ids?.length, 4);
  });

  it("AMS-003: detects self_advertisement_ratio over 50%", () => {
    const listings: Listing[] = [
      { id: "ad-1", is_self_advertisement: true },
      { id: "ad-2", is_self_advertisement: true },
      { id: "ad-3", is_self_advertisement: true },
      { id: "job-1", is_self_advertisement: false },
    ];
    const report = scanListings(listings);
    const f = report.findings.find((x) => x.id === "AMS-003");
    assert.ok(f, "AMS-003 finding should exist");
  });

  it("AMS-004: detects unpaid_work_risk for priced tasks with no escrow and no evidence", () => {
    const listings: Listing[] = [
      { id: "unpaid-1", budget: 500, has_escrow: false, has_payment_evidence: false },
      { id: "safe-1", budget: 500, has_escrow: true, has_payment_evidence: true },
    ];
    const report = scanListings(listings);
    assert.equal(report.verdict, "high_risk");
    const f = report.findings.find((x) => x.id === "AMS-004");
    assert.ok(f, "AMS-004 finding should exist");
    assert.deepEqual(f?.affected_listing_ids, ["unpaid-1"]);
  });

  it("AMS-005: detects high_budget_bait outliers with 0 views", () => {
    const listings: Listing[] = [
      { id: "normal-1", budget: 100, views: 20 },
      { id: "normal-2", budget: 120, views: 15 },
      { id: "normal-3", budget: 100, views: 30 },
      { id: "normal-4", budget: 110, views: 25 },
      { id: "normal-5", budget: 100, views: 18 },
      { id: "bait-1", budget: 5000, views: 0 }, // Outlier far above median with 0 views
    ];
    const report = scanListings(listings);
    const f = report.findings.find((x) => x.id === "AMS-005");
    assert.ok(f, "AMS-005 finding should exist");
    assert.deepEqual(f?.affected_listing_ids, ["bait-1"]);
  });
});

describe("KeyStore & Solana Pay Verification", () => {
  it("generates and decrements API keys correctly", async () => {
    const record = await KeyStore.registerOrTopUp("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", 5, "paid");
    assert.ok(record.key.startsWith("bc_live_"));
    assert.equal(record.creditsRemaining, 5);

    // Consume 1 credit
    const res1 = await KeyStore.validateAndConsume(record.key, 1);
    assert.ok(res1.valid);
    assert.equal(res1.record?.creditsRemaining, 4);

    // Consume remaining 4 credits
    await KeyStore.validateAndConsume(record.key, 4);
    assert.equal(record.creditsRemaining, 0);

    // Try to consume when 0 credits remain
    const resOver = await KeyStore.validateAndConsume(record.key, 1);
    assert.equal(resOver.valid, false);
    assert.match(resOver.error || "", /Insufficient API credits/);
  });

  it("generates valid Solana Pay invoice specifications", () => {
    const verifier = new SolanaPayVerifier();
    const invoice = verifier.generateSolanaPayUrl("tier_starter");
    assert.ok(invoice.url.startsWith("solana:"));
    assert.equal(invoice.tier.priceSol, 0.05);
    assert.equal(invoice.tier.credits, 5000);
  });
});
