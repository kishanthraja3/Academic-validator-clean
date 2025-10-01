// Verification Statistics Service
// Tracks daily verification metrics dynamically

export class VerificationStatsService {
  constructor() {
    this.statsKey = 'verification_stats';
    this.dailyKey = 'verification_stats_daily';
    this.initializeStats();
  }

  // Initialize default stats
  initializeStats() {
    const today = this.getTodayString();
    const stored = this.getStoredStats();
    
    if (!stored || stored.date !== today) {
      // Reset daily stats for new day
      this.resetDailyStats();
    }
  }

  // Get today's date string (YYYY-MM-DD)
  getTodayString() {
    return new Date().toISOString().split('T')[0];
  }

  // Get stored statistics
  getStoredStats() {
    try {
      const stored = localStorage.getItem(this.statsKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading verification stats:', error);
      return null;
    }
  }

  // Store statistics
  storeStats(stats) {
    try {
      localStorage.setItem(this.statsKey, JSON.stringify(stats));
    } catch (error) {
      console.error('Error storing verification stats:', error);
    }
  }

  // Reset daily statistics
  resetDailyStats() {
    const today = this.getTodayString();
    const defaultStats = {
      date: today,
      dailyVerifications: 0,
      fraudAlerts: 0,
      validVerifications: 0,
      totalVerifications: 0,
      pendingReviews: 0,
      lastReset: new Date().toISOString()
    };
    
    this.storeStats(defaultStats);
    return defaultStats;
  }

  // Record a verification result
  recordVerification(result) {
    const stats = this.getStoredStats() || this.resetDailyStats();
    
    // Increment daily verifications
    stats.dailyVerifications += 1;
    stats.totalVerifications += 1;
    
    // Update valid/invalid counts
    if (result.status === 'valid' || result.status === 'verified') {
      stats.validVerifications += 1;
    } else if (result.status === 'invalid' || result.status === 'mismatch' || result.status === 'failed') {
      stats.fraudAlerts += 1;
    }
    
    // Calculate success rate
    stats.successRate = stats.totalVerifications > 0 
      ? Math.round((stats.validVerifications / stats.totalVerifications) * 100 * 10) / 10 
      : 0;
    
    // Store updated stats
    this.storeStats(stats);
    
    console.log('Updated verification stats:', stats);
    return stats;
  }

  // Record bulk verification results
  recordBulkVerification(results) {
    const stats = this.getStoredStats() || this.resetDailyStats();
    
    if (!Array.isArray(results)) {
      console.error('Bulk verification results must be an array');
      return stats;
    }
    
    // Process each result
    results.forEach(result => {
      stats.dailyVerifications += 1;
      stats.totalVerifications += 1;
      
      if (result.status === 'valid' || result.status === 'verified') {
        stats.validVerifications += 1;
      } else if (result.status === 'invalid' || result.status === 'mismatch' || result.status === 'failed') {
        stats.fraudAlerts += 1;
      }
    });
    
    // Calculate success rate
    stats.successRate = stats.totalVerifications > 0 
      ? Math.round((stats.validVerifications / stats.totalVerifications) * 100 * 10) / 10 
      : 0;
    
    // Store updated stats
    this.storeStats(stats);
    
    console.log('Updated bulk verification stats:', stats);
    return stats;
  }

  // Add pending review
  addPendingReview() {
    const stats = this.getStoredStats() || this.resetDailyStats();
    stats.pendingReviews += 1;
    this.storeStats(stats);
    return stats;
  }

  // Remove pending review
  removePendingReview() {
    const stats = this.getStoredStats() || this.resetDailyStats();
    stats.pendingReviews = Math.max(0, stats.pendingReviews - 1);
    this.storeStats(stats);
    return stats;
  }

  // Get current statistics
  getCurrentStats() {
    const stats = this.getStoredStats() || this.resetDailyStats();
    
    // Calculate change percentages (mock for now)
    const changeStats = {
      ...stats,
      dailyVerificationsChange: '+12%', // Could be calculated from previous days
      fraudAlertsChange: stats.fraudAlerts > 0 ? '-8%' : '0%',
      successRateChange: '+2.1%' // Could be calculated from previous days
    };
    
    return changeStats;
  }

  // Get verification history (last 7 days)
  getVerificationHistory() {
    const history = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // For demo purposes, generate some mock data
      // In a real app, this would come from backend
      history.push({
        date: dateString,
        verifications: Math.floor(Math.random() * 50) + 20,
        fraudAlerts: Math.floor(Math.random() * 5),
        successRate: Math.floor(Math.random() * 10) + 90
      });
    }
    
    return history;
  }

  // Clear all statistics
  clearStats() {
    localStorage.removeItem(this.statsKey);
    return this.resetDailyStats();
  }

  // Reset pending reviews to 0
  resetPendingReviews() {
    const stats = this.getStoredStats() || this.resetDailyStats();
    stats.pendingReviews = 0;
    this.storeStats(stats);
    return stats;
  }

  // Test function - simulate some verifications
  simulateTestData() {
    console.log('Simulating test verification data...');
    
    // Simulate some valid verifications
    this.recordVerification({ status: 'valid', pipeline: 'blockchain' });
    this.recordVerification({ status: 'verified', pipeline: 'signature' });
    this.recordVerification({ status: 'valid', pipeline: 'qr' });
    
    // Simulate some invalid verifications
    this.recordVerification({ status: 'invalid', pipeline: 'legacy' });
    this.recordVerification({ status: 'mismatch', pipeline: 'blockchain' });
    
    const stats = this.getCurrentStats();
    console.log('Updated stats after simulation:', stats);
    return stats;
  }
}

// Export singleton instance
export const verificationStatsService = new VerificationStatsService();
export default verificationStatsService;
