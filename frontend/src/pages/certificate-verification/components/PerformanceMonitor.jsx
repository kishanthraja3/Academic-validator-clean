import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const PerformanceMonitor = ({ startTime, isProcessing, pipelineType }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);

  // Pipeline-specific time estimates (in seconds)
  const timeEstimates = {
    signature: 15,
    qr: 20,
    legacy: 25
  };

  useEffect(() => {
    if (!isProcessing || !startTime) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedTime(elapsed);
    }, 100);

    return () => clearInterval(interval);
  }, [isProcessing, startTime]);

  useEffect(() => {
    if (pipelineType && timeEstimates[pipelineType]) {
      setEstimatedTime(timeEstimates[pipelineType]);
    }
  }, [pipelineType]);

  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  const getProgressColor = () => {
    if (elapsedTime < estimatedTime * 0.5) return 'text-success';
    if (elapsedTime < estimatedTime * 0.8) return 'text-warning';
    return 'text-error';
  };

  if (!isProcessing) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-foreground flex items-center space-x-2">
          <Icon name="Clock" size={16} className="text-primary" />
          <span>Performance Monitor</span>
        </h4>
        <div className="flex items-center space-x-2">
          <Icon name="Zap" size={14} className="text-warning" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Elapsed Time:</span>
          <p className={`font-mono font-medium ${getProgressColor()}`}>
            {formatTime(elapsedTime)}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Estimated Time:</span>
          <p className="font-mono font-medium text-foreground">
            {formatTime(estimatedTime)}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Pipeline:</span>
          <p className="font-medium text-foreground capitalize">
            {pipelineType || 'Unknown'}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Status:</span>
          <p className="font-medium text-primary">
            {elapsedTime < estimatedTime ? 'On Track' : 'Taking Longer'}
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{Math.min((elapsedTime / estimatedTime) * 100, 100).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1">
          <div 
            className="bg-primary h-1 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((elapsedTime / estimatedTime) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Performance tips */}
      {elapsedTime > estimatedTime * 0.8 && (
        <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded text-xs">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={12} className="text-warning" />
            <span className="text-warning font-medium">Taking longer than expected</span>
          </div>
          <p className="text-muted-foreground mt-1">
            This may be due to file size, image quality, or server load.
          </p>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;







