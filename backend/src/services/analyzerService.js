import { TavilyService } from './tavilyService.js';
import { QwenService } from './qwenService.js';
import { BitgetService } from './bitgetService.js';
import { HistoryService } from './historyService.js';

export class AnalyzerService {
  /**
   * Complete pipeline starting from search to structured trade signal formulation
   * @param {string} asset - Coin ticker (e.g. BTC, ETH, SOL)
   * @param {boolean} autoExecute - Whether to automatically place orders on Bitget based on signal
   * @param {number} autoSizeUsdt - Capital allocation if auto executing
   * @returns {Promise<Object>} - Processed result
   */
  static async runPipeline(asset, autoExecute = false, autoSizeUsdt = 10) {
    try {
      console.log(`[PIPELINE] Starting analysis pipeline for ${asset}...`);
      
      // Step 1: Query real-time news search
      const searchQuery = `${asset} crypto token price news update`;
      const newsResults = await TavilyService.searchMarketNews(searchQuery);

      if (newsResults.length === 0) {
        return {
          asset,
          success: false,
          error: 'No relevant market news discovered for the specified token.'
        };
      }

      // Step 2: Compile news context
      const formattedContext = newsResults
        .map((n, i) => `[Source ${i+1}]: ${n.title}\nContent: ${n.content}\nURL: ${n.url}\n`)
        .join('\n');

      // Step 3: Call Qwen for deep logical assessment
      const structuredSignal = await QwenService.analyzeSentimentAndGenerateSignal(formattedContext, asset);

      let executionReceipt = null;

      // Step 4: Autonomous Execution Logic
      if (autoExecute && structuredSignal.actionableTrade) {
        const setup = structuredSignal.tradeSetup;
        const confidence = structuredSignal.confidenceScore;
        const direction = setup.direction;

        console.log(`[AGENT EVALUATION] Auto-Execute: True | Direction: ${direction} | Confidence: ${confidence}%`);

        if (confidence >= 80 && (direction === 'LONG' || direction === 'SHORT')) {
          const side = direction === 'LONG' ? 'buy' : 'sell';
          
          console.log(`[AGENT EXECUTION] Triggering trade on Bitget. Coin: ${asset}, Side: ${side}, Size: ${autoSizeUsdt}`);
          const tradeResult = await BitgetService.executeSpotMarketOrder(asset, side, autoSizeUsdt);
          
          if (tradeResult.success) {
            executionReceipt = {
              side,
              executed: true,
              orderId: tradeResult.orderId,
              amountAllocated: autoSizeUsdt
            };
          } else {
            executionReceipt = {
              executed: false,
              error: tradeResult.error
            };
          }
        } else {
          executionReceipt = {
            executed: false,
            reason: `Signal skipped. Confidence (${confidence}%) did not meet the 80% threshold, or direction was NONE.`
          };
        }
      }

      const output = {
        success: true,
        timestamp: new Date().toISOString(),
        rawNewsSourcesUsedCount: newsResults.length,
        signal: structuredSignal,
        execution: executionReceipt
      };

      // Add to running history logs for the Frontend Dashboard
      HistoryService.addLog({
        asset,
        sentiment: structuredSignal.sentiment,
        confidenceScore: structuredSignal.confidenceScore,
        actionableTrade: structuredSignal.actionableTrade,
        tradeSetup: structuredSignal.tradeSetup,
        execution: executionReceipt
      });

      return output;
    } catch (error) {
      console.error('[PIPELINE EXCEPTION]', error.message);
      return {
        asset,
        success: false,
        error: error.message
      };
    }
  }
}