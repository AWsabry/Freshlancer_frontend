import React, { useMemo } from 'react';
import { Award, Code, ExternalLink, Github, Trophy } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

const PROVIDERS = [
  { key: 'leetcode', label: 'LeetCode', fallbackIcon: Code },
  { key: 'hackerrank', label: 'HackerRank', fallbackIcon: Trophy },
  { key: 'codeforces', label: 'Codeforces', fallbackIcon: Trophy },
  { key: 'github', label: 'GitHub', fallbackIcon: Github },
];

const DEFAULT_ICON_MAP = {
  leetcode: '/LeetCode.png.webp',
  hackerrank: '/hackerrank.svg',
  codeforces: '/CodeForces.png.webp',
  github: '/Github.svg',
};

function statusLabel(syncStatus, t) {
  switch (syncStatus) {
    case 'synced':
      return t.platformSynced;
    case 'connected':
      return t.platformConnected;
    case 'linkOnly':
      return t.platformLinkOnly;
    default:
      return null;
  }
}

function formatStats(key, stats) {
  const s = stats?.[key];
  if (!s) return [];
  const lines = [];
  if (key === 'github') {
    if (s.publicRepos != null) lines.push(`${s.publicRepos} public repos`);
    if (s.followers != null) lines.push(`${s.followers} followers`);
  }
  if (key === 'leetcode' && s.totalSolved != null) {
    lines.push(`${s.totalSolved} problems solved`);
  }
  if (key === 'hackerrank' && s.badgesCount != null) {
    lines.push(`${s.badgesCount} badges`);
  }
  if (key === 'codeforces' && s.rating != null) {
    lines.push(`Rating ${s.rating}`);
  }
  return lines;
}

export default function ClientPlatformsCard({ externalProfilesPublic, t }) {
  const providers = externalProfilesPublic?.providers || {};
  const badges = Array.isArray(externalProfilesPublic?.badges)
    ? externalProfilesPublic.badges
    : [];
  const stats = externalProfilesPublic?.stats || {};
  const iconMap = DEFAULT_ICON_MAP;

  const groupedBadges = useMemo(() => {
    const map = new Map(PROVIDERS.map((p) => [p.key, []]));
    for (const b of badges) {
      if (b?.provider && map.has(b.provider)) map.get(b.provider).push(b);
    }
    return map;
  }, [badges]);

  const connected = PROVIDERS.filter((p) => providers[p.key]?.username);

  if (connected.length === 0 && badges.length === 0) {
    return (
      <Card title={t.connectedPlatforms}>
        <p className="text-sm text-gray-500">{t.noPlatforms}</p>
      </Card>
    );
  }

  return (
    <Card title={t.connectedPlatforms}>
      <p className="text-xs sm:text-sm text-gray-600 mb-4">{t.connectedPlatformsSubtitle}</p>

      <div className="space-y-3 mb-6">
        {PROVIDERS.map((p) => {
          const data = providers[p.key] || {};
          if (!data.username && !data.profileUrl) return null;

          const ProviderIcon = p.fallbackIcon;
          const iconSrc = iconMap[p.key];
          const status = statusLabel(data.syncStatus, t);
          const statLines = formatStats(p.key, stats);

          return (
            <div
              key={p.key}
              className="border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {iconSrc ? (
                    <img src={iconSrc} alt="" className="w-6 h-6 object-contain" />
                  ) : (
                    <ProviderIcon className="w-5 h-5 text-gray-700" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{p.label}</span>
                    {status && (
                      <Badge variant="info" className="text-xs">
                        {status}
                      </Badge>
                    )}
                  </div>
                  {data.username && (
                    <p className="text-sm text-gray-700 truncate">@{data.username}</p>
                  )}
                  {statLines.length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">{statLines.join(' · ')}</p>
                  )}
                </div>
              </div>
              {data.profileUrl && (
                <a
                  href={data.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t.viewProfile}
                </a>
              )}
            </div>
          );
        })}
      </div>

      {badges.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Award className="w-4 h-4" />
            {t.platformBadges}
          </h4>
          {PROVIDERS.map((p) => {
            const list = groupedBadges.get(p.key) || [];
            if (list.length === 0) return null;
            const ProviderIcon = p.fallbackIcon;
            const iconSrc = iconMap[p.key];

            return (
              <div key={p.key} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded bg-gray-50 border flex items-center justify-center overflow-hidden">
                    {iconSrc ? (
                      <img src={iconSrc} alt="" className="w-4 h-4 object-contain" />
                    ) : (
                      <ProviderIcon className="w-3.5 h-3.5 text-gray-700" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{p.label}</span>
                  <span className="text-xs text-gray-500">({list.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {list.slice(0, 8).map((b, idx) => (
                    <span
                      key={`${b.provider}-${b.name || idx}`}
                      className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-800"
                    >
                      {b.name || 'Badge'}
                      {b.level ? ` (${b.level})` : ''}
                    </span>
                  ))}
                  {list.length > 8 && (
                    <span className="text-xs text-gray-500">+{list.length - 8}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
