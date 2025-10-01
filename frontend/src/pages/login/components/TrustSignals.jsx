import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TrustSignals = () => {
  const endorsements = [
    {
      id: 'jharkhand-edu',
      name: 'Jharkhand Education Department',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop&crop=center',
      status: 'Certified Partner',
      verification: 'Verified ✓'
    },
    {
      id: 'ranchi-university',
      name: 'Ranchi University',
      logo: 'https://images.unsplash.com/photo-1562774053-701939374585?w=80&h=80&fit=crop&crop=center',
      status: 'Institutional Partner',
      verification: 'Active Member'
    },
    {
      id: 'nit-jamshedpur',
      name: 'NIT Jamshedpur',
      logo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=80&h=80&fit=crop&crop=center',
      status: 'Technical Partner',
      verification: 'Integrated'
    }
  ];

  const securityFeatures = [
    {
      icon: 'Shield',
      title: 'Bank-grade Security',
      description: 'End-to-end encryption'
    },
    {
      icon: 'Lock',
      title: 'CORS Compliant',
      description: 'Secure API integration'
    },
    {
      icon: 'Eye',
      title: 'Audit Trail',
      description: 'Complete activity logging'
    },
    {
      icon: 'Clock',
      title: 'Session Management',
      description: 'Automatic timeout protection'
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Institutional Endorsements */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
          Trusted by Leading Institutions
        </h3>
        <div className="space-y-3">
          {endorsements?.map((endorsement) => (
            <div
              key={endorsement?.id}
              className="flex items-center space-x-3 p-3 bg-card border border-border rounded-lg hover:shadow-card transition-shadow duration-200"
            >
              <div className="flex-shrink-0">
                <Image
                  src={endorsement?.logo}
                  alt={`${endorsement?.name} logo`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground truncate">
                  {endorsement?.name}
                </h4>
                <p className="text-xs text-muted-foreground">{endorsement?.status}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Icon name="CheckCircle" size={12} className="text-success" />
                  <span className="text-xs text-success">{endorsement?.verification}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Security Features */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
          Security & Compliance
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {securityFeatures?.map((feature, index) => (
            <div
              key={index}
              className="p-3 bg-muted/50 rounded-lg text-center"
            >
              <div className="flex justify-center mb-2">
                <Icon name={feature?.icon} size={20} className="text-primary" />
              </div>
              <h4 className="font-medium text-xs text-foreground mb-1">
                {feature?.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {feature?.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Compliance Badge */}
      <div className="text-center p-4 bg-success/10 border border-success/20 rounded-lg">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Icon name="Award" size={20} className="text-success" />
          <span className="font-medium text-success">Government Certified</span>
        </div>
        <p className="text-xs text-success/80">
          Compliant with Jharkhand State Education Standards
        </p>
      </div>
    </div>
  );
};

export default TrustSignals;