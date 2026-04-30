import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Wallet, Download, List, Grid, Edit2, Paperclip, Eye } from 'lucide-react';
import { exportToCSV, formatDate, formatCurrency } from '../../utils/exportUtils';
import DateRangePicker from '../../components/common/DateRangePicker';
import { useToast } from '../../contexts/ToastContext';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const fmt = (cur, n) => `${cur} ${round2(n).toFixed(2)}`;

const Withdrawals = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState(searchParams.get('paymentMethod') || '');
  const [dateRange, setDateRange] = useState({
    startDate: searchParams.get('startDate') || null,
    endDate: searchParams.get('endDate') || null,
  });
  const [viewMode, setViewMode] = useState('detailed');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [viewingWithdrawal, setViewingWithdrawal] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [paymentEvidenceFile, setPaymentEvidenceFile] = useState(null);
  const page = parseInt(searchParams.get('page') || '1');

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, formData }) => adminService.updateWithdrawalStatus(id, formData),
    onSuccess: () => {
      showSuccess('Withdrawal status updated.');
      setShowUpdateModal(false);
      setSelectedWithdrawal(null);
      setUpdateStatus('');
      setAdminNotes('');
      setRejectionReason('');
      setPaymentEvidenceFile(null);
      queryClient.invalidateQueries({ queryKey: ['adminWithdrawals'] });
    },
    onError: (err) => {
      showError(err?.message || err?.data?.message || 'Failed to update withdrawal status');
    },
  });

  const { data: withdrawalsData, isLoading, error } = useQuery({
    queryKey: [
      'adminWithdrawals',
      page,
      statusFilter,
      paymentMethodFilter,
      dateRange.startDate,
      dateRange.endDate,
    ],
    queryFn: () =>
      adminService.getAllWithdrawals({
        page,
        limit: 20,
        status: statusFilter || undefined,
        paymentMethod: paymentMethodFilter || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      }),
  });

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    const params = { page: '1', status, paymentMethod: paymentMethodFilter };
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    setSearchParams(params);
  };

  const handlePaymentMethodFilter = (method) => {
    setPaymentMethodFilter(method);
    const params = { page: '1', status: statusFilter, paymentMethod: method };
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    setSearchParams(params);
  };

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    const params = { page: '1', status: statusFilter, paymentMethod: paymentMethodFilter };
    if (newDateRange.startDate) params.startDate = newDateRange.startDate;
    if (newDateRange.endDate) params.endDate = newDateRange.endDate;
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = { page: newPage.toString(), status: statusFilter, paymentMethod: paymentMethodFilter };
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    setSearchParams(params);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      processing: 'info',
      completed: 'success',
      rejected: 'danger',
      cancelled: 'secondary',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const openUpdateModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setUpdateStatus(withdrawal.status || 'pending');
    setAdminNotes(withdrawal.adminNotes || '');
    setRejectionReason(withdrawal.rejectedReason || '');
    setPaymentEvidenceFile(null);
    setShowUpdateModal(true);
  };

  const openViewModal = (withdrawal) => {
    setViewingWithdrawal(withdrawal);
    setShowViewModal(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedWithdrawal) return;
    if (updateStatus === 'rejected' && !rejectionReason.trim()) {
      showError('Rejection reason is required when status is Rejected.');
      return;
    }
    const formData = new FormData();
    formData.append('status', updateStatus);
    if (adminNotes.trim()) formData.append('adminNotes', adminNotes.trim());
    if (updateStatus === 'rejected' && rejectionReason.trim()) formData.append('rejectedReason', rejectionReason.trim());
    if (updateStatus === 'completed' && paymentEvidenceFile) formData.append('paymentEvidence', paymentEvidenceFile);
    updateStatusMutation.mutate({ id: selectedWithdrawal._id, formData });
  };

  const handleExport = async () => {
    try {
      const exportData = await adminService.getAllWithdrawals({
        limit: 10000,
        status: statusFilter || undefined,
        paymentMethod: paymentMethodFilter || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      });

      const allWithdrawals = exportData?.data?.data?.withdrawals || exportData?.data?.withdrawals || [];

      const columns = [
        { key: 'user.name', label: 'Student Name' },
        { key: 'user.email', label: 'Student Email' },
        { key: 'amount', label: 'Amount', formatter: (value, item) => formatCurrency(value || 0, item.currency || 'EGP') },
        { key: 'currency', label: 'Currency' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'status', label: 'Status' },
        { key: 'requestedAt', label: 'Requested Date', formatter: formatDate },
        { key: 'processedAt', label: 'Processed Date', formatter: formatDate },
        { key: 'completedAt', label: 'Completed Date', formatter: formatDate },
        { key: 'rejectedAt', label: 'Rejected Date', formatter: formatDate },
        { key: 'rejectedReason', label: 'Rejection Reason' },
        { key: 'adminNotes', label: 'Admin Notes' },
        { key: 'paymentEvidenceOriginalName', label: 'Payment Evidence' },
      ];

      exportToCSV(allWithdrawals, columns, 'withdrawals');
    } catch (error) {
      alert('Failed to export withdrawals: ' + (error.message || 'Unknown error'));
    }
  };

  if (isLoading) {
    return <Loading text="Loading withdrawals..." />;
  }

  if (error) {
    return (
      <Alert
        type="error"
        message={`Failed to load withdrawals: ${error.response?.data?.message || error.message}`}
      />
    );
  }

  const withdrawals = withdrawalsData?.data?.withdrawals || [];
  const totalPages = withdrawalsData?.totalPages || 1;
  const currentPage = withdrawalsData?.currentPage || 1;
  const totalCount = withdrawalsData?.totalCount || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-7 h-7" />
            Withdrawals Management
          </h1>
          <p className="text-gray-600 mt-1">Total: {totalCount} withdrawal requests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                viewMode === 'detailed'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Detailed</span>
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                viewMode === 'compact'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Compact</span>
            </button>
          </div>
          <Button variant="primary" onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export to CSV
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 flex-wrap">
            <Button variant={statusFilter === '' ? 'primary' : 'outline'} onClick={() => handleStatusFilter('')}>
              All
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'processing' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('processing')}
            >
              Processing
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('completed')}
            >
              Completed
            </Button>
            <Button
              variant={statusFilter === 'rejected' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('rejected')}
            >
              Rejected
            </Button>
            <Button
              variant={statusFilter === 'cancelled' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('cancelled')}
            >
              Cancelled
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={paymentMethodFilter === '' ? 'primary' : 'outline'}
              onClick={() => handlePaymentMethodFilter('')}
            >
              All Methods
            </Button>
            <Button
              variant={paymentMethodFilter === 'bank_transfer' ? 'primary' : 'outline'}
              onClick={() => handlePaymentMethodFilter('bank_transfer')}
            >
              Bank Transfer
            </Button>
            <Button
              variant={paymentMethodFilter === 'instapay' ? 'primary' : 'outline'}
              onClick={() => handlePaymentMethodFilter('instapay')}
            >
              InstaPay
            </Button>
          </div>
          <div className="pt-2 border-t">
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={handleDateRangeChange}
              label="Filter by Requested Date"
              placeholder="All dates"
            />
          </div>
        </div>
      </Card>

      <Card>
        {viewMode === 'compact' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Method</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Requested</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w, idx) => (
                  <tr
                    key={w._id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{w.user?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{w.user?.email || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {fmt(w.currency || 'EGP', w.amount || 0)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-600">
                        {w.paymentMethod === 'instapay' ? 'InstaPay' : 'Bank Transfer'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(w.status)}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-500">
                        {w.requestedAt ? new Date(w.requestedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openViewModal(w)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openUpdateModal(w)}
                          className="p-1.5 text-primary-600 hover:bg-primary-50 rounded inline-flex items-center gap-1"
                          title="Update status"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="text-xs font-medium">Update</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div key={w._id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {fmt(w.currency || 'EGP', w.amount || 0)}
                      </h3>
                      {getStatusBadge(w.status)}
                      <span className="text-xs text-gray-500">
                        {w.paymentMethod === 'instapay' ? 'InstaPay' : 'Bank Transfer'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Student</p>
                        <p className="font-medium text-gray-900">{w.user?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-600">{w.user?.email || 'N/A'}</p>
                      </div>
                      {w.paymentMethod === 'instapay' ? (
                        <>
                          <div>
                            <p className="text-xs text-gray-500">InstaPay Phone</p>
                            <p className="text-gray-900">{w.instapayPhone || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">InstaPay Username</p>
                            <p className="text-gray-900">{w.instapayUsername || 'N/A'}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="text-xs text-gray-500">Bank</p>
                            <p className="text-gray-900">{w.bankAccount?.bankName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Account Number</p>
                            <p className="text-gray-900">{w.bankAccount?.accountNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Account Holder</p>
                            <p className="text-gray-900">{w.bankAccount?.accountHolderName || 'N/A'}</p>
                          </div>
                          {w.bankAccount?.iban && (
                            <div>
                              <p className="text-xs text-gray-500">IBAN</p>
                              <p className="text-gray-900">{w.bankAccount.iban}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {w.rejectedReason && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-red-600">
                          <span className="font-medium">Rejection reason:</span> {w.rejectedReason}
                        </p>
                      </div>
                    )}
                    {w.adminNotes && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Admin notes:</span> {w.adminNotes}
                        </p>
                      </div>
                    )}
                    {w.paymentEvidencePath && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Payment evidence:</span> {w.paymentEvidenceOriginalName || 'Attached'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openViewModal(w)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openUpdateModal(w)}
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Update status
                    </Button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Requested: {w.requestedAt ? new Date(w.requestedAt).toLocaleString() : 'N/A'}
                  </span>
                  {w.completedAt && (
                    <span>Completed: {new Date(w.completedAt).toLocaleString()}</span>
                  )}
                  {w.rejectedAt && <span>Rejected: {new Date(w.rejectedAt).toLocaleString()}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {withdrawals.length === 0 && (
          <p className="text-center text-gray-600 py-8">No withdrawal requests found.</p>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {showViewModal && viewingWithdrawal && (
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setViewingWithdrawal(null);
          }}
          title="Withdrawal details"
          size="md"
        >
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {fmt(viewingWithdrawal.currency || 'EGP', viewingWithdrawal.amount || 0)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {viewingWithdrawal.paymentMethod === 'instapay' ? 'InstaPay' : 'Bank Transfer'} •{' '}
                    {viewingWithdrawal.currency || 'EGP'}
                  </p>
                </div>
                {getStatusBadge(viewingWithdrawal.status)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Student</p>
                  <p className="font-medium text-gray-900">{viewingWithdrawal.user?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{viewingWithdrawal.user?.email || '—'}</p>
                  {viewingWithdrawal.user?.phone && (
                    <p className="text-sm text-gray-600">{viewingWithdrawal.user.phone}</p>
                  )}
                </div>
                {viewingWithdrawal.paymentMethod === 'instapay' ? (
                  <>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">InstaPay Phone</p>
                      <p className="text-gray-900">{viewingWithdrawal.instapayPhone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">InstaPay Username</p>
                      <p className="text-gray-900">{viewingWithdrawal.instapayUsername || '—'}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Bank</p>
                      <p className="text-gray-900">{viewingWithdrawal.bankAccount?.bankName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Account holder</p>
                      <p className="text-gray-900">{viewingWithdrawal.bankAccount?.accountHolderName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Account number</p>
                      <p className="text-gray-900 font-mono text-sm">
                        {viewingWithdrawal.bankAccount?.accountNumber || '—'}
                      </p>
                    </div>
                    {viewingWithdrawal.bankAccount?.iban && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">IBAN</p>
                        <p className="text-gray-900 font-mono text-sm">{viewingWithdrawal.bankAccount.iban}</p>
                      </div>
                    )}
                    {(viewingWithdrawal.bankAccount?.swiftCode || viewingWithdrawal.bankAccount?.routingNumber) && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Swift / Routing
                        </p>
                        <p className="text-gray-900 font-mono text-sm">
                          {[viewingWithdrawal.bankAccount.swiftCode, viewingWithdrawal.bankAccount.routingNumber]
                            .filter(Boolean)
                            .join(' / ') || '—'}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Requested</p>
                  <p className="text-gray-900">
                    {viewingWithdrawal.requestedAt
                      ? new Date(viewingWithdrawal.requestedAt).toLocaleString()
                      : '—'}
                  </p>
                </div>
                {viewingWithdrawal.processedAt && (
                  <div>
                    <p className="text-xs text-gray-500">Processed</p>
                    <p className="text-gray-900">{new Date(viewingWithdrawal.processedAt).toLocaleString()}</p>
                  </div>
                )}
                {viewingWithdrawal.completedAt && (
                  <div>
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="text-gray-900">{new Date(viewingWithdrawal.completedAt).toLocaleString()}</p>
                  </div>
                )}
                {viewingWithdrawal.rejectedAt && (
                  <div>
                    <p className="text-xs text-gray-500">Rejected</p>
                    <p className="text-gray-900">{new Date(viewingWithdrawal.rejectedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
              {viewingWithdrawal.adminNotes && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Admin notes</p>
                  <p className="text-gray-900 text-sm">{viewingWithdrawal.adminNotes}</p>
                </div>
              )}
              {viewingWithdrawal.rejectedReason && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Rejection reason</p>
                  <p className="text-gray-900 text-sm">{viewingWithdrawal.rejectedReason}</p>
                </div>
              )}
              {viewingWithdrawal.paymentEvidencePath && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Payment evidence</p>
                  <p className="text-gray-900 text-sm">
                    {viewingWithdrawal.paymentEvidenceOriginalName || 'Attached'}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingWithdrawal(null);
                }}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingWithdrawal(null);
                  openUpdateModal(viewingWithdrawal);
                }}
                className="ml-2"
              >
                <Edit2 className="w-4 h-4 mr-1 inline" />
                Update status
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showUpdateModal && selectedWithdrawal && (
        <Modal
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedWithdrawal(null);
            setUpdateStatus('');
            setAdminNotes('');
            setRejectionReason('');
            setPaymentEvidenceFile(null);
          }}
          title="Update withdrawal status"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Student: {selectedWithdrawal.user?.name}</p>
              <p className="text-sm font-semibold text-gray-900">
                Amount: {fmt(selectedWithdrawal.currency || 'EGP', selectedWithdrawal.amount || 0)}
              </p>
              <p className="text-sm text-gray-600">
                Method: {selectedWithdrawal.paymentMethod === 'instapay' ? 'InstaPay' : 'Bank Transfer'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin notes (optional)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Add notes about this update..."
              />
            </div>
            {updateStatus === 'rejected' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rejection reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Explain why this withdrawal is being rejected..."
                  required
                />
              </div>
            )}
            {updateStatus === 'completed' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment evidence (optional)
                </label>
                <p className="text-xs text-gray-500 mb-1">
                  Attach a transfer receipt or proof of payment. PDF, DOC, DOCX, JPG, PNG. Max 10MB.
                </p>
                <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
                  <Paperclip className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">
                    {paymentEvidenceFile ? paymentEvidenceFile.name : 'Choose file...'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,image/jpeg,image/jpg,image/png"
                    className="sr-only"
                    onChange={(e) => setPaymentEvidenceFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedWithdrawal(null);
                  setUpdateStatus('');
                  setAdminNotes('');
                  setRejectionReason('');
                  setPaymentEvidenceFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateStatus}
                loading={updateStatusMutation.isPending}
                disabled={updateStatus === 'rejected' && !rejectionReason.trim()}
              >
                Update status
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Withdrawals;
