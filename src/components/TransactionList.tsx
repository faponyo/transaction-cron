import React from 'react';
import { Transaction } from '../types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TransactionListProps {
  title: string;
  transactions: Transaction[];
  selectedTransaction?: Transaction;
  onTransactionSelect: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  title,
  transactions,
  selectedTransaction,
  onTransactionSelect
}) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'reconciled':
        return 'badge bg-success';
      case 'pending':
        return 'badge bg-warning text-dark';
      default:
        return 'badge bg-secondary';
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header bg-white">
        <h5 className="card-title mb-0">{title}</h5>
      </div>
      <div className="card-body p-0">
        <div className="list-group list-group-flush">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              onClick={() => onTransactionSelect(transaction)}
              className={`list-group-item list-group-item-action transaction-card ${
                selectedTransaction?.id === transaction.id ? 'selected-transaction' : ''
              }`}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className={`p-2 rounded-circle me-3 ${
                    transaction.type === 'credit' ? 'bg-credit' : 'bg-debit'
                  }`}>
                    {transaction.type === 'credit' ? (
                      <ArrowUpRight className="transaction-type-credit" size={16} />
                    ) : (
                      <ArrowDownRight className="transaction-type-debit" size={16} />
                    )}
                  </div>
                  <div>
                    <p className="mb-1 fw-medium">{transaction.description}</p>
                    <p className="mb-0 small text-muted">
                      {transaction.reference} • {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-end">
                  <p className={`mb-1 h6 fw-bold ${
                    transaction.type === 'credit' ? 'transaction-type-credit' : 'transaction-type-debit'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                  <span className={getStatusBadgeClass(transaction.status)}>
                    {transaction.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-4 text-muted">
              No transactions available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};