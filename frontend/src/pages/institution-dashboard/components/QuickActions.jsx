import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = ({ onActionClick = () => {} }) => {
  const quickActions = [
    {
      id: 'bulk-upload',
      title: 'Bulk Upload',
      description: 'Upload multiple certificates for batch verification',
      icon: 'Upload',
      color: 'primary',
      route: '/bulk-upload-manager',
      badge: null
    },
    {
      id: 'blacklist-management',
      title: 'Blacklist Management',
      description: 'Manage blacklisted certificates and institutions',
      icon: 'Shield',
      color: 'error',
      route: '/blacklist-management',
      badge: '3 New'
    },
    {
      id: 'audit-logs',
      title: 'Audit Logs',
      description: 'View detailed system audit trails and compliance reports',
      icon: 'FileText',
      color: 'secondary',
      route: '/audit-log-viewer',
      badge: null
    },
    {
      id: 'generate-reports',
      title: 'Generate Reports',
      description: 'Create comprehensive verification and analytics reports',
      icon: 'BarChart3',
      color: 'success',
      route: '/reports',
      badge: null
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage verifiers and administrative users',
      icon: 'Users',
      color: 'warning',
      route: '/user-management',
      badge: '2 Pending'
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure institution settings and preferences',
      icon: 'Settings',
      color: 'accent',
      route: '/settings',
      badge: null
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      primary: {
        bg: 'bg-primary/10',
        text: 'text-primary',
        hover: 'hover:bg-primary/20'
      },
      error: {
        bg: 'bg-error/10',
        text: 'text-error',
        hover: 'hover:bg-error/20'
      },
      secondary: {
        bg: 'bg-secondary/10',
        text: 'text-secondary',
        hover: 'hover:bg-secondary/20'
      },
      success: {
        bg: 'bg-success/10',
        text: 'text-success',
        hover: 'hover:bg-success/20'
      },
      warning: {
        bg: 'bg-warning/10',
        text: 'text-warning',
        hover: 'hover:bg-warning/20'
      },
      accent: {
        bg: 'bg-accent/10',
        text: 'text-accent',
        hover: 'hover:bg-accent/20'
      }
    };
    return colorMap?.[color] || colorMap?.primary;
  };

  const handleActionClick = (action) => {
    onActionClick(action);
    if (action?.route) {
      window.location.href = action?.route;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <Button variant="ghost" size="sm" iconName="MoreHorizontal">
          More
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions?.map((action) => {
          const colors = getColorClasses(action?.color);
          
          return (
            <button
              key={action?.id}
              onClick={() => handleActionClick(action)}
              className={`relative p-4 rounded-lg border border-border text-left transition-all duration-200 hover:shadow-card ${colors?.hover} group`}
            >
              {/* Badge */}
              {action?.badge && (
                <div className="absolute -top-2 -right-2 px-2 py-1 bg-error text-error-foreground text-xs font-medium rounded-full">
                  {action?.badge}
                </div>
              )}
              <div className="flex items-start space-x-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${colors?.bg}`}>
                  <Icon name={action?.icon} size={20} className={colors?.text} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground group-hover:text-foreground/90 transition-colors duration-150">
                    {action?.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {action?.description}
                  </p>
                </div>
              </div>
              {/* Hover Arrow */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Icon name="ArrowRight" size={16} className="text-muted-foreground" />
              </div>
            </button>
          );
        })}
      </div>
      {/* Additional Actions */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" iconName="Download" iconPosition="left">
              Export Data
            </Button>
            <Button variant="outline" size="sm" iconName="Calendar" iconPosition="left">
              Schedule Report
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Icon name="Clock" size={14} />
            <span>Last updated: {new Date()?.toLocaleTimeString('en-IN', { 
              hour: '2-digit', 
              minute: '2-digit',
              timeZone: 'Asia/Kolkata'
            })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;