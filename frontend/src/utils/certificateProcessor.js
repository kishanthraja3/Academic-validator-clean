// Certificate Processing Priority Queue System
// Priority: Blockchain (1) > Digital Signature (2) > QR (3) > Legacy (4)

import EmailService from './emailService';

export class CertificateProcessor {
  constructor() {
    this.priorityQueue = [];
    this.processingQueue = [];
    this.completedQueue = [];
    this.isProcessing = false;
    this.onProgress = null;
    this.onComplete = null;
    this.onError = null;
    this.emailSentCallback = null;
    this.emailService = new EmailService();
  }

  // Priority weights (lower number = higher priority)
  static PRIORITY_WEIGHTS = {
    blockchain: 1,
    digitalSignature: 2,
    qr: 3,
    legacy: 4
  };

  // Process certificate with single backend call (detection + verification)
  async processCertificate(certificate) {
    const { file } = certificate;

    try {
      // Single backend call for both detection and verification
      const formData = new FormData();
      formData.append('certificate', file);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/verify-certificate`, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Map backend pipeline to our priority system
      const pipelineToType = {
        'blockchain': 'blockchain',
        'signature': 'digitalSignature', 
        'qr': 'qr',
        'legacy': 'legacy'
      };
      
      const detectedType = pipelineToType[result.pipeline] || 'legacy';
      
      // Return both verification result and type info
      return {
        verificationType: result.pipeline || 'legacy',
        status: result.status, // Use exact backend status: 'valid' or 'invalid'
        score: result.score || 0,
        details: result.message || result.details || 'Certificate verification completed',
        pipeline: result.pipeline,
        data: result.data,
        verifiedAt: new Date().toISOString(),
        originalResult: result,
        // Add type detection info for priority sorting
        type: detectedType,
        priority: CertificateProcessor.PRIORITY_WEIGHTS[detectedType],
        confidence: result.status === 'valid' || result.status === 'verified' ? 0.9 : 0.5
      };
      
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - verification took too long');
        }
        throw error;
      }
      
    } catch (error) {
      console.error('Certificate verification error:', error);
      throw new Error(`Verification failed: ${error.message}`);
    }
  }

  // Add files and process them immediately (single backend call per file)
  async addFiles(files) {
    const certificates = [];
    
    // Process all files immediately with single backend call each
    for (const file of files) {
      const certificate = {
        id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file,
        fileName: file.name,
        fileSize: file.size,
        status: 'pending',
        createdAt: new Date(),
        processingStartedAt: null,
        processingCompletedAt: null,
        result: null,
        error: null
      };
      
      try {
        // Process immediately with single backend call
        certificate.processingStartedAt = new Date();
        const result = await this.processCertificate(certificate);
        
        // Extract type and priority from result
        certificate.type = result.type;
        certificate.priority = result.priority;
        certificate.confidence = result.confidence;
        certificate.status = 'completed';
        certificate.processingCompletedAt = new Date();
        certificate.result = result;
        
        this.completedQueue.push(certificate);
        
        // Send email notification for invalid certificates
        if (result.status === 'invalid' || result.status === 'mismatch' || result.status === 'failed') {
          this.sendTamperedCertificateAlert(certificate, result);
        }
        
      } catch (error) {
        // Handle processing error
        certificate.status = 'failed';
        certificate.processingCompletedAt = new Date();
        certificate.error = error.message;
        certificate.type = 'legacy'; // Default fallback
        certificate.priority = CertificateProcessor.PRIORITY_WEIGHTS.legacy;
        certificate.confidence = 0.1;
        
        this.completedQueue.push(certificate);
      }
      
      certificates.push(certificate);
      
      // Trigger progress callback
      if (this.onProgress) {
        this.onProgress({
          currentIndex: certificates.length - 1,
          totalCount: files.length,
          currentCertificate: certificate,
          completedCount: this.completedQueue.length
        });
      }
    }

    // Sort completed certificates by priority for display
    this.completedQueue.sort((a, b) => a.priority - b.priority);
    
    return certificates;
  }

  // Start processing (now just returns already processed results)
  async startProcessing() {
    if (this.isProcessing) {
      throw new Error('Processing is already in progress');
    }

    this.isProcessing = true;

    try {
      // Since files are processed immediately in addFiles, just return results
      this.isProcessing = false;
      
      if (this.onComplete) {
        this.onComplete({
          totalProcessed: this.completedQueue.length,
          successful: this.completedQueue.filter(c => c.status === 'completed').length,
          failed: this.completedQueue.filter(c => c.status === 'failed').length,
          results: this.completedQueue
        });
      }

      return {
        results: this.completedQueue,
        totalProcessed: this.completedQueue.length,
        successful: this.completedQueue.filter(c => c.status === 'completed').length,
        failed: this.completedQueue.filter(c => c.status === 'failed').length
      };

    } catch (error) {
      this.isProcessing = false;
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }


  // Send tampered certificate alert email
  async sendTamperedCertificateAlert(certificate, verificationResult) {
    try {
      const certificateData = await this.emailService.prepareCertificateData(verificationResult, certificate.file);
      await this.emailService.sendTamperedCertificateAlert(certificateData);
      
      // Trigger email sent callback
      if (this.emailSentCallback) {
        this.emailSentCallback({
          fileName: certificate.fileName,
          institution: certificateData.claimedInstitution,
          email: certificateData.institutionEmail
        });
      }
    } catch (error) {
      console.error('Failed to send tampered certificate email:', error);
      // Don't throw error - email failure shouldn't stop processing
    }
  }

  // Utility methods
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Event handlers
  onProgressUpdate(callback) {
    this.onProgress = callback;
  }

  onProcessingComplete(callback) {
    this.onComplete = callback;
  }

  onProcessingError(callback) {
    this.onError = callback;
  }

  onEmailSent(callback) {
    this.emailSentCallback = callback;
  }

  // Get processing statistics
  getStatistics() {
    const total = this.completedQueue.length;
    const successful = this.completedQueue.filter(c => c.status === 'completed').length;
    const failed = this.completedQueue.filter(c => c.status === 'failed').length;
    
    const typeStats = {};
    this.completedQueue.forEach(cert => {
      if (!typeStats[cert.type]) {
        typeStats[cert.type] = { total: 0, successful: 0, failed: 0 };
      }
      typeStats[cert.type].total++;
      if (cert.status === 'completed') {
        typeStats[cert.type].successful++;
      } else {
        typeStats[cert.type].failed++;
      }
    });

    return {
      total,
      successful,
      failed,
      typeStats,
      isProcessing: this.isProcessing,
      queueLength: this.priorityQueue.length + this.processingQueue.length
    };
  }

  // Reset processor
  reset() {
    this.priorityQueue = [];
    this.processingQueue = [];
    this.completedQueue = [];
    this.isProcessing = false;
  }
}

export default CertificateProcessor;
