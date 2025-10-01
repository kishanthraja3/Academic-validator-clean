import React from 'react';
import Icon from '../../../components/AppIcon';

const CertificateCategories = ({ stats, results }) => {
  // Priority order: Blockchain → Digital Signature → QR → Legacy
  const categories = [
    {
      id: 'blockchain',
      title: 'Blockchain',
      description: 'Certificates on blockchain',
      icon: 'Link',
      color: 'primary',
      count: stats?.blockchain || 0,
      priority: 1
    },
    {
      id: 'digitalSignature',
      title: 'Digital Signature',
      description: 'Digitally signed certificates',
      icon: 'Shield',
      color: 'success',
      count: stats?.digitalSignature || 0,
      priority: 2
    },
    {
      id: 'qr',
      title: 'QR',
      description: 'QR code certificates',
      icon: 'QrCode',
      color: 'warning',
      count: stats?.qr || 0,
      priority: 3
    },
    {
      id: 'legacy',
      title: 'Legacy',
      description: 'Traditional certificates',
      icon: 'FileText',
      color: 'muted',
      count: stats?.legacy || 0,
      priority: 4
    }
  ];

  // Sort by priority (lower number = higher priority)
  const sortedCategories = categories.sort((a, b) => a.priority - b.priority);

  const getColorClasses = (color) => {
    switch (color) {
      case 'primary':
        return {
          bg: 'bg-primary/10',
          text: 'text-primary',
          border: 'border-primary/20'
        };
      case 'success':
        return {
          bg: 'bg-success/10',
          text: 'text-success',
          border: 'border-success/20'
        };
      case 'warning':
        return {
          bg: 'bg-warning/10',
          text: 'text-warning',
          border: 'border-warning/20'
        };
      case 'muted':
      default:
        return {
          bg: 'bg-muted/50',
          text: 'text-muted-foreground',
          border: 'border-border'
        };
    }
  };

  const getTotalFiles = () => {
    return Object.values(stats || {}).reduce((total, count) => total + count, 0);
  };

  const getCategoryPercentage = (count) => {
    const total = getTotalFiles();
    return total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Certificate Categories
        </h3>
        <p className="text-muted-foreground">
          Distribution of verified certificates by verification method
        </p>
      </div>

      {/* Total Stats */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <Icon name="BarChart3" size={24} className="text-primary" />
          <h4 className="text-xl font-semibold text-primary">Total Verified Certificates</h4>
        </div>
        <p className="text-3xl font-bold text-primary">{getTotalFiles()}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Successfully processed and verified
        </p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedCategories.map((category) => {
          const colors = getColorClasses(category.color);
          const percentage = getCategoryPercentage(category.count);
          
          return (
            <div
              key={category.id}
              className={`bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow ${
                category.priority === 1 ? 'ring-2 ring-primary/20' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${colors.bg}`}>
                  <Icon name={category.icon} size={24} className={colors.text} />
                </div>
                
                {/* Priority Badge */}
                {category.priority === 1 && (
                  <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                    #1
                  </div>
                )}
                {category.priority === 2 && (
                  <div className="bg-success text-success-foreground text-xs font-bold px-2 py-1 rounded-full">
                    #2
                  </div>
                )}
                {category.priority === 3 && (
                  <div className="bg-warning text-warning-foreground text-xs font-bold px-2 py-1 rounded-full">
                    #3
                  </div>
                )}
                {category.priority === 4 && (
                  <div className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-full">
                    #4
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">{category.title}</h4>
                <p className="text-sm text-muted-foreground">{category.description}</p>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${colors.text}`}>{category.count}</p>
                    <p className="text-xs text-muted-foreground">Files</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">{percentage}%</p>
                    <p className="text-xs text-muted-foreground">Share</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2 mt-3">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${colors.bg.replace('/10', '')}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Priority Information */}
      <div className="bg-muted/30 border border-border rounded-lg p-6">
        <h4 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
          <Icon name="Info" size={16} className="text-primary" />
          <span>Verification Priority Order</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">1</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Blockchain</p>
                <p className="text-xs text-muted-foreground">Highest security & authenticity</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-success-foreground">2</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Digital Signature</p>
                <p className="text-xs text-muted-foreground">Cryptographically signed</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-warning rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-warning-foreground">3</span>
              </div>
              <div>
                <p className="font-medium text-foreground">QR Code</p>
                <p className="text-xs text-muted-foreground">Quick verification method</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">4</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Legacy</p>
                <p className="text-xs text-muted-foreground">Traditional paper-based</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      {results && results.results && (
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h4 className="font-semibold text-foreground">Processing Results</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Detailed breakdown of certificate verification results
            </p>
          </div>
          
          <div className="p-6">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {results.results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon 
                      name={result.status === 'verified' ? 'CheckCircle' : 'XCircle'} 
                      size={16} 
                      className={result.status === 'verified' ? 'text-success' : 'text-error'} 
                    />
                    <div>
                      <p className="font-medium text-foreground text-sm">{result.fileName}</p>
                      <p className="text-xs text-muted-foreground">{result.processingDetails}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      result.category === 'blockchain' ? 'bg-primary/10 text-primary' :
                      result.category === 'digitalSignature' ? 'bg-success/10 text-success' :
                      result.category === 'qr' ? 'bg-warning/10 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {result.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateCategories;




