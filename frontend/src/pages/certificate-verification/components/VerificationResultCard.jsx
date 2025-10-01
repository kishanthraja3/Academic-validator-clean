import React from 'react';
import Icon from '../../../components/AppIcon';

const VerificationResultCard = ({ results }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
      case 'valid':
        return 'text-success';
      case 'mismatch':
      case 'invalid':
        return 'text-error';
      case 'insufficient':
      case 'unsigned':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'verified':
      case 'valid':
        return 'bg-success/10 border-success/20';
      case 'mismatch':
      case 'invalid':
        return 'bg-error/10 border-error/20';
      case 'insufficient':
      case 'unsigned':
        return 'bg-warning/10 border-warning/20';
      default:
        return 'bg-muted border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
      case 'valid':
        return 'CheckCircle';
      case 'mismatch':
      case 'invalid':
        return 'XCircle';
      case 'insufficient':
      case 'unsigned':
        return 'AlertTriangle';
      default:
        return 'Clock';
    }
  };

  const getStatusTitle = (status) => {
    switch (status) {
      case 'verified':
      case 'valid':
        return 'Valid Certificate';
      case 'mismatch':
      case 'invalid':
        return 'Invalid Certificate';
      case 'insufficient':
        return 'Insufficient Data';
      case 'unsigned':
        return 'No Digital Signature';
      default:
        return 'Verification Status';
    }
  };

  const getStatusMessage = (status, message) => {
    if (message) return message;
    
    switch (status) {
      case 'verified':
      case 'valid':
        return 'This certificate has been successfully verified and is authentic.';
      case 'mismatch':
      case 'invalid':
        return 'This certificate failed verification. Please check the details.';
      case 'insufficient':
        return 'Unable to verify due to insufficient data.';
      case 'unsigned':
        return 'No digital signature found on this document.';
      default:
        return 'Verification completed.';
    }
  };

  if (!results) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center justify-center w-16 h-16 rounded-full border-2 ${getStatusBg(results.status)}`}>
          <Icon 
            name={getStatusIcon(results.status)} 
            size={32} 
            className={getStatusColor(results.status)}
          />
        </div>
        <div className="flex-1">
          <h3 className={`text-xl font-semibold ${getStatusColor(results.status)}`}>
            {getStatusTitle(results.status)}
          </h3>
          <p className="text-muted-foreground mt-1">
            {getStatusMessage(results.status, results.message)}
          </p>
        </div>
      </div>
      
      {/* Additional info for successful verification */}
      {(results.status === 'verified' || results.status === 'valid') && (
        <div className="mt-4 p-3 bg-success/5 border border-success/20 rounded-md">
          <div className="flex items-center space-x-2 text-success">
            <Icon name="Shield" size={16} />
            <span className="text-sm font-medium">Certificate Authenticity Confirmed</span>
          </div>
        </div>
      )}
      
      {/* Additional info for failed verification */}
      {(results.status === 'mismatch' || results.status === 'invalid') && (
        <div className="mt-4 p-3 bg-error/5 border border-error/20 rounded-md">
          <div className="flex items-center space-x-2 text-error">
            <Icon name="AlertTriangle" size={16} />
            <span className="text-sm font-medium">Verification Failed</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationResultCard;


