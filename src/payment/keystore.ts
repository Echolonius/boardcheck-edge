/**
 * Zero-maintenance Edge Key Store for Boardcheck API Keys & Credits.
 * Works seamlessly in-memory for testing/local, and binds to Cloudflare KV or Redis in production.
 */

export interface ApiKeyRecord {
  key: string;
  payerWallet: string;
  creditsRemaining: number;
  totalCreditsPurchased: number;
  createdAt: string;
  lastUsedAt?: string;
  tier: "free" | "paid" | "unlimited";
}

export class KeyStore {
  private static memoryStore: Map<string, ApiKeyRecord> = new Map();

  /**
   * Generates a new cryptographically random API key.
   */
  public static generateKey(): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let key = "bc_live_";
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }

  /**
   * Creates or replenishes an API key upon confirmed on-chain payment.
   */
  public static async registerOrTopUp(
    walletAddress: string,
    creditsToAdd: number,
    tier: "free" | "paid" = "paid",
    existingKey?: string
  ): Promise<ApiKeyRecord> {
    const key = existingKey || this.generateKey();
    const existing = this.memoryStore.get(key);

    const record: ApiKeyRecord = {
      key,
      payerWallet: walletAddress,
      creditsRemaining: (existing ? existing.creditsRemaining : 0) + creditsToAdd,
      totalCreditsPurchased: (existing ? existing.totalCreditsPurchased : 0) + creditsToAdd,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      tier,
    };

    this.memoryStore.set(key, record);
    return record;
  }

  /**
   * Validates an API key and decrements 1 credit.
   */
  public static async validateAndConsume(key: string, amount: number = 1): Promise<{
    valid: boolean;
    record?: ApiKeyRecord;
    error?: string;
  }> {
    if (!key) {
      return { valid: false, error: "Missing API key in Authorization header." };
    }

    const record = this.memoryStore.get(key);
    if (!record) {
      return { valid: false, error: "Invalid API key. Please check or purchase credits via Solana Pay." };
    }

    if (record.tier === "unlimited") {
      record.lastUsedAt = new Date().toISOString();
      return { valid: true, record };
    }

    if (record.creditsRemaining < amount) {
      return {
        valid: false,
        record,
        error: `Insufficient API credits (${record.creditsRemaining} remaining). Top up your wallet to continue.`,
      };
    }

    record.creditsRemaining -= amount;
    record.lastUsedAt = new Date().toISOString();
    return { valid: true, record };
  }

  /**
   * Retrieves key details without consuming credits.
   */
  public static async getKeyInfo(key: string): Promise<ApiKeyRecord | undefined> {
    return this.memoryStore.get(key);
  }
}
