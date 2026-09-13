import { useState } from 'react';
import { Network, Copy, Check, Send, Activity, HelpCircle, ExternalLink } from 'lucide-react';
import { pingRevitBridge, syncAllocationToRevit } from '../utils/revitBridge';

export default function RevitSyncStatusBadge({
  lastPayload,
  simulatedSync,
  setSimulatedSync,
  syncStatus
}) {
  const [copied, setCopied] = useState(false);
  const [pingResult, setPingResult] = useState(null);
  const [isPinging, setIsPinging] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [showPayload, setShowPayload] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [targetPort, setTargetPort] = useState(8080);

  const testConnection = async () => {
    setIsPinging(true);
    setPingResult(`Checking Revit 2027 bridge on port ${targetPort}...`);
    try {
      const outcome = await pingRevitBridge(targetPort);
      if (outcome.online) {
        setPingResult(`✅ Revit 2027 Bridge ONLINE on port ${outcome.port} (mode: ${outcome.mode})`);
        if (outcome.port !== targetPort) {
          setTargetPort(outcome.port);
        }
      } else {
        setPingResult(
          `⚠️ Revit Add-in not responding on port ${targetPort} or fallback ports. Ensure Revit 2027 is open with ArchFin add-in loaded.`
        );
      }
    } catch (err) {
      setPingResult(`⚠️ Connection error: ${err.message}`);
    } finally {
      setIsPinging(false);
    }
  };

  const dispatchToRevit = async () => {
    setIsSending(true);
    setSendResult(`Transmitting allocation payload to Revit 2027...`);
    const payload = lastPayload || {
      residential: "33.3",
      commercial: "33.3",
      industrial: "33.4",
      alertText: "Manual trigger from ArchFin Web Dashboard",
      targetFar: 4.5,
      sharpeRatio: 1.88,
      timestamp: new Date().toISOString()
    };

    try {
      // Also copy to clipboard so Revit's 'Force Recalculation' button can load it instantly
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(JSON.stringify(payload)).catch(() => {});
      }

      const outcome = await syncAllocationToRevit(payload, targetPort);
      if (outcome.success) {
        if (outcome.channel === 'file-bridge') {
          setSendResult(`📁 Synced via Local File Bridge (%TEMP%\\archfin_mpt_payload.json)! Click 'Force Revit Canvas Recalculation' in Revit or check add-in auto-sync.`);
        } else {
          setSendResult(`✅ Success! Synced with Revit 2027 on port ${outcome.port} via ${outcome.channel}.`);
        }
      } else {
        setSendResult(`❌ Sync failed: ${outcome.error}. Ensure Revit 2027 is open with ArchFin add-in loaded.`);
      }
    } catch (err) {
      setSendResult(`❌ Error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const curlCommand = `curl -X POST http://localhost:${targetPort}/revit-sync/ \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(
    lastPayload || {
      residential: "33.3",
      commercial: "33.3",
      industrial: "33.4",
      alertText: "Macro-Optimized weights generated successfully.",
      targetFar: 4.5,
      timestamp: new Date().toISOString()
    }
  )}'`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#cba6f7]/15 text-[#cba6f7] rounded-md">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#cdd6f4]">Revit 2027 Live Pipeline Bridge</h3>
            <p className="text-xs text-[#a6adc8]">Asynchronous Background HttpListener & ExternalEvent</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Port Selector */}
          <div className="flex items-center gap-1 bg-[#11111b] p-1 rounded border border-[#313244] text-xs">
            <span className="text-[#a6adc8] px-1 font-mono text-[11px]">Port:</span>
            {[8080, 8081, 8082, 8765].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setTargetPort(p)}
                className={`px-1.5 py-0.5 rounded font-mono text-[11px] transition-colors cursor-pointer ${
                  targetPort === p
                    ? 'bg-[#89b4fa] text-[#11111b] font-bold'
                    : 'text-[#a6adc8] hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 text-xs text-[#a6adc8] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={simulatedSync}
              onChange={(e) => setSimulatedSync(e.target.checked)}
              className="rounded accent-[#a6e3a1]"
            />
            <span>Virtual</span>
          </label>

          <button
            type="button"
            onClick={testConnection}
            disabled={isPinging}
            className="flex items-center gap-1 text-xs bg-[#313244] hover:bg-[#45475a] text-[#89b4fa] font-semibold px-2.5 py-1.5 rounded border border-[#45475a] transition-colors cursor-pointer"
            title="Scan and ping Revit 2027 bridge"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isPinging ? 'Pinging...' : `Ping :${targetPort}`}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const p = lastPayload || {
                residential: "33.3",
                commercial: "33.3",
                industrial: "33.4",
                alertText: "Macro-Optimized weights generated successfully.",
                targetFar: 4.5,
                timestamp: new Date().toISOString()
              };
              navigator.clipboard?.writeText(JSON.stringify(p, null, 2));
              setSendResult("📋 Copied MPT Payload to Windows Clipboard! Switch to Revit and click 'Force Revit Canvas Recalculation'.");
            }}
            className="flex items-center gap-1 text-xs bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] px-2.5 py-1.5 rounded border border-[#45475a] transition-colors cursor-pointer"
            title="Copy current MPT JSON payload to clipboard for instant Revit pickup"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy JSON</span>
          </button>

          <button
            type="button"
            onClick={dispatchToRevit}
            disabled={isSending}
            className="flex items-center gap-1 text-xs bg-[#a6e3a1] hover:bg-[#94d98e] text-[#11111b] font-bold px-3 py-1.5 rounded transition-colors cursor-pointer shadow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? 'Sending...' : '⚡ Push to Revit'}</span>
          </button>
        </div>
      </div>

      {/* Ping or Send result notifications */}
      {pingResult && (
        <div className="text-xs font-mono bg-[#11111b] border border-[#313244] p-2.5 rounded text-[#f9e2af]">
          {pingResult}
        </div>
      )}

      {sendResult && (
        <div className={`text-xs font-mono p-2.5 rounded border ${
          sendResult.startsWith('✅') 
            ? 'bg-[#a6e3a1]/10 border-[#a6e3a1]/30 text-[#a6e3a1]'
            : 'bg-[#f38ba8]/10 border-[#f38ba8]/30 text-[#f38ba8]'
        }`}>
          {sendResult}
        </div>
      )}

      {/* Status Bar */}
      <div className="bg-[#181825] p-3 rounded-lg border border-[#313244] flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              simulatedSync || syncStatus === 'connected'
                ? 'bg-[#a6e3a1] ring-2 ring-[#a6e3a1]/30 animate-pulse'
                : 'bg-[#f9e2af]'
            }`}
          />
          <span className="text-[#a6adc8]">
            Endpoint:{' '}
            <a
              href={`http://localhost:${targetPort}/revit-sync/`}
              target="_blank"
              rel="noreferrer"
              className="text-[#cba6f7] hover:underline bg-[#11111b] px-1.5 py-0.5 rounded font-mono inline-flex items-center gap-1"
            >
              <span>http://localhost:{targetPort}/revit-sync/</span>
              <ExternalLink className="w-3 h-3 text-[#a6adc8]" />
            </a>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="text-[#a6adc8] hover:text-white cursor-pointer font-medium flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Pipeline Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPayload(!showPayload)}
            className="text-[#89b4fa] hover:underline cursor-pointer font-medium"
          >
            {showPayload ? 'Hide Payload Spec' : 'Inspect JSON Payload'}
          </button>
        </div>
      </div>

      {/* Troubleshooting and Architecture Guide */}
      {showHelp && (
        <div className="bg-[#11111b] p-4 rounded-lg border border-[#313244] text-xs space-y-2 text-[#a6adc8]">
          <h4 className="font-bold text-[#cdd6f4] text-sm">How the Revit 2027 Pipeline Works:</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>Add-in Launch:</strong> When Revit starts, <code className="text-[#89b4fa]">App.cs</code> launches a background <code className="text-[#cba6f7]">HttpListener</code> on <code className="text-[#a6e3a1]">http://localhost:8080/revit-sync/</code> (with fallback to 8081).</li>
            <li><strong>Direct Web Streaming:</strong> Clicking <em>Execute Multi-Agent Optimization</em> or <em>⚡ Push to Revit</em> dispatches the JSON allocations directly to that port.</li>
            <li><strong>Thread-Safe Execution:</strong> Because Revit API forbids direct model manipulation from background threads, the add-in enqueues the payload into an <code className="text-[#cba6f7]">ExternalEvent</code> which executes an active transaction on Revit's main UI thread.</li>
            <li><strong>Testing Endpoint:</strong> If you visit <a href={`http://localhost:${targetPort}/revit-sync/`} target="_blank" rel="noreferrer" className="text-[#89b4fa] underline">http://localhost:{targetPort}/revit-sync/</a> in your browser, the add-in serves a live status confirmation page.</li>
          </ol>
        </div>
      )}

      {/* JSON Payload Inspection & cURL */}
      {showPayload && (
        <div className="bg-[#11111b] p-3 rounded-lg border border-[#313244] text-xs font-mono">
          <div className="flex items-center justify-between text-[#6c7086] mb-1.5 font-bold">
            <span>DISPATCHED JSON PAYLOAD</span>
            <button
              type="button"
              onClick={copyCurl}
              className="flex items-center gap-1 text-[#89b4fa] hover:text-white cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#a6e3a1]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy cURL'}</span>
            </button>
          </div>
          <pre className="text-[#a6e3a1] overflow-x-auto text-[11px] leading-tight">
            {JSON.stringify(
              lastPayload || {
                residential: "33.3",
                commercial: "33.3",
                industrial: "33.4",
                alertText: "Macro-Optimized weights generated successfully.",
                targetFar: 4.5,
                timestamp: new Date().toISOString()
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
