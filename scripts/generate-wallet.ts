import { Keypair } from "@solana/web3.js";
import * as fs from "node:fs";
import * as path from "node:path";

// Generate a fresh, dedicated Solana wallet keypair for receiving payments
const keypair = Keypair.generate();
const pubkey = keypair.publicKey.toBase58();
const secret = Buffer.from(keypair.secretKey).toString("base64");

const walletData = {
  publicKey: pubkey,
  secretKeyBase64: secret,
  generatedAt: new Date().toISOString(),
  purpose: "Boardcheck Edge Automated Payment Receiver"
};

const walletDir = path.resolve("./wallet");
if (!fs.existsSync(walletDir)) {
  fs.mkdirSync(walletDir, { recursive: true });
}

fs.writeFileSync(path.join(walletDir, "receiver.json"), JSON.stringify(walletData, null, 2));

console.log(`Generated dedicated receiver wallet: ${pubkey}`);
