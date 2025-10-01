import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const VerificationStats = ({ onDrillDown = () => {} }) => {
  const [selectedCategory, setSelectedCategory] = useState('department');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const categories = [
    { value: 'department', label: 'By Department', icon: 'Building2' },
    { value: 'course', label: 'By Course Type', icon: 'GraduationCap' },
    { value: 'outcome', label: 'By Outcome', icon: 'Target' },
    { value: 'timeline', label: 'By Timeline', icon: 'Calendar' }
  ];

  const statsData = {
    department: [
      {
        id: 'engineering',
        name: 'Engineering',
        total: 1247,
        verified: 1198,
        pending: 32,
        rejected: 17,
        successRate: 96.1,
        trend: 'up',
        details: {
          'Computer Science': { total: 456, verified: 441, pending: 12, rejected: 3 },
          'Mechanical': { total: 342, verified: 331, pending: 8, rejected: 3 },
          'Electrical': { total: 289, verified: 278, pending: 7, rejected: 4 },
          'Civil': { total: 160, verified: 148, pending: 5, rejected: 7 }
        }
      },
      {
        id: 'management',
        name: 'Management',
        total: 834,
        verified: 789,
        pending: 28,
        rejected: 17,
        successRate: 94.6,
        trend: 'up',
        details: {
          'MBA': { total: 456, verified: 432, pending: 15, rejected: 9 },
          'BBA': { total: 234, verified: 223, pending: 8, rejected: 3 },
          'PGDM': { total: 144, verified: 134, pending: 5, rejected: 5 }
        }
      },
      {
        id: 'science',
        name: 'Science',
        total: 567,
        verified: 534,
        pending: 21,
        rejected: 12,
        successRate: 94.2,
        trend: 'down',
        details: {
          'Physics': { total: 189, verified: 178, pending: 7, rejected: 4 },
          'Chemistry': { total: 156, verified: 147, pending: 6, rejected: 3 },
          'Mathematics': { total: 134, verified: 126, pending: 5, rejected: 3 },
          'Biology': { total: 88, verified: 83, pending: 3, rejected: 2 }
        }
      },
      {
        id: 'arts',
        name: 'Arts & Humanities',
        total: 423,
        verified: 398,
        pending: 18,
        rejected: 7,
        successRate: 94.1,
        trend: 'stable',
        details: {
          'English': { total: 145, verified: 138, pending: 5, rejected: 2 },
          'History': { total: 123, verified: 116, pending: 6, rejected: 1 },
          'Political Science': { total: 89, verified: 84, pending: 4, rejected: 1 },
          'Economics': { total: 66, verified: 60, pending: 3, rejected: 3 }
        }
      }
    ],
    course: [
      {
        id: 'undergraduate',
        name: 'Undergraduate',
        total: 1876,
        verified: 1789,
        pending: 56,
        rejected: 31,
        successRate: 95.4,
        trend: 'up'
      },
      {
        id: 'postgraduate',
        name: 'Postgraduate',
        total: 934,
        verified: 887,
        pending: 32,
        rejected: 15,
        successRate: 95.0,
        trend: 'up'
      },
      {
        id: 'diploma',
        name: 'Diploma',
        total: 261,
        verified: 243,
        pending: 11,
        rejected: 7,
        successRate: 93.1,
        trend: 'stable'
      }
    ],
    outcome: [
      {
        id: 'valid',
        name: 'Valid Certificates',
        total: 2919,
        verified: 2919,
        pending: 0,
        rejected: 0,
        successRate: 100,
        trend: 'up'
      },
      {
        id: 'pending',
        name: 'Pending Review',
        total: 99,
        verified: 0,
        pending: 99,
        rejected: 0,
        successRate: 0,
        trend: 'stable'
      },
      {
        id: 'rejected',
        name: 'Rejected/Invalid',
        total: 53,
        verified: 0,
        pending: 0,
        rejected: 53,
        successRate: 0,
        trend: 'down'
      }
    ]
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return 'TrendingUp';
    if (trend === 'down') return 'TrendingDown';
    return 'Minus';
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-error';
    return 'text-muted-foreground';
  };

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded?.has(id)) {
      newExpanded?.delete(id);
    } else {
      newExpanded?.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleDrillDown = (item, subItem = null) => {
    onDrillDown({
      category: selectedCategory,
      item: item,
      subItem: subItem
    });
  };

  const currentData = statsData?.[selectedCategory] || [];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Verification Statistics</h3>
        <Button variant="outline" size="sm" iconName="Download" iconPosition="left">
          Export
        </Button>
      </div>
      {/* Category Tabs */}
      <div className="flex items-center space-x-1 mb-6 overflow-x-auto">
        {categories?.map((category) => (
          <button
            key={category?.value}
            onClick={() => setSelectedCategory(category?.value)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
              selectedCategory === category?.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Icon name={category?.icon} size={16} />
            <span>{category?.label}</span>
          </button>
        ))}
      </div>
      {/* Statistics List */}
      <div className="space-y-3">
        {currentData?.map((item) => (
          <div key={item?.id} className="border border-border rounded-lg">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h4 className="text-sm font-medium text-foreground">{item?.name}</h4>
                  <div className={`flex items-center space-x-1 ${getTrendColor(item?.trend)}`}>
                    <Icon name={getTrendIcon(item?.trend)} size={14} />
                    <span className="text-xs font-medium">{item?.successRate}%</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">{item?.total?.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  
                  {item?.details && (
                    <button
                      onClick={() => toggleExpanded(item?.id)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-150"
                    >
                      <Icon 
                        name="ChevronDown" 
                        size={16} 
                        className={`transition-transform duration-200 ${
                          expandedItems?.has(item?.id) ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Verified: {item?.verified?.toLocaleString('en-IN')}</span>
                  <span>Pending: {item?.pending}</span>
                  <span>Rejected: {item?.rejected}</span>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="flex h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-success" 
                      style={{ width: `${(item?.verified / item?.total) * 100}%` }}
                    />
                    <div 
                      className="bg-warning" 
                      style={{ width: `${(item?.pending / item?.total) * 100}%` }}
                    />
                    <div 
                      className="bg-error" 
                      style={{ width: `${(item?.rejected / item?.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDrillDown(item)}
                  iconName="ExternalLink"
                  iconPosition="right"
                >
                  View Details
                </Button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedItems?.has(item?.id) && item?.details && (
              <div className="border-t border-border bg-muted/30">
                <div className="p-4 space-y-2">
                  {Object.entries(item?.details)?.map(([subName, subData]) => (
                    <div key={subName} className="flex items-center justify-between py-2">
                      <span className="text-sm text-foreground">{subName}</span>
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="text-success">✓ {subData?.verified}</span>
                        <span className="text-warning">⏳ {subData?.pending}</span>
                        <span className="text-error">✗ {subData?.rejected}</span>
                        <button
                          onClick={() => handleDrillDown(item, { name: subName, ...subData })}
                          className="text-primary hover:text-primary/80 transition-colors duration-150"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-success">
              {currentData?.reduce((sum, item) => sum + item?.verified, 0)?.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-muted-foreground">Total Verified</div>
          </div>
          <div>
            <div className="text-lg font-bold text-warning">
              {currentData?.reduce((sum, item) => sum + item?.pending, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Pending Review</div>
          </div>
          <div>
            <div className="text-lg font-bold text-error">
              {currentData?.reduce((sum, item) => sum + item?.rejected, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStats;