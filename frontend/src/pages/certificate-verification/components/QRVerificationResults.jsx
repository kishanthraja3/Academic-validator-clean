import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QRVerificationResults = ({ results, onApprove, onReject, onFlag }) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-success';
      case 'mismatch': return 'text-error';
      case 'insufficient': return 'text-warning';
      case 'no_qr': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'verified': return 'bg-success/10 border-success/20';
      case 'mismatch': return 'bg-error/10 border-error/20';
      case 'insufficient': return 'bg-warning/10 border-warning/20';
      case 'no_qr': return 'bg-muted border-border';
      default: return 'bg-muted border-border';
    }
  };

  const getOverallStatusIcon = (status) => {
    switch (status) {
      case 'verified': return 'CheckCircle';
      case 'mismatch': return 'XCircle';
      case 'insufficient': return 'AlertTriangle';
      case 'no_qr': return 'QrCode';
      default: return 'Clock';
    }
  };

  const getFieldStatusColor = (match) => {
    return match ? 'text-success' : 'text-error';
  };

  const getFieldStatusIcon = (match) => {
    return match ? 'CheckCircle' : 'XCircle';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3' },
    { id: 'results', label: 'Verification Results', icon: 'CheckCircle' }
  ];

  // Handle both old and new data structures
  const extractedFields = results?.fields || results?.data?.fields || {};
  const ocrFields = Object.keys(extractedFields).reduce((acc, key) => {
    acc[key] = extractedFields[key]?.ocr || '';
    return acc;
  }, {});

  // Debug: Log the results to see the actual data structure
  console.log('QRVerificationResults - results:', results);
  console.log('QRVerificationResults - extractedFields:', extractedFields);
  console.log('QRVerificationResults - ocrFields:', ocrFields);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${getStatusBg(results?.status)}`}>
              <Icon 
                name={getOverallStatusIcon(results?.status)} 
                size={24} 
                className={getStatusColor(results?.status)}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground capitalize">
                {results?.status === 'verified' ? 'Valid Certificate' : 
                 results?.status === 'mismatch' ? 'Invalid Certificate' : 
                 results?.status === 'insufficient' ? 'Insufficient Data' : 
                 'No QR Code Found'}
              </h3>
              <p className="text-muted-foreground">
                {results?.message || 'QR code verification completed'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground">
              {results?.status === 'verified' ? '✓' : results?.status === 'mismatch' ? '✗' : '?'}
            </div>
            <p className="text-sm text-muted-foreground">Verification Status</p>
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
                      {Object.values(extractedFields).filter(field => field?.match).length} Matched
                    </p>
                    <p className="text-sm text-muted-foreground">Field validations</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="XCircle" size={20} className="text-error" />
                  <div>
                    <p className="font-medium text-foreground">
                      {Object.values(extractedFields).filter(field => !field?.match).length} Mismatched
                    </p>
                    <p className="text-sm text-muted-foreground">Field discrepancies</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="QrCode" size={20} className="text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {Object.keys(extractedFields).length} Fields
                    </p>
                    <p className="text-sm text-muted-foreground">Total extracted</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Information */}
            {results?.data?.qr_bbox && (
              <div className="p-4 bg-muted/30 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-3 flex items-center space-x-2">
                  <Icon name="QrCode" size={16} className="text-primary" />
                  <span>QR Code Information</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Position:</span>
                    <p className="font-medium text-foreground">
                      {results.data.qr_bbox[0]}, {results.data.qr_bbox[1]}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Size:</span>
                    <p className="font-medium text-foreground">
                      {results.data.qr_bbox[2]} × {results.data.qr_bbox[3]}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Path:</span>
                    <p className="font-medium text-foreground truncate">
                      {results.data.path}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className={`font-medium capitalize ${getStatusColor(results?.status)}`}>
                      {results?.status}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {selectedTab === 'results' && (
          <div className="space-y-6">
            {/* Extracted Text */}
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground">Extracted Text</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Copy"
                  onClick={() => {
                    const text = Object.entries(ocrFields).map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').trim()}: ${value || 'N/A'}`).join('\n');
                    navigator.clipboard.writeText(text);
                  }}
                >
                  Copy Text
                </Button>
              </div>
              <div className="bg-background border border-border rounded-md p-3">
                <p className="text-sm text-foreground font-mono leading-relaxed">
                  {Object.entries(ocrFields).map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').trim()}: ${value || 'N/A'}`).join('\n')}
                </p>
              </div>
            </div>

            {/* Field Comparison */}
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-medium text-foreground mb-4 flex items-center space-x-2">
                <Icon name="CheckCircle" size={16} className="text-primary" />
                <span>Field Comparison</span>
              </h4>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Field</th>
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Parsed</th>
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">QR</th>
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(extractedFields).map(([field, data]) => (
                      <tr key={field} className="border-b border-border/50">
                        <td className="py-3 text-sm font-medium text-foreground capitalize">
                          {field.replace(/([A-Z])/g, ' $1').trim()}
                        </td>
                        <td className="py-3 text-sm text-foreground">
                          {data?.ocr || '-'}
                        </td>
                        <td className="py-3 text-sm text-foreground">
                          {data?.qr || '-'}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <Icon 
                              name={getFieldStatusIcon(data?.match)} 
                              size={14} 
                              className={getFieldStatusColor(data?.match)} 
                            />
                            <span className={`text-sm font-medium capitalize ${getFieldStatusColor(data?.match)}`}>
                              {data?.match ? 'Match' : 'Mismatch'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Verification Summary */}
            <div className="p-4 bg-muted/30 border border-border rounded-lg">
              <h4 className="font-medium text-foreground mb-3 flex items-center space-x-2">
                <Icon name="BarChart3" size={16} className="text-primary" />
                <span>Verification Summary</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overall Status:</span>
                  <span className={`font-medium capitalize ${getStatusColor(results?.status)}`}>
                    {results?.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Message:</span>
                  <span className="text-foreground">{results?.message || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fields Matched:</span>
                  <span className="text-foreground">
                    {Object.values(extractedFields).filter(field => field?.match).length} / {Object.keys(extractedFields).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verification Time:</span>
                  <span className="text-foreground">{new Date(results?.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default QRVerificationResults;
