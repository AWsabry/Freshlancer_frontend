import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { RefreshCw, CreditCard, Wallet } from 'lucide-react';
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
    totalPayments: 'Total Payments',
    acrossTransactions: 'Across {count} successful transactions',
    transactions: 'Transactions',
    totalRecords: 'Total records in your history',
    lastPayment: 'Last Payment',
    basedOnRecent: 'Based on the most recent transaction',
    transactionHistory: 'Transaction History',
    refresh: 'Refresh',
    noTransactionsYet: 'No transactions yet',
    noTransactionsMessage: 'Once you make a payment for a subscription or premium feature, the details will appear here.',
    description: 'Description',
    amount: 'Amount',
    paymentMethod: 'Payment Method',
    status: 'Status',
    date: 'Date',
    reference: 'Reference',
    subscriptionPayment: 'Subscription payment',
    premiumPlan: 'Premium plan',
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
    totalPayments: 'Pagamenti Totali',
    acrossTransactions: 'Su {count} transazioni riuscite',
    transactions: 'Transazioni',
    totalRecords: 'Record totali nella tua cronologia',
    lastPayment: 'Ultimo Pagamento',
    basedOnRecent: 'Basato sulla transazione più recente',
    transactionHistory: 'Cronologia Transazioni',
    refresh: 'Aggiorna',
    noTransactionsYet: 'Nessuna transazione ancora',
    noTransactionsMessage: 'Una volta effettuato un pagamento per un abbonamento o una funzione premium, i dettagli appariranno qui.',
    description: 'Descrizione',
    amount: 'Importo',
    paymentMethod: 'Metodo di Pagamento',
    status: 'Stato',
    date: 'Data',
    reference: 'Riferimento',
    subscriptionPayment: 'Pagamento abbonamento',
    premiumPlan: 'Piano premium',
    unknown: 'Sconosciuto',
    needHelp: 'Hai bisogno di aiuto con un pagamento?',
    helpMessage: 'Se noti un addebito non familiare o hai bisogno di un rimborso, contatta il supporto con il riferimento della transazione mostrato sopra.',
    succeeded: 'Riuscito',
    pending: 'In Attesa',
    failed: 'Fallito',
    refunded: 'Rimborsato',
    completed: 'Completato',
  },
  ar: {
    loading: 'جاري تحميل المعاملات...',
    unableToLoad: 'تعذّر التحميل',
    checkConnection: 'تحقق من الاتصال.',
    paymentOverview: 'نظرة على المدفوعات',
    totalPayments: 'إجمالي المدفوعات',
    acrossTransactions: 'على {count} معاملة ناجحة',
    transactions: 'المعاملات',
    totalRecords: 'عدد السجلات',
    lastPayment: 'آخر دفعة',
    basedOnRecent: 'حسب أحدث معاملة',
    transactionHistory: 'السجل',
    refresh: 'تحديث',
    noTransactionsYet: 'لا معاملات',
    noTransactionsMessage: 'بعد الدفع لاشتراك أو ميزة مميّزة يظهر السجل هنا.',
    description: 'الوصف',
    amount: 'المبلغ',
    paymentMethod: 'الطريقة',
    status: 'الحالة',
    date: 'التاريخ',
    reference: 'المرجع',
    subscriptionPayment: 'دفع اشتراك',
    premiumPlan: 'خطة مميزة',
    unknown: 'غير معروف',
    needHelp: 'تحتاجين مساعدة؟',
    helpMessage: 'للاستفسار عن رسم أو استرداد، راسلي الدعم مع المرجع أعلاه.',
    succeeded: 'ناجح',
    pending: 'معلّق',
    failed: 'فشل',
    refunded: 'مسترد',
    completed: 'مكتمل',
  },
};

const statusStyles = {
  succeeded: 'bg-green-50 text-green-700 border border-green-100',
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  failed: 'bg-red-50 text-red-700 border border-red-100',
  refunded: 'bg-purple-50 text-purple-700 border border-purple-100',
};

const formatAmount = (amount, currency = 'USD') => {
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
    queryKey: ['studentTransactions'],
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

    const currency = successfulTransactions[0]?.currency || 'USD';
    const lastPaymentDate = transactions[0]?.createdAt;

    return {
      totalTransactions: transactions.length,
      successfulTransactions: successfulTransactions.length,
      totalAmount,
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
    <div className="space-y-6">
      <Card title={t.paymentOverview}>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
            <p className="text-sm text-primary-600 font-medium">{t.totalPayments}</p>
            <p className="text-3xl font-semibold mt-2">
              {formatAmount(stats.totalAmount, stats.currency)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {t.acrossTransactions.replace('{count}', stats.successfulTransactions)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">{t.transactions}</p>
            <p className="text-3xl font-semibold mt-2">{stats.totalTransactions}</p>
            <p className="text-sm text-gray-500 mt-1">{t.totalRecords}</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">{t.lastPayment}</p>
            <p className="text-base font-semibold mt-2">{formatDate(stats.lastPaymentDate)}</p>
            <p className="text-sm text-gray-500 mt-1">{t.basedOnRecent}</p>
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
          <div className="overflow-x-auto">
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
                  <tr key={txn.id}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                          {txn.direction === 'credit' ? (
                            <Wallet className="w-5 h-5 text-primary-600" />
                          ) : (
                            <CreditCard className="w-5 h-5 text-primary-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {txn.description || txn.planName || t.subscriptionPayment}
                          </p>
                          <p className="text-xs text-gray-500">
                            {txn.type?.replace(/_/g, ' ') || t.premiumPlan}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatAmount(txn.amount, txn.currency || stats.currency)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {txn.paymentMethod || txn.gateway || 'Paymob'}
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
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {txn.reference || txn.transactionId || '—'}
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
        title={t.needHelp}
        message={t.helpMessage}
      />
    </div>
  );
};

export default Transactions;

