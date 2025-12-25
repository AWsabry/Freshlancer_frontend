import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { RefreshCw, Package, Coins } from 'lucide-react';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import { transactionService } from '../../services/transactionService';

const translations = {
  en: {
    loading: 'Loading your transactions...',
    unableToLoad: 'Unable to load transactions',
    checkConnection: 'Please check your connection and try again.',
    paymentOverview: 'Payment Overview',
    totalSpent: 'Total Spent',
    acrossPayments: 'Across {count} successful payments',
    pointsPurchased: 'Points Purchased',
    totalPointsFromPackages: 'Total points from all packages',
    transactions: 'Transactions',
    totalRecords: 'Total records in your history',
    lastPayment: 'Last Payment',
    mostRecentTransaction: 'Most recent transaction',
    transactionHistory: 'Transaction History',
    refresh: 'Refresh',
    noTransactionsYet: 'No transactions yet',
    noTransactionsMessage: 'Once you purchase a points package, the transaction details will appear here.',
    description: 'Description',
    amount: 'Amount',
    paymentMethod: 'Payment Method',
    status: 'Status',
    date: 'Date',
    reference: 'Reference',
    pointsPackagePurchase: 'Points Package Purchase',
    packagePurchase: 'Package purchase',
    unknown: 'Unknown',
    needHelp: 'Need help with a payment?',
    helpMessage: 'If you spot an unfamiliar charge or need a refund, reach out to support with the transaction reference shown above.',
    succeeded: 'Succeeded',
    pending: 'Pending',
    failed: 'Failed',
    refunded: 'Refunded',
    completed: 'Completed',
  },
  it: {
    loading: 'Caricamento delle tue transazioni...',
    unableToLoad: 'Impossibile caricare le transazioni',
    checkConnection: 'Controlla la tua connessione e riprova.',
    paymentOverview: 'Riepilogo Pagamenti',
    totalSpent: 'Totale Speso',
    acrossPayments: 'Su {count} pagamenti riusciti',
    pointsPurchased: 'Punti Acquistati',
    totalPointsFromPackages: 'Punti totali da tutti i pacchetti',
    transactions: 'Transazioni',
    totalRecords: 'Record totali nella tua cronologia',
    lastPayment: 'Ultimo Pagamento',
    mostRecentTransaction: 'Transazione più recente',
    transactionHistory: 'Cronologia Transazioni',
    refresh: 'Aggiorna',
    noTransactionsYet: 'Nessuna transazione ancora',
    noTransactionsMessage: 'Una volta acquistato un pacchetto di punti, i dettagli della transazione appariranno qui.',
    description: 'Descrizione',
    amount: 'Importo',
    paymentMethod: 'Metodo di Pagamento',
    status: 'Stato',
    date: 'Data',
    reference: 'Riferimento',
    pointsPackagePurchase: 'Acquisto Pacchetto Punti',
    packagePurchase: 'Acquisto pacchetto',
    unknown: 'Sconosciuto',
    needHelp: 'Hai bisogno di aiuto con un pagamento?',
    helpMessage: 'Se noti un addebito non familiare o hai bisogno di un rimborso, contatta il supporto con il riferimento della transazione mostrato sopra.',
    succeeded: 'Riuscito',
    pending: 'In Attesa',
    failed: 'Fallito',
    refunded: 'Rimborsato',
    completed: 'Completato',
  },
};

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
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dashboardLanguage') || 'en';
  });

  // Listen for language changes from DashboardLayout
  useEffect(() => {
    const handleLanguageChange = (event) => {
      setLanguage(event.detail.language);
    };
    
    // Listen for custom language change event
    window.addEventListener('languageChanged', handleLanguageChange);
    
    // Also listen for storage events (for cross-tab updates)
    const handleStorageChange = () => {
      setLanguage(localStorage.getItem('dashboardLanguage') || 'en');
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const t = translations[language] || translations.en;

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
    return <Loading text={t.loading} />;
  }

  if (isError) {
    return (
      <Alert
        type="error"
        title={t.unableToLoad}
        message={t.checkConnection}
        className="max-w-3xl mx-auto"
      />
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <Card title={t.paymentOverview}>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
            <p className="text-sm text-primary-600 font-medium">{t.totalSpent}</p>
            <p className="text-3xl font-semibold mt-2">
              {formatAmount(stats.totalAmount, stats.currency)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {t.acrossPayments.replace('{count}', stats.successfulTransactions)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-green-50 border border-green-100">
            <p className="text-sm text-green-600 font-medium">{t.pointsPurchased}</p>
            <p className="text-3xl font-semibold mt-2">
              {stats.totalPoints.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">{t.totalPointsFromPackages}</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">{t.transactions}</p>
            <p className="text-3xl font-semibold mt-2">{stats.totalTransactions}</p>
            <p className="text-sm text-gray-500 mt-1">{t.totalRecords}</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">{t.lastPayment}</p>
            <p className="text-base font-semibold mt-2">{formatDate(stats.lastPaymentDate)}</p>
            <p className="text-sm text-gray-500 mt-1">{t.mostRecentTransaction}</p>
          </div>
        </div>
      </Card>

      <Card
        title={t.transactionHistory}
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t.refresh}
          </Button>
        }
      >
        {transactions.length === 0 ? (
          <Alert
            type="info"
            title={t.noTransactionsYet}
            message={t.noTransactionsMessage}
          />
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.description}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.amount}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.paymentMethod}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.status}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.date}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.reference}
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
                            {txn.description || t.pointsPackagePurchase}
                          </p>
                          <p className="text-xs text-gray-500">
                            {txn.type?.replace(/_/g, ' ') || t.packagePurchase}
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
                        {txn.status === 'succeeded' ? t.succeeded :
                         txn.status === 'pending' ? t.pending :
                         txn.status === 'failed' ? t.failed :
                         txn.status === 'refunded' ? t.refunded :
                         txn.status === 'completed' ? t.completed :
                         txn.status?.charAt(0)?.toUpperCase() + txn.status?.slice(1) || t.unknown}
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
            </div>
          </div>
        )}
      </Card>

      <Alert
        type="info"
        className="border-dashed"
        title={t.needHelp}
        message={t.helpMessage}
      />
    </div>
  );
};

export default Transactions;
