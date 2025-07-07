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

  const TransactionTable: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => (
    <div className="mt-4 overflow-hidden border border-gray-200 rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction, index) => (
              <tr key={transaction.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {transaction.accountId}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {transaction.transId}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                  {transaction.description}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center">
                    {transaction.type === 'credit' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`font-medium ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className={`font-semibold ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {transaction.reference}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {transactions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No transactions found in this file.
        </div>
      )}
    </div>
  );

  const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className = "" }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'approved':
          return {
            icon: CheckCircle,
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
            iconColor: 'text-green-600'
          };
        case 'rejected':
          return {
            icon: XCircle,
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
            iconColor: 'text-red-600'
          };
        case 'pending_approval':
          return {
            icon: AlertCircle,
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-800',
            iconColor: 'text-yellow-600'
          };
        default:
          return {
            icon: AlertCircle,
            bgColor: 'bg-gray-100',
            textColor: 'text-gray-800',
            iconColor: 'text-gray-600'
          };
      }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}>
        <Icon className={`h-3 w-3 mr-1 ${config.iconColor}`} />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      {canUpload && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Transaction File</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Source
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="bank"
                  checked={selectedSource === 'bank'}
                  onChange={(e) => setSelectedSource(e.target.value as 'bank' | 'system')}
                  className="mr-2"
                />
                Bank Transactions
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="system"
                  checked={selectedSource === 'system'}
                  onChange={(e) => setSelectedSource(e.target.value as 'bank' | 'system')}
                  className="mr-2"
                />
                System Transactions
              </label>
            </div>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop your Excel file here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports .xlsx and .xls files with columns: accountId, transactionDate, transId, amount, description, type
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Choose File
            </label>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Excel File Format Requirements:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>accountId:</strong> Account identifier</li>
              <li>• <strong>transactionDate:</strong> Date in YYYY-MM-DD format</li>
              <li>• <strong>transId:</strong> Unique transaction ID</li>
              <li>• <strong>amount:</strong> Transaction amount (positive number)</li>
              <li>• <strong>description:</strong> Transaction description</li>
              <li>• <strong>type:</strong> Either "credit" or "debit"</li>
            </ul>
          </div>
        </div>
      )}

      {/* File Approval Queue */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">File Approval Queue</h3>
          <p className="text-sm text-gray-500 mt-1">
            {pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''} pending approval
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {fileUploads.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Files Uploaded</h3>
              <p className="text-gray-500">Upload Excel files to begin the reconciliation process.</p>
            </div>
          ) : (
            fileUploads.map((file) => {
              const isSelected = selectedFile === file.id;
              const showingTransactions = showTransactions === file.id;
              
              return (
                <div key={file.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        file.source === 'bank' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        <FileText className={`h-5 w-5 ${
                          file.source === 'bank' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{file.fileName}</h4>
                        <p className="text-sm text-gray-500">
                          {file.transactionCount} transactions • Uploaded by {file.uploadedBy} • {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <StatusBadge status={file.status} />
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-800 font-medium transition-colors"
                        title="Download file"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                      <button
                        onClick={() => setShowTransactions(showingTransactions ? null : file.id)}
                        className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        {showingTransactions ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Hide Transactions
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            View Transactions
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setSelectedFile(isSelected ? null : file.id)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        {isSelected ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>

                  {/* Approval/Rejection Remarks Display */}
                  {(file.status === 'approved' || file.status === 'rejected') && (
                    <div className={`mb-4 p-4 rounded-lg border ${
                      file.status === 'approved' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start space-x-3">
                        {file.status === 'approved' ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className={`text-sm font-medium ${
                              file.status === 'approved' ? 'text-green-900' : 'text-red-900'
                            }`}>
                              {file.status === 'approved' ? 'File Approved' : 'File Rejected'}
                            </h5>
                            <span className={`text-xs ${
                              file.status === 'approved' ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {file.approvedBy} • {file.approvedAt && new Date(file.approvedAt).toLocaleString()}
                            </span>
                          </div>
                          {file.rejectionReason && (
                            <div className="bg-white p-3 rounded border border-red-200">
                              <p className="text-sm text-red-800">
                                <strong>Reason:</strong> {file.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {showingTransactions && (
                    <div className="mb-6">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">
                        Transaction Details ({file.transactionCount} transactions)
                      </h5>
                      <TransactionTable transactions={file.transactions} />
                    </div>
                  )}

                  {isSelected && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-2">File Details</h5>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Source:</span> {file.source === 'bank' ? 'Bank' : 'System'}</p>
                            <p><span className="font-medium">Transactions:</span> {file.transactionCount}</p>
                            <p><span className="font-medium">Uploaded:</span> {new Date(file.uploadedAt).toLocaleString()}</p>
                          </div>
                        </div>

                        {file.approvedBy && file.status === 'approved' && (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h5 className="font-medium text-green-900 mb-2">Approval Details</h5>
                            <div className="space-y-2 text-sm">
                              <p><span className="font-medium">Approved by:</span> {file.approvedBy}</p>
                              <p><span className="font-medium">Approved at:</span> {file.approvedAt && new Date(file.approvedAt).toLocaleString()}</p>
                            </div>
                          </div>
                        )}

                        {file.rejectionReason && file.status === 'rejected' && (
                          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <h5 className="font-medium text-red-900 mb-2">Rejection Details</h5>
                            <div className="space-y-2 text-sm">
                              <p><span className="font-medium">Rejected by:</span> {file.approvedBy}</p>
                              <p><span className="font-medium">Rejected at:</span> {file.approvedAt && new Date(file.approvedAt).toLocaleString()}</p>
                              <div className="mt-2 p-2 bg-white rounded border">
                                <p className="text-red-800"><strong>Reason:</strong> {file.rejectionReason}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Approval Form - Always show for pending files when user can approve */}
                      {file.status === 'pending_approval' && canApprove && (
                        <div className="space-y-4 border-t pt-4 bg-gray-50 p-4 rounded-lg">
                          <h5 className="text-lg font-medium text-gray-900 mb-4">File Approval</h5>
                          
                          <div>
                            <label htmlFor={`approval-comments-${file.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                              Approval Comments (Optional)
                            </label>
                            <textarea
                              id={`approval-comments-${file.id}`}
                              value={approvalComments[file.id] || ''}
                              onChange={(e) => updateApprovalComments(file.id, e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Add any comments for this approval..."
                            />
                          </div>

                          <div>
                            <label htmlFor={`rejection-reason-${file.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                              Rejection Reason (Required if rejecting)
                            </label>
                            <textarea
                              id={`rejection-reason-${file.id}`}
                              value={rejectionReasons[file.id] || ''}
                              onChange={(e) => updateRejectionReason(file.id, e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              placeholder="Provide detailed reason for rejection..."
                            />
                          </div>

                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => handleReject(file.id)}
                              disabled={!rejectionReasons[file.id]?.trim()}
                              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject File
                            </button>
                            <button
                              onClick={() => handleApprove(file.id)}
                              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve File
                            </button>
                          </div>
                        </div>
                      )}

                      {file.status === 'pending_approval' && !canApprove && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                            <p className="text-sm text-yellow-800">
                              You need checker or admin role to approve file uploads.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};