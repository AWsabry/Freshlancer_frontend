import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { authService } from '../../services/authService';
import { contractService } from '../../services/contractService';

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
  const { data: meResp, isLoading: loadingMe, error: meError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getMe(),
  });

  const { data: contractsResp, isLoading: loadingContracts, error: contractsError } = useQuery({
    queryKey: ['contracts', 'me'],
    queryFn: () => contractService.getMyContracts(),
  });

  const user = meResp?.data?.user;
  const wallet = user?.wallet || {};
  const balances = wallet?.balances || {};
  const escrow = wallet?.escrow || {};

  const currencies = useMemo(() => {
    const candidates = ['EGP', 'USD', 'EUR', 'GBP'];
    const keys = new Set([...candidates, ...getKeys(balances), ...getKeys(escrow)]);
    const list = Array.from(keys).filter((cur) => getVal(balances, cur) !== 0 || getVal(escrow, cur) !== 0);
    return list.length > 0 ? list : ['EGP', 'USD'];
  }, [balances, escrow]);

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
            status,
            held,
            fundedAt: m?.state?.fundedAt,
            expectedDuration: m?.plan?.expectedDuration,
          };
        })
        .filter(Boolean);

      const totalHeld = round2(holds.reduce((sum, h) => sum + Number(h.held || 0), 0));
      if (totalHeld <= 0) continue;

      list.push({
        contractId: c?._id,
        jobTitle: c?.jobPost?.title || 'Project',
        currency: c?.currency || 'USD',
        otherPartyName: c?.student?.name || 'Student',
        holds,
        totalHeld,
      });
    }
    return list;
  }, [contracts]);

  const heldByCurrency = useMemo(() => {
    const out = {};
    for (const entry of holdsByContract) {
      const cur = entry.currency || 'USD';
      out[cur] = round2((out[cur] || 0) + Number(entry.totalHeld || 0));
    }
    return out;
  }, [holdsByContract]);

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
                {Object.keys(heldByCurrency).length > 0 ? (
                  <p className="text-[11px] text-gray-500 mt-2">
                    Breakdown below shows escrow holds per project (milestone amounts only).
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card title="Escrow holds by project">
        {loadingContracts ? (
          <Loading />
        ) : contractsError ? (
          <Alert type="error" message={contractsError?.message || 'Failed to load contracts'} />
        ) : holdsByContract.length === 0 ? (
          <p className="text-gray-600">No money is currently held in escrow for your projects.</p>
        ) : (
          <div className="space-y-3">
            {holdsByContract.map((c) => (
              <div key={c.contractId} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.jobTitle}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Held for: <span className="font-medium">{c.otherPartyName}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total held</p>
                    <p className="text-sm font-bold text-gray-900">{fmt(c.currency, c.totalHeld)}</p>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {c.holds.map((h) => (
                    <div key={h.milestoneId} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{h.title}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Status: <span className="font-medium">{h.status}</span>
                            {h.expectedDuration ? ` • ${h.expectedDuration}` : ''}
                            {h.fundedAt ? ` • Funded: ${new Date(h.fundedAt).toLocaleString()}` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Held</p>
                          <p className="text-sm font-semibold text-gray-900">{fmt(c.currency, h.held)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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

