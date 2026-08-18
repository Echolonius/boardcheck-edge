export function renderWebPortal(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Boardcheck Edge — Anti-Fraud Oracle & Remote MCP Server</title>
  <meta name="description" content="Sub-millisecond anti-fraud oracle and Remote MCP server for autonomous AI agent marketplaces. Evaluates AMS-001..AMS-005 open integrity standards with zero-KYC Solana Pay on-chain credit issuance.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
          },
          colors: {
            brand: {
              50: '#f5f3ff',
              100: '#ede9fe',
              200: '#ddd6fe',
              300: '#c4b5fd',
              400: '#a78bfa',
              500: '#8b5cf6',
              600: '#7c3aed',
              700: '#6d28d9',
              800: '#5b21b6',
              900: '#4c1d95',
              950: '#2e1065',
            },
            surface: {
              base: '#07090e',
              card: '#0f1422',
              panel: '#151b2e',
              border: '#1e2842',
              highlight: '#2a3656'
            },
            oracle: {
              safe: '#10b981',
              warn: '#f59e0b',
              danger: '#ef4444',
              cyan: '#06b6d4',
              solana: '#14f195',
            }
          }
        }
      }
    }
  </script>
  <style>
    :root {
      color-scheme: dark;
    }
    body {
      background-color: #07090e;
      color: #f1f5f9;
      background-image: 
        radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.12) 0%, transparent 60%),
        radial-gradient(circle at 10% 40%, rgba(6, 182, 212, 0.05) 0%, transparent 40%),
        radial-gradient(circle at 90% 70%, rgba(20, 241, 149, 0.05) 0%, transparent 40%);
      background-attachment: fixed;
    }
    .glass-panel {
      background: rgba(15, 20, 34, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.07);
    }
    .glass-panel-glow {
      background: rgba(15, 20, 34, 0.9);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(139, 92, 246, 0.3);
      box-shadow: 0 0 35px -5px rgba(124, 58, 237, 0.15);
    }
    .glass-card-hover {
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .glass-card-hover:hover {
      transform: translateY(-2px);
      border-color: rgba(139, 92, 246, 0.4);
      box-shadow: 0 10px 30px -10px rgba(124, 58, 237, 0.25);
    }
    .gauge-circle {
      transition: stroke-dashoffset 0.85s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease;
    }
    @keyframes toastIn {
      from { transform: translateX(110%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes toastOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(110%); opacity: 0; }
    }
    .toast-enter {
      animation: toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .toast-exit {
      animation: toastOut 0.25s ease forwards;
    }
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #07090e;
    }
    ::-webkit-scrollbar-thumb {
      background: #1e2842;
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #3b4d75;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col font-sans selection:bg-purple-600 selection:text-white antialiased">

  <!-- Toast Container -->
  <div id="toastContainer" class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4" aria-live="polite"></div>

  <!-- Top Telemetry Ticker -->
  <div class="border-b border-surface-border/80 bg-surface-card/90 text-xs font-mono py-1.5 px-4 overflow-hidden relative">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 text-gray-400 shrink-0">
        <span class="flex h-2 w-2 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span class="text-gray-300 font-semibold tracking-wide">EDGE NETWORK ORACLE</span>
        <span class="text-gray-600">|</span>
        <span id="telemetryStatus" class="text-purple-300 font-mono">STANDARDS: AMS-001..AMS-005 ACTIVE</span>
      </div>
      <div id="telemetryStream" class="hidden md:flex items-center gap-6 text-gray-400 overflow-hidden whitespace-nowrap text-[11px]">
        <span class="text-gray-400">LATENCY: <strong class="text-emerald-400 font-mono" id="edgeLatencyTag">&lt; 1ms</strong> (Global Edge)</span>
        <span>AUDITED: <strong class="text-white font-mono" id="bountiesAuditedTag">52,480+</strong> bounties</span>
        <span>FALSE POSITIVE SLA: <strong class="text-emerald-400 font-mono">0.00%</strong></span>
        <span>SOLANA NETWORK: <strong class="text-oracle-solana font-mono">LIVE (Mainnet / Devnet)</strong></span>
      </div>
    </div>
  </div>

  <!-- Navigation -->
  <header class="border-b border-surface-border bg-surface-base/80 backdrop-blur-md sticky top-0 z-40 transition-all">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-800 p-[1px] shadow-lg shadow-purple-500/20">
          <div class="w-full h-full bg-surface-card rounded-[11px] flex items-center justify-center font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-purple-300 to-white font-mono text-base">
            BC
          </div>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-lg tracking-tight text-white">Boardcheck</span>
            <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-800/80 font-mono">Edge Oracle</span>
          </div>
          <p class="text-[11px] text-gray-400 hidden sm:block">AI Agent Marketplace Honesty Standard</p>
        </div>
      </div>

      <nav class="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
        <a href="#simulator" class="hover:text-purple-400 transition">Simulator</a>
        <a href="#matrix" class="hover:text-purple-400 transition">AMS Threat Matrix</a>
        <a href="#config-generator" class="hover:text-purple-400 transition">1-Click Configs</a>
        <a href="#solana-pay" class="hover:text-purple-400 transition flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-oracle-solana"></span>
          <span>Solana Pay</span>
        </a>
      </nav>

      <div class="flex items-center gap-3">
        <button onclick="claimFreeTrialKey()" class="px-3.5 py-1.5 rounded-lg bg-surface-panel hover:bg-surface-highlight text-purple-300 hover:text-white border border-purple-500/30 hover:border-purple-500/60 font-mono text-xs font-semibold transition flex items-center gap-1.5 shadow-sm">
          <svg class="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          <span>Free Trial Key</span>
        </button>
        <button onclick="openSolanaPayModal()" class="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs font-mono shadow-md shadow-purple-600/30 transition flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-oracle-solana" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l-10-5v6l10 5 10-5v-6l-10 5zm0 7l-10-5v6l10 5 10-5v-6l-10 5z"/></svg>
          <span>Top-Up Credits</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8 text-center relative">
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-card border border-purple-500/30 text-purple-300 text-xs font-mono mb-6 shadow-inner">
      <span class="w-2 h-2 rounded-full bg-oracle-safe animate-pulse"></span>
      <span>Autonomous Oracle · Zero KYC · Sub-Millisecond Execution</span>
    </div>
    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
      Protect Your AI Agents From <br class="hidden sm:inline" />
      <span class="bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
        Ghost Bounties & Unpaid Work Traps
      </span>
    </h1>
    <p class="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
      Pre-flight audit marketplace bounties against the open <span class="text-gray-200 font-semibold">AMS-001..AMS-005</span> standard. Prevent penniless agents from burning compute on fake jobs, sybil batch spam, and zero-escrow traps.
    </p>

    <!-- Key & Credits Status Banner -->
    <div id="keyBanner" class="max-w-2xl mx-auto mt-8 p-4 rounded-xl glass-panel border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-lg">
      <div class="flex items-center gap-3.5 w-full sm:w-auto">
        <div class="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-700/50 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
        </div>
        <div class="overflow-hidden">
          <div class="text-[10px] text-purple-400 font-mono uppercase tracking-wider font-bold">Active API Key</div>
          <div class="flex items-center gap-2">
            <span id="activeKeyDisplay" class="font-mono text-xs sm:text-sm text-gray-200 font-bold truncate max-w-[220px] sm:max-w-xs">bc_live_anonymous_guest</span>
            <button onclick="copyActiveKey()" title="Copy API Key" class="text-gray-400 hover:text-white transition">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 border-t sm:border-t-0 border-surface-border pt-3 sm:pt-0">
        <div class="text-left sm:text-right">
          <div class="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Credits Available</div>
          <div id="activeCreditsDisplay" class="font-bold text-emerald-400 font-mono text-lg">100</div>
        </div>
        <button onclick="openSolanaPayModal()" class="px-3 py-1.5 rounded-lg bg-surface-highlight hover:bg-purple-600/40 text-purple-200 text-xs font-mono font-medium border border-purple-500/30 transition flex items-center gap-1.5">
          <span>+ Add SOL</span>
        </button>
      </div>
    </div>
  </section>

  <!-- Interactive Fraud Simulator & Risk Gauge Section -->
  <section id="simulator" class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    
    <!-- Scenario Presets Bar -->
    <div class="mb-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <span class="text-xs uppercase font-mono tracking-wider font-bold text-gray-400 flex items-center gap-2">
          <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          Interactive Scenario Presets (1-Click Execution)
        </span>
        <span class="text-[11px] text-gray-500 font-mono">Select an attack vector to load and execute an instant live audit</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <button onclick="loadScenario('ghost')" class="group p-3 rounded-xl glass-panel glass-card-hover text-left border border-surface-border hover:border-red-500/50 transition">
          <div class="flex items-center justify-between text-xs font-mono font-bold text-red-400">
            <span>Ghost Syndicate</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-red-950/80 border border-red-800/80">AMS-001</span>
          </div>
          <p class="text-[11px] text-gray-400 mt-1 line-clamp-2">Inverted views vs applications metric fraud</p>
        </button>

        <button onclick="loadScenario('escrow')" class="group p-3 rounded-xl glass-panel glass-card-hover text-left border border-surface-border hover:border-red-500/50 transition">
          <div class="flex items-center justify-between text-xs font-mono font-bold text-red-400">
            <span>Zero-Escrow Trap</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-red-950/80 border border-red-800/80">AMS-004</span>
          </div>
          <p class="text-[11px] text-gray-400 mt-1 line-clamp-2">Unpaid work risk with zero collateral proof</p>
        </button>

        <button onclick="loadScenario('sybil')" class="group p-3 rounded-xl glass-panel glass-card-hover text-left border border-surface-border hover:border-red-500/50 transition">
          <div class="flex items-center justify-between text-xs font-mono font-bold text-red-400">
            <span>Sybil Burst Seeding</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-red-950/80 border border-red-800/80">AMS-002</span>
          </div>
          <p class="text-[11px] text-gray-400 mt-1 line-clamp-2">High-frequency sub-second bot insertion</p>
        </button>

        <button onclick="loadScenario('supply')" class="group p-3 rounded-xl glass-panel glass-card-hover text-left border border-surface-border hover:border-amber-500/50 transition">
          <div class="flex items-center justify-between text-xs font-mono font-bold text-amber-400">
            <span>Supply Glut Flood</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/80">AMS-003</span>
          </div>
          <p class="text-[11px] text-gray-400 mt-1 line-clamp-2">Service seller ads disguised as real demand</p>
        </button>

        <button onclick="loadScenario('clean')" class="group p-3 rounded-xl glass-panel glass-card-hover text-left border border-surface-border hover:border-emerald-500/50 transition col-span-2 sm:col-span-1">
          <div class="flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
            <span>Verified Bounties</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80">CLEAN</span>
          </div>
          <p class="text-[11px] text-gray-400 mt-1 line-clamp-2">Escrow-backed honest market listings</p>
        </button>
      </div>
    </div>

    <!-- Main 2-Column Auditor Workbench -->
    <div class="grid lg:grid-cols-12 gap-6 items-stretch">
      
      <!-- Left: JSON Input & Controls (7 cols) -->
      <div class="lg:col-span-7 glass-panel rounded-2xl p-6 flex flex-col justify-between border border-surface-border">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <h2 class="font-bold text-base text-white">Listing Batch Payload (JSON)</h2>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="formatJson()" class="text-xs text-gray-400 hover:text-purple-300 font-mono transition px-2 py-1 rounded bg-surface-panel border border-surface-border">
                Format
              </button>
              <button onclick="clearEditor()" class="text-xs text-gray-400 hover:text-red-400 font-mono transition px-2 py-1 rounded bg-surface-panel border border-surface-border">
                Clear
              </button>
            </div>
          </div>

          <div class="relative">
            <textarea id="jsonInput" spellcheck="false" class="w-full h-80 bg-surface-base/90 rounded-xl p-4 font-mono text-xs text-gray-200 border border-surface-border focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none resize-none leading-relaxed" placeholder="Paste listing array JSON here..."></textarea>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2 text-xs text-gray-400 font-mono">
            <span class="text-gray-500">Target Endpoint:</span>
            <code class="text-purple-400 font-bold">POST /api/v1/scan</code>
          </div>
          <button id="runAuditBtn" onclick="runAudit()" class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm font-mono shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Execute Oracle Audit</span>
          </button>
        </div>
      </div>

      <!-- Right: Circular Risk Gauge & Verdict Card (5 cols) -->
      <div class="lg:col-span-5 glass-panel rounded-2xl p-6 flex flex-col justify-between border border-surface-border">
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-bold text-base text-white flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span>Oracle Verdict & Risk Gauge</span>
            </h2>
            <span id="scanLatencyBadge" class="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-panel text-gray-400 border border-surface-border">0.0ms</span>
          </div>

          <!-- Circular SVG Gauge -->
          <div class="flex flex-col items-center justify-center my-4">
            <div class="relative w-44 h-44 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                <!-- Background Ring -->
                <circle cx="80" cy="80" r="62" stroke="#1e2842" stroke-width="12" fill="none" opacity="0.6"/>
                <!-- Animated Progress Ring (Circumference ~ 389.56) -->
                <circle id="riskGaugeArc" class="gauge-circle" cx="80" cy="80" r="62" stroke="#10b981" stroke-width="12" stroke-linecap="round" fill="none" stroke-dasharray="389.56" stroke-dashoffset="389.56" style="filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4));"/>
              </svg>
              <!-- Center Text -->
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span id="gaugeScore" class="font-mono text-4xl font-extrabold text-white tracking-tight">0</span>
                <span id="gaugeLabel" class="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest mt-0.5">STANDBY</span>
                <span class="text-[9px] font-mono text-gray-500 tracking-wider">SAFETY INDEX</span>
              </div>
            </div>
            
            <div id="verdictSummaryTitle" class="mt-2 text-center font-bold text-sm text-gray-300 font-mono">
              Ready for pre-flight verification
            </div>
          </div>
        </div>

        <!-- Telemetry Coverage Mini-Grid -->
        <div class="grid grid-cols-3 gap-2 pt-4 border-t border-surface-border text-center font-mono">
          <div class="p-2 rounded-lg bg-surface-base/80 border border-surface-border">
            <div class="text-[10px] text-gray-500 uppercase">Listings</div>
            <div id="covTotalListings" class="text-sm font-bold text-white">0</div>
          </div>
          <div class="p-2 rounded-lg bg-surface-base/80 border border-surface-border">
            <div class="text-[10px] text-gray-500 uppercase">High Risk</div>
            <div id="covHighRisk" class="text-sm font-bold text-gray-400">0</div>
          </div>
          <div class="p-2 rounded-lg bg-surface-base/80 border border-surface-border">
            <div class="text-[10px] text-gray-500 uppercase">Warnings</div>
            <div id="covWarnings" class="text-sm font-bold text-gray-400">0</div>
          </div>
        </div>
      </div>

    </div>

    <!-- Live Findings Accordion / Feed -->
    <div id="findingsContainer" class="mt-6 glass-panel rounded-2xl p-6 border border-surface-border">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-sm text-white flex items-center gap-2">
          <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <span>Detailed Diagnostic Telemetry Findings</span>
        </h3>
        <span id="findingsCountBadge" class="text-xs font-mono px-2 py-0.5 rounded bg-surface-panel text-gray-400 border border-surface-border">0 findings</span>
      </div>
      <div id="findingsList" class="space-y-3 font-mono">
        <div class="p-4 rounded-xl bg-surface-base/50 border border-surface-border text-center text-xs text-gray-500">
          Run an audit or execute a preset scenario to view rule-level telemetry breakdowns.
        </div>
      </div>
    </div>

  </section>

  <!-- Real-Time AMS Threat Diagnostic Matrix (AMS-001..AMS-005) -->
  <section id="matrix" class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
    <div class="mb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-800 text-purple-300 text-xs font-mono mb-3">
        <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
        <span>Open Integrity Standard</span>
      </div>
      <h2 class="text-2xl sm:text-3xl font-extrabold text-white">AMS Threat Diagnostic Matrix</h2>
      <p class="text-gray-400 text-sm mt-1">Live status indicators representing sub-millisecond edge evaluation rules.</p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      
      <!-- AMS-001 -->
      <div id="matrixCard-AMS-001" class="glass-panel rounded-xl p-5 border border-surface-border flex flex-col justify-between transition-all duration-300">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-xs font-mono font-bold border border-purple-800">AMS-001</span>
              <span class="text-xs font-mono text-gray-500">&lt; 0.2ms</span>
            </div>
            <span id="badge-AMS-001" class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-panel text-gray-400 border border-surface-border">ARMED</span>
          </div>
          <h4 class="font-bold text-sm text-white">View-Application Inversion</h4>
          <p class="text-xs text-gray-400 mt-2 leading-relaxed">
            Flags impossible metrics where reported applications exceed total views (e.g. 0 views with 15 applications), revealing falsified activity counters.
          </p>
        </div>
        <div class="mt-4 pt-3 border-t border-surface-border flex items-center justify-between text-[11px] font-mono text-gray-500">
          <span>Severity: <strong class="text-red-400">HIGH</strong></span>
          <span id="stat-AMS-001" class="text-gray-400">0 listings flagged</span>
        </div>
      </div>

      <!-- AMS-002 -->
      <div id="matrixCard-AMS-002" class="glass-panel rounded-xl p-5 border border-surface-border flex flex-col justify-between transition-all duration-300">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-xs font-mono font-bold border border-purple-800">AMS-002</span>
              <span class="text-xs font-mono text-gray-500">&lt; 0.25ms</span>
            </div>
            <span id="badge-AMS-002" class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-panel text-gray-400 border border-surface-border">ARMED</span>
          </div>
          <h4 class="font-bold text-sm text-white">Batch Creation Clustering</h4>
          <p class="text-xs text-gray-400 mt-2 leading-relaxed">
            Identifies automated bot bursts where 4+ listings share identical timestamps to the exact second, exposing artificial marketplace seeding.
          </p>
        </div>
        <div class="mt-4 pt-3 border-t border-surface-border flex items-center justify-between text-[11px] font-mono text-gray-500">
          <span>Severity: <strong class="text-red-400">HIGH</strong></span>
          <span id="stat-AMS-002" class="text-gray-400">0 listings flagged</span>
        </div>
      </div>

      <!-- AMS-003 -->
      <div id="matrixCard-AMS-003" class="glass-panel rounded-xl p-5 border border-surface-border flex flex-col justify-between transition-all duration-300">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-xs font-mono font-bold border border-purple-800">AMS-003</span>
              <span class="text-xs font-mono text-gray-500">&lt; 0.15ms</span>
            </div>
            <span id="badge-AMS-003" class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-panel text-gray-400 border border-surface-border">ARMED</span>
          </div>
          <h4 class="font-bold text-sm text-white">Supply Glut Flood Ratio</h4>
          <p class="text-xs text-gray-400 mt-2 leading-relaxed">
            Detects boards dominated (&ge; 50%) by service sellers marketing self-advertisements rather than genuine buyer tasks with escrow budgets.
          </p>
        </div>
        <div class="mt-4 pt-3 border-t border-surface-border flex items-center justify-between text-[11px] font-mono text-gray-500">
          <span>Severity: <strong class="text-amber-400">WARN / HIGH</strong></span>
          <span id="stat-AMS-003" class="text-gray-400">0 listings flagged</span>
        </div>
      </div>

      <!-- AMS-004 -->
      <div id="matrixCard-AMS-004" class="glass-panel rounded-xl p-5 border border-surface-border flex flex-col justify-between transition-all duration-300">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-xs font-mono font-bold border border-purple-800">AMS-004</span>
              <span class="text-xs font-mono text-gray-500">&lt; 0.2ms</span>
            </div>
            <span id="badge-AMS-004" class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-panel text-gray-400 border border-surface-border">ARMED</span>
          </div>
          <h4 class="font-bold text-sm text-white">Zero-Escrow Unpaid Work Trap</h4>
          <p class="text-xs text-gray-400 mt-2 leading-relaxed">
            Flags priced compensation requests requiring autonomous labor delivery with zero escrow lock and no verifiable on-chain payment proof.
          </p>
        </div>
        <div class="mt-4 pt-3 border-t border-surface-border flex items-center justify-between text-[11px] font-mono text-gray-500">
          <span>Severity: <strong class="text-red-400">CRITICAL</strong></span>
          <span id="stat-AMS-004" class="text-gray-400">0 listings flagged</span>
        </div>
      </div>

      <!-- AMS-005 -->
      <div id="matrixCard-AMS-005" class="glass-panel rounded-xl p-5 border border-surface-border flex flex-col justify-between transition-all duration-300">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-xs font-mono font-bold border border-purple-800">AMS-005</span>
              <span class="text-xs font-mono text-gray-500">&lt; 0.18ms</span>
            </div>
            <span id="badge-AMS-005" class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-panel text-gray-400 border border-surface-border">ARMED</span>
          </div>
          <h4 class="font-bold text-sm text-white">High Budget Bait Outlier</h4>
          <p class="text-xs text-gray-400 mt-2 leading-relaxed">
            Catches bounties priced &ge; 3.0&times; above platform median that have 0 views, designed to lure agent proposals without intention to hire.
          </p>
        </div>
        <div class="mt-4 pt-3 border-t border-surface-border flex items-center justify-between text-[11px] font-mono text-gray-500">
          <span>Severity: <strong class="text-amber-400">WARN</strong></span>
          <span id="stat-AMS-005" class="text-gray-400">0 listings flagged</span>
        </div>
      </div>

      <!-- Sub-Millisecond Engine SLA -->
      <div class="glass-panel-glow rounded-xl p-5 border border-purple-500/40 flex flex-col justify-between bg-purple-950/20">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-mono text-purple-300 font-bold">EDGE EXECUTION SLA</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">GUARANTEED</span>
          </div>
          <h4 class="font-bold text-sm text-white">Sub-50ms Global Response</h4>
          <p class="text-xs text-purple-200/70 mt-2 leading-relaxed">
            Zero database queries. Pure in-memory AST scan logic running on Cloudflare Workers edge nodes across 300+ global data centers.
          </p>
        </div>
        <div class="mt-4 pt-3 border-t border-purple-800/40 flex items-center justify-between text-[11px] font-mono text-purple-300">
          <span>Throughput: <strong>10,000+ req/sec</strong></span>
          <span class="text-emerald-400">✓ 100% Up</span>
        </div>
      </div>

    </div>
  </section>

  <!-- 1-Click Multi-Agent Config Generator -->
  <section id="config-generator" class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
    <div class="mb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-800 text-indigo-300 text-xs font-mono mb-3">
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
        <span>Instant Agent Integration</span>
      </div>
      <h2 class="text-2xl sm:text-3xl font-extrabold text-white">1-Click Multi-Agent Config Generator</h2>
      <p class="text-gray-400 text-sm mt-1">Copy ready-to-run configurations for your favorite agent platforms. Your active API key is auto-interpolated.</p>
    </div>

    <div class="glass-panel rounded-2xl border border-surface-border overflow-hidden">
      
      <!-- API Key Interpolation Control Bar -->
      <div class="p-4 bg-surface-card border-b border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <span class="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider shrink-0">Active Key in Snippets:</span>
          <input id="keyInterpolatorInput" type="text" value="bc_live_anonymous_guest" oninput="onKeyInputChange(this.value)" class="bg-surface-base border border-surface-border focus:border-purple-500 text-purple-300 font-mono text-xs px-3 py-1.5 rounded-lg w-full sm:w-80 outline-none" placeholder="Enter API key to interpolate...">
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button onclick="claimFreeTrialKey()" class="text-xs font-mono text-purple-400 hover:text-purple-300 px-3 py-1.5 rounded-lg bg-surface-panel border border-surface-border hover:border-purple-500/50 transition">
            Generate Free Key
          </button>
        </div>
      </div>

      <!-- Config Tabs Header -->
      <div class="flex overflow-x-auto border-b border-surface-border bg-surface-base/50 p-2 gap-1.5 text-xs font-mono">
        <button onclick="switchTab('claude')" id="tabBtn-claude" class="px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 bg-purple-600/30 text-purple-300 border border-purple-500/40">
          <span>Claude Desktop</span>
        </button>
        <button onclick="switchTab('cursor')" id="tabBtn-cursor" class="px-4 py-2 rounded-lg font-bold text-gray-400 hover:text-white transition flex items-center gap-2">
          <span>Cursor IDE</span>
        </button>
        <button onclick="switchTab('antigravity')" id="tabBtn-antigravity" class="px-4 py-2 rounded-lg font-bold text-gray-400 hover:text-white transition flex items-center gap-2">
          <span>Antigravity / Gemini</span>
        </button>
        <button onclick="switchTab('python')" id="tabBtn-python" class="px-4 py-2 rounded-lg font-bold text-gray-400 hover:text-white transition flex items-center gap-2">
          <span>Python SDK</span>
        </button>
        <button onclick="switchTab('node')" id="tabBtn-node" class="px-4 py-2 rounded-lg font-bold text-gray-400 hover:text-white transition flex items-center gap-2">
          <span>Node.js / TS</span>
        </button>
        <button onclick="switchTab('curl')" id="tabBtn-curl" class="px-4 py-2 rounded-lg font-bold text-gray-400 hover:text-white transition flex items-center gap-2">
          <span>cURL CLI</span>
        </button>
      </div>

      <!-- Config Code Panels -->
      <div class="p-6 bg-surface-base/90 relative">
        <div class="flex items-center justify-between mb-3 text-xs font-mono text-gray-400">
          <span id="tabFileLabel">~/Library/Application Support/Claude/claude_desktop_config.json</span>
          <button onclick="copyCurrentTabConfig()" class="px-3 py-1.5 rounded-lg bg-surface-panel hover:bg-purple-600/40 text-purple-300 hover:text-white border border-purple-500/30 transition flex items-center gap-1.5 font-bold">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            <span id="copyBtnText">Copy Config</span>
          </button>
        </div>

        <pre id="configCodeDisplay" class="p-4 rounded-xl bg-surface-card text-xs font-mono text-gray-200 border border-surface-border overflow-x-auto leading-relaxed max-h-96"></pre>
      </div>

    </div>
  </section>

  <!-- Solana Pay Section (On-Chain Credit Purchase) -->
  <section id="solana-pay" class="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-surface-border">
    <div class="text-center max-w-3xl mx-auto mb-12">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-oracle-solana/10 border border-oracle-solana/30 text-oracle-solana text-xs font-mono mb-4">
        <span>⚡ Instant Zero-KYC Solana Pay Settlement</span>
      </div>
      <h2 class="text-3xl sm:text-4xl font-extrabold text-white">Purchase On-Chain API Credits</h2>
      <p class="text-gray-400 text-sm mt-3">
        Pay directly from Phantom, Solflare, or autonomous wallet scripts. The Solana Pay oracle validates signatures instantly and credits your API key on the edge.
      </p>
    </div>

    <!-- Pricing Tiers Grid -->
    <div class="grid md:grid-cols-3 gap-6">
      
      <!-- Starter Tier -->
      <div class="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-surface-border hover:border-purple-500/50 transition duration-300">
        <div>
          <div class="flex items-center justify-between">
            <h3 class="font-extrabold text-lg text-white">Starter Pack</h3>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-panel text-gray-400 border border-surface-border">SOLANA PAY</span>
          </div>
          <div class="mt-4 flex items-baseline gap-2 font-mono">
            <span class="text-3xl font-extrabold text-white">0.05</span>
            <span class="text-oracle-solana font-bold text-lg">SOL</span>
          </div>
          <p class="text-xs text-purple-400 font-mono mt-1">5,000 Verified Scan Credits</p>
          <div class="text-[11px] text-gray-500 font-mono mt-0.5">~ 0.00001 SOL per pre-flight check</div>

          <ul class="my-6 space-y-2.5 text-xs text-gray-300 font-mono">
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-oracle-safe shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <span>Full AMS-001..005 Rule Engine</span>
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-oracle-safe shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <span>Remote MCP SSE Transport</span>
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-oracle-safe shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <span>REST API & CLI Access</span>
            </li>
          </ul>
        </div>

        <button onclick="startSolanaCheckout('tier_starter')" class="w-full py-2.5 rounded-xl bg-surface-panel hover:bg-purple-600 text-white font-mono font-bold text-xs transition border border-surface-border hover:border-purple-500">
          Select Starter Pack (0.05 SOL)
        </button>
      </div>

      <!-- Fleet Tier (Popular) -->
      <div class="glass-panel-glow rounded-2xl p-6 flex flex-col justify-between border-2 border-purple-500 relative bg-surface-panel/70">
        <div class="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider font-mono shadow-md">
          Most Popular
        </div>

        <div>
          <div class="flex items-center justify-between">
            <h3 class="font-extrabold text-lg text-white">Agent Fleet</h3>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">HIGH VOLUME</span>
          </div>
          <div class="mt-4 flex items-baseline gap-2 font-mono">
            <span class="text-3xl font-extrabold text-white">0.20</span>
            <span class="text-oracle-solana font-bold text-lg">SOL</span>
          </div>
          <p class="text-xs text-purple-300 font-mono mt-1">25,000 Verified Scan Credits</p>
          <div class="text-[11px] text-gray-400 font-mono mt-0.5">~ 0.000008 SOL per pre-flight check</div>

          <ul class="my-6 space-y-2.5 text-xs text-gray-200 font-mono">
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-oracle-safe shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <span>High-Concurrency Agent Clusters</span>
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-oracle-safe shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <span>Dedicated Edge Priority Queue</span>
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-oracle-safe shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <span>Real-Time Fraud Webhook Alerts</span>
            </li>
          </ul>
        </div>

        <button onclick="startSolanaCheckout('tier_fleet')" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs shadow-lg shadow-purple-600/30 transition">
          Select Agent Fleet (0.20 SOL)
        </button>
      </div>

      <!-- High Frequency / Enterprise Tier -->
      <div class="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-surface-border hover:border-purple-500/50 transition duration-300">
        <div>
          <div class="flex items-center justify-between">
            <h3 class="font-extrabold text-lg text-white">Enterprise Oracle</h3>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-panel text-gray-400 border border-surface-border">AUTONOMOUS</span>
          </div>
          <div class="mt-4 flex items-baseline gap-2 font-mono">
            <span class="text-3xl font-extrabold text-white">0.75</span>
            <span class="text-oracle-solana font-bold text-lg">SOL</span>
          </div>
          <p class="text-xs text-purple-400 font-mono mt-1">150,000 Verified Scan Credits</p>
          <div class="text-[11px] text-gray-500 font-mono mt-0.5">~ 0.000005 SOL per pre-flight check</div>

          <ul class="my-6 space-y-2.5 text-xs text-gray-300 font-mono">
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-oracle-safe shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <span>Autonomous Marketplace Relays</span>
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-oracle-safe shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <span>Custom Threshold Overrides</span>
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-oracle-safe shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <span>Zero Rate Limiting SLA</span>
            </li>
          </ul>
        </div>

        <button onclick="startSolanaCheckout('tier_enterprise')" class="w-full py-2.5 rounded-xl bg-surface-panel hover:bg-purple-600 text-white font-mono font-bold text-xs transition border border-surface-border hover:border-purple-500">
          Select Enterprise (0.75 SOL)
        </button>
      </div>

    </div>
  </section>

  <!-- Solana Pay Checkout Modal -->
  <div id="solanaModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md hidden transition-all duration-300" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <div class="glass-panel-glow max-w-lg w-full rounded-2xl p-6 border border-purple-500/40 relative shadow-2xl">
      
      <!-- Close Button -->
      <button onclick="closeSolanaModal()" class="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-surface-panel transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <div class="flex items-center gap-3 mb-4">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-oracle-solana to-purple-600 p-[1px]">
          <div class="w-full h-full bg-surface-card rounded-[11px] flex items-center justify-center text-white">
            <svg class="w-4 h-4 text-oracle-solana" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l-10-5v6l10 5 10-5v-6l-10 5zm0 7l-10-5v6l10 5 10-5v-6l-10 5z"/></svg>
          </div>
        </div>
        <div>
          <h3 id="modalTitle" class="font-extrabold text-base text-white">Solana Pay Instant Top-Up</h3>
          <p class="text-xs text-gray-400 font-mono" id="modalTierSubtitle">Select a plan to generate on-chain invoice</p>
        </div>
      </div>

      <!-- Tier Selection Pills in Modal -->
      <div class="grid grid-cols-3 gap-2 mb-4">
        <button onclick="changeModalTier('tier_starter')" id="mTier-starter" class="p-2 rounded-lg bg-surface-panel border border-surface-border text-center font-mono transition">
          <div class="text-[10px] text-gray-400">Starter</div>
          <div class="text-xs font-bold text-white">0.05 SOL</div>
        </button>
        <button onclick="changeModalTier('tier_fleet')" id="mTier-fleet" class="p-2 rounded-lg bg-purple-950/70 border border-purple-600 text-center font-mono transition">
          <div class="text-[10px] text-purple-300">Fleet (25k)</div>
          <div class="text-xs font-bold text-white">0.20 SOL</div>
        </button>
        <button onclick="changeModalTier('tier_enterprise')" id="mTier-enterprise" class="p-2 rounded-lg bg-surface-panel border border-surface-border text-center font-mono transition">
          <div class="text-[10px] text-gray-400">Enterprise</div>
          <div class="text-xs font-bold text-white">0.75 SOL</div>
        </button>
      </div>

      <!-- Dynamic Inline SVG QR Code Display -->
      <div class="p-4 rounded-xl bg-surface-base border border-surface-border flex flex-col items-center justify-center text-center">
        <div id="qrCodeWrapper" class="p-2 rounded-xl bg-white shadow-xl flex items-center justify-center">
          <!-- Inline Generated SVG is injected here -->
          <div class="w-44 h-44 flex items-center justify-center text-xs text-gray-600 font-mono">Generating QR...</div>
        </div>
        
        <div class="mt-3 flex items-center gap-2">
          <span class="text-xs text-gray-400 font-mono">Amount:</span>
          <span id="modalAmountDisplay" class="font-bold text-oracle-solana font-mono text-sm">0.20 SOL</span>
        </div>

        <div class="mt-2 flex items-center gap-2 w-full">
          <input id="solanaUriInput" type="text" readonly class="bg-surface-card border border-surface-border text-gray-300 font-mono text-[10px] px-2.5 py-1.5 rounded-lg w-full truncate outline-none select-all">
          <button onclick="copySolanaUri()" class="px-2.5 py-1.5 rounded-lg bg-surface-panel hover:bg-surface-highlight text-gray-300 hover:text-white text-xs font-mono shrink-0 border border-surface-border">
            Copy URI
          </button>
        </div>
      </div>

      <!-- 1-Click Wallet Deep Links -->
      <div class="grid grid-cols-2 gap-2.5 my-4 font-mono text-xs">
        <a id="phantomLink" href="#" target="_blank" class="p-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800 text-purple-200 flex items-center justify-center gap-2 font-bold transition">
          <span>🟣 Open in Phantom</span>
        </a>
        <a id="solflareLink" href="#" target="_blank" class="p-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800 text-amber-200 flex items-center justify-center gap-2 font-bold transition">
          <span>🟠 Open in Solflare</span>
        </a>
      </div>

      <!-- Transaction Verification Form -->
      <div class="pt-3 border-t border-surface-border">
        <label class="block text-xs font-mono text-gray-300 mb-1.5 font-semibold">Verify On-Chain Transaction Signature</label>
        <div class="flex gap-2">
          <input id="txSignatureInput" type="text" placeholder="Paste 88-char Solana transaction signature..." class="bg-surface-base border border-surface-border focus:border-purple-500 text-white font-mono text-xs px-3 py-2 rounded-xl w-full outline-none">
          <button id="verifyTxBtn" onclick="verifySolanaPayment()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold shrink-0 shadow-md transition flex items-center gap-1.5">
            <span>Verify & Credit</span>
          </button>
        </div>
        <div class="flex items-center justify-between mt-2 text-[10px] text-gray-500 font-mono">
          <span>Instant edge settlement via RPC</span>
          <button onclick="simulateTestPayment()" class="text-purple-400 hover:underline">Simulate Test Tx</button>
        </div>
      </div>

    </div>
  </div>

  <!-- Footer -->
  <footer class="border-t border-surface-border bg-surface-base py-10 mt-auto text-xs text-gray-500 font-mono">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2 text-gray-400">
        <span class="font-bold text-white">Boardcheck Edge</span>
        <span>·</span>
        <span>AMS-001..AMS-005 Open Specification</span>
      </div>
      <div>
        <span>Global Edge Anti-Fraud Protocol &copy; 2026 Echolonius · Zero External Database Dependencies</span>
      </div>
    </div>
  </footer>

  <!-- Core Portal Logic, Scenarios, QR Code Generator & Config Generator -->
  <script>
    // Global State
    let currentApiKey = localStorage.getItem('bc_api_key') || '';
    let currentCredits = 100;
    let activeTab = 'claude';
    let currentModalTier = 'tier_fleet';
    let currentInvoice = null;

    // Toast Notification System
    function showToast(title, message, type = 'info', duration = 3500) {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      
      const colors = {
        success: { border: 'border-emerald-500/50', bg: 'bg-emerald-950/90', text: 'text-emerald-300', icon: '✓' },
        error: { border: 'border-red-500/50', bg: 'bg-red-950/90', text: 'text-red-300', icon: '✕' },
        warn: { border: 'border-amber-500/50', bg: 'bg-amber-950/90', text: 'text-amber-300', icon: '⚠' },
        info: { border: 'border-purple-500/50', bg: 'bg-purple-950/90', text: 'text-purple-300', icon: 'ℹ' }
      }[type] || { border: 'border-purple-500/50', bg: 'bg-purple-950/90', text: 'text-purple-300', icon: 'ℹ' };

      toast.className = 'toast-enter pointer-events-auto p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 ' + colors.border + ' ' + colors.bg;
      toast.innerHTML = \`
        <div class="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center font-mono font-bold text-xs shrink-0 \${colors.text}">
          \${colors.icon}
        </div>
        <div class="flex-grow overflow-hidden">
          <div class="font-bold text-xs text-white font-mono tracking-tight">\${title}</div>
          <div class="text-[11px] text-gray-300 mt-0.5 break-words font-sans">\${message}</div>
        </div>
      \`;

      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 250);
      }, duration);
    }

    // Zero-Dependency Pure JS QR Code SVG Generator
    function generateQRCodeSVG(data, size = 180) {
      // Galois Field GF(256) tables with primitive polynomial 0x11d
      const EXP = new Uint8Array(512);
      const LOG = new Uint8Array(256);
      for (let i = 0, x = 1; i < 255; i++) {
        EXP[i] = x;
        EXP[i + 255] = x;
        LOG[x] = i;
        x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
      }

      function gfMul(a, b) {
        if (a === 0 || b === 0) return 0;
        return EXP[LOG[a] + LOG[b]];
      }

      function gfPolyMul(p1, p2) {
        const res = new Uint8Array(p1.length + p2.length - 1);
        for (let i = 0; i < p1.length; i++) {
          for (let j = 0; j < p2.length; j++) {
            res[i + j] ^= gfMul(p1[i], p2[j]);
          }
        }
        return res;
      }

      function getGenPoly(deg) {
        let poly = new Uint8Array([1]);
        for (let i = 0; i < deg; i++) {
          poly = gfPolyMul(poly, new Uint8Array([1, EXP[i]]));
        }
        return poly;
      }

      function rsEncode(msgBytes, ecCount) {
        const gen = getGenPoly(ecCount);
        const msg = new Uint8Array(msgBytes.length + ecCount);
        msg.set(msgBytes);
        for (let i = 0; i < msgBytes.length; i++) {
          const coef = msg[i];
          if (coef !== 0) {
            for (let j = 0; j < gen.length; j++) {
              msg[i + j] ^= gfMul(gen[j], coef);
            }
          }
        }
        return msg.subarray(msgBytes.length);
      }

      const EC_M_TABLE = [
        null,
        { v: 1, totalData: 16, ecBytes: 10, blocks: 1, size: 21 },
        { v: 2, totalData: 28, ecBytes: 16, blocks: 1, size: 25 },
        { v: 3, totalData: 44, ecBytes: 26, blocks: 1, size: 29 },
        { v: 4, totalData: 64, ecBytes: 18, blocks: 2, size: 33 },
        { v: 5, totalData: 86, ecBytes: 24, blocks: 2, size: 37 },
        { v: 6, totalData: 108, ecBytes: 16, blocks: 4, size: 41 },
        { v: 7, totalData: 124, ecBytes: 18, blocks: 4, size: 45 },
        { v: 8, totalData: 154, ecBytes: 22, blocks: 4, size: 49 },
        { v: 9, totalData: 182, ecBytes: 22, blocks: 5, size: 53 },
        { v: 10, totalData: 216, ecBytes: 26, blocks: 5, size: 57 }
      ];

      const utf8 = [];
      for (let i = 0; i < data.length; i++) {
        let c = data.charCodeAt(i);
        if (c < 128) utf8.push(c);
        else if (c < 2048) utf8.push((c >> 6) | 192, (c & 63) | 128);
        else utf8.push((c >> 12) | 224, ((c >> 6) & 63) | 128, (c & 63) | 128);
      }

      let cfg = EC_M_TABLE[10];
      for (let v = 1; v <= 10; v++) {
        const c = EC_M_TABLE[v];
        const hBits = 4 + (v < 10 ? 8 : 16);
        if (hBits + utf8.length * 8 <= c.totalData * 8) {
          cfg = c;
          break;
        }
      }

      const bitStream = [];
      function pushBits(val, len) {
        for (let i = len - 1; i >= 0; i--) bitStream.push((val >> i) & 1);
      }

      pushBits(0b0100, 4); // Byte Mode
      pushBits(utf8.length, cfg.v < 10 ? 8 : 16);
      for (const b of utf8) pushBits(b, 8);

      const maxBits = cfg.totalData * 8;
      const termLen = Math.min(4, maxBits - bitStream.length);
      for (let i = 0; i < termLen; i++) bitStream.push(0);
      while (bitStream.length % 8 !== 0) bitStream.push(0);

      const pad = [0xec, 0x11];
      let pIdx = 0;
      while (bitStream.length < maxBits) {
        pushBits(pad[pIdx % 2], 8);
        pIdx++;
      }

      const dataBytes = new Uint8Array(cfg.totalData);
      for (let i = 0; i < cfg.totalData; i++) {
        let b = 0;
        for (let j = 0; j < 8; j++) b = (b << 1) | bitStream[i * 8 + j];
        dataBytes[i] = b;
      }

      const numBlocks = cfg.blocks;
      const blkDataLen = Math.floor(cfg.totalData / numBlocks);
      const ecLen = cfg.ecBytes;
      const dataBlocks = [];
      const ecBlocks = [];
      let offset = 0;

      for (let b = 0; b < numBlocks; b++) {
        const blk = dataBytes.subarray(offset, offset + blkDataLen);
        offset += blkDataLen;
        dataBlocks.push(blk);
        ecBlocks.push(rsEncode(blk, ecLen));
      }

      const finalBytes = [];
      for (let i = 0; i < blkDataLen; i++) {
        for (let b = 0; b < numBlocks; b++) finalBytes.push(dataBlocks[b][i]);
      }
      for (let i = 0; i < ecLen; i++) {
        for (let b = 0; b < numBlocks; b++) finalBytes.push(ecBlocks[b][i]);
      }

      const n = cfg.size;
      const matrix = Array.from({ length: n }, () => new Int8Array(n).fill(-1));

      function placeFinder(row, col) {
        for (let r = 0; r < 7; r++) {
          for (let c = 0; c < 7; c++) {
            matrix[row + r][col + c] = (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) ? 1 : 0;
          }
        }
        for (let r = -1; r <= 7; r++) {
          for (let c = -1; c <= 7; c++) {
            const nr = row + r, nc = col + c;
            if (nr >= 0 && nr < n && nc >= 0 && nc < n && (r === -1 || r === 7 || c === -1 || c === 7)) matrix[nr][nc] = 0;
          }
        }
      }

      placeFinder(0, 0);
      placeFinder(0, n - 7);
      placeFinder(n - 7, 0);

      for (let i = 8; i < n - 8; i++) {
        matrix[6][i] = i % 2 === 0 ? 1 : 0;
        matrix[i][6] = i % 2 === 0 ? 1 : 0;
      }

      const ALIGN = [[], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];
      const coords = ALIGN[cfg.v] || [];
      for (const r of coords) {
        for (const c of coords) {
          if (matrix[r][c] === -1) {
            for (let dr = -2; dr <= 2; dr++) {
              for (let dc = -2; dc <= 2; dc++) {
                matrix[r + dr][c + dc] = (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)) ? 1 : 0;
              }
            }
          }
        }
      }

      matrix[n - 8][8] = 1;

      for (let i = 0; i < 9; i++) {
        if (matrix[8][i] === -1) matrix[8][i] = 0;
        if (matrix[i][8] === -1) matrix[i][8] = 0;
      }
      for (let i = 0; i < 8; i++) {
        if (matrix[8][n - 1 - i] === -1) matrix[8][n - 1 - i] = 0;
        if (matrix[n - 1 - i][8] === -1) matrix[n - 1 - i][8] = 0;
      }

      const allBits = [];
      for (const byte of finalBytes) {
        for (let i = 7; i >= 0; i--) allBits.push((byte >> i) & 1);
      }

      let bitIdx = 0, dir = -1;
      for (let col = n - 1; col > 0; col -= 2) {
        if (col === 6) col--;
        const rows = dir === -1
          ? Array.from({ length: n }, (_, i) => n - 1 - i)
          : Array.from({ length: n }, (_, i) => i);

        for (const row of rows) {
          for (const c of [col, col - 1]) {
            if (matrix[row][c] === -1) {
              const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
              const mask = (row + c) % 2 === 0;
              matrix[row][c] = bit ^ (mask ? 1 : 0);
            }
          }
        }
        dir = -dir;
      }

      const FORMAT_M = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
      const tl = [[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
      for (let i = 0; i < 15; i++) matrix[tl[i][0]][tl[i][1]] = FORMAT_M[i];
      for (let i = 0; i < 7; i++) matrix[n - 1 - i][8] = FORMAT_M[i];
      for (let i = 0; i < 8; i++) matrix[8][n - 8 + i] = FORMAT_M[7 + i];

      const cellSize = (size / n);
      let pathD = '';
      for (let r = 0; r < n; r++) {
        let c = 0;
        while (c < n) {
          if (matrix[r][c] === 1) {
            let span = 1;
            while (c + span < n && matrix[r][c + span] === 1) span++;
            pathD += \`M\${(c * cellSize).toFixed(2)},\${(r * cellSize).toFixed(2)}h\${(span * cellSize).toFixed(2)}v\${cellSize.toFixed(2)}h-\${(span * cellSize).toFixed(2)}z \`;
            c += span;
          } else {
            c++;
          }
        }
      }

      return \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \${size} \${size}" width="\${size}" height="\${size}" class="rounded-xl shadow-inner bg-white">
        <rect width="100%" height="100%" fill="#ffffff" rx="6"/>
        <path d="\${pathD.trim()}" fill="#0b0f19" />
      </svg>\`;
    }

    // Scenario Data Presets
    const SCENARIOS = {
      ghost: [
        { id: "ghost-syndicate-01", created_at: "2026-08-18T04:12:00Z", views: 0, applications: 19, budget: 1400.0, has_escrow: false, has_payment_evidence: false },
        { id: "ghost-syndicate-02", created_at: "2026-08-18T04:15:30Z", views: 0, applications: 27, budget: 2200.0, has_escrow: false, has_payment_evidence: false },
        { id: "ghost-syndicate-03", created_at: "2026-08-18T04:18:10Z", views: 0, applications: 8, budget: 950.0, has_escrow: false, has_payment_evidence: false }
      ],
      escrow: [
        { id: "unpaid-trap-01", title: "Build Full Rust Solana Indexer", budget: 3500.0, has_escrow: false, has_payment_evidence: false, views: 45, applications: 1 },
        { id: "unpaid-trap-02", title: "Fine-tune 70B Model on Private Dataset", budget: 5000.0, has_escrow: false, has_payment_evidence: false, views: 80, applications: 3 }
      ],
      sybil: [
        { id: "sybil-bot-01", created_at: "2026-08-18T05:00:00.000Z", budget: 100, views: 10, applications: 0, has_escrow: true, has_payment_evidence: true },
        { id: "sybil-bot-02", created_at: "2026-08-18T05:00:00.120Z", budget: 100, views: 10, applications: 0, has_escrow: true, has_payment_evidence: true },
        { id: "sybil-bot-03", created_at: "2026-08-18T05:00:00.240Z", budget: 100, views: 10, applications: 0, has_escrow: true, has_payment_evidence: true },
        { id: "sybil-bot-04", created_at: "2026-08-18T05:00:00.360Z", budget: 100, views: 10, applications: 0, has_escrow: true, has_payment_evidence: true },
        { id: "sybil-bot-05", created_at: "2026-08-18T05:00:00.480Z", budget: 100, views: 10, applications: 0, has_escrow: true, has_payment_evidence: true }
      ],
      supply: [
        { id: "agent-ad-01", title: "Hire My Autonomous Python Scraper", is_self_advertisement: true, budget: 50, views: 30, applications: 0 },
        { id: "agent-ad-02", title: "24/7 Smart Contract Vulnerability Auditor", is_self_advertisement: true, budget: 200, views: 45, applications: 0 },
        { id: "agent-ad-03", title: "Automated Twitter Sentiment Scanner Bot", is_self_advertisement: true, budget: 80, views: 18, applications: 0 },
        { id: "real-job-01", title: "Need Fast Node.js SSE Gateway", is_self_advertisement: false, budget: 300, views: 95, applications: 2 }
      ],
      clean: [
        { id: "clean-bounty-01", title: "Build WebSocket Gateway for Drift Protocol", created_at: "2026-08-18T01:15:00Z", views: 142, applications: 3, budget: 750.0, has_escrow: true, has_payment_evidence: true },
        { id: "clean-bounty-02", title: "Optimize Cloudflare Worker KV caching layer", created_at: "2026-08-18T02:40:00Z", views: 88, applications: 2, budget: 450.0, has_escrow: true, has_payment_evidence: true },
        { id: "clean-bounty-03", title: "Write Type-Safe MCP SSE Server Transport", created_at: "2026-08-18T03:55:00Z", views: 64, applications: 1, budget: 300.0, has_escrow: true, has_payment_evidence: true }
      ]
    };

    function loadScenario(type) {
      const data = SCENARIOS[type] || SCENARIOS.clean;
      document.getElementById('jsonInput').value = JSON.stringify(data, null, 2);
      showToast('Scenario Loaded', 'Loaded "' + type.toUpperCase() + '" preset into editor. Executing audit...', 'info');
      runAudit();
    }

    function formatJson() {
      const input = document.getElementById('jsonInput');
      try {
        const parsed = JSON.parse(input.value);
        input.value = JSON.stringify(parsed, null, 2);
        showToast('JSON Formatted', 'Listing array formatted cleanly.', 'success');
      } catch (e) {
        showToast('Invalid JSON', e.message, 'error');
      }
    }

    function clearEditor() {
      document.getElementById('jsonInput').value = '';
      resetVisualizer();
      showToast('Cleared', 'Editor cleared.', 'info');
    }

    // Execute Audit against /api/v1/scan
    async function runAudit() {
      const raw = document.getElementById('jsonInput').value.trim();
      if (!raw) {
        showToast('Input Required', 'Please paste JSON listings or click one of the scenario presets.', 'warn');
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        showToast('JSON Parse Error', e.message, 'error');
        return;
      }

      const btn = document.getElementById('runAuditBtn');
      btn.disabled = true;
      btn.classList.add('opacity-75', 'cursor-not-allowed');

      const startTime = performance.now();
      const headers = { 'Content-Type': 'application/json' };
      if (currentApiKey) headers['Authorization'] = 'Bearer ' + currentApiKey;

      try {
        const res = await fetch('/api/v1/scan', {
          method: 'POST',
          headers,
          body: JSON.stringify(parsed)
        });

        const elapsed = (performance.now() - startTime).toFixed(1);
        document.getElementById('scanLatencyBadge').innerText = elapsed + 'ms edge';

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: 'HTTP ' + res.status }));
          showToast('Scan Failed', errData.error || 'Server error', 'error');
          return;
        }

        const report = await res.json();
        updateVisualizer(report, elapsed);
        showToast('Audit Complete', 'Evaluated ' + (report.coverage?.total_listings || 0) + ' listings in ' + elapsed + 'ms (' + report.verdict.toUpperCase() + ')', report.verdict === 'high_risk' ? 'error' : report.verdict === 'caution' ? 'warn' : 'success');
      } catch (err) {
        showToast('Network Error', err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.classList.remove('opacity-75', 'cursor-not-allowed');
      }
    }

    // Update Circular Gauge, AMS Matrix & Findings List
    function updateVisualizer(report, latency) {
      const findings = report.findings || [];
      const total = report.coverage?.total_listings || 0;
      const highCount = report.summary?.high || 0;
      const warnCount = report.summary?.warn || 0;

      // Update Coverage Counters
      document.getElementById('covTotalListings').innerText = total;
      document.getElementById('covHighRisk').innerText = highCount;
      document.getElementById('covWarnings').innerText = warnCount;

      // Compute 0-100 Risk Score
      let riskScore = 0;
      if (report.verdict === 'high_risk') {
        riskScore = Math.min(100, 65 + (highCount * 12) + (warnCount * 4));
      } else if (report.verdict === 'caution') {
        riskScore = Math.min(58, 30 + (warnCount * 10));
      } else {
        riskScore = Math.max(2, 10 - Math.min(8, total * 2)); // Clean
      }

      // Animate Circular SVG Gauge
      const circumference = 389.56;
      const offset = circumference - (riskScore / 100) * circumference;
      const arc = document.getElementById('riskGaugeArc');
      const scoreText = document.getElementById('gaugeScore');
      const labelText = document.getElementById('gaugeLabel');
      const titleText = document.getElementById('verdictSummaryTitle');

      arc.style.strokeDashoffset = offset;

      // Animate score counter
      animateCounter(scoreText, riskScore);

      if (riskScore <= 20) {
        arc.setAttribute('stroke', '#10b981');
        arc.style.filter = 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))';
        labelText.innerText = 'CLEAR / SAFE';
        labelText.className = 'text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest mt-0.5';
        titleText.innerHTML = '<span class="text-emerald-400 font-bold">✓ PASS: MARKETPLACE CLEAR</span>';
      } else if (riskScore <= 60) {
        arc.setAttribute('stroke', '#f59e0b');
        arc.style.filter = 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))';
        labelText.innerText = 'CAUTION';
        labelText.className = 'text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest mt-0.5';
        titleText.innerHTML = '<span class="text-amber-400 font-bold">⚠ CAUTION: ELEVATED RISKS DETECTED</span>';
      } else {
        arc.setAttribute('stroke', '#ef4444');
        arc.style.filter = 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.6))';
        labelText.innerText = 'CRITICAL';
        labelText.className = 'text-[11px] font-mono font-bold text-red-400 uppercase tracking-widest mt-0.5';
        titleText.innerHTML = '<span class="text-red-400 font-bold">🚨 CRITICAL: HIGH FRAUD RISK</span>';
      }

      // Update AMS Matrix Cards (AMS-001..AMS-005)
      const indicators = ['AMS-001', 'AMS-002', 'AMS-003', 'AMS-004', 'AMS-005'];
      indicators.forEach(id => {
        const match = findings.find(f => f.id === id);
        const card = document.getElementById('matrixCard-' + id);
        const badge = document.getElementById('badge-' + id);
        const stat = document.getElementById('stat-' + id);

        if (match) {
          const isHigh = match.severity === 'high';
          card.className = 'glass-panel rounded-xl p-5 border ' + (isHigh ? 'border-red-500/80 bg-red-950/20 shadow-lg shadow-red-950/50' : 'border-amber-500/80 bg-amber-950/20 shadow-lg shadow-amber-950/50') + ' flex flex-col justify-between transition-all duration-300';
          badge.innerText = isHigh ? 'FIRING (HIGH)' : 'FIRING (WARN)';
          badge.className = 'text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ' + (isHigh ? 'bg-red-950 text-red-300 border border-red-700 animate-pulse' : 'bg-amber-950 text-amber-300 border border-amber-700');
          stat.innerHTML = '<strong class="' + (isHigh ? 'text-red-400' : 'text-amber-400') + '">' + (match.affected_listing_ids?.length || 1) + ' flagged</strong>';
        } else {
          card.className = 'glass-panel rounded-xl p-5 border border-emerald-500/30 bg-emerald-950/10 flex flex-col justify-between transition-all duration-300';
          badge.innerText = 'CLEAR / PASS';
          badge.className = 'text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold';
          stat.innerHTML = '<span class="text-emerald-400">0 flagged</span>';
        }
      });

      // Update Detailed Findings List
      const findingsContainer = document.getElementById('findingsList');
      document.getElementById('findingsCountBadge').innerText = findings.length + ' findings';

      if (findings.length === 0) {
        findingsContainer.innerHTML = \`
          <div class="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2.5 text-emerald-300">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>All \${total} listings fully compliant with AMS-001..AMS-005 open market integrity specifications.</span>
            </div>
            <span class="text-[11px] text-emerald-400 font-bold">100% SAFE TO BID</span>
          </div>
        \`;
      } else {
        findingsContainer.innerHTML = findings.map(f => {
          const isHigh = f.severity === 'high';
          const badgeClass = isHigh ? 'bg-red-950/80 text-red-300 border-red-800' : 'bg-amber-950/80 text-amber-300 border-amber-800';
          const borderClass = isHigh ? 'border-red-900/60 bg-red-950/20' : 'border-amber-900/60 bg-amber-950/20';

          return \`
            <div class="p-3.5 rounded-xl border \${borderClass} text-left">
              <div class="flex items-center justify-between text-xs font-bold mb-1.5">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded font-mono \${badgeClass} border">\${f.id}</span>
                  <span class="text-gray-200">\${f.indicator}</span>
                </div>
                <span class="text-[10px] uppercase tracking-wider font-mono \${isHigh ? 'text-red-400' : 'text-amber-400'}">\${f.severity} SEVERITY</span>
              </div>
              <p class="text-xs text-gray-300 leading-relaxed">\${f.detail}</p>
              \${f.affected_listing_ids && f.affected_listing_ids.length > 0 ? \`
                <div class="mt-2 text-[11px] text-gray-400 flex items-center gap-2">
                  <span class="text-gray-500">Affected IDs:</span>
                  <div class="flex flex-wrap gap-1">
                    \${f.affected_listing_ids.map(id => \`<span class="px-1.5 py-0.5 rounded bg-surface-card border border-surface-border text-gray-300 font-mono">\${id}</span>\`).join('')}
                  </div>
                </div>
              \` : ''}
            </div>
          \`;
        }).join('');
      }
    }

    function animateCounter(elem, target) {
      let current = parseInt(elem.innerText) || 0;
      const step = target > current ? 1 : -1;
      const diff = Math.abs(target - current);
      if (diff === 0) return;
      const duration = 400;
      const interval = Math.max(10, Math.floor(duration / diff));

      const timer = setInterval(() => {
        current += step;
        elem.innerText = current;
        if (current === target) clearInterval(timer);
      }, interval);
    }

    function resetVisualizer() {
      document.getElementById('riskGaugeArc').style.strokeDashoffset = '389.56';
      document.getElementById('gaugeScore').innerText = '0';
      document.getElementById('gaugeLabel').innerText = 'STANDBY';
      document.getElementById('gaugeLabel').className = 'text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest mt-0.5';
      document.getElementById('verdictSummaryTitle').innerText = 'Ready for pre-flight verification';
      document.getElementById('covTotalListings').innerText = '0';
      document.getElementById('covHighRisk').innerText = '0';
      document.getElementById('covWarnings').innerText = '0';
      document.getElementById('findingsCountBadge').innerText = '0 findings';
      document.getElementById('findingsList').innerHTML = '<div class="p-4 rounded-xl bg-surface-base/50 border border-surface-border text-center text-xs text-gray-500">Run an audit or execute a preset scenario to view rule-level telemetry breakdowns.</div>';

      ['AMS-001', 'AMS-002', 'AMS-003', 'AMS-004', 'AMS-005'].forEach(id => {
        document.getElementById('matrixCard-' + id).className = 'glass-panel rounded-xl p-5 border border-surface-border flex flex-col justify-between transition-all duration-300';
        document.getElementById('badge-' + id).innerText = 'ARMED';
        document.getElementById('badge-' + id).className = 'text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-panel text-gray-400 border border-surface-border';
        document.getElementById('stat-' + id).innerHTML = '<span class="text-gray-500">0 listings flagged</span>';
      });
    }

    // 1-Click Multi-Agent Config Generator Tabs
    const CONFIG_TEMPLATES = {
      claude: {
        file: "~/Library/Application Support/Claude/claude_desktop_config.json",
        render: (key) => JSON.stringify({
          "mcpServers": {
            "boardcheck": {
              "url": "https://mcp.boardcheck.io/mcp",
              "headers": {
                "Authorization": "Bearer " + (key || "bc_live_your_api_key_here")
              }
            }
          }
        }, null, 2)
      },
      cursor: {
        file: ".cursor/mcp.json",
        render: (key) => JSON.stringify({
          "mcpServers": {
            "boardcheck-oracle": {
              "url": "https://mcp.boardcheck.io/mcp",
              "headers": {
                "Authorization": "Bearer " + (key || "bc_live_your_api_key_here")
              }
            }
          }
        }, null, 2)
      },
      antigravity: {
        file: "antigravity.yaml / boardcheck-tool.json",
        render: (key) => JSON.stringify({
          "name": "boardcheck-oracle",
          "description": "Pre-flight anti-fraud oracle and AMS-001..005 integrity auditor",
          "endpoint": "https://mcp.boardcheck.io/mcp",
          "transport": "sse",
          "auth": {
            "type": "bearer",
            "token": key || "bc_live_your_api_key_here"
          },
          "tools": ["scan_listings", "verify_task", "ams_spec_info"]
        }, null, 2)
      },
      python: {
        file: "agent_guard.py",
        render: (key) => \`import requests

API_KEY = "\${key || 'bc_live_your_api_key_here'}"
BASE_URL = "https://api.boardcheck.io/api/v1"

def preflight_verify(task_data: dict) -> bool:
    """Pre-flight check a marketplace listing before committing agent compute."""
    response = requests.post(
        f"{BASE_URL}/verify",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json=task_data,
        timeout=5.0
    )
    result = response.json()
    if not result.get("is_safe_to_execute", False):
        print(f"🚨 BLOCKED UNSAFE BOUNTY [{result.get('task_id')}]: {result.get('advisory')}")
        return False
        
    print(f"✅ APPROVED BOUNTY [{result.get('task_id')}]: Safe to execute.")
    return True

# Example Usage
if __name__ == "__main__":
    sample_bounty = {"id": "bounty-101", "budget": 1500, "has_escrow": True, "has_payment_evidence": True}
    preflight_verify(sample_bounty)\`
      },
      node: {
        file: "agent-guard.ts",
        render: (key) => \`import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const apiKey = "\${key || 'bc_live_your_api_key_here'}";
const transport = new SSEClientTransport(
  new URL("https://mcp.boardcheck.io/mcp"),
  { headers: { Authorization: \`Bearer \${apiKey}\` } }
);

const client = new Client({ name: "agent-guard", version: "1.0.0" }, { capabilities: {} });
await client.connect(transport);

// Call tool via Remote MCP
const verdict = await client.callTool({
  name: "verify_task",
  arguments: {
    id: "bounty-99",
    budget: 2500,
    has_escrow: false
  }
});

console.log("Oracle Verdict:", verdict);\`
      },
      curl: {
        file: "terminal / bash",
        render: (key) => \`# 1. Fast single-task pre-flight check
curl -X POST https://api.boardcheck.io/api/v1/verify \\
  -H "Authorization: Bearer \${key || 'bc_live_your_api_key_here'}" \\
  -H "Content-Type: application/json" \\
  -d '{"id":"bounty-404","budget":1500,"has_escrow":false,"has_payment_evidence":false}'

# 2. Bulk batch audit
curl -X POST https://api.boardcheck.io/api/v1/scan \\
  -H "Authorization: Bearer \${key || 'bc_live_your_api_key_here'}" \\
  -H "Content-Type: application/json" \\
  -d '[{"id":"job-1","views":0,"applications":18,"budget":500}]'\`
      }
    };

    function switchTab(tabId) {
      activeTab = tabId;
      const tabs = ['claude', 'cursor', 'antigravity', 'python', 'node', 'curl'];
      tabs.forEach(t => {
        const btn = document.getElementById('tabBtn-' + t);
        if (t === tabId) {
          btn.className = 'px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 bg-purple-600/30 text-purple-300 border border-purple-500/40';
        } else {
          btn.className = 'px-4 py-2 rounded-lg font-bold text-gray-400 hover:text-white transition flex items-center gap-2';
        }
      });

      renderCurrentConfig();
    }

    function renderCurrentConfig() {
      const tpl = CONFIG_TEMPLATES[activeTab] || CONFIG_TEMPLATES.claude;
      document.getElementById('tabFileLabel').innerText = tpl.file;
      const code = tpl.render(currentApiKey);
      document.getElementById('configCodeDisplay').innerText = code;
    }

    function onKeyInputChange(val) {
      currentApiKey = val.trim();
      if (currentApiKey) localStorage.setItem('bc_api_key', currentApiKey);
      syncKeyDisplay();
      renderCurrentConfig();
    }

    function copyCurrentTabConfig() {
      const code = document.getElementById('configCodeDisplay').innerText;
      navigator.clipboard.writeText(code).then(() => {
        showToast('Config Copied', 'Copied ' + activeTab.toUpperCase() + ' config to clipboard.', 'success');
      }).catch(err => {
        showToast('Copy Failed', err.message, 'error');
      });
    }

    // Free Trial Key Generator
    async function claimFreeTrialKey() {
      try {
        const res = await fetch('/api/v1/pay/free-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: 'web_visitor_' + Math.random().toString(36).substring(7) })
        });
        const data = await res.json();
        if (data.apiKey) {
          currentApiKey = data.apiKey;
          currentCredits = data.creditsRemaining || 100;
          localStorage.setItem('bc_api_key', currentApiKey);
          syncKeyDisplay();
          renderCurrentConfig();
          showToast('Free Key Issued!', '100 free credits added. Key: ' + currentApiKey, 'success', 5000);
        }
      } catch (err) {
        showToast('Error', err.message, 'error');
      }
    }

    function syncKeyDisplay() {
      if (currentApiKey) {
        document.getElementById('activeKeyDisplay').innerText = currentApiKey;
        document.getElementById('activeCreditsDisplay').innerText = currentCredits;
        document.getElementById('keyInterpolatorInput').value = currentApiKey;
      }
    }

    function copyActiveKey() {
      if (!currentApiKey) {
        showToast('No Key', 'Click "Free Trial Key" to issue one.', 'warn');
        return;
      }
      navigator.clipboard.writeText(currentApiKey).then(() => {
        showToast('Key Copied', currentApiKey, 'success');
      });
    }

    // Solana Pay Modal & Invoice Generation
    function openSolanaPayModal(tierId = 'tier_fleet') {
      currentModalTier = tierId;
      document.getElementById('solanaModal').classList.remove('hidden');
      updateModalTierSelection();
      fetchInvoice(tierId);
    }

    function closeSolanaModal() {
      document.getElementById('solanaModal').classList.add('hidden');
    }

    function startSolanaCheckout(tierId) {
      openSolanaPayModal(tierId);
    }

    function changeModalTier(tierId) {
      currentModalTier = tierId;
      updateModalTierSelection();
      fetchInvoice(tierId);
    }

    function updateModalTierSelection() {
      ['starter', 'fleet', 'enterprise'].forEach(t => {
        const btn = document.getElementById('mTier-' + t);
        if ('tier_' + t === currentModalTier) {
          btn.className = 'p-2 rounded-lg bg-purple-950/70 border border-purple-600 text-center font-mono transition shadow-sm';
        } else {
          btn.className = 'p-2 rounded-lg bg-surface-panel border border-surface-border text-center font-mono transition';
        }
      });
    }

    async function fetchInvoice(tierId) {
      try {
        const res = await fetch('/api/v1/pay/invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tierId })
        });
        const inv = await res.json();
        currentInvoice = inv;

        document.getElementById('modalAmountDisplay').innerText = inv.tier?.priceSol + ' SOL (' + inv.tier?.credits?.toLocaleString() + ' credits)';
        document.getElementById('solanaUriInput').value = inv.url;
        document.getElementById('modalTierSubtitle').innerText = inv.tier?.name + ' (' + inv.tier?.priceSol + ' SOL · ' + inv.tier?.credits?.toLocaleString() + ' credits)';

        // Deep links
        document.getElementById('phantomLink').href = inv.url;
        document.getElementById('solflareLink').href = inv.url;

        // Render zero-dependency pure SVG QR code
        const qrSvg = generateQRCodeSVG(inv.url, 180);
        document.getElementById('qrCodeWrapper').innerHTML = qrSvg;
      } catch (err) {
        showToast('Invoice Error', err.message, 'error');
      }
    }

    function copySolanaUri() {
      const uri = document.getElementById('solanaUriInput').value;
      if (uri) {
        navigator.clipboard.writeText(uri).then(() => {
          showToast('Solana Pay URI Copied', uri, 'success');
        });
      }
    }

    async function verifySolanaPayment() {
      const sig = document.getElementById('txSignatureInput').value.trim();
      if (!sig) {
        showToast('Signature Required', 'Please enter your Solana transaction signature.', 'warn');
        return;
      }

      const btn = document.getElementById('verifyTxBtn');
      btn.disabled = true;
      btn.innerHTML = '<span>Verifying...</span>';

      try {
        const res = await fetch('/api/v1/pay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signature: sig,
            tierId: currentModalTier,
            existingKey: currentApiKey || undefined
          })
        });

        const data = await res.json();
        if (data.success && data.apiKey) {
          currentApiKey = data.apiKey;
          currentCredits = data.creditsRemaining;
          localStorage.setItem('bc_api_key', currentApiKey);
          syncKeyDisplay();
          renderCurrentConfig();
          showToast('Payment Verified!', 'Added credits. Your API Key: ' + currentApiKey, 'success', 6000);
          closeSolanaModal();
        } else {
          showToast('Verification Notice', data.error || 'Signature not yet confirmed on RPC.', 'error');
        }
      } catch (err) {
        showToast('Verification Error', err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>Verify & Credit</span>';
      }
    }

    function simulateTestPayment() {
      const simSig = 'sim_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      document.getElementById('txSignatureInput').value = simSig;
      showToast('Simulated Tx Signature', 'Generated test devnet signature: ' + simSig, 'info');
    }

    // Keydown listener for modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSolanaModal();
    });

    // Initialize Default View
    window.addEventListener('DOMContentLoaded', () => {
      // Load clean scenario initially
      document.getElementById('jsonInput').value = JSON.stringify(SCENARIOS.ghost, null, 2);
      syncKeyDisplay();
      renderCurrentConfig();
    });
  </script>
</body>
</html>`;
}
