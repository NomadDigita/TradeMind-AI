import { AnalyzerService } from './analyzerService.js';

export class RadarService {
  static botInstance = null;
  static activeChatId = null; // Stores last active user chat ID to broadcast alerts
  static intervalTimer = null;

  /**
   * Initializes background market scanner loops
   */
  static init(bot, defaultChatId = null) {
    this.botInstance = bot;
    this.activeChatId = defaultChatId;
    
    console.log('[RADAR SERVICE] Background Market Radar successfully initialized.');
    
    // Optimized: Scan every 4 hours (4 * 60 * 60 * 1000 ms) to conserve API tokens
    const scanInterval = 4 * 60 * 60 * 1000;
    
    this.intervalTimer = setInterval(() => {
      this.executeRadarScan();
    }, scanInterval);
  }

  static setActiveChatId(chatId) {
    this.activeChatId = chatId;
    console.log(`[RADAR SERVICE] Broadcast channel matched to chat ID: ${chatId}`);
  }

  static async executeRadarScan() {
    if (!this.activeChatId) {
      console.log('[RADAR SERVICE] Scanning postponed. No active chat channels registered.');
      return;
    }

    const scanBasket = ['BTC', 'ETH', 'SOL', 'BGB'];
    console.log('[RADAR SERVICE] Executing background scans across basket:', scanBasket);

    for (const coin of scanBasket) {
      try {
        const result = await AnalyzerService.runPipeline(coin, false);
        if (result.success) {
          const signal = result.signal;
          
          // Trigger high-priority alert if confidence >= 90%
          if (signal.confidenceScore >= 90) {
            console.log(`[RADAR ALERT] Detected high confidence setup for ${coin}: ${signal.confidenceScore}%`);
            await this.broadcastRadarAlert(coin, signal);
          }
        }
      } catch (err) {
        console.error(`[RADAR SCAN EXCEPTION] Asset ${coin} failed:`, err.message);
      }
    }
  }

  /**
   * Broadcasts high-grade HTML prompt alert to Telegram with quick order execution buttons
   */
  static async broadcastRadarAlert(coin, signal) {
    if (!this.botInstance || !this.activeChatId) return;

    const setup = signal.tradeSetup;
    const directionIcon = setup.direction === 'LONG' ? '🟢' : '🔴';

    const alertMessage = `
🚨 <b>HIGH-PRIORITY MARKET RADAR ALERT!</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
Our background scanner has detected a highly significant, high-confidence catalyst for <b>${coin}</b>.

• <b>Detected Bias:</b> ${directionIcon} <b>${signal.sentiment}</b>
• <b>Model Confidence:</b> <code>${signal.confidenceScore}%</code>

<b>Trading Metrics:</b>
• <b>Direction:</b> <code>${setup.direction}</code>
• <b>Entry Range:</b> <code>${setup.entryRange}</code>
• <b>Target:</b> <code>${setup.takeProfit}</code>
• <b>Stop Loss:</b> <code>${setup.stopLoss}</code>

📝 <b>AI Context:</b>
<i>${signal.analysisSummary}</i>
━━━━━━━━━━━━━━━━━━━━━━━━━━
<i>Action buttons below can be clicked to execute the trade directly in simulated paper trading mode.</i>
    `;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: `⚡ Execute Simulated ${setup.direction}`, callback_data: `radar_exec_${coin}_${setup.direction}` },
          { text: '⏸ Ignore Setup', callback_data: 'radar_ignore' }
        ]
      ]
    };

    try {
      await this.botInstance.sendMessage(this.activeChatId, alertMessage, {
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard
      });
    } catch (err) {
      console.error('[RADAR BROADCAST ERROR]', err.message);
    }
  }
}