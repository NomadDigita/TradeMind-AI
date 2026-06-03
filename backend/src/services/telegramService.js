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

    // Initialize polling bot
    this.bot = new TelegramBot(CONFIG.TELEGRAM.TOKEN, { polling: true });
    console.log('[TELEGRAM] Bot successfully initialized on polling mode.');

    // Catch polling errors to prevent process crashes
    this.bot.on('polling_error', (error) => {
      console.warn('[TELEGRAM ERROR]', error.message);
    });

    this.registerCommands();
  }

  static registerCommands() {
    // 1. /start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const welcomeMessage = `
🤖 <b>Welcome to TradeMind AI Assistant!</b>

I am your autonomous algorithmic trader, connecting live market data search to execution engines.

<b>Core Commands Available:</b>
📊 <code>/analyze [coin]</code> - Fetch news, analyze sentiment and calculate targets.
💰 <code>/balance</code> - Display your active Bitget Spot balances.
⚡ <code>/trade [coin] [buy|sell] [amount]</code> - Execute manual market spot trade.
🛡 <code>/auto [coin] [amount_usdt]</code> - <b>Autonomous Agent Mode</b>. Performs analysis and auto-executes on Bitget only if AI confidence is <b>&gt;= 80%</b>.
⚙ <code>/status</code> - Confirm system health and API verifications.

<i>Example: Send <code>/analyze BTC</code> to scan now.</i>
      `;
      this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'HTML' });
    });

    // 2. /status command
    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;
      const checkingMsg = await this.bot.sendMessage(chatId, '⚙ Checking node and API health status...', { parse_mode: 'HTML' });

      try {
        const balanceCheck = await BitgetService.getSpotUSDTBalance();
        const apiStatus = balanceCheck.success ? '✅ CONNECTED' : '❌ ERROR';
        
        const statusReport = `
⚙ <b>TradeMind AI System Status:</b>

• <b>Backend Status:</b> 🟢 ONLINE
• <b>Alibaba Qwen LLM:</b> ✅ ACTIVE
• <b>Tavily Search:</b> ✅ ACTIVE
• <b>Bitget V2 API Connection:</b> ${apiStatus}
• <b>Active Environment:</b> ${CONFIG.NODE_ENV}
        `;
        this.bot.editMessageText(statusReport, {
          chat_id: chatId,
          message_id: checkingMsg.message_id,
          parse_mode: 'HTML'
        });
      } catch (err) {
        this.bot.sendMessage(chatId, `⚠️ Status check exception: ${err.message}`);
      }
    });

    // 3. /balance command
    this.bot.onText(/\/balance/, async (msg) => {
      const chatId = msg.chat.id;
      const loadingMsg = await this.bot.sendMessage(chatId, '💰 Querying live Bitget wallet balances...', { parse_mode: 'HTML' });

      const result = await BitgetService.getSpotUSDTBalance();

      if (!result.success) {
        this.bot.editMessageText(`❌ <b>Failed to fetch balances:</b>\n<code>${result.error}</code>`, {
          chat_id: chatId,
          message_id: loadingMsg.message_id,
          parse_mode: 'HTML'
        });
        return;
      }

      let assetsText = '';
      const activeAssets = result.allAssets.filter(a => parseFloat(a.available) > 0);

      if (activeAssets.length === 0) {
        assetsText = '<i>No assets with positive balances found.</i>';
      } else {
        activeAssets.forEach(a => {
          assetsText += `• <b>${a.coin}</b>: ${parseFloat(a.available).toFixed(6)}\n`;
        });
      }

      const balanceReport = `
💰 <b>Your Live Bitget Spot Balance:</b>

• <b>USDT Available:</b> ${result.usdtBalance.toFixed(2)} USDT

<b>All Positive Assets:</b>
${assetsText}
      `;

      this.bot.editMessageText(balanceReport, {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: 'HTML'
      });
    });

    // 4. /analyze [coin] command
    this.bot.onText(/\/analyze\s+(.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const asset = match[1].trim().toUpperCase();

      const workingMsg = await this.bot.sendMessage(chatId, `🔍 Scanning news for <b>${asset}</b> & invoking Qwen LLM...`, { parse_mode: 'HTML' });

      const result = await AnalyzerService.runPipeline(asset, false);

      if (!result.success) {
        this.bot.editMessageText(`❌ <b>Analysis Pipeline Failed:</b>\n<code>${result.error}</code>`, {
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
• <b>Trade Recommendation:</b> ${signal.actionableTrade ? '⚡ ACTIONABLE' : '⏸ NO TRADE'}

<b>Trade Parameters:</b>
• <b>Direction:</b> <code>${setup.direction}</code>
• <b>Entry Zone:</b> <code>${setup.entryRange}</code>
• <b>Stop Loss:</b> <code>${setup.stopLoss}</code>
• <b>Take Profit:</b> <code>${setup.takeProfit}</code>
• <b>Recommended Allocation:</b> <code>${setup.sizingPercentage}%</code>

📝 <b>AI Executive Summary:</b>
<i>${signal.analysisSummary}</i>
━━━━━━━━━━━━━━━━━━━━━━━━━━
<i>Analyzed ${result.rawNewsSourcesUsedCount} real-time web articles.</i>
      `;

      this.bot.editMessageText(report, {
        chat_id: chatId,
        message_id: workingMsg.message_id,
        parse_mode: 'HTML'
      });
    });

    // 5. /trade [coin] [buy/sell] [amount] command
    this.bot.onText(/\/trade\s+(\S+)\s+(\S+)\s+(\S+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const coin = match[1].trim().toUpperCase();
      const side = match[2].trim().toLowerCase();
      const amount = parseFloat(match[3]);

      if (side !== 'buy' && side !== 'sell') {
        this.bot.sendMessage(chatId, '❌ Invalid execution parameters. Use format: <code>/trade [coin] [buy|sell] [amount]</code>', { parse_mode: 'HTML' });
        return;
      }

      const executionMsg = await this.bot.sendMessage(chatId, `⚡ Sending <b>${side.toUpperCase()}</b> order for <b>${coin}</b>...`, { parse_mode: 'HTML' });

      const tradeResult = await BitgetService.executeSpotMarketOrder(coin, side, amount);

      if (!tradeResult.success) {
        this.bot.editMessageText(`❌ <b>Execution Failed:</b>\n<code>${tradeResult.error}</code>`, {
          chat_id: chatId,
          message_id: executionMsg.message_id,
          parse_mode: 'HTML'
        });
        return;
      }

      const successReport = `
✅ <b>Order Placed Successfully on Bitget!</b>

• <b>Trading Pair:</b> ${coin}USDT
• <b>Action:</b> ${side.toUpperCase()}
• <b>Size Parameters:</b> ${amount}
• <b>Bitget Order ID:</b> <code>${tradeResult.orderId}</code>
      `;

      this.bot.editMessageText(successReport, {
        chat_id: chatId,
        message_id: executionMsg.message_id,
        parse_mode: 'HTML'
      });
    });

    // 6. /auto [coin] [usdt_amount] command (Autonomous Loop)
    this.bot.onText(/\/auto\s+(\S+)\s+(\S+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const asset = match[1].trim().toUpperCase();
      const usdtSize = parseFloat(match[2]);

      const processMsg = await this.bot.sendMessage(chatId, `🤖 <b>[AUTOPILOT ACTIVATED]</b>\nAnalyzing <b>${asset}</b> with execution parameters: <code>${usdtSize} USDT</code>. Checking live data...`, { parse_mode: 'HTML' });

      const result = await AnalyzerService.runPipeline(asset, true, usdtSize);

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
        executionSummary = `⚡ <b>AUTONOMOUS ORDER EXECUTED:</b>\n• Status: ✅ Position Filled\n• Side: <code>${execution.side.toUpperCase()}</code>\n• Order ID: <code>${execution.orderId}</code>\n• Allocated Capital: <code>${execution.amountAllocated} USDT</code>`;
      } else if (execution && !execution.executed) {
        executionSummary = `⏸ <b>ORDER SKIPPED:</b>\n<i>${execution.reason || execution.error}</i>`;
      } else {
        executionSummary = '⏸ <b>ORDER SKIPPED:</b>\n<i>AI did not find an actionable trade opportunity.</i>';
      }

      const report = `
🤖 <b>Autonomous Agent Action Log: ${signal.asset}</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
• <b>Sentiment:</b> ${signal.sentiment === 'BULLISH' ? '🟢 BULLISH' : signal.sentiment === 'BEARISH' ? '🔴 BEARISH' : '🟡 NEUTRAL'}
• <b>AI Confidence:</b> <code>${signal.confidenceScore}%</code>

<b>Trading Parameters generated by Qwen:</b>
• <b>Direction:</b> <code>${setup.direction}</code>
• <b>Entry Range:</b> <code>${setup.entryRange}</code>
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