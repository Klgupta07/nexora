import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Heart,
  Disc,
  Flame,
  Sparkles,
  Plus,
  Clock,
  Globe,
  DownloadCloud,
  Check,
  RefreshCw,
  Sliders,
  RotateCw,
} from 'lucide-react';
import { musicApi, HomeFeedData, LanguageCategory } from '../../services/musicApi';
import { offlineStorage } from '../../services/offlineStorage';
import { Track, Album, Artist } from '../../types';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { useNotification } from '../../context/NotificationContext';
import {
  ContentRefreshModal,
  ContentRefreshSettings,
  loadRefreshSettings,
} from './ContentRefreshModal';

interface Props {
  onSelectPlaylist?: (playlistId: string) => void;
  onOpenOffline?: () => void;
}

export const MusicHome: React.FC<Props> = ({ onSelectPlaylist, onOpenOffline }) => {
  const [data, setData] = useState<HomeFeedData | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [languageTracks, setLanguageTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [langLoading, setLangLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshModalOpen, setIsRefreshModalOpen] = useState(false);
  const [refreshSettings, setRefreshSettings] = useState<ContentRefreshSettings>(loadRefreshSettings);

  const {
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    likedTrackIds,
    toggleLike,
    addToQueue,
    history,
    downloadTrackOffline,
    downloadedTrackIds,
    downloadingTrackIds,
    downloadAllOffline,
  } = useMusicPlayer();
  const { addNotification } = useNotification();

  const handleRefresh = useCallback(
    async (options?: { force?: boolean; silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) setIsRefreshing(true);

      const currentSettings = loadRefreshSettings();
      try {
        const res = await musicApi.getHomeFeed({
          refresh: options?.force || currentSettings.clearCacheOnRefresh,
          shuffle: currentSettings.reshuffleOnRefresh,
        });

        if (res.success && res.data) {
          setData(res.data);
          setLastRefreshed(new Date());

          // If a language filter is selected, also reload that language
          if (selectedLanguage !== 'all') {
            try {
              const langRes = await musicApi.getTracksByLanguage(selectedLanguage, 50);
              if (langRes.success && langRes.tracks) {
                setLanguageTracks(langRes.tracks);
              }
            } catch {}
          }

          if (!silent) {
            addNotification({
              type: 'success',
              title: 'Feed Refreshed',
              message: 'Live streams, chartbusters & trending releases updated.',
              duration: 3000,
            });
          }
        }
      } catch (err: any) {
        console.warn('Failed to load live music feed, falling back to offline storage:', err);
        try {
          const offlineList = await offlineStorage.getAllOfflineTracks();
          if (offlineList && offlineList.length > 0) {
            setData({
              trending: offlineList.map(i => i.track),
              newReleases: [],
              popularAlbums: [],
              topArtists: [],
              recommendedPlaylists: [],
            });
            return;
          }
        } catch {}

        if (!silent) {
          addNotification({
            type: 'error',
            title: 'Refresh Error',
            message: err.message || 'Failed to update audio feed',
          });
        }
      } finally {
        if (!silent) setIsRefreshing(false);
      }
    },
    [selectedLanguage, addNotification]
  );

  // Initial feed load
  useEffect(() => {
    handleRefresh({ force: false, silent: true }).finally(() => setLoading(false));
  }, [handleRefresh]);

  // Global window event listener (from Header button or Command Palette or Shortcut)
  useEffect(() => {
    const handleGlobalRefresh = () => {
      handleRefresh({ force: true, silent: false });
    };
    window.addEventListener('nexora:refresh-feed', handleGlobalRefresh);
    return () => window.removeEventListener('nexora:refresh-feed', handleGlobalRefresh);
  }, [handleRefresh]);

  // Automated background polling timer if configured in Content Refresh Options
  useEffect(() => {
    if (!refreshSettings.autoRefreshInterval || refreshSettings.autoRefreshInterval <= 0) return;

    const interval = setInterval(() => {
      handleRefresh({ force: false, silent: true });
    }, refreshSettings.autoRefreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshSettings.autoRefreshInterval, handleRefresh]);

  // Listen for global language select event (from Sidebar, Omnibox, etc.)
  useEffect(() => {
    const handleSelectLang = (e: any) => {
      if (e.detail) {
        setSelectedLanguage(e.detail);
      }
    };
    window.addEventListener('nexora:select-language', handleSelectLang);
    return () => window.removeEventListener('nexora:select-language', handleSelectLang);
  }, []);

  // When selected language changes, fetch tracks for that language
  useEffect(() => {
    if (selectedLanguage === 'all') {
      setLanguageTracks([]);
      return;
    }
    setLangLoading(true);
    musicApi.getTracksByLanguage(selectedLanguage, 50)
      .then(res => {
        if (res.success && res.tracks) {
          setLanguageTracks(res.tracks);
        }
      })
      .catch(() => setLanguageTracks([]))
      .finally(() => setLangLoading(false));
  }, [selectedLanguage]);

  const handleTrackClick = (track: Track, trackList: Track[]) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, trackList);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-sm font-mono tracking-wide">CONNECTING TO MULTI-LINGUAL AUDIO STREAM...</div>
      </div>
    );
  }

  const trending = data?.trending || [];
  const youtubeTrending = data?.youtubeTrending || [];
  const jioSaavnTrending = data?.jioSaavnTrending || [];
  const spotifyTopHits = data?.spotifyTopHits || [];
  const albums = data?.popularAlbums || [];
  const artists = data?.topArtists || [];
  const recommendedPlaylists = data?.recommendedPlaylists || [];
  const languages: LanguageCategory[] = data?.languages || [
    { id: 'all', name: 'All Languages', nativeName: 'Global', flag: '🌐', color: 'from-purple-600 to-indigo-600', description: 'World chart toppers' },
    { id: 'hindi', name: 'Hindi', nativeName: 'हिन्दी / Bollywood', flag: '🇮🇳', color: 'from-orange-500 to-amber-600', description: 'Bollywood & Sufi' },
    { id: 'punjabi', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ / Desi Trap', flag: '⚡', color: 'from-yellow-500 to-orange-600', description: 'Bhangra & Drill' },
    { id: 'spanish', name: 'Spanish', nativeName: 'Español / Latino', flag: '🇪🇸', color: 'from-red-500 to-rose-600', description: 'Reggaeton & Dembow' },
    { id: 'korean', name: 'Korean', nativeName: '한국어 / K-Pop', flag: '🇰🇷', color: 'from-pink-500 to-fuchsia-600', description: 'Hallyu Disco-Pop' },
    { id: 'japanese', name: 'Japanese', nativeName: '日本語 / Anime', flag: '🇯🇵', color: 'from-rose-500 to-red-600', description: 'City Pop & J-Rock' },
    { id: 'tamil', name: 'Tamil', nativeName: 'தமிழ் / Kollywood', flag: '🪕', color: 'from-amber-600 to-red-700', description: 'Kollywood Kuthu & Melodies' },
    { id: 'telugu', name: 'Telugu', nativeName: 'తెలుగు / Tollywood', flag: '🪘', color: 'from-orange-500 to-amber-600', description: 'Tollywood Mass Beats' },
    { id: 'french', name: 'French', nativeName: 'Français', flag: '🇫🇷', color: 'from-blue-500 to-indigo-600', description: 'French Touch & Pop' },
    { id: 'arabic', name: 'Arabic', nativeName: 'العربية / Oriental', flag: '🌙', color: 'from-emerald-500 to-teal-700', description: 'Oud & Rai Grooves' },
    { id: 'english', name: 'English', nativeName: 'Global Hits', flag: '🌍', color: 'from-cyan-500 to-blue-600', description: 'Pop, Synthwave & Rock' },
  ];

  // Active track list to display based on language filter
  const activeTracks = selectedLanguage === 'all' ? trending : languageTracks;

  const formatTimeSince = (date: Date) => {
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 20) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* 🔄 Content Refresh & Synchronization Modal */}
      <ContentRefreshModal
        isOpen={isRefreshModalOpen}
        onClose={() => setIsRefreshModalOpen(false)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastRefreshed={lastRefreshed}
        onSettingsChange={setRefreshSettings}
      />

      {/* 🚀 Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 via-accent/15 to-[#101726]/90 border border-primary/20 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary-light text-xs font-mono">
            <Flame className="w-3.5 h-3.5 text-accent" />
            <span>GLOBAL MULTI-LANGUAGE AUDIO STREAMING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Infinite Soundscapes Across Languages
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Stream high-fidelity songs across Hindi, Punjabi, Spanish, Korean, Japanese, Tamil, Telugu, French, Arabic, and English. 100% free and royalty-free.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {trending.length > 0 && (
              <button
                onClick={() => handleTrackClick(trending[0], trending)}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-gray-100 text-black font-bold text-xs tracking-wider flex items-center gap-2 shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PLAY FEATURED: {trending[0].title.toUpperCase()}</span>
              </button>
            )}
            {downloadedTrackIds.size > 0 && onOpenOffline && (
              <button
                onClick={onOpenOffline}
                className="px-4 py-2.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs tracking-wider flex items-center gap-2 transition-transform hover:scale-105"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>{downloadedTrackIds.size} OFFLINE SONGS READY</span>
              </button>
            )}

            {/* 🔄 Content Refresh & Options Button Group in Hero */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-dark-bg/80 border border-dark-border/80 backdrop-blur-md shadow-sm">
              <button
                onClick={() => handleRefresh({ force: true })}
                disabled={isRefreshing}
                className="px-4 py-1.5 rounded-full bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent font-bold text-xs tracking-wider flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                title="Refresh feed content now"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'REFRESHING FEED...' : 'REFRESH FEED'}</span>
              </button>

              <button
                onClick={() => setIsRefreshModalOpen(true)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
                title="Content Refresh Options (Auto-refresh, reshuffle, source filters)"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔄 FEED SYNCHRONIZATION & CONTENT REFRESH BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 px-4 rounded-2xl bg-dark-secondary/70 border border-dark-border/80 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-white">Live Multi-Source Feed</span>
          </div>
          <span className="text-gray-500 text-xs hidden sm:inline">•</span>
          <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-accent" />
            <span>Updated {formatTimeSince(lastRefreshed)}</span>
          </div>
          {refreshSettings.autoRefreshInterval > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hidden md:inline-flex items-center gap-1">
              <span>Auto: {refreshSettings.autoRefreshInterval / 60}m</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRefresh({ force: true })}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-dark-bg/80 hover:bg-dark-card border border-dark-border/80 text-xs text-gray-300 hover:text-white font-medium flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            title="Refresh feed with latest songs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-accent ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
          </button>

          <button
            onClick={() => setIsRefreshModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-dark-bg/80 hover:bg-dark-card border border-dark-border/80 text-xs text-gray-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
            title="Configure Content Refresh intervals and discovery settings"
          >
            <Sliders className="w-3.5 h-3.5 text-primary-light" />
            <span>Content Refresh Options</span>
          </button>
        </div>
      </div>

      {/* 🌐 MULTI-LANGUAGE SELECTOR & REGIONAL CHOOSING HUB */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent" />
            <h2 className="text-base font-bold text-white tracking-tight">Explore by Language & Culture</h2>
          </div>
          <span className="text-xs font-mono text-gray-400">10 Global Regions</span>
        </div>

        {/* 🌟 Dedicated Separate Choosing Cards: Tamil & Telugu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* 🪕 Dedicated Tamil Choosing Card */}
          <div
            onClick={() => setSelectedLanguage(selectedLanguage === 'tamil' ? 'all' : 'tamil')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
              selectedLanguage === 'tamil'
                ? 'bg-gradient-to-br from-amber-600/35 via-red-950/50 to-black/80 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                : 'bg-gradient-to-br from-amber-950/20 via-black/40 to-black/70 border-amber-500/30 hover:border-amber-400/70 hover:scale-[1.01]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  🪕
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-base">Tamil Music</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      தமிழ்
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-0.5 line-clamp-1">
                    Kollywood Kuthu, Anirudh Beats & AR Rahman Melodies
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLanguage('tamil');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  selectedLanguage === 'tamil'
                    ? 'bg-amber-400 text-black shadow-amber-400/20'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40'
                }`}
              >
                {selectedLanguage === 'tamil' ? 'Selected ✓' : 'Choose Tamil'}
              </button>
            </div>
          </div>

          {/* 🪘 Dedicated Telugu Choosing Card */}
          <div
            onClick={() => setSelectedLanguage(selectedLanguage === 'telugu' ? 'all' : 'telugu')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
              selectedLanguage === 'telugu'
                ? 'bg-gradient-to-br from-orange-600/35 via-amber-950/50 to-black/80 border-orange-400 shadow-[0_0_25px_rgba(249,115,22,0.25)] ring-1 ring-orange-400'
                : 'bg-gradient-to-br from-orange-950/20 via-black/40 to-black/70 border-orange-500/30 hover:border-orange-400/70 hover:scale-[1.01]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  🪘
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-base">Telugu Music</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      తెలుగు
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-0.5 line-clamp-1">
                    Tollywood Mass, Thaman S, DSP & Keeravani Anthems
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLanguage('telugu');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  selectedLanguage === 'telugu'
                    ? 'bg-orange-400 text-black shadow-orange-400/20'
                    : 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border border-orange-500/40'
                }`}
              >
                {selectedLanguage === 'telugu' ? 'Selected ✓' : 'Choose Telugu'}
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Language Chips with Distinct Tamil & Telugu Badges */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {languages.map(lang => {
            const isActive = selectedLanguage === lang.id;
            const isTamil = lang.id === 'tamil';
            const isTelugu = lang.id === 'telugu';

            let pillStyle = 'bg-dark-card/70 border-dark-border/80 text-gray-400 hover:text-white hover:bg-dark-card';
            if (isActive) {
              if (isTamil) pillStyle = 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow-sm';
              else if (isTelugu) pillStyle = 'bg-orange-500/20 border-orange-400 text-orange-200 font-bold shadow-sm';
              else pillStyle = 'bg-accent/20 border-accent text-white font-bold shadow-sm';
            } else {
              if (isTamil) pillStyle = 'bg-amber-950/20 border-amber-500/30 text-amber-300/80 hover:text-amber-200 hover:bg-amber-900/30';
              else if (isTelugu) pillStyle = 'bg-orange-950/20 border-orange-500/30 text-orange-300/80 hover:text-orange-200 hover:bg-orange-900/30';
            }

            return (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${pillStyle}`}
              >
                <span className="text-sm">{lang.flag}</span>
                <span>{lang.name}</span>
                {lang.nativeName && lang.id !== 'all' && (
                  <span className="text-[10px] font-mono opacity-70">
                    ({lang.nativeName.split(' ')[0]})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Language Filter Notice & Quick Play All */}
        {selectedLanguage !== 'all' && (
          <div className="flex items-center justify-between p-3 px-4 rounded-xl bg-accent/10 border border-accent/30 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">
                {languages.find(l => l.id === selectedLanguage)?.flag || '🎵'}
              </span>
              <div>
                <span className="text-xs font-bold text-white">
                  Filtering by {languages.find(l => l.id === selectedLanguage)?.name || selectedLanguage}
                </span>
                <span className="text-[11px] text-gray-400 ml-2 hidden sm:inline">
                  • 320 kbps Audiophile Lossless Streams
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeTracks.length > 0 && (
                <button
                  onClick={() => playTrack(activeTracks[0], activeTracks)}
                  className="px-3 py-1 rounded-full bg-accent hover:bg-accent-hover text-white text-xs font-bold flex items-center gap-1.5 transition-transform hover:scale-105 shadow-sm"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Play All</span>
                </button>
              )}
              <button
                onClick={() => setSelectedLanguage('all')}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-gray-300 transition-colors"
              >
                Clear Filter
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Recently Played (if any) */}
      {history.length > 0 && selectedLanguage === 'all' && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white tracking-tight">
            <Clock className="w-4 h-4 text-accent" />
            <span>Recently Played</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {history.slice(0, 6).map((track, i) => (
              <div
                key={i}
                onClick={() => handleTrackClick(track, history)}
                data-apple-cursor="song-card"
                className="apple-gloss-card p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div
                  data-apple-cursor="song-icon"
                  className="apple-gloss-icon relative aspect-square w-full rounded-xl overflow-hidden mb-2.5"
                >
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="apple-sheen-sweep" />
                </div>
                <div data-apple-cursor="song-label">
                  <div className="apple-gloss-label apple-gloss-title text-xs font-semibold text-white truncate">{track.title}</div>
                  <div className="text-[11px] text-gray-400 truncate group-hover:text-gray-200 transition-colors">{track.artist}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 🟢 JIOSAAVN TOP HITS & DIRECT OFFLINE DOWNLOAD SECTION */}
      {jioSaavnTrending.length > 0 && selectedLanguage === 'all' && refreshSettings.sources.jioSaavn && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-teal-500 flex items-center justify-center text-white text-[10px] font-black">
                JS
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                JioSaavn Top Hits & Chartbusters
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-teal-400 border border-teal-500/30">
                DIRECT HIGH-RES AUDIO • OFFLINE READY
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadAllOffline(jioSaavnTrending.slice(0, 12))}
                className="px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Download top 12 songs for offline listening"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Save All Offline</span>
              </button>
              <span className="text-xs font-mono text-gray-400">
                {jioSaavnTrending.length} Tracks
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {jioSaavnTrending.slice(0, 12).map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              const isLiked = likedTrackIds.has(track.id);
              const isDownloaded = downloadedTrackIds.has(track.id);
              const isDownloading = downloadingTrackIds.has(track.id);
              return (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track, jioSaavnTrending)}
                  data-apple-cursor="song-card"
                  className={`apple-gloss-card p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-teal-500/15 border-teal-500/50 shadow-md ring-1 ring-teal-500/40'
                      : 'hover:border-teal-500/40'
                  }`}
                >
                  <div
                    data-apple-cursor="song-icon"
                    className="apple-gloss-icon relative aspect-square w-full rounded-xl overflow-hidden mb-2.5"
                  >
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="apple-sheen-sweep" />
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                        isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <div className="apple-gloss-play w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                      </div>
                    </div>
                    {isDownloaded && (
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-md flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-mono text-white">
                      {Math.floor((track.duration || 210) / 60)}:
                      {String((track.duration || 210) % 60).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="space-y-1" data-apple-cursor="song-label">
                    <div className="flex items-center gap-1.5">
                      <div className={`apple-gloss-label apple-gloss-title text-xs font-semibold truncate ${isCurrent ? 'text-teal-400 font-bold' : 'text-white'}`}>
                        {track.title}
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-400 truncate group-hover:text-gray-200 transition-colors">{track.artist}</div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] font-mono text-teal-400 bg-teal-500/10 px-1.5 py-0.2 rounded border border-teal-500/20">
                        {track.language || 'Hindi'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadTrackOffline(track);
                          }}
                          disabled={isDownloading}
                          className={`p-1 transition-colors ${
                            isDownloaded
                              ? 'text-emerald-400'
                              : isDownloading
                              ? 'text-accent animate-spin'
                              : 'text-gray-500 hover:text-white'
                          }`}
                          title={isDownloaded ? 'Downloaded Offline' : 'Download for Offline Playback'}
                        >
                          {isDownloaded ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <DownloadCloud className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(track);
                          }}
                          className={`p-1 transition-colors ${
                            isLiked ? 'text-rose-500' : 'text-gray-500 hover:text-white'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 🔴 YOUTUBE MUSIC GLOBAL CHARTS SECTION */}
      {youtubeTrending.length > 0 && selectedLanguage === 'all' && refreshSettings.sources.youtube && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-red-600 flex items-center justify-center text-white text-[10px] font-black">
                ▶
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                YouTube Music Global Charts & Hits
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/30">
                OFFICIAL AUDIO STREAM • OFFLINE READY
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadAllOffline(youtubeTrending.slice(0, 12))}
                className="px-3 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Download top 12 YouTube songs for offline listening"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Save All Offline</span>
              </button>
              <span className="text-xs font-mono text-gray-400">
                {youtubeTrending.length} Tracks
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {youtubeTrending.slice(0, 12).map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              const isLiked = likedTrackIds.has(track.id);
              const isDownloaded = downloadedTrackIds.has(track.id);
              const isDownloading = downloadingTrackIds.has(track.id);
              return (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track, youtubeTrending)}
                  data-apple-cursor="song-card"
                  className={`apple-gloss-card p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-red-500/15 border-red-500/50 shadow-md ring-1 ring-red-500/40'
                      : 'hover:border-red-500/40'
                  }`}
                >
                  <div
                    data-apple-cursor="song-icon"
                    className="apple-gloss-icon relative aspect-square w-full rounded-xl overflow-hidden mb-2.5"
                  >
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="apple-sheen-sweep" />
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                        isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <div className="apple-gloss-play w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                      </div>
                    </div>
                    {isDownloaded && (
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-md flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-mono text-white">
                      {Math.floor((track.duration || 210) / 60)}:
                      {String((track.duration || 210) % 60).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="space-y-1" data-apple-cursor="song-label">
                    <div className="flex items-center gap-1.5">
                      <div className={`apple-gloss-label apple-gloss-title text-xs font-semibold truncate ${isCurrent ? 'text-red-400 font-bold' : 'text-white'}`}>
                        {track.title}
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-400 truncate group-hover:text-gray-200 transition-colors">{track.artist}</div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] font-mono text-red-400 bg-red-500/10 px-1.5 py-0.2 rounded border border-red-500/20">
                        {track.language || 'Global'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadTrackOffline(track);
                          }}
                          disabled={isDownloading}
                          className={`p-1 transition-colors ${
                            isDownloaded
                              ? 'text-emerald-400'
                              : isDownloading
                              ? 'text-accent animate-spin'
                              : 'text-gray-500 hover:text-white'
                          }`}
                          title={isDownloaded ? 'Downloaded Offline' : 'Download for Offline Playback'}
                        >
                          {isDownloaded ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <DownloadCloud className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(track);
                          }}
                          className={`p-1 transition-colors ${
                            isLiked ? 'text-rose-500' : 'text-gray-500 hover:text-white'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 🟢 SPOTIFY GLOBAL TOP 50 & TODAY'S TOP HITS */}
      {spotifyTopHits.length > 0 && selectedLanguage === 'all' && refreshSettings.sources.spotify && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#1DB954] flex items-center justify-center text-black text-[10px] font-black">
                SP
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Spotify Global Top 50 & Today's Top Hits
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30">
                SPOTIFY CHARTS • FULL STREAM • OFFLINE READY
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadAllOffline(spotifyTopHits.slice(0, 12))}
                className="px-3 py-1 rounded-xl bg-[#1DB954]/10 hover:bg-[#1DB954]/20 border border-[#1DB954]/30 text-[#1DB954] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Download top 12 Spotify songs for offline listening"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Save All Offline</span>
              </button>
              <span className="text-xs font-mono text-gray-400">
                {spotifyTopHits.length} Tracks
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {spotifyTopHits.slice(0, 12).map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              const isLiked = likedTrackIds.has(track.id);
              const isDownloaded = downloadedTrackIds.has(track.id);
              const isDownloading = downloadingTrackIds.has(track.id);
              return (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track, spotifyTopHits)}
                  data-apple-cursor="song-card"
                  className={`apple-gloss-card p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-[#1DB954]/15 border-[#1DB954]/50 shadow-md ring-1 ring-[#1DB954]/40'
                      : 'hover:border-[#1DB954]/40'
                  }`}
                >
                  <div
                    data-apple-cursor="song-icon"
                    className="apple-gloss-icon relative aspect-square w-full rounded-xl overflow-hidden mb-2.5"
                  >
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="apple-sheen-sweep" />
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                        isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <div className="apple-gloss-play w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                      </div>
                    </div>
                    {isDownloaded && (
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-[#1DB954] text-black shadow-md flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-mono text-white">
                      {Math.floor((track.duration || 210) / 60)}:
                      {String((track.duration || 210) % 60).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="space-y-1" data-apple-cursor="song-label">
                    <div className="flex items-center gap-1.5">
                      <div className={`apple-gloss-label apple-gloss-title text-xs font-semibold truncate ${isCurrent ? 'text-[#1DB954] font-bold' : 'text-white'}`}>
                        {track.title}
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-400 truncate group-hover:text-gray-200 transition-colors">{track.artist}</div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] font-mono text-[#1DB954] bg-[#1DB954]/10 px-1.5 py-0.2 rounded border border-[#1DB954]/20">
                        Spotify Top 50
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadTrackOffline(track);
                          }}
                          disabled={isDownloading}
                          className={`p-1 transition-colors ${
                            isDownloaded
                              ? 'text-emerald-400'
                              : isDownloading
                              ? 'text-accent animate-spin'
                              : 'text-gray-500 hover:text-white'
                          }`}
                          title={isDownloaded ? 'Downloaded Offline' : 'Download for Offline Playback'}
                        >
                          {isDownloaded ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <DownloadCloud className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(track);
                          }}
                          className={`p-1 transition-colors ${
                            isLiked ? 'text-rose-500' : 'text-gray-500 hover:text-white'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Trending / Active Language Tracks Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-accent" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              {selectedLanguage === 'all'
                ? 'Trending Global Hits'
                : `${languages.find(l => l.id === selectedLanguage)?.name || 'Language'} Top Hits`}
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-400">
            {activeTracks.length} Songs Available
          </span>
        </div>

        {langLoading ? (
          <div className="flex items-center justify-center p-12 text-gray-400">
            <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeTracks.map(track => {
              const isCurrent = currentTrack?.id === track.id;
              const isLiked = likedTrackIds.has(track.id);
              return (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track, activeTracks)}
                  data-apple-cursor="song-card"
                  className={`apple-gloss-row p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group ${
                    isCurrent
                      ? 'bg-primary/20 border-primary/50 shadow-sm'
                      : 'hover:border-accent/40'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      data-apple-cursor="song-icon"
                      className="apple-gloss-icon relative w-12 h-12 flex-shrink-0 rounded-xl"
                    >
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="apple-sheen-sweep" />
                      <div
                        className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                          isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <div className="apple-gloss-play w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                          <Play className="w-3.5 h-3.5 text-white fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="truncate" data-apple-cursor="song-label">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={`apple-gloss-label apple-gloss-title text-xs font-semibold truncate ${
                            isCurrent ? 'text-primary-light font-bold' : 'text-white'
                          }`}
                        >
                          {track.title}
                        </span>
                        {track.language && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-dark-bg text-accent border border-dark-border flex-shrink-0">
                            {track.language}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate mt-0.5 group-hover:text-gray-200 transition-colors">{track.artist}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pl-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleLike(track);
                      }}
                      className={`p-1.5 transition-colors ${
                        isLiked ? 'text-rose-500' : 'text-gray-500 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        addToQueue(track);
                      }}
                      className="p-1.5 text-gray-500 hover:text-white"
                      title="Add to Queue"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recommended Multi-Language Playlists */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-bold text-white tracking-tight">Multi-Language Curated Collections</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {recommendedPlaylists.map(playlist => (
            <div
              key={playlist.id}
              onClick={() => onSelectPlaylist && onSelectPlaylist(playlist.id)}
              data-apple-cursor="song-card"
              className="apple-gloss-card p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div
                  data-apple-cursor="song-icon"
                  className="apple-gloss-icon w-full h-36 rounded-xl overflow-hidden mb-3"
                >
                  <img
                    src={playlist.coverUrl}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="apple-sheen-sweep" />
                </div>
                <div data-apple-cursor="song-label">
                  <h3 className="apple-gloss-label apple-gloss-title font-bold text-white text-xs sm:text-sm transition-colors line-clamp-1">
                    {playlist.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {playlist.description}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-dark-border/60 flex items-center justify-between text-xs text-gray-400 font-mono">
                <span>{playlist.trackCount} Tracks</span>
                <span className="text-accent group-hover:underline">Listen Now →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Albums */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Disc className="w-4 h-4 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Popular Multi-Language Albums</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {albums.map(album => (
            <div
              key={album.id}
              onClick={() => {
                if (album.tracks && album.tracks.length > 0) {
                  playTrack(album.tracks[0], album.tracks);
                  addNotification({
                    type: 'success',
                    title: 'Playing Album',
                    message: album.name,
                  });
                }
              }}
              data-apple-cursor="song-card"
              className="apple-gloss-card p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div
                data-apple-cursor="song-icon"
                className="apple-gloss-icon relative aspect-square w-full rounded-xl overflow-hidden mb-2.5"
              >
                <img
                  src={album.coverUrl}
                  alt={album.name}
                  className="w-full h-full object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
                />
                <div className="apple-sheen-sweep" />
                <div className="absolute right-2 bottom-2">
                  <div className="apple-gloss-play w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-white" />
                  </div>
                </div>
              </div>
              <div data-apple-cursor="song-label">
                <h3 className="apple-gloss-label apple-gloss-title font-bold text-white text-xs truncate">{album.name}</h3>
                <p className="text-[11px] text-gray-400 truncate mt-0.5 group-hover:text-gray-200 transition-colors">{album.artist}</p>
              </div>
              <span className="inline-block text-[10px] text-gray-500 font-mono mt-1">
                {album.trackCount} Tracks
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Top International Artists */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">Top Global & Regional Artists</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {artists.map(artist => (
            <div
              key={artist.id}
              onClick={() => {
                if (artist.topTracks && artist.topTracks.length > 0) {
                  playTrack(artist.topTracks[0], artist.topTracks);
                  addNotification({
                    type: 'info',
                    title: `Playing ${artist.name}`,
                    message: artist.genre,
                  });
                }
              }}
              data-apple-cursor="song-card"
              className="apple-gloss-card p-4 rounded-2xl border text-center transition-all cursor-pointer group"
            >
              <div
                data-apple-cursor="song-icon"
                className="apple-gloss-icon w-20 h-20 rounded-full mx-auto mb-2.5 border-2 border-white/20 group-hover:border-white/50"
              >
                <img
                  src={artist.imageUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
                <div className="apple-sheen-sweep" />
              </div>
              <div data-apple-cursor="song-label">
                <h3 className="apple-gloss-label apple-gloss-title font-bold text-white text-xs truncate">{artist.name}</h3>
                <div className="text-[10px] text-accent truncate mt-0.5">{artist.genre}</div>
              </div>
              <div className="text-[9px] text-gray-500 font-mono mt-1">
                {((artist.monthlyListeners || 500000) / 1000000).toFixed(1)}M Listeners
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
