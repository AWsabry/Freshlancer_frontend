import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Loading from '../components/common/Loading';
import { useAuthStore } from '../stores/authStore';
import { cvReviewService } from '../services/cvReviewService';

const getParam = (search, key) => {
  const sp = new URLSearchParams(search || '');
  return sp.get(key);
};

export default function CvReviewContinue() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const uploadId = useMemo(() => {
    return (
      getParam(location.search, 'uploadId') ||
      localStorage.getItem('pendingCvReviewUploadId') ||
      ''
    );
  }, [location.search]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const nextSelf = `/cv-review/continue?uploadId=${encodeURIComponent(uploadId || '')}`;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setError('');

      if (!uploadId) {
        setError('Missing uploadId.');
        setLoading(false);
        return;
      }

      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        // Attach to user (idempotent)
        await cvReviewService.attach(uploadId);

        // Enforce email verification before processing
        if (!user?.emailVerified) {
          navigate(`/verify-email-required?next=${encodeURIComponent(nextSelf)}`, { replace: true });
          return;
        }

        // Process (or re-process)
        await cvReviewService.process(uploadId);

        // Clear pending state
        localStorage.removeItem('pendingCvReviewUploadId');
        localStorage.removeItem('pendingCvReviewTargetFields');

        if (!cancelled) {
          navigate(`/student/cv-review/${encodeURIComponent(uploadId)}`, { replace: true });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || 'Failed to continue CV review.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [uploadId, isAuthenticated, user?.emailVerified, navigate, nextSelf, user]);

  if (loading) {
    return <Loading text="Preparing your CV review..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          <Card>
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">Continue CV Review</h1>
              <p className="text-gray-600">
                Please sign in or create an account to continue your CV review.
              </p>
              {error && <Alert type="error" message={error} />}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  onClick={() => navigate(`/register?role=student&next=${encodeURIComponent(nextSelf)}`)}
                >
                  Create account
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/login?next=${encodeURIComponent(nextSelf)}`)}
                >
                  Sign in
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Or go back to <Link className="text-primary-600 underline" to="/students">Student landing</Link>.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <Card>
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">CV Review</h1>
            {error ? (
              <Alert type="error" message={error} />
            ) : (
              <Alert type="info" message="Redirecting to your results..." />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

