import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import dotenv from 'dotenv';
import { orchestrateAgents } from './backend-api/src/middleware/orchestrator.js';

dotenv.config();

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
      res.json(result);
    } catch (err) {
      next(err);
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
      const data = await revitRes.json().catch(() => ({ status: 'online' }));
      res.json({ online: true, port: Number(port), data });
    } catch (err: any) {
      res.json({ online: false, port: Number(port), error: err.message });
    }
  });

  app.post('/api/revit-sync', async (req, res) => {
    const port = req.query.port || 8080;
    const targetUrl = `http://127.0.0.1:${port}/revit-sync/`;
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
      const data = await revitRes.json().catch(() => ({ status: 'success' }));
      res.json({ relayed: true, port: Number(port), revitResponse: data });
    } catch (err: any) {
      res.status(502).json({
        relayed: false,
        port: Number(port),
        error: `Revit 2027 not reachable at ${targetUrl}: ${err.message}`
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
