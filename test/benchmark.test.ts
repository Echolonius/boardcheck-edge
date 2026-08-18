import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scanListings, Scanner } from "../src/engine/scanner.js";
import { Listing } from "../src/engine/types.js";
import { KeyStore } from "../src/payment/keystore.js";
import app from "../src/index.js";

describe("Boardcheck Edge Latency & Concurrency Benchmark Suite", () => {
  it("verifies 1,000 single-task checks execute in < 50ms (p50, p95, p99 < 50ms, average < 10ms)", () => {
    const iterations = 1000;
    const latencies: number[] = [];

    const sampleTask: Listing = {
      id: "bench-task-sample",
      budget: 1500,
      has_escrow: false,
      has_payment_evidence: false,
      views: 0,
      applications: 10,
      created_at: new Date().toISOString(),
    };

    // Warm-up JIT
    for (let i = 0; i < 50; i++) {
      scanListings([sampleTask]);
    }

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      scanListings([sampleTask]);
      const duration = performance.now() - start;
      latencies.push(duration);
    }

    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(iterations * 0.5)];
    const p90 = latencies[Math.floor(iterations * 0.9)];
    const p95 = latencies[Math.floor(iterations * 0.95)];
    const p99 = latencies[Math.floor(iterations * 0.99)];
    const min = latencies[0];
    const max = latencies[latencies.length - 1];
    const avg = latencies.reduce((a, b) => a + b, 0) / iterations;
    const throughput = Math.floor(1000 / (avg || 0.001));

    console.log(`\n  ======================================================`);
    console.log(`  ⚡ BOARDCHECK EDGE LATENCY BENCHMARK (1,000 SCANS)`);
    console.log(`  ======================================================`);
    console.log(`     Iterations:    ${iterations.toLocaleString()}`);
    console.log(`     Min Latency:   ${min.toFixed(4)} ms`);
    console.log(`     Average:       ${avg.toFixed(4)} ms`);
    console.log(`     p50 (Median):  ${p50.toFixed(4)} ms`);
    console.log(`     p90:           ${p90.toFixed(4)} ms`);
    console.log(`     p95:           ${p95.toFixed(4)} ms`);
    console.log(`     p99:           ${p99.toFixed(4)} ms`);
    console.log(`     Max Latency:   ${max.toFixed(4)} ms`);
    console.log(`     Throughput:    ~${throughput.toLocaleString()} checks/sec`);
    console.log(`  ======================================================\n`);

    // Strict SLA assertions
    assert.ok(avg < 10, `Average latency (${avg.toFixed(4)}ms) must be strictly < 10ms`);
    assert.ok(p50 < 50, `p50 latency (${p50.toFixed(4)}ms) must be < 50ms`);
    assert.ok(p95 < 50, `p95 latency (${p95.toFixed(4)}ms) must be < 50ms`);
    assert.ok(p99 < 50, `p99 latency (${p99.toFixed(4)}ms) must be < 50ms`);
  });

  it("benchmarks batch scanning across varied dataset scales (10, 50, 100 listings)", () => {
    const scales = [10, 50, 100];

    for (const count of scales) {
      const batch: Listing[] = Array.from({ length: count }, (_, i) => ({
        id: `batch-item-${i}`,
        budget: 50 + (i % 20) * 10,
        views: i * 5,
        applications: i,
        has_escrow: i % 2 === 0,
        has_payment_evidence: i % 3 === 0,
        created_at: new Date(Date.now() - i * 1000).toISOString(),
      }));

      const runs = 100;
      const batchLatencies: number[] = [];

      for (let r = 0; r < runs; r++) {
        const start = performance.now();
        scanListings(batch);
        batchLatencies.push(performance.now() - start);
      }

      batchLatencies.sort((a, b) => a - b);
      const avg = batchLatencies.reduce((a, b) => a + b, 0) / runs;
      const p99 = batchLatencies[Math.floor(runs * 0.99)];
      const perTask = avg / count;

      console.log(`     Batch size ${count}: avg=${avg.toFixed(4)}ms (per task=${perTask.toFixed(4)}ms), p99=${p99.toFixed(4)}ms`);
      assert.ok(avg < 25, `Batch of ${count} must execute in < 25ms average`);
      assert.ok(p99 < 50, `Batch of ${count} p99 must be < 50ms`);
    }
  });

  it("verifies 50 concurrent HTTP requests resolve in < 500ms", async () => {
    const concurrency = 50;
    const requests = Array.from({ length: concurrency }).map((_, i) =>
      app.request("/api/v1/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `concurrent-req-${i}`,
          budget: 200 + i * 10,
          has_escrow: i % 2 === 0,
          has_payment_evidence: i % 2 === 0,
          views: 10 + i,
          applications: i % 3 === 0 ? 15 + i : 2,
        }),
      })
    );

    const start = performance.now();
    const responses = await Promise.all(requests);
    const totalTime = performance.now() - start;

    console.log(`     50 concurrent /api/v1/verify HTTP requests resolved in ${totalTime.toFixed(2)} ms`);

    for (const res of responses) {
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.task_id);
      assert.ok(typeof data.is_safe_to_execute === "boolean");
    }

    assert.ok(totalTime < 500, `50 concurrent requests (${totalTime.toFixed(2)}ms) must resolve in < 500ms`);
  });

  it("verifies high-throughput concurrent batch scan endpoint under burst load", async () => {
    const burstCount = 20;
    const batchPayload = [
      { id: "burst-1", budget: 100, views: 50, applications: 2, has_escrow: true, has_payment_evidence: true },
      { id: "burst-2", budget: 200, views: 0, applications: 10, has_escrow: false, has_payment_evidence: false },
      { id: "burst-3", budget: 5000, views: 0, has_escrow: false, has_payment_evidence: false },
    ];

    const start = performance.now();
    const requests = Array.from({ length: burstCount }).map(() =>
      app.request("/api/v1/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batchPayload),
      })
    );

    const responses = await Promise.all(requests);
    const duration = performance.now() - start;

    console.log(`     ${burstCount} concurrent /api/v1/scan requests resolved in ${duration.toFixed(2)} ms`);

    for (const res of responses) {
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.verdict, "high_risk");
      assert.ok(data.findings.length >= 2);
    }

    assert.ok(duration < 500, `Burst batch requests (${duration.toFixed(2)}ms) must complete in < 500ms`);
  });

  it("benchmarks KeyStore memory operations under 1,000 credit validations", async () => {
    const wallet = "BenchWallet111111111111111111111111111111111";
    const record = await KeyStore.registerOrTopUp(wallet, 2000, "paid");
    const key = record.key;

    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      const res = await KeyStore.validateAndConsume(key, 1);
      assert.ok(res.valid);
    }
    const elapsed = performance.now() - start;
    const avgOpTime = elapsed / 1000;

    console.log(`     1,000 KeyStore credit validation ops: total=${elapsed.toFixed(2)}ms (avg=${(avgOpTime * 1000).toFixed(2)} µs/op)`);
    assert.ok(elapsed < 100, `1,000 KeyStore validations must execute in < 100ms total`);
  });
});
