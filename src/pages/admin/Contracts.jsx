import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { FileText, Eye, Download, List, Grid } from 'lucide-react';
import { exportToCSV, formatDate, formatCurrency } from '../../utils/exportUtils';
import DateRangePicker from '../../components/common/DateRangePicker';

const Contracts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [dateRange, setDateRange] = useState({
    startDate: searchParams.get('startDate') || null,
    endDate: searchParams.get('endDate') || null,
  });
  const [viewMode, setViewMode] = useState('detailed');
  const [viewingContract, setViewingContract] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const page = parseInt(searchParams.get('page') || '1');

  const openViewModal = (contract) => {
    setViewingContract(contract);
    setShowViewModal(true);
  };

  const { data: contractsData, isLoading, error } = useQuery({
    queryKey: ['adminContracts', page, statusFilter, dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      adminService.getAllContracts({
        page,
        limit: 20,
        status: statusFilter || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      }),
  });

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    const params = { page: '1', status };
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    setSearchParams(params);
  };

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    const params = { page: '1', status: statusFilter };
    if (newDateRange.startDate) params.startDate = newDateRange.startDate;
    if (newDateRange.endDate) params.endDate = newDateRange.endDate;
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = { page: newPage.toString(), status: statusFilter };
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    setSearchParams(params);
  };

  const getStatusBadge = (status) => {
    const variants = {
      draft: 'secondary',
      pending_signatures: 'warning',
      signed: 'info',
      active: 'success',
      completed: 'success',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const handleExport = async () => {
    try {
      const exportData = await adminService.getAllContracts({
        limit: 10000,
        status: statusFilter || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      });

      const allContracts = exportData?.data?.data?.contracts || exportData?.data?.contracts || [];

      const columns = [
        { key: 'client.name', label: 'Client Name' },
        { key: 'client.email', label: 'Client Email' },
        { key: 'student.name', label: 'Student Name' },
        { key: 'student.email', label: 'Student Email' },
        { key: 'jobPost.title', label: 'Job Title' },
        { key: 'totalAmount', label: 'Total Amount', formatter: (value, item) => formatCurrency(value || 0, item.currency || 'USD') },
        { key: 'currency', label: 'Currency' },
        { key: 'expectedDuration', label: 'Duration' },
        { key: 'status', label: 'Status' },
        { key: 'version', label: 'Version' },
        { key: 'createdAt', label: 'Created Date', formatter: formatDate },
        { key: 'signedAt', label: 'Signed Date', formatter: formatDate },
      ];

      exportToCSV(allContracts, columns, 'contracts');
    } catch (error) {
      alert('Failed to export contracts: ' + (error.message || 'Unknown error'));
    }
  };

  if (isLoading) {
    return <Loading text="Loading contracts..." />;
  }

  if (error) {
    return (
      <Alert
        type="error"
        message={`Failed to load contracts: ${error.response?.data?.message || error.message}`}
      />
    );
  }

  const contracts = contractsData?.data?.contracts || [];
  const totalPages = contractsData?.totalPages || 1;
  const currentPage = contractsData?.currentPage || 1;
  const totalCount = contractsData?.totalCount || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7" />
            Contracts Management
          </h1>
          <p className="text-gray-600 mt-1">Total: {totalCount} contracts</p>
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
              variant={statusFilter === 'draft' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('draft')}
            >
              Draft
            </Button>
            <Button
              variant={statusFilter === 'pending_signatures' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('pending_signatures')}
            >
              Pending Signatures
            </Button>
            <Button
              variant={statusFilter === 'signed' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('signed')}
            >
              Signed
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'primary' : 'outline'}
              onClick={() => handleStatusFilter('completed')}
            >
              Completed
            </Button>
          </div>
          <div className="pt-2 border-t">
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={handleDateRangeChange}
              label="Filter by Created Date"
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
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Client</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Job</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Version</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Created</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract, idx) => (
                  <tr
                    key={contract._id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{contract.client?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{contract.client?.email || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{contract.student?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{contract.student?.email || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900 truncate max-w-[200px]">
                        {contract.jobPost?.title || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(contract.totalAmount || 0, contract.currency || 'USD')}
                      </div>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(contract.status)}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-600">v{contract.version || 0}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-500">
                        {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => openViewModal(contract)}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div key={contract._id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {contract.jobPost?.title || 'Contract'}
                      </h3>
                      {getStatusBadge(contract.status)}
                      <span className="text-xs text-gray-500">v{contract.version || 0}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Client</p>
                        <p className="font-medium text-gray-900">{contract.client?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-600">{contract.client?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Student</p>
                        <p className="font-medium text-gray-900">{contract.student?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-600">{contract.student?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(contract.totalAmount || 0, contract.currency || 'USD')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-gray-900">{contract.expectedDuration || 'N/A'}</p>
                      </div>
                    </div>
                    {contract.milestones && contract.milestones.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-500 mb-2">Milestones ({contract.milestones.length})</p>
                        <div className="space-y-1">
                          {contract.milestones.slice(0, 3).map((m, idx) => (
                            <div key={idx} className="text-xs text-gray-700">
                              {m?.plan?.title || 'Milestone'} - {m?.plan?.percent || 0}% -{' '}
                              {m?.state?.status || 'unfunded'}
                            </div>
                          ))}
                          {contract.milestones.length > 3 && (
                            <div className="text-xs text-gray-500">+{contract.milestones.length - 3} more</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => openViewModal(contract)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 shrink-0"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                  <span>Created: {contract.createdAt ? new Date(contract.createdAt).toLocaleString() : 'N/A'}</span>
                  {contract.signedAt && (
                    <span>Signed: {new Date(contract.signedAt).toLocaleString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {contracts.length === 0 && (
          <p className="text-center text-gray-600 py-8">No contracts found.</p>
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

      {showViewModal && viewingContract && (
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setViewingContract(null);
          }}
          title="Contract details"
          size="lg"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {viewingContract.jobPost?.title || 'Contract'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {viewingContract.jobPost?.category || '—'} • v{viewingContract.version ?? 0}
                  </p>
                </div>
                {getStatusBadge(viewingContract.status)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Client</p>
                  <p className="font-medium text-gray-900">{viewingContract.client?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{viewingContract.client?.email || '—'}</p>
                  {viewingContract.client?.phone && (
                    <p className="text-sm text-gray-600">{viewingContract.client.phone}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Student</p>
                  <p className="font-medium text-gray-900">{viewingContract.student?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{viewingContract.student?.email || '—'}</p>
                  {viewingContract.student?.phone && (
                    <p className="text-sm text-gray-600">{viewingContract.student.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(viewingContract.totalAmount ?? 0, viewingContract.currency || 'USD')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Currency</p>
                  <p className="text-gray-900">{viewingContract.currency || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-gray-900">{viewingContract.expectedDuration || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment</p>
                  <p className="text-gray-900">{viewingContract.paymentMethod || '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-200 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-gray-900">
                    {viewingContract.createdAt
                      ? new Date(viewingContract.createdAt).toLocaleString()
                      : '—'}
                  </p>
                </div>
                {viewingContract.signedAt && (
                  <div>
                    <p className="text-xs text-gray-500">Signed</p>
                    <p className="text-gray-900">{new Date(viewingContract.signedAt).toLocaleString()}</p>
                  </div>
                )}
                {viewingContract.lastEditedAt && (
                  <div>
                    <p className="text-xs text-gray-500">Last edited</p>
                    <p className="text-gray-900">{new Date(viewingContract.lastEditedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {viewingContract.projectDescription && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Project description</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{viewingContract.projectDescription}</p>
                </div>
              )}

              {viewingContract.milestones && viewingContract.milestones.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Milestones</p>
                  <div className="space-y-3">
                    {viewingContract.milestones.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-white border border-gray-200 text-sm"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                          <span className="font-medium text-gray-900">{m?.plan?.title || 'Milestone'}</span>
                          <span className="text-gray-600">
                            {m?.plan?.percent ?? 0}% • {m?.state?.status || 'unfunded'}
                          </span>
                        </div>
                        {m?.plan?.description && (
                          <p className="text-gray-700 text-xs mt-1">{m.plan.description}</p>
                        )}
                        {(m?.plan?.expectedDuration || m?.state?.fundedAmount) && (
                          <p className="text-gray-500 text-xs mt-1">
                            {m?.plan?.expectedDuration && `Duration: ${m.plan.expectedDuration}`}
                            {m?.plan?.expectedDuration && m?.state?.fundedAmount != null && ' • '}
                            {m?.state?.fundedAmount != null && `Funded: ${formatCurrency(m.state.fundedAmount ?? 0, viewingContract.currency || 'USD')}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(viewingContract.clientSignature || viewingContract.studentSignature) && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Signatures</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {viewingContract.clientSignature && (
                      <div className="p-2 rounded bg-white border border-gray-200">
                        <p className="text-gray-500 text-xs">Client</p>
                        <p className="font-medium text-gray-900">{viewingContract.clientSignature.typedName || '—'}</p>
                        {viewingContract.clientSignature.signedAt && (
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(viewingContract.clientSignature.signedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                    {viewingContract.studentSignature && (
                      <div className="p-2 rounded bg-white border border-gray-200">
                        <p className="text-gray-500 text-xs">Student</p>
                        <p className="font-medium text-gray-900">{viewingContract.studentSignature.typedName || '—'}</p>
                        {viewingContract.studentSignature.signedAt && (
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(viewingContract.studentSignature.signedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {viewingContract.pendingConfirmation?.required && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Pending confirmation</p>
                  <p className="text-sm text-gray-900">
                    Changes pending confirmation
                    {viewingContract.pendingConfirmation.updatedAt && (
                      <span className="text-gray-500 ml-1">
                        (updated {new Date(viewingContract.pendingConfirmation.updatedAt).toLocaleString()})
                      </span>
                    )}
                  </p>
                  {Array.isArray(viewingContract.pendingConfirmation.changes) &&
                    viewingContract.pendingConfirmation.changes.length > 0 && (
                      <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
                        {viewingContract.pendingConfirmation.changes.map((c, i) => (
                          <li key={i}>
                            {c.label || c.field || 'Field'}: {String(c.before || '—')} → {String(c.after || '—')}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              )}

              {Array.isArray(viewingContract.changeLog) && viewingContract.changeLog.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Change log</p>
                  <div className="space-y-2">
                    {[...viewingContract.changeLog].reverse().map((entry, i) => (
                      <div key={i} className="p-2 rounded bg-white border border-gray-200 text-sm">
                        <p className="text-gray-900">
                          v{entry?.version ?? '?'} • {entry?.updatedBy?.name || 'User'} updated
                          {entry?.updatedAt && (
                            <span className="text-gray-500 ml-1">
                              {new Date(entry.updatedAt).toLocaleString()}
                            </span>
                          )}
                        </p>
                        {entry?.confirmedBy && (
                          <p className="text-gray-600 text-xs mt-1">
                            Confirmed by {entry.confirmedBy?.name || 'User'}
                            {entry.confirmedAt && ` at ${new Date(entry.confirmedAt).toLocaleString()}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingContract(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Contracts;
