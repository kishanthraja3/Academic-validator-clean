import React from 'react';
import Icon from '../../../components/AppIcon';

const VerificationProgress = ({ currentStep, steps, isProcessing }) => {
  const defaultSteps = [
    {
      id: 'upload',
      label: 'Document Upload',
      description: 'Certificate file uploaded',
      icon: 'Upload'
    },
    {
      id: 'analysis',
      label: 'Document Analysis',
      description: 'OCR and metadata extraction',
      icon: 'Search'
    },
    {
      id: 'registry',
      label: 'Registry Validation',
      description: 'Institution and course verification',
      icon: 'Database'
    },
    {
      id: 'fraud',
      label: 'Fraud Detection',
      description: 'Tampering and duplicate checks',
      icon: 'Shield'
    },
    {
      id: 'scoring',
      label: 'Final Scoring',
      description: 'Authenticity score calculation',
      icon: 'BarChart3'
    }
  ];

  const processSteps = steps || defaultSteps;
  const currentStepIndex = processSteps?.findIndex(step => step?.id === currentStep);

  const getStepStatus = (index) => {
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return isProcessing ? 'processing' : 'current';
    return 'pending';
  };

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

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Verification Progress</h3>
        {isProcessing && (
          <div className="flex items-center space-x-2 text-primary">
            <Icon name="Loader" size={16} className="animate-spin" />
            <span className="text-sm font-medium">Processing...</span>
          </div>
        )}
      </div>
      {/* Desktop Progress */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {processSteps?.map((step, index) => {
            const status = getStepStatus(index);
            const isLast = index === processSteps?.length - 1;

            return (
              <div key={step?.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${getStepBgColor(status)}`}>
                    <Icon 
                      name={getStepIcon(step, status)} 
                      size={20} 
                      className={`${getStepColor(status)} ${status === 'processing' ? 'animate-spin' : ''}`}
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <p className={`text-sm font-medium ${status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {step?.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[120px]">
                      {step?.description}
                    </p>
                  </div>
                </div>
                {!isLast && (
                  <div className="flex-1 mx-4">
                    <div className={`h-0.5 transition-all duration-500 ${
                      status === 'completed' ? 'bg-success' : 'bg-border'
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Mobile Progress */}
      <div className="md:hidden space-y-4">
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
      {/* Progress Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Step {Math.max(currentStepIndex + 1, 1)} of {processSteps?.length}
          </span>
          <span className="font-medium text-foreground">
            {Math.round(((currentStepIndex + 1) / processSteps?.length) * 100)}% Complete
          </span>
        </div>
        <div className="mt-2 w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentStepIndex + 1) / processSteps?.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default VerificationProgress;