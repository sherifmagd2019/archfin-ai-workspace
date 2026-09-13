import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import optimizeRoutes from './src/routes/optimize.js';
import healthRoutes from './src/routes/health.js';

dotenv.config();

const app = express();
const PORT = process.env.EXPRESS_PORT || 3001;

// MIDDLEWARE
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080', '*'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method.padEnd(6)} ${req.path.padEnd(25)} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// ROUTES
app.use('/api/optimize', optimizeRoutes);
app.use('/api/health', healthRoutes);

app.get('/', (req, res) => {
  res.json({
    service: 'ArchFin AI Multi-Agent Backend',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      optimize: 'POST /api/optimize'
    },
    timestamp: new Date().toISOString()
  });
});

// ERROR HANDLING
app.use((err, req, res, next) => {
  console.error('🔴 Error:', {
    message: err.message,
    status: err.status || 500,
    path: req.path,
    timestamp: new Date().toISOString()
  });

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500,
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    availableEndpoints: ['/api/health', '/api/optimize']
  });
});

// SERVER STARTUP
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🚀 ArchFin AI Multi-Agent Backend Server Started`);
  console.log(`${'='.repeat(80)}`);
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:5173 or http://localhost:3000`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`⚙️  Optimization API: POST http://localhost:${PORT}/api/optimize`);
  console.log(`${'='.repeat(80)}\n`);

  if (!process.env.NEBIUS_API_KEY) {
    console.warn('⚠️  NOTE: NEBIUS_API_KEY not configured in env. Multi-agent engine will run in local deterministic mode with full inter-agent dialogue.\n');
  }
});

export default app;
