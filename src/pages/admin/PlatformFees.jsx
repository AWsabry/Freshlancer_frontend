import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { Save, RefreshCw } from 'lucide-react';

const translations = {
  en: {
    title: 'Platform fees & income',
    subtitle: 'Configure fee rates and view platform income from contract escrow deposits.',
    platformFee: 'Platform fee (%)',
    transactionFee: 'Transaction fee (%)',
    platformFeeHelp: 'Percentage of each milestone amount charged as platform fee (0–100).',
    transactionFeeHelp: 'Percentage of each milestone amount charged as transaction fee (0–100).',
    save: 'Save',
    saving: 'Saving…',
    saved: 'Settings saved.',
    saveError: 'Failed to save settings.',
    income: 'Business income',
    incomeSubtitle: 'Client packages, student subscriptions, and escrow fees (platform + transaction). Completed transactions only.',
    usd: 'USD',
    egp: 'EGP',
    totalUSD: 'Total (USD)',
    totalEGP: 'Total (EGP)',
    clientPackages: 'Client packages',
    studentSubscriptions: 'Student subscriptions',
    escrowFees: 'Escrow fees (platform + transaction)',
    total: 'Total',
    source: 'Source',
    refresh: 'Refresh',
    dateRange: 'Date range',
    allTime: 'All time',
    loading: 'Loading…',
    failedSettings: 'Failed to load settings.',
    failedIncome: 'Failed to load platform income.',
    invalidPercentages: 'Please enter valid percentages (0–100).',
    feeRates: 'Fee rates',
    calculations: 'Fee calculations',
    calculationsSubtitle: 'Example amounts with current rates. Only the milestone goes to escrow.',
    milestoneEscrow: 'Milestone (escrow)',
    platformFeeAmount: 'Platform fee',
    transactionFeeAmount: 'Transaction fee',
    totalClientPays: 'Total client pays',
  },
  it: {
    title: 'Commissioni e ricavi piattaforma',
    subtitle: 'Configura le percentuali e visualizza i ricavi da depositi escrow.',
    platformFee: 'Commissione piattaforma (%)',
    transactionFee: 'Commissione transazione (%)',
    platformFeeHelp: 'Percentuale sull\'importo di ogni milestone (0–100).',
    transactionFeeHelp: 'Percentuale sull\'importo di ogni milestone come commissione transazione (0–100).',
    save: 'Salva',
    saving: 'Salvataggio…',
    saved: 'Impostazioni salvate.',
    saveError: 'Impossibile salvare le impostazioni.',
    income: 'Ricavi di business',
    incomeSubtitle: 'Pacchetti clienti, abbonamenti studenti e commissioni escrow (piattaforma + transazione). Solo transazioni completate.',
    usd: 'USD',
    egp: 'EGP',
    totalUSD: 'Totale (USD)',
    totalEGP: 'Totale (EGP)',
    clientPackages: 'Pacchetti clienti',
    studentSubscriptions: 'Abbonamenti studenti',
    escrowFees: 'Commissioni escrow (piattaforma + transazione)',
    total: 'Totale',
    source: 'Fonte',
    refresh: 'Aggiorna',
    dateRange: 'Periodo',
    allTime: 'Sempre',
    loading: 'Caricamento…',
    failedSettings: 'Impossibile caricare le impostazioni.',
    failedIncome: 'Impossibile caricare i ricavi.',
    invalidPercentages: 'Inserisci percentuali valide (0–100).',
    feeRates: 'Commissioni',
    calculations: 'Calcolo commissioni',
    calculationsSubtitle: 'Esempi con le percentuali attuali. Solo la milestone va in escrow.',
    milestoneEscrow: 'Milestone (escrow)',
    platformFeeAmount: 'Comm. piattaforma',
    transactionFeeAmount: 'Comm. transazione',
    totalClientPays: 'Totale pagato dal cliente',
  },
};

const PlatformFees = () => {
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState(() => localStorage.getItem('dashboardLanguage') || 'en');
  const [platformFeeRate, setPlatformFeeRate] = useState('');
  const [transactionFeeRate, setTransactionFeeRate] = useState('');
  const [incomeDateStart, setIncomeDateStart] = useState('');
  const [incomeDateEnd, setIncomeDateEnd] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const handleLanguageChange = (e) => setLanguage(e.detail?.language || 'en');
    const handleStorage = () => setLanguage(localStorage.getItem('dashboardLanguage') || 'en');
    window.addEventListener('languageChanged', handleLanguageChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const t = translations[language] || translations.en;

  const { data: settingsData, isLoading: loadingSettings, error: settingsError } = useQuery({
    queryKey: ['adminPlatformSettings'],
    queryFn: () => adminService.getPlatformSettings(),
  });

  const incomeParams = {};
  if (incomeDateStart) incomeParams.startDate = incomeDateStart;
  if (incomeDateEnd) incomeParams.endDate = incomeDateEnd;

  const { data: incomeData, isLoading: loadingIncome, error: incomeError, refetch: refetchIncome } = useQuery({
    queryKey: ['adminPlatformIncome', incomeDateStart, incomeDateEnd],
    queryFn: () => adminService.getPlatformIncome(incomeParams),
  });

  useEffect(() => {
    const s = settingsData?.data;
    if (s) {
      setPlatformFeeRate(String((s.platformFeeRate ?? 0.1) * 100));
      setTransactionFeeRate(String((s.transactionFeeRate ?? 0.03) * 100));
    }
  }, [settingsData]);

  const updateMutation = useMutation({
    mutationFn: (data) => adminService.updatePlatformSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPlatformSettings']);
      setSuccessMessage(t.saved);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: () => {
      setSuccessMessage(t.saveError);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
  });

  const handleSave = () => {
    const pf = parseFloat(platformFeeRate);
    const tf = parseFloat(transactionFeeRate);
    if (Number.isNaN(pf) || pf < 0 || pf > 100 || Number.isNaN(tf) || tf < 0 || tf > 100) {
      setSuccessMessage(t.invalidPercentages);
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }
    updateMutation.mutate({
      platformFeeRate: pf / 100,
      transactionFeeRate: tf / 100,
    });
  };

  const income = incomeData?.data || {};
  const clientPackages = income.clientPackages || { USD: 0, EGP: 0 };
  const studentSubscriptions = income.studentSubscriptions || { USD: 0, EGP: 0 };
  const escrowFees = income.escrowFees || { USD: 0, EGP: 0 };
  const totalUSD = income.totalUSD ?? 0;
  const totalEGP = income.totalEGP ?? 0;

  const incomeRows = [
    { label: t.clientPackages, usd: clientPackages.USD, egp: clientPackages.EGP },
    { label: t.studentSubscriptions, usd: studentSubscriptions.USD, egp: studentSubscriptions.EGP },
    { label: t.escrowFees, usd: escrowFees.USD, egp: escrowFees.EGP },
    { label: t.total, usd: totalUSD, egp: totalEGP, isTotal: true },
  ];

  const pfForm = parseFloat(platformFeeRate);
  const tfForm = parseFloat(transactionFeeRate);
  const platformRate = Number.isFinite(pfForm) && pfForm >= 0 && pfForm <= 100
    ? pfForm / 100
    : (settingsData?.data?.platformFeeRate ?? 0.1);
  const transactionRate = Number.isFinite(tfForm) && tfForm >= 0 && tfForm <= 100
    ? tfForm / 100
    : (settingsData?.data?.transactionFeeRate ?? 0.03);

  const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
  const EXAMPLE_USD = [50, 100, 250, 500, 1000];
  const EXAMPLE_EGP = [500, 1000, 2500, 5000, 10000];

  const buildRows = (amounts, currency) =>
    amounts.map((principal) => {
      const platformFee = round2(principal * platformRate);
      const transactionFee = round2(principal * transactionRate);
      const total = round2(principal + platformFee + transactionFee);
      return {
        principal,
        platformFee,
        transactionFee,
        total,
        currency,
      };
    });

  const usdRows = buildRows(EXAMPLE_USD, 'USD');
  const egpRows = buildRows(EXAMPLE_EGP, 'EGP');

  if (loadingSettings) {
    return <Loading text={t.loading} />;
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-gray-600 mt-1">{t.subtitle}</p>
      </div>

      {successMessage && (
        <Alert
          type={successMessage === t.saved ? 'success' : 'error'}
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {settingsError && (
        <Alert type="error" message={t.failedSettings} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t.feeRates} className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Client pays milestone + platform fee + transaction fee. Only the milestone amount goes to escrow.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.platformFee}</label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={platformFeeRate}
              onChange={(e) => setPlatformFeeRate(e.target.value)}
              placeholder="10"
            />
            <p className="text-xs text-gray-500 mt-1">{t.platformFeeHelp}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.transactionFee}</label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={transactionFeeRate}
              onChange={(e) => setTransactionFeeRate(e.target.value)}
              placeholder="3"
            />
            <p className="text-xs text-gray-500 mt-1">{t.transactionFeeHelp}</p>
          </div>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={updateMutation.isPending}
            className="self-start"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? t.saving : t.save}
          </Button>
        </Card>

        <Card title={t.income}>
          <p className="text-sm text-gray-600 mb-4">{t.incomeSubtitle}</p>
          <div className="space-y-2 mb-4">
            <label className="block text-sm font-medium text-gray-700">{t.dateRange}</label>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="date"
                value={incomeDateStart}
                onChange={(e) => setIncomeDateStart(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <span className="text-gray-500">–</span>
              <input
                type="date"
                value={incomeDateEnd}
                onChange={(e) => setIncomeDateEnd(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <Button variant="outline" size="sm" onClick={() => refetchIncome()}>
                <RefreshCw className="w-4 h-4 mr-1" />
                {t.refresh}
              </Button>
            </div>
            {(!incomeDateStart && !incomeDateEnd) && (
              <p className="text-xs text-gray-500">{t.allTime}</p>
            )}
          </div>
          {incomeError && (
            <Alert type="error" message={t.failedIncome} />
          )}
          {loadingIncome ? (
            <p className="text-gray-500">{t.loading}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">{t.source}</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">{t.usd}</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">{t.egp}</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeRows.map((row) => (
                    <tr
                      key={row.label}
                      className={`border-b border-gray-100 ${row.isTotal ? 'bg-gray-50 font-semibold' : 'hover:bg-gray-50'}`}
                    >
                      <td className="py-2 px-3 text-gray-900">{row.label}</td>
                      <td className="py-2 px-3 text-right text-gray-700">
                        {t.usd} {Number(row.usd).toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-700">
                        {t.egp} {Number(row.egp).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Card title={t.calculations}>
        <p className="text-sm text-gray-600 mb-4">{t.calculationsSubtitle}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-3 font-semibold text-gray-700">{t.milestoneEscrow}</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-700">{t.platformFeeAmount}</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-700">{t.transactionFeeAmount}</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-700">{t.totalClientPays}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">{t.usd}</td>
              </tr>
              {usdRows.map((r) => (
                <tr key={`usd-${r.principal}`} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-900">{r.principal.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right text-gray-700">{r.platformFee.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right text-gray-700">{r.transactionFee.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right font-medium text-gray-900">{r.total.toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">{t.egp}</td>
              </tr>
              {egpRows.map((r) => (
                <tr key={`egp-${r.principal}`} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-900">{r.principal.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right text-gray-700">{r.platformFee.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right text-gray-700">{r.transactionFee.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right font-medium text-gray-900">{r.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Platform: {(platformRate * 100).toFixed(1)}% • Transaction: {(transactionRate * 100).toFixed(1)}%
        </p>
      </Card>
    </div>
  );
};

export default PlatformFees;
