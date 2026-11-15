import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Minus,
  X,
  DownloadCloud,
  Check,
  Disc,
  Sparkles,
  ListMusic,
  RotateCcw,
  Mic,
  User,
  Music2,
  Award,
  Headphones,
  Sliders,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { useCustomization } from '../../context/ThemeContext';
import { useBeatSync } from '../../hooks/useBeatSync';
import { ContentResetModal } from './ContentResetModal';
import { getTrackLyrics, LyricLine } from '../../services/lyricsService';
import { getArtistProfile, ArtistProfile } from '../../services/artistService';

export type PopupViewMode = 'card' | 'expanded' | 'minimized';
export type CardVisualMode = 'art' | 'profile';

export const PlayingSongPopup: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    likedTrackIds,
    downloadedTrackIds,
    downloadingTrackIds,
    isOfflinePlaying,
    queue,
    isSongPopupOpen,
    setIsSongPopupOpen,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    downloadTrackOffline,
    setIsFullscreen,
    setIsQueueOpen,
  } = useMusicPlayer();

  const { settings } = useCustomization();
  const { bpm, energy, isBeat, spectralBands } = useBeatSync({
    sensitivity: 1.15,
    bandCount: 24,
  });

  const [viewMode, setViewMode] = useState<PopupViewMode>('card');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // 🎤 Separate Lyrics Side Wing State (Shows alongside the popup)
  const [isLyricsWingOpen, setIsLyricsWingOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nexora_popup_lyrics_wing');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true; // Default open by the side
  });

  // Listen for global toggle from sidebar tools
  useEffect(() => {
    const handleToggle = () => setIsLyricsWingOpen(prev => !prev);
    window.addEventListener('nexora:toggle-lyrics-wing', handleToggle);
    return () => window.removeEventListener('nexora:toggle-lyrics-wing', handleToggle);
  }, []);

  const toggleLyricsWing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLyricsWingOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem('nexora_popup_lyrics_wing', String(next));
      } catch {}
      return next;
    });
  };

  // 🎛️ Card Center Stage Mode: 'art' (Classic with telemetry & EQ) | 'profile' (Artist Bio & Portrait)
  const [cardVisualMode, setCardVisualMode] = useState<CardVisualMode>(() => {
    try {
      const saved = localStorage.getItem('nexora_popup_card_visual');
      if (saved === 'profile' || saved === 'art') return saved;
    } catch {}
    return 'art';
  });

  const toggleCardVisualMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCardVisualMode(prev => {
      const next = prev === 'art' ? 'profile' : 'art';
      try {
        localStorage.setItem('nexora_popup_card_visual', next);
      } catch {}
      return next;
    });
  };

  // 🖱️ Movable / Draggable Popup State
  const [position, setPosition] = useState<{ x: number; y: number } | null>(() => {
    try {
      const saved = localStorage.getItem('nexora_popup_position');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    startX: number;
    startY: number;
  }>({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });
  const popupRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('a') ||
      target.closest('[role="slider"]')
    ) {
      return;
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const el = popupRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      startX: rect.left,
      startY: rect.top,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const deltaX = clientX - dragStartRef.current.mouseX;
      const deltaY = clientY - dragStartRef.current.mouseY;

      const el = popupRef.current;
      const width = el ? el.offsetWidth : 420;
      const height = el ? el.offsetHeight : 360;

      const rawX = dragStartRef.current.startX + deltaX;
      const rawY = dragStartRef.current.startY + deltaY;

      // Clamp within screen viewport
      const clampedX = Math.max(10, Math.min(window.innerWidth - width - 10, rawX));
      const clampedY = Math.max(65, Math.min(window.innerHeight - height - 85, rawY));

      setPosition({ x: clampedX, y: clampedY });
    };

    const handlePointerEnd = () => {
      setIsDragging(false);
      if (popupRef.current) {
        const rect = popupRef.current.getBoundingClientRect();
        try {
          localStorage.setItem(
            'nexora_popup_position',
            JSON.stringify({ x: rect.left, y: rect.top })
          );
        } catch {}
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerEnd);
    window.addEventListener('touchend', handlePointerEnd);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerEnd);
      window.removeEventListener('touchend', handlePointerEnd);
    };
  }, [isDragging]);

  const resetPosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPosition(null);
    try {
      localStorage.removeItem('nexora_popup_position');
    } catch {}
  };

  // 📝 Real-time Synced Lyrics Engine
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const activeLyricRef = useRef<HTMLDivElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  // Load lyrics on track change
  useEffect(() => {
    if (!currentTrack) return;
    setIsLoadingLyrics(true);
    getTrackLyrics(currentTrack.title, currentTrack.artist, duration || currentTrack.duration || 210)
      .then(lines => setLyrics(lines))
      .catch(() => setLyrics([]))
      .finally(() => setIsLoadingLyrics(false));
  }, [currentTrack?.title, currentTrack?.artist]);

  // Active lyric index matching currentTime
  const activeLyricIndex = useMemo(() => {
    if (!lyrics.length) return -1;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        return i;
      }
    }
    return 0;
  }, [lyrics, currentTime]);

  // Auto-scroll to active lyric line in the side wing
  useEffect(() => {
    if (isLyricsWingOpen && activeLyricRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLyricIndex, isLyricsWingOpen]);

  const artistProfile: ArtistProfile | null = useMemo(() => {
    if (!currentTrack) return null;
    return getArtistProfile(currentTrack.artist, currentTrack.coverUrl);
  }, [currentTrack?.artist, currentTrack?.coverUrl]);

  // Auto-detect whether to dock lyrics wing on left or right based on screen bounds
  const dockLyricsOnLeft = useMemo(() => {
    if (!position) return false;
    // If popup is dragged towards the right half of the screen (> window width - 750px), place wing on the left
    return position.x > window.innerWidth - 750;
  }, [position]);

  // If no track is currently playing or selected, do not render
  if (!currentTrack) return null;

  const isLiked = likedTrackIds.has(currentTrack.id);
  const isDownloaded = downloadedTrackIds.has(currentTrack.id);
  const isDownloading = downloadingTrackIds.has(currentTrack.id);
  const nextUpTrack = queue.length > 0 ? queue[0] : null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  // 1. Closed state: Floating compact trigger button on all pages
  if (!isSongPopupOpen) {
    return (
      <div
        className="fixed bottom-24 right-4 sm:right-6 z-40 select-none cursor-pointer group animate-fade-in"
        onClick={() => setIsSongPopupOpen(true)}
        title="Open Now Playing Song Popup"
      >
        <div className="apple-water-bubble relative flex items-center gap-2 px-3 py-2 rounded-full bg-dark-secondary/45 backdrop-blur-2xl border border-white/20 hover:border-accent/60 shadow-[0_10px_30px_rgba(0,0,0,0.7)] hover:scale-105 active:scale-95 transition-all">
          {/* Animated Mini Rotating Artwork */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/30">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
            />
          </div>

          <div className="hidden sm:block max-w-[130px] truncate text-left">
            <div className="text-xs font-bold text-white truncate leading-tight">
              {currentTrack.title}
            </div>
            <div className="text-[10px] text-gray-400 truncate">
              {currentTrack.artist}
            </div>
          </div>

          {/* Mini Sound Wave Bars */}
          <div className="flex items-end gap-0.5 h-4 px-1">
            {[4, 10, 7, 12, 6].map((h, i) => (
              <span
                key={i}
                className="w-0.5 rounded-full transition-all duration-150"
                style={{
                  backgroundColor: isBeat ? '#06b6d4' : settings.primaryHex,
                  height: isPlaying ? `${Math.max(3, h * (isBeat ? 1.4 : 0.8))}px` : '3px',
                }}
              />
            ))}
          </div>

          {/* Glowing pulse indicator */}
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    );
  }

  // 2. Minimized state: Floating Pill
  if (viewMode === 'minimized') {
    return (
      <div
        style={
          position
            ? {
                left: `${position.x}px`,
                top: `${position.y}px`,
                bottom: 'auto',
                right: 'auto',
                position: 'fixed',
              }
            : undefined
        }
        className={`${
          position ? '' : 'fixed bottom-24 right-4 sm:right-6'
        } z-40 select-none cursor-pointer group animate-fade-in`}
        onClick={() => setViewMode('card')}
        title="Expand Playing Song Popup"
      >
        <div className="apple-gloss-card relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-dark-secondary/45 backdrop-blur-2xl border border-white/25 hover:border-accent/70 shadow-[0_12px_36px_rgba(0,0,0,0.8)] transition-all hover:scale-105">
          {/* Cover Art with Vinyl Spin */}
          <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-white/30 shadow-md">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
            />
            <div className="apple-sheen-sweep" />
          </div>

          {/* Info */}
          <div className="max-w-[150px] sm:max-w-[180px] truncate text-left">
            <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
              <span>{currentTrack.title}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-gray-400 truncate font-medium">
              {currentTrack.artist}
            </div>
          </div>

          {/* Live Beat Cadence */}
          <div className="px-1.5 py-0.5 rounded-md bg-dark-bg/80 border border-dark-border text-[9px] font-mono font-bold text-accent">
            {bpm} BPM
          </div>

          {/* Quick Play/Pause */}
          <button
            onClick={e => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-md"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Close Popup */}
          <button
            onClick={e => {
              e.stopPropagation();
              setIsSongPopupOpen(false);
            }}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Dismiss Popup"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 3. Center Stage / Expanded Modal Mode
  if (viewMode === 'expanded') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-2xl animate-fade-in select-none">
        <ContentResetModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} />

        <div
          data-apple-cursor="song-card"
          className="apple-water-bubble relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-dark-secondary/50 backdrop-blur-3xl border border-white/20 p-6 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.9)] flex flex-col space-y-6 scrollbar-none overflow-hidden"
        >
          {/* Ambient Song Wallpaper Blur */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none transition-all duration-700"
            style={{
              backgroundImage: `url(${
                cardVisualMode === 'profile' && artistProfile?.photoUrl
                  ? artistProfile.photoUrl
                  : currentTrack.coverUrl
              })`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(45px) brightness(0.25)',
              transform: isBeat ? 'scale(1.06)' : 'scale(1.0)',
            }}
          />

          {/* Modal Header */}
          <div className="relative z-10 flex items-center justify-between pb-3 border-b border-dark-border/80">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-extrabold shadow-sm transition-transform"
                style={{
                  backgroundColor: settings.accentHex,
                  transform: isBeat ? 'scale(1.15)' : 'scale(1.0)',
                }}
              >
                <Disc className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold tracking-wider text-accent uppercase">
                    NOW PLAYING POPUP • ALL-PAGES DECK
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">
                    {currentTrack.source || 'CHILLMODE ENGINE'}
                  </span>
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  Universal High-Fidelity Streaming
                </div>
              </div>
            </div>

            {/* Actions: Card Visual Mode Toggle, Collapse, Fullscreen, Close */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleCardVisualMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                  cardVisualMode === 'profile'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold'
                    : 'bg-dark-bg/80 text-gray-300 border-dark-border hover:text-white'
                }`}
                title="Toggle Artist Profile / Artwork"
              >
                <User className="w-3.5 h-3.5" />
                <span>{cardVisualMode === 'profile' ? 'Profile Mode' : 'Artwork Mode'}</span>
              </button>

              <button
                onClick={() => setViewMode('card')}
                className="p-2 rounded-xl bg-dark-bg/80 hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white transition-colors"
                title="Collapse to Floating Card"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-2 rounded-xl bg-dark-bg/80 hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white transition-colors"
                title="Fullscreen Visualizer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsSongPopupOpen(false)}
                className="p-2 rounded-xl bg-dark-bg/80 hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white transition-colors"
                title="Close Popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded Centerpiece: Left (Card Artwork / Profile) + Right (Lyrics Karaoke View) */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Artwork or Artist Profile */}
            <div className="space-y-4">
              {cardVisualMode === 'profile' && artistProfile ? (
                <div className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/30 shadow-lg flex-shrink-0">
                      <img src={artistProfile.photoUrl} alt={artistProfile.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-black text-white">{artistProfile.name}</span>
                        {artistProfile.verified && (
                          <span className="p-0.5 rounded-full bg-blue-500 text-white"><Check className="w-3 h-3" /></span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-emerald-400 mt-0.5">
                        {artistProfile.monthlyListeners} monthly listeners
                      </div>
                      <div className="text-xs font-mono text-cyan-300">
                        {artistProfile.ranking}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed italic">
                    "{artistProfile.bio}"
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {artistProfile.genres.map(g => (
                      <span key={g} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/10 text-gray-200 border border-white/15">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="apple-gloss-icon w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-xl border border-white/20 flex-shrink-0">
                    <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent/20 text-accent border border-accent/30 inline-block">
                      {currentTrack.genre || 'HIGH-FIDELITY'}
                    </span>
                    <h2 className="text-xl font-black text-white truncate">{currentTrack.title}</h2>
                    <p className="text-sm font-semibold text-gray-300 truncate">{currentTrack.artist}</p>
                    {currentTrack.album && (
                      <p className="text-xs text-gray-500 truncate font-mono">Album: {currentTrack.album}</p>
                    )}
                    <div className="pt-2 flex items-center gap-2 text-xs font-mono">
                      <span className="px-2 py-1 rounded-lg bg-dark-bg/80 border border-dark-border text-white">
                        ⚡ {bpm} BPM
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-dark-bg/80 border border-dark-border text-emerald-400">
                        320 kbps Lossless
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 24-Band Frequency Equalizer */}
              <div className="p-2.5 rounded-2xl bg-dark-bg/60 border border-dark-border/80">
                <div className="flex items-end justify-between gap-1 h-10">
                  {spectralBands.slice(0, 24).map((band, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-full transition-all duration-75"
                      style={{
                        height: isPlaying ? `${Math.min(100, Math.max(12, band * 100 * (isBeat ? 1.25 : 1)))}%` : '8%',
                        background: isBeat
                          ? `linear-gradient(to top, ${settings.primaryHex}, #06b6d4)`
                          : `linear-gradient(to top, ${settings.accentHex}, #a855f7)`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Synchronized Apple Karaoke Lyrics View */}
            <div className="rounded-2xl bg-black/45 backdrop-blur-md border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1 border-b border-white/10 pb-2">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <Mic className="w-3.5 h-3.5 animate-pulse" />
                  <span>SYNCHRONIZED KARAOKE</span>
                </span>
                <span>Click line to seek</span>
              </div>
              <div className="h-64 sm:h-72 overflow-y-auto scrollbar-none space-y-2.5 px-2 py-2">
                {isLoadingLyrics ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-2 text-gray-400">
                    <Sparkles className="w-6 h-6 text-cyan-400 animate-spin" />
                    <span className="text-xs font-mono">Loading synchronized lyrics...</span>
                  </div>
                ) : lyrics.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Music2 className="w-8 h-8 text-gray-500 mb-2" />
                    <span className="text-sm">No lyrics available</span>
                  </div>
                ) : (
                  lyrics.map((line, idx) => {
                    const isActive = idx === activeLyricIndex;
                    const isPast = idx < activeLyricIndex;
                    return (
                      <div
                        key={`${line.time}-${idx}`}
                        ref={isActive ? activeLyricRef : undefined}
                        onClick={() => seek(line.time)}
                        className={`px-3 py-2 rounded-xl transition-all duration-300 cursor-pointer ${
                          isActive
                            ? 'bg-white/20 border border-white/35 text-white font-extrabold text-sm sm:text-base shadow-[0_0_20px_rgba(255,255,255,0.35)] scale-[1.02]'
                            : isPast
                            ? 'text-white/40 hover:text-white/80 text-xs sm:text-sm font-medium'
                            : 'text-white/60 hover:text-white text-xs sm:text-sm font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="leading-snug">{line.text}</span>
                          {isActive && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping flex-shrink-0" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Transport Controls & Scrubber */}
          <div className="relative z-10 space-y-3 pt-2 border-t border-dark-border/60">
            <div className="space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.5}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={toggleShuffle} className={`p-2 rounded-xl ${isShuffle ? 'text-accent' : 'text-gray-400 hover:text-white'}`}>
                  <Shuffle className="w-4 h-4" />
                </button>
                <button onClick={toggleRepeat} className={`p-2 rounded-xl ${repeatMode !== 'off' ? 'text-accent' : 'text-gray-400 hover:text-white'}`}>
                  {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={prevTrack} className="p-2 rounded-full text-gray-300 hover:text-white"><SkipBack className="w-5 h-5 fill-current" /></button>
                <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 shadow-md">
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <button onClick={nextTrack} className="p-2 rounded-full text-gray-300 hover:text-white"><SkipForward className="w-5 h-5 fill-current" /></button>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => downloadTrackOffline(currentTrack)} className={`p-2 rounded-xl ${isDownloaded ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}>
                  {isDownloaded ? <Check className="w-4 h-4" /> : <DownloadCloud className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsQueueOpen(true)} className="p-2 rounded-xl text-gray-400 hover:text-white">
                  <ListMusic className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Default: Floating Movable Deck with SEPARATE LYRICS WING (A SIDE OF POPUP)
  return (
    <div
      ref={popupRef}
      style={
        position
          ? {
              left: `${position.x}px`,
              top: `${position.y}px`,
              bottom: 'auto',
              right: 'auto',
              position: 'fixed',
            }
          : undefined
      }
      className={`${
        position ? '' : 'fixed bottom-24 sm:bottom-28 right-3 sm:right-6'
      } z-40 select-none animate-fade-in ${
        isDragging ? 'scale-[1.02] shadow-2xl' : ''
      }`}
      data-apple-cursor="song-card"
    >
      <ContentResetModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} />

      {/* 🌟 SIDE-BY-SIDE CONTAINER: MAIN POPUP CARD + SEPARATE LYRICS SIDE WING */}
      <div
        className={`flex ${
          dockLyricsOnLeft ? 'flex-row-reverse' : 'flex-row'
        } items-start gap-3`}
      >
        {/* ===============================================================
            CARD A: 🎵 MAIN PLAYING SONG POPUP (Matches Screenshot)
           =============================================================== */}
        <div
          className="apple-water-bubble relative w-[calc(100vw-1.5rem)] sm:w-[390px] rounded-3xl bg-dark-secondary/45 backdrop-blur-3xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.75)] p-4 sm:p-5 flex flex-col space-y-3 transition-all overflow-hidden flex-shrink-0"
          style={{
            boxShadow: isBeat
              ? `0 20px 60px rgba(0,0,0,0.75), 0 0 25px ${settings.accentHex}40`
              : '0 20px 60px rgba(0,0,0,0.75)',
          }}
        >
          {/* Dynamic Background Image: Cover Art or Artist Profile */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none transition-all duration-700"
            style={{
              backgroundImage: `url(${
                cardVisualMode === 'profile' && artistProfile?.photoUrl
                  ? artistProfile.photoUrl
                  : currentTrack.coverUrl
              })`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: cardVisualMode === 'profile' ? 'blur(22px) brightness(0.35)' : 'blur(28px) brightness(0.3)',
              transform: isBeat ? 'scale(1.05)' : 'scale(1.0)',
            }}
          />

          {/* Top Specular Sheen (Apple Water Bubble Specular Lens) */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent rounded-t-3xl pointer-events-none" />

          {/* 🖐️ Movable Drag Handle Bar */}
          <div
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            className="w-full flex items-center justify-center pt-0.5 pb-1 cursor-grab active:cursor-grabbing group relative z-20"
            title="Drag and drop to move popup anywhere on screen"
          >
            <div className="w-12 h-1.5 rounded-full bg-white/25 group-hover:bg-accent/70 group-hover:w-16 transition-all" />
          </div>

          {/* 🌟 Popup Header Bar (Draggable) */}
          <div
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            className="relative z-10 flex items-center justify-between pb-2 border-b border-white/10 cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
              <div className="truncate">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-rose-400 uppercase">
                  <span>NOW PLAYING POPUP</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-emerald-400">
                    {currentTrack.source || (currentTrack.youtubeId ? 'YOUTUBE MUSIC' : 'CHILLMODE')}
                  </span>
                </div>
                <div className="text-[9px] text-gray-400 font-mono truncate">
                  All-Pages Universal Music Deck
                </div>
              </div>
            </div>

            {/* Header Controls: Reset dock, Toggle Lyrics Wing, Min/Max/Close */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Audiophile Master DSP Button */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('nexora:open-dsp'))}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-all shadow-sm"
                title="Open Audiophile Master DSP (320kbps Lossless Soundstage & EQ)"
              >
                <Sliders className="w-3 h-3 text-purple-400" />
                <span>DSP</span>
              </button>

              {/* Separate Lyrics Wing Toggle Button */}
              <button
                onClick={toggleLyricsWing}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                  isLyricsWingOpen
                    ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/40 shadow-sm'
                    : 'bg-dark-bg/80 text-gray-400 border-dark-border hover:text-white'
                }`}
                title={isLyricsWingOpen ? 'Hide Lyrics Side Wing' : 'Show Lyrics Separately by the Side of Popup'}
              >
                <Mic className="w-3 h-3 text-cyan-400" />
                <span>Lyrics</span>
                {isLyricsWingOpen ? (
                  dockLyricsOnLeft ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                )}
              </button>

              {position && (
                <button
                  onClick={resetPosition}
                  className="p-1 rounded-lg text-gray-400 hover:text-accent hover:bg-dark-hover transition-colors"
                  title="Reset dock to default bottom-right"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setViewMode('minimized')}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
                title="Minimize to Floating Pill"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('expanded')}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
                title="Center Stage View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsSongPopupOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
                title="Dismiss Popup"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Toggle: 🎨 Artwork vs 👤 Profile Background */}
          <div className="relative z-10 flex items-center justify-between px-1">
            <span className="text-[10px] font-mono text-gray-400">
              {cardVisualMode === 'profile' ? '👤 Artist Spotlight' : '🎨 Album Deck'}
            </span>
            <button
              onClick={toggleCardVisualMode}
              className="text-[10px] font-mono text-accent hover:underline flex items-center gap-1"
            >
              <User className="w-3 h-3" />
              <span>Switch to {cardVisualMode === 'profile' ? 'Artwork' : 'Profile'}</span>
            </button>
          </div>

          {/* ════════════════════════════════════════════════════════════════════
              MODE: 👤 ARTIST PROFILE (When Profile background is toggled)
             ════════════════════════════════════════════════════════════════════ */}
          {cardVisualMode === 'profile' && artistProfile ? (
            <div className="relative z-10 rounded-2xl bg-black/45 backdrop-blur-md border border-white/15 p-3.5 space-y-2.5 overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/30 shadow-lg flex-shrink-0">
                  <img src={artistProfile.photoUrl} alt={artistProfile.name} className="w-full h-full object-cover" />
                  <div className="apple-sheen-sweep" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-white truncate">{artistProfile.name}</span>
                    {artistProfile.verified && (
                      <span className="p-0.5 rounded-full bg-blue-500 text-white shadow-sm flex-shrink-0"><Check className="w-2.5 h-2.5 stroke-[3]" /></span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                    <Headphones className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{artistProfile.monthlyListeners} monthly listeners</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-mono text-cyan-300">
                    <Award className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{artistProfile.ranking}</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed line-clamp-2 italic">
                "{artistProfile.bio}"
              </p>
              <div className="flex flex-wrap gap-1.5">
                {artistProfile.genres.map(g => (
                  <span key={g} className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-white/10 text-gray-200 border border-white/15">{g}</span>
                ))}
              </div>
            </div>
          ) : (
            /* ════════════════════════════════════════════════════════════════════
                MODE: 🎨 CLASSIC ARTWORK + TELEMETRY (Matches User Picture)
               ════════════════════════════════════════════════════════════════════ */
            <>
              {/* Track Info Row */}
              <div className="relative z-10 flex items-center gap-3.5">
                <div
                  data-apple-cursor="song-icon"
                  onClick={() => setIsFullscreen(true)}
                  className="apple-gloss-icon relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden flex-shrink-0 border border-white/30 shadow-md cursor-pointer group"
                  title="Open Fullscreen Visualizer"
                >
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isPlaying ? 'animate-spin-slow' : 'group-hover:scale-105'
                    }`}
                  />
                  <div className="apple-sheen-sweep" />
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Global Hit
                    </span>
                  </div>
                  <h3
                    onClick={() => setViewMode('expanded')}
                    className="text-xs sm:text-sm font-bold text-white truncate cursor-pointer hover:text-accent transition-colors"
                    title={currentTrack.title}
                  >
                    {currentTrack.title}
                  </h3>
                  <p className="text-[11px] text-gray-300 truncate font-medium">
                    {currentTrack.artist}
                  </p>
                  {currentTrack.album && (
                    <p className="text-[10px] text-gray-500 truncate font-mono">
                      Album: {currentTrack.album}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => toggleLike(currentTrack)}
                  className={`p-2 rounded-xl transition-transform active:scale-90 ${
                    isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-white'
                  }`}
                  title={isLiked ? 'Remove from Liked' : 'Save to Liked'}
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Beat Tempo & Stream Fidelity Cards (From user picture) */}
              <div className="relative z-10 grid grid-cols-2 gap-2 font-mono text-[10px]">
                <div className="p-2 rounded-xl bg-dark-bg/60 border border-dark-border/60">
                  <div className="text-gray-400 text-[8px]">BEAT TEMPO</div>
                  <div className="text-white font-bold flex items-center gap-1 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isBeat ? 'bg-accent animate-ping' : 'bg-gray-500'}`} />
                    <span>{bpm} BPM</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-dark-bg/60 border border-dark-border/60">
                  <div className="text-gray-400 text-[8px]">STREAM FIDELITY</div>
                  <div className="text-emerald-400 font-bold mt-0.5">
                    320 kbps Lossless
                  </div>
                </div>
              </div>

              {/* Up Next Preview */}
              {nextUpTrack && (
                <div className="relative z-10 p-2 rounded-xl bg-dark-bg/50 border border-dark-border/50 text-[10px] font-mono text-gray-400 truncate">
                  <span className="text-rose-400 font-semibold mr-1">Up Next:</span>
                  <span className="text-gray-200">{nextUpTrack.title}</span>
                  <span className="text-gray-500 ml-1">• {nextUpTrack.artist}</span>
                </div>
              )}

              {/* Live Sound Wave Equalizer Bars */}
              <div className="relative z-10 px-1 py-1 rounded-xl bg-dark-bg/60 border border-dark-border/60">
                <div className="flex items-end justify-between gap-1 h-6 px-1">
                  {spectralBands.slice(0, 16).map((val, i) => {
                    const hPct = Math.min(100, Math.max(15, val * 100 * (isBeat ? 1.3 : 0.9)));
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-full transition-all duration-75"
                        style={{
                          height: isPlaying ? `${hPct}%` : '15%',
                          backgroundColor: isBeat ? '#06b6d4' : settings.primaryHex,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ⏱️ Scrubber Bar */}
          <div className="relative z-10 space-y-1">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent transition-all"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* 🎛️ Playback Transport Controls */}
          <div className="relative z-10 flex items-center justify-between pt-0.5">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 transition-colors ${
                isShuffle ? 'text-accent' : 'text-gray-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={prevTrack}
              className="p-1.5 text-gray-300 hover:text-white transition-colors"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_18px_rgba(255,255,255,0.45)]"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-1.5 text-gray-300 hover:text-white transition-colors"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1.5 transition-colors ${
                repeatMode !== 'off' ? 'text-accent' : 'text-gray-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
            </button>

            {/* Download Offline */}
            <button
              onClick={() => downloadTrackOffline(currentTrack)}
              disabled={isDownloading}
              className={`p-1.5 transition-colors ${
                isDownloaded ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
              }`}
              title={isDownloaded ? 'Saved in Offline Storage' : 'Download Offline'}
            >
              {isDownloaded ? <Check className="w-3.5 h-3.5" /> : <DownloadCloud className="w-3.5 h-3.5" />}
            </button>

            {/* Queue Drawer */}
            <button
              onClick={() => setIsQueueOpen(true)}
              className="p-1.5 text-gray-400 hover:text-white transition-colors"
              title="Open Queue"
            >
              <ListMusic className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 🔊 Footer Utility Row: Volume & Reset Deck */}
          <div className="relative z-10 pt-1.5 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="hover:text-white transition-colors">
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={handleVolume}
                className="w-20 sm:w-28 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            <button
              onClick={() => setIsResetModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-[10px] font-mono font-semibold transition-all border border-rose-500/30 active:scale-95"
              title="Reset queue and audio composition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Deck</span>
            </button>
          </div>
        </div>

        {/* ===============================================================
            CARD B: 🎤 SEPARATE LYRICS WING (A SIDE OF POPUP)
           =============================================================== */}
        {isLyricsWingOpen && (
          <div className="apple-water-bubble relative w-72 sm:w-80 h-[490px] sm:h-[515px] rounded-3xl bg-dark-secondary/50 backdrop-blur-3xl border border-white/20 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col space-y-3 animate-fade-in flex-shrink-0 overflow-hidden">
            {/* Top Ambient Glow */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-25 filter blur-3xl"
              style={{
                backgroundImage: `url(${currentTrack.coverUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            {/* Top Specular Sheen */}
            <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/15 to-transparent rounded-t-3xl pointer-events-none" />

            {/* Lyrics Wing Header */}
            <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/15">
              <div className="flex items-center gap-2 truncate">
                <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Mic className="w-3.5 h-3.5 animate-pulse" />
                </span>
                <div className="truncate">
                  <div className="text-[11px] font-mono font-bold text-white flex items-center gap-1">
                    <span>LIVE LYRICS</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  </div>
                  <div className="text-[9px] font-mono text-gray-400 truncate">
                    Apple Karaoke • Synced
                  </div>
                </div>
              </div>

              {/* Close / Collapse Side Wing */}
              <button
                onClick={toggleLyricsWing}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
                title="Collapse Lyrics Side Wing"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scrollable Karaoke Lines */}
            <div
              ref={lyricsContainerRef}
              className="relative z-10 flex-1 overflow-y-auto scrollbar-none space-y-2.5 px-2 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 select-none"
            >
              {isLoadingLyrics ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-gray-400">
                  <Sparkles className="w-6 h-6 text-cyan-400 animate-spin" />
                  <span className="text-xs font-mono">Syncing live karaoke lyrics...</span>
                </div>
              ) : lyrics.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-gray-400 p-4">
                  <Music2 className="w-6 h-6 text-gray-500 mb-1" />
                  <span className="text-xs font-mono">Searching synced lyrics registry...</span>
                </div>
              ) : (
                lyrics.map((line, idx) => {
                  const isActive = idx === activeLyricIndex;
                  const isPast = idx < activeLyricIndex;
                  return (
                    <div
                      key={`${line.time}-${idx}`}
                      ref={isActive ? activeLyricRef : undefined}
                      onClick={() => seek(line.time)}
                      className={`px-3 py-2 rounded-xl transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'bg-white/20 border border-white/35 text-white font-extrabold text-sm sm:text-base shadow-[0_0_20px_rgba(255,255,255,0.35)] scale-[1.02]'
                          : isPast
                          ? 'text-white/40 hover:text-white/80 text-xs sm:text-sm font-medium'
                          : 'text-white/60 hover:text-white text-xs sm:text-sm font-medium'
                      }`}
                      title={`Jump to ${formatTime(line.time)}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="leading-snug">{line.text}</span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Lyrics Wing Footer */}
            <div className="relative z-10 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span className="flex items-center gap-1">
                <span className="text-cyan-400">●</span> Tap line to seek
              </span>
              <span className="text-accent font-bold">{bpm} BPM</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
