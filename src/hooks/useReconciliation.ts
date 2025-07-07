import { useState, useCallback } from 'react';
import { Transaction, ReconciliationEntry, User, UserRole, FileUpload, PaginatedResponse, FileUploadSearchParams } from '../types';
import { mockBankTransactions, mockSystemTransactions, mockReconciliationEntries, mockUsers, mockFileUploads } from '../data/mockData';

export const useReconciliation = () => {
  const [bankTransactions, setBankTransactions] = useState<Transaction[]>(mockBankTransactions);
  const [systemTransactions, setSystemTransactions] = useState<Transaction[]>(mockSystemTransactions);
  const [reconciliationEntries, setReconciliationEntries] = useState<ReconciliationEntry[]>(mockReconciliationEntries);
  const [fileUploads, setFileUploads] = useState<FileUpload[]>(mockFileUploads);
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);

  // Simulate backend search and pagination
  const searchFileUploads = useCallback(async (params: FileUploadSearchParams): Promise<PaginatedResponse<FileUpload>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredFiles = [...fileUploads];

    // Apply filters
    if (params.organization && params.organization !== 'all') {
      filteredFiles = filteredFiles.filter(file => 
        file.organization?.toLowerCase().includes(params.organization!.toLowerCase())
      );
    }

    if (params.schedule && params.schedule !== 'all') {
      filteredFiles = filteredFiles.filter(file => 
        file.schedule?.toLowerCase().includes(params.schedule!.toLowerCase())
      );
    }

    if (params.status && params.status !== 'all') {
      filteredFiles = filteredFiles.filter(file => file.status === params.status);
    }

    if (params.searchTerm && params.searchTerm.trim()) {
      const searchLower = params.searchTerm.toLowerCase();
      filteredFiles = filteredFiles.filter(file => 
        file.fileName.toLowerCase().includes(searchLower) ||
        file.uploadedBy.toLowerCase().includes(searchLower) ||
        file.remarks?.toLowerCase().includes(searchLower) ||
        file.organization?.toLowerCase().includes(searchLower) ||
        file.schedule?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by upload date (newest first)
    filteredFiles.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    // Apply pagination
    const totalItems = filteredFiles.length;
    const totalPages = Math.ceil(totalItems / params.pageSize);
    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

    return {
      data: paginatedFiles,
      pagination: {
        currentPage: params.page,
        pageSize: params.pageSize,
        totalItems,
        totalPages,
        hasNextPage: params.page < totalPages,
        hasPreviousPage: params.page > 1
      },
      filters: {
        organization: params.organization,
        schedule: params.schedule,
        status: params.status,
        searchTerm: params.searchTerm
      }
    };
  }, [fileUploads]);

  const createReconciliation = useCallback((entry: Omit<ReconciliationEntry, 'id' | 'createdAt'>) => {
    const newEntry: ReconciliationEntry = {
      ...entry,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setReconciliationEntries(prev => [...prev, newEntry]);
    
    // Update transaction statuses
    setBankTransactions(prev => 
      prev.map(t => t.id === entry.bankTransactionId ? { ...t, status: 'pending' } : t)
    );
    setSystemTransactions(prev => 
      prev.map(t => t.id === entry.systemTransactionId ? { ...t, status: 'pending' } : t)
    );
  }, []);

  const approveReconciliation = useCallback((entryId: string, comments?: string) => {
    setReconciliationEntries(prev => 
      prev.map(entry => 
        entry.id === entryId 
          ? { 
              ...entry, 
              status: 'approved', 
              approvedBy: currentUser.name,
              approvedAt: new Date().toISOString(),
              comments: comments || entry.comments
            }
          : entry
      )
    );

    // Update transaction statuses
    const entry = reconciliationEntries.find(e => e.id === entryId);
    if (entry) {
      setBankTransactions(prev => 
        prev.map(t => t.id === entry.bankTransactionId ? { ...t, status: 'reconciled' } : t)
      );
      setSystemTransactions(prev => 
        prev.map(t => t.id === entry.systemTransactionId ? { ...t, status: 'reconciled' } : t)
      );
    }
  }, [currentUser.name, reconciliationEntries]);

  const rejectReconciliation = useCallback((entryId: string, reason: string) => {
    setReconciliationEntries(prev => 
      prev.map(entry => 
        entry.id === entryId 
          ? { 
              ...entry, 
              status: 'rejected', 
              rejectionReason: reason,
              approvedBy: currentUser.name,
              approvedAt: new Date().toISOString()
            }
          : entry
      )
    );

    // Update transaction statuses back to unreconciled
    const entry = reconciliationEntries.find(e => e.id === entryId);
    if (entry) {
      setBankTransactions(prev => 
        prev.map(t => t.id === entry.bankTransactionId ? { ...t, status: 'unreconciled' } : t)
      );
      setSystemTransactions(prev => 
        prev.map(t => t.id === entry.systemTransactionId ? { ...t, status: 'unreconciled' } : t)
      );
    }
  }, [currentUser.name, reconciliationEntries]);

  const handleFileUpload = useCallback((file: File, source: 'bank' | 'system', organization: string, schedule: string, remarks?: string) => {
    // Generate mock transactions for the uploaded file
    const generateMockTransactions = (count: number): Transaction[] => {
      const transactions: Transaction[] = [];
      const baseDate = new Date();
      
      for (let i = 0; i < count; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        transactions.push({
          id: `${source}-upload-${Date.now()}-${i}`,
          date: date.toISOString().split('T')[0],
          amount: Math.round((Math.random() * 5000 + 100) * 100) / 100,
          description: `${source === 'bank' ? 'Bank' : 'System'} Transaction ${i + 1} from ${file.name}`,
          type: Math.random() > 0.5 ? 'credit' : 'debit',
          reference: `${source.toUpperCase()}-REF-${Date.now()}-${String(i + 1).padStart(3, '0')}`,
          status: 'unreconciled',
          source,
          accountId: `ACC-${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`,
          transId: `${source.charAt(0).toUpperCase()}${Date.now()}-${String(i + 1).padStart(3, '0')}`
        });
      }
      
      return transactions;
    };

    const transactionCount = Math.floor(Math.random() * 15) + 5;
    const mockTransactions = generateMockTransactions(transactionCount);

    const newFileUpload: FileUpload = {
      id: `file-${Date.now()}`,
      fileName: file.name,
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString(),
      status: 'pending_approval',
      transactionCount,
      source,
      transactions: mockTransactions,
      organization,
      schedule,
      remarks
    };

    setFileUploads(prev => [...prev, newFileUpload]);
  }, [currentUser.name]);

  const approveFile = useCallback((fileId: string, comments?: string) => {
    const file = fileUploads.find(f => f.id === fileId);
    if (!file) return;

    setFileUploads(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { 
              ...file, 
              status: 'approved', 
              approvedBy: currentUser.name,
              approvedAt: new Date().toISOString()
            }
          : file
      )
    );

    // Add the file's transactions to the appropriate transaction list
    if (file.source === 'bank') {
      setBankTransactions(prev => [...prev, ...file.transactions]);
    } else {
      setSystemTransactions(prev => [...prev, ...file.transactions]);
    }
  }, [currentUser.name, fileUploads]);

  const rejectFile = useCallback((fileId: string, reason: string) => {
    setFileUploads(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { 
              ...file, 
              status: 'rejected', 
              rejectionReason: reason,
              approvedBy: currentUser.name,
              approvedAt: new Date().toISOString()
            }
          : file
      )
    );
  }, [currentUser.name]);

  const addIndividualTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'status'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `${transaction.source}-${Date.now()}`,
      status: 'unreconciled'
    };

    if (transaction.source === 'bank') {
      setBankTransactions(prev => [...prev, newTransaction]);
    } else {
      setSystemTransactions(prev => [...prev, newTransaction]);
    }
  }, []);

  const changeUserRole = useCallback((role: UserRole) => {
    const user = mockUsers.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  return {
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
  };
};