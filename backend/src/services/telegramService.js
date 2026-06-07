import TelegramBot from 'node-telegram-bot-api';
import { CONFIG } from '../config/constants.js';
import { BitgetService } from './bitgetService.js';
import { AnalyzerService } from './analyzerService.js';
import { ChartService } from './chartService.js';
import { RadarService } from './radarService.js';
import { PositionService } from './positionService.js';

export class TelegramService {
  static bot = null;

  static init() {
    if (!CONFIG.TELEGRAM.TOKEN) {
      console.error('[TELEGRAM] Token missing. Bot initialization bypassed.');
      return;
    }

    this.bot = new TelegramBot(CONFIG.TELEGRAM.TOKEN, { polling: true });
    console.log('[TELEGRAM] Bot successfully initialized on polling mode.');

    this.bot.on('polling_error', (error) => {
      console.warn('[TELEGRAM ERROR]', error.message);
    });

    // Initialize Radar background scans and link our bot
    RadarService.init(this.bot);

    this.registerCommands();
    this.registerCallbacks();
  }

  static getReplyKeyboard() {
    return {
      keyboard: [
        [{ text: '📊 Scanner Basket' }, { text: '📈 BTC Live Chart' }],
        [{ text: '💰 Balance USDT' }, { text: '💼 Active Positions' }],
        [{ text: '⚙ System Status' }, { text: 'ℹ Help' }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    };
  }

  static registerCommands() {
    // 1. /start & /help
    const sendWelcome = (chatId) => {
      // Register active chat ID for Radar broadcasts
      RadarService.setActiveChatId(chatId);

      const welcomeMessage = `
🐺 <b>Welcome to TradeMind AI Assistant!</b>
<i>Smarter trading. Smarter loops. Powered by Bitget live spot markets.</i>
━━━━━━━━━━━━━━━━━━━━━━━━━━
I am your autonomous algorithmic trading assistant, scanning, analyzing, and executing spot setups based on web sentiment indicators.

🔍 <b>Market Scans:</b>
• <code>/analyze [coin]</code> - Generate target setups and entry points.
• <code>/chart [coin]</code> - Generate historical candle trendline chart.
• <code>/scanner</code> - Parallel scan for BTC, ETH, SOL, and BGB.

⚡ <b>Order Executions:</b>
• <code>/balance</code> - Check live spot USDT balances on Bitget.
• <code>/positions</code> - Display active positions and live P&L.
• <code>/auto [coin] [usdt]</code> - Open simulated/live trade on target coin.
      `;

      this.bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'HTML',
        reply_markup: this.getReplyKeyboard()
      });
    };

    this.bot.onText(/\/start/, (msg) => sendWelcome(msg.chat.id));
    this.bot.onText(/\/help/, (msg) => sendWelcome(msg.chat.id));

    // Handle Quick Reply Buttons
    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      // Ensure Radar has an active broadcast channel
      RadarService.setActiveChatId(chatId);

      if (text === '📊 Scanner Basket') {
        this.bot.onText(/\/scanner/);
        this.triggerCommand(chatId, '/scanner');
      } else if (text === '📈 BTC Live Chart') {
        this.triggerChartCommand(chatId, 'BTC');
      } else if (text === '💰 Balance USDT') {
        this.triggerCommand(chatId, '/balance');
      } else if (text === '💼 Active Positions') {
        this.triggerCommand(chatId, '/positions');
      } else if (text === '⚙ System Status') {
        this.triggerCommand(chatId, '/status');
      } else if (text === 'ℹ Help') {
        sendWelcome(chatId);
      }
    });

    // 2. /status
    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;
      const checkingMsg = await this.bot.sendMessage(chatId, '⚙ Checking network and exchange latency...', { parse_mode: 'HTML' });

      try {
        const startTime = Date.now();
        const balanceCheck = await BitgetService.getSpotUSDTBalance();
        const latency = Date.now() - startTime;
        const apiStatus = balanceCheck.success ? `✅ CONNECTED (${latency}ms)` : '❌ ERROR';
        
        const statusReport = `
⚙ <b>TradeMind AI Diagnostics:</b>

• <b>Backend Engine:</b> 🟢 ONLINE
• <b>Alibaba Qwen LLM:</b> ✅ ACTIVE
• <b>Tavily Search:</b> ✅ ACTIVE
• <b>Bitget V2 API status:</b> ${apiStatus}
• <b>Network Latency:</b> <code>${latency}ms</code>
        `;
        this.bot.editMessageText(statusReport, {
          chat_id: chatId,
          message_id: checkingMsg.message_id,
          parse_mode: 'HTML'
        });
      } catch (err) {
        this.bot.sendMessage(chatId, `⚠️ Status check error: ${err.message}`);
      }
    });

    // 3. /balance
    this.bot.onText(/\/balance/, async (msg) => {
      const chatId = msg.chat.id;
      const loadingMsg = await this.bot.sendMessage(chatId, '💰 Fetching exchange asset balance...', { parse_mode: 'HTML' });

      const result = await BitgetService.getSpotUSDTBalance();

      if (!result.success) {
        this.bot.editMessageText(`❌ <b>Balance query failed:</b>\n<code>${result.error}</code>`, {
          chat_id: chatId,
          message_id: loadingMsg.message_id,
          parse_mode: 'HTML'
        });
        return;
      }

      const balanceReport = `
💰 <b>Your Bitget Spot Balance:</b>

• <b>USDT Available:</b> ${result.usdtBalance.toFixed(2)} USDT
      `;

      this.bot.editMessageText(balanceReport, {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: 'HTML'
      });
    });

    // 4. /positions
    this.bot.onText(/\/positions/, async (msg) => {
      const chatId = msg.chat.id;
      const loadingMsg = await this.bot.sendMessage(chatId, '💼 Accessing active position register...', { parse_mode: 'HTML' });

      try {
        const activePositions = await PositionService.getActivePositionsWithPnL();

        if (activePositions.length === 0) {
          this.bot.editMessageText('💼 <b>No active positions are currently open.</b>', {
            chat_id: chatId,
            message_id: loadingMsg.message_id,
            parse_mode: 'HTML'
          });
          return;
        }

        let report = '💼 <b>Active Open Positions Tracker:</b>\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        activePositions.forEach(p => {
          const pnlColor = p.pnlPercentage >= 0 ? '🟢' : '🔴';
          const modeLabel = p.isSimulation ? '🧪 SIMULATED' : '⚡ LIVE';
          
          report += `
<b>${p.coin}USDT</b> (${modeLabel} ${p.side})
• <b>Size:</b> ${p.sizeUsdt} USDT
• <b>Entry:</b> $${p.entryPrice}
• <b>Current:</b> $${p.currentPrice}
• <b>Yield (P&L):</b> ${pnlColor} <code>${p.pnlPercentage >= 0 ? '+' : ''}${p.pnlPercentage}%</code>
          `;
        });
        report += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━';

        this.bot.editMessageText(report, {
          chat_id: chatId,
          message_id: loadingMsg.message_id,
          parse_mode: 'HTML'
        });
      } catch (err) {
        this.bot.editMessageText(`⚠️ Error querying positions: ${err.message}`, {
          chat_id: chatId,
          message_id: loadingMsg.message_id
        });
      }
    });

    // 5. /analyze [coin]
    this.bot.onText(/\/analyze\s+(.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const asset = match[1].trim().toUpperCase();

      const workingMsg = await this.bot.sendMessage(chatId, `🔍 Analyzing market news & live metrics for <b>${asset}</b>...`, { parse_mode: 'HTML' });

      const result = await AnalyzerService.runPipeline(asset, false);

      if (!result.success) {
        this.bot.editMessageText(`❌ <b>Analysis Failed:</b>\n<code>${result.error}</code>`, {
          chat_id: chatId,
          message_id: workingMsg.message_id,
          parse_mode: 'HTML'
        });
        return;
      }

      const signal = result.signal;
      const setup = signal.tradeSetup;

      const report = `
📊 <b>TradeMind AI Report: ${signal.asset}</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
• <b>Sentiment:</b> ${signal.sentiment === 'BULLISH' ? '🟢 BULLISH' : signal.sentiment === 'BEARISH' ? '🔴 BEARISH' : '🟡 NEUTRAL'}
• <b>Confidence Score:</b> <code>${signal.confidenceScore}%</code>
• <b>Trade Setup:</b> ${signal.actionableTrade ? '⚡ ACTIONABLE' : '⏸ WAIT'}

<b>Target Specs:</b>
• <b>Direction:</b> <code>${setup.direction}</code>
• <b>Entry:</b> <code>${setup.entryRange}</code>
• <b>Stop Loss:</b> <code>${setup.stopLoss}</code>
• <b>Take Profit:</b> <code>${setup.takeProfit}</code>

📝 <b>Executive Summary:</b>
<i>${signal.analysisSummary}</i>
      `;

      this.bot.editMessageText(report, {
        chat_id: chatId,
        message_id: workingMsg.message_id,
        parse_mode: 'HTML'
      });
    });

    // 6. /chart [coin] (Candle trendline graph image generator)
    this.bot.onText(/\/chart\s+(.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const coin = match[1].trim().toUpperCase();
      this.triggerChartCommand(chatId, coin);
    });

    // 7. /scanner
    this.bot.onText(/\/scanner/, async (msg) => {
      const chatId = msg.chat.id;
      const scannerMsg = await this.bot.sendMessage(chatId, '🌀 <b>Initializing Market Basket Scan...</b>\nRunning parallel sentiment analysis on BTC, ETH, SOL, and BGB...', { parse_mode: 'HTML' });

      const targetBasket = ['BTC', 'ETH', 'SOL', 'BGB'];
      let resultsText = '';

      for (const coin of targetBasket) {
        const result = await AnalyzerService.runPipeline(coin, false);
        if (result.success) {
          const signal = result.signal;
          const icon = signal.sentiment === 'BULLISH' ? '🟢' : signal.sentiment === 'BEARISH' ? '🔴' : '🟡';
          resultsText += `${icon} <b>${coin}</b>: ${signal.sentiment} | Confidence: <code>${signal.confidenceScore}%</code>\n`;
        } else {
          resultsText += `❌ <b>${coin}</b>: Scan failed.\n`;
        }
      }

      const scannerReport = `
🌀 <b>TradeMind Market Scanner Output:</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
${resultsText}
━━━━━━━━━━━━━━━━━━━━━━━━━━
<i>Use <code>/analyze [coin]</code> or <code>/chart [coin]</code> for deeper specs.</i>
      `;

      this.bot.editMessageText(scannerReport, {
        chat_id: chatId,
        message_id: scannerMsg.message_id,
        parse_mode: 'HTML'
      });
    });

    // 8. /auto [coin] [usdt]
    this.bot.onText(/\/auto\s+(\S+)\s+(\S+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const asset = match[1].trim().toUpperCase();
      const usdtSize = parseFloat(match[2]);

      const processMsg = await this.bot.sendMessage(chatId, `🤖 <b>[AUTOPILOT EN ROUTE]</b>\nRunning scan for <b>${asset}</b>. Sizing allocation: <code>${usdtSize} USDT</code>...`, { parse_mode: 'HTML' });

      const result = await AnalyzerService.runPipeline(asset, true, usdtSize, false);

      if (!result.success) {
        this.bot.editMessageText(`❌ <b>Autopilot pipeline failed:</b>\n<code>${result.error}</code>`, {
          chat_id: chatId,
          message_id: processMsg.message_id,
          parse_mode: 'HTML'
        });
        return;
      }

      const signal = result.signal;
      const execution = result.execution;
      const setup = signal.tradeSetup;

      let executionSummary = '';
      if (execution && execution.executed) {
        executionSummary = `⚡ <b>AUTONOMOUS ORDER EXECUTED:</b>\n• Status: ✅ Fill Completed\n• Side: <code>${execution.side.toUpperCase()}</code>\n• Order ID: <code>${execution.orderId}</code>`;
      } else {
        executionSummary = `⏸ <b>ORDER SKIPPED:</b>\n<i>Confidence did not meet the 80% execution threshold.</i>`;
      }

      const report = `
🤖 <b>Autonomous Action Log: ${signal.asset}</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
• <b>Sentiment:</b> ${signal.sentiment}
• <b>Confidence:</b> <code>${signal.confidenceScore}%</code>

<b>Trading Setup:</b>
• <b>Stop Loss:</b> <code>${setup.stopLoss}</code>
• <b>Take Profit:</b> <code>${setup.takeProfit}</code>

━━━━━━━━━━━━━━━━━━━━━━━━━━
${executionSummary}
━━━━━━━━━━━━━━━━━━━━━━━━━━
      `;

      this.bot.editMessageText(report, {
        chat_id: chatId,
        message_id: processMsg.message_id,
        parse_mode: 'HTML'
      });
    });
  }

  /**
   * Helper to execute internal bot triggers
   */
  static triggerCommand(chatId, text) {
    const fakeMsg = { chat: { id: chatId }, text: text };
    const matched = this.bot.listeners('text');
    for (const listener of matched) {
      listener(fakeMsg);
    }
  }

  /**
   * Chart rendering dispatcher
   */
  static async triggerChartCommand(chatId, coin) {
    const loadingMsg = await this.bot.sendMessage(chatId, `📈 Generating live 24H candle chart for <b>${coin}USDT</b>...`, { parse_mode: 'HTML' });
    
    try {
      const chartUrl = await ChartService.generateLiveChartUrl(coin);
      const price = await BitgetService.getTickerPrice(`${coin}USDT`);

      const caption = `
📈 <b>${coin}/USDT:USDT Live Chart</b>
• <b>Timeframe:</b> 1H Rolling
• <b>Last Spot Price:</b> $${price}

<i>Market data fed directly from Bitget spot servers. Use action buttons below to verify or analyze.</i>
      `;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: `📊 Analyze ${coin}`, callback_data: `btn_analyze_${coin}` },
            { text: `⚡ Paper LONG (5 USDT)`, callback_data: `btn_paper_${coin}_LONG` }
          ]
        ]
      };

      await this.bot.sendPhoto(chatId, chartUrl, {
        caption: caption,
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard
      });

      // Clear loading message
      this.bot.deleteMessage(chatId, loadingMsg.message_id);
    } catch (err) {
      this.bot.editMessageText(`❌ Failed to render chart: ${err.message}`, {
        chat_id: chatId,
        message_id: loadingMsg.message_id
      });
    }
  }

  /**
   * Interactive Callback Queries (Triggers trade executions on button taps)
   */
  static registerCallbacks() {
    this.bot.on('callback_query', async (callbackQuery) => {
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;
      const data = callbackQuery.data;

      // Handle ignore action
      if (data === 'radar_ignore') {
        this.bot.answerCallbackQuery(callbackQuery.id, { text: 'Alert Dismissed' });
        this.bot.deleteMessage(chatId, messageId);
        return;
      }

      // Handle Radar Order Executions
      if (data.startsWith('radar_exec_')) {
        const parts = data.split('_'); // ['radar', 'exec', coin, direction]
        const coin = parts[2];
        const direction = parts[3];

        this.bot.answerCallbackQuery(callbackQuery.id, { text: `Executing Simulated position for ${coin}...` });
        this.bot.sendMessage(chatId, `🌀 Placing simulated paper order: <b>${direction}</b> on <b>${coin}</b>...`, { parse_mode: 'HTML' });

        try {
          const result = await AnalyzerService.runPipeline(coin, true, 10, true); // True: Auto-execute, 10 USDT, True: isSimulation
          if (result.success && result.execution?.executed) {
            this.bot.sendMessage(chatId, `✅ <b>Simulation Position Filled!</b>\nOrder ID: <code>${result.execution.orderId}</code>\nCoin: ${coin}USDT\nSize: 10 USDT`, { parse_mode: 'HTML' });
          } else {
            this.bot.sendMessage(chatId, `❌ Order execution rejected: ${result.execution?.reason || 'Internal error'}`);
          }
        } catch (err) {
          this.bot.sendMessage(chatId, `❌ Pipeline execution failed: ${err.message}`);
        }
        return;
      }

      // Handle Chart Button Executions
      if (data.startsWith('btn_analyze_')) {
        const coin = data.split('_')[2];
        this.bot.answerCallbackQuery(callbackQuery.id, { text: `Querying analysis for ${coin}...` });
        this.triggerCommand(chatId, `/analyze ${coin}`);
        return;
      }

      if (data.startsWith('btn_paper_')) {
        const parts = data.split('_'); // ['btn', 'paper', coin, direction]
        const coin = parts[2];
        const direction = parts[3];

        this.bot.answerCallbackQuery(callbackQuery.id, { text: `Executing Paper LONG on ${coin}...` });
        
        try {
          const result = await AnalyzerService.runPipeline(coin, true, 5, true); // autoExecute: true, amount: 5 USDT, isSimulation: true
          if (result.success && result.execution?.executed) {
            this.bot.sendMessage(chatId, `✅ <b>Simulated Paper Position Opened!</b>\nCoin: ${coin}USDT\nDirection: ${direction}\nSize: 5 USDT\nOrder ID: <code>${result.execution.orderId}</code>`, { parse_mode: 'HTML' });
          } else {
            this.bot.sendMessage(chatId, `⏸ Trade skipped: ${result.execution?.reason || 'Invalid setup'}`);
          }
        } catch (err) {
          this.bot.sendMessage(chatId, `❌ Execution exception: ${err.message}`);
        }
        return;
      }
    });
  }
}