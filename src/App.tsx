import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { ReconciliationForm } from './components/ReconciliationForm';
import { ApprovalQueue } from './components/ApprovalQueue';
import { FileUploadManager } from './components/FileUploadManager';
import { IndividualTransactionForm } from './components/IndividualTransactionForm';
import { useReconciliation } from './hooks/useReconciliation';
import { Transaction } from './types';

function App() {
  const {
    bankTransactions,
    systemTransactions,
    reconciliationEntries,
    fileUploads,
    currentUser,
    createReconciliation,
    approveReconciliation,
    rejectReconciliation,
    handleFileUpload,
    approveFile,
    rejectFile,
    addIndividualTransaction,
    changeUserRole,
  } = useReconciliation();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'individual' | 'reconcile' | 'approve'>('dashboard');
  const [selectedBankTransaction, setSelectedBankTransaction] = useState<Transaction | null>(null);
  const [selectedSystemTransaction, setSelectedSystemTransaction] = useState<Transaction | null>(null);

  const handleCreateReconciliation = (entry: any) => {
    createReconciliation(entry);
    setSelectedBankTransaction(null);
    setSelectedSystemTransaction(null);
  };

  const handleCancelReconciliation = () => {
    setSelectedBankTransaction(null);
    setSelectedSystemTransaction(null);
  };

  const handleLogout = () => {
    // In a real app, this would handle logout logic
    console.log('Logout clicked');
  };

  // Filter unreconciled transactions
  const unreconciled = (transactions: Transaction[]) => 
    transactions.filter(t => t.status === 'unreconciled');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentUser={currentUser}
        onRoleChange={changeUserRole}
        onLogout={handleLogout}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-8">
          <div className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'upload' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              File Upload
            </button>
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'individual' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Individual Entry
            </button>
            <button
              onClick={() => setActiveTab('reconcile')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'reconcile' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Reconcile
            </button>
            <button
              onClick={() => setActiveTab('approve')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'approve' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Approve
            </button>
          </div>
        </nav>

        {activeTab === 'dashboard' && (
          <Dashboard 
            reconciliationEntries={reconciliationEntries}
            bankTransactions={bankTransactions}
            systemTransactions={systemTransactions}
            fileUploads={fileUploads}
          />
        )}

        {activeTab === 'upload' && (
          <FileUploadManager
            fileUploads={fileUploads}
            onFileUpload={handleFileUpload}
            onApproveFile={approveFile}
            onRejectFile={rejectFile}
            userRole={currentUser.role}
          />
        )}

        {activeTab === 'individual' && (
          <IndividualTransactionForm
            onAddTransaction={addIndividualTransaction}
            userRole={currentUser.role}
          />
        )}

        {activeTab === 'reconcile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TransactionList
              title="Bank Transactions"
              transactions={unreconciled(bankTransactions)}
              selectedTransaction={selectedBankTransaction}
              onTransactionSelect={setSelectedBankTransaction}
            />
            <TransactionList
              title="System Transactions"
              transactions={unreconciled(systemTransactions)}
              selectedTransaction={selectedSystemTransaction}
              onTransactionSelect={setSelectedSystemTransaction}
            />
            <div className="lg:col-span-1">
              <ReconciliationForm
                bankTransaction={selectedBankTransaction}
                systemTransaction={selectedSystemTransaction}
                onSubmit={handleCreateReconciliation}
                onCancel={handleCancelReconciliation}
                userRole={currentUser.role}
              />
            </div>
          </div>
        )}

        {activeTab === 'approve' && (
          <ApprovalQueue
            entries={reconciliationEntries}
            bankTransactions={bankTransactions}
            systemTransactions={systemTransactions}
            onApprove={approveReconciliation}
            onReject={rejectReconciliation}
            userRole={currentUser.role}
          />
        )}
      </div>
    </div>
  );
}

export default App;