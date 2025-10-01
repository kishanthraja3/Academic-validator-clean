import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ExportModal = ({ 
  isOpen = false, 
  onClose = () => {},
  onExport = () => {},
  selectedLogs = [],
  totalLogs = 0
}) => {
  const [exportConfig, setExportConfig] = useState({
    format: 'csv',
    includeDetails: true,
    includeMetadata: false,
    dateRange: 'selected',
    filename: `audit-logs-${new Date()?.toISOString()?.split('T')?.[0]}`,
    fields: {
      timestamp: true,
      user: true,
      action: true,
      certificate: true,
      outcome: true,
      institution: true,
      reasoning: false,
      technicalDetails: false
    }
  });

  const formatOptions = [
    { value: 'csv', label: 'CSV (Comma Separated Values)' },
    { value: 'xlsx', label: 'Excel Spreadsheet (.xlsx)' },
    { value: 'json', label: 'JSON (JavaScript Object Notation)' },
    { value: 'pdf', label: 'PDF Report' }
  ];

  const dateRangeOptions = [
    { value: 'selected', label: `Selected entries (${selectedLogs?.length})` },
    { value: 'all', label: `All filtered entries (${totalLogs})` },
    { value: 'today', label: 'Today only' },
    { value: 'week', label: 'Last 7 days' },
    { value: 'month', label: 'Last 30 days' }
  ];

  const handleFieldChange = (field, checked) => {
    setExportConfig(prev => ({
      ...prev,
      fields: {
        ...prev?.fields,
        [field]: checked
      }
    }));
  };

  const handleExport = () => {
    onExport(exportConfig);
    onClose();
  };

  const getEstimatedSize = () => {
    const recordCount = exportConfig?.dateRange === 'selected' ? selectedLogs?.length : totalLogs;
    const fieldsCount = Object.values(exportConfig?.fields)?.filter(Boolean)?.length;
    const avgRecordSize = exportConfig?.format === 'json' ? 500 : 
                         exportConfig?.format === 'pdf' ? 800 : 200;
    const estimatedBytes = recordCount * fieldsCount * avgRecordSize;
    
    if (estimatedBytes < 1024) return `${estimatedBytes} B`;
    if (estimatedBytes < 1024 * 1024) return `${(estimatedBytes / 1024)?.toFixed(1)} KB`;
    return `${(estimatedBytes / (1024 * 1024))?.toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-lg shadow-modal max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Export Audit Logs</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure your export settings and download audit data
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Format */}
          <div>
            <Select
              label="Export Format"
              description="Choose the format for your exported data"
              options={formatOptions}
              value={exportConfig?.format}
              onChange={(value) => setExportConfig(prev => ({ ...prev, format: value }))}
            />
          </div>

          {/* Data Range */}
          <div>
            <Select
              label="Data Range"
              description="Select which audit entries to include"
              options={dateRangeOptions}
              value={exportConfig?.dateRange}
              onChange={(value) => setExportConfig(prev => ({ ...prev, dateRange: value }))}
            />
          </div>

          {/* Filename */}
          <div>
            <Input
              label="Filename"
              description="Name for your exported file (without extension)"
              value={exportConfig?.filename}
              onChange={(e) => setExportConfig(prev => ({ ...prev, filename: e?.target?.value }))}
              placeholder="audit-logs-export"
            />
          </div>

          {/* Fields Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Fields to Include
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Checkbox
                label="Timestamp"
                checked={exportConfig?.fields?.timestamp}
                onChange={(e) => handleFieldChange('timestamp', e?.target?.checked)}
              />
              <Checkbox
                label="User Information"
                checked={exportConfig?.fields?.user}
                onChange={(e) => handleFieldChange('user', e?.target?.checked)}
              />
              <Checkbox
                label="Action Performed"
                checked={exportConfig?.fields?.action}
                onChange={(e) => handleFieldChange('action', e?.target?.checked)}
              />
              <Checkbox
                label="Certificate Details"
                checked={exportConfig?.fields?.certificate}
                onChange={(e) => handleFieldChange('certificate', e?.target?.checked)}
              />
              <Checkbox
                label="Verification Outcome"
                checked={exportConfig?.fields?.outcome}
                onChange={(e) => handleFieldChange('outcome', e?.target?.checked)}
              />
              <Checkbox
                label="Institution"
                checked={exportConfig?.fields?.institution}
                onChange={(e) => handleFieldChange('institution', e?.target?.checked)}
              />
              <Checkbox
                label="Verification Reasoning"
                checked={exportConfig?.fields?.reasoning}
                onChange={(e) => handleFieldChange('reasoning', e?.target?.checked)}
              />
              <Checkbox
                label="Technical Details"
                checked={exportConfig?.fields?.technicalDetails}
                onChange={(e) => handleFieldChange('technicalDetails', e?.target?.checked)}
              />
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Additional Options
            </label>
            <Checkbox
              label="Include detailed verification metadata"
              description="Adds technical details like processing time, IP addresses, and system information"
              checked={exportConfig?.includeMetadata}
              onChange={(e) => setExportConfig(prev => ({ ...prev, includeMetadata: e?.target?.checked }))}
            />
            <Checkbox
              label="Include expandable details"
              description="Adds before/after states and detailed reasoning for each entry"
              checked={exportConfig?.includeDetails}
              onChange={(e) => setExportConfig(prev => ({ ...prev, includeDetails: e?.target?.checked }))}
            />
          </div>

          {/* Export Summary */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">Export Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Records:</span>
                <span className="ml-2 font-medium text-foreground">
                  {exportConfig?.dateRange === 'selected' ? selectedLogs?.length : totalLogs}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Format:</span>
                <span className="ml-2 font-medium text-foreground uppercase">
                  {exportConfig?.format}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Fields:</span>
                <span className="ml-2 font-medium text-foreground">
                  {Object.values(exportConfig?.fields)?.filter(Boolean)?.length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Est. Size:</span>
                <span className="ml-2 font-medium text-foreground">
                  {getEstimatedSize()}
                </span>
              </div>
            </div>
          </div>

          {/* Compliance Notice */}
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <Icon name="Shield" size={20} className="text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-accent">Compliance Notice</h4>
                <p className="text-xs text-accent/80 mt-1">
                  Exported audit data contains sensitive information. Ensure proper handling according to 
                  your organization's data protection policies and applicable regulations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            iconName="Download"
            iconPosition="left"
            onClick={handleExport}
            disabled={Object.values(exportConfig?.fields)?.every(field => !field)}
          >
            Export Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;