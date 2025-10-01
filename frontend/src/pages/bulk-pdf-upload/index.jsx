import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

// Import components
import BulkPDFUploadArea from './components/BulkPDFUploadArea';
import ProcessingProgress from './components/ProcessingProgress';
import CertificateCategories from './components/CertificateCategories';
import UploadHistory from './components/UploadHistory';
import UploadHistoryAPI from '../../utils/uploadHistoryAPI';
import FloatingNotification from '../../components/ui/FloatingNotification';
import { verificationStatsService } from '../../utils/verificationStats';

const BulkPDFUpload = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [categoryStats, setCategoryStats] = useState({
    blockchain: 0,
    digitalSignature: 0,
    qr: 0,
    legacy: 0
  });
  const [processingStartTime, setProcessingStartTime] = useState(null);
  const [notification, setNotification] = useState({ isVisible: false, message: '', type: 'success' });
  const uploadHistoryAPI = new UploadHistoryAPI();

  // Notification handlers
  const showNotification = (message, type = 'success') => {
    setNotification({ isVisible: true, message, type });
  };

  const hideNotification = () => {
    setNotification({ isVisible: false, message: '', type: 'success' });
  };

  const handleEmailSent = (emailData) => {
    showNotification(
      `Email sent to ${emailData.institution} (${emailData.email}) regarding tampered certificate: ${emailData.fileName}`,
      'success'
    );
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/verifier-dashboard' },
    { label: 'Bulk PDF Upload', path: '/bulk-pdf-upload' }
  ];

  const mockUser = {
    name: 'Dr. Rajesh Kumar',
    role: 'Senior Verifier',
    institution: 'Jharkhand Education Department'
  };

  const mockNotifications = [
    {
      title: 'Bulk Upload Complete',
      message: '25 PDF certificates processed successfully',
      time: '2 minutes ago',
      type: 'success',
      read: false
    },
    {
      title: 'Processing Error',
      message: '3 certificates failed verification',
      time: '5 minutes ago',
      type: 'warning',
      read: false
    }
  ];

  const handleFileUpload = (files) => {
    setUploadedFiles(files);
    setIsProcessing(true);
    setProcessingStartTime(Date.now());
    setProcessingResults(null);
    setCategoryStats({
      blockchain: 0,
      digitalSignature: 0,
      qr: 0,
      legacy: 0
    });
  };

  const handleProcessingComplete = async (results) => {
    setIsProcessing(false);
    
    // Calculate category statistics
    const stats = {
      blockchain: 0,
      digitalSignature: 0,
      qr: 0,
      legacy: 0
    };
    
      results.results.forEach(result => {
        if (result.result) {
          // Map backend pipeline to our category system
          const pipeline = result.result.pipeline || result.result.verificationType;
          if (pipeline === 'blockchain') stats.blockchain++;
          else if (pipeline === 'signature') stats.digitalSignature++;
          else if (pipeline === 'qr') stats.qr++;
          else if (pipeline === 'legacy') stats.legacy++;
        }
      });
    
    setCategoryStats(stats);
    
    // Format results for display
    const formattedResults = {
      total: results.totalProcessed,
      verified: results.successful,
      failed: results.failed,
      remaining: 0,
      processingTime: formatProcessingTime(),
      results: results.results.map(result => ({
        id: result.id,
        fileName: result.fileName,
        status: result.result?.status || result.result?.originalResult?.status || 'invalid', // Use exact backend status
        category: result.result?.pipeline || result.result?.verificationType || result.type,
        processingDetails: result.result?.details || result.result?.message || result.error || 'Processing completed',
        score: result.result?.score || 0,
        verifiedAt: result.result?.verifiedAt || result.processingCompletedAt,
        pipeline: result.result?.pipeline,
        originalResult: result.result?.originalResult
      }))
    };
    
    setProcessingResults(formattedResults);
    
    // Update verification statistics for bulk upload
    const bulkResults = formattedResults.results.map(result => ({
      status: result.status,
      pipeline: result.pipeline || result.category,
      fileName: result.fileName
    }));
    verificationStatsService.recordBulkVerification(bulkResults);
    
    // Store results in upload history
    try {
      const uploadSession = {
        id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        totalFiles: results.totalProcessed,
        results: formattedResults.results,
        processingTime: formatProcessingTime(),
        categoryStats: stats,
        status: results.successful > results.failed ? 'success' : 'failed'
      };
      
      await uploadHistoryAPI.storeUploadResults(uploadSession);
      console.log('Upload results stored in history:', uploadSession.id);
    } catch (error) {
      console.error('Failed to store upload results:', error);
    }
  };

  const formatProcessingTime = () => {
    const start = processingStartTime;
    const end = Date.now();
    const elapsed = Math.floor((end - start) / 1000);
    return `${elapsed}s`;
  };

  const getRandomCategory = () => {
    const categories = ['blockchain', 'digitalSignature', 'qr', 'legacy'];
    const weights = [0.4, 0.3, 0.2, 0.1]; // Priority weights
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < categories.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return categories[i];
      }
    }
    return 'legacy';
  };

  const updateCategoryStats = (results) => {
    const stats = {
      blockchain: 0,
      digitalSignature: 0,
      qr: 0,
      legacy: 0
    };
    
    results.forEach(result => {
      if (result.status === 'verified') {
        stats[result.category]++;
      }
    });
    
    setCategoryStats(stats);
  };

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_data');
      localStorage.removeItem('remember_me');
    } catch (e) {}
    window.location.href = '/login';
  };

  const handleSearch = (query) => {
    console.log('Searching for:', query);
  };

  const tabs = [
    { id: 'upload', label: 'Bulk Upload', icon: 'Upload' },
    { id: 'categories', label: 'Categories', icon: 'Layers' },
    { id: 'history', label: 'Upload History', icon: 'History' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        isCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={mockUser}
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
          <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="space-y-2">
                <Breadcrumb items={breadcrumbItems} />
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    <Icon name="Upload" size={24} className="text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Bulk PDF Upload</h1>
                    <p className="text-muted-foreground">
                      Upload and process multiple PDF certificates simultaneously
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                  onClick={() => console.log('Export results')}
                >
                  Export Results
                </Button>
                <Button
                  variant="default"
                  iconName="FileText"
                  iconPosition="left"
                  onClick={() => handleNavigation('/certificate-verification')}
                >
                  Single Upload
                </Button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-card border border-border rounded-lg">
              <div className="border-b border-border">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                      }`}
                    >
                      <Icon name={tab.icon} size={16} />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'upload' && (
                  <div className="space-y-6">
                    {!isProcessing && !processingResults && (
                      <BulkPDFUploadArea onFileUpload={handleFileUpload} />
                    )}
                    
                    {isProcessing && (
                      <ProcessingProgress 
                        files={uploadedFiles}
                        isProcessing={isProcessing}
                        onComplete={handleProcessingComplete}
                        onEmailSent={handleEmailSent}
                      />
                    )}
                    
                    {processingResults && (
                      <div className="space-y-6">
                        <ProcessingProgress 
                          files={uploadedFiles}
                          isProcessing={false}
                          results={processingResults}
                        />
                        
                        <div className="flex justify-center">
                          <Button
                            variant="default"
                            iconName="RefreshCw"
                            iconPosition="left"
                            onClick={() => {
                              setUploadedFiles([]);
                              setProcessingResults(null);
                              setIsProcessing(false);
                            }}
                          >
                            Upload More Files
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'categories' && (
                  <CertificateCategories 
                    stats={categoryStats}
                    results={processingResults}
                  />
                )}

                {activeTab === 'history' && (
                  <UploadHistory />
                )}
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

export default BulkPDFUpload;
