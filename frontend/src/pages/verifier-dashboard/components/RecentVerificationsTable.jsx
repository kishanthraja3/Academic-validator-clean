import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const RecentVerificationsTable = ({ verifications = [], onViewDetails, onExport }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7days');

  const mockVerifications = [
    {
      id: 'CERT-2024-001',
      certificateName: 'Bachelor of Technology - Computer Science',
      institution: 'Indian Institute of Technology, Dhanbad',
      studentName: 'Rahul Kumar Singh',
      status: 'valid',
      submissionDate: '2024-09-07',
      verificationScore: 98.5,
      flags: []
    },
    {
      id: 'CERT-2024-002',
      certificateName: 'Master of Business Administration',
      institution: 'Xavier Institute of Management, Ranchi',
      studentName: 'Priya Sharma',
      status: 'suspect',
      submissionDate: '2024-09-07',
      verificationScore: 67.2,
      flags: ['Grade Tampering', 'Date Inconsistency']
    },
    {
      id: 'CERT-2024-003',
      certificateName: 'Bachelor of Arts - English Literature',
      institution: 'Ranchi University',
      studentName: 'Amit Kumar Mahto',
      status: 'valid',
      submissionDate: '2024-09-06',
      verificationScore: 95.8,
      flags: []
    },
    {
      id: 'CERT-2024-004',
      certificateName: 'Diploma in Mechanical Engineering',
      institution: 'Government Polytechnic, Jamshedpur',
      studentName: 'Sunita Devi',
      status: 'invalid',
      submissionDate: '2024-09-06',
      verificationScore: 23.1,
      flags: ['Institution Not Found', 'Invalid Signature', 'Forged Document']
    },
    {
      id: 'CERT-2024-005',
      certificateName: 'Bachelor of Science - Physics',
      institution: 'Sido Kanhu Murmu University',
      studentName: 'Ravi Prasad',
      status: 'valid',
      submissionDate: '2024-09-05',
      verificationScore: 92.4,
      flags: []
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'valid', label: 'Valid' },
    { value: 'invalid', label: 'Invalid' },
    { value: 'suspect', label: 'Suspect' }
  ];

  const dateOptions = [
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: '90days', label: 'Last 90 days' },
    { value: 'all', label: 'All time' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid':
        return 'text-success bg-success/10 border-success/20';
      case 'invalid':
        return 'text-error bg-error/10 border-error/20';
      case 'suspect':
        return 'text-warning bg-warning/10 border-warning/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid':
        return 'CheckCircle';
      case 'invalid':
        return 'XCircle';
      case 'suspect':
        return 'AlertTriangle';
      default:
        return 'Clock';
    }
  };

  const filteredVerifications = mockVerifications?.filter(verification => {
    if (statusFilter !== 'all' && verification?.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent Verifications</h2>
            <p className="text-sm text-muted-foreground">Latest certificate verification results</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filter by status"
              className="w-full sm:w-40"
            />
            <Select
              options={dateOptions}
              value={dateFilter}
              onChange={setDateFilter}
              placeholder="Filter by date"
              className="w-full sm:w-40"
            />
            <Button
              variant="outline"
              iconName="Download"
              iconPosition="left"
              onClick={onExport}
              className="w-full sm:w-auto"
            >
              Export
            </Button>
          </div>
        </div>
      </div>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Certificate</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Institution</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Student</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Score</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVerifications?.map((verification, index) => (
              <tr key={verification?.id} className="border-b border-border hover:bg-muted/30 transition-colors duration-150">
                <td className="p-4">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground text-sm">{verification?.certificateName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{verification?.id}</p>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm text-foreground">{verification?.institution}</p>
                </td>
                <td className="p-4">
                  <p className="text-sm text-foreground">{verification?.studentName}</p>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(verification?.status)}`}>
                      <Icon name={getStatusIcon(verification?.status)} size={12} />
                      <span className="capitalize">{verification?.status}</span>
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">{verification?.verificationScore}%</span>
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          verification?.verificationScore >= 90 ? 'bg-success' :
                          verification?.verificationScore >= 70 ? 'bg-warning' : 'bg-error'
                        }`}
                        style={{ width: `${verification?.verificationScore}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm text-muted-foreground">{verification?.submissionDate}</p>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Eye"
                      onClick={() => onViewDetails(verification?.id)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Download"
                      onClick={() => console.log('Download report', verification?.id)}
                    >
                      Report
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4 p-4">
        {filteredVerifications?.map((verification, index) => (
          <div key={verification?.id} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <p className="font-medium text-foreground text-sm">{verification?.certificateName}</p>
                <p className="text-xs text-muted-foreground font-mono">{verification?.id}</p>
              </div>
              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(verification?.status)}`}>
                <Icon name={getStatusIcon(verification?.status)} size={12} />
                <span className="capitalize">{verification?.status}</span>
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Institution:</span>
                <span className="text-foreground font-medium">{verification?.institution}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student:</span>
                <span className="text-foreground">{verification?.studentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Score:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-foreground font-medium">{verification?.verificationScore}%</span>
                  <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        verification?.verificationScore >= 90 ? 'bg-success' :
                        verification?.verificationScore >= 70 ? 'bg-warning' : 'bg-error'
                      }`}
                      style={{ width: `${verification?.verificationScore}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="text-foreground">{verification?.submissionDate}</span>
              </div>
            </div>
            
            {verification?.flags?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Flags:</p>
                <div className="flex flex-wrap gap-1">
                  {verification?.flags?.map((flag, flagIndex) => (
                    <span key={flagIndex} className="inline-block px-2 py-1 text-xs bg-error/10 text-error rounded-full">
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                iconName="Eye"
                onClick={() => onViewDetails(verification?.id)}
                fullWidth
              >
                View Details
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconName="Download"
                onClick={() => console.log('Download report', verification?.id)}
                fullWidth
              >
                Report
              </Button>
            </div>
          </div>
        ))}
      </div>
      {filteredVerifications?.length === 0 && (
        <div className="p-12 text-center">
          <Icon name="FileX" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-medium text-foreground mb-2">No verifications found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or upload a certificate to get started</p>
        </div>
      )}
    </div>
  );
};

export default RecentVerificationsTable;