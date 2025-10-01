import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import MetricsPanel from './components/MetricsPanel';
import RecentVerificationsTable from './components/RecentVerificationsTable';
import QuickActionsPanel from './components/QuickActionsPanel';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const VerifierDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Mock notifications
    setNotifications([
      {
        title: 'New Certificate Uploaded',
        message: 'IIT Dhanbad - B.Tech Computer Science certificate requires verification',
        time: '2 minutes ago',
        type: 'info',
        read: false,
        action: () => console.log('Navigate to verification')
      },
      {
        title: 'Fraud Alert',
        message: 'Suspicious certificate detected from unknown institution',
        time: '15 minutes ago',
        type: 'warning',
        read: false,
        action: () => console.log('Navigate to fraud alert')
      },
      {
        title: 'Verification Complete',
        message: 'Ranchi University MBA certificate verified successfully',
        time: '1 hour ago',
        type: 'success',
        read: true,
        action: () => console.log('View verification result')
      }
    ]);
  }, []);

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/verifier-dashboard' }
  ];


  const handleViewDetails = (certificationId) => {
    console.log('Viewing details for:', certificationId);
    window.location.href = `/certificate-verification?id=${certificationId}`;
  };

  const handleExport = () => {
    console.log('Exporting verification reports');
    // Mock export functionality
    const csvContent = "data:text/csv;charset=utf-8,Certificate ID,Institution,Status,Date,Score\nCERT-2024-001,IIT Dhanbad,Valid,2024-09-07,98.5\nCERT-2024-002,Xavier Institute,Suspect,2024-09-07,67.2";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link?.setAttribute("href", encodedUri);
    link?.setAttribute("download", "verification_reports.csv");
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
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
    window.location.href = `/certificate-verification?search=${encodeURIComponent(query)}`;
  };

  const user = {
    name: 'Dr. Rajesh Kumar',
    role: 'Senior Verifier',
    institution: 'Jharkhand Education Department'
  };

  const metrics = {
    dailyVerifications: 47,
    fraudAlerts: 3,
    pendingReviews: 12,
    successRate: 94.2
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={user}
        notifications={notifications}
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
                    <Icon name="Shield" size={24} className="text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Verifier Dashboard</h1>
                    <p className="text-muted-foreground">
                      Welcome back, {user?.name} • {new Date()?.toLocaleDateString('en-IN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                  onClick={handleExport}
                >
                  Export Reports
                </Button>
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={() => handleNavigation('/certificate-verification')}
                >
                  New Verification
                </Button>
              </div>
            </div>

            {/* Metrics Panel */}
            <MetricsPanel metrics={metrics} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="xl:col-span-2 space-y-6">
                <RecentVerificationsTable
                  onViewDetails={handleViewDetails}
                  onExport={handleExport}
                />
              </div>

              {/* Right Column - Quick Actions */}
              <div className="space-y-6">
                <QuickActionsPanel onNavigate={handleNavigation} />
                
                {/* System Status Card */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">System Status</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      <span className="text-sm text-success font-medium">Online</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">OCR Service</span>
                      <span className="text-success font-medium">Active</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Registry Connection</span>
                      <span className="text-success font-medium">Connected</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Database</span>
                      <span className="text-success font-medium">Healthy</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="text-muted-foreground font-mono">
                        {new Date()?.toLocaleTimeString('en-IN', { 
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {[
                      {
                        action: 'Certificate verified',
                        details: 'IIT Dhanbad - B.Tech CS',
                        time: '5 min ago',
                        icon: 'CheckCircle',
                        color: 'text-success'
                      },
                      {
                        action: 'Fraud detected',
                        details: 'Unknown Institution',
                        time: '12 min ago',
                        icon: 'AlertTriangle',
                        color: 'text-warning'
                      },
                      {
                        action: 'Bulk upload completed',
                        details: '25 certificates processed',
                        time: '1 hour ago',
                        icon: 'Upload',
                        color: 'text-primary'
                      }
                    ]?.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Icon name={activity?.icon} size={16} className={`mt-0.5 ${activity?.color}`} />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-foreground">{activity?.action}</p>
                          <p className="text-xs text-muted-foreground">{activity?.details}</p>
                          <p className="text-xs text-muted-foreground">{activity?.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VerifierDashboard;