import { Transaction, ReconciliationEntry, User, FileUpload } from '../types';

export const mockUsers: User[] = [
  { id: '1', name: 'John Doe', role: 'maker', email: 'john@company.com' },
  { id: '2', name: 'Jane Smith', role: 'checker', email: 'jane@company.com' },
  { id: '3', name: 'Admin User', role: 'admin', email: 'admin@company.com' },
];

export const mockBankTransactions: Transaction[] = [
  {
    id: 'bank-1',
    date: '2024-01-15',
    amount: 1250.00,
    description: 'Payment from ABC Corp',
    type: 'credit',
    reference: 'TXN-2024-001',
    status: 'unreconciled',
    source: 'bank',
    accountId: 'ACC-001',
    transId: 'B001'
  },
  {
    id: 'bank-2',
    date: '2024-01-16',
    amount: 850.75,
    description: 'Office Supplies Purchase',
    type: 'debit',
    reference: 'TXN-2024-002',
    status: 'unreconciled',
    source: 'bank',
    accountId: 'ACC-002',
    transId: 'B002'
  },
  {
    id: 'bank-3',
    date: '2024-01-17',
    amount: 2100.00,
    description: 'Service Fee Payment',
    type: 'credit',
    reference: 'TXN-2024-003',
    status: 'unreconciled',
    source: 'bank',
    accountId: 'ACC-003',
    transId: 'B003'
  }
];

export const mockSystemTransactions: Transaction[] = [
  {
    id: 'sys-1',
    date: '2024-01-15',
    amount: 1250.00,
    description: 'ABC Corp Invoice Payment',
    type: 'credit',
    reference: 'INV-2024-001',
    status: 'unreconciled',
    source: 'system',
    accountId: 'ACC-001',
    transId: 'S001'
  },
  {
    id: 'sys-2',
    date: '2024-01-16',
    amount: 850.75,
    description: 'Office Supplies - Staples',
    type: 'debit',
    reference: 'PO-2024-001',
    status: 'unreconciled',
    source: 'system',
    accountId: 'ACC-002',
    transId: 'S002'
  },
  {
    id: 'sys-3',
    date: '2024-01-17',
    amount: 2100.00,
    description: 'Professional Services',
    type: 'credit',
    reference: 'SVC-2024-001',
    status: 'unreconciled',
    source: 'system',
    accountId: 'ACC-003',
    transId: 'S003'
  }
];

export const mockReconciliationEntries: ReconciliationEntry[] = [
  {
    id: 'rec-1',
    bankTransactionId: 'bank-1',
    systemTransactionId: 'sys-1',
    createdBy: 'John Doe',
    createdAt: '2024-01-18T10:30:00Z',
    status: 'pending_approval',
    comments: 'Amounts and dates match perfectly'
  },
  {
    id: 'rec-2',
    bankTransactionId: 'bank-2',
    systemTransactionId: 'sys-2',
    createdBy: 'John Doe',
    createdAt: '2024-01-18T11:15:00Z',
    approvedBy: 'Jane Smith',
    approvedAt: '2024-01-18T14:20:00Z',
    status: 'approved',
    comments: 'Verified with purchase order. All documentation matches.'
  },
  {
    id: 'rec-3',
    bankTransactionId: 'bank-3',
    systemTransactionId: 'sys-3',
    createdBy: 'John Doe',
    createdAt: '2024-01-19T09:45:00Z',
    approvedBy: 'Jane Smith',
    approvedAt: '2024-01-19T15:30:00Z',
    status: 'rejected',
    rejectionReason: 'Amount discrepancy found. Bank shows $2,100 but system shows $2,000. Please investigate and resubmit with correct amounts.',
    comments: 'Initial reconciliation attempt'
  }
];

// Mock transactions for file uploads
const generateMockTransactions = (source: 'bank' | 'system', count: number, fileId: string): Transaction[] => {
  const transactions: Transaction[] = [];
  const baseDate = new Date('2024-01-20');
  
  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    
    transactions.push({
      id: `${source}-${fileId}-${i + 1}`,
      date: date.toISOString().split('T')[0],
      amount: Math.round((Math.random() * 5000 + 100) * 100) / 100,
      description: `${source === 'bank' ? 'Bank' : 'System'} Transaction ${i + 1} from file`,
      type: Math.random() > 0.5 ? 'credit' : 'debit',
      reference: `${source.toUpperCase()}-REF-${fileId}-${String(i + 1).padStart(3, '0')}`,
      status: 'unreconciled',
      source,
      accountId: `ACC-${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`,
      transId: `${source.charAt(0).toUpperCase()}${fileId}-${String(i + 1).padStart(3, '0')}`
    });
  }
  
  return transactions;
};

export const mockFileUploads: FileUpload[] = [
  {
    id: 'file-1',
    fileName: 'bank_transactions_jan_2024.xlsx',
    uploadedBy: 'John Doe',
    uploadedAt: '2024-01-18T09:00:00Z',
    status: 'pending_approval',
    transactionCount: 8,
    source: 'bank',
    transactions: generateMockTransactions('bank', 8, 'file-1'),
    organization: 'Head Office',
    schedule: 'Daily',
    remarks: 'Regular daily bank statement upload for January 2024'
  },
  {
    id: 'file-2',
    fileName: 'system_transactions_jan_2024.xlsx',
    uploadedBy: 'John Doe',
    uploadedAt: '2024-01-18T09:30:00Z',
    status: 'approved',
    approvedBy: 'Jane Smith',
    approvedAt: '2024-01-18T10:00:00Z',
    transactionCount: 6,
    source: 'system',
    transactions: generateMockTransactions('system', 6, 'file-2'),
    organization: 'Branch A',
    schedule: 'Weekly',
    remarks: 'Weekly system transaction export for reconciliation'
  },
  {
    id: 'file-3',
    fileName: 'bank_transactions_feb_2024.xlsx',
    uploadedBy: 'John Doe',
    uploadedAt: '2024-01-19T14:15:00Z',
    status: 'rejected',
    rejectionReason: 'Invalid date format in rows 5-7. Please correct the date format to YYYY-MM-DD and re-upload. Also found duplicate transaction IDs in rows 10 and 15.',
    approvedBy: 'Jane Smith',
    approvedAt: '2024-01-19T16:45:00Z',
    transactionCount: 12,
    source: 'bank',
    transactions: generateMockTransactions('bank', 12, 'file-3'),
    organization: 'Regional Office North',
    schedule: 'Monthly',
    remarks: 'February month-end bank statement with corrections needed'
  }
];