import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  Sparkles,
  ArrowRight,
  CornerDownLeft,
  X,
  Check,
  Layers,
  Home,
  Compass,
  DownloadCloud,
  ListMusic,
  Heart,
  Palette,
  Activity,
  Disc,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { musicApi } from '../../services/musicApi';
import { Track } from '../../types';
import { useCustomization, COLOR_PRESETS } from '../../context/ThemeContext';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { useNotification } from '../../context/NotificationContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateMusic: (tabId: string) => void;
  onOpenCustomizer: () => void;
  onOpenSettings: () => void;
}

type CategoryFilter = 'all' | 'music' | 'themes' | 'actions';

interface PaletteAction {
  id: string;
  category: 'music' | 'themes' | 'actions';
  title: string;
  subtitle: string;
  icon: any;
  iconColor: string;
  badge?: string;
  run: () => void;
}

export const CommandPalette: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigateMusic,
  onOpenCustomizer,
  onOpenSettings,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [musicResults, setMusicResults] = useState<Track[]>([]);
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { setColorPreset, settings } = useCustomization();
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    isMuted,
    toggleMute,
    setIsFullscreen,
    playTrack,
    downloadedTrackIds,
    toggleSongPopup,
  } = useMusicPlayer();
  const { addNotification } = useNotification();

  // Reset and focus when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setActiveCategory('all');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Live music search on query change
  useEffect(() => {
    if (!query.trim()) {
      setMusicResults([]);
      setIsSearchingMusic(false);
      return;
    }

    setIsSearchingMusic(true);
    const timer = setTimeout(async () => {
      try {
        const res = await musicApi.search(query);
        if (res.success && res.tracks) {
          setMusicResults(res.tracks.slice(0, 6));
        }
      } catch {
        setMusicResults([]);
      } finally {
        setIsSearchingMusic(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  // Build standard actions
  const baseActions: PaletteAction[] = [
    // Music Navigation
    {
      id: 'nav-home',
      category: 'music',
      title: 'Home Feed & Charts',
      subtitle: "Spotify Global Top 50, JioSaavn hits & multi-language charts",
      icon: Home,
      iconColor: 'text-accent',
      badge: 'Home',
      run: () => {
        onNavigateMusic('home');
        onClose();
      },
    },
    {
      id: 'nav-search',
      category: 'music',
      title: 'Search & Explore Catalog',
      subtitle: 'Filter by Spotify, JioSaavn, YouTube Music, languages, and genres',
      icon: Compass,
      iconColor: 'text-cyan-400',
      badge: 'Search',
      run: () => {
        onNavigateMusic('search');
        onClose();
      },
    },
    {
      id: 'action-refresh-feed',
      category: 'actions',
      title: 'Content Refresh: Reload Home Feed',
      subtitle: 'Fetch freshest tracks & charts across Spotify, JioSaavn & YouTube',
      icon: RefreshCw,
      iconColor: 'text-accent',
      badge: 'Shift+R',
      run: () => {
        onNavigateMusic('home');
        window.dispatchEvent(new CustomEvent('nexora:refresh-feed'));
        onClose();
      },
    },
    {
      id: 'toggle-song-popup',
      category: 'music',
      title: 'Now Playing Song Popup',
      subtitle: 'Open or close the floating song popup player on all pages',
      icon: Disc,
      iconColor: 'text-accent',
      badge: 'Alt+P',
      run: () => {
        toggleSongPopup();
        onClose();
      },
    },
    {
      id: 'nav-offline',
      category: 'music',
      title: 'Offline Library',
      subtitle: `${downloadedTrackIds.size} tracks saved in device storage • 100% offline`,
      icon: DownloadCloud,
      iconColor: 'text-emerald-400',
      badge: 'Alt+3',
      run: () => {
        onNavigateMusic('offline');
        onClose();
      },
    },
    {
      id: 'action-prepare-offline',
      category: 'actions',
      title: 'Prepare Everything Offline (Download Vault)',
      subtitle: 'Download top songs, covers & lyrics directly to IndexedDB for zero-network playback',
      icon: Zap,
      iconColor: 'text-cyan-400',
      badge: 'Offline Pack',
      run: () => {
        onNavigateMusic('offline');
        onClose();
      },
    },
    {
      id: 'nav-playlists',
      category: 'music',
      title: 'Your Playlists & Collections',
      subtitle: 'Create, curate, and play your personalized music playlists',
      icon: ListMusic,
      iconColor: 'text-primary-light',
      badge: 'Alt+4',
      run: () => {
        onNavigateMusic('playlists');
        onClose();
      },
    },
    {
      id: 'nav-liked',
      category: 'music',
      title: 'Liked Songs Collection',
      subtitle: 'Browse all tracks you have saved with a heart',
      icon: Heart,
      iconColor: 'text-rose-400',
      badge: 'Alt+5',
      run: () => {
        onNavigateMusic('liked');
        onClose();
      },
    },

    // Audio Playback Actions
    {
      id: 'action-toggle-play',
      category: 'actions',
      title: isPlaying ? 'Pause Audio Playback' : 'Play Audio Stream',
      subtitle: currentTrack ? `${currentTrack.title} • ${currentTrack.artist}` : 'Resume stream',
      icon: isPlaying ? Pause : Play,
      iconColor: 'text-white',
      badge: 'Space',
      run: () => {
        togglePlay();
        onClose();
      },
    },
    {
      id: 'action-next-track',
      category: 'actions',
      title: 'Skip to Next Track',
      subtitle: 'Play subsequent song in active playlist or queue',
      icon: SkipForward,
      iconColor: 'text-gray-300',
      badge: 'Skip',
      run: () => {
        nextTrack();
        onClose();
      },
    },
    {
      id: 'action-prev-track',
      category: 'actions',
      title: 'Previous Track',
      subtitle: 'Restart song or return to preceding track',
      icon: SkipBack,
      iconColor: 'text-gray-300',
      badge: 'Prev',
      run: () => {
        prevTrack();
        onClose();
      },
    },
    {
      id: 'action-toggle-mute',
      category: 'actions',
      title: isMuted ? 'Unmute Audio' : 'Mute Master Audio',
      subtitle: 'Toggle master sound output',
      icon: isMuted ? VolumeX : Volume2,
      iconColor: isMuted ? 'text-rose-400' : 'text-cyan-400',
      badge: 'M',
      run: () => {
        toggleMute();
        onClose();
      },
    },
    {
      id: 'action-fullscreen',
      category: 'actions',
      title: 'Open Cyberpunk Fullscreen Visualizer',
      subtitle: 'Immersive sound visualizer and dynamic cover art',
      icon: Maximize2,
      iconColor: 'text-accent',
      badge: 'F',
      run: () => {
        setIsFullscreen(true);
        onClose();
      },
    },

    // App & Studio Actions
    {
      id: 'action-customizer',
      category: 'actions',
      title: 'Studio Theme Customizer',
      subtitle: 'Adjust neon colors, typography, background glow, and scaling',
      icon: Palette,
      iconColor: 'text-primary-light',
      badge: 'Alt+C',
      run: () => {
        onOpenCustomizer();
        onClose();
      },
    },
    {
      id: 'action-settings',
      category: 'actions',
      title: 'Settings & Bitrate Preferences',
      subtitle: 'Configure audio quality (320kbps Lossless), account profile, and storage',
      icon: Settings,
      iconColor: 'text-gray-400',
      badge: 'Settings',
      run: () => {
        onOpenSettings();
        onClose();
      },
    },

    // Themes Quick Switching
    ...COLOR_PRESETS.map(preset => ({
      id: `theme-${preset.id}`,
      category: 'themes' as const,
      title: `Switch Theme: ${preset.name}`,
      subtitle: `Apply primary ${preset.primaryHex} & accent ${preset.accentHex}`,
      icon: Sparkles,
      iconColor: 'text-accent',
      badge: settings.colorPreset === preset.id ? 'Active' : undefined,
      run: () => {
        setColorPreset(preset.id);
        addNotification({
          type: 'success',
          title: `Theme: ${preset.name}`,
          message: 'Palette applied dynamically',
          duration: 1500,
        });
        onClose();
      },
    })),
  ];

  // Filter actions based on search query and category
  const filteredActions = baseActions.filter(action => {
    if (activeCategory !== 'all' && action.category !== activeCategory) {
      return false;
    }
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      action.title.toLowerCase().includes(q) ||
      action.subtitle.toLowerCase().includes(q) ||
      (action.badge && action.badge.toLowerCase().includes(q))
    );
  });

  // Calculate total navigable items
  const totalItems = musicResults.length + filteredActions.length;

  // Handle Keyboard Navigation (Arrows + Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (totalItems || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (totalItems || 1)) % (totalItems || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < musicResults.length) {
        // Play selected track
        const track = musicResults[selectedIndex];
        playTrack(track, musicResults);
        onClose();
      } else {
        const actionIndex = selectedIndex - musicResults.length;
        if (filteredActions[actionIndex]) {
          filteredActions[actionIndex].run();
        }
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-dark-secondary/95 border border-dark-border/90 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[80vh] transition-all"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Bar */}
        <div className="relative flex items-center px-5 py-4 border-b border-dark-border/80 gap-3">
          <Search className="w-5 h-5 text-accent animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search any song (Spotify, JioSaavn, YouTube) or type a command..."
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-dark-hover"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-dark-card border border-dark-border text-[10px] font-mono text-gray-400">
            <span>ESC</span>
          </kbd>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-dark-bg/60 border-b border-dark-border/60 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'music', label: 'Music & Library' },
            { id: 'actions', label: 'Playback & Audio' },
            { id: 'themes', label: 'Color Themes' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as CategoryFilter);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-accent/20 text-accent font-semibold border border-accent/40 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-dark-card'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[60vh] scrollbar-thin scrollbar-thumb-dark-border"
        >
          {/* Live Music Search Matches */}
          {musicResults.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-mono font-bold text-accent uppercase tracking-wider flex items-center justify-between">
                <span>Direct Audio Matches</span>
                {isSearchingMusic && <span className="animate-pulse text-[10px]">Searching...</span>}
              </div>
              {musicResults.map((track, i) => {
                const isSelected = selectedIndex === i;
                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      playTrack(track, musicResults);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary/20 border border-primary/50 text-white shadow-sm'
                        : 'hover:bg-dark-card border border-transparent text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-dark-border"
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-2">
                          <span className="truncate">{track.title}</span>
                          {track.source === 'Spotify' ? (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              SPOTIFY
                            </span>
                          ) : track.source === 'JioSaavn' ? (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-teal-500/20 text-teal-400 border border-teal-500/30">
                              JIOSAAVN
                            </span>
                          ) : track.youtubeId ? (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-red-600/20 text-red-400 border border-red-500/30">
                              YT MUSIC
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate">{track.artist}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-mono text-gray-500">
                        {Math.floor((track.duration || 210) / 60)}:
                        {String((track.duration || 210) % 60).padStart(2, '0')}
                      </span>
                      <div className="p-2 rounded-xl bg-primary/20 text-accent group-hover:scale-105">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Filtered Actions */}
          {filteredActions.length > 0 && (
            <div className="space-y-1">
              {musicResults.length > 0 && (
                <div className="px-3 py-1 text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                  Commands & Actions
                </div>
              )}
              {filteredActions.map((action, i) => {
                const itemIndex = musicResults.length + i;
                const isSelected = selectedIndex === itemIndex;
                const Icon = action.icon;
                return (
                  <div
                    key={action.id}
                    onClick={() => action.run()}
                    className={`flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-accent/20 border border-accent/50 text-white shadow-sm'
                        : 'hover:bg-dark-card border border-transparent text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`p-2 rounded-xl bg-dark-bg border border-dark-border ${action.iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{action.title}</div>
                        <div className="text-[11px] text-gray-400 truncate">{action.subtitle}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {action.badge && (
                        <span className="px-2 py-0.5 rounded-md bg-dark-bg border border-dark-border text-[10px] font-mono text-gray-400">
                          {action.badge}
                        </span>
                      )}
                      <CornerDownLeft className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {musicResults.length === 0 && filteredActions.length === 0 && (
            <div className="text-center py-12 text-gray-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-gray-500 opacity-50" />
              <div className="text-sm font-semibold">No commands or songs found for "{query}"</div>
              <p className="text-xs text-gray-500">
                Try searching for an artist like "Arijit Singh", "Taylor Swift", or "The Weeknd"
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-dark-border/80 bg-dark-bg/60 text-[11px] font-mono text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-dark-card border border-dark-border text-[10px]">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-dark-card border border-dark-border text-[10px]">↵</kbd>
              <span>Select</span>
            </span>
          </div>
          <span className="text-accent font-semibold">CHILLMODE Omnibox</span>
        </div>
      </div>
    </div>
  );
};
