import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WorkflowPanel = ({ onWorkflowAction = () => {} }) => {
  const [activeTab, setActiveTab] = useState('revocation');

  const workflowTabs = [
    { id: 'revocation', label: 'Revocation', icon: 'XCircle', count: 5 },
    { id: 'replacement', label: 'Replacement', icon: 'RefreshCw', count: 3 },
    { id: 'appeals', label: 'Appeals', icon: 'MessageSquare', count: 2 }
  ];

  const workflowData = {
    revocation: [
      {
        id: 'REV-2024-001',
        certificateId: 'CERT-2024-1247',
        studentName: 'Amit Kumar Singh',
        course: 'B.Tech Computer Science',
        reason: 'Academic Misconduct',
        requestedBy: 'Dr. Priya Sharma',
        requestDate: new Date(Date.now() - 86400000),
        priority: 'high',
        status: 'pending_approval',
        documents: ['misconduct_report.pdf', 'investigation_summary.pdf'],
        approvalRequired: ['Dean', 'Registrar']
      },
      {
        id: 'REV-2024-002',
        certificateId: 'CERT-2024-0892',
        studentName: 'Sneha Patel',
        course: 'MBA Finance',
        reason: 'Fraudulent Documentation',
        requestedBy: 'Admin User',
        requestDate: new Date(Date.now() - 172800000),
        priority: 'critical',
        status: 'under_review',
        documents: ['fraud_evidence.pdf', 'verification_report.pdf'],
        approvalRequired: ['Director', 'Legal Team']
      },
      {
        id: 'REV-2024-003',
        certificateId: 'CERT-2024-0654',
        studentName: 'Rajesh Gupta',
        course: 'M.Sc Physics',
        reason: 'Grade Tampering',
        requestedBy: 'Dr. Amit Singh',
        requestDate: new Date(Date.now() - 259200000),
        priority: 'medium',
        status: 'approved',
        documents: ['grade_analysis.pdf'],
        approvalRequired: ['HOD', 'Exam Controller']
      }
    ],
    replacement: [
      {
        id: 'REP-2024-001',
        certificateId: 'CERT-2024-1156',
        studentName: 'Priya Kumari',
        course: 'B.Sc Mathematics',
        reason: 'Damaged Certificate',
        requestedBy: 'Student',
        requestDate: new Date(Date.now() - 432000000),
        priority: 'low',
        status: 'processing',
        documents: ['damage_proof.jpg', 'application_form.pdf'],
        approvalRequired: ['Registrar']
      },
      {
        id: 'REP-2024-002',
        certificateId: 'CERT-2024-0987',
        studentName: 'Vikash Singh',
        course: 'BBA Marketing',
        reason: 'Lost Certificate',
        requestedBy: 'Student',
        requestDate: new Date(Date.now() - 518400000),
        priority: 'medium',
        status: 'pending_verification',
        documents: ['police_report.pdf', 'affidavit.pdf'],
        approvalRequired: ['Dean', 'Registrar']
      }
    ],
    appeals: [
      {
        id: 'APP-2024-001',
        certificateId: 'CERT-2024-0445',
        studentName: 'Rahul Sharma',
        course: 'M.Tech Electronics',
        reason: 'Verification Rejection Appeal',
        requestedBy: 'Student',
        requestDate: new Date(Date.now() - 604800000),
        priority: 'medium',
        status: 'under_review',
        documents: ['appeal_letter.pdf', 'supporting_docs.pdf'],
        approvalRequired: ['Appeals Committee']
      }
    ]
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      critical: 'text-error bg-error/10',
      high: 'text-warning bg-warning/10',
      medium: 'text-primary bg-primary/10',
      low: 'text-muted-foreground bg-muted'
    };
    return colorMap?.[priority] || colorMap?.medium;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending_approval: 'text-warning bg-warning/10',
      under_review: 'text-primary bg-primary/10',
      approved: 'text-success bg-success/10',
      processing: 'text-primary bg-primary/10',
      pending_verification: 'text-warning bg-warning/10',
      completed: 'text-success bg-success/10',
      rejected: 'text-error bg-error/10'
    };
    return colorMap?.[status] || colorMap?.pending_approval;
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleWorkflowAction = (action, item) => {
    onWorkflowAction({ action, item, type: activeTab });
  };

  const currentWorkflows = workflowData?.[activeTab] || [];

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Certificate Workflows</h3>
          <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
            New Request
          </Button>
        </div>

        {/* Workflow Tabs */}
        <div className="flex items-center space-x-1">
          {workflowTabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                activeTab === tab?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={tab?.icon} size={16} />
              <span>{tab?.label}</span>
              {tab?.count > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab?.id 
                    ? 'bg-primary-foreground/20 text-primary-foreground' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  {tab?.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {currentWorkflows?.length > 0 ? (
          <div className="divide-y divide-border">
            {currentWorkflows?.map((workflow) => (
              <div key={workflow?.id} className="p-4 hover:bg-muted/50 transition-colors duration-150">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-foreground">
                        {workflow?.id}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {workflow?.certificateId}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(workflow?.priority)}`}>
                        {workflow?.priority?.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workflow?.status)}`}>
                        {workflow?.status?.replace('_', ' ')?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <span className="text-xs text-muted-foreground">
                    {formatDate(workflow?.requestDate)}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground font-medium">
                      {workflow?.studentName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {workflow?.course}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Reason: {workflow?.reason}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      By: {workflow?.requestedBy}
                    </span>
                  </div>
                </div>

                {/* Documents */}
                {workflow?.documents && workflow?.documents?.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon name="Paperclip" size={14} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {workflow?.documents?.length} document(s)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {workflow?.documents?.map((doc, index) => (
                        <button
                          key={index}
                          className="text-xs text-primary hover:text-primary/80 transition-colors duration-150"
                        >
                          {doc}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approval Required */}
                {workflow?.approvalRequired && workflow?.approvalRequired?.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon name="Users" size={14} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Approval required from:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {workflow?.approvalRequired?.map((approver, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
                        >
                          {approver}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWorkflowAction('view', workflow)}
                      iconName="Eye"
                      iconPosition="left"
                    >
                      View
                    </Button>
                    
                    {workflow?.status === 'pending_approval' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleWorkflowAction('approve', workflow)}
                          iconName="Check"
                          iconPosition="left"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleWorkflowAction('reject', workflow)}
                          iconName="X"
                          iconPosition="left"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleWorkflowAction('comment', workflow)}
                    iconName="MessageCircle"
                  >
                    Comment
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Icon name="FileX" size={32} className="mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No {activeTab} requests found</p>
          </div>
        )}
      </div>
      {/* Footer Actions */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {currentWorkflows?.length} {activeTab} request(s)
          </div>
          <Button variant="outline" size="sm">
            View All {workflowTabs?.find(t => t?.id === activeTab)?.label}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPanel;