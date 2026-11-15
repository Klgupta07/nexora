import React, { useState, useEffect, useMemo } from 'react';
import {
  DownloadCloud,
  Play,
  Trash2,
  HardDrive,
  Music,
  Shuffle,
  ArrowLeft,
  CheckCircle2,
  Search,
  Sliders,
  Sparkles,
  Clock,
  ShieldCheck,
  Download,
  Share2,
  RefreshCw,
  Zap,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { OfflinePreparationModal } from './OfflinePreparationModal';
import { offlineStorage } from '../../services/offlineStorage';
import { musicApi } from '../../services/musicApi';
import { Track } from '../../types';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { useNotification } from '../../context/NotificationContext';

interface Props {
  onBack?: () => void;
  onExplore?: () => void;
}

export const OfflineLibrary: React.FC<Props> = ({ onBack, onExplore }) => {
  const [offlineItems, setOfflineItems] = useState<
    Array<{ track: Track; size: number; downloadedAt: number }>
  >([]);
  const [stats, setStats] = useState<{
    count: number;
    totalBytes: number;
    formattedSize: string;
  }>({
    count: 0,
    totalBytes: 0,
    formattedSize: '0 MB',
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('all');
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [autoCacheLiked, setAutoCacheLiked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('chillmode_auto_save_offline') === 'true' || localStorage.getItem('nexora_auto_save_offline') === 'true';
    } catch {
      return true;
    }
  });

  const {
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    removeOfflineTrack,
    isOfflinePlaying,
    downloadAllOffline,
    isOnline,
  } = useMusicPlayer();
  const { addNotification } = useNotification();

  const loadOfflineData = async () => {
    setLoading(true);
    try {
      const [items, currentStats] = await Promise.all([
        offlineStorage.getAllOfflineTracks(),
        offlineStorage.getOfflineStats(),
      ]);
      setOfflineItems(items);
      setStats(currentStats);
    } catch (err) {
      console.error('Failed to load offline tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOfflineData();
  }, []);

  const handlePlayOffline = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(
        track,
        filteredItems.map(i => i.track)
      );
    }
  };

  const handlePlayAll = (shuffle = false) => {
    if (filteredItems.length === 0) return;
    let list = filteredItems.map(i => i.track);
    if (shuffle) {
      list = [...list].sort(() => Math.random() - 0.5);
    }
    playTrack(list[0], list);
  };

  const handleDelete = async (trackId: string, title: string) => {
    await removeOfflineTrack(trackId);
    setOfflineItems(prev => prev.filter(i => i.track.id !== trackId));
    const newStats = await offlineStorage.getOfflineStats();
    setStats(newStats);
    addNotification({
      type: 'info',
      title: 'Track Removed from Offline Storage',
      message: title,
      duration: 2500,
    });
  };

  const handleClearAll = async () => {
    if (
      window.confirm(
        'Are you sure you want to purge all downloaded songs from local device storage?'
      )
    ) {
      await offlineStorage.clearAllOfflineTracks();
      setOfflineItems([]);
      setStats({ count: 0, totalBytes: 0, formattedSize: '0 MB' });
      addNotification({
        type: 'info',
        title: 'Offline Storage Cleared',
        duration: 2000,
      });
    }
  };

  // Bulk Download Trending Top Hits
  const handleBulkDownloadTrending = async () => {
    setIsBulkDownloading(true);
    addNotification({
      type: 'info',
      title: 'Bulk Offline Download Initialized',
      message: 'Fetching top 15 chartbusters for offline device storage...',
      duration: 3500,
    });

    try {
      const feedRes = await musicApi.getHomeFeed({ refresh: false });
      if (feedRes.success && feedRes.data) {
        const candidates = [
          ...(feedRes.data.jioSaavnTrending || []),
          ...(feedRes.data.youtubeTrending || []),
          ...(feedRes.data.spotifyTopHits || []),
        ].slice(0, 15);

        await downloadAllOffline(candidates);
        await loadOfflineData();

        addNotification({
          type: 'success',
          title: 'Bulk Download Completed',
          message: `${candidates.length} tracks are now ready for offline playback!`,
          duration: 4000,
        });
      }
    } catch (err: any) {
      console.error('Bulk download error:', err);
    } finally {
      setIsBulkDownloading(false);
    }
  };

  const handleToggleAutoCache = (val: boolean) => {
    setAutoCacheLiked(val);
    try {
      localStorage.setItem('nexora_auto_save_offline', String(val));
    } catch {}
    addNotification({
      type: 'info',
      title: val ? 'Auto-Cache Enabled' : 'Auto-Cache Disabled',
      message: val
        ? 'Songs you like with a heart will automatically download offline!'
        : 'Liked songs will not be cached automatically.',
    });
  };

  const handleExportBackup = () => {
    const data = {
      exportDate: new Date().toISOString(),
      trackCount: offlineItems.length,
      totalBytes: stats.totalBytes,
      tracks: offlineItems.map(i => ({
        id: i.track.id,
        title: i.track.title,
        artist: i.track.artist,
        album: i.track.album,
        source: i.track.source,
        language: i.track.language,
        downloadedAt: i.downloadedAt,
        size: i.size,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chillmode-offline-library-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Offline Library Backup Exported',
      message: 'Downloaded metadata manifest JSON to your device.',
    });
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return offlineItems.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.track.title.toLowerCase().includes(q) ||
        item.track.artist.toLowerCase().includes(q) ||
        (item.track.language && item.track.language.toLowerCase().includes(q));

      const matchSource =
        selectedSourceFilter === 'all' ||
        (selectedSourceFilter === 'saavn' && item.track.id.startsWith('saavn-')) ||
        (selectedSourceFilter === 'youtube' &&
          (item.track.id.startsWith('yt-') || item.track.youtubeId)) ||
        (selectedSourceFilter === 'spotify' && item.track.id.startsWith('sp-'));

      return matchQuery && matchSource;
    });
  }, [offlineItems, searchQuery, selectedSourceFilter]);

  // Total playtime calculation
  const totalSeconds = useMemo(() => {
    return offlineItems.reduce((acc, i) => acc + (i.track.duration || 210), 0);
  }, [offlineItems]);

  const formattedHours = useMemo(() => {
    const h = (totalSeconds / 3600).toFixed(1);
    return `${h} Hours`;
  }, [totalSeconds]);

  // Quota calculation (Assume 50GB allocated device quota)
  const quotaBytes = 50 * 1024 * 1024 * 1024; // 50 GB
  const usedPercent = Math.min(100, Math.max(0.2, (stats.totalBytes / quotaBytes) * 100));

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Lossless Stream';
    if (bytes > 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 select-none">
      {/* Offline Preparation Hub Modal */}
      <OfflinePreparationModal
        isOpen={isPrepModalOpen}
        onClose={() => setIsPrepModalOpen(false)}
        onComplete={loadOfflineData}
      />

      {/* 📡 Connection Status Banner when Disconnected */}
      {!isOnline && (
        <div className="p-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/15 border border-amber-500/40 text-amber-200 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
            <span>
              <strong>Offline Mode Active:</strong> Zero WiFi or mobile data detected. All {stats.count} downloaded songs, covers, and audio DSP are fully operational.
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/25 text-amber-200 text-[10px] font-bold tracking-wider self-start sm:self-auto">
            100% DISCONNECTED PLAYBACK
          </span>
        </div>
      )}
      {/* 🚀 Hero Water Bubble Glass Banner */}
      <div className="apple-water-bubble relative overflow-hidden p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>HIGH-CAPACITY OFFLINE STORAGE ENGINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Downloaded Offline Library
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Listen to your entire music collection offline with zero WiFi or mobile data. High-res
              320kbps audio blobs are stored securely in your browser's persistent IndexedDB storage.
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-xl bg-white/10 text-white border border-white/20 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-emerald-400" />
                <span>{stats.count} Songs Saved</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/10 text-white border border-white/20 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span>{formattedHours} Offline Playback</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>320kbps Lossless Audio</span>
              </span>
            </div>
          </div>

          {/* 💽 High-Capacity Storage Quota Card */}
          <div className="apple-gloss-card p-5 rounded-2xl border border-white/20 bg-dark-bg/60 shadow-xl flex-shrink-0 w-full sm:w-80 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider font-semibold">
                    Device Memory
                  </div>
                  <div className="text-base font-bold text-white font-mono">
                    {stats.formattedSize}{' '}
                    <span className="text-xs text-gray-400 font-normal">/ 50 GB Quota</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {usedPercent.toFixed(1)}% Used
              </span>
            </div>

            {/* Storage Progress Gauge */}
            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-dark-card overflow-hidden border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-accent transition-all duration-700 shadow-glow"
                  style={{ width: `${Math.max(2, usedPercent)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                <span>0 MB</span>
                <span>{(50 - stats.totalBytes / (1024 * 1024 * 1024)).toFixed(1)} GB Free</span>
                <span>50 GB Max</span>
              </div>
            </div>

            {/* Auto-Cache Liked Songs Toggle */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div className="text-xs">
                <div className="text-white font-medium">Auto-Cache Liked Songs</div>
                <div className="text-[10px] text-gray-400">Automatically download hearted songs</div>
              </div>
              <input
                type="checkbox"
                checked={autoCacheLiked}
                onChange={e => handleToggleAutoCache(e.target.checked)}
                className="rounded text-emerald-500 focus:ring-0 accent-emerald-500 cursor-pointer w-4 h-4"
              />
            </div>
          </div>
        </div>

        {/* ⚡ High-Capacity Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10 mt-5 relative z-10">
          {/* One-Click Prepare Everything Offline */}
          <button
            onClick={() => setIsPrepModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-primary hover:opacity-95 text-white font-bold text-xs tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-transform hover:scale-105 active:scale-95"
            title="Prepare and download complete offline vault with covers and lyrics"
          >
            <Zap className="w-4 h-4 text-cyan-200" />
            <span>PREPARE OFFLINE PACK</span>
          </button>

          {offlineItems.length > 0 && (
            <>
              <button
                onClick={() => handlePlayAll(false)}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-gray-100 text-black font-bold text-xs tracking-wider flex items-center gap-2 shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>PLAY ALL OFFLINE</span>
              </button>
              <button
                onClick={() => handlePlayAll(true)}
                className="px-4 py-2.5 rounded-full bg-dark-card hover:bg-dark-hover border border-white/20 text-white font-semibold text-xs flex items-center gap-2 transition-colors"
              >
                <Shuffle className="w-4 h-4 text-accent" />
                <span>SHUFFLE OFFLINE</span>
              </button>
            </>
          )}

          {/* Bulk Download Trending Button */}
          <button
            onClick={handleBulkDownloadTrending}
            disabled={isBulkDownloading}
            className="px-4 py-2.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Download top 15 trending songs to device"
          >
            <Download className={`w-3.5 h-3.5 ${isBulkDownloading ? 'animate-bounce' : ''}`} />
            <span>
              {isBulkDownloading ? 'DOWNLOADING MORE SONGS...' : 'DOWNLOAD 15 TRENDING HITS'}
            </span>
          </button>

          {/* Export Manifest Backup */}
          {offlineItems.length > 0 && (
            <button
              onClick={handleExportBackup}
              className="px-3.5 py-2.5 rounded-full bg-dark-card hover:bg-dark-hover border border-white/20 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Export backup manifest of offline tracks"
            >
              <Share2 className="w-3.5 h-3.5 text-primary-light" />
              <span>Export Library</span>
            </button>
          )}

          {offlineItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge All</span>
            </button>
          )}
        </div>
      </div>

      {/* 🔍 Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 px-4 rounded-2xl bg-dark-secondary/40 backdrop-blur-2xl border border-white/15">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search offline tracks, artists, language..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-dark-bg/80 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Source Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Songs' },
            { id: 'saavn', label: 'JioSaavn' },
            { id: 'youtube', label: 'YouTube Music' },
            { id: 'spotify', label: 'Spotify' },
          ].map(src => (
            <button
              key={src.id}
              onClick={() => setSelectedSourceFilter(src.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedSourceFilter === src.id
                  ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300 shadow-sm'
                  : 'bg-dark-card/60 border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {src.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🎵 Track List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-gray-400">
          <span>SAVED SONGS ({filteredItems.length})</span>
          <span>Zero Buffering • Instant Playback</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-3xl bg-dark-card/40 border border-white/10 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <DownloadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {offlineItems.length === 0
                  ? 'No Offline Songs Yet'
                  : 'No Songs Match Your Search'}
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                {offlineItems.length === 0
                  ? 'Click "Download 15 Trending Hits" above or browse songs to save hundreds of songs to your device storage!'
                  : 'Try typing a different artist or clearing your filter to view your offline songs.'}
              </p>
            </div>
            {offlineItems.length === 0 && (
              <button
                onClick={handleBulkDownloadTrending}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-bold text-xs tracking-wider shadow-md transition-transform hover:scale-105"
              >
                Download Top 15 Songs Now
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map(({ track, size, downloadedAt }) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => handlePlayOffline(track)}
                  data-apple-cursor="song-card"
                  className={`apple-gloss-row p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group ${
                    isCurrent
                      ? 'bg-emerald-500/20 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/40 text-white'
                      : 'hover:border-emerald-500/40 text-gray-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 truncate">
                    <div
                      data-apple-cursor="song-icon"
                      className="apple-gloss-icon relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="apple-sheen-sweep" />
                      <div
                        className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                          isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <div className="apple-gloss-play w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                          <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="truncate" data-apple-cursor="song-label">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`apple-gloss-label apple-gloss-title text-xs font-semibold truncate ${
                            isCurrent ? 'text-emerald-400 font-bold' : 'text-white'
                          }`}
                        >
                          {track.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                          OFFLINE
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 truncate mt-0.5 group-hover:text-gray-200">
                        {track.artist}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 pl-2">
                    <span className="text-[11px] font-mono text-gray-400 hidden sm:inline">
                      {formatFileSize(size)}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(track.id, track.title);
                      }}
                      className="p-2 rounded-xl text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete from offline storage"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
