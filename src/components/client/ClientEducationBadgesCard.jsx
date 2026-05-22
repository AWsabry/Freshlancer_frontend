import React, { useState } from 'react';
import { GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { API_BASE_URL } from '../../config/env';

function logoSrc(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/${url}`;
}

function formatDate(value, locale) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const loc = locale === 'it' ? 'it-IT' : locale === 'ar' ? 'ar-EG' : 'en-US';
  return d.toLocaleDateString(loc, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ClientEducationBadgesCard({ entities = [], t, language = 'en' }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!entities.length) {
    return (
      <Card title={t.educationPartners}>
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 shrink-0" />
          {t.noEducationBadges}
        </p>
      </Card>
    );
  }

  return (
    <Card title={t.educationPartners}>
      <p className="text-xs sm:text-sm text-gray-600 mb-4">{t.educationPartnersSubtitle}</p>
      <div className="space-y-4">
        {entities.map((row) => {
          const entity = row.entity;
          const certs = row.certificates || [];
          const entityId = entity?._id || row._id;
          const isOpen = expandedId === entityId;

          return (
            <div key={entityId} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedId(isOpen ? null : entityId)}
                className="w-full flex items-center gap-3 p-3 sm:p-4 hover:bg-gray-50 text-left"
              >
                <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                  {entity?.logoUrl ? (
                    <img
                      src={logoSrc(entity.logoUrl)}
                      alt={entity.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <GraduationCap className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">{entity?.name}</div>
                  <div className="text-xs text-gray-500">
                    {t.certificateCount.replace('{count}', String(certs.length))}
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
                )}
              </button>

              {isOpen && certs.length > 0 && (
                <ul className="border-t border-gray-100 divide-y divide-gray-100 bg-gray-50/50">
                  {certs.map((cert) => (
                    <li key={cert._id || cert.awardId} className="px-3 sm:px-4 py-3">
                      <div className="font-medium text-gray-900">{cert.title}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-600">
                        {cert.track && <span>{cert.track}</span>}
                        {cert.category?.name && (
                          <Badge variant="default" className="text-xs">
                            {cert.category.name}
                          </Badge>
                        )}
                        {cert.awardedAt && (
                          <span>
                            {t.awarded}: {formatDate(cert.awardedAt, language)}
                          </span>
                        )}
                      </div>
                      {cert.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cert.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
