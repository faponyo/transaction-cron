import React from 'react';
import { CheckCircle, Clock, AlertCircle, FileText, Upload, Users, XCircle, MessageCircle } from 'lucide-react';
import { ReconciliationEntry, Transaction, FileUpload } from '../types';

interface DashboardProps {
  reconciliationEntries: ReconciliationEntry[];
  bankTransactions: Transaction[];
  systemTransactions: Transaction[];
  fileUploads: FileUpload[];
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  reconciliationEntries, 
  bankTransactions, 
  systemTransactions,
  fileUploads
}) => {
  const pendingApproval = reconciliationEntries.filter(entry => entry.status === 'pending_approval').length;
  const approved = reconciliationEntries.filter(entry => entry.status === 'approved').length;
  const rejected = reconciliationEntries.filter(entry => entry.status === 'rejected').length;
  const unreconciled = bankTransactions.filter(t => t.status === 'unreconciled').length;
  const totalTransactions = bankTransactions.length + systemTransactions.length;
  const pendingFiles = fileUploads.filter(file => file.status === 'pending_approval').length;

  const stats = [
    {
      title: 'Pending Reconciliations',
      value: pendingApproval,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning',
      bgLight: 'bg-warning-subtle'
    },
    {
      title: 'Approved Reconciliations',
      value: approved,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success',
      bgLight: 'bg-success-subtle'
    },
    {
      title: 'Rejected Reconciliations',
      value: rejected,
      icon: XCircle,
      color: 'text-danger',
      bgColor: 'bg-danger',
      bgLight: 'bg-danger-subtle'
    },
    {
      title: 'Unreconciled Transactions',
      value: unreconciled,
      icon: AlertCircle,
      color: 'text-warning',
      bgColor: 'bg-warning',
      bgLight: 'bg-warning-subtle'
    },
    {
      title: 'Total Transactions',
      value: totalTransactions,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary',
      bgLight: 'bg-primary-subtle'
    },
    {
      title: 'Pending File Approvals',
      value: pendingFiles,
      icon: Upload,
      color: 'text-info',
      bgColor: 'bg-info',
      bgLight: 'bg-info-subtle'
    }
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'badge bg-success';
      case 'rejected':
        return 'badge bg-danger';
      case 'pending_approval':
        return 'badge bg-warning text-dark';
      default:
        return 'badge bg-secondary';
    }
  };

  const getStatusIndicatorClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success';
      case 'rejected':
        return 'bg-danger';
      case 'pending_approval':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="container-fluid">
      <div className="row g-4 mb-4">
        {stats.map((stat) => (
          <div key={stat.title} className="col-md-6 col-lg-4">
            <div className={`card h-100 border-0 ${stat.bgLight}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="card-text small text-muted mb-1">{stat.title}</p>
                    <h3 className="card-title mb-0 fw-bold">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-circle ${stat.bgColor} bg-opacity-10`}>
                    <stat.icon className={stat.color} size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Recent Reconciliation Activity */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">Recent Reconciliation Activity</h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-3">
                {reconciliationEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                    <div className="d-flex align-items-center">
                      <div className={`rounded-circle me-3`} style={{ width: '12px', height: '12px' }}>
                        <div className={`w-100 h-100 rounded-circle ${getStatusIndicatorClass(entry.status)}`}></div>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1 fw-medium">
                          Reconciliation {entry.id}
                        </p>
                        <p className="mb-0 small text-muted">
                          Created by {entry.createdBy} • {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                        {entry.rejectionReason && (
                          <p className="mb-0 small text-danger mt-1">
                            Rejected: {entry.rejectionReason.substring(0, 50)}...
                          </p>
                        )}
                        {entry.status === 'approved' && entry.approvedBy && (
                          <p className="mb-0 small text-success mt-1">
                            Approved by {entry.approvedBy}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={getStatusBadgeClass(entry.status)}>
                      {entry.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                ))}
                {reconciliationEntries.length === 0 && (
                  <div className="text-center py-4 text-muted">
                    No reconciliation activity yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent File Upload Activity */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">Recent File Upload Activity</h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-3">
                {fileUploads.slice(0, 5).map((file) => (
                  <div key={file.id} className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                    <div className="d-flex align-items-center">
                      <div className={`rounded-circle me-3`} style={{ width: '12px', height: '12px' }}>
                        <div className={`w-100 h-100 rounded-circle ${getStatusIndicatorClass(file.status)}`}></div>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1 fw-medium">
                          {file.fileName}
                        </p>
                        <p className="mb-0 small text-muted">
                          {file.transactionCount} transactions • {file.source} • {file.uploadedBy}
                        </p>
                        {file.rejectionReason && (
                          <p className="mb-0 small text-danger mt-1">
                            Rejected: {file.rejectionReason.substring(0, 50)}...
                          </p>
                        )}
                        {file.status === 'approved' && file.approvedBy && (
                          <p className="mb-0 small text-success mt-1">
                            Approved by {file.approvedBy}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={getStatusBadgeClass(file.status)}>
                      {file.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                ))}
                {fileUploads.length === 0 && (
                  <div className="text-center py-4 text-muted">
                    No file upload activity yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};