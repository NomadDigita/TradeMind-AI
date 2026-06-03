import { Router } from 'express';
import { AnalyzerService } from '../services/analyzerService.js';
import { HistoryService } from '../services/historyService.js';

const router = Router();

// Retrieve all rolling trading logs
router.get('/history', (req, res) => {
  return res.json({
    success: true,
    logs: HistoryService.getHistory()
  });
});

router.post('/analyze', async (req, res) => {
  const { asset, autoExecute, amount } = req.body;

  if (!asset) {
    return res.status(400).json({ error: 'Missing parameter: asset (ticker symbol, e.g. BTC) is required.' });
  }

  const result = await AnalyzerService.runPipeline(
    asset.toUpperCase(),
    autoExecute || false,
    amount || 10
  );
  
  if (!result.success) {
    return res.status(500).json(result);
  }

  return res.json(result);
});

export default router;