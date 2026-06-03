export class HistoryService {
  static logs = [];

  /**
   * Adds an item to the history log (max 50 items)
   * @param {Object} item - Log entry containing asset, signal, and execution details
   */
  static addLog(item) {
    const entry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      ...item
    };
    
    this.logs.unshift(entry); // Add to beginning of array
    
    // Maintain maximum rolling size of 50
    if (this.logs.length > 50) {
      this.logs.pop();
    }
    return entry;
  }

  /**
   * Returns current active history
   * @returns {Array} List of logs
   */
  static getHistory() {
    return this.logs;
  }
}