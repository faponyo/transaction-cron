import React, { useState } from 'react';
import { ReconciliationEntry, Transaction } from '../types';
import { Check, X, MessageSquare, CheckCircle, XCircle, AlertCircle, MessageCircle } from 'lucide-react';

interface ApprovalQueueProps {
  entries: ReconciliationEntry[];
  bankTransactions: Transaction[];
  systemTransactions: Transaction[];
  onApprove: (entryId: string, comments?: string) => void;
  onReject: (entryId: string, reason: string) => void;
  userRole: string;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  entries,
  bankTransactions,
  systemTransactions,
  onApprove,
  onReject,
  userRole
}) => {
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [actionComments, setActionComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingEntries = entries.filter(entry => entry.status === 'pending_approval');

  const getBankTransaction = (id: string) => 
    bankTransactions.find(t => t.id === id);

  const getSystemTransaction = (id: string) => 
    systemTransactions.find(t => t.id === id);

  const handleApprove = (entryId: string) => {
    onApprove(entryId, actionComments || undefined);
    setSelectedEntry(null);
    setActionComments('');
  };

  const handleReject = (entryId: string) => {
    if (!rejectionReason.trim()) return;
    onReject(entryId, rejectionReason);
    setSelectedEntry(null);
    setRejectionReason('');
  };

  const canApprove = userRole === 'checker' || userRole === 'admin';

  const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className = "" }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'approved':
          return {
            icon: CheckCircle,
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
            iconColor: 'text-green-600'
          };
        case 'rejected':
          return {
            icon: XCircle,
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
            iconColor: 'text-red-600'
          };
        case 'pending_approval':
          return {
            icon: AlertCircle,
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-800',
            iconColor: 'text-yellow-600'
          };
        default:
          return {
            icon: AlertCircle,
            bgColor: 'bg-gray-100',
            textColor: 'text-gray-800',
            iconColor: 'text-gray-600'
          };
      }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}>
        <Icon className={`h-3 w-3 mr-1 ${config.iconColor}`} />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Approval Queue</h3>
        <p className="text-sm text-gray-500 mt-1">
          {pendingEntries.length} reconciliation{pendingEntries.length !== 1 ? 's' : ''} pending approval
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {entries.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reconciliations</h3>
            <p className="text-gray-500">No reconciliation entries have been created yet.</p>
          </div>
        ) : (
          entries.map((entry) => {
            const bankTxn = getBankTransaction(entry.bankTransactionId);
            const systemTxn = getSystemTransaction(entry.systemTransactionId);
            const isSelected = selectedEntry === entry.id;

            return (
              <div key={entry.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Reconciliation {entry.id}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Created by {entry.createdBy} • {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={entry.status} />
                    <button
                      onClick={() => setSelectedEntry(isSelected ? null : entry.id)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      {isSelected ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>

                {/* Approval/Rejection Remarks Display */}
                {(entry.status === 'approved' || entry.status === 'rejected') && (
                  <div className={`mb-4 p-4 rounded-lg border ${
                    entry.status === 'approved' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start space-x-3">
                      {entry.status === 'approved' ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className={`text-sm font-medium ${
                            entry.status === 'approved' ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {entry.status === 'approved' ? 'Reconciliation Approved' : 'Reconciliation Rejected'}
                          </h5>
                          <span className={`text-xs ${
                            entry.status === 'approved' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {entry.approvedBy} • {entry.approvedAt && new Date(entry.approvedAt).toLocaleString()}
                          </span>
                        </div>
                        {entry.rejectionReason && (
                          <div className="bg-white p-3 rounded border border-red-200">
                            <p className="text-sm text-red-800">
                              <strong>Reason:</strong> {entry.rejectionReason}
                            </p>
                          </div>
                        )}
                        {entry.status === 'approved' && entry.comments && (
                          <div className="bg-white p-3 rounded border border-green-200">
                            <p className="text-sm text-green-800">
                              <strong>Comments:</strong> {entry.comments}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isSelected && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">Bank Transaction</h5>
                        {bankTxn && (
                          <div>
                            <p className="text-sm text-gray-900">{bankTxn.description}</p>
                            <p className="text-sm text-gray-500">
                              {bankTxn.reference} • {new Date(bankTxn.date).toLocaleDateString()}
                            </p>
                            <p className={`text-lg font-semibold ${
                              bankTxn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {bankTxn.type === 'credit' ? '+' : '-'}${bankTxn.amount.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">System Transaction</h5>
                        {systemTxn && (
                          <div>
                            <p className="text-sm text-gray-900">{systemTxn.description}</p>
                            <p className="text-sm text-gray-500">
                              {systemTxn.reference} • {new Date(systemTxn.date).toLocaleDateString()}
                            </p>
                            <p className={`text-lg font-semibold ${
                              systemTxn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {systemTxn.type === 'credit' ? '+' : '-'}${systemTxn.amount.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {entry.comments && entry.status === 'pending_approval' && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start space-x-2">
                          <MessageCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <h5 className="font-medium text-blue-900 mb-1">Maker Comments</h5>
                            <p className="text-sm text-blue-800">{entry.comments}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {canApprove && entry.status === 'pending_approval' && (
                      <div className="space-y-4 border-t pt-4">
                        <div>
                          <label htmlFor="actionComments" className="block text-sm font-medium text-gray-700 mb-2">
                            Approval Comments (Optional)
                          </label>
                          <textarea
                            id="actionComments"
                            value={actionComments}
                            onChange={(e) => setActionComments(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Add any comments for this approval..."
                          />
                        </div>

                        <div>
                          <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                            Rejection Reason (Required if rejecting)
                          </label>
                          <textarea
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Provide detailed reason for rejection..."
                          />
                        </div>

                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleReject(entry.id)}
                            disabled={!rejectionReason.trim()}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(entry.id)}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </button>
                        </div>
                      </div>
                    )}

                    {!canApprove && entry.status === 'pending_approval' && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                          <p className="text-sm text-yellow-800">
                            You need checker or admin role to approve reconciliations.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};