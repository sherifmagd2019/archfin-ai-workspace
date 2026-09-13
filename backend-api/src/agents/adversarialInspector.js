import { nebiusClient } from '../middleware/nebiusClient.js';

const DEFAULT_CONSTRAINTS = {
  minResidential: 12.0,
  maxCommercial: 55.0,
  maxIndustrial: 40.0,
  minZoneFloor: 10.0
};

const INSPECTOR_SYSTEM_PROMPT = `You are an adversarial urban zoning compliance inspector.

Examine proposed spatial allocation percentages (Residential, Commercial, Industrial).
Detect structural, zoning, or code violations based on standard municipal density bylaws.

Output compliance assessment STRICTLY as valid JSON only:
{
  "compliant": true|false,
  "violations": ["<violation description>"],
  "suggestedFix": "<brief technical recommendation for matrix re-weighting>"
}

Do NOT include conversational markdown. Respond ONLY with valid JSON.`;

export async function adversarialInspector(allocations, options = {}) {
  const startTime = Date.now();
  const constraints = { ...DEFAULT_CONSTRAINTS, ...(options.constraints || {}) };
  const loopNumber = options.loopNumber || 1;
  const apiKey = options.apiKey || process.env.NEBIUS_API_KEY;
  const apiUrl = options.apiUrl || process.env.NEBIUS_API_URL;
  const model = options.model || process.env.NEBIUS_MODEL_MACRO || 'nvidia/llama-3-nemotron-70b-instruct';

  console.log(`🔍 Agent 3: Adversarial Inspector starting (Audit #${loopNumber})...`);
  const allocText = `Residential: ${allocations.Residential.toFixed(1)}%, Commercial: ${allocations.Commercial.toFixed(1)}%, Industrial: ${allocations.Industrial.toFixed(1)}%`;
  console.log(`   Auditing allocations: ${allocText}`);

  const violations = [];

  if (allocations.Residential < constraints.minResidential) {
    violations.push(`Residential allocation (${allocations.Residential.toFixed(1)}%) is below municipal minimum of ${constraints.minResidential}%. Risk of residential deficit.`);
  }
  if (allocations.Commercial > constraints.maxCommercial) {
    violations.push(`Commercial allocation (${allocations.Commercial.toFixed(1)}%) exceeds maximum cap of ${constraints.maxCommercial}%. Risk of office oversaturation.`);
  }
  if (allocations.Industrial > constraints.maxIndustrial) {
    violations.push(`Industrial allocation (${allocations.Industrial.toFixed(1)}%) exceeds maximum zoning ceiling of ${constraints.maxIndustrial}%. Nuisance & environmental setback breach.`);
  }
  if (allocations.Commercial < constraints.minZoneFloor) {
    violations.push(`Commercial retail vitality is under minimum threshold (${allocations.Commercial.toFixed(1)}% < ${constraints.minZoneFloor}%).`);
  }
  if (allocations.Industrial < constraints.minZoneFloor) {
    violations.push(`Industrial/Logistics is below minimum operational footprint (${allocations.Industrial.toFixed(1)}% < ${constraints.minZoneFloor}%).`);
  }

  const isCompliant = violations.length === 0;

  let dialogueTurn;
  if (!isCompliant) {
    dialogueTurn = {
      sender: 'AdversarialInspectorAgent',
      recipient: 'QuantitativeMPTAgent',
      role: 'Zoning & Municipal Code Auditor',
      avatar: 'ShieldCheck',
      color: '#f9e2af',
      message: `OBJECTION, Quantitative Agent! Zoning audit #${loopNumber} rejected. Detected ${violations.length} violation(s):\n${violations.map(v => `• ${v}`).join('\n')}\nI am enforcing an adversarial covariance penalty on the violating asset classes and demanding immediate re-optimization.`,
      timestamp: new Date().toISOString()
    };
  } else {
    dialogueTurn = {
      sender: 'AdversarialInspectorAgent',
      recipient: 'ExecutiveExplainerAgent',
      role: 'Zoning & Municipal Code Auditor',
      avatar: 'ShieldCheck',
      color: '#a6e3a1',
      message: `AUDIT APPROVED, Quantitative Agent! Allocation vector [Res: ${allocations.Residential.toFixed(1)}%, Comm: ${allocations.Commercial.toFixed(1)}%, Ind: ${allocations.Industrial.toFixed(1)}%] satisfies all municipal zoning bylaws (FAR 4.5 Target, Residential >= ${constraints.minResidential}%, Commercial <= ${constraints.maxCommercial}%, Industrial <= ${constraints.maxIndustrial}%). Passing to Executive Explainer for synthesis.`,
      timestamp: new Date().toISOString()
    };
  }

  // If API key is available, optionally query the LLM for deep zoning commentary
  if (apiKey && !isCompliant) {
    try {
      const result = await nebiusClient.callModel(
        model,
        INSPECTOR_SYSTEM_PROMPT,
        `Review these allocations against constraints: ${allocText}. Known municipal issues: ${violations.join(', ')}`,
        0.2,
        apiKey,
        apiUrl
      );
      try {
        const cleanJson = result.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.suggestedFix) {
          dialogueTurn.message += ` Recommendation: ${parsed.suggestedFix}`;
        }
      } catch {
        // Keep standard dialogue
      }
    } catch {
      // Keep heuristic dialogue
    }
  }

  console.log(`   ✅ Inspector Result: ${isCompliant ? 'COMPLIANT' : `${violations.length} violations`}`);

  return {
    agent: 'AdversarialInspector',
    compliant: isCompliant,
    violations,
    constraintsUsed: constraints,
    suggestedFix: !isCompliant ? 'Penalize high-variance entries and re-run Markowitz solver' : null,
    dialogueTurn,
    duration: Date.now() - startTime,
    timestamp: new Date().toISOString()
  };
}

export default adversarialInspector;
