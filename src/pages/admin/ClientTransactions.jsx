import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import {
  DollarSign,
  Calendar,
  CreditCard,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Download,
  Search,
  List,
  Grid,
} from 'lucide-react';
import { exportToCSV, formatDate, formatCurrency } from '../../utils/exportUtils';
import DateRangePicker from '../../components/common/DateRangePicker';

const ClientTransactions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [dateRange, setDateRange] = useState({
    startDate: searchParams.get('startDate') || null,
    endDate: searchParams.get('endDate') || null,
  });
  const [viewMode, setViewMode] = useState('detailed'); // 'detailed' or 'compact'

  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  // Fetch client transactions (package_purchase type)
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['adminClientTransactions', filterStatus, page, dateRange.startDate, dateRange.endDate, searchTerm],
    queryFn: () =>
      adminService.getAllTransactions({
        type: 'package_purchase', // Only package purchases
        role: 'client', // Only client transactions
        status: filterStatus || undefined,
        search: searchTerm || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        page,
        limit,
      }),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    const params = { status: filterStatus, page: '1' };
    if (searchInput.trim()) params.search = searchInput.trim();
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    setSearchParams(params);
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    const params = { status, page: '1' };
    if (searchTerm) params.search = searchTerm;
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    setSearchParams(params);
  };

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    const params = { status: filterStatus, page: '1' };
    if (searchTerm) params.search = searchTerm;
    if (newDateRange.startDate) params.startDate = newDateRange.startDate;
    if (newDateRange.endDate) params.endDate = newDateRange.endDate;
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = {
      status: filterStatus,
      page: newPage.toString(),
    };
    if (searchTerm) params.search = searchTerm;
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    setSearchParams(params);
  };

  if (isLoading) {
    return <Loading text="Loading transactions..." />;
  }

  const transactions = transactionsData?.data?.transactions || [];
  const totalCount = transactionsData?.total || 0;
  const totalPages = transactionsData?.pages || 1;
  const currentPage = transactionsData?.page || 1;

  // Calculate stats
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  
  const stats = {
    total: transactions.length,
    completed: completedTransactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    failed: transactions.filter(t => t.status === 'failed').length,
    totalRevenueUSD: completedTransactions
      .filter(t => (t.currency || 'USD').toUpperCase() === 'USD')
      .reduce((sum, t) => sum + (t.amount || 0), 0),
    totalRevenueEGP: completedTransactions
      .filter(t => (t.currency || 'USD').toUpperCase() === 'EGP')
      .reduce((sum, t) => sum + (t.amount || 0), 0),
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'success',
      pending: 'warning',
      failed: 'error',
      cancelled: 'error',
      refunded: 'info',
      processing: 'info',
    };
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
  };

  const formatCurrencyDisplay = (amount, currency) => {
    return `${currency || 'EGP'} ${amount?.toFixed(2) || '0.00'}`;
  };

  const handleExport = async () => {
    try {
      // Fetch all transactions for export (without pagination)
      const exportData = await adminService.getAllTransactions({
        limit: 10000, // Large limit to get all transactions
        type: 'package_purchase',
        role: 'client',
        status: filterStatus || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      });

      const allTransactions = exportData?.data?.data?.transactions || exportData?.data?.transactions || [];
      
      const columns = [
        { key: 'user.name', label: 'Client Name' },
        { key: 'user.email', label: 'Client Email' },
        { key: 'description', label: 'Description' },
        { 
          key: 'amount', 
          label: 'Amount',
          formatter: (value, item) => formatCurrency(value, item.currency)
        },
        { key: 'currency', label: 'Currency' },
        { key: 'status', label: 'Status' },
        { key: 'points', label: 'Points' },
        { key: 'packageType', label: 'Package Type' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'gatewayTransactionId', label: 'Transaction ID' },
        { 
          key: 'createdAt', 
          label: 'Transaction Date',
          formatter: formatDate
        },
      ];

      exportToCSV(allTransactions, columns, 'client_transactions');
    } catch (error) {
      alert('Failed to export transactions: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-primary-600" />
            Client Transactions
          </h1>
          <p className="text-gray-600 mt-2">View and manage client payment transactions</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                viewMode === 'detailed'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Detailed View"
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
              title="Compact View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Compact</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalCount}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">USD Revenue</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                ${stats.totalRevenueUSD.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">EGP Revenue</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                EGP {stats.totalRevenueEGP.toFixed(2)}
              </p>
            </div>
            <div className="bg-primary-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by client name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
            {searchTerm && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchInput('');
                  setSearchTerm('');
                  const params = { status: filterStatus, page: '1' };
                  if (dateRange.startDate) params.startDate = dateRange.startDate;
                  if (dateRange.endDate) params.endDate = dateRange.endDate;
                  setSearchParams(params);
                }}
              >
                Clear
              </Button>
            )}
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Status Filter"
              value={filterStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'completed', label: 'Completed' },
                { value: 'pending', label: 'Pending' },
                { value: 'failed', label: 'Failed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
            <div className="flex items-end">
              <p className="text-sm text-gray-600">
                Showing {transactions?.length || 0} of {totalCount} transactions
                {searchTerm && ` (filtered by "${searchTerm}")`}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={handleDateRangeChange}
              label="Filter by Transaction Date"
              placeholder="All dates"
            />
          </div>
        </div>
      </Card>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No transactions found.</p>
          </div>
        </Card>
      ) : viewMode === 'compact' ? (
        /* Compact Table View */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Client</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Points</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, idx) => (
                  <tr
                    key={transaction._id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900 truncate max-w-[150px]">
                        {transaction.user?.name || 'Unknown Client'}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">
                        {transaction.user?.email}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900 truncate max-w-[200px]">
                        {transaction.description || 'Package Purchase'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrencyDisplay(transaction.amount, transaction.currency)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-600">
                        {transaction.points || 0} pts
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Detailed Card View */
        <>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <Card key={transaction._id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Package className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900">
                          {transaction.description || 'Package Purchase'}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {transaction.user?.name || 'Unknown Client'} • {transaction.user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {getStatusBadge(transaction.status)}
                      {transaction.points && (
                        <Badge variant="info">{transaction.points} Points</Badge>
                      )}
                      {transaction.packageType && (
                        <Badge variant="default">{transaction.packageType}</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="flex items-center gap-1 text-gray-600">
                        <DollarSign className="w-3 h-3" />
                        <span className="font-medium">
                          {formatCurrencyDisplay(transaction.amount, transaction.currency)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      {transaction.paymentMethod && (
                        <div className="text-gray-600">
                          <span className="font-medium">Method:</span> {transaction.paymentMethod}
                        </div>
                      )}
                      {transaction.gatewayTransactionId && (
                        <div className="text-gray-600 truncate">
                          <span className="font-medium">ID:</span>{' '}
                          <span className="text-xs font-mono">
                            {transaction.gatewayTransactionId.substring(0, 8)}...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <div className="flex items-center justify-between">
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
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ClientTransactions;

