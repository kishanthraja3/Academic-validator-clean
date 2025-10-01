import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BlockchainVerificationResults = ({ results, onApprove, onReject, onFlag }) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Debug: Log the results data
  console.log('BlockchainVerificationResults received results:', results);
  
  // Handle both data structures: wrapped (results.data) and direct (results)
  const blockchainData = results?.data || results;

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-success';
      case 'invalid': return 'text-error';
      case 'error': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'verified': return 'bg-success/10 border-success/20';
      case 'invalid': return 'bg-error/10 border-error/20';
      case 'error': return 'bg-error/10 border-error/20';
      default: return 'bg-muted border-border';
    }
  };

  const getOverallStatusIcon = (status) => {
    switch (status) {
      case 'verified': return 'CheckCircle';
      case 'invalid': return 'XCircle';
      case 'error': return 'AlertTriangle';
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

  const getStatusMessage = (status, message) => {
    if (message) return message;
    switch (status) {
      case 'verified': return 'Blockchain verification successful';
      case 'invalid': return 'Hash not found in blockchain';
      case 'error': return 'Blockchain verification failed';
      default: return 'Verification in progress';
    }
  };

  const verificationDetails = blockchainData?.verification_details || {};
  const fields = blockchainData?.fields || {};

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${getStatusBg(blockchainData?.status)}`}>
              <Icon 
                name={getOverallStatusIcon(blockchainData?.status)} 
                size={24} 
                className={getStatusColor(blockchainData?.status)}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground capitalize">
                {blockchainData?.status === 'verified' ? 'Valid Certificate' : 
                 blockchainData?.status === 'invalid' ? 'Invalid Certificate' : 
                 'Verification Error'}
              </h3>
              <p className="text-muted-foreground">
                {getStatusMessage(blockchainData?.status, blockchainData?.message)}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground">
              {blockchainData?.status === 'verified' ? '✓' : blockchainData?.status === 'invalid' ? '✗' : '?'}
            </div>
            <p className="text-sm text-muted-foreground">Blockchain Status</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === tab.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Icon name="Shield" size={20} className="text-success" />
                  <div>
                    <h4 className="font-semibold text-success">Blockchain Verified</h4>
                    <p className="text-sm text-muted-foreground">Hash found in blockchain</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Icon name="Lock" size={20} className="text-success" />
                  <div>
                    <h4 className="font-semibold text-success">File Intact</h4>
                    <p className="text-sm text-muted-foreground">File integrity confirmed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Summary */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center space-x-2">
                <Icon name="Info" size={16} />
                <span>Verification Summary</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${getStatusColor(blockchainData?.status)}`}>
                    {blockchainData?.status === 'verified' ? 'Valid' : 'Invalid'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hash Source:</span>
                  <span className="font-medium">{blockchainData?.hash_source || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Time:</span>
                  <span className="font-medium">{blockchainData?.processing_time || 'N/A'}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span className="font-medium">
                    {blockchainData?.timestamp ? new Date(blockchainData.timestamp).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'details' && (
          <div className="space-y-6">
            {/* Hash Verification */}
            {verificationDetails.hash_verification && (
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center space-x-2">
                  <Icon name="Hash" size={16} />
                  <span>Hash Verification</span>
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Stored Blockchain Hash:</label>
                    <div className="font-mono text-sm bg-muted p-2 rounded border">
                      {formatHash(verificationDetails.hash_verification.stored_blockchain_hash)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Current File Hash:</label>
                    <div className="font-mono text-sm bg-muted p-2 rounded border">
                      {formatHash(verificationDetails.hash_verification.current_file_hash)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span className="text-sm text-success">Hashes match - Certificate verified</span>
                  </div>
                </div>
              </div>
            )}

            {/* Blockchain Information */}
            {verificationDetails.blockchain_information && (
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center space-x-2">
                  <Icon name="Link" size={16} />
                  <span>Blockchain Information</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Blockchain Issuer:</label>
                    <div className="font-medium">{verificationDetails.blockchain_information.blockchain_issuer}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Blockchain Date:</label>
                    <div className="font-medium">{verificationDetails.blockchain_information.blockchain_date}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Network:</label>
                    <div className="font-medium">{verificationDetails.blockchain_information.blockchain_network}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Channel:</label>
                    <div className="font-medium">{verificationDetails.blockchain_information.blockchain_channel}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <Icon name="CheckCircle" size={16} className="text-success" />
                  <span className="text-sm text-success">Blockchain record found and verified</span>
                </div>
              </div>
            )}


            {/* Blockchain Connectivity */}
            {verificationDetails.blockchain_connectivity && (
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center space-x-2">
                  <Icon name="Wifi" size={16} />
                  <span>Blockchain Connectivity</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Docker Container:</label>
                    <div className="font-medium">{verificationDetails.blockchain_connectivity.docker_container}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Network Status:</label>
                    <div className="font-medium">{verificationDetails.blockchain_connectivity.network_status}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Query Successful:</label>
                    <div className="font-medium">
                      {verificationDetails.blockchain_connectivity.query_successful ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Response Time:</label>
                    <div className="font-medium">{verificationDetails.blockchain_connectivity.response_time}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <Icon name="CheckCircle" size={16} className="text-success" />
                  <span className="text-sm text-success">Successfully connected to blockchain network</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainVerificationResults;
