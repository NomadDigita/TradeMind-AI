import { Router } from 'express';
import { BitgetService } from '../services/bitgetService.js';
import { PositionService } from '../services/positionService.js';
import { RadarService } from '../services/radarService.js';

const router = Router();

// Retrieve all active ledger positions with live P&L values
router.get('/positions', async (req, res) => {
  try {
    const positions = await PositionService.getActivePositionsWithPnL();
    return res.json({ success: true, positions });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Close an active ledger position
router.post('/close', async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing parameter: id (Position ID) is required.' });
  }

  try {
    const result = await PositionService.closePosition(id);
    
    // Broadcast close receipts directly to Telegram
    if (RadarService.botInstance && RadarService.activeChatId) {
      const pos = result.position;
      const receiptMsg = `
📦 <b>[POSITION TERMINATED]</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
An active position has been closed via the dashboard control.

• <b>Asset:</b> ${pos.coin}USDT
• <b>Side:</b> <code>${pos.side}</code>
• <b>Mode:</b> ${pos.isSimulation ? '🧪 SIMULATED (PAPER)' : '⚡ LIVE ACCOUNT'}
• <b>Entry Level:</b> $${pos.entryPrice}
━━━━━━━━━━━━━━━━━━━━━━━━━━
      `;
      RadarService.botInstance.sendMessage(RadarService.activeChatId, receiptMsg, { parse_mode: 'HTML' });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/balance', async (req, res) => {
  const result = await BitgetService.getSpotUSDTBalance();
  if (!result.success) {
    return res.status(500).json(result);
  }
  return res.json(result);
});

router.get('/ticker/:coin', async (req, res) => {
  try {
    const symbol = `${req.params.coin.toUpperCase()}USDT`;
    const price = await BitgetService.getTickerPrice(symbol);
    return res.json({ symbol, lastPrice: price });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;