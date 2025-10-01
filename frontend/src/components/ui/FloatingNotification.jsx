import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const FloatingNotification = ({ 
  isVisible, 
  message, 
  type = 'success', 
  duration = 5000,
  onClose 
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setTimeout(() => {
          onClose && onClose();
        }, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!shouldRender) return null;

  const getNotificationStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-success/10 border-success/20 text-success';
      case 'error':
        return 'bg-error/10 border-error/20 text-error';
      case 'warning':
        return 'bg-warning/10 border-warning/20 text-warning';
      case 'info':
        return 'bg-primary/10 border-primary/20 text-primary';
      default:
        return 'bg-muted/10 border-border text-foreground';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'CheckCircle';
      case 'error':
        return 'XCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'info':
        return 'Info';
      default:
        return 'Bell';
    }
  };

  return (
    <div className={`
      fixed top-4 right-4 z-[9999] max-w-sm w-full
      bg-card border border-border rounded-lg shadow-2xl
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      backdrop-blur-sm
    `}>
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 p-2 rounded-full ${getNotificationStyles()}`}>
            <Icon name={getIcon()} size={20} />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {message}
            </p>
          </div>
          
          <button
            onClick={() => {
              setShouldRender(false);
              setTimeout(() => onClose && onClose(), 300);
            }}
            className="flex-shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
          >
            <Icon name="X" size={16} className="text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingNotification;



