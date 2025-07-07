import React, { useState } from 'react';
import { Transaction } from '../types';
import { Plus, X } from 'lucide-react';

interface IndividualTransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'status'>) => void;
  userRole: string;
}

export const IndividualTransactionForm: React.FC<IndividualTransactionFormProps> = ({
  onAddTransaction,
  userRole
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountId: '',
    date: '',
    transId: '',
    amount: '',
    description: '',
    type: 'credit' as 'credit' | 'debit',
    reference: '',
    source: 'bank' as 'bank' | 'system'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId || !formData.date || !formData.transId || !formData.amount || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    const transaction: Omit<Transaction, 'id' | 'status'> = {
      accountId: formData.accountId,
      date: formData.date,
      transId: formData.transId,
      amount: parseFloat(formData.amount),
      description: formData.description,
      type: formData.type,
      reference: formData.reference || formData.transId,
      source: formData.source
    };

    onAddTransaction(transaction);
    
    // Reset form
    setFormData({
      accountId: '',
      date: '',
      transId: '',
      amount: '',
      description: '',
      type: 'credit',
      reference: '',
      source: 'bank'
    });
    
    setIsOpen(false);
  };

  const handleCancel = () => {
    setFormData({
      accountId: '',
      date: '',
      transId: '',
      amount: '',
      description: '',
      type: 'credit',
      reference: '',
      source: 'bank'
    });
    setIsOpen(false);
  };

  const canAdd = userRole === 'maker' || userRole === 'admin';

  if (!canAdd) {
    return (
      <div className="card">
        <div className="card-body text-center py-4">
          <p className="text-muted mb-0">
            You need maker or admin role to add individual transactions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Add Individual Transaction</h5>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="btn btn-primary d-flex align-items-center"
          >
            {isOpen ? (
              <>
                <X className="me-1" size={16} />
                Cancel
              </>
            ) : (
              <>
                <Plus className="me-1" size={16} />
                Add Transaction
              </>
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="card-body">
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label htmlFor="source" className="form-label fw-medium">
                Transaction Source *
              </label>
              <select
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as 'bank' | 'system' })}
                className="form-select"
                required
              >
                <option value="bank">Bank Transaction</option>
                <option value="system">System Transaction</option>
              </select>
            </div>

            <div className="col-md-6">
              <label htmlFor="accountId" className="form-label fw-medium">
                Account ID *
              </label>
              <input
                type="text"
                id="accountId"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="form-control"
                placeholder="e.g., ACC-001"
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="date" className="form-label fw-medium">
                Transaction Date *
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="transId" className="form-label fw-medium">
                Transaction ID *
              </label>
              <input
                type="text"
                id="transId"
                value={formData.transId}
                onChange={(e) => setFormData({ ...formData, transId: e.target.value })}
                className="form-control"
                placeholder="e.g., TXN-001"
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="amount" className="form-label fw-medium">
                Amount *
              </label>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="form-control"
                placeholder="0.00"
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="type" className="form-label fw-medium">
                Transaction Type *
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'credit' | 'debit' })}
                className="form-select"
                required
              >
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label fw-medium">
              Description *
            </label>
            <input
              type="text"
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-control"
              placeholder="Transaction description"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="reference" className="form-label fw-medium">
              Reference (Optional)
            </label>
            <input
              type="text"
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="form-control"
              placeholder="Reference number or code"
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-outline-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Add Transaction
            </button>
          </div>
        </form>
      )}
    </div>
  );
};