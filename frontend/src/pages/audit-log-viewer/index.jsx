import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FilterControls from './components/FilterControls';
import AuditTable from './components/AuditTable';
import AuditSummary from './components/AuditSummary';
import ExportModal from './components/ExportModal';
import Icon from '../../components/AppIcon';


const AuditLogViewer = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('logs'); // 'logs' or 'summary'
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [summaryData, setSummaryData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Mock user data
  const currentUser = {
    name: "Dr. Rajesh Kumar",
    role: "Department Admin",
    institution: "Jharkhand Education Department"
  };

  // Mock notifications
  const notifications = [
    {
      title: "Suspicious Activity Detected",
      message: "Multiple failed verification attempts from same IP",
      time: "5 minutes ago",
      type: "warning",
      read: false
    },
    {
      title: "Bulk Export Completed",
      message: "Your audit report has been generated successfully",
      time: "1 hour ago",
      type: "success",
      read: false
    },
    {
      title: "System Maintenance",
      message: "Scheduled maintenance window tonight 2:00-4:00 AM",
      time: "3 hours ago",
      type: "info",
      read: true
    }
  ];

  // Mock audit logs data
  const mockAuditLogs = [
    {
      id: "AUD-2025-001247",
      timestamp: "13:45:23",
      date: "07 Sep 2025",
      user: {
        name: "Dr. Priya Sharma",
        role: "Verifier",
        institution: "Ranchi University"
      },
      action: "Verify",
      certificate: {
        id: "CERT-RU-2024-8901",
        type: "Bachelor of Engineering"
      },
      outcome: "Valid",
      institution: "Ranchi University",
      reasoning: "Certificate verified successfully against university registry. All security features validated including digital signature, QR code, and watermark authentication.",
      sessionId: "SES-789456123",
      ipAddress: "192.168.1.45",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      processingTime: 1247,
      beforeState: { status: "pending", verifier: null },
      afterState: { status: "verified", verifier: "Dr. Priya Sharma", timestamp: "2025-09-07T13:45:23Z" }
    },
    {
      id: "AUD-2025-001246",
      timestamp: "13:42:15",
      date: "07 Sep 2025",
      user: {
        name: "Prof. Amit Singh",
        role: "Institution Admin",
        institution: "BIT Mesra"
      },
      action: "Upload",
      certificate: {
        id: "CERT-BIT-2024-5678",
        type: "Master of Technology"
      },
      outcome: "Pending",
      institution: "BIT Mesra",
      reasoning: "Certificate uploaded successfully. Awaiting verification by authorized personnel. Document integrity check passed.",
      sessionId: "SES-456789012",
      ipAddress: "10.0.0.23",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      processingTime: 892,
      beforeState: null,
      afterState: { status: "uploaded", uploader: "Prof. Amit Singh", timestamp: "2025-09-07T13:42:15Z" }
    },
    {
      id: "AUD-2025-001245",
      timestamp: "13:38:47",
      date: "07 Sep 2025",
      user: {
        name: "Dr. Sunita Devi",
        role: "Verifier",
        institution: "NIT Jamshedpur"
      },
      action: "Flag",
      certificate: {
        id: "CERT-FAKE-2024-9999",
        type: "Bachelor of Science"
      },
      outcome: "Suspect",
      institution: "Unknown Institution",
      reasoning: "Certificate flagged as suspicious due to inconsistent formatting, invalid QR code, and institution not found in verified registry. Potential forgery detected.",
      sessionId: "SES-123456789",
      ipAddress: "203.192.45.67",
      userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
      processingTime: 2156,
      beforeState: { status: "pending", flags: 0 },
      afterState: { status: "flagged", flags: 1, flagger: "Dr. Sunita Devi", timestamp: "2025-09-07T13:38:47Z" }
    },
    {
      id: "AUD-2025-001244",
      timestamp: "13:35:12",
      date: "07 Sep 2025",
      user: {
        name: "Mr. Ravi Gupta",
        role: "Department Admin",
        institution: "Jharkhand Education Department"
      },
      action: "Approve",
      certificate: {
        id: "CERT-KU-2024-3456",
        type: "Master of Arts"
      },
      outcome: "Valid",
      institution: "Kolhan University",
      reasoning: "Certificate approved after thorough verification. All institutional checks passed. Student records confirmed in university database.",
      sessionId: "SES-987654321",
      ipAddress: "172.16.0.10",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      processingTime: 1567,
      beforeState: { status: "verified", approver: null },
      afterState: { status: "approved", approver: "Mr. Ravi Gupta", timestamp: "2025-09-07T13:35:12Z" }
    },
    {
      id: "AUD-2025-001243",
      timestamp: "13:31:58",
      date: "07 Sep 2025",
      user: {
        name: "Dr. Meera Jha",
        role: "Verifier",
        institution: "Sido Kanhu Murmu University"
      },
      action: "Verify",
      certificate: {
        id: "CERT-SKMU-2024-7890",
        type: "Bachelor of Commerce"
      },
      outcome: "Invalid",
      institution: "Sido Kanhu Murmu University",
      reasoning: "Certificate verification failed. Discrepancies found in student enrollment records. Grade tampering detected in original transcript.",
      sessionId: "SES-654321098",
      ipAddress: "192.168.100.15",
      userAgent: "Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15",
      processingTime: 3245,
      beforeState: { status: "pending", verifier: null },
      afterState: { status: "rejected", verifier: "Dr. Meera Jha", timestamp: "2025-09-07T13:31:58Z" }
    }
  ];

  // Mock summary data
  const mockSummaryData = {
    dailyActivity: [
      { date: '07 Sep', activities: 1247, verifications: 892, uploads: 234, flags: 3 },
      { date: '06 Sep', activities: 1156, verifications: 823, uploads: 198, flags: 5 },
      { date: '05 Sep', activities: 1089, verifications: 756, uploads: 267, flags: 2 },
      { date: '04 Sep', activities: 1234, verifications: 889, uploads: 223, flags: 4 },
      { date: '03 Sep', activities: 1178, verifications: 834, uploads: 201, flags: 1 },
      { date: '02 Sep', activities: 1067, verifications: 723, uploads: 189, flags: 6 },
      { date: '01 Sep', activities: 1145, verifications: 798, uploads: 234, flags: 2 }
    ],
    actionBreakdown: [
      { name: 'Verify', value: 892, percentage: 71.6 },
      { name: 'Upload', value: 234, percentage: 18.8 },
      { name: 'Approve', value: 89, percentage: 7.1 },
      { name: 'Revoke', value: 23, percentage: 1.8 },
      { name: 'Flag', value: 9, percentage: 0.7 }
    ],
    performanceMetrics: [
      { time: '00:00', responseTime: 245, throughput: 89, errors: 0 },
      { time: '04:00', responseTime: 198, throughput: 67, errors: 1 },
      { time: '08:00', responseTime: 312, throughput: 156, errors: 0 },
      { time: '12:00', responseTime: 289, throughput: 234, errors: 2 },
      { time: '16:00', responseTime: 267, throughput: 198, errors: 1 },
      { time: '20:00', responseTime: 234, throughput: 123, errors: 0 }
    ],
    userActivity: [
      { name: 'Dr. Rajesh Kumar', role: 'Verifier', institution: 'Ranchi University', activities: 156, trend: '+12%' },
      { name: 'Prof. Sunita Devi', role: 'Institution Admin', institution: 'BIT Mesra', activities: 134, trend: '+8%' },
      { name: 'Mr. Amit Singh', role: 'Department Admin', institution: 'NIT Jamshedpur', activities: 98, trend: '+15%' },
      { name: 'Dr. Priya Sharma', role: 'Verifier', institution: 'Kolhan University', activities: 87, trend: '+5%' },
      { name: 'Prof. Ravi Gupta', role: 'Institution Admin', institution: 'Jharkhand University', activities: 76, trend: '+3%' }
    ],
    systemHealth: {
      todayActivities: 1247,
      activeUsers: 89,
      suspiciousActivities: 3,
      uptime: '99.8%'
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/verifier-dashboard' },
    { label: 'Audit & Compliance', path: '/audit-log-viewer' },
    { label: 'Audit Log Viewer' }
  ];

  // Initialize data
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAuditLogs(mockAuditLogs);
      setSummaryData(mockSummaryData);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter audit logs based on search and filters
  const filteredLogs = auditLogs?.filter(log => {
    if (searchTerm) {
      const searchLower = searchTerm?.toLowerCase();
      const matchesSearch = 
        log?.user?.name?.toLowerCase()?.includes(searchLower) ||
        log?.action?.toLowerCase()?.includes(searchLower) ||
        log?.certificate?.id?.toLowerCase()?.includes(searchLower) ||
        log?.reasoning?.toLowerCase()?.includes(searchLower) ||
        log?.institution?.toLowerCase()?.includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Apply other filters
    if (filters?.action && log?.action?.toLowerCase() !== filters?.action?.toLowerCase()) return false;
    if (filters?.outcome && log?.outcome?.toLowerCase() !== filters?.outcome?.toLowerCase()) return false;
    if (filters?.institution && log?.institution?.toLowerCase() !== filters?.institution?.toLowerCase()) return false;
    if (filters?.user && !log?.user?.name?.toLowerCase()?.includes(filters?.user?.toLowerCase())) return false;

    return true;
  });

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleExportAll = () => {
    setSelectedLogs(filteredLogs);
    setIsExportModalOpen(true);
  };

  const handleExportSelected = (logs) => {
    setSelectedLogs(logs);
    setIsExportModalOpen(true);
  };

  const handleExport = (config) => {
    console.log('Exporting with config:', config);
    // Simulate export process
    alert(`Exporting ${config?.dateRange === 'selected' ? selectedLogs?.length : filteredLogs?.length} audit entries as ${config?.format?.toUpperCase()}`);
  };

  const handleScheduleReport = () => {
    alert('Schedule Report feature will open a modal to configure automated audit reports');
  };

  const handleFlagSuspicious = (logs) => {
    console.log('Flagging suspicious activities:', logs);
    alert(`Flagged ${logs?.length} entries as suspicious for investigation`);
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          user={currentUser}
          notifications={notifications}
          onLogout={handleLogout}
        />
        <div className="flex">
          <Sidebar 
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          <main className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading audit logs...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={currentUser}
        notifications={notifications}
        onLogout={handleLogout}
        onSearch={handleSearch}
      />
      <div className="flex">
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        
        <main className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <Breadcrumb items={breadcrumbItems} />
                <h1 className="text-2xl font-bold text-foreground mt-2">Audit Log Viewer</h1>
                <p className="text-muted-foreground">
                  Track and analyze all verification activities with comprehensive audit trails
                </p>
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setActiveView('logs')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeView === 'logs' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name="FileText" size={16} />
                  <span>Audit Logs</span>
                </button>
                <button
                  onClick={() => setActiveView('summary')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeView === 'summary' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name="BarChart3" size={16} />
                  <span>Summary</span>
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            <FilterControls
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              onExportAll={handleExportAll}
              onScheduleReport={handleScheduleReport}
              totalResults={filteredLogs?.length}
            />

            {/* Content */}
            {activeView === 'logs' ? (
              <AuditTable
                auditLogs={filteredLogs}
                onExport={handleExportSelected}
                onFlagSuspicious={handleFlagSuspicious}
                searchTerm={searchTerm}
              />
            ) : (
              <AuditSummary summaryData={summaryData} />
            )}
          </div>
        </main>
      </div>
      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        selectedLogs={selectedLogs}
        totalLogs={filteredLogs?.length}
      />
    </div>
  );
};

export default AuditLogViewer;