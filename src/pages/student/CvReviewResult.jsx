import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import { cvReviewService } from '../../services/cvReviewService';
import { useAuthStore } from '../../stores/authStore';

export default function CvReviewResult() {
  const { uploadId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);

  const nextSelf = useMemo(
    () => `/cv-review/continue?uploadId=${encodeURIComponent(uploadId || '')}`,
    [uploadId]
  );

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await cvReviewService.get(uploadId);
        const s = res?.data?.session;
        if (!cancelled) setSession(s || null);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load CV review results.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [uploadId]);

  const handleReprocess = async () => {
    setError('');
    try {
      if (!user?.emailVerified) {
        navigate(`/verify-email-required?next=${encodeURIComponent(nextSelf)}`);
        return;
      }
      setLoading(true);
      await cvReviewService.process(uploadId);
      const res = await cvReviewService.get(uploadId);
      setSession(res?.data?.session || null);
    } catch (e) {
      setError(e?.message || 'Failed to re-process CV review.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Loading CV review..." />;

  if (error) {
    return (
      <div className="p-6">
        <Alert type="error" message={error} />
      </div>
    );
  }

  const analysis = session?.analysis || null;
  const score = typeof analysis?.score === 'number' ? analysis.score : null;
  const breakdown = analysis?.scoreBreakdown || null;
  const missing = analysis?.missingSections || [];
  const recs = analysis?.recommendations || [];
  const fieldFit = analysis?.fieldFit || null;
  const rewrite = analysis?.rewrite || null;
  const atsKeywords = analysis?.atsKeywords || [];
  const redFlags = analysis?.redFlags || [];
  const jobTitleSuggestions = analysis?.jobTitleSuggestions || [];
  const status = session?.status;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CV Review Results</h1>
          <p className="text-gray-600">Upload ID: {session?.uploadId || uploadId}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/student/profile')}>
            Go to profile
          </Button>
          <Button variant="primary" onClick={handleReprocess}>
            Re-process
          </Button>
        </div>
      </div>

      {status !== 'completed' && (
        <Alert
          type="warning"
          message={`Current status: ${status || 'unknown'}. You can re-process to try again.`}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Score</h2>
            <div className="text-4xl font-extrabold text-gray-900">
              {score == null ? '—' : `${score}/100`}
            </div>
            <p className="text-sm text-gray-600">
              This score is a quick quality indicator based on section completeness and clarity.
            </p>
            {breakdown && (
              <div className="text-sm text-gray-700 space-y-1">
                <div className="flex justify-between"><span>Sections</span><span className="font-semibold">{breakdown.sections}</span></div>
                <div className="flex justify-between"><span>Quantification</span><span className="font-semibold">{breakdown.quantification}</span></div>
                <div className="flex justify-between"><span>Clarity</span><span className="font-semibold">{breakdown.clarity}</span></div>
                <div className="flex justify-between"><span>Formatting</span><span className="font-semibold">{breakdown.formatting}</span></div>
              </div>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-1">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Missing sections</h2>
            {missing.length === 0 ? (
              <p className="text-sm text-gray-600">No obvious missing sections detected.</p>
            ) : (
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-1">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Recommendations</h2>
            {recs.length === 0 ? (
              <p className="text-sm text-gray-600">No recommendations available.</p>
            ) : (
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {recs.map((r, idx) => (
                  <li key={`${idx}-${r.slice(0, 12)}`}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Field fit</h2>
            {fieldFit ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-semibold text-gray-800">Missing keywords</div>
                  <div className="text-sm text-gray-700">
                    {fieldFit.keywordsMissing?.length ? fieldFit.keywordsMissing.join(', ') : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">Skills to add</div>
                  <div className="text-sm text-gray-700">
                    {fieldFit.skillsToAdd?.length ? fieldFit.skillsToAdd.join(', ') : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">Projects to build</div>
                  {fieldFit.projectsToBuild?.length ? (
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {fieldFit.projectsToBuild.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-700">—</div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No field-fit analysis available.</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Rewrite templates</h2>
            {rewrite ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-semibold text-gray-800">Summary template</div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{rewrite.summaryTemplate || '—'}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">Bullet templates</div>
                  {rewrite.bulletTemplates?.length ? (
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {rewrite.bulletTemplates.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-700">—</div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No rewrite templates available.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Recommended job titles</h2>
            {jobTitleSuggestions.length ? (
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {jobTitleSuggestions.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">—</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">ATS keywords</h2>
            {atsKeywords.length ? (
              <div className="flex flex-wrap gap-2">
                {atsKeywords.slice(0, 40).map((k) => (
                  <span key={k} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {k}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">—</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Red flags</h2>
            {redFlags.length ? (
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {redFlags.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">—</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Target fields</h2>
          <p className="text-sm text-gray-700">
            {(session?.targetFields || []).length ? (session.targetFields || []).join(', ') : '—'}
          </p>
        </div>
      </Card>
    </div>
  );
}

