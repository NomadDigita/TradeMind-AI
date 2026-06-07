import axios from 'axios';
import { CONFIG } from '../config/constants.js';

export class ChartService {
  /**
   * Fetches spot candle data and constructs an animated trendline chart image URL
   * @param {string} coin - e.g. 'BTC'
   * @returns {Promise<string>} Hosted QuickChart Image URL
   */
  static async generateLiveChartUrl(coin) {
    const symbol = `${coin.toUpperCase()}USDT`;
    const endpoint = `${CONFIG.BITGET.API_URL}/api/v2/spot/market/candles?symbol=${symbol}&granularity=1h&limit=24`;

    try {
      const response = await axios.get(endpoint);
      if (!response.data || response.data.code !== '00000' || !response.data.data) {
        throw new Error(response.data?.msg || 'Failed to fetch historical candles.');
      }

      const candles = response.data.data; // Array of [ts, open, high, low, close, volume, clovol]
      
      // Extract timestamps and closing prices (sorting chronologically)
      const sortedCandles = [...candles].reverse();
      const labels = sortedCandles.map((c, i) => {
        const time = new Date(parseInt(c[0]));
        return `${time.getHours()}:00`;
      });
      const prices = sortedCandles.map(c => parseFloat(c[4]));

      // Determine price action color theme
      const firstPrice = prices[0];
      const lastPrice = prices[prices.length - 1];
      const isUptrend = lastPrice >= firstPrice;
      const borderTheme = isUptrend ? '#10b981' : '#f43f5e';
      const fillTheme = isUptrend ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)';

      // Construct Chart.js configuration parameter
      const chartConfig = {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: `${symbol} (1H Timeline)`,
            data: prices,
            borderColor: borderTheme,
            borderWidth: 3,
            fill: true,
            backgroundColor: fillTheme,
            pointRadius: 0,
            lineTension: 0.3
          }]
        },
        options: {
          title: {
            display: true,
            text: `TradeMind AI Pro — ${symbol} Live Chart`,
            fontSize: 16,
            fontColor: '#f1f5f9'
          },
          legend: {
            labels: { fontColor: '#94a3b8' }
          },
          scales: {
            xAxes: [{
              gridLines: { color: 'rgba(255,255,255,0.05)' },
              ticks: { fontColor: '#64748b', maxTicksLimit: 6 }
            }],
            yAxes: [{
              gridLines: { color: 'rgba(255,255,255,0.05)' },
              ticks: { fontColor: '#94a3b8' }
            }]
          }
        }
      };

      // URL encode configuration
      const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
      return `https://quickchart.io/chart?bkg=%23060814&c=${encodedConfig}`;
    } catch (error) {
      console.error('[CHART SERVICE ERROR]', error.message);
      // Fallback clean static image if parser fails
      return `https://quickchart.io/chart?bkg=%23060814&c={type:'line',data:{labels:['Error'],datasets:[{label:'Loading',data:[0]}]}}`;
    }
  }
}