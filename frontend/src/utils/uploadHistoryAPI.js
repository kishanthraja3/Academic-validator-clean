// Upload History API - stores and retrieves bulk upload results
// This integrates with your existing backend

export class UploadHistoryAPI {
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    this.historyKey = 'bulk_upload_history';
  }

  // Store upload results in localStorage (for now, can be moved to backend later)
  async storeUploadResults(uploadSession) {
    try {
      const history = this.getStoredHistory();
      
      const newEntry = {
        id: uploadSession.id,
        timestamp: uploadSession.timestamp,
        totalFiles: uploadSession.totalFiles,
        results: uploadSession.results,
        processingTime: uploadSession.processingTime,
        categoryStats: uploadSession.categoryStats,
        status: uploadSession.status
      };

      history.unshift(newEntry); // Add to beginning
      
      // Keep only last 50 entries
      if (history.length > 50) {
        history.splice(50);
      }

      localStorage.setItem(this.historyKey, JSON.stringify(history));
      return newEntry;
    } catch (error) {
      console.error('Error storing upload results:', error);
      throw error;
    }
  }

  // Get stored upload history
  getStoredHistory() {
    try {
      const stored = localStorage.getItem(this.historyKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving upload history:', error);
      return [];
    }
  }

  // Get upload history with filtering
  async getUploadHistory(filters = {}) {
    try {
      const history = this.getStoredHistory();
      
      // Apply filters
      let filteredHistory = history;

      // Filter by date range
      if (filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        
        filteredHistory = filteredHistory.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= startDate && entryDate <= endDate;
        });
      }

      // Filter by status - this will be applied to individual file results later
      // For now, we'll filter after transforming to file entries

      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filteredHistory = filteredHistory.filter(entry => {
          return entry.results.some(result => 
            result.fileName.toLowerCase().includes(query) ||
            result.processingDetails.toLowerCase().includes(query)
          );
        });
      }

      // Transform to individual file entries for table display
      const fileEntries = [];
      filteredHistory.forEach(uploadSession => {
        uploadSession.results.forEach(result => {
          fileEntries.push({
            id: `${uploadSession.id}_${result.id}`,
            uploadSessionId: uploadSession.id,
            timestamp: uploadSession.timestamp,
            fileName: result.fileName,
            fileSize: result.fileSize,
            status: result.status,
            fileType: result.category,
            processingDetails: result.processingDetails,
            score: result.score,
            verifiedAt: result.verifiedAt,
            pipeline: result.pipeline,
            originalResult: result.originalResult
          });
        });
      });

      // Apply status filter to individual file entries
      if (filters.status && filters.status !== 'all') {
        return fileEntries.filter(entry => {
          // Map filter status to actual status values
          if (filters.status === 'success') {
            return entry.status === 'valid' || entry.status === 'verified';
          } else if (filters.status === 'failed') {
            return entry.status === 'invalid' || entry.status === 'mismatch';
          }
          return entry.status === filters.status;
        });
      }

      return fileEntries;
    } catch (error) {
      console.error('Error getting upload history:', error);
      return [];
    }
  }

  // Get upload statistics
  getUploadStatistics() {
    try {
      const history = this.getStoredHistory();
      
      const stats = {
        totalUploads: history.length,
        totalFiles: 0,
        successfulFiles: 0,
        failedFiles: 0,
        categoryStats: {
          blockchain: 0,
          digitalSignature: 0,
          qr: 0,
          legacy: 0
        }
      };

      history.forEach(uploadSession => {
        stats.totalFiles += uploadSession.totalFiles;
        
        uploadSession.results.forEach(result => {
          if (result.status === 'verified') {
            stats.successfulFiles++;
          } else {
            stats.failedFiles++;
          }

          // Count by category
          const category = result.category;
          if (category === 'blockchain') stats.categoryStats.blockchain++;
          else if (category === 'signature' || category === 'digitalSignature') stats.categoryStats.digitalSignature++;
          else if (category === 'qr') stats.categoryStats.qr++;
          else if (category === 'legacy') stats.categoryStats.legacy++;
        });
      });

      return stats;
    } catch (error) {
      console.error('Error getting upload statistics:', error);
      return {
        totalUploads: 0,
        totalFiles: 0,
        successfulFiles: 0,
        failedFiles: 0,
        categoryStats: {
          blockchain: 0,
          digitalSignature: 0,
          qr: 0,
          legacy: 0
        }
      };
    }
  }

  // Delete upload history entry
  async deleteUploadSession(uploadSessionId) {
    try {
      const history = this.getStoredHistory();
      const filteredHistory = history.filter(entry => entry.id !== uploadSessionId);
      localStorage.setItem(this.historyKey, JSON.stringify(filteredHistory));
      return true;
    } catch (error) {
      console.error('Error deleting upload session:', error);
      return false;
    }
  }

  // Clear all history
  async clearAllHistory() {
    try {
      localStorage.removeItem(this.historyKey);
      return true;
    } catch (error) {
      console.error('Error clearing upload history:', error);
      return false;
    }
  }

  // Export history as CSV
  exportHistoryAsCSV() {
    try {
      const history = this.getStoredHistory();
      const fileEntries = [];
      
      history.forEach(uploadSession => {
        uploadSession.results.forEach(result => {
          fileEntries.push({
            'Upload Date': new Date(uploadSession.timestamp).toLocaleString(),
            'File Name': result.fileName,
            'File Size (MB)': (result.fileSize / 1024 / 1024).toFixed(2),
            'Status': result.status,
            'File Type': result.category,
            'Processing Details': result.processingDetails,
            'Score': result.score,
            'Verified At': result.verifiedAt
          });
        });
      });

      // Convert to CSV
      if (fileEntries.length === 0) {
        return null;
      }

      const headers = Object.keys(fileEntries[0]);
      const csvContent = [
        headers.join(','),
        ...fileEntries.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Escape commas and quotes in CSV
            return `"${value.toString().replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting history as CSV:', error);
      return null;
    }
  }
}

export default UploadHistoryAPI;
