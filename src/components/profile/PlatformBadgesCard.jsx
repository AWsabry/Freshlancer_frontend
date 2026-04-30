import React, { useMemo } from 'react';
import { Award, Code, Github, RefreshCw, Trophy } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const PROVIDERS = [
  { key: 'leetcode', label: 'LeetCode', fallbackIcon: Code },
  { key: 'hackerrank', label: 'HackerRank', fallbackIcon: Trophy },
  { key: 'codeforces', label: 'Codeforces', fallbackIcon: Trophy },
  { key: 'github', label: 'GitHub', fallbackIcon: Github },
];

export default function PlatformBadgesCard({
  externalProfiles,
  iconMap,
  onSyncAll,
  syncingAll = false,
}) {
  const badges = Array.isArray(externalProfiles?.badges) ? externalProfiles.badges : [];

  const grouped = useMemo(() => {
    const map = new Map();
    for (const p of PROVIDERS) map.set(p.key, []);
    for (const b of badges) {
      if (!b || !b.provider) continue;
      if (!map.has(b.provider)) continue;
      map.get(b.provider).push(b);
    }
    return map;
  }, [badges]);

  const total = badges.length;

  return (
    <Card title="Badges">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <p className="text-xs sm:text-sm text-gray-600">
          Badges are fetched from platforms that support them. Connect your accounts and hit Sync to update.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onSyncAll}
          loading={syncingAll}
          disabled={!onSyncAll || syncingAll}
          className="w-full sm:w-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync badges
        </Button>
      </div>

      {total === 0 ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Award className="w-4 h-4" />
          <span>No badges yet.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {PROVIDERS.map((p) => {
            const list = grouped.get(p.key) || [];
            if (list.length === 0) return null;

            const ProviderIcon = p.fallbackIcon;
            const providerIconSrc = iconMap?.[p.key];

            return (
              <div key={p.key} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                    {providerIconSrc ? (
                      <img
                        src={providerIconSrc}
                        alt={`${p.label} icon`}
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      <ProviderIcon className="w-4 h-4 text-gray-700" />
                    )}
                  </div>
                  <div className="font-semibold text-gray-900">{p.label}</div>
                  <div className="text-xs text-gray-500">({list.length})</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {list.slice(0, 12).map((b, idx) => {
                    const title = b.displayName || b.name || b.id || 'Badge';
                    const iconUrl = b.iconUrl;

                    return (
                      <div
                        key={`${b.provider}-${b.id || b.name || idx}`}
                        className="flex items-center gap-2 border border-gray-100 rounded-md p-2 bg-white"
                        title={title}
                      >
                        <div className="w-7 h-7 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {iconUrl ? (
                            <img
                              src={iconUrl}
                              alt=""
                              className="w-5 h-5 object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <Award className="w-4 h-4 text-gray-700" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {title}
                          </div>
                          {b.earnedAt && (
                            <div className="text-[10px] sm:text-xs text-gray-500">
                              {new Date(b.earnedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {list.length > 12 && (
                  <div className="text-xs text-gray-500 mt-2">
                    Showing 12 of {list.length}.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

