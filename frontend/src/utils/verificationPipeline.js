// Main pipeline controller for certificate verification
class VerificationPipeline {
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.requestTimeout = 60000; // 60 seconds
  }

  // Generate file hash for caching
  async generateFileHash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Check cache for existing results
  getCachedResult(fileHash) {
    const cached = this.cache.get(fileHash);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result;
    }
    this.cache.delete(fileHash);
    return null;
  }

  // Cache verification result
  setCachedResult(fileHash, result) {
    this.cache.set(fileHash, {
      result,
      timestamp: Date.now()
    });
  }

  // Check if PDF has metadata (signature) - simplified for frontend
  async checkPdfMetadata(file) {
    // For frontend, we'll let the backend determine the pipeline
    // This is a placeholder that always returns false to trigger backend logic
    return { hasMetadata: false };
  }

  // Run signature verification pipeline
  async runSignaturePipeline(file) {
    try {
      const formData = new FormData();
      formData.append('certificate', file);
      
      const response = await fetch(`${this.apiBaseUrl}/verify-certificate`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(`Signature verification failed: ${error.message}`);
    }
  }

  // Run QR verification pipeline
  async runQRPipeline(file) {
    try {
      const formData = new FormData();
      formData.append('certificate', file);
      
      const response = await fetch(`${this.apiBaseUrl}/verify-certificate`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(`QR verification failed: ${error.message}`);
    }
  }

  // Run legacy verification pipeline
  async runLegacyPipeline(file) {
    try {
      const formData = new FormData();
      formData.append('certificate', file);
      
      const response = await fetch(`${this.apiBaseUrl}/verify-certificate`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(`Legacy verification failed: ${error.message}`);
    }
  }

  // Main verification controller with caching and timeout
  async verifyCertificate(file) {
    try {
      // Generate file hash for caching
      const fileHash = await this.generateFileHash(file);
      
      // Check cache first
      const cachedResult = this.getCachedResult(fileHash);
      if (cachedResult) {
        console.log('Cache hit for file:', fileHash.substring(0, 8));
        return cachedResult;
      }

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

      try {
        // Use the unified API endpoint that handles pipeline selection
        const formData = new FormData();
        formData.append('certificate', file);
        
        console.log('Making fetch request to:', `${this.apiBaseUrl}/verify-certificate`);
        
        const response = await fetch(`${this.apiBaseUrl}/verify-certificate`, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('Fetch response received:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('JSON parsed successfully:', result.pipeline, result.status);
        
        // Cache the result
        this.setCachedResult(fileHash, result);
        
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Fetch error details:', error);
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - verification took too long');
        }
        if (error.message === 'Failed to fetch') {
          console.error('Network error - check if backend server is running on port 3001');
          throw new Error('Network error: Cannot connect to verification server. Please ensure the backend server is running.');
        }
        throw error;
      }
    } catch (error) {
      throw new Error(`Verification failed: ${error.message}`);
    }
  }

  // Get pipeline-specific progress steps
  getPipelineSteps(pipelineType) {
    const commonSteps = [
      {
        id: 'upload',
        label: 'Uploading file',
        description: 'Sending certificate to server',
        icon: 'Upload'
      }
    ];

    switch (pipelineType) {
      case 'signature':
        return [
          ...commonSteps,
          {
            id: 'metadata',
            label: 'Metadata Analysis',
            description: 'Checking for digital signatures',
            icon: 'Shield'
          },
          {
            id: 'signature',
            label: 'Signature Verification',
            description: 'Validating digital signature',
            icon: 'Lock'
          },
          {
            id: 'hash',
            label: 'Hash Verification',
            description: 'Checking file integrity',
            icon: 'CheckCircle'
          },
          {
            id: 'complete',
            label: 'Processing finished',
            description: 'Verification completed',
            icon: 'CheckCircle'
          }
        ];
      
      case 'qr':
        return [
          ...commonSteps,
          {
            id: 'ocr',
            label: 'OCR Analysis',
            description: 'Extracting text from certificate',
            icon: 'Type'
          },
          {
            id: 'qr',
            label: 'QR Code Detection',
            description: 'Scanning for QR codes',
            icon: 'QrCode'
          },
          {
            id: 'parsing',
            label: 'Parsing Fields',
            description: 'Identifying certificate details',
            icon: 'Search'
          },
          {
            id: 'verification',
            label: 'Verification',
            description: 'Validating against QR data',
            icon: 'CheckCircle'
          },
          {
            id: 'complete',
            label: 'Processing finished',
            description: 'Verification completed',
            icon: 'CheckCircle'
          }
        ];
      
      case 'legacy':
        return [
          ...commonSteps,
          {
            id: 'ocr',
            label: 'OCR Analysis',
            description: 'Extracting text from certificate',
            icon: 'Type'
          },
          {
            id: 'parsing',
            label: 'Parsing Fields',
            description: 'Identifying certificate details',
            icon: 'Search'
          },
          {
            id: 'database',
            label: 'Database Lookup',
            description: 'Checking against CSV records',
            icon: 'Database'
          },
          {
            id: 'verification',
            label: 'Verification',
            description: 'Validating against database',
            icon: 'CheckCircle'
          },
          {
            id: 'complete',
            label: 'Processing finished',
            description: 'Verification completed',
            icon: 'CheckCircle'
          }
        ];
      
      default:
        return commonSteps;
    }
  }
}

export default VerificationPipeline;
