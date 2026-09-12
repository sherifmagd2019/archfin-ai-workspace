import { useState } from 'react';
import { Network, Copy, Check } from 'lucide-react';

export default function RevitSyncStatusBadge({
  lastPayload,
  simulatedSync,
  setSimulatedSync,
  syncStatus
}) {
  const [copied, setCopied] = useState(false);
  const [pingResult, setPingResult] = useState(null);
  const [isPinging, setIsPinging] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  const testConnection = async () => {
    setIsPinging(true);
    setPingResult("Connecting to http://localhost:8080/revit-sync/ ...");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch("http://localhost:8080/revit-sync/", {
        method: "OPTIONS",
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setPingResult("Revit 2027 Nice3point HttpListener online on port 8080!");
      } else {
        setPingResult(`HTTP ${res.status}: Connected, server responded.`);
      }
    } catch {
      setPingResult("Revit Add-in not responding on localhost:8080. Using Virtual Revit mode.");
    } finally {
      setIsPinging(false);
    }
  };

  const curlCommand = `curl -X POST http://localhost:8080/revit-sync/ \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(
    lastPayload || {
      residential: "33.3",
      commercial: "33.3",
      industrial: "33.4",
      alertText: "Macro-Optimized weights generated successfully."
    }
  )}'`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#cba6f7]/15 text-[#cba6f7] rounded-md">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#cdd6f4]">Revit 2027 Process Lifetime Bridge</h3>
            <p className="text-xs text-[#a6adc8]">Asynchronous Background HttpListener & ExternalEvent</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-[#a6adc8] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={simulatedSync}
              onChange={(e) => setSimulatedSync(e.target.checked)}
              className="rounded accent-[#a6e3a1]"
            />
            <span>Virtual Revit Mode</span>
          </label>

          <button
            type="button"
            onClick={testConnection}
            disabled={isPinging}
            className="text-xs bg-[#313244] hover:bg-[#45475a] text-[#89b4fa] font-semibold px-2.5 py-1 rounded border border-[#45475a] transition-colors cursor-pointer"
          >
            {isPinging ? 'Pinging...' : 'Ping :8080'}
          </button>
        </div>
      </div>

      {pingResult && (
        <div className="text-xs font-mono bg-[#11111b] border border-[#313244] p-2 rounded text-[#f9e2af] mb-3">
          {pingResult}
        </div>
      )}

      <div className="bg-[#181825] p-3 rounded-lg border border-[#313244] flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              simulatedSync || syncStatus === 'connected'
                ? 'bg-[#a6e3a1] ring-2 ring-[#a6e3a1]/30'
                : 'bg-[#f9e2af]'
            }`}
          />
          <span className="text-[#a6adc8]">
            Target:{' '}
            <code className="text-[#cba6f7] bg-[#11111b] px-1.5 py-0.5 rounded font-mono">
              http://localhost:8080/revit-sync/
            </code>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowPayload(!showPayload)}
          className="text-[#89b4fa] hover:underline cursor-pointer font-medium"
        >
          {showPayload ? 'Hide Payload Spec' : 'Inspect JSON Payload'}
        </button>
      </div>

      {showPayload && (
        <div className="mt-3 bg-[#11111b] p-3 rounded-lg border border-[#313244] text-xs font-mono">
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
