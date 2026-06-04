import axios from 'axios';
import { CONFIG } from '../config/constants.js';

export class QwenService {
  static cleanJsonString(rawText) {
    let clean = rawText.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```json/i, '').replace(/```$/, '').trim();
    }
    clean = clean.replace(/[\r\n]+/g, ' ');
    return clean;
  }

  /**
   * Generates signal grounded in both raw news and live market metrics
   */
  static async analyzeSentimentAndGenerateSignal(context, asset, tickerMetrics = null) {
    if (!CONFIG.QWEN.API_KEY) {
      throw new Error('Qwen API key is missing in configurations.');
    }

    const metricsContext = tickerMetrics 
      ? `LIVE EXCHANGE TICKER METRICS FOR ${asset}USDT:
         - Current Last Price: $${tickerMetrics.lastPrice}
         - 24h High: $${tickerMetrics.high24h}
         - 24h Low: $${tickerMetrics.low24h}
         - 24h Volume: ${tickerMetrics.volume24h}`
      : 'Live exchange metrics currently unavailable.';

    const systemPrompt = `You are TradeMind AI, an elite algorithmic crypto-trading analyzer.
Your task is to analyze real-time news and live exchange ticker metrics to determine if it presents an actionable trading opportunity for the specified asset: ${asset}.
You must evaluate the parameters logically, outputting your decision strictly as a JSON object matching the schema below.

CRITICAL RULES:
1. Do NOT wrap the JSON output in markdown backticks. Output raw text.
2. Never write nested double quotes inside string fields. Use SINGLE quotes if necessary.
3. Keep the "analysisSummary" as a single continuous paragraph with no raw line breaks.

JSON Schema format:
{
  "asset": "${asset}",
  "sentiment": "BULLISH", "BEARISH", or "NEUTRAL",
  "confidenceScore": 85,
  "analysisSummary": "Single paragraph analysis summary under 150 words. Do not use double quotes or line breaks inside.",
  "actionableTrade": true,
  "tradeSetup": {
    "direction": "LONG", "SHORT", or "NONE",
    "entryRange": "approximate entry zone",
    "stopLoss": "suggested stop price",
    "takeProfit": "suggested take profit",
    "riskRewardRatio": "1:2",
    "sizingPercentage": 3
  }
}`;

    const userPrompt = `Asset to Analyze: ${asset}
    
${metricsContext}

Real-Time Market Data and News Context:
${context}

Analyze the data and output the clean JSON object directly:`;

    try {
      console.log(`[QWEN] Sending analysis request for ${asset} to international gateway...`);
      const response = await axios.post(
        `${CONFIG.QWEN.BASE_URL}/chat/completions`,
        {
          model: 'qwen-plus',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${CONFIG.QWEN.API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const responseText = response.data?.choices?.[0]?.message?.content;
      if (!responseText) {
        throw new Error('Empty response payload returned from Qwen.');
      }

      const sanitizedJson = this.cleanJsonString(responseText);
      
      try {
        return JSON.parse(sanitizedJson);
      } catch (parseError) {
        console.warn('[QWEN REPAIR] Fallback parser triggered...');
        const repairedJson = sanitizedJson
          .replace(/(?<![:{,\[])"(?![:,}\]])/g, '\\"')
          .replace(/\\"/g, '"');
          
        return JSON.parse(repairedJson);
      }
    } catch (error) {
      console.error('[QWEN ERROR]', error.response?.data || error.message);
      throw new Error(`Failed to process analysis with Qwen: ${error.message}`);
    }
  }
}