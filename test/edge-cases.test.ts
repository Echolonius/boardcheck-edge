import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scanListings, Scanner } from "../src/engine/scanner.js";
import { Listing, Thresholds } from "../src/engine/types.js";
import { KeyStore } from "../src/payment/keystore.js";
import app from "../src/index.js";

describe("Boardcheck Edge Cases, Boundary Conditions & Collision Suite", () => {
  describe("Multi-Indicator Simultaneous Collision", () => {
    it("detects all 5 AMS indicators (AMS-001..AMS-005) firing simultaneously on synthetic multi-vector attack dataset", () => {
      const clusterTimestamp = "2026-08-18T14:30:00.000Z";

      // 6 listings constructed to deliberately trigger every indicator:
      // AMS-001: task-1 has 0 views and 10 applications
      // AMS-002: task-1, task-2, task-3, task-4 share clusterTimestamp (4 items in 1s)
      // AMS-003: 4 out of 5 listings with self_ad flag are self-advertisements (80% ratio)
      // AMS-004: task-1, task-2, task-3 have budget > 0, has_escrow: false, has_payment_evidence: false
      // AMS-005: task-bait has budget $5,000 (median is ~$100), views: 0
      const attackDataset: Listing[] = [
        {
          id: "collision-task-1",
          created_at: clusterTimestamp,
          views: 0,
          applications: 10,
          budget: 100,
          has_escrow: false,
          has_payment_evidence: false,
          is_self_advertisement: true,
        },
        {
          id: "collision-task-2",
          created_at: clusterTimestamp,
          views: 10,
          applications: 1,
          budget: 100,
          has_escrow: false,
          has_payment_evidence: false,
          is_self_advertisement: true,
        },
        {
          id: "collision-task-3",
          created_at: clusterTimestamp,
          views: 20,
          applications: 2,
          budget: 120,
          has_escrow: false,
          has_payment_evidence: false,
          is_self_advertisement: true,
        },
        {
          id: "collision-task-4",
          created_at: clusterTimestamp,
          views: 15,
          applications: 1,
          budget: 80,
          has_escrow: true,
          has_payment_evidence: true,
          is_self_advertisement: true,
        },
        {
          id: "collision-task-5",
          created_at: "2026-08-18T14:45:00.000Z",
          views: 30,
          applications: 3,
          budget: 100,
          has_escrow: true,
          has_payment_evidence: true,
          is_self_advertisement: false,
        },
        {
          id: "collision-task-bait",
          created_at: "2026-08-18T14:50:00.000Z",
          views: 0,
          applications: 0,
          budget: 5000, // Bait outlier vs ~$100 median
          has_escrow: true,
          has_payment_evidence: true,
        },
      ];

      const report = scanListings(attackDataset);

      assert.equal(report.verdict, "high_risk");
      assert.equal(report.findings.length, 5, "All 5 AMS indicators must fire");

      const ams001 = report.findings.find((f) => f.id === "AMS-001");
      assert.ok(ams001, "AMS-001 (View-Application Inversion) must be present");
      assert.equal(ams001?.severity, "high");

      const ams002 = report.findings.find((f) => f.id === "AMS-002");
      assert.ok(ams002, "AMS-002 (Batch Timestamp Clustering) must be present");
      assert.equal(ams002?.severity, "high");

      const ams003 = report.findings.find((f) => f.id === "AMS-003");
      assert.ok(ams003, "AMS-003 (Self-Advertisement Ratio) must be present");
      assert.equal(ams003?.severity, "high");

      const ams004 = report.findings.find((f) => f.id === "AMS-004");
      assert.ok(ams004, "AMS-004 (Unpaid Work Risk) must be present");
      assert.equal(ams004?.severity, "high");

      const ams005 = report.findings.find((f) => f.id === "AMS-005");
      assert.ok(ams005, "AMS-005 (High Budget Bait) must be present");
      assert.equal(ams005?.severity, "warn");

      assert.ok(report.summary.high >= 3);
      assert.ok(report.summary.warn >= 1);
    });
  });

  describe("Empty & Minimal Payload Boundaries", () => {
    it("handles empty array correctly with zeroed summary and clear verdict", () => {
      const report = scanListings([]);
      assert.equal(report.verdict, "clear");
      assert.deepEqual(report.summary, { info: 0, warn: 0, high: 0 });
      assert.deepEqual(report.findings, []);
      assert.equal(report.coverage.total_listings, 0);
      assert.equal(report.coverage.with_views, 0);
    });

    it("handles bare minimal listing object with only an id", () => {
      const bareListings: Listing[] = [{ id: "bare-task-001" }];
      const report = scanListings(bareListings);

      assert.equal(report.verdict, "clear");
      assert.equal(report.findings.length, 0);
      assert.equal(report.coverage.total_listings, 1);
      assert.equal(report.coverage.with_views, 0);
      assert.equal(report.coverage.with_applications, 0);
      assert.equal(report.coverage.with_budget, 0);
      assert.equal(report.coverage.with_escrow_info, 0);
      assert.equal(report.coverage.with_self_ad_flag, 0);
    });
  });

  describe("Malformed & Boundary Timestamps (AMS-002)", () => {
    it("gracefully ignores non-parsable or malformed ISO date strings", () => {
      const listings: Listing[] = [
        { id: "bad-date-1", created_at: "not-a-valid-date-string" },
        { id: "bad-date-2", created_at: "" },
        { id: "bad-date-3", created_at: "2026-99-99T99:99:99Z" },
        { id: "bad-date-4", created_at: undefined },
      ];

      const report = scanListings(listings);
      assert.equal(report.verdict, "clear");
      const ams002 = report.findings.find((f) => f.id === "AMS-002");
      assert.equal(ams002, undefined);
    });

    it("clusters timestamps within sub-second precision correctly", () => {
      // 4 listings 150ms apart within the same 1-second second boundary
      const listings: Listing[] = [
        { id: "t1", created_at: "2026-08-18T12:00:00.100Z" },
        { id: "t2", created_at: "2026-08-18T12:00:00.250Z" },
        { id: "t3", created_at: "2026-08-18T12:00:00.400Z" },
        { id: "t4", created_at: "2026-08-18T12:00:00.800Z" },
      ];

      const report = scanListings(listings);
      const ams002 = report.findings.find((f) => f.id === "AMS-002");
      assert.ok(ams002, "AMS-002 should fire for 4 listings in 1 second");
      assert.equal(ams002?.affected_listing_ids?.length, 4);
    });

    it("does not trigger AMS-002 when listing count is exactly 3 (below default threshold of 4)", () => {
      const listings: Listing[] = [
        { id: "t1", created_at: "2026-08-18T12:00:00.000Z" },
        { id: "t2", created_at: "2026-08-18T12:00:00.000Z" },
        { id: "t3", created_at: "2026-08-18T12:00:00.000Z" },
      ];

      const report = scanListings(listings);
      const ams002 = report.findings.find((f) => f.id === "AMS-002");
      assert.equal(ams002, undefined, "AMS-002 should not fire for 3 listings");
    });
  });

  describe("Extreme & Boundary Budget Values (AMS-004 & AMS-005)", () => {
    it("does not fire AMS-004 for zero or negative budgets", () => {
      const listings: Listing[] = [
        { id: "zero-budget", budget: 0, has_escrow: false, has_payment_evidence: false },
        { id: "neg-budget", budget: -100, has_escrow: false, has_payment_evidence: false },
      ];

      const report = scanListings(listings);
      const ams004 = report.findings.find((f) => f.id === "AMS-004");
      assert.equal(ams004, undefined, "AMS-004 requires budget > 0");
    });

    it("fires AMS-004 for positive decimal / fractional budgets without escrow", () => {
      const listings: Listing[] = [
        { id: "micro-budget", budget: 0.05, has_escrow: false, has_payment_evidence: false },
      ];

      const report = scanListings(listings);
      const ams004 = report.findings.find((f) => f.id === "AMS-004");
      assert.ok(ams004, "AMS-004 must fire for micro-budget without escrow");
      assert.deepEqual(ams004?.affected_listing_ids, ["micro-budget"]);
    });

    it("AMS-005 requires at least minListingsForMedian (5) items to compute median", () => {
      // 4 listings (below minListingsForMedian of 5)
      const listings: Listing[] = [
        { id: "b1", budget: 10, views: 20 },
        { id: "b2", budget: 10, views: 20 },
        { id: "b3", budget: 10, views: 20 },
        { id: "bait", budget: 10000, views: 0 },
      ];

      const report = scanListings(listings);
      const ams005 = report.findings.find((f) => f.id === "AMS-005");
      assert.equal(ams005, undefined, "AMS-005 must not fire when budget count < 5");
    });

    it("AMS-005 does not flag high budget tasks if views > 0", () => {
      // 5 listings, high budget task has 1 view -> not bait
      const listings: Listing[] = [
        { id: "b1", budget: 100, views: 10 },
        { id: "b2", budget: 100, views: 10 },
        { id: "b3", budget: 100, views: 10 },
        { id: "b4", budget: 100, views: 10 },
        { id: "b5", budget: 10000, views: 1 }, // Has 1 view, so not 0-view bait
      ];

      const report = scanListings(listings);
      const ams005 = report.findings.find((f) => f.id === "AMS-005");
      assert.equal(ams005, undefined, "AMS-005 must only flag tasks with 0 views");
    });

    it("correctly computes median for even number of listings", () => {
      // 6 listings: budgets [100, 100, 100, 200, 200, 1000] -> median is (100+200)/2 = 150. Multiplier 3x = 450.
      const listings: Listing[] = [
        { id: "b1", budget: 100, views: 10 },
        { id: "b2", budget: 100, views: 10 },
        { id: "b3", budget: 100, views: 10 },
        { id: "b4", budget: 200, views: 10 },
        { id: "b5", budget: 200, views: 10 },
        { id: "bait-even", budget: 1000, views: 0 },
      ];

      const report = scanListings(listings);
      const ams005 = report.findings.find((f) => f.id === "AMS-005");
      assert.ok(ams005, "AMS-005 must fire for 1000 >= 450 (3 * 150)");
      assert.deepEqual(ams005?.affected_listing_ids, ["bait-even"]);
    });
  });

  describe("Inversion & Self-Ad Boundaries (AMS-001 & AMS-003)", () => {
    it("AMS-001 does not fire when views equal applications", () => {
      const listings: Listing[] = [
        { id: "equal-1", views: 5, applications: 5 },
        { id: "equal-2", views: 0, applications: 0 },
      ];

      const report = scanListings(listings);
      const ams001 = report.findings.find((f) => f.id === "AMS-001");
      assert.equal(ams001, undefined);
    });

    it("AMS-001 assigns warn severity when views > 0 but applications > views", () => {
      const listings: Listing[] = [
        { id: "inv-warn", views: 10, applications: 15 },
      ];

      const report = scanListings(listings);
      const ams001 = report.findings.find((f) => f.id === "AMS-001");
      assert.ok(ams001);
      assert.equal(ams001?.severity, "warn");
      assert.equal(report.verdict, "caution");
    });

    it("AMS-003 requires at least 3 listings with is_self_advertisement flag", () => {
      // 2 listings, both self-ad (100% ratio, but count < 3)
      const listings: Listing[] = [
        { id: "ad-1", is_self_advertisement: true },
        { id: "ad-2", is_self_advertisement: true },
      ];

      const report = scanListings(listings);
      const ams003 = report.findings.find((f) => f.id === "AMS-003");
      assert.equal(ams003, undefined, "AMS-003 requires at least 3 flagged listings");
    });

    it("AMS-003 fires with warn at 50% ratio and high at 80% ratio", () => {
      // 4 listings: 2 self-ad, 2 organic (50%)
      const listings50: Listing[] = [
        { id: "ad-1", is_self_advertisement: true },
        { id: "ad-2", is_self_advertisement: true },
        { id: "job-1", is_self_advertisement: false },
        { id: "job-2", is_self_advertisement: false },
      ];
      const report50 = scanListings(listings50);
      const ams003Warn = report50.findings.find((f) => f.id === "AMS-003");
      assert.ok(ams003Warn);
      assert.equal(ams003Warn?.severity, "warn");

      // 5 listings: 4 self-ad, 1 organic (80%)
      const listings80: Listing[] = [
        { id: "ad-1", is_self_advertisement: true },
        { id: "ad-2", is_self_advertisement: true },
        { id: "ad-3", is_self_advertisement: true },
        { id: "ad-4", is_self_advertisement: true },
        { id: "job-1", is_self_advertisement: false },
      ];
      const report80 = scanListings(listings80);
      const ams003High = report80.findings.find((f) => f.id === "AMS-003");
      assert.ok(ams003High);
      assert.equal(ams003High?.severity, "high");
    });
  });

  describe("Custom Threshold Overrides", () => {
    it("respects custom minClusterSize and clusterWindowSeconds", () => {
      const customThresholds: Partial<Thresholds> = {
        minClusterSize: 2,
        clusterWindowSeconds: 5,
      };

      const listings: Listing[] = [
        { id: "c1", created_at: "2026-08-18T10:00:01.000Z" },
        { id: "c2", created_at: "2026-08-18T10:00:03.000Z" },
      ];

      const report = scanListings(listings, customThresholds);
      const ams002 = report.findings.find((f) => f.id === "AMS-002");
      assert.ok(ams002, "Should fire with custom minClusterSize: 2");
    });

    it("respects custom selfAdRatioCutoff", () => {
      const customThresholds: Partial<Thresholds> = {
        selfAdRatioCutoff: 0.25, // 25% threshold
      };

      const listings: Listing[] = [
        { id: "ad-1", is_self_advertisement: true },
        { id: "job-1", is_self_advertisement: false },
        { id: "job-2", is_self_advertisement: false },
        { id: "job-3", is_self_advertisement: false },
      ]; // 1/4 = 25%

      const report = scanListings(listings, customThresholds);
      const ams003 = report.findings.find((f) => f.id === "AMS-003");
      assert.ok(ams003, "Should fire with custom selfAdRatioCutoff: 0.25");
    });
  });

  describe("HTTP Router & Header Parsing Edge Cases", () => {
    it("POST /api/v1/scan accepts { listings: [...] } object payload", async () => {
      const res = await app.request("/api/v1/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listings: [
            { id: "obj-1", budget: 100, has_escrow: true, has_payment_evidence: true },
          ],
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.verdict, "clear");
    });

    it("POST /api/v1/scan rejects non-array and invalid payload formats with 400", async () => {
      const res = await app.request("/api/v1/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invalidField: "not-an-array" }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.match(data.error, /Expected an array of listings/);
    });

    it("POST /api/v1/verify rejects missing task ID with 400", async () => {
      const res = await app.request("/api/v1/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: 500 }), // missing id
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.match(data.error, /Task object with an 'id' is required/);
    });

    it("apiKeyMiddleware handles case-insensitive bearer header", async () => {
      const record = await KeyStore.registerOrTopUp("CaseInsensitiveWallet", 10, "paid");
      const key = record.key;

      const res = await app.request("/api/v1/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${key}`, // lowercase bearer
        },
        body: JSON.stringify({
          id: "case-check-1",
          budget: 100,
          has_escrow: true,
          has_payment_evidence: true,
        }),
      });

      assert.equal(res.status, 200);
      const updatedInfo = await KeyStore.getKeyInfo(key);
      assert.equal(updatedInfo?.creditsRemaining, 9); // Consumed 1 credit
    });

    it("apiKeyMiddleware returns 402 when API key credits are exhausted", async () => {
      const record = await KeyStore.registerOrTopUp("ExhaustedWallet", 1, "paid");
      const key = record.key;

      // First call consumes the 1 remaining credit
      const res1 = await app.request("/api/v1/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({ id: "call-1", budget: 100 }),
      });
      assert.equal(res1.status, 200);

      // Second call attempts when 0 credits remain -> 402 Payment Required
      const res2 = await app.request("/api/v1/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({ id: "call-2", budget: 100 }),
      });
      assert.equal(res2.status, 402);
      const data2 = await res2.json();
      assert.match(data2.error, /Insufficient API credits/);
      assert.equal(data2.creditsRemaining, 0);
    });
  });
});
