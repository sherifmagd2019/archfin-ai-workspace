// src/components/RevitSyncStatusBadge.jsx
import React, { useState } from 'react';

export default function RevitSyncStatusBadge({ 
  lastPayload, 
  simulatedSync, 
  setSimulatedSync 
}) {
  const [testStatus, setTestStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const testRevitConnection = async () => {
    setIsTesting(true);
    setTestStatus("Pinging http://localhost:8080/revit-sync/ ...");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch("http://localhost:8080/revit-sync/", {
        method: "OPTIONS",
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setTestStatus("Connected! Revit 2027 Add-in HttpListener is actively responding on port 8080.");
      } else {
        setTestStatus(`HTTP ${res.status}: Connected, received unexpected status.`);
      }
    } catch (err) {
      setTestStatus("Standby. Revit 2027 Add-in is not currently running on localhost:8080. (You can enable 'Virtual Revit Simulator' below for standalone development).");
    } finally {
      setIsTesting(false);
    }
  };

  const curlCommand = `curl -X POST http://localhost:8080/revit-sync/ \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(lastPayload || { residential: "33.3", commercial: "33.3", industrial: "33.4", alertText: "Macro-Optimized weights" })}'`;

  return (
    <div style={{ background: '#1e1e2e', borderRadius: '12px', border: '1px solid #313244', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            display: 'inline-block', 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            background: simulatedSync ? '#a6e3a1' : '#f9e2af',
            boxShadow: `0 0 8px ${simulatedSync ? '#a6e3a1' : '#f9e2af'}`
          }} />
          <h4 style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#bac2de' }}>
            Revit 2027 Process Lifetime Bridge
          </h4>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '11px', color: '#a6adc8', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={simulatedSync} 
              onChange={(e) => setSimulatedSync(e.target.checked)}
              style={{ accentColor: '#a6e3a1' }}
            />
            Virtual Revit Mode
          </label>

          <button 
            onClick={testRevitConnection}
            disabled={isTesting}
            style={{
              background: '#313244',
              color: '#89b4fa',
              border: '1px solid #45475a',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {isTesting ? 'Pinging...' : 'Ping :8080'}
          </button>
        </div>
      </div>

      {testStatus && (
        <div style={{ background: '#11111b', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', color: '#f9e2af', marginBottom: '12px', fontFamily: 'monospace' }}>
          {testStatus}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#181825', padding: '10px 14px', borderRadius: '8px', border: '1px solid #313244' }}>
        <div style={{ fontSize: '12px', color: '#a6adc8' }}>
          Pipeline Endpoint: <code style={{ color: '#cba6f7', background: '#11111b', padding: '2px 6px', borderRadius: '4px' }}>http://localhost:8080/revit-sync/</code>
        </div>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          style={{ background: 'transparent', border: 'none', color: '#89b4fa', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {showDetails ? 'Hide Payload Spec' : 'Inspect JSON Payload'}
        </button>
      </div>

      {showDetails && (
        <div style={{ marginTop: '12px', background: '#11111b', padding: '12px', borderRadius: '8px', border: '1px solid #313244' }}>
          <div style={{ fontSize: '11px', color: '#6c7086', marginBottom: '6px', fontWeight: 'bold' }}>
            LAST DISPATCHED PAYLOAD (C# UrbanAllocationPayload schema):
          </div>
          <pre style={{ margin: 0, fontSize: '11px', color: '#a6e3a1', fontFamily: 'monospace', overflowX: 'auto' }}>
            {JSON.stringify(lastPayload || {
              residential: "33.3",
              commercial: "33.3",
              industrial: "33.4",
              alertText: "Macro-Optimized weights generated successfully.",
              targetFar: 4.5,
              timestamp: new Date().toISOString()
            }, null, 2)}
          </pre>

          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #313244' }}>
            <div style={{ fontSize: '10px', color: '#6c7086', marginBottom: '4px' }}>TEST VIA CLI (cURL):</div>
            <pre style={{ margin: 0, fontSize: '10px', color: '#89b4fa', fontFamily: 'monospace', overflowX: 'auto', background: '#181825', padding: '6px', borderRadius: '4px' }}>
              {curlCommand}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
