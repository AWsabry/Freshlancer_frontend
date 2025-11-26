import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { RefreshCw, Package, Coins } from 'lucide-react';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import { transactionService } from '../../services/transactionService';

const statusStyles = {
  completed: 'bg-green-50 text-green-700 border border-green-100',
  succeeded: 'bg-green-50 text-green-700 border border-green-100',
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  failed: 'bg-red-50 text-red-700 border border-red-100',
  refunded: 'bg-purple-50 text-purple-700 border border-purple-100',
};

const formatAmount = (amount, currency = 'EGP') => {
  if (typeof amount !== 'number') return '-';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return format(new Date(value), 'PPp');
  } catch {
    return value;
  }
};

const Transactions = () => {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['clientTransactions'],
    queryFn: () => transactionService.getMyTransactions(),
  });

  const transactions = data?.data?.transactions || data?.data || [];

  const stats = useMemo(() => {
    const successfulTransactions = transactions.filter(
      (txn) => txn.status === 'succeeded' || txn.status === 'completed'
    );

    const totalAmount = successfulTransactions.reduce(
      (acc, txn) => acc + (txn.amount || 0),
      0
    );

    const totalPoints = successfulTransactions.reduce(
      (acc, txn) => {
        // Use points field directly (preferred) or extract from description as fallback
        return acc + (txn.points || 0);
      },
      0
    );

    const currency = successfulTransactions[0]?.currency || 'EGP';
    const lastPaymentDate = transactions[0]?.createdAt;

    return {
      totalTransactions: transactions.length,
      successfulTransactions: successfulTransactions.length,
      totalAmount,
      totalPoints,
      currency,
      lastPaymentDate,
    };
  }, [transactions]);

  if (isLoading) {
    return <Loading text="Loading your transactions..." />;
  }

  if (isError) {
    return (
      <Alert
        type="error"
        title="Unable to load transactions"
        message="Please check your connection and try again."
        className="max-w-3xl mx-auto"
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card title="Payment Overview">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
            <p className="text-sm text-primary-600 font-medium">Total Spent</p>
            <p className="text-3xl font-semibold mt-2">
              {formatAmount(stats.totalAmount, stats.currency)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Across {stats.successfulTransactions} successful payments
            </p>
          </div>
          <div className="p-4 rounded-xl bg-green-50 border border-green-100">
            <p className="text-sm text-green-600 font-medium">Points Purchased</p>
            <p className="text-3xl font-semibold mt-2">
              {stats.totalPoints.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total points from all packages</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Transactions</p>
            <p className="text-3xl font-semibold mt-2">{stats.totalTransactions}</p>
            <p className="text-sm text-gray-500 mt-1">Total records in your history</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Last Payment</p>
            <p className="text-base font-semibold mt-2">{formatDate(stats.lastPaymentDate)}</p>
            <p className="text-sm text-gray-500 mt-1">Most recent transaction</p>
          </div>
        </div>
      </Card>

      <Card
        title="Transaction History"
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        }
      >
        {transactions.length === 0 ? (
          <Alert
            type="info"
            title="No transactions yet"
            message="Once you purchase a points package, the transaction details will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((txn) => (
                  <tr key={txn.id || txn._id}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                          {txn.type === 'package_purchase' ? (
                            <Package className="w-5 h-5 text-primary-600" />
                          ) : (
                            <Coins className="w-5 h-5 text-primary-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {txn.description || 'Points Package Purchase'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {txn.type?.replace(/_/g, ' ') || 'Package purchase'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatAmount(txn.amount, txn.currency || stats.currency)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {txn.paymentMethod || 'Paymob'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          statusStyles[txn.status] ||
                          'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {txn.status?.charAt(0)?.toUpperCase() + txn.status?.slice(1) || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(txn.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                      {txn.reference || txn.transactionId || txn._id?.slice(-8) || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Alert
        type="info"
        className="border-dashed"
        title="Need help with a payment?"
        message="If you spot an unfamiliar charge or need a refund, reach out to support with the transaction reference shown above."
      />
    </div>
  );
};

export default Transactions;
