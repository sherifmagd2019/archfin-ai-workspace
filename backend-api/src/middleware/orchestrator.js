import macroInferenceAgent from '../agents/macroInferenceAgent.js';
import mptQuantitativeAgent from '../agents/mptQuantitativeAgent.js';
import adversarialInspector from '../agents/adversarialInspector.js';
import executiveExplainer from '../agents/executiveExplainer.js';

const DEFAULT_COVARIANCE = [
  [0.004, 0.001, 0.002],
  [0.001, 0.008, 0.003],
  [0.002, 0.003, 0.006]
];

const DEFAULT_EXPECTED_RETURNS = [0.068, 0.082, 0.095];

const DEFAULT_CONSTRAINTS = {
  minResidential: 12.0,
  maxCommercial: 55.0,
  maxIndustrial: 40.0,
  minZoneFloor: 10.0
};

const DEFAULT_CONFIG = {
  maxLoops: 5,
  adversarialPenaltyFactor: 1.4,
  residentialRewardFactor: 0.85,
  riskFreeRate: 0.025,
  targetFar: 4.5
};

export async function orchestrateAgents(projectState = {}) {
  const orchestrationStart = Date.now();

  // All variables have defaults that can be changed by the caller
  const marketNews = projectState.marketNews || "Rapid construction steel price inflation paired with retail cooling trends.";
  const baseCovariance = (Array.isArray(projectState.baseCovariance) && projectState.baseCovariance.length === 3)
    ? projectState.baseCovariance
    : DEFAULT_COVARIANCE;
  const expectedReturns = (Array.isArray(projectState.expectedReturns) && projectState.expectedReturns.length === 3)
    ? projectState.expectedReturns
    : DEFAULT_EXPECTED_RETURNS;
  const constraints = { ...DEFAULT_CONSTRAINTS, ...(projectState.constraints || {}) };
  const config = { ...DEFAULT_CONFIG, ...(projectState.config || {}) };
  const apiKey = projectState.apiKey || config.apiKey || process.env.NEBIUS_API_KEY;
  const apiUrl = projectState.apiUrl || config.apiUrl || process.env.NEBIUS_API_URL;
  const modelMacro = projectState.modelMacro || config.modelMacro || process.env.NEBIUS_MODEL_MACRO;
  const modelExplainer = projectState.modelExplainer || config.modelExplainer || process.env.NEBIUS_MODEL_EXPLAINER;

  console.log('\n' + '='.repeat(80));
  console.log('🤖 MULTI-AGENT ORCHESTRATION LOOP INITIALIZED (Dynamic Configuration)');
  console.log('='.repeat(80));
  console.log(`📊 Market Input: "${marketNews.substring(0, 70)}..."`);
  console.log(`⚙️  Constraints: Min Res=${constraints.minResidential}%, Max Comm=${constraints.maxCommercial}%, Max Ind=${constraints.maxIndustrial}%`);
  console.log(`⚙️  Max Loops: ${config.maxLoops}, Penalty Factor: ${config.adversarialPenaltyFactor}x`);
  console.log('='.repeat(80) + '\n');

  const dialogue = [];

  try {
    // -------------------------------------------------------------
    // STEP 1: Macro-Inference Agent
    // -------------------------------------------------------------
    const macroResult = await macroInferenceAgent(marketNews, {
      apiKey,
      apiUrl,
      model: modelMacro,
      defaultMultipliers: projectState.defaultMultipliers
    });

    if (macroResult.dialogueTurn) {
      dialogue.push(macroResult.dialogueTurn);
    }

    const riskMultipliers = macroResult.riskMultipliers;

    // Apply risk scalars to diagonal variance entries
    let adjustedCovariance = baseCovariance.map((row, i) => {
      const asset = ['Residential', 'Commercial', 'Industrial'][i];
      const mult = riskMultipliers[asset] || 1.0;
      return row.map((val, j) => (i === j ? val * mult : val));
    });

    console.log(`   Risk-Adjusted Covariance: Res*=${riskMultipliers.Residential}x, Comm*=${riskMultipliers.Commercial}x, Ind*=${riskMultipliers.Industrial}x\n`);

    // -------------------------------------------------------------
    // STEP 2 & 3: Iterative MPT Optimization + Adversarial Audit Loop
    // -------------------------------------------------------------
    let optimalWeights = null;
    let mptMetrics = null;
    let finalViolations = [];
    let loopCount = 0;
    const maxLoops = Math.max(1, config.maxLoops || 5);
    const penaltyFactor = config.adversarialPenaltyFactor || 1.4;
    const rewardFactor = config.residentialRewardFactor || 0.85;

    while (loopCount < maxLoops) {
      loopCount++;
      console.log(`📊 Iteration ${loopCount}/${maxLoops}: Invoking Quantitative MPT Agent...`);

      const mptResult = mptQuantitativeAgent(adjustedCovariance, expectedReturns, {
        riskFreeRate: config.riskFreeRate,
        loopNumber: loopCount
      });

      optimalWeights = mptResult.weights;
      mptMetrics = mptResult.metrics;

      if (mptResult.dialogueTurn) {
        dialogue.push(mptResult.dialogueTurn);
      }

      console.log(`🔍 Iteration ${loopCount}/${maxLoops}: Invoking Adversarial Inspector Agent...`);
      const inspectorResult = await adversarialInspector(optimalWeights, {
        constraints,
        loopNumber: loopCount,
        apiKey,
        apiUrl,
        model: modelMacro
      });

      finalViolations = inspectorResult.violations;

      if (inspectorResult.dialogueTurn) {
        dialogue.push(inspectorResult.dialogueTurn);
      }

      if (inspectorResult.compliant) {
        console.log(`   ✅ Layout is COMPLIANT on Loop #${loopCount}. Breaking feedback loop.\n`);
        break;
      }

      // If violations exist and we have loops left, penalize the violating asset classes
      if (loopCount < maxLoops) {
        console.log(`   ⚠️ Adjusting covariance matrix for loop #${loopCount + 1}...`);

        let adjustmentsMade = [];
        if (optimalWeights.Industrial > constraints.maxIndustrial) {
          adjustedCovariance[2][2] *= penaltyFactor;
          adjustmentsMade.push(`Industrial variance scaled by ${penaltyFactor}x`);
        }
        if (optimalWeights.Commercial > constraints.maxCommercial) {
          adjustedCovariance[1][1] *= penaltyFactor;
          adjustmentsMade.push(`Commercial variance scaled by ${penaltyFactor}x`);
        }
        if (optimalWeights.Residential < constraints.minResidential) {
          adjustedCovariance[0][0] *= rewardFactor;
          adjustmentsMade.push(`Residential variance discounted by ${rewardFactor}x`);
        }

        // Inter-agent negotiation dialogue
        dialogue.push({
          sender: 'QuantitativeMPTAgent',
          recipient: 'AdversarialInspectorAgent',
          role: 'Markowitz Min-Variance Matrix Solver',
          avatar: 'Cpu',
          color: '#a6e3a1',
          message: `Adversarial feedback received from Inspector. Recalibrating Σ matrix: ${adjustmentsMade.join('; ')}. Re-executing linear system w* = (Σ⁻¹·1)/(1'·Σ⁻¹·1) for loop #${loopCount + 1}...`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // -------------------------------------------------------------
    // STEP 4: Executive Explainer Agent
    // -------------------------------------------------------------
    console.log(`📝 Invoking Executive Explainer Agent...`);
    const explainerResult = await executiveExplainer({
      allocations: optimalWeights,
      riskMultipliers,
      iterations: loopCount,
      violations: finalViolations,
      marketInput: marketNews
    }, {
      apiKey,
      apiUrl,
      model: modelExplainer
    });

    if (explainerResult.dialogueTurn) {
      dialogue.push(explainerResult.dialogueTurn);
    }

    // -------------------------------------------------------------
    // STEP 5: Revit BIM 2027 Pipeline Transmitter
    // -------------------------------------------------------------
    const revitPayload = {
      residential: optimalWeights.Residential.toFixed(1),
      commercial: optimalWeights.Commercial.toFixed(1),
      industrial: optimalWeights.Industrial.toFixed(1),
      alertText: explainerResult.narrative,
      targetFar: config.targetFar || 4.5,
      sharpeRatio: mptMetrics.sharpeRatio,
      expectedReturn: mptMetrics.portfolioReturn,
      volatility: mptMetrics.portfolioStdDev,
      iterationsNeeded: loopCount,
      isCompliant: finalViolations.length === 0,
      timestamp: new Date().toISOString()
    };

    dialogue.push({
      sender: 'RevitSyncAgent',
      recipient: 'Revit2027HttpListener',
      role: 'BIM Mutation Dispatcher',
      avatar: 'Network',
      color: '#fab387',
      message: `Packaging final spatial allocation JSON [Res: ${revitPayload.residential}%, Comm: ${revitPayload.commercial}%, Ind: ${revitPayload.industrial}%] with FAR ${revitPayload.targetFar} target. HttpListener target: ${process.env.REVIT_SYNC_URL || 'http://localhost:8080/revit-sync/'}. Ready for live BIM geometry generation.`,
      timestamp: new Date().toISOString()
    });

    // Compile complete response
    const finalResult = {
      status: 'success',
      allocations: optimalWeights,
      riskProfile: riskMultipliers,
      narrative: explainerResult.narrative,
      metrics: mptMetrics,
      adjustedCovariance,
      dialogue,
      compliance: {
        compliant: finalViolations.length === 0,
        violations: finalViolations,
        iterationsNeeded: loopCount,
        maxLoops
      },
      revitPayload,
      agents: {
        macroInference: { ...macroResult, dialogueTurn: undefined },
        mpt: { iterations: loopCount, metrics: mptMetrics },
        adversarialInspector: { violations: finalViolations.length, compliant: finalViolations.length === 0 },
        explainer: { apiUsed: explainerResult.apiUsed }
      },
      timing: {
        orchestrationTotal: Date.now() - orchestrationStart,
        timestamp: new Date().toISOString()
      }
    };

    console.log('='.repeat(80));
    console.log('✅ MULTI-AGENT ORCHESTRATION COMPLETE');
    console.log(`   Final Weights: Res=${optimalWeights.Residential}%, Comm=${optimalWeights.Commercial}%, Ind=${optimalWeights.Industrial}%`);
    console.log(`   Dialogue Turns: ${dialogue.length} messages exchanged between agents`);
    console.log(`   Total Time: ${finalResult.timing.orchestrationTotal}ms`);
    console.log('='.repeat(80) + '\n');

    return finalResult;
  } catch (error) {
    console.error('🔴 Orchestration Failure:', error);
    throw error;
  }
}

export default orchestrateAgents;
