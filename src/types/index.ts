export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: 'debit' | 'credit';
  reference: string;
  status: 'unreconciled' | 'reconciled' | 'pending';
  source: 'bank' | 'system';
  accountId?: string;
  transId?: string;
}

export interface ReconciliationEntry {
  id: string;
  bankTransactionId: string;
  systemTransactionId: string;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  comments?: string;
  rejectionReason?: string;
}

export interface FileUpload {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  transactionCount: number;
  source: 'bank' | 'system';
  transactions: Transaction[];
}

export interface User {
  id: string;
  name: string;
  role: 'maker' | 'checker' | 'admin';
  email: string;
}

export type UserRole = 'maker' | 'checker' | 'admin';