import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import UploadHistoryAPI from '../../../utils/uploadHistoryAPI';

const UploadHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const uploadHistoryAPI = new UploadHistoryAPI();

  // Load upload history from API
  useEffect(() => {
    loadUploadHistory();
  }, []);

  // Reload when filters change
  useEffect(() => {
    loadUploadHistory();
  }, [searchQuery, filterStatus, filterType, startDate, endDate]);

  const loadUploadHistory = async () => {
    try {
      setLoading(true);
      const filters = {
        searchQuery,
        status: filterStatus,
        type: filterType,
        startDate,
        endDate
      };
      
      const history = await uploadHistoryAPI.getUploadHistory(filters);
      setUploadHistory(history);
    } catch (error) {
      console.error('Error loading upload history:', error);
      setUploadHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Action handlers
  const handleViewDetails = (item) => {
    console.log('View details for:', item);
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleDownload = (item) => {
    console.log('Download:', item);
    
    // Create a comprehensive report
    const report = {
      fileName: item.fileName,
      uploadTime: item.timestamp,
      fileSize: item.fileSize ? `${(item.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
      processingType: item.fileType,
      status: item.status,
      verifiedAt: item.verifiedAt,
      processingDetails: item.processingDetails,
      technicalDetails: item.originalResult
    };
    
    // Convert to JSON string
    const reportJson = JSON.stringify(report, null, 2);
    
    // Create and download the file
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.fileName}_verification_report.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleRetry = (item) => {
    console.log('Retry:', item);
    // You can implement retry logic here
    alert(`Retry processing for ${item.fileName} would be implemented here`);
  };

  const handleExportHistory = async () => {
    try {
      const csvContent = uploadHistoryAPI.exportHistoryAsCSV();
      if (csvContent) {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `upload_history_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert('No data to export');
      }
    } catch (error) {
      console.error('Error exporting history:', error);
      alert('Failed to export history');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid':
      case 'verified':
        return <Icon name="CheckCircle" size={16} className="text-success" />;
      case 'invalid':
      case 'mismatch':
        return <Icon name="XCircle" size={16} className="text-error" />;
      default:
        return <Icon name="Circle" size={16} className="text-muted-foreground" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'valid':
      case 'verified':
        return 'Success';
      case 'invalid':
      case 'mismatch':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid':
      case 'verified':
        return 'bg-success/10 text-success border-success/20';
      case 'invalid':
      case 'mismatch':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getFileTypeIcon = (type) => {
    switch (type) {
      case 'blockchain':
        return 'Link';
      case 'digitalSignature':
        return 'Shield';
      case 'qr':
        return 'QrCode';
      case 'legacy':
        return 'FileText';
      default:
        return 'File';
    }
  };

  const getFileTypeColor = (type) => {
    switch (type) {
      case 'blockchain':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'signature':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'digitalSignature':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'qr':
        return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'legacy':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getFileTypeLabel = (type) => {
    switch (type) {
      case 'blockchain':
        return 'Blockchain';
      case 'signature':
        return 'Digital Signature';
      case 'digitalSignature':
        return 'Digital Signature';
      case 'qr':
        return 'QR Code';
      case 'legacy':
        return 'Legacy';
      default:
        return 'Unknown';
    }
  };

  // History is already filtered by the API, so we use it directly
  const filteredHistory = uploadHistory;

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Upload History</h3>
          <p className="text-muted-foreground mt-1">
            View and manage your previous file upload records and processing results
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            onClick={handleExportHistory}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            iconName="ArrowLeft"
            iconPosition="left"
            onClick={() => window.history.back()}
          >
            ← Back to Upload
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
          <Input
            type="date"
            placeholder="dd-mm-yyyy"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
          <Input
            type="date"
            placeholder="dd-mm-yyyy"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Search Files</label>
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 font-medium text-foreground">Timestamp</th>
                <th className="text-left p-4 font-medium text-foreground">File Name</th>
                <th className="text-left p-4 font-medium text-foreground">Status</th>
                <th className="text-left p-4 font-medium text-foreground">File Type</th>
                <th className="text-left p-4 font-medium text-foreground">Processing Details</th>
                <th className="text-left p-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <Icon name="Loader2" size={20} className="text-primary animate-spin" />
                      <span className="text-muted-foreground">Loading upload history...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="space-y-2">
                      <Icon name="FileText" size={48} className="text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">No upload history found</p>
                      <p className="text-sm text-muted-foreground">
                        Upload some PDF certificates to see them here
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedHistory.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-mono text-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Icon name={getFileTypeIcon(item.fileType)} size={16} className="text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{item.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.fileSize ? `${(item.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1">{getStatusText(item.status)}</span>
                      </span>
                    </td>
                    
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getFileTypeColor(item.fileType)}`}>
                        {getFileTypeLabel(item.fileType)}
                      </span>
                    </td>
                    
                    <td className="p-4">
                      <p className="text-sm text-muted-foreground max-w-xs truncate">
                        {item.processingDetails}
                      </p>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Eye"
                          onClick={() => handleViewDetails(item)}
                          className="text-muted-foreground hover:text-foreground"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Download"
                          onClick={() => handleDownload(item)}
                          className="text-muted-foreground hover:text-foreground"
                        />
                        {item.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="RefreshCw"
                            onClick={() => handleRetry(item)}
                            className="text-muted-foreground hover:text-foreground"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredHistory.length)} of {filteredHistory.length} results
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-border rounded text-sm bg-background text-foreground"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              ←
            </Button>
            
            <span className="text-sm text-foreground">
              {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              →
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Go to page:</span>
              <Input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => setCurrentPage(Math.max(1, Math.min(totalPages, Number(e.target.value))))}
                className="w-16 text-center"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Details Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <Icon name="FileText" size={24} className="text-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Certificate Details</h2>
                  <p className="text-sm text-muted-foreground">View detailed verification results</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                onClick={handleCloseModal}
                className="text-muted-foreground hover:text-foreground"
              />
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* File Information */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-medium text-foreground mb-3">File Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">File Name:</span>
                    <p className="font-medium text-foreground">{selectedItem.fileName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">File Size:</span>
                    <p className="font-medium text-foreground">
                      {selectedItem.fileSize ? `${(selectedItem.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Upload Time:</span>
                    <p className="font-medium text-foreground">
                      {new Date(selectedItem.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Processing Type:</span>
                    <p className="font-medium text-foreground capitalize">{selectedItem.fileType}</p>
                  </div>
                </div>
              </div>

              {/* Verification Results */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-medium text-foreground mb-3">Verification Results</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedItem.status)}`}>
                      {getStatusIcon(selectedItem.status)}
                      <span className="ml-1">{getStatusText(selectedItem.status)}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Verified At:</span>
                    <span className="font-medium text-foreground">
                      {selectedItem.verifiedAt ? new Date(selectedItem.verifiedAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Processing Details */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-medium text-foreground mb-3">Processing Details</h3>
                <div className="bg-background border border-border rounded-md p-3">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {selectedItem.processingDetails || 'No additional details available'}
                  </p>
                </div>
              </div>

              {/* Original Result (if available) */}
              {selectedItem.originalResult && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-medium text-foreground mb-3">Technical Details</h3>
                  <div className="bg-background border border-border rounded-md p-3">
                    <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
                      {JSON.stringify(selectedItem.originalResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
              <Button
                variant="outline"
                onClick={handleCloseModal}
              >
                Close
              </Button>
              <Button
                variant="default"
                iconName="Download"
                onClick={() => handleDownload(selectedItem)}
              >
                Download Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadHistory;
