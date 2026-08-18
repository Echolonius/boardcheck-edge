import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { SolanaPayVerifier, PAYMENT_TIERS, PaymentTier } from "../src/payment/solana.js";
import { KeyStore } from "../src/payment/keystore.js";
import app from "../src/index.js";

describe("Solana Pay On-Chain Verification & Monetization Suite", () => {
  const TEST_RECIPIENT = "3wbinZDnWmDxHMLtACNrskwZvRwg4KYbBWw1wuviXXHT";
  const TEST_PAYER = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
  const TEST_REF = "RefPubkey1111111111111111111111111111111111";

  describe("Tier Pricing & Catalog Structure", () => {
    it("defines the exact 3 production tiers with correct pricing and credit rations", () => {
      assert.equal(PAYMENT_TIERS.length, 3);

      const starter = PAYMENT_TIERS.find((t) => t.id === "tier_starter")!;
      assert.ok(starter, "tier_starter must exist");
      assert.equal(starter.name, "Starter Pack");
      assert.equal(starter.priceSol, 0.05);
      assert.equal(starter.credits, 5000);
      assert.equal(starter.credits / starter.priceSol, 100000); // 100k cr/SOL

      const fleet = PAYMENT_TIERS.find((t) => t.id === "tier_fleet")!;
      assert.ok(fleet, "tier_fleet must exist");
      assert.equal(fleet.name, "Agent Fleet");
      assert.equal(fleet.priceSol, 0.2);
      assert.equal(fleet.credits, 25000);
      assert.equal(fleet.credits / fleet.priceSol, 125000); // 125k cr/SOL

      const enterprise = PAYMENT_TIERS.find((t) => t.id === "tier_enterprise")!;
      assert.ok(enterprise, "tier_enterprise must exist");
      assert.equal(enterprise.name, "Autonomous High-Frequency");
      assert.equal(enterprise.priceSol, 0.75);
      assert.equal(enterprise.credits, 150000);
      assert.equal(enterprise.credits / enterprise.priceSol, 200000); // 200k cr/SOL
    });
  });

  describe("Solana Pay Invoice & URL Generation", () => {
    it("generates standard compliant Solana Pay URL for tier_starter", () => {
      const verifier = new SolanaPayVerifier(TEST_RECIPIENT);
      const invoice = verifier.generateSolanaPayUrl("tier_starter");

      assert.equal(invoice.recipient, TEST_RECIPIENT);
      assert.equal(invoice.tier.id, "tier_starter");
      assert.equal(invoice.tier.priceSol, 0.05);
      assert.equal(invoice.reference, undefined);

      assert.ok(invoice.url.startsWith(`solana:${TEST_RECIPIENT}?`));
      assert.ok(invoice.url.includes("amount=0.05"));
      assert.ok(invoice.url.includes("label=Boardcheck%20API%20Credits"));
      assert.ok(invoice.url.includes("message=Starter%20Pack"));
      assert.ok(!invoice.url.includes("reference="));
    });

    it("generates Solana Pay URL with custom reference public key", () => {
      const verifier = new SolanaPayVerifier(TEST_RECIPIENT);
      const invoice = verifier.generateSolanaPayUrl("tier_fleet", TEST_REF);

      assert.equal(invoice.tier.id, "tier_fleet");
      assert.equal(invoice.reference, TEST_REF);
      assert.ok(invoice.url.includes(`reference=${TEST_REF}`));
      assert.ok(invoice.url.includes("amount=0.2"));
      assert.ok(invoice.url.includes("message=Agent%20Fleet"));
    });

    it("falls back to tier_starter when an unknown tier ID is requested", () => {
      const verifier = new SolanaPayVerifier(TEST_RECIPIENT);
      const invoice = verifier.generateSolanaPayUrl("tier_non_existent");

      assert.equal(invoice.tier.id, "tier_starter");
      assert.equal(invoice.tier.priceSol, 0.05);
    });
  });

  describe("On-Chain Signature Verification & Error Handling", () => {
    it("handles confirmed transaction with balance transfer and credits API key", async () => {
      const verifier = new SolanaPayVerifier(TEST_RECIPIENT);

      // Mock the RPC connection getParsedTransaction
      (verifier as any).connection = {
        getParsedTransaction: async (_sig: string) => ({
          meta: {
            err: null,
            preBalances: [1000000000, 500000000],
            postBalances: [949000000, 550000000], // Recipient received 50,000,000 lamports (0.05 SOL)
          },
          transaction: {
            message: {
              accountKeys: [
                { pubkey: { toBase58: () => TEST_PAYER } },
                { pubkey: { toBase58: () => TEST_RECIPIENT } },
              ],
            },
          },
        }),
      };

      const result = await verifier.verifyAndCreditTransaction("mock_confirmed_signature_123", "tier_starter");
      assert.equal(result.success, true);
      assert.ok(result.record);
      assert.ok(result.record.key.startsWith("bc_live_"));
      assert.equal(result.record.payerWallet, TEST_PAYER);
      assert.equal(result.record.creditsRemaining, 5000);
      assert.equal(result.record.tier, "paid");
    });

    it("replenishes existing API key when existingApiKey is supplied", async () => {
      const verifier = new SolanaPayVerifier(TEST_RECIPIENT);

      // Create initial key with 500 credits
      const initialRecord = await KeyStore.registerOrTopUp(TEST_PAYER, 500, "paid");
      const existingKey = initialRecord.key;

      (verifier as any).connection = {
        getParsedTransaction: async () => ({
          meta: { err: null, preBalances: [1000000, 0], postBalances: [800000, 200000] },
          transaction: {
            message: {
              accountKeys: [TEST_PAYER, TEST_RECIPIENT],
            },
          },
        }),
      };

      // Top up with tier_fleet (25,000 credits)
      const topUpResult = await verifier.verifyAndCreditTransaction("mock_topup_sig_456", "tier_fleet", existingKey);
      assert.equal(topUpResult.success, true);
      assert.equal(topUpResult.record?.key, existingKey);
      assert.equal(topUpResult.record?.creditsRemaining, 25500); // 500 + 25000
      assert.equal(topUpResult.record?.totalCreditsPurchased, 25500);
    });

    it("returns error when transaction is not found on-chain", async () => {
      const verifier = new SolanaPayVerifier(TEST_RECIPIENT);
      (verifier as any).connection = {
        getParsedTransaction: async () => null,
      };

      const result = await verifier.verifyAndCreditTransaction("non_existent_signature_789", "tier_starter");
      assert.equal(result.success, false);
      assert.match(result.error || "", /Transaction not found on-chain/);
    });

    it("returns error when on-chain transaction status has err", async () => {
      const verifier = new SolanaPayVerifier(TEST_RECIPIENT);
      (verifier as any).connection = {
        getParsedTransaction: async () => ({
          meta: {
            err: { InstructionError: [0, "Custom"] },
          },
          transaction: {
            message: {
              accountKeys: [TEST_PAYER, TEST_RECIPIENT],
            },
          },
        }),
      };

      const result = await verifier.verifyAndCreditTransaction("failed_signature_error_tx", "tier_starter");
      assert.equal(result.success, false);
      assert.match(result.error || "", /Transaction failed on the Solana blockchain/);
    });

    it("catches and formats RPC connection exceptions safely", async () => {
      const verifier = new SolanaPayVerifier(TEST_RECIPIENT);
      (verifier as any).connection = {
        getParsedTransaction: async () => {
          throw new Error("RPC rate limit reached (HTTP 429)");
        },
      };

      const result = await verifier.verifyAndCreditTransaction("error_triggering_sig", "tier_starter");
      assert.equal(result.success, false);
      assert.match(result.error || "", /Verification error: RPC rate limit reached/);
    });
  });

  describe("KeyStore Quota & Credit Management", () => {
    it("enforces key length and format (bc_live_ + 32 alphanumeric chars)", () => {
      const key = KeyStore.generateKey();
      assert.ok(key.startsWith("bc_live_"));
      assert.equal(key.length, 40); // 8 prefix + 32 random
      assert.match(key, /^bc_live_[a-zA-Z0-9]{32}$/);
    });

    it("handles multi-credit consumption and accurately updates lastUsedAt", async () => {
      const record = await KeyStore.registerOrTopUp("WalletUserA", 20, "paid");
      const key = record.key;

      const firstUse = await KeyStore.validateAndConsume(key, 5);
      assert.equal(firstUse.valid, true);
      assert.equal(firstUse.record?.creditsRemaining, 15);
      assert.ok(firstUse.record?.lastUsedAt);

      const secondUse = await KeyStore.validateAndConsume(key, 10);
      assert.equal(secondUse.valid, true);
      assert.equal(secondUse.record?.creditsRemaining, 5);

      // Consume exact remaining balance
      const thirdUse = await KeyStore.validateAndConsume(key, 5);
      assert.equal(thirdUse.valid, true);
      assert.equal(thirdUse.record?.creditsRemaining, 0);

      // Attempt to consume 1 more credit
      const overdraft = await KeyStore.validateAndConsume(key, 1);
      assert.equal(overdraft.valid, false);
      assert.match(overdraft.error || "", /Insufficient API credits \(0 remaining\)/);
    });

    it("allows infinite calls for unlimited tier keys", async () => {
      const unlRecord = await KeyStore.registerOrTopUp("EnterpriseUnlimitedWallet", 0, "paid");
      unlRecord.tier = "unlimited";

      for (let i = 0; i < 20; i++) {
        const res = await KeyStore.validateAndConsume(unlRecord.key, 100);
        assert.equal(res.valid, true);
        assert.equal(res.record?.tier, "unlimited");
      }
    });

    it("returns appropriate validation errors for missing or invalid keys", async () => {
      const emptyRes = await KeyStore.validateAndConsume("", 1);
      assert.equal(emptyRes.valid, false);
      assert.match(emptyRes.error || "", /Missing API key/);

      const invalidRes = await KeyStore.validateAndConsume("bc_live_fake_non_existent_key", 1);
      assert.equal(invalidRes.valid, false);
      assert.match(invalidRes.error || "", /Invalid API key/);
    });

    it("getKeyInfo returns undefined for non-existent keys and full metadata for valid keys", async () => {
      const notFound = await KeyStore.getKeyInfo("bc_live_unknown_123");
      assert.equal(notFound, undefined);

      const rec = await KeyStore.registerOrTopUp("InfoWallet", 150, "paid");
      const found = await KeyStore.getKeyInfo(rec.key);
      assert.ok(found);
      assert.equal(found?.payerWallet, "InfoWallet");
      assert.equal(found?.creditsRemaining, 150);
      assert.equal(found?.tier, "paid");
    });
  });

  describe("Solana Pay REST API Endpoints", () => {
    it("GET /api/v1/pay/tiers returns pricing metadata and default recipient", async () => {
      const res = await app.request("/api/v1/pay/tiers");
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data.tiers));
      assert.equal(data.tiers.length, 3);
      assert.ok(data.recipientWallet);
      assert.ok(data.network);
    });

    it("POST /api/v1/pay/invoice handles all tier IDs and references", async () => {
      for (const tier of PAYMENT_TIERS) {
        const res = await app.request("/api/v1/pay/invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tierId: tier.id, reference: "RefKey123" }),
        });
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.tier.id, tier.id);
        assert.equal(data.tier.priceSol, tier.priceSol);
        assert.ok(data.url.includes(`reference=RefKey123`));
      }
    });

    it("POST /api/v1/pay/verify rejects requests missing transaction signature", async () => {
      const res = await app.request("/api/v1/pay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId: "tier_starter" }),
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.match(data.error, /Transaction signature is required/);
    });

    it("POST /api/v1/pay/free-key issues free sandbox key with 100 credits", async () => {
      const res = await app.request("/api/v1/pay/free-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: "agent_tester_wallet" }),
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.apiKey.startsWith("bc_live_"));
      assert.equal(data.creditsRemaining, 100);
      assert.equal(data.tier, "free");

      // Verify key information via GET /api/v1/key/info
      const infoRes = await app.request("/api/v1/key/info", {
        headers: { Authorization: `Bearer ${data.apiKey}` },
      });
      assert.equal(infoRes.status, 200);
      const infoData = await infoRes.json();
      assert.equal(infoData.creditsRemaining, 100);
      assert.equal(infoData.payerWallet, "agent_tester_wallet");
      assert.equal(infoData.tier, "free");
    });

    it("GET /api/v1/key/info enforces Bearer token authentication", async () => {
      const unauthRes = await app.request("/api/v1/key/info");
      assert.equal(unauthRes.status, 400);

      const notFoundRes = await app.request("/api/v1/key/info", {
        headers: { Authorization: "Bearer bc_live_nonexistent1234567890" },
      });
      assert.equal(notFoundRes.status, 404);
    });
  });
});
