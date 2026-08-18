#!/usr/bin/env python3
"""
Boardcheck LangChain Agent Tool Integration
Wraps Boardcheck Edge anti-fraud oracle into a LangChain StructuredTool.
Gives LangChain agents the ability to pre-audit freelance bounties before spending tokens or generating code.
"""

import os
import sys
import json
from typing import Dict, Any, Optional
import requests

BOARDCHECK_URL = os.getenv("BOARDCHECK_URL", "http://localhost:3000")
API_KEY = os.getenv("BOARDCHECK_KEY", "bc_live_FREE_KEY")

try:
    from pydantic import BaseModel, Field
    from langchain_core.tools import tool, StructuredTool
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False


# Tool implementation logic
def audit_task_impl(
    task_id: str,
    budget: float,
    has_escrow: bool,
    has_payment_evidence: bool = True,
    views: int = 10,
    applications: int = 1
) -> str:
    """
    Direct function to query Boardcheck Edge verify API.
    """
    url = f"{BOARDCHECK_URL.rstrip('/')}/api/v1/verify"
    payload = {
        "id": task_id,
        "budget": budget,
        "has_escrow": has_escrow,
        "has_payment_evidence": has_payment_evidence,
        "views": views,
        "applications": applications,
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()

        is_safe = data.get("is_safe_to_execute", False)
        verdict = data.get("verdict", "unknown")
        advisory = data.get("advisory", "")
        findings = data.get("findings", [])

        if not is_safe:
            indicators = ", ".join([f"{f.get('indicator_id')}: {f.get('name')}" for f in findings])
            return (
                f"❌ REJECTED - TASK IS UNSAFE TO EXECUTE\n"
                f"Verdict: {verdict.upper()}\n"
                f"Advisory: {advisory}\n"
                f"Triggered Violations: {indicators or 'Escrow missing or invalid metrics'}\n"
                f"Action for Agent: Do NOT generate code or submit work. Notify user/dispatcher."
            )
        else:
            return (
                f"✅ APPROVED - TASK IS SAFE TO EXECUTE\n"
                f"Verdict: PASS\n"
                f"Advisory: {advisory}\n"
                f"Action for Agent: Proceed with solution generation and deliver code."
            )
    except Exception as e:
        return f"⚠️ ERROR calling Boardcheck Oracle: {str(e)}"


if LANGCHAIN_AVAILABLE:
    class BoardcheckAuditInput(BaseModel):
        task_id: str = Field(description="Unique task or bounty identifier")
        budget: float = Field(description="Advertised payment amount in USD/SOL")
        has_escrow: bool = Field(description="Whether the bounty funds are locked in verifiable escrow")
        has_payment_evidence: bool = Field(default=True, description="Whether cryptographic/platform payment proof exists")
        views: int = Field(default=10, description="Total views the listing has received")
        applications: int = Field(default=1, description="Total proposals or applications submitted")

    @tool(args_schema=BoardcheckAuditInput)
    def boardcheck_verify_task(
        task_id: str,
        budget: float,
        has_escrow: bool,
        has_payment_evidence: bool = True,
        views: int = 10,
        applications: int = 1
    ) -> str:
        """
        Audit a freelance task, bug bounty, or issue before executing code or spending LLM compute.
        Detects uncollateralized labor, ghost listings, view inversions, and scam bounties (AMS-001..005).
        """
        return audit_task_impl(task_id, budget, has_escrow, has_payment_evidence, views, applications)


def demonstrate():
    print("=" * 70)
    print("🦜🔗 Boardcheck LangChain Agent Integration")
    print(f"📡 Oracle: {BOARDCHECK_URL}")
    print(f"📦 LangChain Core Installed: {LANGCHAIN_AVAILABLE}")
    print("=" * 70)

    # Example 1: Scam bounty
    print("\n[Agent Query 1] Auditing zero-escrow scam task...")
    result_scam = audit_task_impl(
        task_id="bounty-scam-404",
        budget=5000.0,
        has_escrow=False,
        has_payment_evidence=False,
        views=0,
        applications=12
    )
    print(result_scam)

    # Example 2: Verified task
    print("\n[Agent Query 2] Auditing verified freelance gig...")
    result_safe = audit_task_impl(
        task_id="bounty-verified-101",
        budget=1200.0,
        has_escrow=True,
        has_payment_evidence=True,
        views=85,
        applications=4
    )
    print(result_safe)

    print("\n" + "=" * 70)
    print("LangChain Tool Definition Code:")
    print("---")
    print("""
from langchain.agents import create_react_agent, AgentExecutor
from langchain_openai import ChatOpenAI
from examples.python.02_langchain_agent import boardcheck_verify_task

llm = ChatOpenAI(model="gpt-4o")
tools = [boardcheck_verify_task]
# The agent will automatically call boardcheck_verify_task before writing code!
""")
    print("=" * 70)


if __name__ == "__main__":
    demonstrate()
