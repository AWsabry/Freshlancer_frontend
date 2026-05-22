import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Plus } from 'lucide-react';
import Card from '../common/Card';
import Loading from '../common/Loading';
import { educationBadgeService } from '../../services/educationBadgeService';
import { useDashboardLanguage } from '../../hooks/useDashboardLanguage';
import { getEducationBadgesT } from '../../locales/educationBadgesLocales';

export default function EducationBadgesCard() {
  const { language } = useDashboardLanguage();
  const t = useMemo(() => getEducationBadgesT(language), [language]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['educationBadgesMe'],
    queryFn: () => educationBadgeService.getMyAwards(),
  });

  const entities = data?.data?.entities || [];

  return (
    <Card title={t.title}>
      <p className="text-xs sm:text-sm text-gray-600 mb-4">{t.subtitle}</p>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <p className="text-sm text-red-600">{t.failedToLoad}</p>
      ) : entities.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <GraduationCap className="w-4 h-4 shrink-0" />
          <span>{t.noBadges}</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {entities.map((row) => {
            const entity = row.entity;
            const count = row.certificates?.length || 0;
            return (
              <Link
                key={entity._id}
                to={`/student/education-badges/${entity._id}`}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-gray-50 transition-colors text-center"
              >
                <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                  {entity.logoUrl ? (
                    <img
                      src={entity.logoUrl}
                      alt={entity.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <GraduationCap className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2">
                  {entity.name}
                </span>
                <span className="text-xs text-gray-500">
                  {t.certificateCount.replace('{count}', String(count))}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <Link
          to="/student/education-badges/request"
          className="btn btn-outline px-3 py-1.5 text-sm font-medium flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          {t.requestBadge}
        </Link>
        {entities.length > 0 && (
          <Link
            to="/student/education-badges"
            className="btn btn-outline px-3 py-1.5 text-sm font-medium flex items-center justify-center w-full sm:w-auto"
          >
            {t.viewAll}
          </Link>
        )}
      </div>
    </Card>
  );
}
