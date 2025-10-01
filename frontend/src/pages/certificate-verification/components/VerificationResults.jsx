import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const VerificationResults = ({ results, onApprove, onReject, onFlag }) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const mockResults = {
    overallStatus: 'valid',
    overallScore: 87,
    timestamp: new Date()?.toISOString(),
    checks: [
      {
        id: 'institution',
        name: 'Institution Validation',
        status: 'valid',
        score: 95,
        details: 'Ranchi University is a recognized institution in Jharkhand state registry',
        icon: 'Building'
      },
      {
        id: 'course',
        name: 'Course Verification',
        status: 'valid',
        score: 92,
        details: 'Bachelor of Computer Applications is an approved course program',
        icon: 'BookOpen'
      },
      {
        id: 'tampering',
        name: 'Tampering Detection',
        status: 'suspect',
        score: 75,
        details: 'Minor inconsistencies detected in font rendering - requires manual review',
        icon: 'Shield'
      },
      {
        id: 'duplicate',
        name: 'Duplicate Check',
        status: 'valid',
        score: 98,
        details: 'No duplicate certificates found in database',
        icon: 'Copy'
      },
      {
        id: 'hash',
        name: 'File Integrity',
        status: 'valid',
        score: 100,
        details: 'File hash verification successful - no corruption detected',
        icon: 'Lock'
      }
    ],
    metadata: {
      fileHash: 'sha256:a1b2c3d4e5f6...',
      processingTime: '2.3s',
      ocrConfidence: 89,
      registryMatches: 3
    },
    recommendations: [
      'Manual review recommended due to font inconsistencies',
      'Verify graduation date with institution records',
      'Cross-reference registration number format'
    ]
  };

  const data = results || mockResults;

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'text-success';
      case 'invalid': return 'text-error';
      case 'suspect': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'valid': return 'bg-success/10 border-success/20';
      case 'invalid': return 'bg-error/10 border-error/20';
      case 'suspect': return 'bg-warning/10 border-warning/20';
      default: return 'bg-muted border-border';
    }
  };

  const getOverallStatusIcon = (status) => {
    switch (status) {
      case 'valid': return 'CheckCircle';
      case 'invalid': return 'XCircle';
      case 'suspect': return 'AlertTriangle';
      default: return 'Clock';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3' },
    { id: 'details', label: 'Detailed Results', icon: 'List' },
    { id: 'metadata', label: 'Technical Data', icon: 'Code' },
    { id: 'history', label: 'Verification History', icon: 'Clock' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${getStatusBg(data?.overallStatus)}`}>
              <Icon 
                name={getOverallStatusIcon(data?.overallStatus)} 
                size={24} 
                className={getStatusColor(data?.overallStatus)}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground capitalize">
                Certificate {data?.overallStatus}
              </h3>
              <p className="text-muted-foreground">
                Verification completed on {new Date(data.timestamp)?.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground">
              {data?.overallScore}
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
            <p className="text-sm text-muted-foreground">Authenticity Score</p>
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 px-6">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setSelectedTab(tab?.id)}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors duration-200 ${
                selectedTab === tab?.id
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={tab?.icon} size={16} />
              <span className="font-medium">{tab?.label}</span>
            </button>
          ))}
        </nav>
      </div>
      {/* Content */}
      <div className="p-6">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="CheckCircle" size={20} className="text-success" />
                  <div>
                    <p className="font-medium text-foreground">
                      {data?.checks?.filter(c => c?.status === 'valid')?.length} Passed
                    </p>
                    <p className="text-sm text-muted-foreground">Validation checks</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="AlertTriangle" size={20} className="text-warning" />
                  <div>
                    <p className="font-medium text-foreground">
                      {data?.checks?.filter(c => c?.status === 'suspect')?.length} Flagged
                    </p>
                    <p className="text-sm text-muted-foreground">Require review</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="XCircle" size={20} className="text-error" />
                  <div>
                    <p className="font-medium text-foreground">
                      {data?.checks?.filter(c => c?.status === 'invalid')?.length} Failed
                    </p>
                    <p className="text-sm text-muted-foreground">Critical issues</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {data?.recommendations?.length > 0 && (
              <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                <h4 className="font-medium text-foreground mb-3 flex items-center space-x-2">
                  <Icon name="Lightbulb" size={16} className="text-warning" />
                  <span>Recommendations</span>
                </h4>
                <ul className="space-y-2">
                  {data?.recommendations?.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <Icon name="ArrowRight" size={14} className="text-warning mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'details' && (
          <div className="space-y-4">
            {data?.checks?.map((check) => (
              <div key={check?.id} className={`p-4 border rounded-lg ${getStatusBg(check?.status)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Icon name={check?.icon} size={20} className={getStatusColor(check?.status)} />
                    <h4 className="font-medium text-foreground">{check?.name}</h4>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBg(check?.status)}`}>
                      {check?.status}
                    </span>
                    <span className="text-sm font-mono text-foreground">
                      {check?.score}/100
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{check?.details}</p>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'metadata' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-3">File Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Hash:</span>
                    <span className="font-mono text-foreground">{data?.metadata?.fileHash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing Time:</span>
                    <span className="text-foreground">{data?.metadata?.processingTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">OCR Confidence:</span>
                    <span className="text-foreground">{data?.metadata?.ocrConfidence}%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-3">Registry Validation</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registry Matches:</span>
                    <span className="text-foreground">{data?.metadata?.registryMatches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Registry Sync:</span>
                    <span className="text-foreground">2 hours ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API Version:</span>
                    <span className="text-foreground">v2.1.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'history' && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <Icon name="Clock" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No previous verification history available</p>
              <p className="text-sm text-muted-foreground mt-2">
                This is the first verification attempt for this certificate
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationResults;