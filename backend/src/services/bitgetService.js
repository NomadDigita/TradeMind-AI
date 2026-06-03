import axios from 'axios';
import CryptoJS from 'crypto-js';
import { CONFIG } from '../config/constants.js';

export class BitgetService {
  /**
   * Generates headers required for Bitget V2 authenticated requests
   * @param {string} method - HTTP Method (e.g., 'GET', 'POST')
   * @param {string} requestPath - Endpoint path (e.g., '/api/v2/spot/account/assets')
   * @param {string} queryString - Query string if any (including '?'), e.g., '?symbol=BTCUSDT'
   * @param {Object|string} body - Request body if any
   * @returns {Object} Signed headers
   */
  static generateHeaders(method, requestPath, queryString = '', body = '') {
    const timestamp = Date.now().toString();
    const secret = CONFIG.BITGET.SECRET_KEY;
    
    let bodyString = '';
    if (body) {
      bodyString = typeof body === 'object' ? JSON.stringify(body) : body;
    }

    // Bitget V2 Sign rule: timestamp + method + requestPath + queryString + body
    const preHash = timestamp + method.toUpperCase() + requestPath + queryString + bodyString;
    const hash = CryptoJS.HmacSHA256(preHash, secret);
    const signature = CryptoJS.enc.Base64.stringify(hash);

    return {
      'ACCESS-KEY': CONFIG.BITGET.API_KEY,
      'ACCESS-SIGN': signature,
      'ACCESS-TIMESTAMP': timestamp,
      'ACCESS-PASSPHRASE': CONFIG.BITGET.PASSPHRASE,
      'Content-Type': 'application/json',
      'locale': 'en-US'
    };
  }

  /**
   * Fetches the current live ticker price for a spot asset using V2 API
   * @param {string} symbol - e.g. 'BTCUSDT'
   * @returns {Promise<number>} current market price
   */
  static async getTickerPrice(symbol) {
    const requestPath = '/api/v2/spot/market/tickers';
    const queryString = `?symbol=${symbol}`;
    const requestUrl = `${CONFIG.BITGET.API_URL}${requestPath}${queryString}`;

    try {
      const response = await axios.get(requestUrl);
      if (response.data && response.data.code === '00000' && response.data.data?.[0]) {
        return parseFloat(response.data.data[0].lastPr);
      }
      throw new Error(response.data?.msg || `Failed to find V2 ticker data for ${symbol}`);
    } catch (error) {
      console.error('[BITGET TICKER ERROR]', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Retrieves active spot account balances using V2 API
   * @returns {Promise<Object>} Object containing asset balances
   */
  static async getSpotUSDTBalance() {
    const requestPath = '/api/v2/spot/account/assets';
    const method = 'GET';
    const requestUrl = `${CONFIG.BITGET.API_URL}${requestPath}`;

    try {
      console.log(`[BITGET] Connecting to V2 Balance: ${requestUrl}`);
      const headers = this.generateHeaders(method, requestPath);
      const response = await axios.get(requestUrl, { headers });

      if (response.data && response.data.code === '00000') {
        const assets = response.data.data || [];
        const usdtAsset = assets.find(a => a.coin === 'USDT') || { available: '0.00' };
        return {
          success: true,
          usdtBalance: parseFloat(usdtAsset.available),
          allAssets: assets
        };
      } else {
        throw new Error(response.data?.msg || 'Verification failed');
      }
    } catch (error) {
      console.log('--- DETAILED BITGET V2 ERROR LOG ---');
      console.log('Request URL:', requestUrl);
      if (error.response) {
        console.log('Response Status:', error.response.status);
        console.log('Response Data Payload:', JSON.stringify(error.response.data));
      } else {
        console.log('Error Message:', error.message);
      }
      console.log('------------------------------------');

      return {
        success: false,
        error: error.response?.data?.msg || error.message,
        usdtBalance: 0
      };
    }
  }

  /**
   * Place a Spot Market Order using V2 API
   * @param {string} coin - Ticker symbol, e.g., 'BTC' (will append USDT)
   * @param {string} side - 'buy' or 'sell'
   * @param {number} amount - For 'buy': total USDT allocation. For 'sell': units of target coin.
   * @returns {Promise<Object>} Execution receipt
   */
  static async executeSpotMarketOrder(coin, side, amount) {
    const requestPath = '/api/v2/spot/trade/place-order';
    const method = 'POST';
    const symbol = `${coin.toUpperCase()}USDT`;

    const body = {
      symbol: symbol,
      side: side.toLowerCase(), // 'buy' or 'sell'
      orderType: 'market',
      force: 'gtc',
      size: amount.toString() // For buy, this represents total USDT to spend; for sell, it's the coin quantity.
    };

    try {
      console.log(`[BITGET] Preparing V2 ${side.toUpperCase()} market order for ${symbol}. Amount parameter: ${amount}`);
      const headers = this.generateHeaders(method, requestPath, '', body);
      const response = await axios.post(`${CONFIG.BITGET.API_URL}${requestPath}`, body, { headers });

      if (response.data && response.data.code === '00000') {
        return {
          success: true,
          orderId: response.data.data.orderId,
          clientOid: response.data.data.clientOid,
          rawResponse: response.data.data
        };
      } else {
        throw new Error(response.data?.msg || 'Execution failed');
      }
    } catch (error) {
      console.error('[BITGET ORDER EXECUTION ERROR]', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.msg || error.message
      };
    }
  }
}