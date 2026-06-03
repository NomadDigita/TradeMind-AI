import { Router } from 'express';
import { BitgetService } from '../services/bitgetService.js';

const router = Router();

// Test Route: Fetch Available Balance
router.get('/balance', async (req, res) => {
  const result = await BitgetService.getSpotUSDTBalance();
  if (!result.success) {
    return res.status(500).json(result);
  }
  return res.json(result);
});

// Test Route: Fetch Live Symbol Price
router.get('/ticker/:coin', async (req, res) => {
  try {
    const symbol = `${req.params.coin.toUpperCase()}USDT`;
    const price = await BitgetService.getTickerPrice(symbol);
    return res.json({ symbol, lastPrice: price });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Test Route: Manual Execution (Use carefully, will trigger execution)
router.post('/execute', async (req, res) => {
  const { coin, side, amount } = req.body;

  if (!coin || !side || !amount) {
    return res.status(400).json({ error: 'Missing parameter parameters: coin, side, or amount.' });
  }

  const result = await BitgetService.executeSpotMarketOrder(coin, side, amount);
  if (!result.success) {
    return res.status(500).json(result);
  }
  return res.json(result);
});

export default router;