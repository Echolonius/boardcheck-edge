export function renderWebPortal(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Boardcheck Edge — AI Agent Market Honesty Oracle</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          },
          colors: {
            brand: {
              50: '#f5f3ff',
              500: '#8b5cf6',
              600: '#7c3aed',
              700: '#6d28d9',
            }
          }
        }
      }
    }
  </script>
  <style>
    body { background-color: #0b0f19; color: #f1f5f9; }
    .glass-card {
      background: rgba(17, 24, 39, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
  </style>
</head>
<body class="min-h-screen flex flex-col font-sans selection:bg-purple-500 selection:text-white">

  <!-- Navigation -->
  <header class="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">
          BC
        </div>
        <div>
          <span class="font-bold text-lg tracking-tight">Boardcheck</span>
          <span class="text-xs ml-2 px-2 py-0.5 rounded-full bg-purple-950 text-purple-400 border border-purple-800 font-mono">Edge & Remote MCP</span>
        </div>
      </div>
      <div class="flex items-center gap-4 text-sm font-medium">
        <a href="#sandbox" class="text-gray-400 hover:text-white transition">Live Sandbox</a>
        <a href="#mcp" class="text-gray-400 hover:text-white transition">Remote MCP</a>
        <a href="#pricing" class="text-gray-400 hover:text-white transition">API Credits</a>
        <button onclick="getFreeKey()" class="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition font-medium shadow-md shadow-purple-600/30">
          Free API Key
        </button>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="max-w-6xl mx-auto px-4 pt-16 pb-12 text-center">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-800 text-purple-300 text-xs font-mono mb-6">
      <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
      Standard AMS-001..AMS-005 · Zero Server Maintenance
    </div>
    <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
      Audit AI Agent Marketplaces <span class="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Before You Bid</span>
    </h1>
    <p class="text-gray-400 text-lg max-w-2xl mx-auto mt-4">
      Detect ghost bounties, fake view metrics, batch-seeded listings, and unpaid work traps in real-time. Built for autonomous AI agents and developer fleets.
    </p>

    <!-- Key & Credits Status Banner -->
    <div id="keyBanner" class="hidden max-w-xl mx-auto mt-8 p-4 rounded-xl bg-purple-950/40 border border-purple-700/60 flex items-center justify-between text-left">
      <div>
        <div class="text-xs text-purple-400 font-mono">YOUR ACTIVE API KEY</div>
        <div id="activeKeyDisplay" class="font-mono text-sm text-white font-bold tracking-wider">bc_live_...</div>
      </div>
      <div class="text-right">
        <div class="text-xs text-gray-400 font-mono">CREDITS</div>
        <div id="activeCreditsDisplay" class="font-bold text-green-400 font-mono text-lg">100</div>
      </div>
    </div>
  </section>

  <!-- Main Interactive Sandbox -->
  <main id="sandbox" class="max-w-6xl mx-auto px-4 pb-16 grid md:grid-cols-2 gap-8 flex-grow">
    
    <!-- Input Panel -->
    <div class="glass-card rounded-2xl p-6 flex flex-col">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-bold text-lg text-white flex items-center gap-2">
          <span>Input Listing JSON</span>
        </h2>
        <div class="flex gap-2">
          <button onclick="loadSample('scam')" class="text-xs px-2.5 py-1 rounded-md bg-red-950/60 text-red-300 border border-red-800/80 hover:bg-red-900/60 transition">
            Load Fraud Sample
          </button>
          <button onclick="loadSample('clean')" class="text-xs px-2.5 py-1 rounded-md bg-green-950/60 text-green-300 border border-green-800/80 hover:bg-green-900/60 transition">
            Load Clean Sample
          </button>
        </div>
      </div>
      
      <textarea id="jsonInput" class="w-full flex-grow h-80 bg-gray-950 rounded-xl p-4 font-mono text-xs text-gray-300 border border-gray-800 focus:border-purple-500 focus:outline-none resize-none leading-relaxed" placeholder="Paste listing array JSON here..."></textarea>
      
      <div class="mt-4 flex items-center justify-between">
        <span class="text-xs text-gray-500 font-mono">Runs instantly on Edge</span>
        <button onclick="runAudit()" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition flex items-center gap-2">
          <span>Run Honest Audit</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
      </div>
    </div>

    <!-- Output / Verdict Panel -->
    <div class="glass-card rounded-2xl p-6 flex flex-col">
      <h2 class="font-bold text-lg text-white mb-4">Live Audit Verdict</h2>
      
      <div id="verdictContainer" class="flex-grow flex flex-col items-center justify-center border border-gray-800/80 rounded-xl p-6 bg-gray-950/50">
        <div class="text-gray-500 text-center">
          <div class="w-12 h-12 rounded-full bg-gray-900 mx-auto flex items-center justify-center text-gray-600 mb-3 font-mono">?</div>
          <p class="text-sm">Click "Run Honest Audit" or load a sample to inspect listings.</p>
        </div>
      </div>
    </div>

  </main>

  <!-- Remote MCP Integration Section -->
  <section id="mcp" class="border-t border-gray-800 bg-gray-950/40 py-16">
    <div class="max-w-6xl mx-auto px-4">
      <div class="max-w-2xl mb-8">
        <h2 class="text-2xl font-bold text-white">Remote MCP Integration</h2>
        <p class="text-gray-400 text-sm mt-1">Connect your Claude Desktop, Cursor, or Autonomous Agent in under 30 seconds.</p>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div class="glass-card rounded-2xl p-6">
          <div class="flex items-center justify-between mb-3">
            <span class="font-bold text-sm text-purple-400 font-mono">claude_desktop_config.json</span>
            <button onclick="copySnippet('claudeConfig')" class="text-xs text-gray-400 hover:text-white font-mono">Copy</button>
          </div>
          <pre id="claudeConfig" class="bg-gray-950 p-4 rounded-xl text-xs font-mono text-gray-300 overflow-x-auto border border-gray-800">{
  "mcpServers": {
    "boardcheck": {
      "url": "https://mcp.boardcheck.io/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}</pre>
        </div>

        <div class="glass-card rounded-2xl p-6">
          <div class="flex items-center justify-between mb-3">
            <span class="font-bold text-sm text-indigo-400 font-mono">Python Agent Pre-Flight Check</span>
            <button onclick="copySnippet('pythonSnippet')" class="text-xs text-gray-400 hover:text-white font-mono">Copy</button>
          </div>
          <pre id="pythonSnippet" class="bg-gray-950 p-4 rounded-xl text-xs font-mono text-gray-300 overflow-x-auto border border-gray-800">import requests

res = requests.post(
    "https://api.boardcheck.io/api/v1/verify",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={"id": "bounty-101", "budget": 500, "has_escrow": False}
)
if not res.json()["is_safe_to_execute"]:
    print("Blocked unsafe job:", res.json()["advisory"])</pre>
        </div>
      </div>
    </div>
  </section>

  <!-- Solana Pay Pricing Section -->
  <section id="pricing" class="border-t border-gray-800 py-16 max-w-6xl mx-auto px-4">
    <div class="text-center max-w-2xl mx-auto mb-12">
      <h2 class="text-3xl font-bold text-white">Direct On-Chain Credits (No KYC)</h2>
      <p class="text-gray-400 text-sm mt-2">Pay directly from your Phantom, Solflare, or agent wallet with SOL. Credits are credited to your API key automatically on-chain.</p>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
      
      <!-- Starter Pack -->
      <div class="glass-card rounded-2xl p-6 flex flex-col border border-gray-800 hover:border-purple-500/50 transition">
        <h3 class="font-bold text-lg text-white">Starter Pack</h3>
        <div class="text-2xl font-extrabold text-white mt-2 font-mono">0.05 SOL</div>
        <p class="text-xs text-gray-400 mt-1">5,000 Verified Scan Credits</p>
        <ul class="text-xs text-gray-300 my-6 space-y-2 flex-grow font-mono">
          <li>✓ All AMS-001..AMS-005 Checks</li>
          <li>✓ Remote MCP Server Access</li>
          <li>✓ 100ms Edge Latency</li>
        </ul>
        <button onclick="buyTier('tier_starter')" class="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-purple-600 text-white font-medium text-sm transition">
          Pay with Solana Pay
        </button>
      </div>

      <!-- Agent Fleet -->
      <div class="glass-card rounded-2xl p-6 flex flex-col border-2 border-purple-500 relative">
        <div class="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider font-mono">Popular</div>
        <h3 class="font-bold text-lg text-white">Agent Fleet</h3>
        <div class="text-2xl font-extrabold text-white mt-2 font-mono">0.20 SOL</div>
        <p class="text-xs text-gray-400 mt-1">25,000 Verified Scan Credits</p>
        <ul class="text-xs text-gray-300 my-6 space-y-2 flex-grow font-mono">
          <li>✓ High-Volume Pre-Flight Checks</li>
          <li>✓ Dedicated Edge Priority</li>
          <li>✓ Real-Time Fraud Webhook Alerts</li>
        </ul>
        <button onclick="buyTier('tier_fleet')" class="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition shadow-lg shadow-purple-600/30">
          Pay with Solana Pay
        </button>
      </div>

      <!-- High Frequency -->
      <div class="glass-card rounded-2xl p-6 flex flex-col border border-gray-800 hover:border-purple-500/50 transition">
        <h3 class="font-bold text-lg text-white">High Frequency</h3>
        <div class="text-2xl font-extrabold text-white mt-2 font-mono">0.75 SOL</div>
        <p class="text-xs text-gray-400 mt-1">150,000 Verified Scan Credits</p>
        <ul class="text-xs text-gray-300 my-6 space-y-2 flex-grow font-mono">
          <li>✓ Fleet Autonomous Operators</li>
          <li>✓ Unlimited Concurrency</li>
          <li>✓ Custom Threshold Overrides</li>
        </ul>
        <button onclick="buyTier('tier_enterprise')" class="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-purple-600 text-white font-medium text-sm transition">
          Pay with Solana Pay
        </button>
      </div>

    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-gray-900 bg-gray-950 py-8 text-center text-xs text-gray-500">
    <p>Boardcheck Standard &copy; 2026 Echolonius · Open Specification & Edge Defense Protocol</p>
  </footer>

  <script>
    let currentApiKey = localStorage.getItem('bc_api_key') || '';

    const sampleScam = [
      { id: "job-1", created_at: "2026-08-17T12:00:00Z", views: 0, applications: 18, budget: 1500.0, has_escrow: false, has_payment_evidence: false },
      { id: "job-2", created_at: "2026-08-17T12:00:00Z", views: 0, applications: 22, budget: 2000.0, has_escrow: false, has_payment_evidence: false },
      { id: "job-3", created_at: "2026-08-17T12:00:00Z", views: 0, applications: 5, budget: 1800.0, has_escrow: false, has_payment_evidence: false },
      { id: "job-4", created_at: "2026-08-17T12:00:00Z", views: 0, applications: 9, budget: 1900.0, has_escrow: false, has_payment_evidence: false }
    ];

    const sampleClean = [
      { id: "job-clean-1", created_at: "2026-08-17T09:14:22Z", views: 85, applications: 4, budget: 250.0, has_escrow: true, has_payment_evidence: true },
      { id: "job-clean-2", created_at: "2026-08-17T11:42:05Z", views: 120, applications: 6, budget: 300.0, has_escrow: true, has_payment_evidence: true },
      { id: "job-clean-3", created_at: "2026-08-17T14:08:50Z", views: 45, applications: 2, budget: 180.0, has_escrow: true, has_payment_evidence: true }
    ];

    function loadSample(type) {
      document.getElementById('jsonInput').value = JSON.stringify(type === 'scam' ? sampleScam : sampleClean, null, 2);
    }

    async function getFreeKey() {
      try {
        const res = await fetch('/api/v1/pay/free-key', { method: 'POST' });
        const data = await res.json();
        if (data.apiKey) {
          currentApiKey = data.apiKey;
          localStorage.setItem('bc_api_key', currentApiKey);
          document.getElementById('keyBanner').classList.remove('hidden');
          document.getElementById('activeKeyDisplay').innerText = data.apiKey;
          document.getElementById('activeCreditsDisplay').innerText = data.creditsRemaining;
          alert('Generated Free API Key with 100 credits: ' + data.apiKey);
        }
      } catch (err) {
        alert('Error generating key: ' + err.message);
      }
    }

    async function runAudit() {
      const raw = document.getElementById('jsonInput').value.trim();
      if (!raw) {
        alert('Please paste or load sample listings JSON first.');
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        alert('Invalid JSON: ' + e.message);
        return;
      }

      const headers = { 'Content-Type': 'application/json' };
      if (currentApiKey) headers['Authorization'] = 'Bearer ' + currentApiKey;

      try {
        const res = await fetch('/api/v1/scan', {
          method: 'POST',
          headers,
          body: JSON.stringify(parsed)
        });
        const report = await res.json();
        renderReport(report);
      } catch (err) {
        alert('Scan failed: ' + err.message);
      }
    }

    function renderReport(report) {
      const c = document.getElementById('verdictContainer');
      const isHighRisk = report.verdict === 'high_risk';
      const isCaution = report.verdict === 'caution';

      const color = isHighRisk ? 'text-red-400 bg-red-950/60 border-red-800' : isCaution ? 'text-yellow-400 bg-yellow-950/60 border-yellow-800' : 'text-green-400 bg-green-950/60 border-green-800';
      const title = isHighRisk ? 'HIGH RISK DETECTED' : isCaution ? 'CAUTION ADVISED' : 'MARKETPLACE CLEAR';

      let findingsHtml = report.findings.map(f => \`
        <div class="p-3 rounded-lg bg-gray-900/90 border border-gray-800 text-left mb-2">
          <div class="flex items-center justify-between text-xs font-mono font-bold \${f.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}">
            <span>\${f.id} · \${f.indicator}</span>
            <span class="uppercase">\${f.severity}</span>
          </div>
          <p class="text-xs text-gray-300 mt-1.5">\${f.detail}</p>
        </div>
      \`).join('');

      if (!findingsHtml) findingsHtml = '<p class="text-xs text-green-400 font-mono">No deceptive anomalies or unpaid work patterns detected.</p>';

      c.innerHTML = \`
        <div class="w-full flex flex-col h-full">
          <div class="p-4 rounded-xl border \${color} font-bold text-center text-sm font-mono tracking-wider mb-4">
            \${title}
          </div>
          <div class="text-xs text-gray-400 font-mono mb-3 flex justify-between">
            <span>Listings Assessed: \${report.coverage.total_listings}</span>
            <span>High: \${report.summary.high} · Warn: \${report.summary.warn}</span>
          </div>
          <div class="flex-grow overflow-y-auto max-h-60 space-y-2">
            \${findingsHtml}
          </div>
        </div>
      \`;
    }

    async function buyTier(tierId) {
      try {
        const res = await fetch('/api/v1/pay/invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tierId })
        });
        const inv = await res.json();
        const txSig = prompt('Solana Pay Transfer URL generated:\\n' + inv.url + '\\n\\nAfter sending ' + inv.tier.priceSol + ' SOL to ' + inv.recipient + ', paste the transaction signature here:');
        
        if (txSig && txSig.trim()) {
          const verifyRes = await fetch('/api/v1/pay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ signature: txSig.trim(), tierId })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            currentApiKey = verifyData.apiKey;
            localStorage.setItem('bc_api_key', currentApiKey);
            document.getElementById('keyBanner').classList.remove('hidden');
            document.getElementById('activeKeyDisplay').innerText = verifyData.apiKey;
            document.getElementById('activeCreditsDisplay').innerText = verifyData.creditsRemaining;
            alert('Payment Verified on Solana! Your API key is: ' + verifyData.apiKey);
          } else {
            alert('Verification notice: ' + verifyData.error);
          }
        }
      } catch (err) {
        alert('Payment flow error: ' + err.message);
      }
    }

    function copySnippet(id) {
      const text = document.getElementById(id).innerText;
      navigator.clipboard.writeText(text);
      alert('Copied snippet to clipboard!');
    }
  </script>
</body>
</html>`;
}
