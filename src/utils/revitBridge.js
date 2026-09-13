// src/utils/revitBridge.js
/**
 * Dedicated Revit 2027 Pipeline Communication Bridge.
 * Supports direct localhost HTTP communication as well as
 * seamless backend relay proxy for HTTPS/Cloud preview environments.
 */

const CANDIDATE_PORTS = [8080, 8081, 8082, 8085, 8765];

/**
 * Pings candidate ports to discover if the Revit 2027 Add-in is running and listening.
 */
export async function pingRevitBridge(targetPort = 8080) {
  const portsToTry = targetPort 
    ? [Number(targetPort), ...CANDIDATE_PORTS.filter(p => p !== Number(targetPort))] 
    : CANDIDATE_PORTS;
  const attempts = [];

  for (const port of portsToTry) {
    // 1. Direct browser fetch to 127.0.0.1 (IPv4 loopback bypasses DNS/IPv6 delays)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`http://127.0.0.1:${port}/revit-sync/`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok && res.status === 200) {
        const data = await res.json().catch(() => ({}));
        return {
          online: true,
          port,
          mode: 'direct-ipv4',
          url: `http://127.0.0.1:${port}/revit-sync/`,
          data
        };
      } else {
        attempts.push(`127.0.0.1:${port} returned HTTP ${res.status}`);
      }
    } catch (directErr) {
      attempts.push(`127.0.0.1:${port} (${directErr.message || 'offline'})`);
    }

    // 2. Direct browser fetch to localhost
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`http://localhost:${port}/revit-sync/`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok && res.status === 200) {
        const data = await res.json().catch(() => ({}));
        return {
          online: true,
          port,
          mode: 'direct-localhost',
          url: `http://localhost:${port}/revit-sync/`,
          data
        };
      } else {
        attempts.push(`localhost:${port} returned HTTP ${res.status}`);
      }
    } catch {
      // ignore
    }

    // 3. Fallback: try server-side relay proxy (/api/revit-sync/status?port=...)
    try {
      const res = await fetch(`/api/revit-sync/status?port=${port}`);
      if (res.ok) {
        const data = await res.json();
        if (data.online) {
          return {
            online: true,
            port,
            mode: 'relayed',
            url: `http://localhost:${port}/revit-sync/`,
            data
          };
        } else if (data.status) {
          attempts.push(`proxy :${port} HTTP ${data.status}`);
        }
      }
    } catch {
      // ignore
    }
  }

  return {
    online: false,
    attempts,
    defaultPort: Number(targetPort) || 8080
  };
}

/**
 * Dispatches an optimized MPT Urban Allocation payload to Autodesk Revit 2027.
 */
export async function syncAllocationToRevit(payload, preferredPort = 8080) {
  const portsToTry = [preferredPort, ...CANDIDATE_PORTS.filter(p => p !== preferredPort)];
  let lastError = null;

  for (const port of portsToTry) {
    // 1. Direct browser fetch to Revit HttpListener
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`http://localhost:${port}/revit-sync/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => ({ status: 'success' }));
        return {
          success: true,
          port,
          channel: 'direct-localhost',
          url: `http://localhost:${port}/revit-sync/`,
          data
        };
      }
    } catch (err) {
      lastError = err;
    }

    // 2. Try IPv4 loopback directly
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`http://127.0.0.1:${port}/revit-sync/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => ({ status: 'success' }));
        return {
          success: true,
          port,
          channel: 'direct-ipv4',
          url: `http://127.0.0.1:${port}/revit-sync/`,
          data
        };
      }
    } catch (err) {
      lastError = err;
    }

    // 3. Fallback: Backend Node proxy endpoint
    try {
      const res = await fetch(`/api/revit-sync?port=${port}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          port,
          channel: 'node-proxy-relay',
          url: `http://localhost:${port}/revit-sync/`,
          data
        };
      }
    } catch (proxyErr) {
      lastError = proxyErr;
    }
  }

  return {
    success: false,
    error: lastError ? (lastError.message || String(lastError)) : 'Could not reach Revit on ports 8080/8081/8082'
  };
}
