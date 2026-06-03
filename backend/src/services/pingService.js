import axios from 'axios';

export class PingService {
  /**
   * Starts a background polling loop targeting its own endpoint to keep Render active
   * @param {string} publicUrl - The deployed Render public URL (e.g., https://trademind-backend.onrender.com)
   */
  static startKeepAlive(publicUrl) {
    if (!publicUrl) {
      console.log('[PING SERVICE] Public URL not configured. Autoping bypassed.');
      return;
    }

    // Ping every 10 minutes (600,000 milliseconds)
    const intervalMs = 10 * 60 * 1000; 

    console.log(`[PING SERVICE] Keep-alive routine activated targeting: ${publicUrl}/health`);
    
    setInterval(async () => {
      try {
        const response = await axios.get(`${publicUrl}/health`);
        console.log(`[PING SERVICE] Self-ping successful. Status: ${response.data.status} | Time: ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.warn('[PING SERVICE WARNING] Keep-alive self-ping failed:', error.message);
      }
    }, intervalMs);
  }
}