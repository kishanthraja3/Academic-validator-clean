import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const OCREditor = ({ ocrData, onDataChange, isEditable = true }) => {
  const [editedData, setEditedData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const mockOCRFields = [
    {
      id: 'studentName',
      label: 'Student Name',
      value: 'Rajesh Kumar Singh',
      confidence: 0.95,
      type: 'text'
    },
    {
      id: 'institutionName',
      label: 'Institution Name',
      value: 'Ranchi University',
      confidence: 0.92,
      type: 'text'
    },
    {
      id: 'courseName',
      label: 'Course Name',
      value: 'Bachelor of Computer Applications',
      confidence: 0.88,
      type: 'text'
    },
    {
      id: 'degreeType',
      label: 'Degree Type',
      value: 'Bachelor\'s Degree',
      confidence: 0.90,
      type: 'select',
      options: ['Bachelor\'s Degree', 'Master\'s Degree', 'Diploma', 'Certificate']
    },
    {
      id: 'graduationDate',
      label: 'Graduation Date',
      value: '2023-05-15',
      confidence: 0.85,
      type: 'date'
    },
    {
      id: 'registrationNumber',
      label: 'Registration Number',
      value: 'RU/BCA/2023/001234',
      confidence: 0.93,
      type: 'text'
    },
    {
      id: 'grade',
      label: 'Grade/CGPA',
      value: '8.5',
      confidence: 0.87,
      type: 'number'
    },
    {
      id: 'issueDate',
      label: 'Issue Date',
      value: '2023-06-20',
      confidence: 0.91,
      type: 'date'
    }
  ];

  const fields = ocrData?.fields || mockOCRFields;

  useEffect(() => {
    const initialData = {};
    fields?.forEach(field => {
      initialData[field.id] = field?.value;
    });
    setEditedData(initialData);
  }, [fields]);

  const handleFieldChange = (fieldId, value) => {
    setEditedData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    onDataChange && onDataChange(editedData);
    setHasChanges(false);
  };

  const handleResetChanges = () => {
    const initialData = {};
    fields?.forEach(field => {
      initialData[field.id] = field?.value;
    });
    setEditedData(initialData);
    setHasChanges(false);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-success';
    if (confidence >= 0.7) return 'text-warning';
    return 'text-error';
  };

  const getConfidenceBg = (confidence) => {
    if (confidence >= 0.9) return 'bg-success/10';
    if (confidence >= 0.7) return 'bg-warning/10';
    return 'bg-error/10';
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-muted rounded transition-colors duration-150"
          >
            <Icon 
              name={isExpanded ? "ChevronDown" : "ChevronRight"} 
              size={16} 
              className="text-muted-foreground"
            />
          </button>
          <h3 className="font-medium text-foreground">Extracted Text Fields</h3>
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
            {fields?.length} fields
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetChanges}
                iconName="RotateCcw"
              >
                Reset
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveChanges}
                iconName="Save"
              >
                Save Changes
              </Button>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            iconName="Download"
          >
            Export
          </Button>
        </div>
      </div>
      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Confidence Summary */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground">OCR Confidence Summary</h4>
              <div className="flex items-center space-x-2">
                <Icon name="Eye" size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Avg: {Math.round(fields?.reduce((acc, field) => acc + field?.confidence, 0) / fields?.length * 100)}%
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-semibold text-success">
                  {fields?.filter(f => f?.confidence >= 0.9)?.length}
                </div>
                <div className="text-muted-foreground">High Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-warning">
                  {fields?.filter(f => f?.confidence >= 0.7 && f?.confidence < 0.9)?.length}
                </div>
                <div className="text-muted-foreground">Medium Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-error">
                  {fields?.filter(f => f?.confidence < 0.7)?.length}
                </div>
                <div className="text-muted-foreground">Low Confidence</div>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            {fields?.map((field) => (
              <div key={field?.id} className="flex items-start space-x-4 p-4 border border-border rounded-lg">
                <div className="flex-1">
                  {field?.type === 'select' ? (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {field?.label}
                      </label>
                      <select
                        value={editedData?.[field?.id] || field?.value}
                        onChange={(e) => handleFieldChange(field?.id, e?.target?.value)}
                        disabled={!isEditable}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {field?.options?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <Input
                      label={field?.label}
                      type={field?.type}
                      value={editedData?.[field?.id] || field?.value}
                      onChange={(e) => handleFieldChange(field?.id, e?.target?.value)}
                      disabled={!isEditable}
                      className="w-full"
                    />
                  )}
                </div>
                
                <div className="flex flex-col items-end space-y-2 min-w-[100px]">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBg(field?.confidence)}`}>
                    <span className={getConfidenceColor(field?.confidence)}>
                      {Math.round(field?.confidence * 100)}%
                    </span>
                  </div>
                  
                  {field?.confidence < 0.8 && (
                    <div className="flex items-center space-x-1 text-warning">
                      <Icon name="AlertTriangle" size={12} />
                      <span className="text-xs">Review</span>
                    </div>
                  )}
                  
                  {editedData?.[field?.id] !== field?.value && (
                    <div className="flex items-center space-x-1 text-primary">
                      <Icon name="Edit" size={12} />
                      <span className="text-xs">Modified</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={14} />
                <span>Last updated: {new Date()?.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Zap" size={14} />
                <span>Auto-save enabled</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="RefreshCw"
              >
                Re-extract
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconName="Copy"
              >
                Copy All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OCREditor;