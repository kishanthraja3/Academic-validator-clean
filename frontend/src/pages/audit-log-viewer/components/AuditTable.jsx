import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AuditTable = ({ 
  auditLogs = [], 
  onExport = () => {},
  onFlagSuspicious = () => {},
  searchTerm = '',
  className = ''
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedRows, setSelectedRows] = useState(new Set());

  const toggleRowExpansion = (logId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded?.has(logId)) {
      newExpanded?.delete(logId);
    } else {
      newExpanded?.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const toggleRowSelection = (logId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected?.has(logId)) {
      newSelected?.delete(logId);
    } else {
      newSelected?.add(logId);
    }
    setSelectedRows(newSelected);
  };

  const selectAllRows = () => {
    if (selectedRows?.size === auditLogs?.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(auditLogs.map(log => log.id)));
    }
  };

  const getStatusColor = (outcome) => {
    switch (outcome?.toLowerCase()) {
      case 'valid': return 'text-success';
      case 'invalid': return 'text-error';
      case 'suspect': return 'text-warning';
      case 'pending': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'verify': return 'Shield';
      case 'upload': return 'Upload';
      case 'revoke': return 'XCircle';
      case 'approve': return 'CheckCircle';
      case 'reject': return 'X';
      case 'flag': return 'Flag';
      default: return 'Activity';
    }
  };

  const highlightSearchTerm = (text, term) => {
    if (!term || !text) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text?.split(regex);
    return parts?.map((part, index) => 
      regex?.test(part) ? 
        <mark key={index} className="bg-accent/30 text-accent-foreground">{part}</mark> : 
        part
    );
  };

  const handleBulkExport = () => {
    const selectedLogs = auditLogs?.filter(log => selectedRows?.has(log?.id));
    onExport(selectedLogs);
  };

  const handleBulkFlag = () => {
    const selectedLogs = auditLogs?.filter(log => selectedRows?.has(log?.id));
    onFlagSuspicious(selectedLogs);
  };

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Table Header Actions */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedRows?.size === auditLogs?.length && auditLogs?.length > 0}
              onChange={selectAllRows}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">
              {selectedRows?.size > 0 ? `${selectedRows?.size} selected` : 'Select all'}
            </span>
          </div>
          {selectedRows?.size > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                iconPosition="left"
                onClick={handleBulkExport}
              >
                Export Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Flag"
                iconPosition="left"
                onClick={handleBulkFlag}
              >
                Flag Suspicious
              </Button>
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {auditLogs?.length} total entries
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <span className="sr-only">Select</span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                User
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Action
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Certificate
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Outcome
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Institution
              </th>
              <th className="w-12 px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {auditLogs?.map((log) => (
              <React.Fragment key={log?.id}>
                <tr className="hover:bg-muted/30 transition-colors duration-150">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows?.has(log?.id)}
                      onChange={() => toggleRowSelection(log?.id)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-foreground font-mono">
                      {log?.timestamp}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {log?.date}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        {log?.user?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {highlightSearchTerm(log?.user?.name, searchTerm)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log?.user?.role} • {log?.user?.institution}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name={getActionIcon(log?.action)} 
                        size={16} 
                        className="text-muted-foreground"
                      />
                      <span className="text-sm text-foreground">
                        {highlightSearchTerm(log?.action, searchTerm)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-foreground">
                      {highlightSearchTerm(log?.certificate?.id, searchTerm)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {log?.certificate?.type}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      log?.outcome === 'Valid' ? 'bg-success/10 text-success' :
                      log?.outcome === 'Invalid' ? 'bg-error/10 text-error' :
                      log?.outcome === 'Suspect'? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                    }`}>
                      {log?.outcome}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-foreground">
                      {log?.institution}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleRowExpansion(log?.id)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-150"
                    >
                      <Icon 
                        name={expandedRows?.has(log?.id) ? "ChevronUp" : "ChevronDown"} 
                        size={16}
                      />
                    </button>
                  </td>
                </tr>
                
                {/* Expanded Row Details */}
                {expandedRows?.has(log?.id) && (
                  <tr>
                    <td colSpan="8" className="px-4 py-4 bg-muted/20">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Technical Details */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-foreground">Technical Details</h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Session ID:</span>
                              <span className="font-mono text-foreground">{log?.sessionId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">IP Address:</span>
                              <span className="font-mono text-foreground">{log?.ipAddress}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">User Agent:</span>
                              <span className="text-foreground truncate max-w-48" title={log?.userAgent}>
                                {log?.userAgent}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Processing Time:</span>
                              <span className="text-foreground">{log?.processingTime}ms</span>
                            </div>
                          </div>
                        </div>

                        {/* Verification Details */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-foreground">Verification Details</h4>
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Reasoning:</span>
                              <p className="text-foreground mt-1">
                                {highlightSearchTerm(log?.reasoning, searchTerm)}
                              </p>
                            </div>
                            {log?.beforeState && (
                              <div>
                                <span className="text-muted-foreground">Before State:</span>
                                <pre className="text-foreground mt-1 bg-muted p-2 rounded text-xs overflow-x-auto">
                                  {JSON.stringify(log?.beforeState, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log?.afterState && (
                              <div>
                                <span className="text-muted-foreground">After State:</span>
                                <pre className="text-foreground mt-1 bg-muted p-2 rounded text-xs overflow-x-auto">
                                  {JSON.stringify(log?.afterState, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          iconName="Flag"
                          iconPosition="left"
                          onClick={() => onFlagSuspicious([log])}
                        >
                          Flag Suspicious
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          iconName="Download"
                          iconPosition="left"
                          onClick={() => onExport([log])}
                        >
                          Export Entry
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {/* Empty State */}
      {auditLogs?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Icon name="FileText" size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No audit logs found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            No audit entries match your current filters. Try adjusting your search criteria or date range.
          </p>
        </div>
      )}
    </div>
  );
};

export default AuditTable;