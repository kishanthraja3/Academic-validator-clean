import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import CertificateProcessor from '../../../utils/certificateProcessor';

const ProcessingProgress = ({ files, isProcessing, results, onComplete, onEmailSent }) => {
  const [processedCount, setProcessedCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [currentCertificate, setCurrentCertificate] = useState(null);
  const [processingResults, setProcessingResults] = useState([]);
  
  const processorRef = useRef(null);

  const totalFiles = files?.length || 0;
  const progressPercentage = totalFiles > 0 ? (processedCount / totalFiles) * 100 : 0;
  const remaining = totalFiles - processedCount;

  useEffect(() => {
    if (isProcessing && !startTime) {
      setStartTime(Date.now());
      initializeProcessor();
    }

    if (isProcessing) {
      const timer = setInterval(() => {
        setElapsedTime(Date.now() - (startTime || Date.now()));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isProcessing, startTime]);

  const initializeProcessor = async () => {
    try {
      processorRef.current = new CertificateProcessor();
      
      // Set up event handlers
      processorRef.current.onProgressUpdate((progress) => {
        setProcessedCount(progress.completedCount);
        setCurrentCertificate(progress.currentCertificate);
        
        // Update success/failure counts
        const stats = processorRef.current.getStatistics();
        setSuccessCount(stats.successful);
        setFailureCount(stats.failed);
        
        // Update processing results
        setProcessingResults(processorRef.current.completedQueue);
      });

      processorRef.current.onProcessingComplete((finalResults) => {
        setProcessedCount(finalResults.totalProcessed);
        setSuccessCount(finalResults.successful);
        setFailureCount(finalResults.failed);
        setProcessingResults(finalResults.results);
        setCurrentCertificate(null);
        
        // Call parent completion handler
        if (onComplete) {
          onComplete(finalResults);
        }
      });

      // Set up email notification handler
      if (onEmailSent) {
        processorRef.current.onEmailSent(onEmailSent);
      }

      processorRef.current.onProcessingError((error) => {
        console.error('Processing error:', error);
        setCurrentCertificate(null);
      });

      // Add files to processor
      await processorRef.current.addFiles(files);
      
      // Start processing with priority queue
      await processorRef.current.startProcessing();
      
    } catch (error) {
      console.error('Failed to initialize processor:', error);
      setCurrentCertificate(null);
    }
  };

  // Use results if available (processing complete)
  const displayData = results ? {
    total: results.total,
    verified: results.verified,
    failed: results.failed,
    remaining: results.remaining,
    elapsed: results.processingTime,
    progress: 100
  } : {
    total: totalFiles,
    verified: successCount,
    failed: failureCount,
    remaining: remaining,
    elapsed: formatTime(elapsedTime),
    progress: progressPercentage
  };

  function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  const getETA = () => {
    if (displayData.progress === 100) return '0s';
    if (processedCount === 0) return 'Calculating...';
    const avgTimePerFile = elapsedTime / processedCount;
    const remainingTime = avgTimePerFile * displayData.remaining;
    return formatTime(remainingTime);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Processing Certificates
        </h2>
        <p className="text-muted-foreground">
          Verifying certificates against institutional registries
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {/* Total */}
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-3">
            <Icon name="FileText" size={24} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Total</p>
          <p className="text-3xl font-bold text-foreground">{displayData.total}</p>
        </div>

        {/* Verified */}
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mx-auto mb-3">
            <Icon name="CheckCircle" size={24} className="text-success" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Verified</p>
          <p className="text-3xl font-bold text-success">{displayData.verified}</p>
        </div>

        {/* Failed */}
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-error/10 rounded-full mx-auto mb-3">
            <Icon name="XCircle" size={24} className="text-error" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Failed</p>
          <p className="text-3xl font-bold text-error">{displayData.failed}</p>
        </div>

        {/* Remaining */}
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-3">
            <Icon name="Clock" size={24} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Remaining</p>
          <p className="text-3xl font-bold text-foreground">{displayData.remaining}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Progress: {displayData.verified + displayData.failed} of {displayData.total} certificates
          </span>
          <span className="text-sm font-medium text-foreground">
            {displayData.progress.toFixed(1)}%
          </span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-4">
          <div 
            className="bg-primary h-4 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${displayData.progress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
          <span>Elapsed: {displayData.elapsed}</span>
          <span>ETA: {getETA()}</span>
        </div>
      </div>

      {/* Current Processing Certificate */}
      {currentCertificate && isProcessing && (
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Icon name="Loader2" size={20} className="text-primary animate-spin" />
              <span className="text-primary font-medium">Currently Processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentCertificate.type === 'blockchain' ? 'bg-primary/10 text-primary' :
                currentCertificate.type === 'digitalSignature' ? 'bg-success/10 text-success' :
                currentCertificate.type === 'qr' ? 'bg-warning/10 text-warning' :
                'bg-muted text-muted-foreground'
              }`}>
                {currentCertificate.type === 'blockchain' ? 'Blockchain (Priority 1)' :
                 currentCertificate.type === 'digitalSignature' ? 'Digital Signature (Priority 2)' :
                 currentCertificate.type === 'qr' ? 'QR Code (Priority 3)' :
                 'Legacy (Priority 4)'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">{currentCertificate.fileName}</p>
            <p className="text-sm text-muted-foreground">
              Confidence: {(currentCertificate.confidence * 100).toFixed(1)}% • 
              Size: {(currentCertificate.fileSize / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {isProcessing && !currentCertificate && (
        <div className="text-center p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-center space-x-3">
            <Icon name="Loader2" size={20} className="text-primary animate-spin" />
            <span className="text-primary font-medium">Initializing certificate processing...</span>
          </div>
        </div>
      )}

      {!isProcessing && displayData.progress === 100 && (
        <div className="text-center p-4 bg-success/5 border border-success/20 rounded-lg">
          <div className="flex items-center justify-center space-x-3">
            <Icon name="CheckCircle" size={20} className="text-success" />
            <span className="text-success font-medium">Processing completed successfully!</span>
          </div>
        </div>
      )}

      {/* Priority Processing Info */}
      {isProcessing && (
        <div className="mt-6 p-4 bg-muted/30 border border-border rounded-lg">
          <h4 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
            <Icon name="Zap" size={16} className="text-primary" />
            <span>Priority Processing Order</span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm text-foreground">Blockchain (1st)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-sm text-foreground">Digital Sign (2nd)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <span className="text-sm text-foreground">QR Code (3rd)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-muted rounded-full"></div>
              <span className="text-sm text-foreground">Legacy (4th)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingProgress;
