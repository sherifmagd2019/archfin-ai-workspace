import dotenv from 'dotenv';
dotenv.config();

export class NebiusClient {
  constructor() {
    this.apiUrl = process.env.NEBIUS_API_URL || 'https://api.studio.nebius.ai/v1';
    this.apiKey = process.env.NEBIUS_API_KEY || '';

    if (!this.apiKey) {
      console.warn('⚠️  NEBIUS_API_KEY not configured in backend environment.');
    }
  }

  async callModel(model, systemPrompt, userPrompt, temperature = 0.3, overrideApiKey = null, overrideApiUrl = null) {
    const key = overrideApiKey || this.apiKey;
    const url = overrideApiUrl || this.apiUrl;

    if (!key) {
      throw new Error('NEBIUS_API_KEY not configured');
    }

    const payload = {
      model: model || 'nvidia/llama-3-nemotron-70b-instruct',
      temperature,
      max_tokens: 2000,
      top_p: 0.95,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMsg = response.statusText;
        try {
          const errData = await response.json();
          errorMsg = errData.error?.message || response.statusText;
        } catch {
          // Keep response.statusText
        }
        throw new Error(`Nebius API Error (${response.status}): ${errorMsg}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response content from Nebius API');
      }

      return content.trim();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('🔴 Nebius Client Error:', {
        model,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async health(overrideApiKey = null, overrideApiUrl = null) {
    const key = overrideApiKey || this.apiKey;
    const url = overrideApiUrl || this.apiUrl;
    if (!key) return false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${url}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const nebiusClient = new NebiusClient();
export default nebiusClient;
