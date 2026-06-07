import { TavilyService } from './tavilyService.js';
import { QwenService } from './qwenService.js';
import { BitgetService } from './bitgetService.js';
import { HistoryService } from './historyService.js';
import { PositionService } from './positionService.js';

export class AnalyzerService {
  /**
   * Complete pipeline starting from search to structured trade signal formulation
   * @param {string} asset - Coin ticker (e.g. BTC, ETH, SOL)
   * @param {boolean} autoExecute - Whether to automatically place orders on Bitget based on signal
   * @param {number} autoSizeUsdt - Capital allocation if auto executing
   * @param {boolean} isSimulation - Whether to run in simulation mode instead of live account
   * @param {string} timeframe - Granularity (e.g., '15m', '1h', '4h', '1d')
   * @returns {Promise<Object>} - Processed result
   */
  static async runPipeline(asset, autoExecute = false, autoSizeUsdt = 10, isSimulation = false, timeframe = '1h') {
    try {
      console.log(`[PIPELINE] Starting ${isSimulation ? 'SIMULATED' : 'LIVE'} analysis pipeline for ${asset} [TF: ${timeframe}]...`);
      
      // Fetch Live Market Ticker metrics from Bitget first (adjusted by target timeframe granularity)
      let tickerMetrics = null;
      try {
        const symbol = `${asset.toUpperCase()}USDT`;
        const lastPrice = await BitgetService.getTickerPrice(symbol);
        
        // Map common timeframes to Bitget V2 granularity keys
        const granularity = timeframe.toLowerCase();
        
        const response = await fetch(`https://api.bitget.com/api/v2/spot/market/candles?symbol=${symbol}&granularity=${granularity}&limit=24`).then(r => r.json());
        if (response.code === '00000' && response.data?.length > 0) {
          const raw = response.data[0]; // most recent candle
          tickerMetrics = {
            lastPrice,
            timeframe: granularity,
            high24h: raw[2] || lastPrice.toString(), // High of the current candle timeframe
            low24h: raw[3] || lastPrice.toString(),  // Low of the current candle timeframe
            volume24h: parseFloat(raw[5] || 0).toFixed(2)
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

      // Step 3: Call Qwen for deep logical assessment (grounded with live ticker metrics & timeframe)
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
            // Open Position in Ledger
            const pos = await PositionService.openPosition(asset, direction, autoSizeUsdt, true);
            executionReceipt = {
              side,
              executed: true,
              orderId: pos.id,
              amountAllocated: autoSizeUsdt,
              isSimulation: true
            };
          } else {
            // Live Trade Execution on Bitget
            console.log(`[AGENT EXECUTION] Triggering trade on Bitget. Coin: ${asset}, Side: ${side}, Size: ${autoSizeUsdt}`);
            const tradeResult = await BitgetService.executeSpotMarketOrder(asset, side, autoSizeUsdt);
            
            if (tradeResult.success) {
              const pos = await PositionService.openPosition(asset, direction, autoSizeUsdt, false);
              executionReceipt = {
                side,
                executed: true,
                orderId: pos.id,
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
        timeframe: timeframe,
        signal: structuredSignal,
        execution: executionReceipt
      };

      // Push logs to history database memory
      HistoryService.addLog({
        asset,
        sentiment: structuredSignal.sentiment,
        confidenceScore: structuredSignal.confidenceScore,
        actionableTrade: structuredSignal.actionableTrade,
        tradeSetup: {
          ...structuredSignal.tradeSetup,
          timeframe: timeframe
        },
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