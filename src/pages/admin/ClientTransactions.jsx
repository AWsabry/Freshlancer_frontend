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
} from 'lucide-react';

const ClientTransactions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');

  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  // Fetch client transactions (package_purchase type)
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['adminClientTransactions', filterStatus, page],
    queryFn: () =>
      adminService.getAllTransactions({
        type: 'package_purchase', // Only package purchases
        role: 'client', // Only client transactions
        status: filterStatus || undefined,
        page,
        limit,
      }),
  });

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setSearchParams({ status, page: '1' });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({
      status: filterStatus,
      page: newPage.toString(),
    });
  };

  if (isLoading) {
    return <Loading text="Loading transactions..." />;
  }

  const transactions = transactionsData?.data?.transactions || [];
  const totalCount = transactionsData?.total || 0;
  const totalPages = transactionsData?.pages || 1;
  const currentPage = transactionsData?.page || 1;

  // Calculate stats
  const stats = {
    total: transactions.length,
    completed: transactions.filter(t => t.status === 'completed').length,
    pending: transactions.filter(t => t.status === 'pending').length,
    failed: transactions.filter(t => t.status === 'failed').length,
    totalRevenue: transactions
      .filter(t => t.status === 'completed')
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

  const formatCurrency = (amount, currency) => {
    return `${currency || 'EGP'} ${amount?.toFixed(2) || '0.00'}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-primary-600" />
          Client Transactions
        </h1>
        <p className="text-gray-600 mt-2">View and manage client payment transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {formatCurrency(stats.totalRevenue, 'EGP')}
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
              Showing {transactions.length} of {totalCount} transactions
            </p>
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
      ) : (
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
                          {formatCurrency(transaction.amount, transaction.currency)}
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

