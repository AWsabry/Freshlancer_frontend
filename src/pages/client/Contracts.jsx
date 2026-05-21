import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useToast } from '../../contexts/ToastContext';
import { contractService } from '../../services/contractService';
import { appealService } from '../../services/appealService';
import ContractEditor from '../../components/contracts/ContractEditor';
import SignaturePad from '../../components/contracts/SignaturePad';
import MilestonesPanel from '../../components/contracts/MilestonesPanel';
import Modal from '../../components/common/Modal';
import { useAuthStore } from '../../stores/authStore';
import { AlertCircle } from 'lucide-react';
import { getPaymobPublicKey } from '../../config/paymob';
import { useDashboardLanguage } from '../../hooks/useDashboardLanguage';
import { getClientContractsT } from '../../locales/clientContractsLocales';

const Contracts = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToast();
  const { language, dateLocale } = useDashboardLanguage();
  const t = useMemo(() => getClientContractsT(language), [language]);
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const preselectId = searchParams.get('contractId');

  const [selectedId, setSelectedId] = useState(preselectId || null);
  const [signature, setSignature] = useState({ typedName: '', drawnSignatureDataUrl: '' });
  const [busyMilestoneId, setBusyMilestoneId] = useState(null);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [appealDescription, setAppealDescription] = useState('');

  const { data: listResp, isLoading: loadingList, error: listError } = useQuery({
    queryKey: ['contracts', 'me'],
    queryFn: () => contractService.getMyContracts(),
  });

  const contracts = listResp?.data?.contracts || [];

  const { data: detailResp, isLoading: loadingDetail } = useQuery({
    queryKey: ['contract', selectedId],
    queryFn: () => contractService.getContract(selectedId),
    enabled: !!selectedId,
  });

  const contract = detailResp?.data?.contract || null;
  const isCancelled = contract?.status === 'cancelled';
  const canEdit = contract && ['draft', 'pending_signatures'].includes(contract.status) && !isCancelled;
  const pending = contract?.pendingConfirmation?.required;
  const pendingUpdatedById = contract?.pendingConfirmation?.updatedBy?._id || contract?.pendingConfirmation?.updatedBy;
  const isBlockedFromSigning =
    !!pending && !!pendingUpdatedById && user?._id && String(pendingUpdatedById) !== String(user._id);
  const highlightFields =
    isBlockedFromSigning && Array.isArray(contract?.pendingConfirmation?.changes)
      ? contract.pendingConfirmation.changes.map((c) => c.field).filter(Boolean)
      : [];
  const hasActiveAppeal = !!contract?.activeAppeal;
  const canFileAppeal = contract && ['signed', 'active'].includes(contract.status) && !hasActiveAppeal && !isCancelled;

  // Check for active appeal
  const { data: appealCheckResp } = useQuery({
    queryKey: ['appeals', 'me'],
    queryFn: () => appealService.getMyAppeals(),
    enabled: !!contract?._id,
  });

  const activeAppeal = appealCheckResp?.data?.appeals?.find(
    (a) => a.contract?._id === contract?._id && (a.status === 'open' || a.status === 'in_review')
  );

  // Check for recently closed appeal (within last 7 days)
  const recentlyClosedAppeal = appealCheckResp?.data?.appeals?.find(
    (a) => {
      if (a.contract?._id !== contract?._id || a.status !== 'closed_by_opener') return false;
      const closedDate = new Date(a.updatedAt || a.createdAt);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return closedDate >= sevenDaysAgo;
    }
  );

  const showPostAppealOptions = recentlyClosedAppeal && 
    contract && 
    contract.status === 'active' && 
    !hasActiveAppeal &&
    !isCancelled &&
    user?.role === 'client';

  const createAppealMutation = useMutation({
    mutationFn: ({ contractId, reason, description }) => appealService.createAppeal(contractId, reason, description),
    onSuccess: () => {
      showSuccess(tRef.current.appealFiled);
      setShowAppealModal(false);
      setAppealReason('');
      setAppealDescription('');
      queryClient.invalidateQueries({ queryKey: ['contracts', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['contract', selectedId] });
      queryClient.invalidateQueries({ queryKey: ['appeals', 'me'] });
    },
    onError: (err) => showError(err?.message || tRef.current.appealFileFail),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => contractService.updateContract(selectedId, payload),
    onSuccess: async () => {
      showSuccess(tRef.current.contractUpdatedMsg);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contracts', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['contract', selectedId] }),
      ]);
    },
    onError: (err) => showError(err?.message || tRef.current.updateFail),
  });

  const signMutation = useMutation({
    mutationFn: (payload) => contractService.signContract(selectedId, payload),
    onSuccess: async () => {
      showSuccess(tRef.current.signatureSaved);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contracts', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['contract', selectedId] }),
      ]);
    },
    onError: (err) => showError(err?.message || tRef.current.signFail),
  });

  const completeAfterAppealMutation = useMutation({
    mutationFn: () => contractService.completeContractAfterAppeal(selectedId),
    onSuccess: async () => {
      showSuccess(tRef.current.contractCompletedToast);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contracts', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['contract', selectedId] }),
        queryClient.invalidateQueries({ queryKey: ['appeals', 'me'] }),
      ]);
    },
    onError: (err) => showError(err?.message || tRef.current.contractCompleteFail),
  });

  const cancelAfterAppealMutation = useMutation({
    mutationFn: () => contractService.cancelContractAfterAppeal(selectedId),
    onSuccess: async () => {
      showSuccess(tRef.current.contractCancelledEscrowToast);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contracts', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['contract', selectedId] }),
        queryClient.invalidateQueries({ queryKey: ['appeals', 'me'] }),
      ]);
    },
    onError: (err) => showError(err?.message || tRef.current.contractCancelFail),
  });

  const confirmMutation = useMutation({
    mutationFn: () => contractService.confirmChanges(selectedId),
    onSuccess: async () => {
      showSuccess(tRef.current.changesConfirmed);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contracts', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['contract', selectedId] }),
      ]);
    },
    onError: (err) => showError(err?.message || tRef.current.confirmFail),
  });

  const fundMutation = useMutation({
    mutationFn: ({ milestoneId }) => contractService.fundMilestone(selectedId, milestoneId, { redirectBaseUrl: window.location.origin }),
    onSuccess: async (resp) => {
      const data = resp?.data;
      if (data?.gateway === 'paymob' && data?.clientSecret) {
        const publicKey = getPaymobPublicKey();
        if (!publicKey) {
          showError(tRef.current.paymobKeyMissing);
          return;
        }
        const paymobUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${encodeURIComponent(publicKey)}&clientSecret=${encodeURIComponent(data.clientSecret)}`;
        window.location.href = paymobUrl;
        return;
      }
      if (data?.gateway === 'paypal' && data?.approvalUrl) {
        window.location.href = data.approvalUrl;
        return;
      }
      showError(tRef.current.unexpectedPayment);
    },
    onError: (err) => showError(err?.message || tRef.current.fundingFailed),
    onSettled: () => setBusyMilestoneId(null),
  });

  const approveMutation = useMutation({
    mutationFn: ({ milestoneId }) => contractService.approveMilestone(selectedId, milestoneId),
    onSuccess: async () => {
      showSuccess(tRef.current.milestoneApproved);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contracts', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['contract', selectedId] }),
      ]);
    },
    onError: (err) => showError(err?.message || tRef.current.approveMilestoneFail),
    onSettled: () => setBusyMilestoneId(null),
  });

  const headerTitle = useMemo(() => {
    if (!contract) return t.title;
    const sub = contract?.jobPost?.title || String(contract._id);
    return t.contractHeader.replace('{title}', sub);
  }, [contract?._id, contract?.jobPost?.title, t]);

  return (
    <div className="space-y-6">
      <Card title={t.title}>
        {loadingList ? (
          <Loading />
        ) : listError ? (
          <Alert type="error" message={listError?.message || t.failedLoad} />
        ) : contracts.length === 0 ? (
          <p className="text-gray-600">{t.noContracts}</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-2">
              {contracts.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setSelectedId(c._id)}
                  className={`w-full text-start border rounded-lg p-3 hover:bg-gray-50 ${
                    selectedId === c._id ? 'border-primary-400 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <p className="font-medium text-gray-900">{c?.jobPost?.title || t.contractFallback}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {c.status} • {c.currency} {c.totalAmount}
                  </p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              <Card title={headerTitle}>
                {loadingDetail ? (
                  <Loading />
                ) : !contract ? (
                  <p className="text-gray-600">{t.selectContract}</p>
                ) : (
                  <div className="space-y-6">
                    {/* Active Appeal Banner */}
                    {activeAppeal && (
                      <div className="border rounded-lg p-4 bg-red-50 border-red-200">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-red-900">{t.activeAppeal}</p>
                            <p className="text-sm text-red-800 mt-1">
                              {t.activeAppealBody}
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-3"
                              onClick={() => window.location.href = `/client/appeals?appealId=${activeAppeal._id}`}
                            >
                              {t.viewAppeal}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Post-Appeal Decision Options */}
                    {showPostAppealOptions && (
                      <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-900">{t.postAppealTitle}</p>
                            <p className="text-sm text-blue-800 mt-1">
                              {t.postAppealBody}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-4">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => completeAfterAppealMutation.mutate()}
                                loading={completeAfterAppealMutation.isPending}
                                disabled={isCancelled}
                                title={isCancelled ? t.contractCancelled : ''}
                              >
                                {t.completeContract}
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => cancelAfterAppealMutation.mutate()}
                                loading={cancelAfterAppealMutation.isPending}
                                disabled={isCancelled}
                                title={isCancelled ? t.contractCancelled : ''}
                              >
                                {t.cancelContractAction}
                              </Button>
                            </div>
                            <p className="text-xs text-blue-700 mt-3">
                              <strong>{t.completeContract}:</strong> {t.completeContractDesc}
                              <br />
                              <strong>{t.cancelContractAction}:</strong> {t.cancelContractDesc}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* File Appeal Button */}
                    {canFileAppeal && (
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setShowAppealModal(true)}
                          className="flex items-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {t.fileAppeal}
                        </Button>
                      </div>
                    )}

                    <div className="text-sm text-gray-700">
                      <p>
                        <span className="font-medium">{t.status}</span> {contract.status}
                      </p>
                      <p>
                        <span className="font-medium">{t.version}</span> {contract.version}
                      </p>
                    </div>

                    <div className="border rounded-lg p-4 bg-white">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">{t.parties}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="border rounded-lg p-3">
                          <p className="text-xs text-gray-500">{t.client}</p>
                          <p className="text-sm font-semibold text-gray-900">{contract?.client?.name || t.na}</p>
                          <p className="text-sm text-gray-700">{contract?.client?.email || t.na}</p>
                          <p className="text-sm text-gray-700">{contract?.client?.phone || t.na}</p>
                        </div>
                        <div className="border rounded-lg p-3">
                          <p className="text-xs text-gray-500">{t.student}</p>
                          <p className="text-sm font-semibold text-gray-900">{contract?.student?.name || t.na}</p>
                          <p className="text-sm text-gray-700">{contract?.student?.email || t.na}</p>
                          <p className="text-sm text-gray-700">{contract?.student?.phone || t.na}</p>
                        </div>
                      </div>
                    </div>

                    <ContractEditor
                      contract={contract}
                      canEdit={canEdit}
                      saving={saveMutation.isPending}
                      onSave={(payload) => saveMutation.mutate(payload)}
                      highlightFields={highlightFields}
                      language={language}
                    />

                    {pending ? (
                      <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                        <p className="text-sm font-semibold text-yellow-900">
                          {t.contractUpdated}
                        </p>
                        <p className="text-sm text-yellow-800 mt-1">
                          {isBlockedFromSigning
                            ? t.mustConfirm
                            : t.waitingOther}
                        </p>
                        {isBlockedFromSigning &&
                        Array.isArray(contract?.pendingConfirmation?.changes) &&
                        contract.pendingConfirmation.changes.length > 0 ? (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-medium text-yellow-900">{t.whatChanged}</p>
                            <ul className="text-xs text-yellow-900 space-y-2">
                              {contract.pendingConfirmation.changes.map((c, idx) => (
                                <li key={idx} className="bg-white/60 border border-yellow-200 rounded p-2">
                                  <p className="font-semibold">{c.label || c.field}</p>
                                  <p className="mt-1">
                                    <span className="font-medium">{t.before}</span> {c.before || '—'}
                                  </p>
                                  <p className="mt-1">
                                    <span className="font-medium">{t.after}</span> {c.after || '—'}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        {isBlockedFromSigning ? (
                          <div className="mt-3 flex justify-end">
                            <Button
                              onClick={() => confirmMutation.mutate()}
                              loading={confirmMutation.isPending}
                              disabled={isCancelled}
                              title={isCancelled ? t.contractCancelled : ''}
                            >
                              {t.confirmChanges}
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="border-t pt-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">{t.contractNotes}</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 space-y-2 text-sm text-blue-900">
                            <p className="font-semibold">{t.yourLearning}</p>
                            <p>
                              {t.yourLearningBody}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div className="flex-1 space-y-2 text-sm text-amber-900">
                            <p className="font-semibold">{t.protect}</p>
                            <ul className="list-disc list-inside space-y-1 ms-2">
                              <li>{t.protectL1}</li>
                              <li>{t.protectL2}</li>
                              <li>{t.protectL3}</li>
                              <li>{t.protectL4}</li>
                              <li>{t.protectL5}</li>
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 space-y-2 text-sm text-green-900">
                            <p className="font-semibold">{t.bestPractices}</p>
                            <ul className="list-disc list-inside space-y-1 ms-2">
                              <li>{t.bp1}</li>
                              <li>{t.bp2}</li>
                              <li>{t.bp3}</li>
                              <li>{t.bp4}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">{t.signContract}</h3>
                      {contract?.clientSignature?.signedAt ? (
                        <p className="text-sm text-green-700 mb-3">{t.youSigned}</p>
                      ) : (
                        <>
                          <SignaturePad value={signature} onChange={setSignature} language={language} />
                          <div className="mt-3 flex justify-end">
                            <Button
                              onClick={() => signMutation.mutate(signature)}
                              loading={signMutation.isPending}
                              disabled={
                                isCancelled ||
                                isBlockedFromSigning ||
                                !signature.typedName?.trim()
                              }
                              title={isCancelled ? t.contractCancelled : ''}
                            >
                              {t.sign}
                            </Button>
                          </div>
                          {isBlockedFromSigning ? (
                            <p className="text-xs text-gray-600 mt-2">
                              {t.cantSignUntilConfirm}
                            </p>
                          ) : null}
                        </>
                      )}
                    </div>

                    <div className="border-t pt-6">
                      <MilestonesPanel
                        contract={contract}
                        role="client"
                        busyMilestoneId={busyMilestoneId}
                        language={language}
                        onFund={(milestoneId) => {
                          setBusyMilestoneId(milestoneId);
                          fundMutation.mutate({ milestoneId });
                        }}
                        onApprove={(milestoneId) => {
                          setBusyMilestoneId(milestoneId);
                          approveMutation.mutate({ milestoneId });
                        }}
                      />
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">{t.changeHistory}</h3>
                      {Array.isArray(contract?.changeLog) && contract.changeLog.length > 0 ? (
                        <div className="space-y-3">
                          {[...contract.changeLog]
                            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                            .map((entry) => (
                              <div key={entry._id} className="border border-gray-200 rounded-lg p-3 bg-white">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                      {entry?.updatedBy?.name || t.userFallback} {t.updated} (v{entry?.version ?? 0})
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {entry?.updatedAt
                                        ? new Date(entry.updatedAt).toLocaleString(dateLocale)
                                        : ''}
                                      {entry?.confirmedAt
                                        ? ` • ${t.confirmedBy} ${entry?.confirmedBy?.name || t.userFallback} ${t.at} ${new Date(entry.confirmedAt).toLocaleString(dateLocale)}`
                                        : ` • ${t.awaitingConfirmation}`}
                                    </p>
                                  </div>
                                </div>

                                {Array.isArray(entry?.changes) && entry.changes.length > 0 ? (
                                  <ul className="mt-3 text-xs text-gray-800 space-y-2">
                                    {entry.changes.map((c, idx) => (
                                      <li key={idx} className="border border-gray-200 rounded p-2 bg-gray-50">
                                        <p className="font-semibold">{c.label || c.field}</p>
                                        <p className="mt-1">
                                          <span className="font-medium">{t.before}</span> {c.before || '—'}
                                        </p>
                                        <p className="mt-1">
                                          <span className="font-medium">{t.after}</span> {c.after || '—'}
                                        </p>
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">{t.noChanges}</p>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </Card>

      {/* File Appeal Modal */}
      {showAppealModal && contract && (
        <Modal
          isOpen={showAppealModal}
          onClose={() => {
            setShowAppealModal(false);
            setAppealReason('');
            setAppealDescription('');
          }}
          title={t.modalFileAppeal}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.reason}
              </label>
              <select
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">{t.selectReason}</option>
                <option value="non_payment">{t.reasonNonPayment}</option>
                <option value="poor_quality">{t.reasonPoor}</option>
                <option value="contract_violation">{t.reasonViolation}</option>
                <option value="missed_deadline">{t.reasonDeadline}</option>
                <option value="other">{t.reasonOther}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.desc}
              </label>
              <textarea
                value={appealDescription}
                onChange={(e) => setAppealDescription(e.target.value)}
                className="w-full min-h-[150px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder={t.descPlaceholder}
                required
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                {t.appealNote}
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAppealModal(false);
                  setAppealReason('');
                  setAppealDescription('');
                }}
              >
                {t.cancel}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (!appealReason || !appealDescription.trim()) {
                    showError(t.appealSelectDesc);
                    return;
                  }
                  createAppealMutation.mutate({
                    contractId: contract._id,
                    reason: appealReason,
                    description: appealDescription,
                  });
                }}
                loading={createAppealMutation.isPending}
                disabled={!appealReason || !appealDescription.trim()}
              >
                {t.fileAppeal}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Contracts;
