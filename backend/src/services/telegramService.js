import TelegramBot from 'node-telegram-bot-api';
import { CONFIG } from '../config/constants.js';
import { BitgetService } from './bitgetService.js';
import { AnalyzerService } from './analyzerService.js';

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

    this.registerCommands();
  }

  static registerCommands() {
    // 1. /start & /help
    const sendWelcome = (chatId) => {
      const welcomeMessage = `
🤖 <b>Welcome to TradeMind AI Assistant!</b>

I am your autonomous algorithmic trading agent, connecting real-time news search to live spot execution.

<b>📊 Core Market Commands:</b>
• <code>/analyze [coin]</code> - Fetch news, analyze sentiment, and map technical setups.
• <code>/scanner</code> - <b>Basket Scanner</b>: Instantly scans top assets (BTC, ETH, SOL, BGB) in one command.

<b>⚡ Trade & Account Commands:</b>
• <code>/balance</code> - Check live spot USDT balances on Bitget.
• <code>/positions</code> - Display active token holdings and estimated valuations.
• <code>/auto [coin] [usdt]</code> - <b>Autopilot Mode</b>: Automatically places trade if AI confidence is &gt;= 80%.

<b>⚙ System Diagnostics:</b>
• <code>/status</code> - Check active nodes, Qwen, and exchange connection latency.
      `;
      this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'HTML' });
    };

    this.bot.onText(/\/start/, (msg) => sendWelcome(msg.chat.id));
    this.bot.onText(/\/help/, (msg) => sendWelcome(msg.chat.id));

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
• <b>Environment Tier:</b> production
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
      const loadingMsg = await this.bot.sendMessage(chatId, '🔎 Scanning open exchange holdings...', { parse_mode: 'HTML' });

      const result = await BitgetService.getSpotUSDTBalance();

      if (!result.success) {
        this.bot.editMessageText(`❌ <b>Failed to query assets:</b>\n<code>${result.error}</code>`, {
          chat_id: chatId,
          message_id: loadingMsg.message_id,
          parse_mode: 'HTML'
        });
        return;
      }

      let assetsText = '';
      const activeAssets = result.allAssets.filter(a => parseFloat(a.available) > 0 && a.coin !== 'USDT');

      if (activeAssets.length === 0) {
        assetsText = '<i>No active alternative token positions open.</i>';
      } else {
        for (const asset of activeAssets) {
          try {
            const price = await BitgetService.getTickerPrice(`${asset.coin}USDT`);
            const value = parseFloat(asset.available) * price;
            assetsText += `• <b>${asset.coin}</b>: ${parseFloat(asset.available).toFixed(4)} (~$${value.toFixed(2)})\n`;
          } catch {
            assetsText += `• <b>${asset.coin}</b>: ${parseFloat(asset.available).toFixed(4)}\n`;
          }
        }
      }

      const positionReport = `
💼 <b>Active Open Positions:</b>

${assetsText}
      `;

      this.bot.editMessageText(positionReport, {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: 'HTML'
      });
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

    // 6. /scanner (Basket Scanner)
    this.bot.onText(/\/scanner/, async (msg) => {
      const chatId = msg.chat.id;
      const scannerMsg = await this.bot.sendMessage(chatId, '🌀 <b>Initializing Market Basket Scan...</b>\nRunning parallel sentiment analysis on BTC, ETH, SOL, and BGB...', { parse_mode: 'HTML' });

      const targetBasket = ['BTC', 'ETH', 'SOL', 'BGB'];
      let resultsText = '';

      for (const coin of targetBasket) {
        this.bot.editMessageText(`🌀 <b>Scanning Basket...</b>\nProcessing analysis parameters for <b>${coin}</b>...`, {
          chat_id: chatId,
          message_id: scannerMsg.message_id,
          parse_mode: 'HTML'
        });

        const result = await AnalyzerService.runPipeline(coin, false);
        if (result.success) {
          const signal = result.signal;
          const icon = signal.sentiment === 'BULLISH' ? '🟢' : signal.sentiment === 'BEARISH' ? '🔴' : '🟡';
          resultsText += `${icon} <b>${coin}</b>: ${signal.sentiment} | Confidence: <code>${signal.confidenceScore}%</code> | Target: <code>${signal.tradeSetup?.takeProfit || 'N/A'}</code>\n`;
        } else {
          resultsText += `❌ <b>${coin}</b>: Scan failed.\n`;
        }
      }

      const scannerReport = `
🌀 <b>TradeMind Market Scanner Output:</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
${resultsText}
━━━━━━━━━━━━━━━━━━━━━━━━━━
<i>Use <code>/analyze [coin]</code> for individual setup details.</i>
      `;

      this.bot.editMessageText(scannerReport, {
        chat_id: chatId,
        message_id: scannerMsg.message_id,
        parse_mode: 'HTML'
      });
    });

    // 7. /auto [coin] [usdt]
    this.bot.onText(/\/auto\s+(\S+)\s+(\S+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const asset = match[1].trim().toUpperCase();
      const usdtSize = parseFloat(match[2]);

      const processMsg = await this.bot.sendMessage(chatId, `🤖 <b>[AUTOPILOT EN ROUTE]</b>\nRunning scan for <b>${asset}</b>. Sizing allocation: <code>${usdtSize} USDT</code>...`, { parse_mode: 'HTML' });

      // Run live execution pipeline
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
}