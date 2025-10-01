// Mock API responses for certificate verification
// This simulates backend API calls for different verification types

export const mockAPI = {
  // Blockchain verification API
  async verifyBlockchain(fileData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const isVerified = Math.random() > 0.1; // 90% success rate
    const score = isVerified ? 95 + Math.random() * 5 : 30 + Math.random() * 40;
    
    return {
      verified: isVerified,
      score: Math.round(score),
      details: isVerified 
        ? 'Blockchain signature verified successfully' 
        : 'Blockchain verification failed - Invalid signature',
      hash: '0x' + Math.random().toString(16).substr(2, 64),
      transactionId: 'tx_' + Math.random().toString(36).substr(2, 16),
      timestamp: new Date().toISOString()
    };
  },

  // Digital signature verification API
  async verifyDigitalSignature(fileData) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const isVerified = Math.random() > 0.15; // 85% success rate
    const score = isVerified ? 85 + Math.random() * 10 : 25 + Math.random() * 50;
    
    return {
      verified: isVerified,
      score: Math.round(score),
      details: isVerified 
        ? 'Digital signature validated successfully' 
        : 'Digital signature verification failed - Invalid certificate',
      signer: 'Certificate Authority',
      algorithm: 'RSA-SHA256',
      timestamp: new Date().toISOString()
    };
  },

  // QR code verification API
  async verifyQRCode(fileData) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const isVerified = Math.random() > 0.2; // 80% success rate
    const score = isVerified ? 75 + Math.random() * 15 : 20 + Math.random() * 40;
    
    return {
      verified: isVerified,
      score: Math.round(score),
      details: isVerified 
        ? 'QR code detected and verified successfully' 
        : 'QR code verification failed - Poor image quality',
      qrData: 'QR_DATA_' + Math.random().toString(36).substr(2, 8),
      extractedText: 'Certificate data extracted via OCR',
      timestamp: new Date().toISOString()
    };
  },

  // Legacy certificate verification API
  async verifyLegacy(fileData) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isVerified = Math.random() > 0.25; // 75% success rate
    const score = isVerified ? 60 + Math.random() * 25 : 15 + Math.random() * 35;
    
    return {
      verified: isVerified,
      score: Math.round(score),
      details: isVerified 
        ? 'Legacy certificate processed successfully' 
        : 'Legacy verification failed - Low resolution scan',
      extractedData: 'Certificate data extracted via OCR',
      ocrConfidence: Math.round(Math.random() * 100),
      timestamp: new Date().toISOString()
    };
  },

  // Batch processing API
  async processBatch(files) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      batchId: 'batch_' + Math.random().toString(36).substr(2, 12),
      totalFiles: files.length,
      processingStartedAt: new Date().toISOString(),
      estimatedCompletionTime: new Date(Date.now() + (files.length * 1500)).toISOString()
    };
  },

  // Get processing status
  async getProcessingStatus(batchId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      batchId,
      status: 'processing', // processing, completed, failed
      progress: Math.random() * 100,
      processedCount: Math.floor(Math.random() * 10),
      totalCount: 10,
      estimatedTimeRemaining: Math.floor(Math.random() * 300) // seconds
    };
  }
};

// Real API integration functions (replace mockAPI calls with these when backend is ready)
export const realAPI = {
  async verifyBlockchain(fileData) {
    const response = await fetch('/api/verify/blockchain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(fileData)
    });
    
    if (!response.ok) {
      throw new Error(`Blockchain verification failed: ${response.statusText}`);
    }
    
    return await response.json();
  },

  async verifyDigitalSignature(fileData) {
    const response = await fetch('/api/verify/digital-signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(fileData)
    });
    
    if (!response.ok) {
      throw new Error(`Digital signature verification failed: ${response.statusText}`);
    }
    
    return await response.json();
  },

  async verifyQRCode(fileData) {
    const response = await fetch('/api/verify/qr-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(fileData)
    });
    
    if (!response.ok) {
      throw new Error(`QR code verification failed: ${response.statusText}`);
    }
    
    return await response.json();
  },

  async verifyLegacy(fileData) {
    const response = await fetch('/api/verify/legacy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(fileData)
    });
    
    if (!response.ok) {
      throw new Error(`Legacy verification failed: ${response.statusText}`);
    }
    
    return await response.json();
  }
};

export default mockAPI;




