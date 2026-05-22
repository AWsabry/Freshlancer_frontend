import React, { useMemo, useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { educationBadgeService } from '../../services/educationBadgeService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Select from '../../components/common/Select';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import {
  parseGrantEmails,
  downloadGrantEmailsSample,
  GRANT_EMAILS_CSV_SAMPLE,
} from '../../utils/parseGrantEmails';
import { Mail, GraduationCap, ArrowLeft, Upload, Download } from 'lucide-react';

const EducationBadgeGrants = () => {
  const fileInputRef = useRef(null);
  const [entityId, setEntityId] = useState('');
  const [certificateId, setCertificateId] = useState('');
  const [emailsText, setEmailsText] = useState('');
  const [grantResult, setGrantResult] = useState(null);
  const [parseInfo, setParseInfo] = useState('');

  const parsedEmails = useMemo(() => parseGrantEmails(emailsText), [emailsText]);

  const { data: entitiesData, isLoading } = useQuery({
    queryKey: ['educationEntities'],
    queryFn: () => educationBadgeService.getEntities({ isActive: true }),
  });

  const entities = entitiesData?.data?.entities || [];

  const { data: entityDetail, isLoading: loadingCerts } = useQuery({
    queryKey: ['educationEntity', entityId],
    queryFn: () => educationBadgeService.getEntity(entityId),
    enabled: !!entityId,
  });

  const certificates = useMemo(() => {
    const list = entityDetail?.data?.certificates || [];
    return list.filter((c) => c.isActive !== false);
  }, [entityDetail]);

  const grantMutation = useMutation({
    mutationFn: () =>
      educationBadgeService.grantBulk({
        emails: parsedEmails,
        certificateId,
      }),
    onSuccess: (res) => {
      setGrantResult(res?.data || res);
      setEmailsText('');
      setParseInfo('');
    },
    onError: (err) => {
      setGrantResult(null);
      setParseInfo(err?.message || 'Grant failed');
    },
  });

  const handleCsvFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result || '';
      setEmailsText(String(text));
      const count = parseGrantEmails(text).length;
      setParseInfo(`Loaded ${count} email(s) from CSV.`);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    setParseInfo('');
    if (!certificateId) {
      setParseInfo('Select a certificate.');
      return;
    }
    if (parsedEmails.length === 0) {
      setParseInfo('Add at least one valid email.');
      return;
    }
    grantMutation.mutate();
  };

  const statusLabel = (status) => {
    const map = {
      granted: 'Granted',
      already_awarded: 'Already had badge',
      not_found: 'Student not found',
      error: 'Error',
    };
    return map[status] || status;
  };

  const statusVariant = (status) => {
    if (status === 'granted') return 'success';
    if (status === 'already_awarded') return 'warning';
    if (status === 'not_found') return 'error';
    return 'error';
  };

  if (isLoading) return <Loading text="Loading..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/education-partners">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Partners
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-7 h-7 text-primary-600" />
            Bulk grant badges
          </h1>
          <p className="text-gray-600 text-sm">
            Paste emails or upload a CSV (one email per row). Students are matched case-insensitively.
          </p>
        </div>
      </div>

      <Card title="Grant settings">
        <div className="space-y-4 max-w-2xl">
          <Select
            label="Partner"
            value={entityId}
            onChange={(e) => {
              setEntityId(e.target.value);
              setCertificateId('');
            }}
            options={[
              { value: '', label: 'Select partner...' },
              ...entities.map((e) => ({ value: e._id, label: e.name })),
            ]}
          />

          {entityId &&
            (loadingCerts ? (
              <Loading text="Loading certificates..." />
            ) : (
              <Select
                label="Certificate"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                options={[
                  { value: '', label: 'Select certificate...' },
                  ...certificates.map((c) => ({
                    value: c._id,
                    label: c.category?.name
                      ? `${c.title} — ${c.track} (${c.category.name})`
                      : `${c.title} — ${c.track}`,
                  })),
                ]}
              />
            ))}

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Student emails
              </label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadGrantEmailsSample()}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Sample CSV
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload CSV
                </Button>
              </div>
            </div>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono min-h-[160px]"
              placeholder={'email\nstudent1@university.edu\nstudent2@university.edu'}
              value={emailsText}
              onChange={(e) => {
                setEmailsText(e.target.value);
                setParseInfo('');
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              CSV format: first row <code className="bg-gray-100 px-1 rounded">email</code>, then one
              address per line. You can also paste comma- or line-separated emails.
            </p>
            {parsedEmails.length > 0 && (
              <p className="text-xs text-primary-700 mt-1">
                {parsedEmails.length} valid email(s) ready to grant.
              </p>
            )}
            <pre className="text-[10px] text-gray-400 mt-2 p-2 bg-gray-50 rounded border overflow-x-auto">
              {GRANT_EMAILS_CSV_SAMPLE.trim()}
            </pre>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,text/plain"
              className="hidden"
              onChange={(e) => handleCsvFile(e.target.files?.[0])}
            />
          </div>

          {parseInfo && !grantMutation.isError && (
            <Alert type="info" message={parseInfo} />
          )}

          {grantMutation.isError && (
            <Alert type="error" message={grantMutation.error?.message || parseInfo || 'Grant failed'} />
          )}

          <Button
            onClick={handleSubmit}
            loading={grantMutation.isPending}
            disabled={!certificateId || parsedEmails.length === 0}
          >
            Grant badges ({parsedEmails.length})
          </Button>
        </div>
      </Card>

      {grantResult?.summary && (
        <Card title="Results">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="success">Granted: {grantResult.summary.granted}</Badge>
            <Badge variant="warning">
              Already had: {grantResult.summary.already_awarded}
            </Badge>
            <Badge variant="error">Not found: {grantResult.summary.not_found}</Badge>
            {grantResult.summary.errors > 0 && (
              <Badge variant="error">Errors: {grantResult.summary.errors}</Badge>
            )}
            <Badge variant="secondary">Total: {grantResult.summary.total}</Badge>
          </div>
          <div className="max-h-64 overflow-y-auto text-sm space-y-1">
            {(grantResult.results || []).map((r, i) => (
              <div key={i} className="flex justify-between items-center border-b py-1 gap-2">
                <span className="truncate">{r.email}</span>
                <Badge variant={statusVariant(r.status)} className="shrink-0">
                  {statusLabel(r.status)}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default EducationBadgeGrants;
