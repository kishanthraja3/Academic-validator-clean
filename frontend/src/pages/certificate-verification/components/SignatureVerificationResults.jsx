import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SignatureVerificationResults = ({ results, onApprove, onReject, onFlag }) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Debug: Log the results data
  console.log('SignatureVerificationResults received results:', results);
  console.log('SignatureVerificationResults results.data:', results?.data);
  
  // Handle both data structures: wrapped (results.data) and direct (results)
  const signatureData = results?.data || results;
  
  // Safety check - ensure we have valid results
  if (!results) {
    console.error('SignatureVerificationResults: No results provided');
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-error">Error: No verification results available</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'text-success';
      case 'invalid': return 'text-error';
      case 'unsigned': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'valid': return 'bg-success/10 border-success/20';
      case 'invalid': return 'bg-error/10 border-error/20';
      case 'unsigned': return 'bg-warning/10 border-warning/20';
      default: return 'bg-muted border-border';
    }
  };

  const getOverallStatusIcon = (status) => {
    switch (status) {
      case 'valid': return 'CheckCircle';
      case 'invalid': return 'XCircle';
      case 'unsigned': return 'AlertTriangle';
      default: return 'Clock';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3' },
    { id: 'details', label: 'Verification Results', icon: 'CheckCircle' }
  ];

  const formatHash = (hash) => {
    if (!hash) return 'N/A';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  const getStatusMessage = (status, reason) => {
    switch (status) {
      case 'valid':
        return 'Digital signature verified successfully. Document integrity confirmed.';
      case 'invalid':
        return reason || 'Digital signature verification failed.';
      case 'unsigned':
        return 'No digital signature found on this document.';
      default:
        return 'Verification status unknown.';
    }
  };

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
                {results?.status === 'valid' ? 'Valid Certificate' : 
                 results?.status === 'invalid' ? 'Invalid Certificate' : 
                 'Unsigned Certificate'}
              </h3>
              <p className="text-muted-foreground">
                {getStatusMessage(results?.status, results?.message)}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground">
              {results?.status === 'valid' ? '✓' : results?.status === 'invalid' ? '✗' : '?'}
            </div>
            <p className="text-sm text-muted-foreground">Signature Status</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 border rounded-lg ${getStatusBg(signatureData?.signature_ok ? 'valid' : 'invalid')}`}>
                <div className="flex items-center space-x-3">
                  <Icon name="Shield" size={20} className={getStatusColor(signatureData?.signature_ok ? 'valid' : 'invalid')} />
                  <div>
                    <p className="font-medium text-foreground">
                      {signatureData?.signature_ok ? 'Signature Valid' : 'Signature Invalid'}
                    </p>
                    <p className="text-sm text-muted-foreground">Digital signature verification</p>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 border rounded-lg ${getStatusBg(signatureData?.signed_hash_match ? 'valid' : 'invalid')}`}>
                <div className="flex items-center space-x-3">
                  <Icon name="Lock" size={20} className={getStatusColor(signatureData?.signed_hash_match ? 'valid' : 'invalid')} />
                  <div>
                    <p className="font-medium text-foreground">
                      {signatureData?.signed_hash_match ? 'File Intact' : 'File Modified'}
                    </p>
                    <p className="text-sm text-muted-foreground">File integrity check</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Details */}
            <div className="p-4 bg-muted/30 border border-border rounded-lg">
              <h4 className="font-medium text-foreground mb-3 flex items-center space-x-2">
                <Icon name="Info" size={16} className="text-primary" />
                <span>Verification Details</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium capitalize ${getStatusColor(results?.status)}`}>
                    {results?.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reason:</span>
                  <span className="text-foreground">{results?.message || results?.reason || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hash Algorithm:</span>
                  <span className="text-foreground">{signatureData?.hash_algo || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Signature Algorithm:</span>
                  <span className="text-foreground">{signatureData?.sig_alg || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'details' && (
          <div className="space-y-6">
            {/* Hash Comparison */}
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-medium text-foreground mb-4 flex items-center space-x-2">
                <Icon name="Hash" size={16} className="text-primary" />
                <span>Hash Verification</span>
              </h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Stored Signed Hash:</label>
                    <div className="mt-1 p-2 bg-muted rounded border font-mono text-sm">
                      {formatHash(signatureData?.stored_signed_hash)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Hash:</label>
                    <div className="mt-1 p-2 bg-muted rounded border font-mono text-sm">
                      {formatHash(signatureData?.current_hash)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={signatureData?.signed_hash_match ? 'CheckCircle' : 'XCircle'} 
                    size={16} 
                    className={signatureData?.signed_hash_match ? 'text-success' : 'text-error'} 
                  />
                  <span className={`text-sm font-medium ${signatureData?.signed_hash_match ? 'text-success' : 'text-error'}`}>
                    {signatureData?.signed_hash_match ? 'Hashes match - File unchanged' : 'Hashes differ - File may have been modified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Public Key Information */}
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-medium text-foreground mb-4 flex items-center space-x-2">
                <Icon name="Key" size={16} className="text-primary" />
                <span>Public Key Information</span>
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">PDF Public Key Fingerprint:</label>
                  <div className="mt-1 p-2 bg-muted rounded border font-mono text-sm">
                    {formatHash(signatureData?.pubkey_fingerprint_pdf)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expected Public Key Fingerprint:</label>
                  <div className="mt-1 p-2 bg-muted rounded border font-mono text-sm">
                    {formatHash(signatureData?.pubkey_fingerprint_arg)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={signatureData?.pubkey_fingerprint_pdf === signatureData?.pubkey_fingerprint_arg ? 'CheckCircle' : 'XCircle'} 
                    size={16} 
                    className={signatureData?.pubkey_fingerprint_pdf === signatureData?.pubkey_fingerprint_arg ? 'text-success' : 'text-error'} 
                  />
                  <span className={`text-sm font-medium ${signatureData?.pubkey_fingerprint_pdf === signatureData?.pubkey_fingerprint_arg ? 'text-success' : 'text-error'}`}>
                    {signatureData?.pubkey_fingerprint_pdf === signatureData?.pubkey_fingerprint_arg ? 'Public key fingerprints match' : 'Public key fingerprints differ'}
                  </span>
                </div>
              </div>
            </div>

            {/* Signature Details */}
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-medium text-foreground mb-4 flex items-center space-x-2">
                <Icon name="Shield" size={16} className="text-primary" />
                <span>Signature Details</span>
              </h4>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Signature Present:</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Icon 
                        name={signatureData?.signed_present ? 'CheckCircle' : 'XCircle'} 
                        size={16} 
                        className={signatureData?.signed_present ? 'text-success' : 'text-error'} 
                      />
                      <span className="text-sm">{signatureData?.signed_present ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Signature Valid:</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Icon 
                        name={signatureData?.signature_ok ? 'CheckCircle' : 'XCircle'} 
                        size={16} 
                        className={signatureData?.signature_ok ? 'text-success' : 'text-error'} 
                      />
                      <span className="text-sm">{signatureData?.signature_ok ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default SignatureVerificationResults;
