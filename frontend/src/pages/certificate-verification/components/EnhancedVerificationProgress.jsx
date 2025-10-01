import React from 'react';
import Icon from '../../../components/AppIcon';

const EnhancedVerificationProgress = ({ currentStep, steps, isProcessing, pipelineType, progressPercentage = 0 }) => {
  const processSteps = steps || [];
  const currentStepIndex = processSteps?.findIndex(step => step?.id === currentStep);

  const getStepStatus = (index) => {
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return isProcessing ? 'processing' : 'current';
    return 'pending';
  };

  // Calculate progress percentage based on current step
  const calculateProgress = () => {
    if (!processSteps?.length) return 0;
    if (currentStepIndex < 0) return 0; // Stay at 0% until first step starts
    const baseProgress = (currentStepIndex / processSteps?.length) * 100;
    return Math.min(baseProgress, 100);
  };

  const actualProgress = progressPercentage > 0 ? progressPercentage : calculateProgress();

  const getStepIcon = (step, status) => {
    if (status === 'completed') return 'CheckCircle';
    if (status === 'processing') return 'Loader';
    return step?.icon;
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'processing': return 'text-primary';
      case 'current': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getStepBgColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-success/10 border-success/20';
      case 'processing': return 'bg-primary/10 border-primary/20';
      case 'current': return 'bg-primary/10 border-primary/20';
      default: return 'bg-muted border-border';
    }
  };

  // Get pipeline-specific progress percentage
  const getProgressPercentage = () => {
    if (!processSteps?.length) return 0;
    if (currentStepIndex < 0) return 0; // Stay at 0% until first step starts
    return Math.round((currentStepIndex / processSteps?.length) * 100);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header with Pipeline Type */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full border-2 border-primary/20">
            <Icon name="Eye" size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {pipelineType === 'signature' ? 'Verifying Certificate...' : 
               pipelineType === 'qr' ? 'Analyzing Certificate' : 
               pipelineType === 'blockchain' ? 'Blockchain Verification...' :
               'Processing Certificate...'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {pipelineType === 'signature' ? 'Digital signature verification in progress' :
               pipelineType === 'qr' ? 'OCR and QR code analysis running' :
               pipelineType === 'blockchain' ? 'Blockchain hash verification in progress' :
               'Legacy database verification in progress'}
            </p>
          </div>
        </div>
        
        {isProcessing && (
          <div className="flex items-center space-x-2 text-primary">
            <Icon name="Loader" size={16} className="animate-spin" />
            <span className="text-sm font-medium">Processing...</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className="text-sm font-medium text-primary">{Math.round(actualProgress)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${actualProgress}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {processSteps?.map((step, index) => {
          const status = getStepStatus(index);
          
          return (
            <div key={step?.id} className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 flex-shrink-0 transition-all duration-300 ${getStepBgColor(status)}`}>
                <Icon 
                  name={getStepIcon(step, status)} 
                  size={16} 
                  className={`${getStepColor(status)} ${status === 'processing' ? 'animate-spin' : ''}`}
                />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {step?.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step?.description}
                </p>
              </div>
              {status === 'processing' && (
                <div className="flex items-center space-x-2 text-primary">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-xs font-medium">Active</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Processing Info */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Info" size={14} />
          <span>
            This process typically takes 10-30 seconds depending on image quality
          </span>
        </div>
      </div>

      {/* Alternative Layout for Blockchain Pipeline */}
      {pipelineType === 'blockchain' && (
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full border-2 border-primary/20">
              <Icon name="Blocks" size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground">Blockchain Verification</h4>
              <p className="text-sm text-muted-foreground">
                Your certificate is being verified against the blockchain. We're extracting the embedded hash and querying the distributed ledger.
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-primary/10 rounded border border-primary/20">
            <div className="flex items-center space-x-2 text-primary">
              <Icon name="Info" size={14} />
              <span className="text-sm font-medium">Blockchain verification in progress...</span>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Icon name="ArrowUp" size={16} className="text-success" />
                <span className="text-sm text-foreground">File uploaded</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Hash" size={16} className="text-primary" />
                <span className="text-sm text-foreground">Hash extraction</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Blocks" size={16} className="text-primary" />
                <span className="text-sm text-foreground">Blockchain query</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Shield" size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Verifying...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Layout for QR Pipeline */}
      {pipelineType === 'qr' && (
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full border-2 border-primary/20">
              <Icon name="Eye" size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground">Analyzing Certificate</h4>
              <p className="text-sm text-muted-foreground">
                Your certificate is being processed. We're extracting text, parsing details, and validating against our database.
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-primary/10 rounded border border-primary/20">
            <div className="flex items-center space-x-2 text-primary">
              <Icon name="Info" size={14} />
              <span className="text-sm font-medium">Processing in progress...</span>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Icon name="ArrowUp" size={16} className="text-success" />
                <span className="text-sm text-foreground">File uploaded</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Eye" size={16} className="text-primary" />
                <span className="text-sm text-foreground">OCR running</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Shield" size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Verifying...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVerificationProgress;
