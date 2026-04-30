import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Loading from '../components/common/Loading';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import { cvReviewService } from '../services/cvReviewService';

const getParam = (search, key) => {
  const sp = new URLSearchParams(search || '');
  return sp.get(key);
};

export default function CvChecker() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const [cvFile, setCvFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [targetFields, setTargetFields] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const role = useMemo(() => getParam(location.search, 'role') || 'student', [location.search]);

  useEffect(() => {
    let mounted = true;
    setLoadingCategories(true);
    api
      .get('/categories')
      .then((res) => {
        const list = res?.data?.categories || [];
        if (mounted) setCategories(list);
      })
      .catch(() => {
        // non-blocking
      })
      .finally(() => {
        if (mounted) setLoadingCategories(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleTargetFieldsChange = (e) => {
    const opts = Array.from(e.target.selectedOptions || []);
    setTargetFields(opts.map((o) => o.value));
  };

  const handleSubmit = async () => {
    setError('');
    if (!cvFile) {
      setError('Please upload your CV first.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await cvReviewService.guestInit({ file: cvFile, targetFields });
      const uploadId = res?.data?.uploadId;
      if (!uploadId) {
        setError('Failed to start CV review.');
        return;
      }

      localStorage.setItem('pendingCvReviewUploadId', uploadId);
      localStorage.setItem('pendingCvReviewTargetFields', JSON.stringify(targetFields || []));

      const nextUrl = `/cv-review/continue?uploadId=${encodeURIComponent(uploadId)}`;
      if (isAuthenticated) {
        navigate(nextUrl);
      } else {
        navigate(`/register?role=${encodeURIComponent(role)}&next=${encodeURIComponent(nextUrl)}`);
      }
    } catch (e) {
      setError(e?.message || 'Failed to start CV review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCategories) return <Loading text="Loading..." />;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <Card>
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CV Checker</h1>
              <p className="text-gray-600">
                Upload your CV and we’ll provide feedback and recommendations. Processing requires email verification.
              </p>
            </div>

            {error && <Alert type="error" message={error} />}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">CV file</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-[#25aaad] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#0f828c] file:cursor-pointer"
              />
              <p className="text-xs text-gray-500">Supported: PDF, DOC, DOCX (max 10MB)</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Target fields (optional)
              </label>
              <select
                multiple
                value={targetFields}
                onChange={handleTargetFieldsChange}
                className="w-full border border-gray-200 rounded-lg p-2 bg-white h-28"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Tip: select 1–3 fields to get more relevant recommendations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="primary" onClick={handleSubmit} loading={submitting}>
                Start CV check
              </Button>
              <Button variant="outline" onClick={() => navigate('/students')}>
                Back
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

