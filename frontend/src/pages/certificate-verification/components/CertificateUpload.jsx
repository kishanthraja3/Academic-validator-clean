import React, { useState, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CertificateUpload = ({ onFileUpload, uploadedFile, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrag = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      const file = e?.dataTransfer?.files?.[0];
      if (validateFile(file)) {
        simulateUpload(file);
      }
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      const file = e?.target?.files?.[0];
      if (validateFile(file)) {
        simulateUpload(file);
      }
    }
  };

  const validateFile = (file) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes?.includes(file?.type)) {
      alert('Please upload a PDF or image file (JPG, PNG)');
      return false;
    }

    if (file?.size > maxSize) {
      alert('File size must be less than 10MB');
      return false;
    }

    return true;
  };

  const simulateUpload = (file) => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Use setTimeout to avoid setState during render
          setTimeout(() => {
            onFileUpload(file);
          }, 0);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const removeFile = () => {
    onFileUpload(null);
    setUploadProgress(0);
  };

  if (uploadedFile) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-lg">
              <Icon name="FileText" size={24} className="text-success" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{uploadedFile?.name}</h3>
              <p className="text-sm text-muted-foreground">
                {(uploadedFile?.size / 1024 / 1024)?.toFixed(2)} MB • Uploaded successfully
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeFile}
            iconName="X"
            disabled={isProcessing}
          >
            Remove
          </Button>
        </div>
        {uploadProgress < 100 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Uploading...</span>
              <span className="text-foreground">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-primary bg-primary/5' :'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full">
            <Icon name="Upload" size={32} className="text-muted-foreground" />
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">
              Upload File
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop your certificate file here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF, JPG, PNG files up to 10MB
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              variant="default"
              iconName="Upload"
              iconPosition="left"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              Choose File
            </Button>
          </div>

          <input
            id="file-input"
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
          />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
          <Icon name="Shield" size={20} className="text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Secure Upload</p>
            <p className="text-xs text-muted-foreground">End-to-end encrypted</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
          <Icon name="Zap" size={20} className="text-warning" />
          <div>
            <p className="text-sm font-medium text-foreground">Fast Processing</p>
            <p className="text-xs text-muted-foreground">Results in seconds</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
          <Icon name="Eye" size={20} className="text-success" />
          <div>
            <p className="text-sm font-medium text-foreground">OCR Analysis</p>
            <p className="text-xs text-muted-foreground">Text extraction</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateUpload;