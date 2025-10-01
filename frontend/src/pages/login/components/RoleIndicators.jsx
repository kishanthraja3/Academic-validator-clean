import React from 'react';
import Icon from '../../../components/AppIcon';

const RoleIndicators = () => {
  const roles = [
    {
      id: 'verifier',
      title: 'Verifier',
      description: 'Education officials & HR personnel',
      icon: 'Shield',
      color: 'bg-primary/10 text-primary border-primary/20',
      features: ['Certificate verification', 'Quick validation', 'Fraud detection']
    },
    {
      id: 'institution',
      title: 'Admin',
      description: 'Institution administrators',
      icon: 'Building',
      color: 'bg-secondary/10 text-secondary border-secondary/20',
      features: ['Audit logs', 'Institution oversight']
    }
  ];

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Access Levels</h3>
        <p className="text-sm text-muted-foreground">
          Choose your role to access appropriate features
        </p>
      </div>
      <div className="space-y-4">
        {roles?.map((role) => (
          <div
            key={role?.id}
            className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-card ${role?.color}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Icon name={role?.icon} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm mb-1">{role?.title}</h4>
                <p className="text-xs opacity-80 mb-2">{role?.description}</p>
                <div className="space-y-1">
                  {role?.features?.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Icon name="Check" size={12} className="opacity-60" />
                      <span className="text-xs opacity-80">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleIndicators;