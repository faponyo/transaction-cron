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
            badgeClass: 'badge bg-success'
          };
        case 'rejected':
          return {
            icon: XCircle,
            badgeClass: 'badge bg-danger'
          };
        case 'pending_approval':
          return {
            icon: AlertCircle,
            badgeClass: 'badge bg-warning text-dark'
          };
        default:
          return {
            icon: AlertCircle,
            badgeClass: 'badge bg-secondary'
          };
      }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <span className={`${config.badgeClass} d-inline-flex align-items-center ${className}`}>
        <Icon className="me-1" size={12} />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="card">
      <div className="card-header bg-white">
        <h5 className="card-title mb-1">Approval Queue</h5>
        <p className="card-text small text-muted mb-0">
          {pendingEntries.length} reconciliation{pendingEntries.length !== 1 ? 's' : ''} pending approval
        </p>
      </div>

      <div className="card-body p-0">
        {entries.length === 0 ? (
          <div className="text-center py-5">
            <MessageSquare className="text-muted mb-3" size={48} />
            <h5 className="mb-2">No Reconciliations</h5>
            <p className="text-muted">No reconciliation entries have been created yet.</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {entries.map((entry) => {
              const bankTxn = getBankTransaction(entry.bankTransactionId);
              const systemTxn = getSystemTransaction(entry.systemTransactionId);
              const isSelected = selectedEntry === entry.id;

              return (
                <div key={entry.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6 className="mb-1 fw-medium">
                        Reconciliation {entry.id}
                      </h6>
                      <p className="mb-0 small text-muted">
                        Created by {entry.createdBy} • {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <StatusBadge status={entry.status} />
                      <button
                        onClick={() => setSelectedEntry(isSelected ? null : entry.id)}
                        className="btn btn-outline-primary btn-sm"
                      >
                        {isSelected ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>

                  {/* Approval/Rejection Remarks Display */}
                  {(entry.status === 'approved' || entry.status === 'rejected') && (
                    <div className={`alert ${
                      entry.status === 'approved' ? 'alert-success' : 'alert-danger'
                    } mb-3`}>
                      <div className="d-flex align-items-start">
                        {entry.status === 'approved' ? (
                          <CheckCircle className="me-2 mt-1" size={20} />
                        ) : (
                          <XCircle className="me-2 mt-1" size={20} />
                        )}
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">
                              {entry.status === 'approved' ? 'Reconciliation Approved' : 'Reconciliation Rejected'}
                            </h6>
                            <small className="text-muted">
                              {entry.approvedBy} • {entry.approvedAt && new Date(entry.approvedAt).toLocaleString()}
                            </small>
                          </div>
                          {entry.rejectionReason && (
                            <div className="alert alert-light border mb-0">
                              <strong>Reason:</strong> {entry.rejectionReason}
                            </div>
                          )}
                          {entry.status === 'approved' && entry.comments && (
                            <div className="alert alert-light border mb-0">
                              <strong>Comments:</strong> {entry.comments}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {isSelected && (
                    <div className="mt-3">
                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <div className="p-3 bg-light rounded">
                            <h6 className="fw-medium mb-2">Bank Transaction</h6>
                            {bankTxn && (
                              <div>
                                <p className="mb-1 fw-medium">{bankTxn.description}</p>
                                <p className="mb-2 small text-muted">
                                  {bankTxn.reference} • {new Date(bankTxn.date).toLocaleDateString()}
                                </p>
                                <p className={`h6 fw-bold mb-0 ${
                                  bankTxn.type === 'credit' ? 'text-success' : 'text-danger'
                                }`}>
                                  {bankTxn.type === 'credit' ? '+' : '-'}${bankTxn.amount.toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="p-3 bg-light rounded">
                            <h6 className="fw-medium mb-2">System Transaction</h6>
                            {systemTxn && (
                              <div>
                                <p className="mb-1 fw-medium">{systemTxn.description}</p>
                                <p className="mb-2 small text-muted">
                                  {systemTxn.reference} • {new Date(systemTxn.date).toLocaleDateString()}
                                </p>
                                <p className={`h6 fw-bold mb-0 ${
                                  systemTxn.type === 'credit' ? 'text-success' : 'text-danger'
                                }`}>
                                  {systemTxn.type === 'credit' ? '+' : '-'}${systemTxn.amount.toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {entry.comments && entry.status === 'pending_approval' && (
                        <div className="alert alert-info mb-4">
                          <div className="d-flex align-items-start">
                            <MessageCircle className="me-2 mt-1" size={16} />
                            <div>
                              <h6 className="mb-1">Maker Comments</h6>
                              <p className="mb-0 small">{entry.comments}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {canApprove && entry.status === 'pending_approval' && (
                        <div className="border-top pt-4">
                          <div className="mb-3">
                            <label htmlFor="actionComments" className="form-label fw-medium">
                              Approval Comments (Optional)
                            </label>
                            <textarea
                              id="actionComments"
                              value={actionComments}
                              onChange={(e) => setActionComments(e.target.value)}
                              rows={2}
                              className="form-control"
                              placeholder="Add any comments for this approval..."
                            />
                          </div>

                          <div className="mb-3">
                            <label htmlFor="rejectionReason" className="form-label fw-medium">
                              Rejection Reason (Required if rejecting)
                            </label>
                            <textarea
                              id="rejectionReason"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              rows={2}
                              className="form-control"
                              placeholder="Provide detailed reason for rejection..."
                            />
                          </div>

                          <div className="d-flex justify-content-end gap-2">
                            <button
                              onClick={() => handleReject(entry.id)}
                              disabled={!rejectionReason.trim()}
                              className="btn btn-danger d-flex align-items-center"
                            >
                              <X className="me-1" size={16} />
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprove(entry.id)}
                              className="btn btn-success d-flex align-items-center"
                            >
                              <Check className="me-1" size={16} />
                              Approve
                            </button>
                          </div>
                        </div>
                      )}

                      {!canApprove && entry.status === 'pending_approval' && (
                        <div className="alert alert-warning">
                          <div className="d-flex align-items-center">
                            <AlertCircle className="me-2" size={20} />
                            <p className="mb-0">
                              You need checker or admin role to approve reconciliations.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};