import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { ReconciliationForm } from './components/ReconciliationForm';
import { ApprovalQueue } from './components/ApprovalQueue';
import FileUploadManager from './components/FileUploadManager';
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
    searchFileUploads,
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
    <div className="min-vh-100 bg-light">
      <Header 
        currentUser={currentUser}
        onRoleChange={changeUserRole}
        onLogout={handleLogout}
      />
      
      <div className="container-fluid py-4">
        <nav className="mb-4">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('upload')}
                className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`}
              >
                File Upload
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('individual')}
                className={`nav-link ${activeTab === 'individual' ? 'active' : ''}`}
              >
                Individual Entry
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('reconcile')}
                className={`nav-link ${activeTab === 'reconcile' ? 'active' : ''}`}
              >
                Reconcile
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('approve')}
                className={`nav-link ${activeTab === 'approve' ? 'active' : ''}`}
              >
                Approve
              </button>
            </li>
          </ul>
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
            onSearchFiles={searchFileUploads}
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
          <div className="row g-4">
            <div className="col-lg-4">
              <TransactionList
                title="Bank Transactions"
                transactions={unreconciled(bankTransactions)}
                selectedTransaction={selectedBankTransaction}
                onTransactionSelect={setSelectedBankTransaction}
              />
            </div>
            <div className="col-lg-4">
              <TransactionList
                title="System Transactions"
                transactions={unreconciled(systemTransactions)}
                selectedTransaction={selectedSystemTransaction}
                onTransactionSelect={setSelectedSystemTransaction}
              />
            </div>
            <div className="col-lg-4">
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