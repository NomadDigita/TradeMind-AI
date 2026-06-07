import { BitgetService } from './bitgetService.js';

export class PositionService {
  static openPositions = [];

  /**
   * Registers a new open position
   */
  static async openPosition(coin, side, sizeUsdt, isSimulation) {
    try {
      const symbol = `${coin.toUpperCase()}USDT`;
      const entryPrice = await BitgetService.getTickerPrice(symbol);
      
      const newPos = {
        id: `pos_${Math.random().toString(36).substring(2, 9)}`,
        coin: coin.toUpperCase(),
        side: side.toUpperCase(), // 'LONG' (buy) or 'SHORT' (sell)
        sizeUsdt: parseFloat(sizeUsdt),
        entryPrice: entryPrice,
        isSimulation: isSimulation,
        timestamp: new Date().toISOString()
      };

      this.openPositions.push(newPos);
      console.log(`[POSITION LEDGER] Position registered:`, newPos);
      return newPos;
    } catch (error) {
      console.error('[POSITION LEDGER ERROR] Failed to open position:', error.message);
      throw error;
    }
  }

  /**
   * Returns all open positions with their current prices and P&L calculated
   */
  static async getActivePositionsWithPnL() {
    const updatedPositions = [];
    
    for (const pos of this.openPositions) {
      try {
        const symbol = `${pos.coin}USDT`;
        const currentPrice = await BitgetService.getTickerPrice(symbol);
        
        // P&L calculation: (Current - Entry) / Entry for LONG; (Entry - Current) / Entry for SHORT
        let pnlPercentage = 0;
        if (pos.side === 'LONG') {
          pnlPercentage = ((currentPrice - pos.entryPrice) / pos.entryPrice) * 100;
        } else if (pos.side === 'SHORT') {
          pnlPercentage = ((pos.entryPrice - currentPrice) / pos.entryPrice) * 100;
        }

        const valueUsdt = pos.sizeUsdt * (1 + pnlPercentage / 100);

        updatedPositions.push({
          ...pos,
          currentPrice,
          pnlPercentage: parseFloat(pnlPercentage.toFixed(2)),
          currentValueUsdt: parseFloat(valueUsdt.toFixed(2))
        });
      } catch (error) {
        console.warn(`[POSITION LEDGER] Failed to get live price for ${pos.coin}:`, error.message);
        updatedPositions.push({
          ...pos,
          currentPrice: pos.entryPrice,
          pnlPercentage: 0.00,
          currentValueUsdt: pos.sizeUsdt
        });
      }
    }
    return updatedPositions;
  }

  /**
   * Closes an active position and executes the offset order if live
   */
  static async closePosition(positionId) {
    const index = this.openPositions.findIndex(p => p.id === positionId);
    if (index === -1) {
      throw new Error('Position not discovered inside ledger.');
    }

    const pos = this.openPositions[index];
    console.log(`[POSITION LEDGER] Closing position ID: ${positionId} (${pos.coin})`);

    let executionReceipt = null;

    if (!pos.isSimulation) {
      // In live spot trading:
      // Closing a LONG (buy) means selling the token.
      // Closing a SHORT (sell) means buying the token back.
      const side = pos.side === 'LONG' ? 'sell' : 'buy';
      
      // Determine close asset parameters
      let sizeToExecute = pos.sizeUsdt;
      if (side === 'sell') {
        const tokenUnits = pos.sizeUsdt / pos.entryPrice;
        sizeToExecute = tokenUnits; // Spot sell requires base asset units
      }

      console.log(`[LEDGER EXECUTION] Submitting live exit trade to Bitget: ${side} ${pos.coin}`);
      const tradeResult = await BitgetService.executeSpotMarketOrder(pos.coin, side, sizeToExecute);
      
      if (tradeResult.success) {
        executionReceipt = {
          executed: true,
          orderId: tradeResult.orderId
        };
      } else {
        throw new Error(`Live execution close failed: ${tradeResult.error}`);
      }
    } else {
      // Simulation Close
      executionReceipt = {
        executed: true,
        orderId: `sim_close_${Math.random().toString(36).substring(2, 9)}`
      };
    }

    // Remove from active register
    this.openPositions.splice(index, 1);
    return {
      success: true,
      position: pos,
      receipt: executionReceipt
    };
  }
}