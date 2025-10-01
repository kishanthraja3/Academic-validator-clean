import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';


const AnalyticsChart = ({ 
  title, 
  data = [], 
  type = 'line',
  height = 300,
  showDateRange = true 
}) => {
  const [dateRange, setDateRange] = useState('7d');
  const [chartType, setChartType] = useState(type);

  const dateRangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  const chartData = [
    { name: 'Mon', verifications: 45, fraudDetected: 2, pending: 8 },
    { name: 'Tue', verifications: 52, fraudDetected: 1, pending: 12 },
    { name: 'Wed', verifications: 38, fraudDetected: 3, pending: 6 },
    { name: 'Thu', verifications: 61, fraudDetected: 0, pending: 15 },
    { name: 'Fri', verifications: 48, fraudDetected: 2, pending: 9 },
    { name: 'Sat', verifications: 29, fraudDetected: 1, pending: 4 },
    { name: 'Sun', verifications: 35, fraudDetected: 0, pending: 7 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-modal">
          <p className="font-medium text-popover-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry?.color }}
              />
              <span className="text-muted-foreground">{entry?.dataKey}:</span>
              <span className="font-medium text-popover-foreground">{entry?.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    if (chartType === 'line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="name" 
            stroke="var(--color-muted-foreground)"
            fontSize={12}
          />
          <YAxis 
            stroke="var(--color-muted-foreground)"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="verifications" 
            stroke="var(--color-primary)" 
            strokeWidth={2}
            dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
            name="Verifications"
          />
          <Line 
            type="monotone" 
            dataKey="fraudDetected" 
            stroke="var(--color-error)" 
            strokeWidth={2}
            dot={{ fill: 'var(--color-error)', strokeWidth: 2, r: 4 }}
            name="Fraud Detected"
          />
          <Line 
            type="monotone" 
            dataKey="pending" 
            stroke="var(--color-warning)" 
            strokeWidth={2}
            dot={{ fill: 'var(--color-warning)', strokeWidth: 2, r: 4 }}
            name="Pending"
          />
        </LineChart>
      );
    }

    return (
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis 
          dataKey="name" 
          stroke="var(--color-muted-foreground)"
          fontSize={12}
        />
        <YAxis 
          stroke="var(--color-muted-foreground)"
          fontSize={12}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="verifications" fill="var(--color-primary)" name="Verifications" />
        <Bar dataKey="fraudDetected" fill="var(--color-error)" name="Fraud Detected" />
        <Bar dataKey="pending" fill="var(--color-warning)" name="Pending" />
      </BarChart>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        
        <div className="flex items-center space-x-2">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded-md transition-colors duration-150 ${
                chartType === 'line' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
              title="Line Chart"
            >
              <Icon name="TrendingUp" size={16} />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-md transition-colors duration-150 ${
                chartType === 'bar' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
              title="Bar Chart"
            >
              <Icon name="BarChart3" size={16} />
            </button>
          </div>

          {/* Date Range Selector */}
          {showDateRange && (
            <div className="flex items-center space-x-1">
              {dateRangeOptions?.map((option) => (
                <button
                  key={option?.value}
                  onClick={() => setDateRange(option?.value)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors duration-150 ${
                    dateRange === option?.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {option?.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;