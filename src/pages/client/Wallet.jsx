import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { authService } from '../../services/authService';
import { contractService } from '../../services/contractService';
import { LayoutGrid, List, ListChecks, Eye } from 'lucide-react';
import Button from '../../components/common/Button';

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
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('walletViewMode') || 'detailed';
  });
  const [listPage, setListPage] = useState(1);
  const listLimit = 20;
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

  // Pagination for list views
  const isListView = viewMode === 'list1' || viewMode === 'list2';
  const totalPages = isListView ? Math.ceil(holdsByContract.length / listLimit) : 1;
  const paginatedContracts = isListView
    ? holdsByContract.slice((listPage - 1) * listLimit, listPage * listLimit)
    : holdsByContract;

  const handleViewDetails = (contract) => {
    setSelectedContract(contract);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedContract(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        {/* View Toggle */}
        <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1 bg-white">
          <button
            onClick={() => {
              setViewMode('list1');
              setListPage(1);
              localStorage.setItem('walletViewMode', 'list1');
            }}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list1'
                ? 'bg-primary-600 text-gray-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="List View 1"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setViewMode('list2');
              setListPage(1);
              localStorage.setItem('walletViewMode', 'list2');
            }}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list2'
                ? 'bg-primary-600 text-gray-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="List View 2"
          >
            <ListChecks className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setViewMode('detailed');
              localStorage.setItem('walletViewMode', 'detailed');
            }}
            className={`p-2 rounded transition-colors ${
              viewMode === 'detailed'
                ? 'bg-primary-600 text-gray-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Detailed View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
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
          <>
            <div className={
              viewMode === 'list1' || viewMode === 'list2' 
                ? 'space-y-0' 
                : viewMode === 'detailed' 
                  ? 'space-y-0' 
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            }>
              {paginatedContracts.map((c) => {
                // List View 1 - Very minimal
                if (viewMode === 'list1') {
                  return (
                    <div key={c.contractId} className="border-b border-gray-200 py-2 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">{c.jobTitle}</h3>
                            <span className="text-xs text-gray-500">({c.contractStatus})</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>{fmt(c.currency, c.totalHeld)} held</span>
                            <span>•</span>
                            <span>{c.holds.length} milestone{c.holds.length !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewDetails(c)}
                          className="flex items-center gap-1 text-xs flex-shrink-0"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                      </div>
                    </div>
                  );
                }

                // List View 2 - Slightly more info
                if (viewMode === 'list2') {
                  return (
                    <div key={c.contractId} className="border-b border-gray-200 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold text-gray-900">{c.jobTitle}</h3>
                            <span className="text-xs text-gray-500">({c.contractStatus})</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600">
                            <div>
                              <span className="text-gray-500">Total held: </span>
                              <span className="font-semibold">{fmt(c.currency, c.totalHeld)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Total amount: </span>
                              <span>{fmt(c.currency, c.totalAmount)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Milestones: </span>
                              <span>{c.holds.length}</span>
                            </div>
                          </div>
                          {c.otherPartyName && (
                            <div className="text-xs text-gray-500 mt-1">
                              Student: {c.otherPartyName}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewDetails(c)}
                          className="flex items-center gap-1 text-xs flex-shrink-0"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                      </div>
                    </div>
                  );
                }

                // Detailed/Block View
                return (
                  <div key={c.contractId} className="border-b border-gray-200 py-4 hover:bg-gray-50 transition-colors">
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
                          <p className="text-xs text-gray-500">Total held</p>
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
                );
              })}
            </div>

            {/* Pagination for List Views */}
            {isListView && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Showing {(listPage - 1) * listLimit + 1} to {Math.min(listPage * listLimit, holdsByContract.length)} of {holdsByContract.length} contracts
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setListPage(p => Math.max(1, p - 1))}
                    disabled={listPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm text-gray-600">
                    Page {listPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setListPage(p => Math.min(totalPages, p + 1))}
                    disabled={listPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Contract Details Modal */}
      {showDetailsModal && selectedContract && (
        <Modal
          isOpen={showDetailsModal}
          onClose={handleCloseModal}
          title="Contract Details"
          size="lg"
        >
          <div className="space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Project Header */}
            <Card>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedContract.jobTitle}</h3>
                  {selectedContract.projectDescription && (
                    <p className="text-sm text-gray-600 mt-2">{selectedContract.projectDescription}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Contract Status:</span>
                    <span className="ml-2 font-semibold text-gray-900">{selectedContract.contractStatus}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Currency:</span>
                    <span className="ml-2 font-semibold text-gray-900">{selectedContract.currency}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Amount:</span>
                    <span className="ml-2 font-semibold text-green-600">{fmt(selectedContract.currency, selectedContract.totalAmount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Held:</span>
                    <span className="ml-2 font-semibold text-blue-600">{fmt(selectedContract.currency, selectedContract.totalHeld)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Student Details */}
            <Card>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Student Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium text-gray-900">{selectedContract.otherPartyName}</span>
                </div>
                {selectedContract.otherPartyEmail && (
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedContract.otherPartyEmail}</span>
                  </div>
                )}
                {selectedContract.otherPartyPhone && (
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedContract.otherPartyPhone}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Milestones */}
            <Card>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Milestones in Escrow</h4>
              <div className="space-y-3">
                {selectedContract.holds.map((h) => {
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
                      className={`border rounded-lg p-4 ${statusColors[h.status] || 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="text-sm font-semibold text-gray-900">{h.title}</h5>
                            <span className="text-xs text-gray-500">({h.percent}%)</span>
                          </div>
                          {h.description && (
                            <p className="text-xs text-gray-600 mt-1">{h.description}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-500">Amount held</p>
                          <p className="text-sm font-bold text-gray-900">{fmt(selectedContract.currency, h.held)}</p>
                          <p className="text-[10px] text-gray-400 mt-1">of {fmt(selectedContract.currency, h.amount)}</p>
                        </div>
                      </div>

                      <div className="border-t pt-3 mt-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-gray-500 mb-1">Phase/Status</p>
                            <p className="font-medium text-gray-900">
                              {statusLabels[h.status] || h.status}
                            </p>
                          </div>
                          {h.expectedDuration && (
                            <div>
                              <p className="text-gray-500 mb-1">Expected Duration</p>
                              <p className="font-medium text-gray-900">{h.expectedDuration}</p>
                            </div>
                          )}
                          {h.fundedAt && (
                            <div>
                              <p className="text-gray-500 mb-1">Funded Date</p>
                              <p className="font-medium text-gray-900">
                                {new Date(h.fundedAt).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          {h.submittedAt && (
                            <div>
                              <p className="text-gray-500 mb-1">Submitted Date</p>
                              <p className="font-medium text-gray-900">
                                {new Date(h.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          {h.approvedAt && (
                            <div>
                              <p className="text-gray-500 mb-1">Approved Date</p>
                              <p className="font-medium text-gray-900">
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
            </Card>

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button variant="primary" onClick={handleCloseModal}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Wallet;

