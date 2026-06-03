import axios from 'axios';
import { CONFIG } from '../config/constants.js';

export class QwenService {
  /**
   * Sanitizes raw LLM response strings to prevent JSON.parse crashes
   * @param {string} rawText 
   * @returns {string} Cleaned JSON string
   */
  static cleanJsonString(rawText) {
    let clean = rawText.trim();
    
    // Remove Markdown wrappers if the model returned them despite system prompt
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```json/i, '').replace(/```$/, '').trim();
    }
    
    // Replace raw newlines/carriage returns within JSON string values with spaces
    // but preserve the syntax structure
    clean = clean.replace(/[\r\n]+/g, ' ');

    return clean;
  }

  /**
   * Sends news data to Qwen model to obtain a structured trade decision
   * @param {string} context - Compiled news context from Tavily
   * @param {string} asset - The target token/asset (e.g., BTC, ETH)
   * @returns {Promise<Object>} - Structured JSON decision
   */
  static async analyzeSentimentAndGenerateSignal(context, asset) {
    if (!CONFIG.QWEN.API_KEY) {
      throw new Error('Qwen API key is missing in configurations.');
    }

    const systemPrompt = `You are TradeMind AI, an elite algorithmic crypto-trading analyzer.
Your task is to analyze real-time news and determine if it presents an actionable trading opportunity for the specified asset: ${asset}.
You must evaluate the news logically, outputting your decision strictly as a JSON object matching the schema below.

CRITICAL RULES FOR STABILITY:
1. Do NOT wrap the JSON output in markdown backticks (e.g. do not use \`\`\`json). Output raw text.
2. All keys and values in the JSON must be valid.
3. NEVER write nested double quotes inside string fields. If you need to quote something inside the "analysisSummary", use SINGLE quotes ('example') instead of double quotes.
4. Do NOT put raw newlines or line breaks inside the "analysisSummary" string. Keep it as a single continuous paragraph.

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
          temperature: 0.1, // Low temperature for high consistency and JSON formatting stability
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
        throw new Error('Empty response payload returned from Qwen API.');
      }

      // Sanitize the response text before parsing
      const sanitizedJson = this.cleanJsonString(responseText);
      
      try {
        return JSON.parse(sanitizedJson);
      } catch (parseError) {
        console.warn('[QWEN SANITATION WARNING] Standard parsing failed, attempting fallback repair...', parseError.message);
        console.log('Sanitized text attempted:', sanitizedJson);
        
        // Fallback repair: Escape unescaped double quotes inside value strings
        // This regex looks for double quotes that are not followed by , } ] or : and are not after a comma or brace
        const repairedJson = sanitizedJson
          .replace(/(?<![:{,\[])"(?![:,}\]])/g, '\\"')
          .replace(/\\"/g, '"'); // Ensure we didn't double escape
          
        return JSON.parse(repairedJson);
      }
    } catch (error) {
      console.error('[QWEN ERROR]', error.response?.data || error.message);
      throw new Error(`Failed to process analysis with Qwen: ${error.message}`);
    }
  }
}