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
   * @param {boolean} isSimulation - Whether to run in simulation mode instead of live account
   * @returns {Promise<Object>} - Processed result
   */
  static async runPipeline(asset, autoExecute = false, autoSizeUsdt = 10, isSimulation = false) {
    try {
      console.log(`[PIPELINE] Starting ${isSimulation ? 'SIMULATED' : 'LIVE'} analysis pipeline for ${asset}...`);
      
      // Fetch Live Market Ticker metrics from Bitget first
      let tickerMetrics = null;
      try {
        const symbol = `${asset.toUpperCase()}USDT`;
        const lastPrice = await BitgetService.getTickerPrice(symbol);
        
        // Target V2 tickers endpoints for high/low stats
        const response = await fetch(`https://api.bitget.com/api/v2/spot/market/tickers?symbol=${symbol}`).then(r => r.json());
        if (response.code === '00000' && response.data?.[0]) {
          const raw = response.data[0];
          tickerMetrics = {
            lastPrice,
            high24h: raw.high24h || lastPrice.toString(),
            low24h: raw.low24h || lastPrice.toString(),
            volume24h: parseFloat(raw.baseVol || 0).toFixed(2)
          };
        }
      } catch (tickerErr) {
        console.warn('[PIPELINE WARNING] Failed to retrieve live ticker stats, moving forward with news only:', tickerErr.message);
      }

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

      // Step 3: Call Qwen for deep logical assessment (grounded with live ticker metrics)
      const structuredSignal = await QwenService.analyzeSentimentAndGenerateSignal(formattedContext, asset, tickerMetrics);

      let executionReceipt = null;

      // Step 4: Autonomous Execution Logic
      if (autoExecute && structuredSignal.actionableTrade) {
        const setup = structuredSignal.tradeSetup;
        const confidence = structuredSignal.confidenceScore;
        const direction = setup.direction;

        console.log(`[AGENT EVALUATION] Auto-Execute: True | Direction: ${direction} | Confidence: ${confidence}%`);

        if (confidence >= 80 && (direction === 'LONG' || direction === 'SHORT')) {
          const side = direction === 'LONG' ? 'buy' : 'sell';
          
          if (isSimulation) {
            // Simulated Paper Trade
            executionReceipt = {
              side,
              executed: true,
              orderId: `sim_order_${Math.random().toString(36).substring(2, 9)}`,
              amountAllocated: autoSizeUsdt,
              isSimulation: true
            };
            console.log(`[SIMULATOR] Successfully tracked paper position for ${asset}: ${side} of ${autoSizeUsdt} USDT`);
          } else {
            // Live Trade Execution on Bitget
            console.log(`[AGENT EXECUTION] Triggering trade on Bitget. Coin: ${asset}, Side: ${side}, Size: ${autoSizeUsdt}`);
            const tradeResult = await BitgetService.executeSpotMarketOrder(asset, side, autoSizeUsdt);
            
            if (tradeResult.success) {
              executionReceipt = {
                side,
                executed: true,
                orderId: tradeResult.orderId,
                amountAllocated: autoSizeUsdt,
                isSimulation: false
              };
            } else {
              executionReceipt = {
                executed: false,
                error: tradeResult.error
              };
            }
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

      // Push logs to history database memory
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