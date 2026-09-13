import { nebiusClient } from '../middleware/nebiusClient.js';

const MACRO_SYSTEM_PROMPT = `You are a real estate quantitative economic analyst specializing in extracting financial risk metrics from market news.

Your task:
1. Analyze raw market text updates (news, commodity prices, policy changes)
2. Extract key financial risk trends affecting real estate development (Residential, Commercial, Industrial)
3. Output risk scaling parameters STRICTLY as valid JSON only

The JSON must have exactly this format:
{
  "Residential": <float between 0.7 and 1.8>,
  "Commercial": <float between 0.7 and 1.8>,
  "Industrial": <float between 0.7 and 1.8>,
  "explanation": "<concise explanation of macroeconomic causality>"
}

Do NOT include markdown backticks or commentary. Return ONLY valid JSON.`;

export async function macroInferenceAgent(marketNewsText, options = {}) {
  const startTime = Date.now();
  const defaultMultipliers = options.defaultMultipliers || {
    Residential: 1.0,
    Commercial: 1.0,
    Industrial: 1.0
  };
  const model = options.model || process.env.NEBIUS_MODEL_MACRO || 'nvidia/llama-3-nemotron-70b-instruct';
  const apiKey = options.apiKey || process.env.NEBIUS_API_KEY;
  const apiUrl = options.apiUrl || process.env.NEBIUS_API_URL;

  console.log('📊 Agent 1: Macro-Inference starting...');
  console.log(`   Input: "${marketNewsText.substring(0, 80)}..."`);

  // Dynamic analysis heuristic if API key is not supplied
  if (!apiKey) {
    const textLower = marketNewsText.toLowerCase();
    let resMult = defaultMultipliers.Residential || 1.0;
    let commMult = defaultMultipliers.Commercial || 1.0;
    let indMult = defaultMultipliers.Industrial || 1.0;

    if (textLower.includes('steel') || textLower.includes('tariff') || textLower.includes('materials')) {
      indMult *= 1.45;
    }
    if (textLower.includes('retail') || textLower.includes('cooling') || textLower.includes('remote') || textLower.includes('vacancy')) {
      commMult *= 1.25;
    }
    if (textLower.includes('housing') || textLower.includes('shortage') || textLower.includes('rent')) {
      resMult *= 0.85; // Lower perceived risk/higher return demand
    }
    if (textLower.includes('rate') || textLower.includes('inflation') || textLower.includes('hike')) {
      commMult *= 1.15;
      indMult *= 1.15;
    }

    const explanation = `Heuristic Macro Inference (Default Engine): Detected market signals impacting sector volatility. Adjusted Industrial risk scalar to ${indMult.toFixed(2)}x and Commercial to ${commMult.toFixed(2)}x.`;

    const dialogueTurn = {
      sender: 'MacroInferenceAgent',
      recipient: 'QuantitativeMPTAgent',
      role: 'Macroeconomic NLP & Sentiment Analyst',
      avatar: 'Bot',
      color: '#89b4fa',
      message: `Greetings Quantitative Agent! I have completed textual parsing of market narrative "${marketNewsText.substring(0, 45)}...". Industrial risk scalar adjusted to ${indMult.toFixed(2)}x, Commercial to ${commMult.toFixed(2)}x, Residential to ${resMult.toFixed(2)}x. Transmitting updated covariance multipliers for linear matrix inversion.`,
      timestamp: new Date().toISOString()
    };

    return {
      agent: 'MacroInference',
      riskMultipliers: {
        Residential: parseFloat(resMult.toFixed(2)),
        Commercial: parseFloat(commMult.toFixed(2)),
        Industrial: parseFloat(indMult.toFixed(2))
      },
      explanation,
      dialogueTurn,
      apiUsed: false,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }

  try {
    const result = await nebiusClient.callModel(
      model,
      MACRO_SYSTEM_PROMPT,
      `Analyze this market update and extract risk multipliers: "${marketNewsText}"`,
      0.2,
      apiKey,
      apiUrl
    );

    let parsed = null;
    try {
      const cleanJson = result.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      console.warn('   ⚠️ Failed to parse LLM JSON. Using regex fallback.');
      const resMatch = result.match(/"Residential"\s*:\s*([\d.]+)/);
      const commMatch = result.match(/"Commercial"\s*:\s*([\d.]+)/);
      const indMatch = result.match(/"Industrial"\s*:\s*([\d.]+)/);
      parsed = {
        Residential: resMatch ? parseFloat(resMatch[1]) : defaultMultipliers.Residential,
        Commercial: commMatch ? parseFloat(commMatch[1]) : defaultMultipliers.Commercial,
        Industrial: indMatch ? parseFloat(indMatch[1]) : defaultMultipliers.Industrial,
        explanation: 'Model extracted risk shifts from narrative text.'
      };
    }

    const validated = {
      Residential: Math.max(0.5, Math.min(2.5, parsed.Residential || defaultMultipliers.Residential)),
      Commercial: Math.max(0.5, Math.min(2.5, parsed.Commercial || defaultMultipliers.Commercial)),
      Industrial: Math.max(0.5, Math.min(2.5, parsed.Industrial || defaultMultipliers.Industrial))
    };

    const explanation = parsed.explanation || 'Market news NLP analysis completed successfully.';

    const dialogueTurn = {
      sender: 'MacroInferenceAgent',
      recipient: 'QuantitativeMPTAgent',
      role: 'Macroeconomic NLP & Sentiment Analyst',
      avatar: 'Bot',
      color: '#89b4fa',
      message: `Greetings Quantitative Agent! Using NVIDIA ${model}, I processed the macroeconomic dispatch. Resulting risk multipliers: Residential: ${validated.Residential.toFixed(2)}x, Commercial: ${validated.Commercial.toFixed(2)}x, Industrial: ${validated.Industrial.toFixed(2)}x. Explanation: ${explanation}. Please calibrate the variance-covariance matrix Σ accordingly.`,
      timestamp: new Date().toISOString()
    };

    return {
      agent: 'MacroInference',
      riskMultipliers: validated,
      explanation,
      dialogueTurn,
      apiUsed: true,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('🔴 Macro-Inference Agent Error:', error.message);
    const dialogueTurn = {
      sender: 'MacroInferenceAgent',
      recipient: 'QuantitativeMPTAgent',
      role: 'Macroeconomic NLP & Sentiment Analyst',
      avatar: 'Bot',
      color: '#89b4fa',
      message: `Quantitative Agent, API inference encountered: ${error.message}. Defaulting to calibrated baseline scalars (Res: ${defaultMultipliers.Residential}x, Comm: ${defaultMultipliers.Commercial}x, Ind: ${defaultMultipliers.Industrial}x).`,
      timestamp: new Date().toISOString()
    };
    return {
      agent: 'MacroInference',
      riskMultipliers: defaultMultipliers,
      explanation: `Fallback baseline applied due to: ${error.message}`,
      dialogueTurn,
      error: error.message,
      apiUsed: false,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
}

export default macroInferenceAgent;
