import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

// Import all components
import CertificateUpload from './components/CertificateUpload';
import CertificateViewer from './components/CertificateViewer';
import EnhancedVerificationProgress from './components/EnhancedVerificationProgress';
import PerformanceMonitor from './components/PerformanceMonitor';
import VerificationResults from './components/VerificationResults';
import BlockchainVerificationResults from './components/BlockchainVerificationResults';
import SignatureVerificationResults from './components/SignatureVerificationResults';
import QRVerificationResults from './components/QRVerificationResults';
import LegacyVerificationResults from './components/LegacyVerificationResults';
import QRScanner from './components/QRScanner';
import VerificationResultCard from './components/VerificationResultCard';
import EmailService from '../../utils/emailService';
import FloatingNotification from '../../components/ui/FloatingNotification';
import { verificationStatsService } from '../../utils/verificationStats';

// Import pipeline controller
import VerificationPipeline from '../../utils/verificationPipeline';

const CertificateVerification = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [currentStep, setCurrentStep] = useState('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [verificationResults, setVerificationResults] = useState(null);
  const [selectedPanel, setSelectedPanel] = useState('document');
  const [pipelineType, setPipelineType] = useState(null);
  const [pipelineSteps, setPipelineSteps] = useState([]);
  const [verificationPipeline] = useState(new VerificationPipeline());
  const [processingStartTime, setProcessingStartTime] = useState(null);
  const [notification, setNotification] = useState({ isVisible: false, message: "", type: "success" });
  const [emailService] = useState(() => new EmailService());

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/verifier-dashboard' },
    { label: 'Certificate Verification', path: '/certificate-verification' }
  ];

  // Notification handlers
  const showNotification = (message, type = "success") => {
    setNotification({ isVisible: true, message, type });
  };

  const hideNotification = () => {
    setNotification({ isVisible: false, message: "", type: "success" });
  };

  const handleEmailSent = async (emailData) => {
    showNotification(
      `Email sent to ${emailData.institution} (${emailData.email}) regarding tampered certificate: ${emailData.fileName}`,
      "success"
    );
  };

  const mockNotifications = [
    {
      title: 'Verification Complete',
      message: 'Certificate RU/BCA/2023/001234 has been processed',
      time: '2 minutes ago',
      type: 'success',
      read: false
    },
    {
      title: 'Manual Review Required',
      message: 'Certificate flagged for tampering detection',
      time: '15 minutes ago',
      type: 'warning',
      read: false
    }
  ];

  const user = {
    name: 'Dr. Priya Sharma',
    role: 'Senior Verifier',
    institution: 'Jharkhand Education Department'
  };

  const handleFileProcessing = useCallback(async () => {
    setIsProcessing(true);
    setProcessingStartTime(Date.now());
    setCurrentStep('upload');

    // Set default pipeline steps immediately
    setPipelineSteps([
      { id: 'upload', label: 'Uploading file', description: 'Sending certificate to server', icon: 'Upload' },
      { id: 'analysis', label: 'OCR Analysis', description: 'Extracting text from certificate', icon: 'Search' },
      { id: 'qr', label: 'QR Code Detection', description: 'Scanning for QR codes', icon: 'QrCode' },
      { id: 'parsing', label: 'Parsing Fields', description: 'Identifying certificate details', icon: 'FileText' },
      { id: 'verification', label: 'Verification', description: 'Validating against database', icon: 'Shield' },
      { id: 'complete', label: 'Complete', description: 'Processing finished', icon: 'CheckCircle' }
    ]);

    try {
      // Step 1: Upload (stay at 0% until pipeline is identified)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Start verification process
      const result = await verificationPipeline.verifyCertificate(uploadedFile);
      
      // Set pipeline type and steps based on result
      setPipelineType(result.pipeline);
      setPipelineSteps(verificationPipeline.getPipelineSteps(result.pipeline));
      
      // Now start the actual pipeline progress from 0%
      const steps = verificationPipeline.getPipelineSteps(result.pipeline);
      for (let i = 0; i < steps.length - 1; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setCurrentStep(steps[i].id);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep('complete');
      
      // Send email notification for invalid certificates BEFORE displaying results
      console.log("Checking if email should be sent for result:", result.status);
      if (result.status === "invalid" || result.status === "mismatch" || result.status === "failed") {
        try {
          console.log("Sending tampered certificate email for:", result);
          const certificateData = await emailService.prepareCertificateData(result, uploadedFile);
          await emailService.sendTamperedCertificateAlert(certificateData);
          handleEmailSent(certificateData);
        } catch (emailError) {
          console.error("Failed to send tampered certificate email:", emailError);
        }
      }
      
      setVerificationResults(result);
      
      // Update verification statistics
      verificationStatsService.recordVerification(result);
      
      // Debug: Log the verification result
      console.log('CertificateVerification - Verification result:', result);
      console.log('CertificateVerification - Pipeline type:', result.pipeline);
      console.log('CertificateVerification - Status:', result.status);
      console.log('CertificateVerification - Full result object:', JSON.stringify(result, null, 2));

      // Set OCR data for display based on pipeline type
      if (result.pipeline === 'signature') {
        setOcrData({
          extractedText: `Digital Signature Verification\n\nStatus: ${result.status}\nReason: ${result.message || result.reason}\nHash Algorithm: ${result.hash_algo || 'N/A'}\nSignature Algorithm: ${result.sig_alg || 'N/A'}\n\nStored Signed Hash: ${result.stored_signed_hash || 'N/A'}\nCurrent Hash: ${result.current_hash || 'N/A'}\n\nPublic Key Fingerprint: ${result.pubkey_fingerprint_pdf || 'N/A'}`,
          confidence: 0.95,
          fields: []
        });
      } else if (result.pipeline === 'qr') {
        const fields = result.fields || result.data?.fields || {};
        const extractedText = Object.entries(fields).map(([key, value]) => 
          `${key.replace(/([A-Z])/g, ' $1').trim()}: ${value?.ocr || 'N/A'}`
        ).join('\n');
        
        setOcrData({
          extractedText: extractedText,
          confidence: 0.89,
          fields: []
        });
      } else if (result.pipeline === 'legacy') {
        const fields = result.fields || result.data?.fields || {};
        const extractedText = Object.entries(fields).map(([key, value]) => 
          `${key.replace(/([A-Z])/g, ' $1').trim()}: ${value?.ocr || 'N/A'}`
        ).join('\n');
        
        setOcrData({
          extractedText: extractedText,
          confidence: 0.89,
          fields: []
        });
      }

    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationResults({
        pipeline: 'error',
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsProcessing(false);
      setProcessingStartTime(null);
    }
  }, [uploadedFile, verificationPipeline]);

  useEffect(() => {
    if (uploadedFile && currentStep === 'upload') {
      handleFileProcessing();
    }
  }, [uploadedFile, currentStep, handleFileProcessing]);

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    if (!file) {
      setCurrentStep('upload');
      setOcrData(null);
      setVerificationResults(null);
      setPipelineType(null);
      setPipelineSteps([]);
    } else {
      // Immediately show progress when file is uploaded
      setCurrentStep('upload');
      setPipelineSteps([
        { id: 'upload', label: 'Uploading file', description: 'Sending certificate to server', icon: 'Upload' },
        { id: 'analysis', label: 'OCR Analysis', description: 'Extracting text from certificate', icon: 'Search' },
        { id: 'qr', label: 'QR Code Detection', description: 'Scanning for QR codes', icon: 'QrCode' },
        { id: 'parsing', label: 'Parsing Fields', description: 'Identifying certificate details', icon: 'FileText' },
        { id: 'verification', label: 'Verification', description: 'Validating against database', icon: 'Shield' },
        { id: 'complete', label: 'Complete', description: 'Processing finished', icon: 'CheckCircle' }
      ]);
    }
  };



  const handleLogout = () => {
    window.location.href = '/login';
  };

  const handleSearch = (query) => {
    console.log('Search query:', query);
  };

  const getPanels = () => {
    // Only show Document View and Verification Results tabs
    return [
      { id: 'document', label: 'Document View', icon: 'FileText' },
      { id: 'results', label: 'Verification Results', icon: 'CheckCircle' }
    ];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={user}
        notifications={mockNotifications}
        onLogout={handleLogout}
        onSearch={handleSearch}
        hideRoleNav={true}
      />
      <div className="flex">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className={`flex-1 transition-all duration-300 pt-16 ${
          isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="p-6">
            {/* Page Header */}
            <div className="mb-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex items-center justify-between mt-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Certificate Verification</h1>
                  <p className="text-muted-foreground mt-1">
                    Comprehensive analysis and validation of academic certificates
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    iconName="History"
                    onClick={() => window.location.href = '/audit-log-viewer'}
                  >
                    View History
                  </Button>
                  <Button
                    variant="outline"
                    iconName="Upload"
                    onClick={() => window.location.href = '/bulk-pdf-upload'}
                  >
                    Bulk Upload
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Upload & Progress */}
              <div className="xl:col-span-1 space-y-6">
                {/* File Upload */}
                <CertificateUpload
                  onFileUpload={handleFileUpload}
                  uploadedFile={uploadedFile}
                  isProcessing={isProcessing}
                />

                {/* Verification Progress or Result Card */}
                {uploadedFile && (
                  <>
                    {/* Show progress during verification */}
                    {(isProcessing || currentStep !== 'upload') && !verificationResults && (
                      <EnhancedVerificationProgress
                        currentStep={currentStep}
                        isProcessing={isProcessing}
                        steps={pipelineSteps}
                        pipelineType={pipelineType}
                      />
                    )}
                    
                    {/* Show result card after verification completes */}
                    {verificationResults && (
                      <VerificationResultCard results={verificationResults} />
                    )}
                  </>
                )}

                {/* Performance Monitor */}
                {isProcessing && processingStartTime && (
                  <PerformanceMonitor
                    startTime={processingStartTime}
                    isProcessing={isProcessing}
                    pipelineType={pipelineType}
                  />
                )}

              </div>

              {/* Right Column - Document Analysis */}
              <div className="xl:col-span-2">
                {uploadedFile ? (
                  <div className="space-y-6">
                    {/* Show tabs only after verification is complete */}
                    {verificationResults ? (
                      <>
                        {/* Debug: Log verification results for tabs */}
                        {console.log('Rendering tabs with verificationResults:', verificationResults)}
                        {/* Panel Selector */}
                        <div className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-center space-x-1 overflow-x-auto">
                            {getPanels()?.map((panel) => (
                              <button
                                key={panel?.id}
                                onClick={() => setSelectedPanel(panel?.id)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                  selectedPanel === panel?.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                              >
                                <Icon name={panel?.icon} size={16} />
                                <span>{panel?.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Panel Content */}
                        {selectedPanel === 'document' && (
                          <CertificateViewer
                            file={uploadedFile}
                            ocrData={ocrData}
                            onAnnotate={(annotation) => console.log('Annotation added:', annotation)}
                          />
                        )}

                        {selectedPanel === 'results' && verificationResults && (
                          <>
                        {verificationResults.pipeline === 'signature' && (
                          <>
                            {console.log('Rendering SignatureVerificationResults with:', verificationResults)}
                            <SignatureVerificationResults
                              results={verificationResults}
                            />
                          </>
                        )}
                        {verificationResults.pipeline === 'qr' && (
                          <QRVerificationResults
                            results={verificationResults}
                          />
                        )}
                        {verificationResults.pipeline === 'legacy' && (
                          <>
                            {console.log('Rendering LegacyVerificationResults with:', verificationResults)}
                            <LegacyVerificationResults
                              results={verificationResults}
                            />
                          </>
                        )}
                        {verificationResults.pipeline === 'blockchain' && (
                          <>
                            {console.log('Rendering BlockchainVerificationResults with:', verificationResults)}
                            <BlockchainVerificationResults
                              results={verificationResults}
                            />
                          </>
                        )}
                        
                        {verificationResults.pipeline === 'error' && (
                          <VerificationResults
                            results={verificationResults}
                          />
                        )}
                          </>
                        )}
                      </>
                    ) : (
                      /* Show processing message during verification */
                      <div className="bg-card border border-border rounded-lg p-12">
                        <div className="text-center">
                          <div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mx-auto mb-6">
                            <Icon name="Loader" size={40} className="text-primary animate-spin" />
                          </div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">
                            Processing Certificate
                          </h3>
                          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Your certificate is being analyzed. We're extracting text, parsing details, and validating against our database.
                          </p>
                          
                          {/* Processing status indicators */}
                          <div className="flex justify-center space-x-8 mt-8">
                            <div className="flex items-center space-x-2 text-success">
                              <Icon name="Upload" size={16} />
                              <span className="text-sm">File uploaded</span>
                            </div>
                            <div className="flex items-center space-x-2 text-primary">
                              <Icon name="Loader" size={16} className="animate-spin" />
                              <span className="text-sm">OCR running</span>
                            </div>
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Icon name="Shield" size={16} />
                              <span className="text-sm">Verifying...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Empty State */
                  (<div className="bg-card border border-border rounded-lg p-12">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-20 h-20 bg-muted rounded-full mx-auto mb-6">
                        <Icon name="FileText" size={40} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No Certificate Uploaded
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Upload a certificate file to begin the verification process. 
                        Supported formats include PDF, JPG, and PNG files.
                      </p>
                      
                      <div className="flex justify-center">
                        <Button
                          variant="default"
                          iconName="Upload"
                          iconPosition="left"
                          onClick={() => document.getElementById('file-input')?.click()}
                        >
                          Upload Certificate
                        </Button>
                      </div>
                    </div>
                  </div>)
                )}
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 bg-card border border-border rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg flex-shrink-0">
                  <Icon name="HelpCircle" size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Need Help with Verification?</h3>
                  <p className="text-muted-foreground mb-4">
                    Our verification system uses advanced OCR and fraud detection algorithms to analyze certificates. 
                    For best results, ensure your certificate images are clear and well-lit.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="ghost" size="sm" iconName="Book">
                      User Guide
                    </Button>
                    <Button variant="ghost" size="sm" iconName="MessageCircle">
                      Contact Support
                    </Button>
                    <Button variant="ghost" size="sm" iconName="Video">
                      Watch Tutorial
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Floating Notification */}
      <FloatingNotification
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </div>
  );
};

export default CertificateVerification;