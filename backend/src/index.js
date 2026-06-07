import express from 'express';
import cors from 'cors';
import { CONFIG } from './config/constants.js';
import analyzerRouter from './routes/analyzerRoutes.js';
import bitgetRouter from './routes/bitgetRoutes.js';
import { TelegramService } from './services/telegramService.js';
import { PingService } from './services/pingService.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes Mount Configuration
app.use('/api/v1/analyzer', analyzerRouter);
app.use('/api/v1/bitget', bitgetRouter);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: CONFIG.NODE_ENV
  });
});

// Initialize background Telegram Bot polling agent
TelegramService.init();

app.listen(CONFIG.PORT, () => {
  console.log(`[SYSTEM] TradeMind AI Backend running on port ${CONFIG.PORT}`);
  console.log(`[SYSTEM] Node Environment: ${CONFIG.NODE_ENV}`);
  
  if (process.env.RENDER_EXTERNAL_URL) {
    PingService.startKeepAlive(process.env.RENDER_EXTERNAL_URL);
  }
});