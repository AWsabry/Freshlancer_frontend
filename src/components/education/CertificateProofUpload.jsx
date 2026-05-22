import React, { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Upload, Trash2, Eye } from 'lucide-react';
import Button from '../common/Button';
import { educationBadgeService } from '../../services/educationBadgeService';
import { API_BASE_URL } from '../../config/env';

export default function CertificateProofUpload({
  awardId,
  entityId,
  proofDocument,
  hasProof,
  t,
  dateLocale,
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState('');

  const invalidate = () => {
    queryClient.invalidateQueries(['educationBadgesMe']);
    if (entityId) {
      queryClient.invalidateQueries(['educationBadgesEntity', entityId]);
    }
  };

  const uploadMutation = useMutation({
    mutationFn: (file) => educationBadgeService.uploadAwardProof(awardId, file),
    onSuccess: () => {
      setUploadError('');
      invalidate();
    },
    onError: (err) => {
      setUploadError(err?.message || t.proofUploadFailed);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => educationBadgeService.deleteAwardProof(awardId),
    onSuccess: invalidate,
    onError: (err) => {
      setUploadError(err?.message || t.proofDeleteFailed);
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    uploadMutation.mutate(file);
    e.target.value = '';
  };

  const proofUrl = proofDocument?.url ? `${API_BASE_URL}${proofDocument.url}` : null;

  const uploadedLabel =
    proofDocument?.uploadedAt &&
    new Date(proofDocument.uploadedAt).toLocaleDateString(dateLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs font-medium text-gray-700 mb-2">{t.proofTitle}</p>
      {hasProof && proofDocument ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileText className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="text-sm text-gray-800 truncate">{proofDocument.filename}</span>
            {uploadedLabel && (
              <span className="text-xs text-gray-500 shrink-0">
                ({t.uploaded} {uploadedLabel})
              </span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {proofUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(proofUrl, '_blank')}
              >
                <Eye className="w-3 h-3 mr-1" />
                {t.viewProof}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              loading={uploadMutation.isPending}
            >
              <Upload className="w-3 h-3 mr-1" />
              {t.replaceProof}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => {
                if (window.confirm(t.deleteProofConfirm)) {
                  deleteMutation.mutate();
                }
              }}
              loading={deleteMutation.isPending}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              {t.deleteProof}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <p className="text-xs text-gray-500 flex-1">{t.noProofUploaded}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            loading={uploadMutation.isPending}
          >
            <Upload className="w-3 h-3 mr-1" />
            {t.uploadProof}
          </Button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,image/jpeg,image/png"
        className="hidden"
        onChange={handleFileChange}
      />
      {uploadError && <p className="text-xs text-red-600 mt-2">{uploadError}</p>}
      <p className="text-[10px] text-gray-400 mt-1">{t.proofHint}</p>
    </div>
  );
}
