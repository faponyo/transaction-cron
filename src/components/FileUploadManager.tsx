import React, { useState } from 'react';
import { FileUpload, Transaction } from '../types';
import { Upload, FileText, Check, X, AlertCircle, Download, ArrowUpRight, ArrowDownRight, Eye, EyeOff, MessageCircle, CheckCircle, XCircle } from 'lucide-react';

interface FileUploadManagerProps {
  fileUploads: FileUpload[];
  onFileUpload: (file: File, source: 'bank' | 'system') => void;
  onApproveFile: (fileId: string, comments?: string) => void;
  onRejectFile: (fileId: string, reason: string) => void;
  userRole: string;
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  fileUploads,
  onFileUpload,
  onApproveFile,
  onRejectFile,
  userRole
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedSource, setSelectedSource] = useState<'bank' | 'system'>('bank');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showTransactions, setShowTransactions] = useState<string | null>(null);
  const [approvalComments, setApprovalComments] = useState<{ [key: string]: string }>({});
  const [rejectionReasons, setRejectionReasons] = useState<{ [key: string]: string }>({});

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.type === 'application/vnd.ms-excel') {
      onFileUpload(file, selectedSource);
    } else {
      alert('Please upload only Excel files (.xlsx or .xls)');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDownloadFile = (file: FileUpload) => {
    // Create a mock Excel file with the transaction data
    const csvContent = generateCSVContent(file.transactions);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', file.fileName.replace('.xlsx', '.csv').replace('.xls', '.csv'));
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateCSVContent = (transactions: Transaction[]): string => {
    const headers = ['accountId', 'transactionDate', 'transId', 'amount', 'description', 'type', 'reference'];
    const csvRows = [headers.join(',')];
    
    transactions.forEach(transaction => {
      const row = [
        transaction.accountId || '',
        transaction.date,
        transaction.transId || '',
        transaction.amount.toString(),
        `"${transaction.description.replace(/"/g, '""')}"`, // Escape quotes in description
        transaction.type,
        transaction.reference
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  };

  const handleApprove = (fileId: string) => {
    const comments = approvalComments[fileId];
    onApproveFile(fileId, comments || undefined);
    setApprovalComments(prev => ({ ...prev, [fileId]: '' }));
    setSelectedFile(null);
  };

  const handleReject = (fileId: string) => {
    const reason = rejectionReasons[fileId];
    if (!reason?.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    onRejectFile(fileId, reason);
    setRejectionReasons(prev => ({ ...prev, [fileId]: '' }));
    setSelectedFile(null);
  };

  const updateApprovalComments = (fileId: string, comments: string) => {
    setApprovalComments(prev => ({ ...prev, [fileId]: comments }));
  };

  const updateRejectionReason = (fileId: string, reason: string) => {
    setRejectionReasons(prev => ({ ...prev, [fileId]: reason }));
  };

  const canUpload = userRole === 'maker' || userRole === 'admin';
  const canApprove = userRole === 'checker' || userRole === 'admin';

  const pendingFiles = fileUploads.filter(file => file.status === 'pending_approval');

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

  const TransactionTable: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => (
    <div className="mt-3">
      <div className="table-responsive">
        <table className="table table-sm">
          <thead className="table-light">
            <tr>
              <th>Account ID</th>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Description</th>
              <th>Type</th>
              <th className="text-end">Amount</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={transaction.id}>
                <td className="fw-medium">{transaction.accountId}</td>
                <td>{transaction.transId}</td>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td className="text-truncate" style={{ maxWidth: '200px' }}>
                  {transaction.description}
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    {transaction.type === 'credit' ? (
                      <ArrowUpRight className="text-success me-1" size={16} />
                    ) : (
                      <ArrowDownRight className="text-danger me-1" size={16} />
                    )}
                    <span className={`fw-medium ${
                      transaction.type === 'credit' ? 'text-success' : 'text-danger'
                    }`}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="text-end">
                  <span className={`fw-bold ${
                    transaction.type === 'credit' ? 'text-success' : 'text-danger'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </span>
                </td>
                <td>{transaction.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <div className="text-center py-4 text-muted">
            No transactions found in this file.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container-fluid">
      {/* File Upload Section */}
      {canUpload && (
        <div className="card mb-4">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">Upload Transaction File</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label fw-medium">Transaction Source</label>
              <div className="d-flex gap-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    value="bank"
                    checked={selectedSource === 'bank'}
                    onChange={(e) => setSelectedSource(e.target.value as 'bank' | 'system')}
                    id="source-bank"
                  />
                  <label className="form-check-label" htmlFor="source-bank">
                    Bank Transactions
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    value="system"
                    checked={selectedSource === 'system'}
                    onChange={(e) => setSelectedSource(e.target.value as 'bank' | 'system')}
                    id="source-system"
                  />
                  <label className="form-check-label" htmlFor="source-system">
                    System Transactions
                  </label>
                </div>
              </div>
            </div>

            <div
              className={`file-upload-zone p-5 text-center ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="text-muted mb-3" size={48} />
              <h6 className="mb-2">Drop your Excel file here, or click to browse</h6>
              <p className="text-muted mb-3">
                Supports .xlsx and .xls files with columns: accountId, transactionDate, transId, amount, description, type
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInputChange}
                className="d-none"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="btn btn-primary">
                Choose File
              </label>
            </div>

            <div className="alert alert-info mt-3">
              <h6 className="alert-heading">Excel File Format Requirements:</h6>
              <ul className="mb-0 small">
                <li><strong>accountId:</strong> Account identifier</li>
                <li><strong>transactionDate:</strong> Date in YYYY-MM-DD format</li>
                <li><strong>transId:</strong> Unique transaction ID</li>
                <li><strong>amount:</strong> Transaction amount (positive number)</li>
                <li><strong>description:</strong> Transaction description</li>
                <li><strong>type:</strong> Either "credit" or "debit"</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* File Approval Queue */}
      <div className="card">
        <div className="card-header bg-white">
          <h5 className="card-title mb-1">File Approval Queue</h5>
          <p className="card-text small text-muted mb-0">
            {pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''} pending approval
          </p>
        </div>

        <div className="card-body p-0">
          {fileUploads.length === 0 ? (
            <div className="text-center py-5">
              <FileText className="text-muted mb-3" size={48} />
              <h5 className="mb-2">No Files Uploaded</h5>
              <p className="text-muted">Upload Excel files to begin the reconciliation process.</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {fileUploads.map((file) => {
                const isSelected = selectedFile === file.id;
                const showingTransactions = showTransactions === file.id;
                
                return (
                  <div key={file.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center">
                        <div className={`p-2 rounded-circle me-3 ${
                          file.source === 'bank' ? 'bg-primary bg-opacity-10' : 'bg-success bg-opacity-10'
                        }`}>
                          <FileText className={`${
                            file.source === 'bank' ? 'text-primary' : 'text-success'
                          }`} size={20} />
                        </div>
                        <div>
                          <h6 className="mb-1 fw-medium">{file.fileName}</h6>
                          <p className="mb-0 small text-muted">
                            {file.transactionCount} transactions • Uploaded by {file.uploadedBy} • {new Date(file.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <StatusBadge status={file.status} />
                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="btn btn-outline-success btn-sm d-flex align-items-center"
                          title="Download file"
                        >
                          <Download className="me-1" size={14} />
                          Download
                        </button>
                        <button
                          onClick={() => setShowTransactions(showingTransactions ? null : file.id)}
                          className="btn btn-outline-primary btn-sm d-flex align-items-center"
                        >
                          {showingTransactions ? (
                            <>
                              <EyeOff className="me-1" size={14} />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="me-1" size={14} />
                              View
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setSelectedFile(isSelected ? null : file.id)}
                          className="btn btn-outline-secondary btn-sm"
                        >
                          {isSelected ? 'Hide Details' : 'Details'}
                        </button>
                      </div>
                    </div>

                    {/* Approval/Rejection Remarks Display */}
                    {(file.status === 'approved' || file.status === 'rejected') && (
                      <div className={`alert ${
                        file.status === 'approved' ? 'alert-success' : 'alert-danger'
                      } mb-3`}>
                        <div className="d-flex align-items-start">
                          {file.status === 'approved' ? (
                            <CheckCircle className="me-2 mt-1" size={20} />
                          ) : (
                            <XCircle className="me-2 mt-1" size={20} />
                          )}
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="mb-0">
                                {file.status === 'approved' ? 'File Approved' : 'File Rejected'}
                              </h6>
                              <small className="text-muted">
                                {file.approvedBy} • {file.approvedAt && new Date(file.approvedAt).toLocaleString()}
                              </small>
                            </div>
                            {file.rejectionReason && (
                              <div className="alert alert-light border mb-0">
                                <strong>Reason:</strong> {file.rejectionReason}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {showingTransactions && (
                      <div className="mb-3">
                        <h6 className="fw-medium mb-2">
                          Transaction Details ({file.transactionCount} transactions)
                        </h6>
                        <TransactionTable transactions={file.transactions} />
                      </div>
                    )}

                    {isSelected && (
                      <div className="mt-3">
                        <div className="row g-3 mb-4">
                          <div className="col-md-4">
                            <div className="p-3 bg-light rounded">
                              <h6 className="fw-medium mb-2">File Details</h6>
                              <div className="small">
                                <p className="mb-1"><span className="fw-medium">Source:</span> {file.source === 'bank' ? 'Bank' : 'System'}</p>
                                <p className="mb-1"><span className="fw-medium">Transactions:</span> {file.transactionCount}</p>
                                <p className="mb-0"><span className="fw-medium">Uploaded:</span> {new Date(file.uploadedAt).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Approval Form - Always show for pending files when user can approve */}
                        {file.status === 'pending_approval' && canApprove && (
                          <div className="border-top pt-4 bg-light p-3 rounded">
                            <h6 className="mb-3">File Approval</h6>
                            
                            <div className="mb-3">
                              <label htmlFor={`approval-comments-${file.id}`} className="form-label fw-medium">
                                Approval Comments (Optional)
                              </label>
                              <textarea
                                id={`approval-comments-${file.id}`}
                                value={approvalComments[file.id] || ''}
                                onChange={(e) => updateApprovalComments(file.id, e.target.value)}
                                rows={3}
                                className="form-control"
                                placeholder="Add any comments for this approval..."
                              />
                            </div>

                            <div className="mb-3">
                              <label htmlFor={`rejection-reason-${file.id}`} className="form-label fw-medium">
                                Rejection Reason (Required if rejecting)
                              </label>
                              <textarea
                                id={`rejection-reason-${file.id}`}
                                value={rejectionReasons[file.id] || ''}
                                onChange={(e) => updateRejectionReason(file.id, e.target.value)}
                                rows={3}
                                className="form-control"
                                placeholder="Provide detailed reason for rejection..."
                              />
                            </div>

                            <div className="d-flex justify-content-end gap-2">
                              <button
                                onClick={() => handleReject(file.id)}
                                disabled={!rejectionReasons[file.id]?.trim()}
                                className="btn btn-danger d-flex align-items-center"
                              >
                                <X className="me-1" size={16} />
                                Reject File
                              </button>
                              <button
                                onClick={() => handleApprove(file.id)}
                                className="btn btn-success d-flex align-items-center"
                              >
                                <Check className="me-1" size={16} />
                                Approve File
                              </button>
                            </div>
                          </div>
                        )}

                        {file.status === 'pending_approval' && !canApprove && (
                          <div className="alert alert-warning">
                            <div className="d-flex align-items-center">
                              <AlertCircle className="me-2" size={20} />
                              <p className="mb-0">
                                You need checker or admin role to approve file uploads.
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
    </div>
  );
};