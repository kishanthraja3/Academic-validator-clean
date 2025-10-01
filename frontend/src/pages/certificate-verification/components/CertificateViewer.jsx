import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const CertificateViewer = ({ file, ocrData, onAnnotate }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [annotations, setAnnotations] = useState([]);
  const [isAnnotating, setIsAnnotating] = useState(false);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const handleAnnotationClick = (e) => {
    if (!isAnnotating) return;
    
    const rect = e?.currentTarget?.getBoundingClientRect();
    const x = ((e?.clientX - rect?.left) / rect?.width) * 100;
    const y = ((e?.clientY - rect?.top) / rect?.height) * 100;
    
    const newAnnotation = {
      id: Date.now(),
      x,
      y,
      text: `Annotation ${annotations?.length + 1}`,
      type: 'info'
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
    onAnnotate && onAnnotate(newAnnotation);
  };

  const removeAnnotation = (id) => {
    setAnnotations(prev => prev?.filter(ann => ann?.id !== id));
  };

  if (!file) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 h-96 flex items-center justify-center">
        <div className="text-center">
          <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No certificate uploaded</p>
        </div>
      </div>
    );
  }

  const fileUrl = URL.createObjectURL(file);
  const isPDF = file?.type === 'application/pdf';

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Viewer Controls */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-foreground">{file?.name}</h3>
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
            {isPDF ? 'PDF' : 'Image'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-background border border-border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
              iconName="ZoomOut"
            />
            <span className="px-3 py-1 text-sm font-mono text-foreground min-w-[60px] text-center">
              {zoomLevel}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 300}
              iconName="ZoomIn"
            />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetZoom}
            iconName="RotateCcw"
          />
          
          <Button
            variant={isAnnotating ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsAnnotating(!isAnnotating)}
            iconName="MessageSquare"
          >
            Annotate
          </Button>
          
          {isPDF && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = file.name;
                link.click();
              }}
              iconName="Download"
            >
              Download
            </Button>
          )}
        </div>
      </div>
      {/* Document Viewer */}
      <div className="relative overflow-auto h-96 bg-muted/20">
        <div 
          className="relative inline-block min-w-full min-h-full cursor-crosshair"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
          onClick={handleAnnotationClick}
        >
          {isPDF ? (
            <div className="w-full h-full bg-white">
              <iframe
                src={fileUrl}
                className="w-full h-full border-0"
                title="PDF Preview"
                style={{ minHeight: '600px' }}
              />
            </div>
          ) : (
            <Image
              src={fileUrl}
              alt="Certificate"
              className="w-full h-auto"
            />
          )}
          
          {/* Annotations */}
          {annotations?.map((annotation) => (
            <div
              key={annotation?.id}
              className="absolute w-6 h-6 bg-warning rounded-full border-2 border-white shadow-lg cursor-pointer group"
              style={{
                left: `${annotation?.x}%`,
                top: `${annotation?.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={(e) => e?.stopPropagation()}
            >
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-popover border border-border rounded-md p-2 shadow-modal whitespace-nowrap">
                  <p className="text-xs text-popover-foreground">{annotation?.text}</p>
                  <button
                    onClick={() => removeAnnotation(annotation?.id)}
                    className="text-xs text-error hover:text-error/80 mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* File Information */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">File Size</p>
            <p className="font-medium text-foreground">
              {(file?.size / 1024 / 1024)?.toFixed(2)} MB
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Type</p>
            <p className="font-medium text-foreground">{file?.type}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Modified</p>
            <p className="font-medium text-foreground">
              {new Date(file.lastModified)?.toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Annotations</p>
            <p className="font-medium text-foreground">{annotations?.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateViewer;