import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import { contractService } from '../../services/contractService';
import { withdrawalService } from '../../services/withdrawalService';
import { useToast } from '../../contexts/ToastContext';

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const fmt = (cur, n) => `${cur} ${round2(n).toFixed(2)}`;

const getVal = (obj, key) => {
  if (!obj) return 0;
  if (typeof obj.get === 'function') return Number(obj.get(key) || 0);
  return typeof obj[key] === 'number' ? obj[key] : 0;
};

const getKeys = (obj) => {
  if (!obj) return [];
  if (typeof obj.keys === 'function') return Array.from(obj.keys());
  return Object.keys(obj);
};

const Wallet = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToast();
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('EGP');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [instapayPhone, setInstapayPhone] = useState('');
  const [instapayUsername, setInstapayUsername] = useState('');
  const [bankAccount, setBankAccount] = useState({
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    iban: '',
    swiftCode: '',
    routingNumber: '',
  });

  const { data: meResp, isLoading: loadingMe, error: meError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getMe(),
  });

  const { data: contractsResp, isLoading: loadingContracts, error: contractsError } = useQuery({
    queryKey: ['contracts', 'me'],
    queryFn: () => contractService.getMyContracts(),
  });

  const { data: minimumsResp } = useQuery({
    queryKey: ['withdrawal-minimums'],
    queryFn: () => withdrawalService.getMinimums(),
  });

  const { data: withdrawalsResp, isLoading: loadingWithdrawals } = useQuery({
    queryKey: ['withdrawals', 'me'],
    queryFn: () => withdrawalService.getMyWithdrawals(),
  });

  const withdrawalMutation = useMutation({
    mutationFn: (payload) => withdrawalService.requestWithdrawal(payload),
    onSuccess: () => {
      showSuccess('Withdrawal request submitted successfully. It will be processed after admin approval.');
      setShowWithdrawalForm(false);
      setWithdrawalAmount('');
      setBankAccount({
        accountHolderName: '',
        accountNumber: '',
        bankName: '',
        iban: '',
        swiftCode: '',
        routingNumber: '',
      });
      setPaymentMethod('bank_transfer');
      setInstapayPhone('');
      setInstapayUsername('');
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals', 'me'] });
    },
    onError: (err) => {
      showError(err?.response?.data?.message || err?.message || 'Failed to submit withdrawal request');
    },
  });

  const user = meResp?.data?.user;
  const wallet = user?.wallet || {};
  const balances = wallet?.balances || {};
  const escrow = wallet?.escrow || {};

  const currencies = useMemo(() => {
    const candidates = ['EGP', 'USD'];
    const keys = new Set([...candidates, ...getKeys(balances), ...getKeys(escrow)]);
    const list = Array.from(keys).filter((cur) => getVal(balances, cur) !== 0 || getVal(escrow, cur) !== 0);
    return list.length > 0 ? list : ['EGP', 'USD'];
  }, [balances, escrow]);

  const minimums = minimumsResp?.data?.minimums || { EGP: 500 };

  const { availableForWithdrawalEGP, pendingWithdrawalTotalEGP } = useMemo(() => {
    const withdrawals = withdrawalsResp?.data?.withdrawals || [];
    const pending = round2(
      withdrawals
        .filter((w) => (w.status === 'pending' || w.status === 'processing') && (w.currency === 'EGP'))
        .reduce((sum, w) => sum + (Number(w.amount) || 0), 0)
    );
    const balanceEGP = getVal(balances, 'EGP');
    return {
      pendingWithdrawalTotalEGP: pending,
      availableForWithdrawalEGP: round2(balanceEGP - pending),
    };
  }, [balances, withdrawalsResp?.data?.withdrawals]);

  const canWithdraw = useMemo(() => {
    if (selectedCurrency !== 'EGP') return false;
    const minimum = minimums.EGP || 500;
    return availableForWithdrawalEGP >= minimum;
  }, [selectedCurrency, availableForWithdrawalEGP, minimums]);

  const handleWithdrawalSubmit = (e) => {
    e.preventDefault();
    if (!canWithdraw || !withdrawalAmount) return;

    const amountNum = round2(Number(withdrawalAmount));
    const minimum = minimums.EGP || 500;

    if (amountNum < minimum) {
      showError(`Minimum withdrawal amount is ${selectedCurrency} ${minimum}`);
      return;
    }

    if (amountNum > availableForWithdrawalEGP) {
      showError(
        `Insufficient balance. Available for withdrawal: ${selectedCurrency} ${availableForWithdrawalEGP.toFixed(2)}` +
          (pendingWithdrawalTotalEGP > 0 ? ` (${fmt('EGP', pendingWithdrawalTotalEGP)} locked in pending)` : '')
      );
      return;
    }

    const payload = {
      amount: amountNum,
      currency: 'EGP', // Only EGP allowed
      paymentMethod,
    };

    if (paymentMethod === 'bank_transfer') {
      payload.bankAccount = bankAccount;
    } else if (paymentMethod === 'instapay') {
      payload.instapayPhone = instapayPhone.trim();
      payload.instapayUsername = instapayUsername.trim();
    }

    withdrawalMutation.mutate(payload);
  };

  const contracts = contractsResp?.data?.contracts || [];

  const holdsByContract = useMemo(() => {
    const list = [];
    for (const c of Array.isArray(contracts) ? contracts : []) {
      const ms = Array.isArray(c?.milestones) ? c.milestones : [];
      const holds = ms
        .map((m) => {
          const status = m?.state?.status;
          const amount = Number(m?.state?.amount || 0);
          const fundedAmount = Number(m?.state?.fundedAmount || 0);
          const held = Math.min(fundedAmount || amount, amount);
          const isHeld = held > 0 && status && status !== 'unfunded' && status !== 'released';
          if (!isHeld) return null;
          return {
            milestoneId: m?._id,
            title: m?.plan?.title || 'Milestone',
            description: m?.plan?.description || '',
            percent: m?.plan?.percent || 0,
            status,
            held,
            amount,
            fundedAt: m?.state?.fundedAt,
            submittedAt: m?.state?.submittedAt,
            approvedAt: m?.state?.approvedAt,
            expectedDuration: m?.plan?.expectedDuration,
          };
        })
        .filter(Boolean);

      const totalHeld = round2(holds.reduce((sum, h) => sum + Number(h.held || 0), 0));
      if (totalHeld <= 0) continue;

      list.push({
        contractId: c?._id,
        jobTitle: c?.jobPost?.title || 'Project',
        projectDescription: c?.projectDescription || '',
        currency: c?.currency || 'USD',
        totalAmount: c?.totalAmount || 0,
        contractStatus: c?.status || 'draft',
        otherPartyName: c?.client?.name || 'Client',
        otherPartyEmail: c?.client?.email || '',
        otherPartyPhone: c?.client?.phone || '',
        holds,
        totalHeld,
      });
    }
    return list;
  }, [contracts]);

  return (
    <div className="space-y-6">
      <Card title="Wallet">
        {loadingMe ? (
          <Loading />
        ) : meError ? (
          <Alert type="error" message={meError?.message || 'Failed to load wallet'} />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border rounded-lg p-4 bg-white">
                <p className="text-xs text-gray-500">Available balance</p>
                {currencies.length === 0 ? (
                  <p className="text-sm text-gray-700 mt-1">No balance yet.</p>
                ) : (
                  <div className="mt-2 space-y-1">
                    {currencies.map((cur) => (
                      <div key={cur} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{cur}</span>
                        <span className="font-semibold text-gray-900">{fmt(cur, getVal(balances, cur))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-4 bg-white">
                <p className="text-xs text-gray-500">Escrow (held)</p>
                {currencies.length === 0 ? (
                  <p className="text-sm text-gray-700 mt-1">No escrow holds.</p>
                ) : (
                  <div className="mt-2 space-y-1">
                    {currencies.map((cur) => (
                      <div key={cur} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{cur}</span>
                        <span className="font-semibold text-gray-900">{fmt(cur, getVal(escrow, cur))}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-gray-500 mt-2">
                  Escrow is locked until the client approves each milestone.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card title="Request withdrawal">
        {loadingMe ? (
          <Loading />
        ) : meError ? (
          <Alert type="error" message={meError?.message || 'Failed to load wallet'} />
        ) : (
          <div className="space-y-4">
            {!showWithdrawalForm ? (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-blue-900 mb-1">⏱️ Processing time</p>
                  <p className="text-xs text-blue-800">
                    Money transfers are processed at the <span className="font-semibold">beginning of every month</span>.
                  </p>
                </div>
                <p className="text-sm text-gray-700">
                  Request a withdrawal (EGP only). Minimum withdrawal amount: <span className="font-semibold">{fmt('EGP', minimums.EGP || 500)}</span>
                </p>

                <div className="border rounded-lg p-4 bg-white">
                  <p className="text-xs text-gray-500 mb-2">Available for withdrawal (EGP)</p>
                  {(() => {
                    const minimum = minimums.EGP || 500;
                    const canWithdrawEGP = availableForWithdrawalEGP >= minimum;
                    return (
                      <div
                        className={`flex items-center justify-between p-3 rounded ${
                          canWithdrawEGP ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">EGP</p>
                          <p className="text-xs text-gray-600">
                            {fmt('EGP', availableForWithdrawalEGP)} available
                            {pendingWithdrawalTotalEGP > 0 && (
                              <span className="text-gray-500 ml-1">
                                ({fmt('EGP', pendingWithdrawalTotalEGP)} locked in pending)
                              </span>
                            )}
                            {!canWithdrawEGP && (
                              <span className="text-orange-600 ml-1">
                                (min: {fmt('EGP', minimum)})
                              </span>
                            )}
                          </p>
                        </div>
                        {canWithdrawEGP && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedCurrency('EGP');
                              setShowWithdrawalForm(true);
                            }}
                          >
                            Withdraw
                          </Button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Withdrawal request ({selectedCurrency})</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWithdrawalForm(false);
                      setWithdrawalAmount('');
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (EGP)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={minimums.EGP || 500}
                    max={availableForWithdrawalEGP}
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder={`Min: ${fmt('EGP', minimums.EGP || 500)}`}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available for withdrawal: {fmt('EGP', availableForWithdrawalEGP)}
                    {pendingWithdrawalTotalEGP > 0 && ` (${fmt('EGP', pendingWithdrawalTotalEGP)} locked)`} • Min:{' '}
                    {fmt('EGP', minimums.EGP || 500)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment method *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Bank Transfer
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('instapay')}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        paymentMethod === 'instapay'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      InstaPay
                    </button>
                  </div>
                </div>

                {paymentMethod === 'instapay' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone number *
                      </label>
                      <input
                        type="tel"
                        value={instapayPhone}
                        onChange={(e) => setInstapayPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        placeholder="e.g., +201234567890"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the phone number linked to your InstaPay account
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        InstaPay username *
                      </label>
                      <input
                        type="text"
                        value={instapayUsername}
                        onChange={(e) => setInstapayUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        placeholder="Enter your InstaPay username"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter your InstaPay username
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-900 mb-3">Bank account details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Account holder name *
                      </label>
                      <input
                        type="text"
                        value={bankAccount.accountHolderName}
                        onChange={(e) =>
                          setBankAccount({ ...bankAccount, accountHolderName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Account number *</label>
                      <input
                        type="text"
                        value={bankAccount.accountNumber}
                        onChange={(e) =>
                          setBankAccount({ ...bankAccount, accountNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Bank name *</label>
                      <input
                        type="text"
                        value={bankAccount.bankName}
                        onChange={(e) => setBankAccount({ ...bankAccount, bankName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">IBAN</label>
                      <input
                        type="text"
                        value={bankAccount.iban}
                        onChange={(e) => setBankAccount({ ...bankAccount, iban: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">SWIFT code</label>
                      <input
                        type="text"
                        value={bankAccount.swiftCode}
                        onChange={(e) => setBankAccount({ ...bankAccount, swiftCode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Routing number</label>
                      <input
                        type="text"
                        value={bankAccount.routingNumber}
                        onChange={(e) =>
                          setBankAccount({ ...bankAccount, routingNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>
                  </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowWithdrawalForm(false);
                      setWithdrawalAmount('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={withdrawalMutation.isPending} disabled={!canWithdraw}>
                    Submit request
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </Card>

      <Card title="Withdrawal history">
        {loadingWithdrawals ? (
          <Loading />
        ) : !withdrawalsResp?.data?.withdrawals || withdrawalsResp.data.withdrawals.length === 0 ? (
          <p className="text-gray-600">No withdrawal requests yet.</p>
        ) : (
          <div className="space-y-3">
            {withdrawalsResp.data.withdrawals.map((w) => {
              const statusColors = {
                pending: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                processing: 'bg-blue-50 border-blue-200 text-blue-800',
                completed: 'bg-green-50 border-green-200 text-green-800',
                rejected: 'bg-red-50 border-red-200 text-red-800',
                cancelled: 'bg-gray-50 border-gray-200 text-gray-800',
              };
              const statusLabels = {
                pending: 'Pending',
                processing: 'Processing',
                completed: 'Completed',
                rejected: 'Rejected',
                cancelled: 'Cancelled',
              };
              return (
                <div key={w._id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${statusColors[w.status] || statusColors.pending}`}>
                          {statusLabels[w.status] || w.status}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {fmt(w.currency || 'EGP', w.amount || 0)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Payment method: <span className="font-medium">
                          {w.paymentMethod === 'instapay' ? 'InstaPay' : 'Bank Transfer'}
                        </span>
                      </p>
                      {w.paymentMethod === 'instapay' && w.instapayPhone && (
                        <p className="text-xs text-gray-600 mt-1">
                          Phone: {w.instapayPhone}
                          {w.instapayUsername && ` • Username: ${w.instapayUsername}`}
                        </p>
                      )}
                      {w.paymentMethod === 'bank_transfer' && w.bankAccount?.bankName && (
                        <p className="text-xs text-gray-600 mt-1">
                          Bank: {w.bankAccount.bankName} • Account: {w.bankAccount.accountNumber}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Requested: {w.requestedAt ? new Date(w.requestedAt).toLocaleString() : 'N/A'}
                        {w.completedAt && (
                          <span className="ml-2">
                            • Completed: {new Date(w.completedAt).toLocaleString()}
                          </span>
                        )}
                        {w.rejectedAt && (
                          <span className="ml-2">
                            • Rejected: {new Date(w.rejectedAt).toLocaleString()}
                          </span>
                        )}
                      </p>
                      {w.rejectedReason && (
                        <p className="text-xs text-red-600 mt-1">
                          Reason: {w.rejectedReason}
                        </p>
                      )}
                      {w.adminNotes && (
                        <p className="text-xs text-gray-600 mt-1 italic">
                          Note: {w.adminNotes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card title="Money held per project (from clients)">
        {loadingContracts ? (
          <Loading />
        ) : contractsError ? (
          <Alert type="error" message={contractsError?.message || 'Failed to load contracts'} />
        ) : holdsByContract.length === 0 ? (
          <p className="text-gray-600">No money is currently held in escrow for your projects.</p>
        ) : (
          <div className="space-y-4">
            {holdsByContract.map((c) => (
              <div key={c.contractId} className="border rounded-lg p-4 bg-white">
                {/* Project Header */}
                <div className="border-b pb-3 mb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">{c.jobTitle}</p>
                      {c.projectDescription && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {c.projectDescription.substring(0, 150)}
                          {c.projectDescription.length > 150 ? '...' : ''}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>Contract: {c.contractStatus}</span>
                        <span>•</span>
                        <span>Total: {fmt(c.currency, c.totalAmount)}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500">Total held in escrow</p>
                      <p className="text-sm font-bold text-gray-900">{fmt(c.currency, c.totalHeld)}</p>
                    </div>
                  </div>
                </div>

                {/* Client Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-blue-900 mb-1">Client Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-800">
                    <div>
                      <span className="font-medium">Name:</span> {c.otherPartyName}
                    </div>
                    {c.otherPartyEmail && (
                      <div>
                        <span className="font-medium">Email:</span> {c.otherPartyEmail}
                      </div>
                    )}
                    {c.otherPartyPhone && (
                      <div>
                        <span className="font-medium">Phone:</span> {c.otherPartyPhone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Milestones */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-700">Milestones in escrow:</p>
                  {c.holds.map((h) => {
                    const statusLabels = {
                      funded: 'Funded - You can start working',
                      submitted: 'Submitted - Awaiting client approval',
                      approved: 'Approved - Ready for release to your wallet',
                      released: 'Released - Payment received',
                    };
                    const statusColors = {
                      funded: 'bg-yellow-50 border-yellow-200',
                      submitted: 'bg-blue-50 border-blue-200',
                      approved: 'bg-green-50 border-green-200',
                      released: 'bg-gray-50 border-gray-200',
                    };
                    return (
                      <div
                        key={h.milestoneId}
                        className={`border rounded-lg p-3 ${statusColors[h.status] || 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-gray-900">{h.title}</p>
                              <span className="text-xs text-gray-500">({h.percent}%)</span>
                            </div>
                            {h.description && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{h.description}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-500">Amount held</p>
                            <p className="text-sm font-bold text-gray-900">{fmt(c.currency, h.held)}</p>
                            <p className="text-[10px] text-gray-400 mt-1">of {fmt(c.currency, h.amount)}</p>
                          </div>
                        </div>

                        <div className="border-t pt-2 mt-2">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div>
                              <p className="text-gray-500">Phase/Status</p>
                              <p className="font-medium text-gray-900 mt-0.5">
                                {statusLabels[h.status] || h.status}
                              </p>
                            </div>
                            {h.expectedDuration && (
                              <div>
                                <p className="text-gray-500">Expected Duration</p>
                                <p className="font-medium text-gray-900 mt-0.5">{h.expectedDuration}</p>
                              </div>
                            )}
                            {h.fundedAt && (
                              <div>
                                <p className="text-gray-500">Funded Date</p>
                                <p className="font-medium text-gray-900 mt-0.5">
                                  {new Date(h.fundedAt).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                            {h.submittedAt && (
                              <div>
                                <p className="text-gray-500">Submitted Date</p>
                                <p className="font-medium text-gray-900 mt-0.5">
                                  {new Date(h.submittedAt).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                            {h.approvedAt && (
                              <div>
                                <p className="text-gray-500">Approved Date</p>
                                <p className="font-medium text-gray-900 mt-0.5">
                                  {new Date(h.approvedAt).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Wallet;

