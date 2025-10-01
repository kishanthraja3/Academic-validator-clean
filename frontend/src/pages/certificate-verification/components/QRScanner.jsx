import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QRScanner = ({ onQRDetected, isActive, onToggle }) => {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  const mockQRData = {
    certificateId: 'RU/BCA/2023/001234',
    institutionCode: 'RU001',
    verificationUrl: 'https://verify.ranchi.edu/cert/001234',
    issueDate: '2023-06-20',
    studentName: 'Rajesh Kumar Singh',
    course: 'Bachelor of Computer Applications',
    grade: '8.5 CGPA'
  };

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError(null);
      
      // Simulate camera access and QR detection
      setTimeout(() => {
        setScanResult(mockQRData);
        onQRDetected && onQRDetected(mockQRData);
        setIsScanning(false);
      }, 3000);
      
    } catch (err) {
      setError('Camera access denied or not available');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    setScanResult(null);
  };

  const handleManualEntry = () => {
    const manualCode = prompt('Enter QR code data manually:');
    if (manualCode) {
      try {
        const parsedData = JSON.parse(manualCode);
        setScanResult(parsedData);
        onQRDetected && onQRDetected(parsedData);
      } catch {
        setScanResult({ rawData: manualCode });
        onQRDetected && onQRDetected({ rawData: manualCode });
      }
    }
  };

  if (!isActive) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
            <Icon name="QrCode" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">QR Code Scanner</h3>
          <p className="text-muted-foreground mb-4">
            Scan QR codes on certificates for instant verification
          </p>
          <Button
            variant="default"
            onClick={onToggle}
            iconName="Camera"
            iconPosition="left"
          >
            Enable Scanner
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center space-x-3">
          <Icon name="QrCode" size={20} className="text-primary" />
          <h3 className="font-medium text-foreground">QR Code Scanner</h3>
          {isScanning && (
            <div className="flex items-center space-x-2 text-primary">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm">Scanning...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualEntry}
            iconName="Type"
          >
            Manual Entry
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            iconName="X"
          >
            Close
          </Button>
        </div>
      </div>
      {/* Scanner Area */}
      <div className="p-4">
        {!scanResult ? (
          <div className="relative">
            {/* Camera View Placeholder */}
            <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                {isScanning ? (
                  <div className="text-center text-white">
                    <Icon name="Camera" size={48} className="mx-auto mb-4 animate-pulse" />
                    <p className="text-lg font-medium">Scanning for QR codes...</p>
                    <p className="text-sm opacity-75 mt-2">Point camera at QR code</p>
                  </div>
                ) : (
                  <div className="text-center text-white">
                    <Icon name="Camera" size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Camera Ready</p>
                    <p className="text-sm opacity-75 mt-2">Click start to begin scanning</p>
                  </div>
                )}
              </div>
              
              {/* Scanning Overlay */}
              {isScanning && (
                <div className="absolute inset-0">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-48 h-48 border-2 border-primary rounded-lg">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                      
                      {/* Scanning Line */}
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-primary animate-pulse" 
                           style={{ animation: 'scan 2s linear infinite' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4 mt-4">
              {!isScanning ? (
                <Button
                  variant="default"
                  onClick={startScanning}
                  iconName="Play"
                  iconPosition="left"
                >
                  Start Scanning
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={stopScanning}
                  iconName="Square"
                  iconPosition="left"
                >
                  Stop Scanning
                </Button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertCircle" size={16} className="text-error" />
                  <span className="text-sm text-error">{error}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Scan Results */
          (<div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon name="CheckCircle" size={24} className="text-success" />
                <div>
                  <h4 className="font-medium text-foreground">QR Code Detected</h4>
                  <p className="text-sm text-muted-foreground">Certificate data extracted successfully</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScanResult(null)}
                iconName="RotateCcw"
              >
                Scan Again
              </Button>
            </div>
            {/* Extracted Data */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-3">Extracted Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {Object.entries(scanResult)?.map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">
                      {key?.replace(/([A-Z])/g, ' $1')?.trim()}:
                    </span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Button
                variant="default"
                iconName="Search"
                iconPosition="left"
              >
                Verify Certificate
              </Button>
              <Button
                variant="outline"
                iconName="Copy"
                iconPosition="left"
              >
                Copy Data
              </Button>
              <Button
                variant="ghost"
                iconName="ExternalLink"
                iconPosition="left"
              >
                Open Verification URL
              </Button>
            </div>
          </div>)
        )}
      </div>
      {/* Instructions */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Scanning Tips:</p>
            <ul className="space-y-1">
              <li>• Ensure good lighting conditions</li>
              <li>• Hold device steady and at appropriate distance</li>
              <li>• Make sure QR code is clearly visible and not damaged</li>
              <li>• Use manual entry if camera scanning fails</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;