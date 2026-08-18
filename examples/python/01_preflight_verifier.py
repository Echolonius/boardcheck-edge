#!/usr/bin/env python3
"""
Boardcheck Pre-Flight Task Verification Client (Python)
Evaluates marketplace tasks against AMS-001..005 before committing LLM compute or agent labor.
"""

import os
import sys
import json
from typing import Dict, Any, List, Optional
import requests

BOARDCHECK_URL = os.getenv("BOARDCHECK_URL", "http://localhost:3000")
API_KEY = os.getenv("BOARDCHECK_KEY", "bc_live_FREE_KEY")


class BoardcheckClient:
    """Lightweight Python client for Boardcheck Edge Anti-Fraud Oracle."""

    def __init__(self, base_url: str = BOARDCHECK_URL, api_key: str = API_KEY):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        })

    def verify_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verify a single task before starting work.
        Returns safety verdict, risk findings, and advisory.
        """
        url = f"{self.base_url}/api/v1/verify"
        try:
            res = self.session.post(url, json=task, timeout=10)
            res.raise_for_status()
            return res.json()
        except requests.exceptions.RequestException as e:
            return {
                "task_id": task.get("id", "unknown"),
                "verdict": "error",
                "is_safe_to_execute": False,
                "advisory": f"Network/Service error checking task: {str(e)}",
                "findings": []
            }

    def scan_listings(self, listings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Scan a batch of listings to detect platform manipulation and sybil clusters.
        """
        url = f"{self.base_url}/api/v1/scan"
        try:
            res = self.session.post(url, json={"listings": listings}, timeout=10)
            res.raise_for_status()
            return res.json()
        except requests.exceptions.RequestException as e:
            return {
                "verdict": "error",
                "error": str(e)
            }


def main():
    print("=" * 70)
    print("🛡️  Boardcheck Edge — Python Pre-Flight Task Verifier")
    print(f"📡 Target Gateway: {BOARDCHECK_URL}")
    print("=" * 70)

    client = BoardcheckClient()

    # Test Scenarios:
    test_cases = [
        {
            "description": "Scenario 1: High-Risk Ghost Bounty (AMS-004 Unpaid Work & AMS-001 Inversion)",
            "payload": {
                "id": "bounty-scam-001",
                "title": "Build Web3 Solana Micro-DEX in 24 Hours",
                "budget": 3500.0,
                "has_escrow": False,
                "has_payment_evidence": False,
                "views": 0,
                "applications": 14
            }
        },
        {
            "description": "Scenario 2: High-Budget Bait Listing (AMS-005)",
            "payload": {
                "id": "bounty-bait-002",
                "title": "Custom Machine Learning Kernel Optimization",
                "budget": 50000.0,
                "has_escrow": True,
                "has_payment_evidence": True,
                "views": 0,
                "applications": 0
            }
        },
        {
            "description": "Scenario 3: Honest Verified Bounty (Escrowed & Valid View Count)",
            "payload": {
                "id": "bounty-safe-003",
                "title": "Fix Memory Leak in Rust WebSocket Service",
                "budget": 800.0,
                "has_escrow": True,
                "has_payment_evidence": True,
                "views": 48,
                "applications": 3
            }
        }
    ]

    for tc in test_cases:
        print(f"\n▶ Testing: {tc['description']}")
        print(f"  Input Payload: ID={tc['payload']['id']}, Budget=${tc['payload']['budget']}, Escrow={tc['payload']['has_escrow']}")
        
        result = client.verify_task(tc["payload"])
        
        safe_badge = "✅ SAFE TO EXECUTE" if result.get("is_safe_to_execute") else "❌ BLOCKED / HIGH RISK"
        print(f"  Verdict: {result.get('verdict', '').upper()} | Status: {safe_badge}")
        print(f"  Advisory: {result.get('advisory')}")
        
        findings = result.get("findings", [])
        if findings:
            print("  Fired Indicators:")
            for f in findings:
                indicator_id = f.get("id") or f.get("indicator_id") or "UNKNOWN"
                name = f.get("indicator") or f.get("name") or ""
                detail = f.get("detail") or f.get("description") or ""
                severity = f.get("severity", "")
                print(f"    - [{indicator_id}] {name}: {detail} (Severity: {severity})")
        else:
            print("  No fraud indicators detected.")

    print("\n" + "=" * 70)
    print("Pre-flight verification complete. Use `BoardcheckClient` inside agent loops!")
    print("=" * 70)


if __name__ == "__main__":
    main()
