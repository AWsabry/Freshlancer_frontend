import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import { educationBadgeService } from '../../services/educationBadgeService';
import { useDashboardLanguage } from '../../hooks/useDashboardLanguage';
import { getEducationBadgesT } from '../../locales/educationBadgesLocales';
import { useToast } from '../../contexts/ToastContext';

const statusVariant = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

export default function RequestEducationBadge() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToast();
  const { language, isRTL } = useDashboardLanguage();
  const t = useMemo(() => getEducationBadgesT(language), [language]);

  const [entityId, setEntityId] = useState('');
  const [certificateId, setCertificateId] = useState('');
  const [studentNote, setStudentNote] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [formError, setFormError] = useState('');

  const { data: catalogData, isLoading: loadingCatalog } = useQuery({
    queryKey: ['educationBadgesCatalog'],
    queryFn: () => educationBadgeService.getCatalog(),
  });

  const { data: requestsData, isLoading: loadingRequests } = useQuery({
    queryKey: ['educationBadgeRequestsMe'],
    queryFn: () => educationBadgeService.getMyRequests(),
  });

  const entities = catalogData?.data?.entities || [];
  const requests = requestsData?.data?.requests || [];

  const selectedEntity = entities.find((e) => e._id === entityId);
  const certificateOptions = (selectedEntity?.certificates || []).map((c) => {
    const base = c.track ? `${c.title} — ${c.track}` : c.title;
    const label = c.category?.name ? `${base} (${c.category.name})` : base;
    return { value: c._id, label };
  });

  const entityOptions = entities.map((e) => ({
    value: e._id,
    label: e.name,
  }));

  const submitMutation = useMutation({
    mutationFn: () =>
      educationBadgeService.createRequest(
        {
          entityId,
          certificateId,
          studentNote: studentNote.trim() || undefined,
        },
        proofFile
      ),
    onSuccess: () => {
      showSuccess(t.requestSubmitted);
      queryClient.invalidateQueries({ queryKey: ['educationBadgeRequestsMe'] });
      setEntityId('');
      setCertificateId('');
      setStudentNote('');
      setProofFile(null);
      setFormError('');
    },
    onError: (err) => {
      const msg = err?.message || t.requestFailed;
      showError(msg);
      setFormError(msg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!entityId) {
      setFormError(t.partnerRequired);
      return;
    }
    if (!certificateId) {
      setFormError(t.certificateRequired);
      return;
    }
    submitMutation.mutate();
  };

  const statusLabel = {
    pending: t.statusPending,
    approved: t.statusApproved,
    rejected: t.statusRejected,
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <Link
          to="/student/profile"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.title}
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t.requestTitle}</h1>
        <p className="text-sm text-gray-600 mt-1">{t.requestSubtitle}</p>
      </div>

      <Card>
        {loadingCatalog ? (
          <Loading />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && <Alert type="error" message={formError} />}

            <Select
              label={t.selectPartner}
              placeholder={t.selectPartnerPlaceholder}
              options={entityOptions}
              value={entityId}
              onChange={(e) => {
                setEntityId(e.target.value);
                setCertificateId('');
              }}
              required
            />

            <Select
              label={t.selectCertificate}
              placeholder={t.selectCertificatePlaceholder}
              options={certificateOptions}
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              disabled={!entityId || certificateOptions.length === 0}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.note}
              </label>
              <textarea
                className="input w-full min-h-[100px]"
                value={studentNote}
                onChange={(e) => setStudentNote(e.target.value)}
                placeholder={t.notePlaceholder}
                maxLength={2000}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.requestProofLabel}
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,image/jpeg,image/png"
                className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              />
              {proofFile && (
                <p className="text-xs text-gray-600 mt-1">
                  {t.requestProofSelected} {proofFile.name}
                </p>
              )}
              <p className="text-[10px] text-gray-400 mt-1">{t.requestProofHint}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" loading={submitMutation.isPending}>
                {t.submitRequest}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/student/education-badges')}
              >
                {t.viewAll}
              </Button>
            </div>
          </form>
        )}
      </Card>

      <Card title={t.myRequests}>
        {loadingRequests ? (
          <Loading />
        ) : requests.length === 0 ? (
          <p className="text-sm text-gray-600">{t.noRequests}</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {requests.map((req) => (
              <li key={req._id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {req.certificate?.title}
                    {req.certificate?.track ? ` — ${req.certificate.track}` : ''}
                  </p>
                  <p className="text-sm text-gray-600">{req.entity?.name}</p>
                  {req.hasProof && (
                    <p className="text-xs text-green-700 mt-1">{t.requestProofAttached}</p>
                  )}
                </div>
                <Badge variant={statusVariant[req.status] || 'secondary'}>
                  {statusLabel[req.status] || req.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
