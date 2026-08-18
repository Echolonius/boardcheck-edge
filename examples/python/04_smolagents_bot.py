#!/usr/bin/env python3
"""
Boardcheck Smolagents (Hugging Face) Integration
Implements a custom Smolagents Tool for lightweight autonomous agents.
Enables Hugging Face CodeAgents to verify bounties in real time.
"""

import os
import sys
import json
import requests

BOARDCHECK_URL = os.getenv("BOARDCHECK_URL", "http://localhost:3000")
API_KEY = os.getenv("BOARDCHECK_KEY", "bc_live_FREE_KEY")

try:
    from smolagents import Tool, CodeAgent, HfApiModel
    SMOLAGENTS_AVAILABLE = True
except ImportError:
    SMOLAGENTS_AVAILABLE = False
    # Mock base class for clean standalone execution
    class Tool:
        name: str
        description: str
        inputs: dict
        output_type: str


class BoardcheckVerifierTool(Tool):
    """
    Smolagents Tool for querying the Boardcheck Edge anti-fraud oracle.
    """
    name = "boardcheck_verify_bounty"
    description = (
        "Audits a freelance task or bug bounty against the AMS standard (AMS-001..005) "
        "to ensure it is backed by verified escrow and not a ghost listing or scam."
    )
    inputs = {
        "task_id": {
            "type": "string",
            "description": "The unique identifier or title of the task to verify"
        },
        "budget": {
            "type": "number",
            "description": "Advertised budget or payout in USD/SOL"
        },
        "has_escrow": {
            "type": "boolean",
            "description": "True if payment is held in smart contract or platform escrow"
        },
        "views": {
            "type": "integer",
            "description": "Total views recorded for the task (default: 10)",
            "nullable": True
        },
        "applications": {
            "type": "integer",
            "description": "Total proposals or applications recorded (default: 1)",
            "nullable": True
        }
    }
    output_type = "string"

    def forward(
        self,
        task_id: str,
        budget: float,
        has_escrow: bool,
        views: int = 10,
        applications: int = 1
    ) -> str:
        url = f"{BOARDCHECK_URL.rstrip('/')}/api/v1/verify"
        payload = {
            "id": task_id,
            "budget": budget,
            "has_escrow": has_escrow,
            "has_payment_evidence": has_escrow,
            "views": views if views is not None else 10,
            "applications": applications if applications is not None else 1
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}"
        }

        try:
            res = requests.post(url, json=payload, headers=headers, timeout=10)
            res.raise_for_status()
            data = res.json()

            if not data.get("is_safe_to_execute"):
                return f"REJECTED: Task '{task_id}' is UNSAFE! Verdict: {data.get('verdict')}. Advisory: {data.get('advisory')}"
            return f"APPROVED: Task '{task_id}' is SAFE to execute. Escrow verified."
        except Exception as e:
            return f"ERROR: Verification request failed: {str(e)}"


def main():
    print("=" * 70)
    print("🤗🤖 Boardcheck Smolagents (Hugging Face) Integration")
    print(f"📡 Oracle: {BOARDCHECK_URL}")
    print(f"📦 Smolagents Library Installed: {SMOLAGENTS_AVAILABLE}")
    print("=" * 70)

    tool_instance = BoardcheckVerifierTool()

    print("\n[Tool Test 1] Checking uncollateralized scam bounty:")
    result_scam = tool_instance.forward(
        task_id="hf-bounty-fake-01",
        budget=2500.0,
        has_escrow=False,
        views=0,
        applications=10
    )
    print(f"Result: {result_scam}")

    print("\n[Tool Test 2] Checking verified task with escrow:")
    result_safe = tool_instance.forward(
        task_id="hf-bounty-legit-02",
        budget=600.0,
        has_escrow=True,
        views=50,
        applications=2
    )
    print(f"Result: {result_safe}")

    print("\n" + "=" * 70)
    print("Smolagents Usage Example:")
    print("---")
    print("""
from smolagents import CodeAgent, HfApiModel
from examples.python.04_smolagents_bot import BoardcheckVerifierTool

model = HfApiModel()
verifier_tool = BoardcheckVerifierTool()

agent = CodeAgent(
    tools=[verifier_tool],
    model=model,
    system_prompt="Always call `boardcheck_verify_bounty` before solving tasks!"
)
""")
    print("=" * 70)


if __name__ == "__main__":
    main()
