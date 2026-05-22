import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, GraduationCap, ExternalLink, Plus } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { educationBadgeService } from '../../services/educationBadgeService';
import CertificateProofUpload from '../../components/education/CertificateProofUpload';
import { useDashboardLanguage } from '../../hooks/useDashboardLanguage';
import { getEducationBadgesT } from '../../locales/educationBadgesLocales';

const formatDate = (date, locale) => {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
};

export default function StudentEducationBadges() {
  const { entityId } = useParams();
  const { language, isRTL, dateLocale } = useDashboardLanguage();
  const t = useMemo(() => getEducationBadgesT(language), [language]);

  const listQuery = useQuery({
    queryKey: ['educationBadgesMe'],
    queryFn: () => educationBadgeService.getMyAwards(),
    enabled: !entityId,
  });

  const detailQuery = useQuery({
    queryKey: ['educationBadgesEntity', entityId],
    queryFn: () => educationBadgeService.getMyEntityAwards(entityId),
    enabled: !!entityId,
  });

  const isLoading = entityId ? detailQuery.isLoading : listQuery.isLoading;
  const isError = entityId ? detailQuery.isError : listQuery.isError;

  const entities = entityId
    ? detailQuery.data?.data
      ? [detailQuery.data.data]
      : []
    : listQuery.data?.data?.entities || [];

  const detailEntity = entityId && entities[0]?.entity;

  return (
    <div className="space-y-4 sm:space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link
            to={entityId ? '/student/education-badges' : '/student/profile'}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {entityId ? t.backToAll : t.title}
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {entityId && detailEntity ? detailEntity.name : t.title}
          </h1>
          {!entityId && (
            <p className="text-sm text-gray-600 mt-1">{t.subtitle}</p>
          )}
        </div>
        <Link to="/student/education-badges/request">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t.requestBadge}
          </Button>
        </Link>
      </div>

      {entityId && detailEntity?.website && (
        <a
          href={detailEntity.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline"
        >
          {t.visitWebsite}
          <ExternalLink className="w-3 h-3" />
        </a>
      )}

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Alert type="error" message={t.failedToLoad} />
      ) : entities.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-600">{t.noBadges}</p>
        </Card>
      ) : entityId ? (
        <Card title={t.partnerDetail}>
          <ul className="space-y-4">
            {(entities[0]?.certificates || []).map((cert) => (
              <li
                key={cert.awardId || cert._id}
                className="flex gap-4 p-4 border border-gray-200 rounded-lg"
              >
                <div className="w-14 h-14 shrink-0 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                  {cert.imageUrl ? (
                    <img src={cert.imageUrl} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <GraduationCap className="w-7 h-7 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900">{cert.title}</h3>
                  {cert.track && (
                    <p className="text-sm text-gray-600">
                      {t.track}: {cert.track}
                    </p>
                  )}
                  {cert.category?.name && (
                    <p className="text-sm text-gray-600">
                      {t.category}: {cert.category.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {t.awardedOn}: {formatDate(cert.awardedAt, dateLocale)}
                  </p>
                  {cert.awardId && (
                    <CertificateProofUpload
                      awardId={cert.awardId}
                      entityId={entityId}
                      proofDocument={cert.proofDocument}
                      hasProof={cert.hasProof}
                      t={t}
                      dateLocale={dateLocale}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {entities.map((row) => {
            const entity = row.entity;
            return (
              <Link
                key={entity._id}
                to={`/student/education-badges/${entity._id}`}
                className="block"
              >
                <Card className="hover:border-primary-300 transition-colors h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 shrink-0 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                      {entity.logoUrl ? (
                        <img
                          src={entity.logoUrl}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <GraduationCap className="w-7 h-7 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{entity.name}</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {t.certificateCount.replace(
                          '{count}',
                          String(row.certificates?.length || 0)
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
