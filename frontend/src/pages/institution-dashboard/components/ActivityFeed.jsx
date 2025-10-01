import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActivityFeed = ({ activities = [], showAll = false }) => {
  const [filter, setFilter] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const mockActivities = [
    {
      id: 1,
      type: 'verification_completed',
      title: 'Certificate Verification Completed',
      description: 'B.Tech Computer Science certificate verified for student ID: ST2024001',
      timestamp: new Date(Date.now() - 300000),
      status: 'success',
      user: 'Dr. Priya Sharma',
      metadata: {
        certificateId: 'CERT-2024-001',
        studentName: 'Rahul Kumar',
        course: 'B.Tech Computer Science',
        result: 'Valid'
      }
    },
    {
      id: 2,
      type: 'fraud_detected',
      title: 'Potential Fraud Detected',
      description: 'Suspicious alterations found in MBA certificate submission',
      timestamp: new Date(Date.now() - 900000),
      status: 'error',
      user: 'System Alert',
      metadata: {
        certificateId: 'CERT-2024-002',
        studentName: 'Anonymous',
        course: 'MBA Finance',
        riskScore: 85
      }
    },
    {
      id: 5,
      type: 'user_login',
      title: 'New User Login',
      description: 'Verifier logged in from new device',
      timestamp: new Date(Date.now() - 7200000),
      status: 'info',
      user: 'Rajesh Gupta',
      metadata: {
        location: 'Ranchi, Jharkhand',
        device: 'Chrome on Windows',
        ipAddress: '192.168.1.100'
      }
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Activities', icon: 'Activity' },
    { value: 'verification_completed', label: 'Verifications', icon: 'CheckCircle' },
    { value: 'fraud_detected', label: 'Fraud Alerts', icon: 'AlertTriangle' }
  ];

  const getActivityIcon = (type) => {
    const iconMap = {
      verification_completed: 'CheckCircle',
      fraud_detected: 'AlertTriangle',
      user_login: 'LogIn'
    };
    return iconMap?.[type] || 'Activity';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      success: 'text-success',
      error: 'text-error',
      warning: 'text-warning',
      info: 'text-primary'
    };
    return colorMap?.[status] || 'text-muted-foreground';
  };

  const getStatusBgColor = (status) => {
    const colorMap = {
      success: 'bg-success/10',
      error: 'bg-error/10',
      warning: 'bg-warning/10',
      info: 'bg-primary/10'
    };
    return colorMap?.[status] || 'bg-muted';
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded?.has(id)) {
      newExpanded?.delete(id);
    } else {
      newExpanded?.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredActivities = filter === 'all' 
    ? mockActivities 
    : mockActivities?.filter(activity => activity?.type === filter);

  const displayActivities = showAll ? filteredActivities : filteredActivities?.slice(0, 5);

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          <Button variant="outline" size="sm" iconName="RefreshCw" iconPosition="left">
            Refresh
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          {filterOptions?.map((option) => (
            <button
              key={option?.value}
              onClick={() => setFilter(option?.value)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                filter === option?.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={option?.icon} size={16} />
              <span>{option?.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {displayActivities?.length > 0 ? (
          <div className="divide-y divide-border">
            {displayActivities?.map((activity) => (
              <div key={activity?.id} className="p-4 hover:bg-muted/50 transition-colors duration-150">
                <div className="flex items-start space-x-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getStatusBgColor(activity?.status)}`}>
                    <Icon 
                      name={getActivityIcon(activity?.type)} 
                      size={16} 
                      className={getStatusColor(activity?.status)}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {activity?.title}
                      </h4>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatTimestamp(activity?.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity?.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        by {activity?.user}
                      </span>
                      
                      {activity?.metadata && (
                        <button
                          onClick={() => toggleExpanded(activity?.id)}
                          className="text-xs text-primary hover:text-primary/80 transition-colors duration-150"
                        >
                          {expandedItems?.has(activity?.id) ? 'Less' : 'Details'}
                        </button>
                      )}
                    </div>
                    
                    {/* Expanded Details */}
                    {expandedItems?.has(activity?.id) && activity?.metadata && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-md">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(activity?.metadata)?.map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground capitalize">
                                {key?.replace(/([A-Z])/g, ' $1')?.trim()}:
                              </span>
                              <span className="text-foreground font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Icon name="Activity" size={32} className="mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No activities found</p>
          </div>
        )}
      </div>
      {!showAll && filteredActivities?.length > 5 && (
        <div className="p-4 border-t border-border">
          <Button variant="outline" fullWidth>
            View All Activities ({filteredActivities?.length - 5} more)
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;