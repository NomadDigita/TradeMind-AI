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

// Main pipeline routes configuration
app.use('/api/v1/analyzer', analyzerRouter);
app.use('/api/v1/bitget', bitgetRouter);

// Health check endpoint (vital for Vercel/Render keep-alive pings)
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
  
  // Triggers the keep-alive autoping if RENDER_EXTERNAL_URL is set by Render environment
  if (process.env.RENDER_EXTERNAL_URL) {
    PingService.startKeepAlive(process.env.RENDER_EXTERNAL_URL);
  }
});