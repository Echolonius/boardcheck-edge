#!/usr/bin/env python3
"""
Boardcheck CrewAI Agent Integration
Integrates Boardcheck into a multi-agent hierarchy:
- Role 1: Market Fraud Auditor (Security Scout) evaluates job listings and filters scams.
- Role 2: Senior Autonomous Developer implements approved tasks safely.
"""

import os
import sys
import json
import requests

BOARDCHECK_URL = os.getenv("BOARDCHECK_URL", "http://localhost:3000")
API_KEY = os.getenv("BOARDCHECK_KEY", "bc_live_FREE_KEY")

try:
    from crewai import Agent, Task, Crew, Process
    from crewai.tools import tool
    CREWAI_AVAILABLE = True
except ImportError:
    CREWAI_AVAILABLE = False


def audit_task_api(task_id: str, budget: float, has_escrow: bool, views: int = 10, applications: int = 1) -> str:
    """Core function to query Boardcheck Edge."""
    url = f"{BOARDCHECK_URL.rstrip('/')}/api/v1/verify"
    payload = {
        "id": task_id,
        "budget": budget,
        "has_escrow": has_escrow,
        "has_payment_evidence": has_escrow,
        "views": views,
        "applications": applications
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
            return f"REJECTED: Task '{task_id}' failed fraud checks! Verdict: {data.get('verdict')}. Advisory: {data.get('advisory')}"
        return f"APPROVED: Task '{task_id}' is safe with verified escrow. Proceed."
    except Exception as e:
        return f"ERROR: Could not verify task '{task_id}': {str(e)}"


if CREWAI_AVAILABLE:
    @tool("Boardcheck Task Fraud Auditor")
    def crewai_audit_task_tool(task_id: str, budget: float, has_escrow: bool) -> str:
        """
        Verify that a freelance task or bounty is backed by valid escrow and not a ghost listing
        or scam before assigning developers to write code.
        """
        return audit_task_api(task_id, budget, has_escrow)

    def create_security_crew(tasks_to_review: list):
        # Agent 1: The Fraud Auditor Scout
        fraud_auditor = Agent(
            role="Marketplace Fraud Auditor",
            goal="Inspect incoming freelance bounties against AMS-001..AMS-005 standards and reject uncollateralized scams.",
            backstory="You are a seasoned AI security scout responsible for protecting developer compute from unpaid traps and ghost listings.",
            tools=[crewai_audit_task_tool],
            verbose=True
        )

        # Agent 2: The Lead Developer
        lead_dev = Agent(
            role="Senior Autonomous Developer",
            goal="Implement solutions only for bounties explicitly approved by the Fraud Auditor.",
            backstory="You write high-performance TypeScript and Rust code for verified tasks.",
            verbose=True
        )

        audit_task = Task(
            description=f"Audit the following incoming tasks: {json.dumps(tasks_to_review)}. Approve or reject each with reasons.",
            expected_output="A list of approved tasks safe for development.",
            agent=fraud_auditor
        )

        dev_task = Task(
            description="Produce architecture blueprints only for tasks that passed the security audit.",
            expected_output="Implementation plans for approved tasks.",
            agent=lead_dev
        )

        crew = Crew(
            agents=[fraud_auditor, lead_dev],
            tasks=[audit_task, dev_task],
            process=Process.sequential,
            verbose=True
        )
        return crew


def main():
    print("=" * 70)
    print("👥  Boardcheck CrewAI Multi-Agent Workflow")
    print(f"📡 Oracle: {BOARDCHECK_URL}")
    print(f"📦 CrewAI Library Installed: {CREWAI_AVAILABLE}")
    print("=" * 70)

    sample_bounties = [
        {"id": "bounty-scam-01", "budget": 4500.0, "has_escrow": False, "views": 0, "applications": 9},
        {"id": "bounty-legit-02", "budget": 1500.0, "has_escrow": True, "views": 42, "applications": 2}
    ]

    print("\nAuditing candidate tasks via Boardcheck Edge:")
    for b in sample_bounties:
        status = audit_task_api(b["id"], b["budget"], b["has_escrow"], b["views"], b["applications"])
        print(f" - {b['id']} (${b['budget']}): {status}")

    print("\n" + "=" * 70)
    print("CrewAI Implementation Pattern:")
    print("---")
    print("""
# In your CrewAI pipeline:
# 1. Auditor Agent calls `crewai_audit_task_tool`
# 2. Rejects uncollateralized or spoofed bounties
# 3. Hands off clean tasks to Developer Agent
    """)
    print("=" * 70)


if __name__ == "__main__":
    main()
