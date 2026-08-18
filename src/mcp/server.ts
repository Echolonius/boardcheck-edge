import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { scanListings } from "../engine/scanner.js";
import { Listing } from "../engine/types.js";

/**
 * Creates and initializes a modern Remote MCP Server for Boardcheck.
 */
export function createBoardcheckMcpServer(): McpServer {
  const server = new McpServer({
    name: "boardcheck-mcp",
    version: "1.0.0",
  });

  // Tool 1: boardcheck_scan_listings
  server.tool(
    "boardcheck_scan_listings",
    "Scan a collection of job/task listings to detect marketplace manipulation, ghost listings, and payment risks (AMS-001..005).",
    {
      listings: z.array(
        z.object({
          id: z.string().describe("Unique listing identifier"),
          title: z.string().optional().describe("Job or task title"),
          created_at: z.string().optional().describe("ISO timestamp of creation"),
          views: z.number().optional().describe("Reported view count"),
          applications: z.number().optional().describe("Reported application/bid count"),
          budget: z.number().optional().describe("Advertised payout or budget amount"),
          has_escrow: z.boolean().optional().describe("Whether payout is locked in verifiable escrow"),
          has_payment_evidence: z.boolean().optional().describe("Whether cryptographic or platform payment proof exists"),
          is_self_advertisement: z.boolean().optional().describe("Whether this listing is an agent marketing its own services"),
        })
      ).describe("List of job listings to audit"),
    },
    async ({ listings }) => {
      const report = scanListings(listings as Listing[]);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(report, null, 2),
          },
        ],
      };
    }
  );

  // Tool 2: boardcheck_verify_single_task
  server.tool(
    "boardcheck_verify_single_task",
    "Pre-flight safety check for an autonomous agent before committing LLM compute or delivering code to a specific task.",
    {
      id: z.string().describe("Task or listing ID"),
      budget: z.number().optional().describe("Payout budget"),
      has_escrow: z.boolean().optional().describe("Is payment locked in smart contract or verified platform escrow?"),
      has_payment_evidence: z.boolean().optional().describe("Is there on-chain or platform payment proof?"),
      views: z.number().optional().describe("Total views on the task"),
      applications: z.number().optional().describe("Total applications submitted"),
    },
    async (task) => {
      const report = scanListings([task as Listing]);
      const isRisky = report.verdict === "high_risk";
      const advisory = isRisky
        ? "CRITICAL: High risk of unpaid work or ghost listing. Do NOT commit compute without upfront escrow."
        : report.verdict === "caution"
        ? "CAUTION: Unverified listing metrics. Proceed with strict payment safeguards."
        : "PASS: Listing passes baseline honest market checks.";

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                task_id: task.id,
                verdict: report.verdict,
                advisory,
                findings: report.findings,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool 3: boardcheck_spec_info
  server.tool(
    "boardcheck_spec_info",
    "Look up exact definitions, severities, and false-positive criteria for Boardcheck indicator IDs (AMS-001 through AMS-005).",
    {
      indicator_id: z.enum(["AMS-001", "AMS-002", "AMS-003", "AMS-004", "AMS-005"]).describe("Indicator ID to look up"),
    },
    async ({ indicator_id }) => {
      const specs: Record<string, any> = {
        "AMS-001": {
          name: "view_application_inversion",
          severity: "high / warn",
          description: "Fires when applications exceed views (e.g. applications > 0 with views == 0).",
          why_it_matters: "A user or agent must view a listing to apply. Inversion is mathematically implausible.",
        },
        "AMS-002": {
          name: "batch_creation_clustering",
          severity: "high",
          description: "Fires when multiple listings share creation timestamps to the second.",
          why_it_matters: "Signature of automated batch seeding to fake platform activity.",
        },
        "AMS-003": {
          name: "self_advertisement_ratio",
          severity: "high / warn",
          description: "Fires when >= 50% of listings are agents marketing their own services.",
          why_it_matters: "Disguises a supply glut as organic buyer demand.",
        },
        "AMS-004": {
          name: "unpaid_work_risk",
          severity: "high",
          description: "Priced tasks with no escrow and no payment-evidence mechanism.",
          why_it_matters: "Agents burn compute and deliver work that may never be settled.",
        },
        "AMS-005": {
          name: "high_budget_bait",
          severity: "warn",
          description: "Budgets significantly above the platform median with 0 views.",
          why_it_matters: "Bait listings designed to attract applicant compute without real buyers.",
        },
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(specs[indicator_id] || {}, null, 2),
          },
        ],
      };
    }
  );

  return server;
}
