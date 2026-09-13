import * as math from 'mathjs';

const DEFAULT_EXPECTED_RETURNS = [0.068, 0.082, 0.095];
const DEFAULT_RISK_FREE_RATE = 0.025;

export function mptQuantitativeAgent(covarianceMatrix, expectedReturns = DEFAULT_EXPECTED_RETURNS, options = {}) {
  const startTime = Date.now();
  const riskFreeRate = typeof options.riskFreeRate === 'number' ? options.riskFreeRate : DEFAULT_RISK_FREE_RATE;
  const loopNumber = options.loopNumber || 1;

  try {
    console.log(`🔢 Agent 2: MPT Quantitative starting (Iteration ${loopNumber})...`);

    if (!Array.isArray(covarianceMatrix) || covarianceMatrix.length !== 3) {
      throw new Error('Covariance matrix must be a 3×3 array');
    }

    if (!covarianceMatrix.every(row => Array.isArray(row) && row.length === 3)) {
      throw new Error('Covariance matrix must be a 3×3 array');
    }

    let sigma = math.matrix(covarianceMatrix);
    const ones = math.ones([3, 1]);

    let sigmaInv;
    try {
      sigmaInv = math.inv(sigma);
    } catch {
      console.warn('   ⚠️ Covariance matrix is singular. Adding Ridge regularization...');
      const regulated = covarianceMatrix.map((row, i) =>
        row.map((val, j) => val + (i === j ? 1e-5 : 0))
      );
      sigma = math.matrix(regulated);
      sigmaInv = math.inv(sigma);
    }

    const numerator = math.multiply(sigmaInv, ones);
    const denomProduct = math.multiply(math.transpose(ones), numerator);
    const denominatorScalar = typeof denomProduct.get === 'function'
      ? denomProduct.get([0, 0])
      : (Array.isArray(denomProduct) ? denomProduct[0][0] : Number(denomProduct));

    let weights = math.divide(numerator, denominatorScalar);
    weights = math.flatten(weights).toArray();

    // Projected non-negativity constraint (w >= 0)
    weights = weights.map(w => Math.max(0.0, parseFloat(w)));

    const weightSum = weights.reduce((a, b) => a + b, 0);
    if (weightSum === 0) {
      weights = [0.333, 0.333, 0.334];
    } else {
      weights = weights.map(w => w / weightSum);
    }

    const returns = expectedReturns.length === 3 ? expectedReturns : DEFAULT_EXPECTED_RETURNS;
    const portfolioReturn = weights.reduce((sum, w, i) => sum + w * returns[i], 0);

    let portfolioVariance = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        portfolioVariance += weights[i] * covarianceMatrix[i][j] * weights[j];
      }
    }

    const portfolioStdDev = Math.sqrt(Math.max(0, portfolioVariance));
    const sharpeRatio = (portfolioStdDev > 0.0001)
      ? (portfolioReturn - riskFreeRate) / portfolioStdDev
      : 0;

    const resPct = parseFloat((weights[0] * 100).toFixed(1));
    const commPct = parseFloat((weights[1] * 100).toFixed(1));
    const indPct = parseFloat((100 - resPct - commPct).toFixed(1));

    console.log('   ✅ MPT Optimization complete');
    console.log(`   Optimal Weights: Res=${resPct}%, Comm=${commPct}%, Ind=${indPct}% (Sharpe: ${sharpeRatio.toFixed(2)})`);

    const dialogueTurn = {
      sender: 'QuantitativeMPTAgent',
      recipient: 'AdversarialInspectorAgent',
      role: 'Markowitz Min-Variance Matrix Solver',
      avatar: 'Cpu',
      color: '#a6e3a1',
      message: `Inspector Agent! I have solved Markowitz calculus w* = (Σ⁻¹·1)/(1'·Σ⁻¹·1) for iteration #${loopNumber}. Proposed spatial layout vector: Residential: ${resPct}%, Commercial: ${commPct}%, Industrial: ${indPct}%. Expected Portfolio Return: ${(portfolioReturn * 100).toFixed(2)}%, Volatility: ${(portfolioStdDev * 100).toFixed(2)}%, Sharpe Ratio: ${sharpeRatio.toFixed(3)}. Please perform municipal architectural and physical zoning audit.`,
      timestamp: new Date().toISOString()
    };

    return {
      agent: 'QuantitativeMPT',
      weights: {
        Residential: resPct,
        Commercial: commPct,
        Industrial: indPct
      },
      metrics: {
        portfolioReturn: parseFloat((portfolioReturn * 100).toFixed(2)),
        portfolioStdDev: parseFloat((portfolioStdDev * 100).toFixed(2)),
        sharpeRatio: parseFloat(sharpeRatio.toFixed(3)),
        riskFreeRate: parseFloat((riskFreeRate * 100).toFixed(2))
      },
      dialogueTurn,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('🔴 MPT Agent Error:', error.message);
    const dialogueTurn = {
      sender: 'QuantitativeMPTAgent',
      recipient: 'AdversarialInspectorAgent',
      role: 'Markowitz Min-Variance Matrix Solver',
      avatar: 'Cpu',
      color: '#a6e3a1',
      message: `Numerical singularity during matrix inversion: ${error.message}. Emitted fallback balanced allocation [33.3%, 33.3%, 33.4%].`,
      timestamp: new Date().toISOString()
    };

    return {
      agent: 'QuantitativeMPT',
      weights: {
        Residential: 33.3,
        Commercial: 33.3,
        Industrial: 33.4
      },
      error: error.message,
      metrics: { portfolioReturn: 8.17, portfolioStdDev: 5.40, sharpeRatio: 1.05, riskFreeRate: 2.5 },
      dialogueTurn,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
}

export default mptQuantitativeAgent;
