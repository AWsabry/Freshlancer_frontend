import React, { useMemo, useState } from 'react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getContractComponentsT, milestoneStatusLabel } from '../../locales/contractComponentsLocales';

const statusVariant = (status) => {
  switch (status) {
    case 'unfunded':
      return 'warning';
    case 'funded':
      return 'info';
    case 'submitted':
      return 'primary';
    case 'approved':
      return 'success';
    case 'released':
      return 'success';
    default:
      return 'default';
  }
};

export default function MilestonesPanel({
  contract,
  role,
  busyMilestoneId,
  onFund,
  onSubmit,
  onApprove,
  language = 'en',
}) {
  const t = useMemo(() => getContractComponentsT(language), [language]);
  const milestones = contract?.milestones || [];
  if (!milestones.length) return null;

  const [openFeeFor, setOpenFeeFor] = useState(null);

  const feeRates = useMemo(() => ({ platform: 0.1, transaction: 0.03 }), []);
  const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
  const fmt = (cur, n) => `${cur} ${round2(n).toFixed(2)}`;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">{t.milestonesTitle}</h3>

      <div className="space-y-2">
        {milestones.map((m) => {
          const id = m._id;
          const title = m?.plan?.title;
          const percent = m?.plan?.percent;
          const amount = m?.state?.amount;
          const expectedDuration = m?.plan?.expectedDuration;
          const status = m?.state?.status;
          const isBusy = busyMilestoneId === id;
          const principal = Number(amount || 0);
          const platformFee = round2(principal * feeRates.platform);
          const transactionFee = round2(principal * feeRates.transaction);
          const total = round2(principal + platformFee + transactionFee);
          const statusText = milestoneStatusLabel(t, status);

          const hasActiveAppeal = !!contract?.activeAppeal;
          const isCancelled = contract?.status === 'cancelled';
          const canFund =
            role === 'client' &&
            (contract.status === 'signed' || contract.status === 'active') &&
            status === 'unfunded' &&
            !hasActiveAppeal &&
            !isCancelled;

          return (
            <div key={id} className="border rounded-lg p-3 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 truncate">{title}</p>
                    <Badge variant={statusVariant(status)}>{statusText}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {percent}% • {fmt(contract.currency, principal)}
                    {expectedDuration ? ` • ${expectedDuration}` : ''}
                  </p>
                  {m?.plan?.description ? (
                    <p className="text-sm text-gray-700 mt-2">{m.plan.description}</p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {canFund ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setOpenFeeFor(openFeeFor === id ? null : id)}
                        className="p-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                        title={t.viewFees}
                        aria-label={t.viewFees}
                      >
                        {openFeeFor === id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <Button size="sm" onClick={() => onFund?.(id)} loading={isBusy}>
                        {t.fund}
                      </Button>
                    </>
                  ) : role === 'client' && status === 'unfunded' && (hasActiveAppeal || isCancelled) ? (
                    <Button
                      size="sm"
                      disabled
                      title={isCancelled ? t.titleContractCancelled : t.titleNoFundAppeal}
                    >
                      {t.fund}
                    </Button>
                  ) : null}

                  {role === 'student' && status === 'funded' && !hasActiveAppeal && !isCancelled ? (
                    <Button size="sm" onClick={() => onSubmit?.(id)} loading={isBusy}>
                      {t.markDone}
                    </Button>
                  ) : role === 'student' && status === 'funded' && (hasActiveAppeal || isCancelled) ? (
                    <Button
                      size="sm"
                      disabled
                      title={isCancelled ? t.titleContractCancelled : t.titleNoSubmitAppeal}
                    >
                      {t.markDone}
                    </Button>
                  ) : null}

                  {role === 'client' && status === 'submitted' && !hasActiveAppeal && !isCancelled ? (
                    <Button size="sm" onClick={() => onApprove?.(id)} loading={isBusy}>
                      {t.approveRelease}
                    </Button>
                  ) : role === 'client' && status === 'submitted' && (hasActiveAppeal || isCancelled) ? (
                    <Button
                      size="sm"
                      disabled
                      title={isCancelled ? t.titleContractCancelled : t.titleNoApproveAppeal}
                    >
                      {t.approveRelease}
                    </Button>
                  ) : null}
                </div>
              </div>

              {canFund && openFeeFor === id ? (
                <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-900">{t.fundingDetails}</p>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-800">
                    <div className="flex items-center justify-between gap-3">
                      <span>{t.escrowDeposit}</span>
                      <span className="font-medium">{fmt(contract.currency, principal)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>{t.platformFee10}</span>
                      <span className="font-medium">{fmt(contract.currency, platformFee)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>{t.transactionFee3}</span>
                      <span className="font-medium">{fmt(contract.currency, transactionFee)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{t.totalToPay}</span>
                      <span className="font-semibold">{fmt(contract.currency, total)}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-2">{t.feeNote}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
