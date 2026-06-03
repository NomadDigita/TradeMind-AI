import axios from 'axios';
import { CONFIG } from '../config/constants.js';

export class TavilyService {
  /**
   * Performs a search query for market or coin news
   * @param {string} query - The search query (e.g., "Bitcoin news latest")
   * @returns {Promise<Array>} - Structured search results
   */
  static async searchMarketNews(query) {
    if (!CONFIG.TAVILY.API_KEY) {
      throw new Error('Tavily API key is missing in configurations.');
    }

    try {
      console.log(`[TAVILY] Querying: "${query}"`);
      const response = await axios.post('https://api.tavily.com/search', {
        api_key: CONFIG.TAVILY.API_KEY,
        query: `${query} crypto market analysis sentiment`,
        search_depth: 'advanced',
        include_answer: false,
        include_raw_content: false,
        max_results: 5
      });

      if (response.data && response.data.results) {
        return response.data.results.map(result => ({
          title: result.title,
          url: result.url,
          content: result.content,
          score: result.score
        }));
      }

      return [];
    } catch (error) {
      console.error('[TAVILY ERROR]', error.response?.data || error.message);
      throw new Error(`Failed to fetch news from Tavily: ${error.message}`);
    }
  }
}