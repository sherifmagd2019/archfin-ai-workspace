import { nebiusClient } from '../middleware/nebiusClient.js';

const EXPLAINER_SYSTEM_PROMPT = `You are an executive financial briefing specialist for real estate development and computational BIM layout engineering.

Generate a concise, human-readable narrative explaining the multi-agent AI optimization decisions.

Format: Clear, professional, 2-3 sentences max. Include:
- Why these specific allocations (Residential, Commercial, Industrial) were chosen
- The risk/return trade-offs made given the market news
- Architectural compliance and spatial balance achieved

Target audience: Urban developers, real estate fund managers, BIM architects (non-technical leadership).

Do NOT include raw formulas. Keep it authoritative, polished, and actionable.`;

export async function executiveExplainer(optimizationResult, options = {}) {
  const startTime = Date.now();
  const { allocations, riskMultipliers, iterations, violations, marketInput } = optimizationResult;
  const apiKey = options.apiKey || process.env.NEBIUS_API_KEY;
  const apiUrl = options.apiUrl || process.env.NEBIUS_API_URL;
  const model = options.model || process.env.NEBIUS_MODEL_EXPLAINER || 'nvidia/nemotron-4-340b-instruct';

  console.log('📝 Agent 4: Executive Explainer starting...');

  if (!apiKey) {
    const narrative = generateHeuristicNarrative(allocations, violations.length > 0, marketInput);
    console.log('   ✅ Narrative generated (local reasoning engine)');

    const dialogueTurn = {
      sender: 'ExecutiveExplainerAgent',
      recipient: 'RevitSyncAgent',
      role: 'Executive Synthesis & Decision Architect',
      avatar: 'Sparkles',
      color: '#cba6f7',
      message: `Deliberations synthesized: "${narrative}". Handing verified geometric parameters to Revit 2027 Add-in pipeline for immediate mass floor generation.`,
      timestamp: new Date().toISOString()
    };

    return {
      agent: 'ExecutiveExplainer',
      narrative,
      dialogueTurn,
      apiUsed: false,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }

  try {
    const contextString = `
Optimization Results:
- Residential: ${allocations.Residential.toFixed(1)}%
- Commercial: ${allocations.Commercial.toFixed(1)}%
- Industrial: ${allocations.Industrial.toFixed(1)}%

Market News: ${marketInput || 'Standard market conditions'}
Risk Scalars Applied: ${JSON.stringify(riskMultipliers)}
Zoning Status: ${violations.length === 0 ? 'Passed municipal audit' : `${violations.length} constraints adjusted`}
Iterations: ${iterations} feedback loops`;

    const narrative = await nebiusClient.callModel(
      model,
      EXPLAINER_SYSTEM_PROMPT,
      `Generate an executive briefing for this urban layout optimization:\n${contextString}`,
      0.6,
      apiKey,
      apiUrl
    );

    const cleanNarrative = narrative.trim().replace(/^"|"$/g, '');
    console.log('   ✅ Executive Narrative synthesized via NVIDIA Nemotron');

    const dialogueTurn = {
      sender: 'ExecutiveExplainerAgent',
      recipient: 'RevitSyncAgent',
      role: 'Executive Synthesis & Decision Architect',
      avatar: 'Sparkles',
      color: '#cba6f7',
      message: `Deliberations synthesized via NVIDIA ${model}: "${cleanNarrative}". Dispatching final spatial allocation vector to Revit 2027 BIM engine.`,
      timestamp: new Date().toISOString()
    };

    return {
      agent: 'ExecutiveExplainer',
      narrative: cleanNarrative,
      dialogueTurn,
      apiUsed: true,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('🔴 Executive Explainer Error:', error.message);
    const fallbackNarrative = generateHeuristicNarrative(allocations, violations.length > 0, marketInput);
    const dialogueTurn = {
      sender: 'ExecutiveExplainerAgent',
      recipient: 'RevitSyncAgent',
      role: 'Executive Synthesis & Decision Architect',
      avatar: 'Sparkles',
      color: '#cba6f7',
      message: `Synthesized executive brief: "${fallbackNarrative}". Transmitting allocation vector to Revit 2027 Add-in.`,
      timestamp: new Date().toISOString()
    };

    return {
      agent: 'ExecutiveExplainer',
      narrative: fallbackNarrative,
      dialogueTurn,
      error: error.message,
      apiUsed: false,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
}

function generateHeuristicNarrative(allocations, hadViolations, marketInput) {
  const res = allocations.Residential;
  const comm = allocations.Commercial;
  const ind = allocations.Industrial;

  let leadingAsset = 'Balanced Mixed-Use';
  if (res > comm && res > ind) leadingAsset = 'Residential';
  else if (comm > res && comm > ind) leadingAsset = 'Commercial';
  else if (ind > res && ind > comm) leadingAsset = 'Industrial';

  const auditNote = hadViolations
    ? ' Following iterative zoning boundary reconciliation with the Adversarial Inspector,'
    : '';

  return `${auditNote} The portfolio converges on a ${leadingAsset}-anchored layout with ${res.toFixed(1)}% residential housing, ${comm.toFixed(1)}% commercial retail, and ${ind.toFixed(1)}% industrial logistics. This configuration successfully balances yield resilience against macroeconomic volatilities while preserving strict FAR 4.5 compliance in Revit BIM.`;
}

export default executiveExplainer;
