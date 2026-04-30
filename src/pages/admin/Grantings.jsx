import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { grantingService } from '../../services/grantingService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Heart,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  DollarSign,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  List,
  Grid,
  Download,
  MessageSquare,
} from 'lucide-react';
import { exportToCSV, formatDate, formatCurrency } from '../../utils/exportUtils';
import DateRangePicker from '../../components/common/DateRangePicker';

// Helper function to format date for display
const formatDisplayDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Grantings = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [currencyFilter, setCurrencyFilter] = useState(searchParams.get('currency') || '');
  const [selectedGranting, setSelectedGranting] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: searchParams.get('startDate') || null,
    endDate: searchParams.get('endDate') || null,
  });
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('adminGrantingsViewMode') || 'detailed';
  });

  const page = parseInt(searchParams.get('page') || '1');

  // Fetch grantings
  const { data: grantingsData, isLoading, error } = useQuery({
    queryKey: ['adminGrantings', page, statusFilter, currencyFilter, searchTerm, dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (currencyFilter) params.append('currency', currencyFilter);

      const response = await grantingService.getAllGrantings(params);
      return response;
    },
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['grantingStats'],
    queryFn: async () => {
      const response = await grantingService.getGrantingStats();
      return response;
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setSearchParams({ page: '1' });
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    const params = { page: '1' };
    if (status) params.status = status;
    if (currencyFilter) params.currency = currencyFilter;
    setSearchParams(params);
  };

  const handleCurrencyFilter = (currency) => {
    setCurrencyFilter(currency);
    const params = { page: '1' };
    if (statusFilter) params.status = statusFilter;
    if (currency) params.currency = currency;
    setSearchParams(params);
  };

  const handleView = (granting) => {
    setSelectedGranting(granting);
    setShowViewModal(true);
  };

  const handleDateRangeChange = (startDate, endDate) => {
    setDateRange({ startDate, endDate });
    const params = { page: '1' };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (statusFilter) params.status = statusFilter;
    if (currencyFilter) params.currency = currencyFilter;
    setSearchParams(params);
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'detailed' ? 'compact' : 'detailed';
    setViewMode(newMode);
    localStorage.setItem('adminGrantingsViewMode', newMode);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', label: 'Pending', icon: Clock },
      completed: { variant: 'success', label: 'Completed', icon: CheckCircle },
      failed: { variant: 'error', label: 'Failed', icon: XCircle },
      cancelled: { variant: 'secondary', label: 'Cancelled', icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 text-xs">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const handleExport = async () => {
    try {
      // Fetch all grantings for export (without pagination)
      const response = await grantingService.getAllGrantings({
        limit: '10000', // Large limit to get all
        status: statusFilter || undefined,
        currency: currencyFilter || undefined,
        search: searchTerm || undefined,
      });

      const allGrantings = response?.data?.grantings || [];
      
      const columns = [
        { key: 'user.name', label: 'Supporter Name' },
        { key: 'user.email', label: 'Supporter Email' },
        { key: 'user.role', label: 'Role' },
        { 
          key: 'amount', 
          label: 'Amount',
          formatter: (value, item) => formatCurrency(value, item.currency)
        },
        { key: 'currency', label: 'Currency' },
        { key: 'status', label: 'Status' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'message', label: 'Message' },
        { 
          key: 'createdAt', 
          label: 'Created At',
          formatter: formatDate
        },
        { 
          key: 'completedAt', 
          label: 'Completed At',
          formatter: formatDate
        },
      ];

      exportToCSV(allGrantings, columns, 'grantings');
    } catch (error) {
      alert('Failed to export grantings: ' + (error.message || 'Unknown error'));
    }
  };

  if (isLoading) {
    return <Loading text="Loading grantings..." />;
  }

  if (error) {
    return (
      <Alert
        type="error"
        message={`Failed to load grantings: ${error.response?.data?.message || error.message}`}
      />
    );
  }

  const grantings = grantingsData?.data?.grantings || [];
  const pagination = grantingsData?.pagination || {};
  const stats = statsData?.data?.stats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-7 h-7 text-red-600" />
            Support & Donations
          </h1>
          <p className="text-gray-600 mt-1">
            Total: {pagination.total || 0} grantings
            {stats.completed && ` • ${stats.completed} completed`}
            {stats.totalAmounts?.EGP && ` • ${formatCurrency(stats.totalAmounts.EGP.total, 'EGP')} in EGP`}
            {stats.totalAmounts?.USD && ` • ${formatCurrency(stats.totalAmounts.USD.total, 'USD')} in USD`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => toggleViewMode()}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                viewMode === 'detailed'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={viewMode === 'compact' ? 'Detailed View' : 'Compact View'}
            >
              {viewMode === 'detailed' ? (
                <>
                  <Grid className="w-4 h-4" />
                  <span className="hidden sm:inline">Detailed</span>
                </>
              ) : (
                <>
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Compact</span>
                </>
              )}
            </button>
          </div>
          <Button
            variant="primary"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Grantings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed || 0}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by supporter name or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={statusFilter === '' ? 'primary' : 'outline'}
                onClick={() => handleStatusFilter('')}
              >
                All Status
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'primary' : 'outline'}
                onClick={() => handleStatusFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'primary' : 'outline'}
                onClick={() => handleStatusFilter('completed')}
              >
                Completed
              </Button>
              <Button
                variant={statusFilter === 'failed' ? 'primary' : 'outline'}
                onClick={() => handleStatusFilter('failed')}
              >
                Failed
              </Button>
            </div>

            {/* Currency Filter */}
            <div className="flex gap-2">
              <Button
                variant={currencyFilter === '' ? 'primary' : 'outline'}
                onClick={() => handleCurrencyFilter('')}
              >
                All Currencies
              </Button>
              <Button
                variant={currencyFilter === 'EGP' ? 'primary' : 'outline'}
                onClick={() => handleCurrencyFilter('EGP')}
              >
                EGP
              </Button>
              <Button
                variant={currencyFilter === 'USD' ? 'primary' : 'outline'}
                onClick={() => handleCurrencyFilter('USD')}
              >
                USD
              </Button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="pt-2 border-t">
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={handleDateRangeChange}
              label="Filter by Date"
              placeholder="All dates"
            />
          </div>
        </div>
      </Card>

      {/* Grantings Table */}
      <Card>
        {grantings.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No grantings found</p>
          </div>
        ) : viewMode === 'compact' ? (
          /* Compact Table View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Supporter</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Currency</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Payment Method</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {grantings.map((granting, idx) => (
                  <tr
                    key={granting._id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-600 font-semibold text-xs">
                            {granting.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                          {granting.user?.name || 'Unknown User'}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-gray-600 truncate max-w-[200px]">
                        {granting.user?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(granting.amount, granting.currency)}
                      </div>
                      {granting.currency === 'EGP' && granting.transaction && (
                        <p className="text-xs text-gray-400 mt-0.5 italic">
                          *3% fee included
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="info" className="text-xs">{granting.currency}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(granting.status)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-600 capitalize">
                        {granting.paymentMethod || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-500">
                        {formatDisplayDate(granting.createdAt)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleView(granting)}
                        className="flex items-center gap-1.5 text-xs px-2 sm:px-3 py-1 sm:py-1.5"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Detailed Card View */
          <div className="space-y-4">
            {grantings.map((granting) => (
              <div
                key={granting._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600 font-semibold">
                          {granting.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {granting.user?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {granting.user?.email || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Amount</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(granting.amount, granting.currency)}
                        </p>
                        {granting.currency === 'EGP' && granting.transaction && (
                          <p className="text-xs text-gray-400 mt-1 italic">
                            *Processing fee (3%) included in transaction
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Currency</p>
                        <Badge variant="info">{granting.currency}</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        {getStatusBadge(granting.status)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                        <p className="text-sm text-gray-700 capitalize">
                          {granting.paymentMethod || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {granting.message && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Message
                        </p>
                        <p className="text-sm text-gray-700">{granting.message}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Created: {formatDisplayDate(granting.createdAt)}
                      </span>
                      {granting.completedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Completed: {formatDisplayDate(granting.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleView(granting)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: (page - 1).toString() })}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: (page + 1).toString() })}
              disabled={page >= pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedGranting && (
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedGranting(null);
          }}
          title="Granting Details"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Supporter Information</h3>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Name:</strong> {selectedGranting.user?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Email:</strong> {selectedGranting.user?.email || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    <strong>Role:</strong> {selectedGranting.user?.role || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment Information</h3>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm"><strong>Amount:</strong></span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(selectedGranting.amount, selectedGranting.currency)}
                    </span>
                    {selectedGranting.currency === 'EGP' && selectedGranting.transaction && (
                      <p className="text-xs text-gray-400 mt-1 italic">
                        *Processing fee (3%) included in transaction
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm"><strong>Currency:</strong></span>
                  <Badge variant="info">{selectedGranting.currency}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm"><strong>Status:</strong></span>
                  {getStatusBadge(selectedGranting.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm"><strong>Payment Method:</strong></span>
                  <span className="text-sm capitalize">{selectedGranting.paymentMethod || 'N/A'}</span>
                </div>
              </div>
            </div>

            {selectedGranting.message && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Message</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedGranting.message}</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Timeline</h3>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Created:</strong> {formatDisplayDate(selectedGranting.createdAt)}
                  </span>
                </div>
                {selectedGranting.completedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">
                      <strong>Completed:</strong> {formatDisplayDate(selectedGranting.completedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {selectedGranting.transaction && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Transaction</h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm"><strong>Transaction ID:</strong></span>
                    <span className="text-xs font-mono text-gray-600">
                      {selectedGranting.transaction._id || selectedGranting.transaction}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm"><strong>Transaction Status:</strong></span>
                    {typeof selectedGranting.transaction === 'object' && (
                      <Badge variant={selectedGranting.transaction.status === 'completed' ? 'success' : 'warning'}>
                        {selectedGranting.transaction.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Grantings;

