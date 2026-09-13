import express from 'express';
import { orchestrateAgents } from '../middleware/orchestrator.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  const requestStart = Date.now();

  try {
    const {
      marketNews,
      baseCovariance,
      expectedReturns,
      constraints,
      config,
      apiKey,
      apiUrl,
      modelMacro,
      modelExplainer,
      defaultMultipliers
    } = req.body || {};

    if (!marketNews || typeof marketNews !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid "marketNews" (must be a string)',
        example: {
          marketNews: 'Steel prices spike 20% amid supply chain disruptions',
          baseCovariance: [[0.004, 0.001, 0.002], [0.001, 0.008, 0.003], [0.002, 0.003, 0.006]],
          expectedReturns: [0.068, 0.082, 0.095],
          constraints: { minResidential: 12.0, maxCommercial: 55.0, maxIndustrial: 40.0 }
        }
      });
    }

    console.log(`\n📥 Received optimization request`);
    console.log(`   Market News: "${marketNews.substring(0, 60)}..."`);

    const result = await orchestrateAgents({
      marketNews,
      baseCovariance,
      expectedReturns,
      constraints,
      config,
      apiKey,
      apiUrl,
      modelMacro,
      modelExplainer,
      defaultMultipliers
    });

    const responseTime = Date.now() - requestStart;

    return res.json({
      ...result,
      timing: {
        ...result.timing,
        httpResponseTime: responseTime
      }
    });
  } catch (error) {
    console.error('🔴 /api/optimize Error:', error.message);
    next(error);
  }
});

export default router;
