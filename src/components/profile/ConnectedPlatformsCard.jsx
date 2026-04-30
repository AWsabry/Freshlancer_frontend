import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { ExternalLink, RefreshCw, Github, Code, Trophy } from 'lucide-react';

const PROVIDERS = [
  { key: 'leetcode', label: 'LeetCode', defaultIcon: Code },
  { key: 'hackerrank', label: 'HackerRank', defaultIcon: Trophy },
  { key: 'codeforces', label: 'Codeforces', defaultIcon: Trophy },
  { key: 'github', label: 'GitHub', defaultIcon: Github },
];

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString();
}

function statusBadge(syncStatus) {
  switch (syncStatus) {
    case 'synced':
      return { variant: 'success', text: 'Synced' };
    case 'connected':
      return { variant: 'info', text: 'Connected' };
    case 'error':
      return { variant: 'danger', text: 'Error' };
    case 'linkOnly':
      return { variant: 'warning', text: 'Link only' };
    case 'disconnected':
    default:
      return { variant: 'default', text: 'Not connected' };
  }
}

export default function ConnectedPlatformsCard({
  externalProfiles,
  iconMap,
  onSyncAll,
  onSyncProvider,
  syncingAll = false,
  syncingProviderKey = null,
}) {
  const providers = externalProfiles?.providers || {};

  return (
    <Card title="Connected Platforms">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <p className="text-xs sm:text-sm text-gray-600">
          Link your usernames to show badges and public stats on your profile.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onSyncAll}
          loading={syncingAll}
          disabled={syncingAll}
          className="w-full sm:w-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync all
        </Button>
      </div>

      <div className="space-y-3">
        {PROVIDERS.map((p) => {
          const data = providers?.[p.key] || {};
          const username = data.username || '';
          const profileUrl = data.profileUrl || '';
          const syncStatus = data.syncStatus || (username ? 'connected' : 'disconnected');
          const lastSyncedAt = formatDate(data.lastSyncedAt);
          const syncError = data.syncError;
          const badge = statusBadge(syncStatus);

          const Icon = p.defaultIcon;
          const iconSrc = iconMap?.[p.key];

          const syncingThis = syncingProviderKey === p.key;

          return (
            <div
              key={p.key}
              className="border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {iconSrc ? (
                    <img src={iconSrc} alt={`${p.label} icon`} className="w-6 h-6 object-contain" />
                  ) : (
                    <Icon className="w-5 h-5 text-gray-700" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-semibold text-gray-900">{p.label}</div>
                    <Badge variant={badge.variant} className="text-xs">
                      {badge.text}
                    </Badge>
                  </div>

                  {username ? (
                    <div className="text-xs sm:text-sm text-gray-700 truncate">
                      @{username}
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm text-gray-500">
                      Add your username in Edit Profile to connect.
                    </div>
                  )}

                  {lastSyncedAt && (
                    <div className="text-[10px] sm:text-xs text-gray-500">
                      Last synced: {lastSyncedAt}
                    </div>
                  )}

                  {syncStatus === 'error' && syncError && (
                    <div className="text-[10px] sm:text-xs text-red-600 mt-1">
                      {syncError}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!profileUrl}
                  onClick={() => {
                    if (profileUrl) window.open(profileUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex-1 sm:flex-none"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!username || syncingThis}
                  loading={syncingThis}
                  onClick={() => onSyncProvider?.(p.key)}
                  className="flex-1 sm:flex-none"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

