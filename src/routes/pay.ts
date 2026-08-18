import { Hono } from "hono";
import { SolanaPayVerifier, PAYMENT_TIERS } from "../payment/solana.js";
import { KeyStore } from "../payment/keystore.js";

export const payRouter = new Hono();
const verifier = new SolanaPayVerifier();

// List available pricing tiers
payRouter.get("/tiers", (c) => {
  return c.json({
    tiers: PAYMENT_TIERS,
    recipientWallet: process.env.RECIPIENT_WALLET || "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    network: process.env.SOLANA_NETWORK || "devnet",
  });
});

// Create a Solana Pay payment request
payRouter.post("/invoice", async (c) => {
  try {
    const body = await c.req.json();
    const tierId = body.tierId || "tier_starter";
    const reference = body.reference || undefined;

    const invoice = verifier.generateSolanaPayUrl(tierId, reference);
    return c.json(invoice);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// Verify transaction signature on-chain and issue API key
payRouter.post("/verify", async (c) => {
  try {
    const body = await c.req.json();
    const { signature, tierId, existingKey } = body;

    if (!signature) {
      return c.json({ error: "Transaction signature is required" }, 400);
    }

    const result = await verifier.verifyAndCreditTransaction(signature, tierId || "tier_starter", existingKey);

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }

    return c.json({
      success: true,
      apiKey: result.record?.key,
      creditsRemaining: result.record?.creditsRemaining,
      payerWallet: result.record?.payerWallet,
      tier: result.record?.tier,
      message: "Payment confirmed on Solana. API key is active immediately.",
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Issue a free trial key (100 credits for developers testing)
payRouter.post("/free-key", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const wallet = body.wallet || "anonymous_developer";
    const freeRecord = await KeyStore.registerOrTopUp(wallet, 100, "free");

    return c.json({
      success: true,
      apiKey: freeRecord.key,
      creditsRemaining: freeRecord.creditsRemaining,
      tier: "free",
      message: "Free trial key generated (100 credits).",
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
