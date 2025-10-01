import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import KPICard from './components/KPICard';
import AnalyticsChart from './components/AnalyticsChart';
import ActivityFeed from './components/ActivityFeed';
import VerificationStats from './components/VerificationStats';
import WorkflowPanel from './components/WorkflowPanel';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const InstitutionDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  // Mock user data
  const currentUser = {
    name: 'Dr. Rajesh Kumar',
    role: 'Institution Admin',
    institution: 'Jharkhand Technical University'
  };

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: 'Fraud Alert',
      message: 'Suspicious certificate detected in Engineering department',
      time: '5 minutes ago',
      type: 'error',
      read: false
    },
    {
      id: 2,
      title: 'Bulk Upload Complete',
      message: '150 certificates processed successfully',
      time: '1 hour ago',
      type: 'success',
      read: false
    },
    {
      id: 3,
      title: 'Approval Required',
      message: 'Certificate revocation request pending',
      time: '2 hours ago',
      type: 'warning',
      read: true
    }
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/institution-dashboard' },
    { label: 'Institution Overview' }
  ];

  // KPI data
  const kpiData = [
    {
      title: 'Total Certificates',
      value: '3,071',
      change: '+12.5%',
      changeType: 'positive',
      icon: 'FileText',
      description: 'Processed this month'
    },
    {
      title: 'Verification Success Rate',
      value: '94.8%',
      change: '+2.1%',
      changeType: 'positive',
      icon: 'CheckCircle',
      description: 'Above target of 90%'
    },
    {
      title: 'Fraud Detection Alerts',
      value: '23',
      change: '-15.2%',
      changeType: 'positive',
      icon: 'AlertTriangle',
      description: 'Reduced from last month'
    },
    {
      title: 'Pending Reviews',
      value: '99',
      change: '+8.3%',
      changeType: 'negative',
      icon: 'Clock',
      description: 'Requires attention'
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
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
    // Implement search functionality
  };

  const handleQuickAction = (action) => {
    console.log('Quick action:', action);
    // Handle quick actions
  };

  const handleVerificationDrillDown = (data) => {
    console.log('Drill down data:', data);
    // Handle drill down navigation
  };

  const handleWorkflowAction = (data) => {
    console.log('Workflow action:', data);
    // Handle workflow actions
  };

  const handleExportData = () => {
    console.log('Exporting dashboard data...');
    // Implement export functionality
  };

  const handleGenerateReport = () => {
    console.log('Generating comprehensive report...');
    // Implement report generation
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        isCollapsed={isSidebarCollapsed}
        onToggleSidebar={handleSidebarToggle}
        user={currentUser}
        notifications={notifications}
        onLogout={handleLogout}
        onSearch={handleSearch}
      />
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
        />

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 pt-16 ${
          isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Breadcrumb items={breadcrumbItems} />
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold text-foreground">
                    Institution Dashboard
                  </h1>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Icon name="Building" size={16} />
                    <span>{currentUser?.institution}</span>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Comprehensive overview of certificate verification activities and institutional analytics
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  loading={refreshing}
                  iconName="RefreshCw"
                  iconPosition="left"
                >
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  iconName="Download"
                  iconPosition="left"
                >
                  Export Data
                </Button>
                <Button
                  variant="default"
                  onClick={handleGenerateReport}
                  iconName="FileText"
                  iconPosition="left"
                >
                  Generate Report
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiData?.map((kpi, index) => (
                <KPICard
                  key={index}
                  title={kpi?.title}
                  value={kpi?.value}
                  change={kpi?.change}
                  changeType={kpi?.changeType}
                  icon={kpi?.icon}
                  description={kpi?.description}
                  loading={isLoading}
                />
              ))}
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <AnalyticsChart
                title="Verification Trends"
                type="line"
                height={350}
              />
              <AnalyticsChart
                title="Fraud Detection Patterns"
                type="bar"
                height={350}
              />
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Activity Feed */}
              <div className="lg:col-span-1">
                <ActivityFeed />
              </div>

              {/* Right Column - Workflow Panel */}
              <div className="lg:col-span-1">
                <WorkflowPanel onWorkflowAction={handleWorkflowAction} />
              </div>
            </div>

            {/* Verification Statistics */}
            <div className="grid grid-cols-1 gap-6">
              <VerificationStats onDrillDown={handleVerificationDrillDown} />
            </div>

            {/* Footer Information */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">System Status: Online</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last Updated: {new Date()?.toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">TrustED</span>
                  <span>•</span>
                  <span>v2.1.0</span>
                  <span>•</span>
                  <span>© {new Date()?.getFullYear()} Jharkhand Education Department</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InstitutionDashboard;