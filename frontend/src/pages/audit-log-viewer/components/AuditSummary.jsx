import React from 'react';
import Icon from '../../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const AuditSummary = ({ 
  summaryData = {},
  className = ''
}) => {
  const {
    dailyActivity = [],
    actionBreakdown = [],
    performanceMetrics = [],
    userActivity = [],
    systemHealth = {}
  } = summaryData;

  const COLORS = ['#1E40AF', '#7C3AED', '#F59E0B', '#059669', '#DC2626', '#6B7280'];

  const StatCard = ({ title, value, change, icon, color = 'text-primary' }) => (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
          {change && (
            <div className={`flex items-center space-x-1 mt-1 ${
              change?.startsWith('+') ? 'text-success' : 
              change?.startsWith('-') ? 'text-error' : 'text-muted-foreground'
            }`}>
              <Icon 
                name={change?.startsWith('+') ? "TrendingUp" : change?.startsWith('-') ? "TrendingDown" : "Minus"} 
                size={14}
              />
              <span className="text-xs font-medium">{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-primary/10 ${color}`}>
          <Icon name={icon} size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Activities Today"
          value={systemHealth?.todayActivities?.toLocaleString() || '1,247'}
          change="+12.5%"
          icon="Activity"
          color="text-primary"
        />
        <StatCard
          title="Active Users"
          value={systemHealth?.activeUsers?.toLocaleString() || '89'}
          change="+5.2%"
          icon="Users"
          color="text-secondary"
        />
        <StatCard
          title="Suspicious Activities"
          value={systemHealth?.suspiciousActivities?.toLocaleString() || '3'}
          change="-2"
          icon="AlertTriangle"
          color="text-warning"
        />
        <StatCard
          title="System Uptime"
          value={systemHealth?.uptime || '99.8%'}
          change="+0.1%"
          icon="Shield"
          color="text-success"
        />
      </div>
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Daily Activity Volume</h3>
            <Icon name="BarChart3" size={20} className="text-muted-foreground" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyActivity?.length > 0 ? dailyActivity : [
                { date: '07 Sep', activities: 1247, verifications: 892, uploads: 234, flags: 3 },
                { date: '06 Sep', activities: 1156, verifications: 823, uploads: 198, flags: 5 },
                { date: '05 Sep', activities: 1089, verifications: 756, uploads: 267, flags: 2 },
                { date: '04 Sep', activities: 1234, verifications: 889, uploads: 223, flags: 4 },
                { date: '03 Sep', activities: 1178, verifications: 834, uploads: 201, flags: 1 },
                { date: '02 Sep', activities: 1067, verifications: 723, uploads: 189, flags: 6 },
                { date: '01 Sep', activities: 1145, verifications: 798, uploads: 234, flags: 2 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="activities" fill="var(--color-primary)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Breakdown Pie Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Action Breakdown</h3>
            <Icon name="PieChart" size={20} className="text-muted-foreground" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={actionBreakdown?.length > 0 ? actionBreakdown : [
                    { name: 'Verify', value: 892, percentage: 71.6 },
                    { name: 'Upload', value: 234, percentage: 18.8 },
                    { name: 'Approve', value: 89, percentage: 7.1 },
                    { name: 'Revoke', value: 23, percentage: 1.8 },
                    { name: 'Flag', value: 9, percentage: 0.7 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {(actionBreakdown?.length > 0 ? actionBreakdown : [
                    { name: 'Verify', value: 892, percentage: 71.6 },
                    { name: 'Upload', value: 234, percentage: 18.8 },
                    { name: 'Approve', value: 89, percentage: 7.1 },
                    { name: 'Revoke', value: 23, percentage: 1.8 },
                    { name: 'Flag', value: 9, percentage: 0.7 }
                  ])?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {(actionBreakdown?.length > 0 ? actionBreakdown : [
              { name: 'Verify', value: 892, percentage: 71.6 },
              { name: 'Upload', value: 234, percentage: 18.8 },
              { name: 'Approve', value: 89, percentage: 7.1 },
              { name: 'Revoke', value: 23, percentage: 1.8 },
              { name: 'Flag', value: 9, percentage: 0.7 }
            ])?.map((item, index) => (
              <div key={item?.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS?.[index % COLORS?.length] }}
                />
                <span className="text-xs text-muted-foreground">
                  {item?.name}: {item?.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Performance Metrics */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">System Performance</h3>
          <Icon name="Zap" size={20} className="text-muted-foreground" />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceMetrics?.length > 0 ? performanceMetrics : [
              { time: '00:00', responseTime: 245, throughput: 89, errors: 0 },
              { time: '04:00', responseTime: 198, throughput: 67, errors: 1 },
              { time: '08:00', responseTime: 312, throughput: 156, errors: 0 },
              { time: '12:00', responseTime: 289, throughput: 234, errors: 2 },
              { time: '16:00', responseTime: 267, throughput: 198, errors: 1 },
              { time: '20:00', responseTime: 234, throughput: 123, errors: 0 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="time" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="responseTime" 
                stroke="var(--color-primary)" 
                strokeWidth={2}
                dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                name="Response Time (ms)"
              />
              <Line 
                type="monotone" 
                dataKey="throughput" 
                stroke="var(--color-secondary)" 
                strokeWidth={2}
                dot={{ fill: 'var(--color-secondary)', strokeWidth: 2, r: 4 }}
                name="Throughput (req/min)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Top Users Activity */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Most Active Users</h3>
          <Icon name="Users" size={20} className="text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {(userActivity?.length > 0 ? userActivity : [
            { name: 'Dr. Rajesh Kumar', role: 'Verifier', institution: 'Ranchi University', activities: 156, trend: '+12%' },
            { name: 'Prof. Sunita Devi', role: 'Institution Admin', institution: 'BIT Mesra', activities: 134, trend: '+8%' },
            { name: 'Mr. Amit Singh', role: 'Department Admin', institution: 'NIT Jamshedpur', activities: 98, trend: '+15%' },
            { name: 'Dr. Priya Sharma', role: 'Verifier', institution: 'Kolhan University', activities: 87, trend: '+5%' },
            { name: 'Prof. Ravi Gupta', role: 'Institution Admin', institution: 'Jharkhand University', activities: 76, trend: '+3%' }
          ])?.map((user, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {user?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.role} • {user?.institution}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user?.activities} activities</p>
                <p className="text-xs text-success">{user?.trend}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuditSummary;