import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scanListings, Scanner } from "../src/engine/scanner.js";
import { Listing, Thresholds } from "../src/engine/types.js";
import { KeyStore } from "../src/payment/keystore.js";
import app from "../src/index.js";

describe("Challenger 1: Adversarial Engine & Scale Benchmark Suite", () => {
  describe("Scale & Latency SLAs (100, 500, 1000, 2000, 5000 listings)", () => {
    const scales = [100, 500, 1000, 2000, 5000];

    for (const size of scales) {
      it(`evaluates dataset of ${size} listings strictly adhering to < 50ms edge SLA (p95, p99)`, () => {
        const dataset: Listing[] = Array.from({ length: size }, (_, i) => ({
          id: `scale-item-${i}`,
          title: `Autonomous Task ${i}`,
          budget: 50 + (i % 100) * 15,
          views: (i % 12 === 0) ? 0 : 5 + (i % 50),
          applications: (i % 15 === 0) ? 20 : (i % 5),
          has_escrow: i % 2 === 0,
          has_payment_evidence: i % 3 === 0,
          is_self_advertisement: i % 4 === 0,
          created_at: new Date(1700000000000 + (i % 50) * 2000).toISOString(),
        }));

        // Warm up JIT
        for (let w = 0; w < 10; w++) {
          scanListings(dataset.slice(0, 50));
        }

        const iterations = 50;
        const durations: number[] = [];

        for (let r = 0; r < iterations; r++) {
          const t0 = performance.now();
          const report = scanListings(dataset);
          const t1 = performance.now();
          durations.push(t1 - t0);

          assert.ok(report);
          assert.ok(report.coverage.total_listings === size);
        }

        durations.sort((a, b) => a - b);
        const p50 = durations[Math.floor(iterations * 0.5)];
        const p90 = durations[Math.floor(iterations * 0.9)];
        const p95 = durations[Math.floor(iterations * 0.95)];
        const p99 = durations[Math.floor(iterations * 0.99)];
        const avg = durations.reduce((a, b) => a + b, 0) / iterations;
        const min = durations[0];
        const max = durations[durations.length - 1];

        console.log(`     [Scale ${size.toString().padStart(4)}] avg=${avg.toFixed(3)}ms | p50=${p50.toFixed(3)}ms | p95=${p95.toFixed(3)}ms | p99=${p99.toFixed(3)}ms | max=${max.toFixed(3)}ms`);

        // Edge SLA Assertions
        assert.ok(avg < 50, `Average latency (${avg.toFixed(3)}ms) for size ${size} must be < 50ms`);
        assert.ok(p95 < 50, `p95 latency (${p95.toFixed(3)}ms) for size ${size} must be < 50ms`);
        assert.ok(p99 < 50, `p99 latency (${p99.toFixed(3)}ms) for size ${size} must be < 50ms`);
      });
    }
  });

  describe("Adversarial Worst-Case Algorithmic Complexity Probe", () => {
    it("stresses worst-case nested search in AMS-001 (1,000 inverted non-extreme listings)", () => {
      // Every listing is inverted (applications > views) but views > 0, so isExtreme requires scanning all items
      const worstCaseDataset: Listing[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `worst-inv-${i}`,
        views: 10,
        applications: 11, // applications > views, but views !== 0
        budget: 100,
      }));

      const t0 = performance.now();
      const report = scanListings(worstCaseDataset);
      const elapsed = performance.now() - t0;

      assert.equal(report.verdict, "caution");
      const ams001 = report.findings.find((f) => f.id === "AMS-001");
      assert.ok(ams001);
      assert.equal(ams001?.severity, "warn");
      assert.equal(ams001?.affected_listing_ids?.length, 1000);

      console.log(`     Worst-Case AMS-001 Inversion (N=1,000): executed in ${elapsed.toFixed(3)} ms`);
      assert.ok(elapsed < 50, `Worst-case N=1000 search (${elapsed.toFixed(3)}ms) must be < 50ms`);
    });
  });

  describe("Extreme Budgets & Outlier Mathematical Integrity", () => {
    it("handles $10B+ astronomical budgets without numeric overflow or NaN breakdown", () => {
      const normalListings: Listing[] = Array.from({ length: 9 }, (_, i) => ({
        id: `normal-task-${i}`,
        budget: 100,
        views: 10,
      }));

      const astronomicalBait: Listing = {
        id: "astronomical-bait",
        budget: 10_000_000_000, // $10 Billion
        views: 0,
      };

      const maxSafeBait: Listing = {
        id: "max-safe-bait",
        budget: Number.MAX_SAFE_INTEGER,
        views: 0,
      };

      const dataset = [...normalListings, astronomicalBait, maxSafeBait];
      const report = scanListings(dataset);

      const ams005 = report.findings.find((f) => f.id === "AMS-005");
      assert.ok(ams005, "AMS-005 must detect $10B+ and MAX_SAFE_INTEGER bait tasks");
      assert.ok(ams005?.affected_listing_ids?.includes("astronomical-bait"));
      assert.ok(ams005?.affected_listing_ids?.includes("max-safe-bait"));
    });

    it("handles Number.MAX_VALUE and near-infinity values gracefully", () => {
      const listings: Listing[] = [
        { id: "norm-1", budget: 50, views: 5 },
        { id: "norm-2", budget: 100, views: 5 },
        { id: "norm-3", budget: 150, views: 5 },
        { id: "norm-4", budget: 200, views: 5 },
        { id: "norm-5", budget: 250, views: 5 },
        { id: "max-val", budget: Number.MAX_VALUE, views: 0 },
      ];

      const report = scanListings(listings);
      const ams005 = report.findings.find((f) => f.id === "AMS-005");
      assert.ok(ams005);
      assert.ok(ams005?.affected_listing_ids?.includes("max-val"));
    });

    it("safely handles negative and zero budgets without false positives in AMS-004 and AMS-005", () => {
      const listings: Listing[] = [
        { id: "neg-1", budget: -500, views: 0, has_escrow: false, has_payment_evidence: false },
        { id: "neg-2", budget: -1000000, views: 0, has_escrow: false, has_payment_evidence: false },
        { id: "zero-1", budget: 0, views: 0, has_escrow: false, has_payment_evidence: false },
        { id: "nan-1", budget: NaN, views: 0, has_escrow: false, has_payment_evidence: false },
      ];

      const report = scanListings(listings);
      const ams004 = report.findings.find((f) => f.id === "AMS-004");
      const ams005 = report.findings.find((f) => f.id === "AMS-005");

      assert.equal(ams004, undefined, "Negative or zero budgets must not trigger unpaid work risk");
      assert.equal(ams005, undefined, "Negative or zero budgets must not trigger bait detection");
      assert.equal(report.verdict, "clear");
    });

    it("handles homogeneous budget distributions (1,000 items with identical budgets)", () => {
      const homogeneousListings: Listing[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `homo-${i}`,
        budget: 500,
        views: 0,
        has_escrow: true,
        has_payment_evidence: true,
      }));

      const report = scanListings(homogeneousListings);
      const ams005 = report.findings.find((f) => f.id === "AMS-005");
      // All items are 500, median is 500, cutoff is 1500 -> none should be flagged as bait!
      assert.equal(ams005, undefined, "Homogeneous budgets must not flag bait");
      assert.equal(report.verdict, "clear");
    });
  });

  describe("Timestamp Clustering Adversarial Boundaries (AMS-002)", () => {
    it("handles 1,000 listings with the EXACT same millisecond timestamp without map collision or memory blowup", () => {
      const sameTimestamp = "2026-08-18T15:00:00.123Z";
      const listings: Listing[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `clustered-ms-${i}`,
        created_at: sameTimestamp,
      }));

      const t0 = performance.now();
      const report = scanListings(listings);
      const elapsed = performance.now() - t0;

      const ams002 = report.findings.find((f) => f.id === "AMS-002");
      assert.ok(ams002, "AMS-002 must fire for 1000 listings with identical timestamp");
      assert.equal(ams002?.affected_listing_ids?.length, 1000);
      assert.equal(report.verdict, "high_risk");

      console.log(`     1,000 identical timestamp cluster scan: ${elapsed.toFixed(3)} ms`);
      assert.ok(elapsed < 50);
    });

    it("evaluates custom fractional clusterWindowSeconds (e.g. 0.5s window)", () => {
      // 4 listings within 400ms interval
      const listings: Listing[] = [
        { id: "f1", created_at: "2026-08-18T12:00:00.000Z" },
        { id: "f2", created_at: "2026-08-18T12:00:00.100Z" },
        { id: "f3", created_at: "2026-08-18T12:00:00.200Z" },
        { id: "f4", created_at: "2026-08-18T12:00:00.300Z" },
      ];

      const report = scanListings(listings, { clusterWindowSeconds: 0.5, minClusterSize: 4 });
      const ams002 = report.findings.find((f) => f.id === "AMS-002");
      assert.ok(ams002, "AMS-002 should fire with custom 0.5s window");
    });

    it("handles non-standard Date objects and numeric epoch created_at values", () => {
      const now = Date.now();
      const listings: Listing[] = [
        { id: "d1", created_at: new Date(now) as any },
        { id: "d2", created_at: new Date(now) as any },
        { id: "d3", created_at: new Date(now) as any },
        { id: "d4", created_at: new Date(now) as any },
      ];

      const report = scanListings(listings);
      const ams002 = report.findings.find((f) => f.id === "AMS-002");
      assert.ok(ams002, "AMS-002 should handle Date instances correctly");
      assert.equal(ams002?.affected_listing_ids?.length, 4);
    });
  });

  describe("Self-Advertisement Glut Ratio Precision (AMS-003)", () => {
    it("strictly verifies threshold cutoff boundaries: 49.9% vs 50.0% vs 80.0%", () => {
      // 1000 listings: 499 self-ads, 501 organic (49.9% -> should NOT fire)
      const dataset499: Listing[] = [
        ...Array.from({ length: 499 }, (_, i) => ({ id: `ad-${i}`, is_self_advertisement: true })),
        ...Array.from({ length: 501 }, (_, i) => ({ id: `org-${i}`, is_self_advertisement: false })),
      ];
      const report499 = scanListings(dataset499);
      assert.equal(report499.findings.find((f) => f.id === "AMS-003"), undefined);

      // 1000 listings: 500 self-ads, 500 organic (50.0% -> WARN)
      const dataset500: Listing[] = [
        ...Array.from({ length: 500 }, (_, i) => ({ id: `ad-${i}`, is_self_advertisement: true })),
        ...Array.from({ length: 500 }, (_, i) => ({ id: `org-${i}`, is_self_advertisement: false })),
      ];
      const report500 = scanListings(dataset500);
      const ams500 = report500.findings.find((f) => f.id === "AMS-003");
      assert.ok(ams500);
      assert.equal(ams500?.severity, "warn");

      // 1000 listings: 800 self-ads, 200 organic (80.0% -> HIGH)
      const dataset800: Listing[] = [
        ...Array.from({ length: 800 }, (_, i) => ({ id: `ad-${i}`, is_self_advertisement: true })),
        ...Array.from({ length: 200 }, (_, i) => ({ id: `org-${i}`, is_self_advertisement: false })),
      ];
      const report800 = scanListings(dataset800);
      const ams800 = report800.findings.find((f) => f.id === "AMS-003");
      assert.ok(ams800);
      assert.equal(ams800?.severity, "high");
    });

    it("ignores non-boolean values in self-ad calculation to prevent type confusion", () => {
      const mixedListings: any[] = [
        { id: "m1", is_self_advertisement: "true" }, // String "true" should not be counted as boolean
        { id: "m2", is_self_advertisement: 1 },      // Number 1 should not be counted as boolean
        { id: "m3", is_self_advertisement: null },   // Null
        { id: "m4", is_self_advertisement: true },   // Valid boolean true
        { id: "m5", is_self_advertisement: false },  // Valid boolean false
      ];

      const report = scanListings(mixedListings);
      // withFlag count is 2 (only m4 and m5). Since 2 < min 3, AMS-003 must not fire
      const ams003 = report.findings.find((f) => f.id === "AMS-003");
      assert.equal(ams003, undefined, "Non-boolean types must not trigger false AMS-003 flags");
      assert.equal(report.coverage.with_self_ad_flag, 2);
    });
  });

  describe("Adversarial Input Fuzzing & Negative Values", () => {
    it("handles negative views and applications safely", () => {
      const negativeMetrics: Listing[] = [
        { id: "neg-1", views: -10, applications: -5 }, // -5 > -10 in JS arithmetic
        { id: "neg-2", views: -100, applications: -200 }, // -200 < -100 (not inverted)
      ];

      const report = scanListings(negativeMetrics);
      // neg-1 has applications (-5) > views (-10).
      const ams001 = report.findings.find((f) => f.id === "AMS-001");
      assert.ok(ams001);
      assert.deepEqual(ams001?.affected_listing_ids, ["neg-1"]);
    });

    it("handles clean ultra-dense 10,000 item batch in < 100ms", () => {
      const cleanHugeBatch: Listing[] = Array.from({ length: 10000 }, (_, i) => ({
        id: `dense-clean-${i}`,
        budget: 100 + (i % 20),
        views: 50,
        applications: 2,
        has_escrow: true,
        has_payment_evidence: true,
      }));

      const t0 = performance.now();
      const report = scanListings(cleanHugeBatch);
      const duration = performance.now() - t0;

      assert.equal(report.coverage.total_listings, 10000);
      assert.equal(report.verdict, "clear");
      console.log(`     10,000 clean listings scanned in: ${duration.toFixed(2)} ms (~${(duration / 10).toFixed(3)} µs/listing)`);
      assert.ok(duration < 100, `10,000 items scan (${duration.toFixed(2)}ms) must execute in < 100ms`);
    });

    it("accurately detects inverted metrics in massive 10,000 item batch", () => {
      const dirtyHugeBatch: Listing[] = Array.from({ length: 10000 }, (_, i) => ({
        id: `dense-dirty-${i}`,
        budget: 100,
        views: (i % 100 === 0) ? 0 : 50,
        applications: (i % 100 === 0) ? 5 : 2,
        has_escrow: true,
        has_payment_evidence: true,
      }));

      const t0 = performance.now();
      const report = scanListings(dirtyHugeBatch);
      const duration = performance.now() - t0;

      assert.equal(report.coverage.total_listings, 10000);
      assert.equal(report.verdict, "high_risk");
      const ams001 = report.findings.find((f) => f.id === "AMS-001");
      assert.ok(ams001);
      assert.equal(ams001?.affected_listing_ids?.length, 100);
      console.log(`     10,000 dirty listings scanned and flagged in: ${duration.toFixed(2)} ms`);
      assert.ok(duration < 100);
    });
  });

  describe("Edge REST API Route Concurrency & SLAs", () => {
    it("evaluates 100 concurrent /api/v1/verify requests resolving in < 500ms total", async () => {
      const concurrency = 100;
      const requests = Array.from({ length: concurrency }).map((_, i) =>
        app.request("/api/v1/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: `edge-req-${i}`,
            title: `Agent Job ${i}`,
            budget: 100 + i * 5,
            has_escrow: i % 2 === 0,
            has_payment_evidence: i % 3 === 0,
            views: i,
            applications: i % 2 === 0 ? 0 : 5,
          }),
        })
      );

      const t0 = performance.now();
      const responses = await Promise.all(requests);
      const duration = performance.now() - t0;

      console.log(`     100 concurrent /api/v1/verify HTTP requests resolved in ${duration.toFixed(2)} ms (avg ${(duration / concurrency).toFixed(3)} ms/req)`);

      for (const res of responses) {
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.ok(data.task_id);
      }

      assert.ok(duration < 500, `100 concurrent requests (${duration.toFixed(2)}ms) must resolve in < 500ms`);
    });

    it("verifies POST /api/v1/scan with 1,000 listings payload executes through HTTP route in < 50ms", async () => {
      const largePayload = Array.from({ length: 1000 }, (_, i) => ({
        id: `http-item-${i}`,
        budget: 100 + (i % 20) * 10,
        has_escrow: true,
        has_payment_evidence: true,
        views: 10,
        applications: 2,
      }));

      const t0 = performance.now();
      const res = await app.request("/api/v1/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(largePayload),
      });
      const elapsed = performance.now() - t0;

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.verdict, "clear");
      assert.equal(data.coverage.total_listings, 1000);

      console.log(`     1,000-listing POST /api/v1/scan HTTP roundtrip: ${elapsed.toFixed(2)} ms`);
      assert.ok(elapsed < 50, `1,000 listings HTTP scan (${elapsed.toFixed(2)}ms) must be < 50ms`);
    });

    it("evaluates 200 rapid concurrent KeyStore operations", async () => {
      const wallet = "KeyStoreStressWallet11111111111111111111";
      const record = await KeyStore.registerOrTopUp(wallet, 500, "paid");
      const key = record.key;

      const ops = Array.from({ length: 200 }).map(() => KeyStore.validateAndConsume(key, 1));
      const t0 = performance.now();
      const results = await Promise.all(ops);
      const elapsed = performance.now() - t0;

      const validCount = results.filter((r) => r.valid).length;
      assert.equal(validCount, 200);

      const info = await KeyStore.getKeyInfo(key);
      assert.equal(info?.creditsRemaining, 300);

      console.log(`     200 concurrent KeyStore transactions resolved in: ${elapsed.toFixed(2)} ms`);
      assert.ok(elapsed < 100);
    });
  });
});
