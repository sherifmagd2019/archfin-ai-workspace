import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ArchFin AI Multi-Agent Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    nebius: {
      configured: !!process.env.NEBIUS_API_KEY,
      apiUrl: process.env.NEBIUS_API_URL || 'https://api.studio.nebius.ai/v1',
      modelMacro: process.env.NEBIUS_MODEL_MACRO || 'nvidia/llama-3-nemotron-70b-instruct',
      modelExplainer: process.env.NEBIUS_MODEL_EXPLAINER || 'nvidia/nemotron-4-340b-instruct'
    }
  });
});

export default router;
