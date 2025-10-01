import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkPDFUploadArea = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
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
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.length > 0) {
      handleFiles(Array.from(e?.dataTransfer?.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e?.target?.files && e?.target?.files?.length > 0) {
      handleFiles(Array.from(e?.target?.files));
    }
  };

  const handleFiles = (files) => {
    const pdfFiles = files.filter(file => 
      file?.type === 'application/pdf' || file?.name?.toLowerCase()?.endsWith('.pdf')
    );

    if (pdfFiles.length !== files.length) {
      alert('Please upload only PDF files');
      return;
    }

    // Check file sizes (max 50MB per file)
    const oversizedFiles = pdfFiles.filter(file => file?.size > 50 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`Some files exceed 50MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Check total count (max 100 files)
    const totalFiles = selectedFiles.length + pdfFiles.length;
    if (totalFiles > 100) {
      alert('Maximum 100 files allowed per batch');
      return;
    }

    setSelectedFiles(prev => [...prev, ...pdfFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one PDF file');
      return;
    }
    onFileUpload(selectedFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Bulk PDF Certificate Upload
        </h2>
        <p className="text-muted-foreground">
          Upload multiple PDF certificates for batch processing and verification
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full">
            <Icon name="Upload" size={40} className="text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Drag & Drop PDF Files Here
            </h3>
            <p className="text-muted-foreground">
              Or click to browse and select multiple PDF files
            </p>
            <p className="text-sm text-muted-foreground">
              Supports up to 100 PDF files, 50MB each • Maximum batch size: 5GB
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="default"
              iconName="Upload"
              iconPosition="left"
              onClick={() => fileInputRef?.current?.click()}
            >
              Choose PDF Files
            </Button>
            <Button
              variant="outline"
              iconName="FileText"
              iconPosition="left"
              onClick={() => window.open('/sample-bulk-upload.pdf', '_blank')}
            >
              Download Sample
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-foreground">
              Selected Files ({selectedFiles.length})
            </h4>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFiles}
                iconName="Trash2"
              >
                Clear All
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleUpload}
                iconName="Play"
                iconPosition="left"
              >
                Start Processing
              </Button>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                  <div className="flex items-center space-x-3">
                    <Icon name="FileText" size={20} className="text-primary" />
                    <div>
                      <p className="font-medium text-foreground text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    iconName="X"
                    className="text-muted-foreground hover:text-error"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Files:</span>
              <span className="font-medium text-foreground">{selectedFiles.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Size:</span>
              <span className="font-medium text-foreground">
                {formatFileSize(selectedFiles.reduce((total, file) => total + file.size, 0))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start space-x-3 p-4 bg-success/5 border border-success/20 rounded-lg">
          <Icon name="Shield" size={20} className="text-success mt-0.5" />
          <div>
            <h4 className="font-medium text-success mb-1">Secure Upload</h4>
            <p className="text-xs text-muted-foreground">End-to-end encrypted processing</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <Icon name="Zap" size={20} className="text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-primary mb-1">Fast Processing</h4>
            <p className="text-xs text-muted-foreground">Results in seconds</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3 p-4 bg-warning/5 border border-warning/20 rounded-lg">
          <Icon name="Eye" size={20} className="text-warning mt-0.5" />
          <div>
            <h4 className="font-medium text-warning mb-1">OCR Analysis</h4>
            <p className="text-xs text-muted-foreground">Advanced text extraction</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkPDFUploadArea;




