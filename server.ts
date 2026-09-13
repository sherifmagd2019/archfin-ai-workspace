import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import dotenv from 'dotenv';
import { orchestrateAgents } from './backend-api/src/middleware/orchestrator.js';

dotenv.config();

function saveMptPayloadToFile(payload: any) {
  try {
    const jsonStr = JSON.stringify(payload, null, 2);
    const tempFile = path.join(os.tmpdir(), 'archfin_mpt_payload.json');
    fs.writeFileSync(tempFile, jsonStr, 'utf-8');
    
    const backendFile = path.join(process.cwd(), 'backend', 'mpt_payload.json');
    fs.writeFileSync(backendFile, jsonStr, 'utf-8');
    console.log(`[Bridge] Saved MPT payload to ${tempFile}`);
    return true;
  } catch (err: any) {
    console.warn(`[Bridge] Failed saving payload to disk: ${err.message}`);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Request logging
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
      });
    }
    next();
  });

  // Multi-Agent API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'ArchFin AI Multi-Agent Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      nebius: {
        configured: !!process.env.NEBIUS_API_KEY,
        apiUrl: process.env.NEBIUS_API_URL || 'https://api.studio.nebius.ai/v1'
      }
    });
  });

  app.post('/api/optimize', async (req, res, next) => {
    try {
      const result = await orchestrateAgents(req.body || {});
      
      // Auto-save the optimization output for Revit file-bridge sync
      if (result && result.solution) {
        saveMptPayloadToFile({
          residentialWeight: (result.solution.weights?.residential ?? 0.689) * 100,
          commercialWeight: (result.solution.weights?.commercial ?? 0.185) * 100,
          industrialWeight: (result.solution.weights?.industrial ?? 0.126) * 100,
          expectedReturn: result.solution.expectedReturn ?? 0.074,
          volatility: result.solution.volatility ?? 0.0565,
          sharpeRatio: result.solution.sharpeRatio ?? 0.867,
          timestamp: new Date().toISOString(),
          alertText: result.summary || 'Multi-Agent MPT Pareto Frontier Solution'
        });
      }

      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  // Get current cached payload
  app.get('/api/revit-sync/payload', (req, res) => {
    try {
      const tempFile = path.join(os.tmpdir(), 'archfin_mpt_payload.json');
      if (fs.existsSync(tempFile)) {
        const content = fs.readFileSync(tempFile, 'utf-8');
        return res.json({ found: true, payload: JSON.parse(content) });
      }
      res.json({ found: false, message: 'No payload cached yet' });
    } catch (err: any) {
      res.status(500).json({ found: false, error: err.message });
    }
  });

  // Revit 2027 Bridge Proxy / Relay routes
  app.get('/api/revit-sync/status', async (req, res) => {
    const port = req.query.port || 8080;
    const targetUrl = `http://127.0.0.1:${port}/revit-sync/`;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      const revitRes = await fetch(targetUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!revitRes.ok) {
        return res.json({
          online: false,
          port: Number(port),
          status: revitRes.status,
          error: `HTTP ${revitRes.status}: ${revitRes.statusText || 'Endpoint unavailable'}`
        });
      }
      const data = await revitRes.json().catch(() => ({ status: 'online' }));
      res.json({ online: true, port: Number(port), data });
    } catch (err: any) {
      res.json({ online: false, port: Number(port), error: err.message });
    }
  });

  app.post('/api/revit-sync', async (req, res) => {
    const port = req.query.port || 8080;
    const targetUrl = `http://127.0.0.1:${port}/revit-sync/`;
    
    // Always persist to local file bridge so Revit file-watcher and manual button pick it up
    const savedToFile = saveMptPayloadToFile(req.body);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const revitRes = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(req.body),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!revitRes.ok) {
        return res.status(200).json({
          relayed: false,
          port: Number(port),
          status: revitRes.status,
          savedToFile,
          fileBridgeReady: true,
          error: `HTTP ${revitRes.status}: ${revitRes.statusText || 'Endpoint unavailable'} (Saved to local file bridge %TEMP%\\archfin_mpt_payload.json)`
        });
      }
      const data = await revitRes.json().catch(() => ({ status: 'success' }));
      res.json({ relayed: true, port: Number(port), savedToFile, revitResponse: data });
    } catch (err: any) {
      res.status(200).json({
        relayed: false,
        port: Number(port),
        savedToFile,
        fileBridgeReady: true,
        notice: `Payload saved to local file bridge (%TEMP%\\archfin_mpt_payload.json). Click 'Force Revit Canvas Recalculation' in Revit to apply immediately.`,
        error: `Network relay offline: ${err.message}`
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error handling
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('🔴 Server Error:', err);
    res.status(500).json({
      error: err.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
