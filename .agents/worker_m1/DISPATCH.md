## 2026-08-18T05:02:42Z

You are Worker M1 (UI Visualizer & Conversion Portal Specialist).
Your working directory is C:\Users\imthe\.gemini\antigravity\scratch\boardcheck-edge\.agents\worker_m1.
Your exclusive write ownership: src/routes/ui.ts

MANDATORY READS:
1. C:\Users\imthe\.gemini\antigravity\scratch\boardcheck-edge\ORIGINAL_REQUEST.md
2. C:\Users\imthe\.gemini\antigravity\scratch\boardcheck-edge\PROJECT.md
3. C:\Users\imthe\.gemini\antigravity\scratch\boardcheck-edge\.agents\explorer_survey_1\handoff.md

TASK OBJECTIVE:
Re-engineer `src/routes/ui.ts` to export `renderWebPortal(): string` implementing an enterprise-grade, high-converting web visualizer and conversion portal:
1. Dark-mode design with glowing accents, animated telemetry stream, and responsive layout.
2. Real-time animated telemetry and interactive fraud simulation matrix showing live firing of AMS-001 through AMS-005 indicators with micro-status badges, execution durations (<1ms edge), and threat levels.
3. Animated Circular SVG Risk Gauge (0-100 safety index score sweep with color transitions: Safe green 0-20, Caution amber 21-60, Critical red 61-100).
4. Interactive scenario presets with 1-click execution:
   - "Ghost Syndicate" (AMS-001 view inversion)
   - "Zero-Escrow Trap" (AMS-004 unpaid work risk)
   - "Sybil Burst Seeding" (AMS-002 batch creation)
   - "Supply Glut Flood" (AMS-003 self-advertisements)
   - "Verified Autonomous Bounties" (Clean)
5. One-click Solana Pay modal with inline zero-dependency SVG QR code generator (rendering `solana:...` URI), Phantom/Solflare deep links, transaction signature verification input, and instant 1-click Free Trial key generation button (`POST /api/v1/pay/free-key`).
6. 1-Click Multi-Agent Config Generator with tabs for:
   - Claude Desktop (`claude_desktop_config.json`)
   - Cursor (`.cursor/mcp.json`)
   - Antigravity / Gemini agents
   - Python SDK (`requests` / MCP)
   - Node.js / TypeScript (`@modelcontextprotocol/sdk`)
   - cURL CLI
   - Automatically interpolates the user's active API key into the snippets!
7. Toast notification system replacing all browser alerts/prompts.

VERIFICATION:
Run the build and tests:
- `npx tsx --test test/engine.test.ts test/api.test.ts`
- `npx tsup src/index.ts src/engine/scanner.ts src/engine/types.ts --format esm --dts`
