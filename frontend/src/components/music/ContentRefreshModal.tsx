import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  X,
  Sliders,
  Check,
  RotateCw,
  Sparkles,
  Zap,
  Clock,
  Radio,
  Layers,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export interface ContentRefreshSettings {
  autoRefreshInterval: number; // in seconds: 0 (disabled), 120, 300, 600, 900
  reshuffleOnRefresh: boolean;
  clearCacheOnRefresh: boolean;
  sources: {
    spotify: boolean;
    jioSaavn: boolean;
    youtube: boolean;
    royaltyFree: boolean;
  };
}

export const DEFAULT_REFRESH_SETTINGS: ContentRefreshSettings = {
  autoRefreshInterval: 300, // 5 minutes
  reshuffleOnRefresh: true,
  clearCacheOnRefresh: true,
  sources: {
    spotify: true,
    jioSaavn: true,
    youtube: true,
    royaltyFree: true,
  },
};

const STORAGE_KEY = 'nexora_content_refresh_settings';

export function loadRefreshSettings(): ContentRefreshSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_REFRESH_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Failed to parse refresh settings:', err);
  }
  return DEFAULT_REFRESH_SETTINGS;
}

export function saveRefreshSettings(settings: ContentRefreshSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save refresh settings:', err);
  }
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: (options?: { force?: boolean }) => Promise<void>;
  isRefreshing: boolean;
  lastRefreshed: Date;
  onSettingsChange?: (newSettings: ContentRefreshSettings) => void;
}

export const ContentRefreshModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onRefresh,
  isRefreshing,
  lastRefreshed,
  onSettingsChange,
}) => {
  const [settings, setSettings] = useState<ContentRefreshSettings>(loadRefreshSettings);
  const [hasSaved, setHasSaved] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    if (isOpen) {
      setSettings(loadRefreshSettings());
      setHasSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateSetting = <K extends keyof ContentRefreshSettings>(
    key: K,
    val: ContentRefreshSettings[K]
  ) => {
    const next = { ...settings, [key]: val };
    setSettings(next);
    saveRefreshSettings(next);
    if (onSettingsChange) onSettingsChange(next);
  };

  const updateSource = (srcKey: keyof ContentRefreshSettings['sources'], val: boolean) => {
    const nextSources = { ...settings.sources, [srcKey]: val };
    const next = { ...settings, sources: nextSources };
    setSettings(next);
    saveRefreshSettings(next);
    if (onSettingsChange) onSettingsChange(next);
  };

  const handleApplyAndRefresh = async () => {
    saveRefreshSettings(settings);
    if (onSettingsChange) onSettingsChange(settings);
    setHasSaved(true);
    addNotification({
      type: 'info',
      title: 'Content Refresh Initialized',
      message: 'Fetching fresh audio feeds from Spotify, JioSaavn & YouTube...',
      duration: 3000,
    });
    await onRefresh({ force: true });
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_REFRESH_SETTINGS);
    saveRefreshSettings(DEFAULT_REFRESH_SETTINGS);
    if (onSettingsChange) onSettingsChange(DEFAULT_REFRESH_SETTINGS);
    addNotification({
      type: 'info',
      title: 'Refresh Settings Reset',
      message: 'Defaults restored (5m auto-refresh, smart reshuffle enabled)',
    });
  };

  const formatLastRefreshed = (date: Date) => {
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 15) return 'Just now';
    if (diffSec < 60) return `${diffSec} seconds ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white select-none">
      <div className="relative w-full max-w-xl bg-dark-secondary/95 border border-dark-border/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Top Specular Sheen */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent rounded-t-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-dark-border/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shadow-sm">
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Content Refresh Options
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE SYNC
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Configure feed synchronization, auto-refresh intervals & discovery reshuffling
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feed Status Banner */}
        <div className="p-4 rounded-2xl bg-dark-card/60 border border-dark-border/80 relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span>Multi-Source Feed Connected</span>
                <span className="text-[10px] text-gray-400 font-normal">
                  (Spotify • JioSaavn • YouTube)
                </span>
              </div>
              <div className="text-[11px] text-gray-400 font-mono mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-accent" />
                <span>Last Refreshed: {formatLastRefreshed(lastRefreshed)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onRefresh({ force: true })}
            disabled={isRefreshing}
            className="px-3.5 py-1.5 rounded-xl bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent font-semibold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Instant Refresh"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Feed Now'}</span>
          </button>
        </div>

        {/* Section 1: Auto-Refresh Interval */}
        <div className="space-y-3 relative z-10">
          <label className="text-xs font-mono uppercase text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>Automated Feed Refresh Interval</span>
            </span>
            <span className="text-[10px] text-primary-light font-normal">
              {settings.autoRefreshInterval === 0
                ? 'Manual Only'
                : `Every ${settings.autoRefreshInterval / 60} Minutes`}
            </span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { label: 'Off', val: 0, desc: 'Manual only' },
              { label: '2 Min', val: 120, desc: 'Ultra-fast' },
              { label: '5 Min', val: 300, desc: 'Recommended', rec: true },
              { label: '15 Min', val: 900, desc: 'Balanced' },
              { label: '30 Min', val: 1800, desc: 'Relaxed' },
            ].map(opt => {
              const isSelected = settings.autoRefreshInterval === opt.val;
              return (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => updateSetting('autoRefreshInterval', opt.val)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center relative ${
                    isSelected
                      ? 'bg-accent/20 border-accent text-white shadow-sm ring-1 ring-accent/40 font-bold'
                      : 'bg-dark-card/50 border-dark-border/80 text-gray-400 hover:text-white hover:bg-dark-card'
                  }`}
                >
                  {opt.rec && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-accent text-[8px] font-mono text-black font-extrabold uppercase">
                      BEST
                    </span>
                  )}
                  <span className="text-xs font-semibold">{opt.label}</span>
                  <span className="text-[9px] font-mono text-gray-500 mt-0.5">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Discovery & Reshuffle Algorithms */}
        <div className="space-y-3 pt-3 border-t border-dark-border/60 relative z-10">
          <label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Smart Discovery & Reshuffling</span>
          </label>

          <div className="space-y-2.5">
            {/* Toggle 1: Reshuffle */}
            <label className="flex items-start gap-3 p-3 rounded-2xl bg-dark-bg/60 border border-dark-border/80 hover:border-dark-border cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={settings.reshuffleOnRefresh}
                onChange={e => updateSetting('reshuffleOnRefresh', e.target.checked)}
                className="mt-0.5 rounded text-accent focus:ring-0 accent-accent cursor-pointer"
              />
              <div className="text-xs">
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <span>Reshuffle Trending Discoveries on Refresh</span>
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                  Rotates keyword charts and offsets across JioSaavn, YouTube, and regional catalogs so you discover brand-new bangers whenever you refresh.
                </p>
              </div>
            </label>

            {/* Toggle 2: Clear Stream Cache */}
            <label className="flex items-start gap-3 p-3 rounded-2xl bg-dark-bg/60 border border-dark-border/80 hover:border-dark-border cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={settings.clearCacheOnRefresh}
                onChange={e => updateSetting('clearCacheOnRefresh', e.target.checked)}
                className="mt-0.5 rounded text-accent focus:ring-0 accent-accent cursor-pointer"
              />
              <div className="text-xs">
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <span>Bypass Server & Provider Stream Cache</span>
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                  Forces immediate re-fetching directly from Spotify embeds, JioSaavn CDN, and YouTube Music streams instead of 30-minute memory cache.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Section 3: Enabled Streaming Feeds */}
        <div className="space-y-3 pt-3 border-t border-dark-border/60 relative z-10">
          <label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Feed Channels</span>
          </label>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              {
                id: 'spotify' as const,
                label: 'Spotify Global Top 50',
                badge: 'SP',
                badgeColor: 'bg-[#1DB954] text-black',
              },
              {
                id: 'jioSaavn' as const,
                label: 'JioSaavn Chartbusters',
                badge: 'JS',
                badgeColor: 'bg-teal-500 text-white',
              },
              {
                id: 'youtube' as const,
                label: 'YouTube Music Streams',
                badge: 'YT',
                badgeColor: 'bg-red-600 text-white',
              },
              {
                id: 'royaltyFree' as const,
                label: '10-Language Global Hits',
                badge: 'NX',
                badgeColor: 'bg-purple-600 text-white',
              },
            ].map(source => (
              <label
                key={source.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  settings.sources[source.id]
                    ? 'bg-dark-card border-dark-border'
                    : 'bg-dark-bg/40 border-dark-border/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`w-5 h-5 rounded-md text-[9px] font-black flex items-center justify-center flex-shrink-0 ${source.badgeColor}`}
                  >
                    {source.badge}
                  </span>
                  <span className="truncate text-white font-medium">{source.label}</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.sources[source.id]}
                  onChange={e => updateSource(source.id, e.target.checked)}
                  className="rounded text-accent focus:ring-0 accent-accent"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-border/80 relative z-10">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-dark-bg hover:bg-dark-hover border border-dark-border text-xs text-gray-300 font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApplyAndRefresh}
              disabled={isRefreshing}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-xs font-bold text-white transition-opacity flex items-center gap-2 shadow-glow-primary disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing Feed...' : 'Save & Refresh Feed'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

