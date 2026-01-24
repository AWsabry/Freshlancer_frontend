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
    const candidates = ['EGP', 'USD'];
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
        otherPartyName: c?.student?.name || 'Student',
        otherPartyEmail: c?.student?.email || '',
        otherPartyPhone: c?.student?.phone || '',
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

                {/* Other Party Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-blue-900 mb-1">Student Details</p>
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
                      funded: 'Funded - Awaiting student submission',
                      submitted: 'Submitted - Awaiting your approval',
                      approved: 'Approved - Ready for release',
                      released: 'Released',
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

