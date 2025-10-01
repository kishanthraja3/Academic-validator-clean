import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickVerificationPanel = ({ onFileUpload, isProcessing = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFiles(e?.dataTransfer?.files);
    }
  };

  const handleChange = (e) => {
    e?.preventDefault();
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFiles(e?.target?.files);
    }
  };

  const handleFiles = (files) => {
    const file = files?.[0];
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    
    if (!allowedTypes?.includes(file?.type)) {
      alert('Please upload only PDF or image files (JPEG, PNG)');
      return;
    }

    if (file?.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onFileUpload(file);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const onButtonClick = () => {
    fileInputRef?.current?.click();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Quick Certificate Verification</h2>
        <Icon name="Shield" size={20} className="text-primary" />
      </div>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleChange}
          disabled={isProcessing}
        />
        
        {isProcessing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary/10 rounded-full">
              <Icon name="FileText" size={32} className="text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Processing Certificate...</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">OCR extraction in progress</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-muted rounded-full">
              <Icon name="Upload" size={32} className="text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-foreground">
                Drop certificate here or click to upload
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, JPEG, PNG files up to 10MB
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={onButtonClick}
              iconName="FolderOpen"
              iconPosition="left"
            >
              Choose File
            </Button>
          </div>
        )}
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Icon name="FileText" size={16} />
          <span>PDF & Images</span>
        </div>
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Icon name="Zap" size={16} />
          <span>OCR Processing</span>
        </div>
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Icon name="Shield" size={16} />
          <span>Instant Verification</span>
        </div>
      </div>
    </div>
  );
};

export default QuickVerificationPanel;