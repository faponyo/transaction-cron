import React, { useState } from 'react';
import { Transaction, ReconciliationEntry } from '../types';
import { Check, X, MessageSquare } from 'lucide-react';

interface ReconciliationFormProps {
  bankTransaction: Transaction | null;
  systemTransaction: Transaction | null;
  onSubmit: (entry: Omit<ReconciliationEntry, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  userRole: string;
}

export const ReconciliationForm: React.FC<ReconciliationFormProps> = ({
  bankTransaction,
  systemTransaction,
  onSubmit,
  onCancel,
  userRole
}) => {
  const [comments, setComments] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankTransaction || !systemTransaction) return;

    onSubmit({
      bankTransactionId: bankTransaction.id,
      systemTransactionId: systemTransaction.id,
      createdBy: 'John Doe', // In real app, this would come from auth context
      status: 'pending_approval',
      comments: comments || undefined
    });
  };

  const canMatch = bankTransaction && systemTransaction && 
    bankTransaction.amount === systemTransaction.amount &&
    bankTransaction.type === systemTransaction.type;

  if (!bankTransaction || !systemTransaction) {
    return (
      <div className="card h-100">
        <div className="card-body d-flex align-items-center justify-content-center">
          <div className="text-center py-4">
            <MessageSquare className="text-muted mb-3" size={48} />
            <h5 className="card-title">Select Transactions to Match</h5>
            <p className="card-text text-muted">
              Please select one bank transaction and one system transaction to create a reconciliation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100">
      <div className="card-header bg-white">
        <h5 className="card-title mb-0">Create Reconciliation</h5>
      </div>
      
      <form onSubmit={handleSubmit} className="card-body">
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <h6 className="fw-medium mb-3">Bank Transaction</h6>
            <div className="p-3 bg-light rounded">
              <p className="fw-medium mb-1">{bankTransaction.description}</p>
              <p className="small text-muted mb-2">
                {bankTransaction.reference} • {new Date(bankTransaction.date).toLocaleDateString()}
              </p>
              <p className={`h5 fw-bold mb-0 ${
                bankTransaction.type === 'credit' ? 'text-success' : 'text-danger'
              }`}>
                {bankTransaction.type === 'credit' ? '+' : '-'}${bankTransaction.amount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <h6 className="fw-medium mb-3">System Transaction</h6>
            <div className="p-3 bg-light rounded">
              <p className="fw-medium mb-1">{systemTransaction.description}</p>
              <p className="small text-muted mb-2">
                {systemTransaction.reference} • {new Date(systemTransaction.date).toLocaleDateString()}
              </p>
              <p className={`h5 fw-bold mb-0 ${
                systemTransaction.type === 'credit' ? 'text-success' : 'text-danger'
              }`}>
                {systemTransaction.type === 'credit' ? '+' : '-'}${systemTransaction.amount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className={`alert ${
          canMatch ? 'alert-success' : 'alert-danger'
        } d-flex align-items-center mb-4`}>
          {canMatch ? (
            <Check className="me-2" size={20} />
          ) : (
            <X className="me-2" size={20} />
          )}
          <span className="fw-medium">
            {canMatch ? 'Transactions Match' : 'Transactions Do Not Match'}
          </span>
          {!canMatch && (
            <div className="ms-auto">
              <small>Amount, type, or other criteria do not match between the selected transactions.</small>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="comments" className="form-label fw-medium">
            Comments (Optional)
          </label>
          <textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            className="form-control"
            placeholder="Add any additional notes or comments..."
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={userRole !== 'maker' && userRole !== 'admin'}
            className="btn btn-primary"
          >
            Create Reconciliation
          </button>
        </div>
      </form>
    </div>
  );
};