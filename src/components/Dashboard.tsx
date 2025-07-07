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
  const approvedFiles = fileUploads.filter(file => file.status === 'approved').length;
  const rejectedFiles = fileUploads.filter(file => file.status === 'rejected').length;

  const stats = [
    {
      title: 'Pending Reconciliations',
      value: pendingApproval,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Approved Reconciliations',
      value: approved,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Rejected Reconciliations',
      value: rejected,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Unreconciled Transactions',
      value: unreconciled,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Total Transactions',
      value: totalTransactions,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Pending File Approvals',
      value: pendingFiles,
      icon: Upload,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return CheckCircle;
      case 'rejected':
        return XCircle;
      case 'pending_approval':
        return Clock;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'pending_approval':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-lg p-6 transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reconciliation Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Reconciliation Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {reconciliationEntries.slice(0, 5).map((entry) => {
                const StatusIcon = getStatusIcon(entry.status);
                return (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(entry.status)}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Reconciliation {entry.id}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created by {entry.createdBy} • {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                        {entry.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1 truncate max-w-xs">
                            Rejected: {entry.rejectionReason}
                          </p>
                        )}
                        {entry.status === 'approved' && entry.approvedBy && (
                          <p className="text-xs text-green-600 mt-1">
                            Approved by {entry.approvedBy}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(entry.status)}`}>
                      {entry.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                );
              })}
              {reconciliationEntries.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No reconciliation activity yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent File Upload Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent File Upload Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {fileUploads.slice(0, 5).map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(file.status)}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {file.fileName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {file.transactionCount} transactions • {file.source} • {file.uploadedBy}
                      </p>
                      {file.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1 truncate max-w-xs">
                          Rejected: {file.rejectionReason}
                        </p>
                      )}
                      {file.status === 'approved' && file.approvedBy && (
                        <p className="text-xs text-green-600 mt-1">
                          Approved by {file.approvedBy}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(file.status)}`}>
                    {file.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              ))}
              {fileUploads.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No file upload activity yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};