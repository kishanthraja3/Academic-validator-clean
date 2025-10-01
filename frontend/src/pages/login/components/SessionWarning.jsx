import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const SessionWarning = ({ isVisible = false, onDismiss = () => {} }) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isVisible && !isActive) {
      setIsActive(true);
      setTimeLeft(300);
    }
  }, [isVisible, isActive]);

  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      onDismiss();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onDismiss]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs?.toString()?.padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[1020] max-w-sm">
      <div className="bg-warning text-warning-foreground p-4 rounded-lg shadow-modal border border-warning/20">
        <div className="flex items-start space-x-3">
          <Icon name="Clock" size={20} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">Session Timeout Warning</h4>
            <p className="text-xs mb-2 opacity-90">
              Your session will expire in {formatTime(timeLeft)} due to inactivity.
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setIsActive(false);
                  onDismiss();
                }}
                className="text-xs bg-warning-foreground text-warning px-3 py-1 rounded hover:opacity-90 transition-opacity duration-150"
              >
                Stay Logged In
              </button>
              <button
                onClick={onDismiss}
                className="text-xs opacity-75 hover:opacity-100 transition-opacity duration-150"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 opacity-75 hover:opacity-100 transition-opacity duration-150"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionWarning;