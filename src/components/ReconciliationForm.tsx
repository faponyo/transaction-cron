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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select Transactions to Match</h3>
          <p className="text-gray-500">
            Please select one bank transaction and one system transaction to create a reconciliation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Create Reconciliation</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Bank Transaction</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{bankTransaction.description}</p>
              <p className="text-sm text-gray-500">
                {bankTransaction.reference} • {new Date(bankTransaction.date).toLocaleDateString()}
              </p>
              <p className={`text-lg font-semibold ${
                bankTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
              }`}>
                {bankTransaction.type === 'credit' ? '+' : '-'}${bankTransaction.amount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">System Transaction</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{systemTransaction.description}</p>
              <p className="text-sm text-gray-500">
                {systemTransaction.reference} • {new Date(systemTransaction.date).toLocaleDateString()}
              </p>
              <p className={`text-lg font-semibold ${
                systemTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
              }`}>
                {systemTransaction.type === 'credit' ? '+' : '-'}${systemTransaction.amount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${
          canMatch ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            {canMatch ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <X className="h-5 w-5 text-red-600" />
            )}
            <span className={`font-medium ${
              canMatch ? 'text-green-800' : 'text-red-800'
            }`}>
              {canMatch ? 'Transactions Match' : 'Transactions Do Not Match'}
            </span>
          </div>
          {!canMatch && (
            <p className="text-sm text-red-600 mt-2">
              Amount, type, or other criteria do not match between the selected transactions.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
            Comments (Optional)
          </label>
          <textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any additional notes or comments..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={userRole !== 'maker' && userRole !== 'admin'}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Reconciliation
          </button>
        </div>
      </form>
    </div>
  );
};