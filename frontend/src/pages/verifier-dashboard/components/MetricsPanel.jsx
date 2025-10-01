import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { verificationStatsService } from '../../../utils/verificationStats';

const MetricsPanel = ({ metrics = {} }) => {
  const [dynamicMetrics, setDynamicMetrics] = useState({
    dailyVerifications: 0,
    fraudAlerts: 0,
    pendingReviews: 0,
    successRate: 0,
    dailyVerificationsChange: '+0%',
    fraudAlertsChange: '0%',
    successRateChange: '+0%'
  });

  useEffect(() => {
    // Load current stats
    const currentStats = verificationStatsService.getCurrentStats();
    // Ensure pending reviews is 0
    currentStats.pendingReviews = 0;
    setDynamicMetrics(currentStats);
    
    // Set up interval to refresh stats every 30 seconds
    const interval = setInterval(() => {
      const updatedStats = verificationStatsService.getCurrentStats();
      // Ensure pending reviews remains 0
      updatedStats.pendingReviews = 0;
      setDynamicMetrics(updatedStats);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Use dynamic metrics, fallback to props, then defaults
  const finalMetrics = {
    dailyVerifications: dynamicMetrics.dailyVerifications || metrics.dailyVerifications || 0,
    fraudAlerts: dynamicMetrics.fraudAlerts || metrics.fraudAlerts || 0,
    pendingReviews: 0, // Always set to 0 as requested
    successRate: dynamicMetrics.successRate || metrics.successRate || 0,
    dailyVerificationsChange: dynamicMetrics.dailyVerificationsChange || '+12%',
    fraudAlertsChange: dynamicMetrics.fraudAlertsChange || '-8%',
    successRateChange: dynamicMetrics.successRateChange || '+2.1%'
  };

  const metricCards = [
    {
      title: 'Daily Verifications',
      value: finalMetrics.dailyVerifications,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: finalMetrics.dailyVerificationsChange,
      changeType: 'positive'
    },
    {
      title: 'Fraud Alerts',
      value: finalMetrics.fraudAlerts,
      icon: 'AlertTriangle',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      change: finalMetrics.fraudAlertsChange,
      changeType: finalMetrics.fraudAlertsChange.startsWith('-') ? 'positive' : 'negative'
    },
    {
      title: 'Pending Reviews',
      value: finalMetrics.pendingReviews,
      icon: 'Clock',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+3',
      changeType: 'neutral'
    },
    {
      title: 'Success Rate',
      value: `${finalMetrics.successRate}%`,
      icon: 'TrendingUp',
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: finalMetrics.successRateChange,
      changeType: 'positive'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricCards?.map((metric, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-6 hover:shadow-card transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${metric?.bgColor}`}>
              <Icon name={metric?.icon} size={24} className={metric?.color} />
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
              metric?.changeType === 'positive' ?'text-success bg-success/10' 
                : metric?.changeType === 'negative' ?'text-error bg-error/10' :'text-muted-foreground bg-muted'
            }`}>
              {metric?.change}
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground">{metric?.value}</p>
            <p className="text-sm text-muted-foreground">{metric?.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsPanel;