import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionsPanel = ({ onNavigate }) => {
  const quickActions = [
    {
      title: 'Bulk Upload',
      description: 'Upload multiple certificates via CSV',
      icon: 'Upload',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      action: () => onNavigate('/bulk-upload-manager')
    },
    {
      title: 'Advanced Search',
      description: 'Search across all certificates',
      icon: 'Search',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      action: () => onNavigate('/certificate-verification')
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <Icon name="Zap" size={20} className="text-primary" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions?.map((action, index) => (
          <button
            key={index}
            onClick={action?.action}
            className="group p-4 border border-border rounded-lg hover:border-primary/50 hover:shadow-card transition-all duration-200 text-left"
          >
            <div className="flex items-start space-x-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${action?.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                <Icon name={action?.icon} size={20} className={action?.color} />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                  {action?.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {action?.description}
                </p>
              </div>
              <Icon name="ArrowRight" size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button
            variant="outline"
            iconName="HelpCircle"
            iconPosition="left"
            onClick={() => console.log('Open help')}
            className="flex-1"
          >
            Help & Support
          </Button>
          <Button
            variant="ghost"
            iconName="Settings"
            iconPosition="left"
            onClick={() => console.log('Open settings')}
            className="flex-1"
          >
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;