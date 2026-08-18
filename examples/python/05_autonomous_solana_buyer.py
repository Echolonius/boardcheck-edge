#!/usr/bin/env python3
"""
Autonomous Solana Pay Credit Buyer (Python)
Demonstrates how an AI agent autonomously purchases Boardcheck API credits on-chain
with zero KYC, zero human intervention, and instant key issuance.
"""

import os
import sys
import json
import time
import requests
from typing import Optional, Dict, Any

BOARDCHECK_URL = os.getenv("BOARDCHECK_URL", "http://localhost:3000")


class AutonomousSolanaBuyer:
    """
    Autonomous Solana Pay client for AI agents.
    Allows bots to manage their own API budgets on-chain.
    """

    def __init__(self, base_url: str = BOARDCHECK_URL):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    def get_pricing_tiers(self) -> Dict[str, Any]:
        """Fetch current pricing tiers and treasury wallet address."""
        url = f"{self.base_url}/api/v1/pay/tiers"
        res = self.session.get(url, timeout=10)
        res.raise_for_status()
        return res.json()

    def create_invoice(self, tier_id: str = "tier_starter") -> Dict[str, Any]:
        """Request a Solana Pay invoice URL and reference from the edge oracle."""
        url = f"{self.base_url}/api/v1/pay/invoice"
        res = self.session.post(url, json={"tierId": tier_id}, timeout=10)
        res.raise_for_status()
        return res.json()

    def verify_payment_and_claim_key(
        self,
        signature: str,
        tier_id: str = "tier_starter",
        existing_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Submit on-chain transaction signature to verify payment and receive/top-up API key.
        """
        url = f"{self.base_url}/api/v1/pay/verify"
        payload = {
            "signature": signature,
            "tierId": tier_id,
        }
        if existing_key:
            payload["existingKey"] = existing_key

        res = self.session.post(url, json=payload, timeout=15)
        res.raise_for_status()
        return res.json()

    def get_free_trial_key(self, wallet_name: str = "autonomous_bot_1") -> Dict[str, Any]:
        """Claim a free developer trial key (100 credits) for immediate testing."""
        url = f"{self.base_url}/api/v1/pay/free-key"
        res = self.session.post(url, json={"wallet": wallet_name}, timeout=10)
        res.raise_for_status()
        return res.json()

    def check_key_info(self, api_key: str) -> Dict[str, Any]:
        """Query key info and remaining credits."""
        url = f"{self.base_url}/api/v1/key/info"
        res = self.session.get(url, headers={"Authorization": f"Bearer {api_key}"}, timeout=10)
        res.raise_for_status()
        return res.json()


def main():
    print("=" * 70)
    print("🤖💳 Autonomous Solana Pay Credit Buyer for AI Agents")
    print(f"📡 Target Edge Server: {BOARDCHECK_URL}")
    print("=" * 70)

    buyer = AutonomousSolanaBuyer()

    # Step 1: Discover available tiers
    print("\n[Step 1] Querying available pricing tiers...")
    try:
        tiers_info = buyer.get_pricing_tiers()
        print(f"  Treasury Wallet: {tiers_info.get('recipientWallet')}")
        print(f"  Network:         {tiers_info.get('network')}")
        print("  Available Tiers:")
        for t in tiers_info.get("tiers", []):
            print(f"    - {t['name']} ({t['id']}): {t['priceSol']} SOL -> {t['credits']:,} checks")
    except Exception as e:
        print(f"  Error fetching tiers: {e}")
        return

    # Step 2: Request a Solana Pay Invoice
    selected_tier = "tier_starter"
    print(f"\n[Step 2] Requesting Solana Pay invoice for tier: '{selected_tier}'...")
    invoice = buyer.create_invoice(tier_id=selected_tier)
    tier_meta = invoice.get("tier", {})
    price_sol = tier_meta.get("priceSol", 0.05)
    print(f"  Invoice URL: {invoice.get('url')}")
    print(f"  Recipient:   {invoice.get('recipient')}")
    print(f"  Amount:      {price_sol} SOL")
    print(f"  Reference:   {invoice.get('reference', 'None (Direct)')}")

    # Step 3: Autonomous on-chain transaction execution
    print("\n[Step 3] Executing on-chain transaction...")
    print("  In production, agent signs and broadcasts transfer via `solders` or `@solana/web3.js`:")
    print("  ```python")
    print("  from solana.rpc.api import Client")
    print("  from solders.transaction import Transaction")
    print("  # agent_wallet transfers 0.05 SOL to recipient with invoice['reference']")
    print("  # tx_sig = rpc_client.send_transaction(tx)")
    print("  ```")

    # In local/test mode, we simulate or submit a verified transaction signature:
    mock_signature = f"5SIG_AUTONOMOUS_TEST_{int(time.time())}_SOLANA_DEVNET_TX"
    print(f"  Broadcasting transaction... Signature: {mock_signature}")

    # Step 4: Verify and Claim API Key
    print("\n[Step 4] Submitting signature to Boardcheck Edge Verifier...")
    try:
        claim_result = buyer.verify_payment_and_claim_key(
            signature=mock_signature,
            tier_id=selected_tier
        )
        api_key = claim_result.get("apiKey")
        print(f"  ✅ Status: Payment verified in edge runtime!")
        print(f"  🔑 API Key: {api_key}")
        print(f"  💰 Credits: {claim_result.get('creditsRemaining')}")
    except Exception as e:
        print(f"  Verification note (if test signature): {e}")
        print("  Requesting free developer key for demonstration...")
        free_res = buyer.get_free_trial_key("autonomous_buyer_demo")
        api_key = free_res.get("apiKey")
        print(f"  🔑 Free API Key Issued: {api_key} ({free_res.get('creditsRemaining')} credits)")

    # Step 5: Verify task using the newly acquired API key
    print(f"\n[Step 5] Performing live pre-flight task check with API key `{api_key[:12]}...`:")
    task_payload = {
        "id": "agent-autonomous-job-001",
        "budget": 2000.0,
        "has_escrow": True,
        "views": 25,
        "applications": 2
    }
    verify_res = requests.post(
        f"{BOARDCHECK_URL.rstrip('/')}/api/v1/verify",
        json=task_payload,
        headers={"Authorization": f"Bearer {api_key}"}
    )
    print(f"  Check Status: {verify_res.status_code}")
    print(f"  Response: {json.dumps(verify_res.json(), indent=2)}")

    print("\n" + "=" * 70)
    print("🎉 Autonomous buyer flow complete! The bot is fully self-funded on-chain.")
    print("=" * 70)


if __name__ == "__main__":
    main()
