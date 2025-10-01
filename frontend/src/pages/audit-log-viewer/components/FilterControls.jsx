import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FilterControls = ({
  onFilterChange = () => {},
  onSearch = () => {},
  onExportAll = () => {},
  onScheduleReport = () => {},
  totalResults = 0,
  className = ''
}) => {
  const [filters, setFilters] = useState({
    dateRange: 'today',
    startDate: '',
    endDate: '',
    user: '',
    action: '',
    outcome: '',
    institution: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 days' },
    { value: 'last30days', label: 'Last 30 days' },
    { value: 'thismonth', label: 'This month' },
    { value: 'lastmonth', label: 'Last month' },
    { value: 'custom', label: 'Custom range' }
  ];

  const actionOptions = [
    { value: '', label: 'All actions' },
    { value: 'verify', label: 'Verify Certificate' },
    { value: 'upload', label: 'Upload Certificate' },
    { value: 'revoke', label: 'Revoke Certificate' },
    { value: 'approve', label: 'Approve Certificate' },
    { value: 'reject', label: 'Reject Certificate' },
    { value: 'flag', label: 'Flag Suspicious' },
    { value: 'login', label: 'User Login' },
    { value: 'logout', label: 'User Logout' }
  ];

  const outcomeOptions = [
    { value: '', label: 'All outcomes' },
    { value: 'valid', label: 'Valid' },
    { value: 'invalid', label: 'Invalid' },
    { value: 'suspect', label: 'Suspect' },
    { value: 'pending', label: 'Pending' },
    { value: 'error', label: 'Error' }
  ];

  const institutionOptions = [
    { value: '', label: 'All institutions' },
    { value: 'ranchi-university', label: 'Ranchi University' },
    { value: 'bit-mesra', label: 'BIT Mesra' },
    { value: 'nit-jamshedpur', label: 'NIT Jamshedpur' },
    { value: 'kolhan-university', label: 'Kolhan University' },
    { value: 'sido-kanhu-university', label: 'Sido Kanhu Murmu University' },
    { value: 'jharkhand-university', label: 'Jharkhand University' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    onSearch(searchTerm);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      dateRange: 'today',
      startDate: '',
      endDate: '',
      user: '',
      action: '',
      outcome: '',
      institution: ''
    };
    setFilters(clearedFilters);
    setSearchTerm('');
    onFilterChange(clearedFilters);
    onSearch('');
  };

  const hasActiveFilters = () => {
    return filters?.user || filters?.action || filters?.outcome || filters?.institution || 
           filters?.dateRange !== 'today' || searchTerm;
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Audit Log Filters</h2>
          <p className="text-sm text-muted-foreground">
            {totalResults?.toLocaleString()} entries found
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={onExportAll}
          >
            Export All
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Calendar"
            iconPosition="left"
            onClick={onScheduleReport}
          >
            Schedule Report
          </Button>
        </div>
      </div>
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search audit logs, user names, certificate IDs, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="pr-12"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            <Icon name="Search" size={20} />
          </button>
        </div>
      </form>
      {/* Quick Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Select
          label="Date Range"
          options={dateRangeOptions}
          value={filters?.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
        />
        
        <Select
          label="Action Type"
          options={actionOptions}
          value={filters?.action}
          onChange={(value) => handleFilterChange('action', value)}
          searchable
        />
        
        <Select
          label="Outcome"
          options={outcomeOptions}
          value={filters?.outcome}
          onChange={(value) => handleFilterChange('outcome', value)}
        />
        
        <Select
          label="Institution"
          options={institutionOptions}
          value={filters?.institution}
          onChange={(value) => handleFilterChange('institution', value)}
          searchable
        />
      </div>
      {/* Custom Date Range */}
      {filters?.dateRange === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
          <Input
            type="date"
            label="Start Date"
            value={filters?.startDate}
            onChange={(e) => handleFilterChange('startDate', e?.target?.value)}
          />
          <Input
            type="date"
            label="End Date"
            value={filters?.endDate}
            onChange={(e) => handleFilterChange('endDate', e?.target?.value)}
          />
        </div>
      )}
      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 transition-colors duration-150"
        >
          <Icon name={isAdvancedOpen ? "ChevronUp" : "ChevronDown"} size={16} />
          <span>Advanced Filters</span>
        </button>
        
        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            iconPosition="left"
            onClick={clearAllFilters}
          >
            Clear All Filters
          </Button>
        )}
      </div>
      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className="mt-4 p-4 bg-muted/30 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              label="User Name/Email"
              placeholder="Search by user name or email"
              value={filters?.user}
              onChange={(e) => handleFilterChange('user', e?.target?.value)}
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quick Filters</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange('outcome', 'suspect')}
                  className="px-3 py-1 text-xs bg-warning/10 text-warning border border-warning/20 rounded-full hover:bg-warning/20 transition-colors duration-150"
                >
                  Suspicious Activity
                </button>
                <button
                  onClick={() => handleFilterChange('action', 'login')}
                  className="px-3 py-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full hover:bg-primary/20 transition-colors duration-150"
                >
                  Login Events
                </button>
                <button
                  onClick={() => handleFilterChange('outcome', 'error')}
                  className="px-3 py-1 text-xs bg-error/10 text-error border border-error/20 rounded-full hover:bg-error/20 transition-colors duration-150"
                >
                  System Errors
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
          <div className="flex items-center space-x-2 text-sm">
            <Icon name="Filter" size={16} className="text-accent" />
            <span className="text-accent font-medium">Active Filters:</span>
            <div className="flex flex-wrap gap-1">
              {searchTerm && (
                <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                  Search: "{searchTerm}"
                </span>
              )}
              {filters?.dateRange !== 'today' && (
                <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                  Date: {dateRangeOptions?.find(opt => opt?.value === filters?.dateRange)?.label}
                </span>
              )}
              {filters?.action && (
                <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                  Action: {actionOptions?.find(opt => opt?.value === filters?.action)?.label}
                </span>
              )}
              {filters?.outcome && (
                <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                  Outcome: {outcomeOptions?.find(opt => opt?.value === filters?.outcome)?.label}
                </span>
              )}
              {filters?.institution && (
                <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                  Institution: {institutionOptions?.find(opt => opt?.value === filters?.institution)?.label}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;