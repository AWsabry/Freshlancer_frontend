import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useToast } from '../../contexts/ToastContext';
import { contractService } from '../../services/contractService';
import ContractEditor from '../../components/contracts/ContractEditor';
import SignaturePad from '../../components/contracts/SignaturePad';
import MilestonesPanel from '../../components/contracts/MilestonesPanel';
import { useAuthStore } from '../../stores/authStore';

const Contracts = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToast();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const preselectId = searchParams.get('contractId');

  const [selectedId, setSelectedId] = useState(preselectId || null);
  const [signature, setSignature] = useState({ typedName: '', drawnSignatureDataUrl: '' });
  const [busyMilestoneId, setBusyMilestoneId] = useState(null);

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
  const canEdit = contract && ['draft', 'pending_signatures'].includes(contract.status);
  const pending = contract?.pendingConfirmation?.required;
  const pendingUpdatedById = contract?.pendingConfirmation?.updatedBy?._id || contract?.pendingConfirmation?.updatedBy;
  const isBlockedFromSigning =
    !!pending && !!pendingUpdatedById && user?._id && String(pendingUpdatedById) !== String(user._id);
  const highlightFields =
    isBlockedFromSigning && Array.isArray(contract?.pendingConfirmation?.changes)
      ? contract.pendingConfirmation.changes.map((c) => c.field).filter(Boolean)
      : [];

  const saveMutation = useMutation({
    mutationFn: (payload) => contractService.updateContract(selectedId, payload),
    onSuccess: async () => {
      showSuccess('Contract updated');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contracts', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['contract', selectedId] }),
      ]);
    },
    onError: (err) => showError(err?.message || 'Failed to update contract'),
  });

  const signMutation = useMutation({
    mutationFn: (payload) => contractService.signContract(selectedId, payload),
    onSuccess: async () => {
      showSuccess('Signature saved');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contracts', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['contract', selectedId] }),
      ]);
    },
    onError: (err) => showError(err?.message || 'Failed to sign contract'),
  });

  const confirmMutation = useMutation({
    mutationFn: () => contractService.confirmChanges(selectedId),
    onSuccess: async () => {
      showSuccess('Changes confirmed');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contracts', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['contract', selectedId] }),
      ]);
    },
    onError: (err) => showError(err?.message || 'Failed to confirm changes'),
  });

  const submitMutation = useMutation({
    mutationFn: ({ milestoneId }) => contractService.submitMilestone(selectedId, milestoneId),
    onSuccess: async () => {
      showSuccess('Milestone submitted');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contracts', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['contract', selectedId] }),
      ]);
    },
    onError: (err) => showError(err?.message || 'Failed to submit milestone'),
    onSettled: () => setBusyMilestoneId(null),
  });

  const headerTitle = useMemo(() => {
    if (!contract) return 'Contracts';
    return `Contract • ${contract?.jobPost?.title || contract._id}`;
  }, [contract?._id]);

  return (
    <div className="space-y-6">
      <Card title="Contracts">
        {loadingList ? (
          <Loading />
        ) : listError ? (
          <Alert type="error" message={listError?.message || 'Failed to load contracts'} />
        ) : contracts.length === 0 ? (
          <p className="text-gray-600">No contracts yet.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-2">
              {contracts.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setSelectedId(c._id)}
                  className={`w-full text-left border rounded-lg p-3 hover:bg-gray-50 ${
                    selectedId === c._id ? 'border-primary-400 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <p className="font-medium text-gray-900">{c?.jobPost?.title || 'Contract'}</p>
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
                  <p className="text-gray-600">Select a contract to view details.</p>
                ) : (
                  <div className="space-y-6">
                    <div className="text-sm text-gray-700">
                      <p>
                        <span className="font-medium">Status:</span> {contract.status}
                      </p>
                      <p>
                        <span className="font-medium">Version:</span> {contract.version}
                      </p>
                    </div>

                    <div className="border rounded-lg p-4 bg-white">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Parties</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="border rounded-lg p-3">
                          <p className="text-xs text-gray-500">Client</p>
                          <p className="text-sm font-semibold text-gray-900">{contract?.client?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-700">{contract?.client?.email || 'N/A'}</p>
                          <p className="text-sm text-gray-700">{contract?.client?.phone || 'N/A'}</p>
                        </div>
                        <div className="border rounded-lg p-3">
                          <p className="text-xs text-gray-500">Student</p>
                          <p className="text-sm font-semibold text-gray-900">{contract?.student?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-700">{contract?.student?.email || 'N/A'}</p>
                          <p className="text-sm text-gray-700">{contract?.student?.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <ContractEditor
                      contract={contract}
                      canEdit={canEdit}
                      saving={saveMutation.isPending}
                      onSave={(payload) => saveMutation.mutate(payload)}
                      highlightFields={highlightFields}
                    />

                    {pending ? (
                      <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                        <p className="text-sm font-semibold text-yellow-900">
                          Contract updated — confirmation required
                        </p>
                        <p className="text-sm text-yellow-800 mt-1">
                          {isBlockedFromSigning
                            ? 'You must confirm the latest changes before you can sign.'
                            : 'Waiting for the other party to confirm the latest changes before they can sign.'}
                        </p>
                        {isBlockedFromSigning &&
                        Array.isArray(contract?.pendingConfirmation?.changes) &&
                        contract.pendingConfirmation.changes.length > 0 ? (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-medium text-yellow-900">What changed</p>
                            <ul className="text-xs text-yellow-900 space-y-2">
                              {contract.pendingConfirmation.changes.map((c, idx) => (
                                <li key={idx} className="bg-white/60 border border-yellow-200 rounded p-2">
                                  <p className="font-semibold">{c.label || c.field}</p>
                                  <p className="mt-1">
                                    <span className="font-medium">Before:</span> {c.before || '—'}
                                  </p>
                                  <p className="mt-1">
                                    <span className="font-medium">After:</span> {c.after || '—'}
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
                            >
                              Confirm changes
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="border-t pt-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Sign contract</h3>
                      {contract?.studentSignature?.signedAt ? (
                        <p className="text-sm text-green-700 mb-3">You have signed this contract.</p>
                      ) : (
                        <>
                          <SignaturePad value={signature} onChange={setSignature} />
                          <div className="mt-3 flex justify-end">
                            <Button
                              onClick={() => signMutation.mutate(signature)}
                              loading={signMutation.isPending}
                              disabled={
                                isBlockedFromSigning ||
                                (!signature.typedName && !signature.drawnSignatureDataUrl)
                              }
                            >
                              Sign
                            </Button>
                          </div>
                          {isBlockedFromSigning ? (
                            <p className="text-xs text-gray-600 mt-2">
                              You can’t sign until you confirm the latest contract changes above.
                            </p>
                          ) : null}
                        </>
                      )}
                    </div>

                    <div className="border-t pt-6">
                      <MilestonesPanel
                        contract={contract}
                        role="student"
                        busyMilestoneId={busyMilestoneId}
                        onSubmit={(milestoneId) => {
                          setBusyMilestoneId(milestoneId);
                          submitMutation.mutate({ milestoneId });
                        }}
                      />
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Change history</h3>
                      {Array.isArray(contract?.changeLog) && contract.changeLog.length > 0 ? (
                        <div className="space-y-3">
                          {[...contract.changeLog]
                            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                            .map((entry) => (
                              <div key={entry._id} className="border border-gray-200 rounded-lg p-3 bg-white">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                      {entry?.updatedBy?.name || 'User'} updated (v{entry?.version ?? 0})
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {entry?.updatedAt ? new Date(entry.updatedAt).toLocaleString() : ''}
                                      {entry?.confirmedAt
                                        ? ` • confirmed by ${entry?.confirmedBy?.name || 'User'} at ${new Date(entry.confirmedAt).toLocaleString()}`
                                        : ' • awaiting confirmation'}
                                    </p>
                                  </div>
                                </div>

                                {Array.isArray(entry?.changes) && entry.changes.length > 0 ? (
                                  <ul className="mt-3 text-xs text-gray-800 space-y-2">
                                    {entry.changes.map((c, idx) => (
                                      <li key={idx} className="border border-gray-200 rounded p-2 bg-gray-50">
                                        <p className="font-semibold">{c.label || c.field}</p>
                                        <p className="mt-1">
                                          <span className="font-medium">Before:</span> {c.before || '—'}
                                        </p>
                                        <p className="mt-1">
                                          <span className="font-medium">After:</span> {c.after || '—'}
                                        </p>
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">No changes yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Contracts;
