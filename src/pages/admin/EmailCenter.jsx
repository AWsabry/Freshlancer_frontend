import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { adminService } from '../../services/adminService';
import { Paperclip, Image as ImageIcon, Eye, Send, History } from 'lucide-react';

const EmailCenter = () => {
  const [audience, setAudience] = useState('students'); // students | clients | both
  const [verificationStatus, setVerificationStatus] = useState('verified'); // verified | unverified | all
  const [mode, setMode] = useState('all'); // all | emails
  const [emails, setEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [textBody, setTextBody] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [previewName, setPreviewName] = useState('Student');
  const [attachments, setAttachments] = useState([]);
  const [inlineImages, setInlineImages] = useState([]);
  const [campaignId, setCampaignId] = useState(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewCounts, setPreviewCounts] = useState({ attachments: 0, inlineImages: 0 });
  const [previewTab, setPreviewTab] = useState('gmail'); // gmail | outlook
  const [previewDevice, setPreviewDevice] = useState('desktop'); // desktop | mobile

  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [history, setHistory] = useState([]);

  const inlineTokenHint = useMemo(() => {
    if (inlineImages.length === 0) return '';
    const first = inlineImages[0]?.name || 'image.png';
    return `Use {{inline:${first}}} in the HTML body to insert an inline image.`;
  }, [inlineImages]);

  const buildFormData = () => {
    const fd = new FormData();
    if (campaignId) fd.append('campaignId', campaignId);
    fd.append('audience', audience);
    fd.append('verificationStatus', verificationStatus);
    fd.append('mode', mode);
    if (mode === 'emails') fd.append('emails', emails);
    fd.append('subject', subject);
    fd.append('htmlBody', htmlBody);
    fd.append('textBody', textBody);
    fd.append('actionUrl', actionUrl);
    fd.append('previewName', previewName);
    attachments.forEach((f) => fd.append('attachments', f));
    inlineImages.forEach((f) => fd.append('inlineImages', f));
    return fd;
  };

  const onPickFiles = (setter) => (e) => {
    const files = Array.from(e.target.files || []);
    setter(files);
  };

  const handlePreview = async () => {
    setError('');
    setSuccess('');
    setPreviewing(true);
    try {
      const res = await adminService.previewAdminEmail(buildFormData());
      const data = res?.data;
      setPreviewHtml(data?.html || '');
      setPreviewCounts(data?.counts || { attachments: 0, inlineImages: 0 });
      setPreviewTab('gmail');
      setPreviewDevice('desktop');
      setIsPreviewOpen(true);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to preview email.');
    } finally {
      setPreviewing(false);
    }
  };

  const handleSend = async () => {
    setError('');
    setSuccess('');
    setSending(true);
    try {
      const res = await adminService.sendAdminEmail(buildFormData());
      const data = res?.data;
      setSuccess(
        `Email sent successfully. Recipients: ${data?.recipients ?? 0} (chunks: ${data?.chunks ?? 0}).`
      );
      setCampaignId(null);
      setAttachments([]);
      setInlineImages([]);
      await loadHistory();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await adminService.listAdminEmailCampaigns({ page: 1, limit: 20 });
      const items = res?.data?.items || [];
      setHistory(items);
    } catch (e) {
      // non-fatal
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadCampaign = async (id) => {
    setError('');
    setSuccess('');
    try {
      const res = await adminService.getAdminEmailCampaign(id);
      const campaign = res?.data?.campaign;
      if (!campaign) return;

      setCampaignId(campaign._id);
      setAudience(campaign.audience || 'students');
      setVerificationStatus(campaign.verificationStatus || 'verified');
      setMode(campaign.mode || 'all');
      setEmails((campaign.emails || []).join('\n'));
      setSubject(campaign.subject || '');
      setHtmlBody(campaign.htmlBody || '');
      setTextBody(campaign.textBody || '');
      setActionUrl(campaign?.variables?.actionUrl || campaign?.variables?.dashboardUrl || '');
      // Keep attachments/images on the server; user can add new ones by uploading.
      setAttachments([]);
      setInlineImages([]);
      setSuccess('Loaded previous email. You can edit it and send again.');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load previous email.');
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Email Center</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Send emails to students and clients, preview before sending, and attach files or inline images.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview} disabled={previewing || sending}>
            <Eye className="w-4 h-4 mr-2" />
            {previewing ? 'Previewing...' : 'Preview'}
          </Button>
          <Button
            variant="primary"
            onClick={() => setConfirmSendOpen(true)}
            disabled={sending || previewing}
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                >
                  <option value="students">Students</option>
                  <option value="clients">Clients</option>
                  <option value="both">Students + Clients</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verification</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={verificationStatus}
                  onChange={(e) => setVerificationStatus(e.target.value)}
                >
                  <option value="verified">Verified only</option>
                  <option value="unverified">Not verified only</option>
                  <option value="all">All (verified + not verified)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                >
                  <option value="all">All users (based on verification filter)</option>
                  <option value="emails">Specific emails</option>
                </select>
              </div>
            </div>

            {mode === 'emails' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email list (comma / newline separated)
                </label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 min-h-[90px]"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  placeholder="student1@example.com, student2@example.com"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (for buttons/links)</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://freshlancer.online"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use <span className="font-mono">{'{{actionUrl}}'}</span> (or <span className="font-mono">{'{{dashboardUrl}}'}</span>) in your email body.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preview name</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={previewName}
                  onChange={(e) => setPreviewName(e.target.value)}
                  placeholder="Ahmed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used only in preview for <span className="font-mono">{'{{name}}'}</span>.
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-700">
              Wrapping is <strong>always enabled</strong>. Your content will be automatically placed inside the
              Freshlancer email template.
            </div>
            {campaignId && (
              <div className="rounded-lg border bg-primary-50 px-3 py-2 text-sm text-primary-800">
                Re-send mode: using saved attachments/inline images from campaign <span className="font-mono">{campaignId}</span>{' '}
                (unless you upload new ones).
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="inline-flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Attachments
                  </span>
                </label>
                <input
                  type="file"
                  multiple
                  onChange={onPickFiles(setAttachments)}
                  className="w-full"
                />
                {attachments.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{attachments.length} file(s) selected</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="inline-flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Inline images
                  </span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={onPickFiles(setInlineImages)}
                  className="w-full"
                />
                {inlineImages.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {inlineImages.length} image(s) selected. {inlineTokenHint}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HTML Body</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 min-h-[260px] font-mono text-sm"
                value={htmlBody}
                onChange={(e) => setHtmlBody(e.target.value)}
                placeholder={'<p>Hello...</p>\n<p>...</p>\n<img src="{{inline:image.png}}" />'}
              />
              <p className="text-xs text-gray-500 mt-1">
                Tip: to inline an uploaded image, use <span className="font-mono">{'{{inline:filename}}'}</span>.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plain text (optional)
              </label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 min-h-[120px]"
                value={textBody}
                onChange={(e) => setTextBody(e.target.value)}
                placeholder="Plain text version..."
              />
              <p className="text-xs text-gray-500 mt-1">
                If HTML is empty, this text will be converted to HTML automatically (and wrapped).
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Previous emails</h2>
          </div>
          <Button variant="outline" size="sm" onClick={loadHistory} disabled={loadingHistory}>
            {loadingHistory ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-gray-600">No sent emails yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2 pr-4">Audience</th>
                  <th className="py-2 pr-4">Verification</th>
                  <th className="py-2 pr-4">Sent</th>
                  <th className="py-2 pr-4">Recipients</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h._id} className="border-b">
                    <td className="py-2 pr-4 font-medium text-gray-900 max-w-[420px] truncate">
                      {h.subject}
                    </td>
                    <td className="py-2 pr-4 text-gray-700">{h.audience}</td>
                    <td className="py-2 pr-4 text-gray-700">{h.verificationStatus}</td>
                    <td className="py-2 pr-4 text-gray-700">
                      {h.sentAt ? new Date(h.sentAt).toLocaleString() : '-'}
                    </td>
                    <td className="py-2 pr-4 text-gray-700">{h.recipientCount ?? 0}</td>
                    <td className="py-2 pr-0 text-right">
                      <Button variant="primary" size="sm" onClick={() => handleLoadCampaign(h._id)}>
                        Load
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Email Preview" size="xl">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span>Attachments: {previewCounts.attachments}</span>
            <span>Inline images: {previewCounts.inlineImages}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewTab('gmail')}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                previewTab === 'gmail' ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white text-gray-700'
              }`}
            >
              Gmail view
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('outlook')}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                previewTab === 'outlook' ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white text-gray-700'
              }`}
            >
              Outlook view
            </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1.5 rounded-lg text-sm border ${
                  previewDevice === 'desktop' ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white text-gray-700'
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1.5 rounded-lg text-sm border ${
                  previewDevice === 'mobile' ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white text-gray-700'
                }`}
              >
                Mobile
              </button>
            </div>
          </div>

          {(() => {
            const viewportWidth = previewDevice === 'mobile' ? 390 : 920;
            const canvasBg = previewTab === 'gmail' ? '#f6f8fc' : '#ffffff';
            const frameBg = previewTab === 'gmail' ? '#f6f8fc' : '#ffffff';
            const padding = previewTab === 'gmail' ? 24 : 12;

            const wrappedSrcDoc = `
              <!doctype html>
              <html>
                <head>
                  <meta charset="utf-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1" />
                  <base target="_blank" />
                  <style>
                    html, body { height: 100%; margin: 0; }
                    body { background: ${canvasBg}; padding: ${padding}px; box-sizing: border-box; }
                    .shell { max-width: ${viewportWidth}px; margin: 0 auto; }
                    .label { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size: 12px; color: #6b7280; margin: 0 0 10px 0; }
                    .frame { background: ${frameBg}; border: 1px solid rgba(0,0,0,0.08); border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
                    .content { width: 100%; }
                  </style>
                </head>
                <body>
                  <div class="shell">
                    <p class="label">${previewTab.toUpperCase()} • ${previewDevice.toUpperCase()} (${viewportWidth}px)</p>
                    <div class="frame">
                      <div class="content">
                        ${previewHtml}
                      </div>
                    </div>
                  </div>
                </body>
              </html>
            `;

            return (
              <div className="border rounded-xl overflow-hidden">
                <iframe
                  key={`${previewTab}-${previewDevice}-${previewHtml?.length || 0}`}
                  title={`email-preview-${previewTab}-${previewDevice}`}
                  className="w-full h-[70vh] bg-white"
                  sandbox="allow-same-origin allow-popups allow-top-navigation-by-user-activation"
                  srcDoc={wrappedSrcDoc}
                />
              </div>
            );
          })()}
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={confirmSendOpen}
        onClose={() => setConfirmSendOpen(false)}
        onConfirm={handleSend}
        title="Send this email?"
        message="This will send the email to the selected audience. Please preview before sending."
        confirmText="Send"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default EmailCenter;

