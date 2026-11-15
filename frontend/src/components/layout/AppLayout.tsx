import React, { useState, useEffect } from 'react';
import {
  Home,
  Compass,
  DownloadCloud,
  ListMusic,
  Heart,
  Search,
  Settings,
  Menu,
  X,
  Keyboard,
  Sparkles,
  LogOut,
  Activity,
  RefreshCw,
  Maximize2,
  Minimize2,
  Radio,
  Sliders,
  Moon,
  FolderOpen,
  Mic,
  Clock,
  Headphones,
  Zap,
  Globe,
} from 'lucide-react';
import { Playlist } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { useBeatSync } from '../../hooks/useBeatSync';
import { PlayerBar } from '../music/PlayerBar';
import { FullscreenPlayer } from '../music/FullscreenPlayer';
import { AuthModal } from '../auth/AuthModal';
import { SettingsModal } from '../settings/SettingsModal';
import { CustomizerModal } from '../settings/CustomizerModal';
import { CyberpunkBackground } from './CyberpunkBackground';
import { AppleCursor } from './AppleCursor';
import { CommandPalette } from './CommandPalette';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { QuickThemeBar } from './QuickThemeBar';
import { AudiophileDspModal } from '../music/AudiophileDspModal';
import { SleepTimerModal } from '../music/SleepTimerModal';
import { LocalAudioModal } from '../music/LocalAudioModal';

// Music Section Views
import { MusicHome } from '../music/MusicHome';
import { MusicSearch } from '../music/MusicSearch';
import { PlaylistsView } from '../music/PlaylistsView';
import { PlaylistDetailView } from '../music/PlaylistDetailView';
import { LikedTracksView } from '../music/LikedTracksView';
import { OfflineLibrary } from '../music/OfflineLibrary';
import { PlayingSongPopup } from '../music/PlayingSongPopup';

export type MusicSubTab = 'home' | 'search' | 'offline' | 'playlists' | 'playlist-detail' | 'liked';

export const AppLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MusicSubTab>('home');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // 🎚️ Luxury Audiophile Modals State
  const [isDspOpen, setIsDspOpen] = useState(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [isLocalAudioOpen, setIsLocalAudioOpen] = useState(false);

  // ⛶ Fullscreen App & Wide Viewport Canvas State
  const [isAppFullscreen, setIsAppFullscreen] = useState(false);
  const [isWideCanvas, setIsWideCanvas] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nexora_wide_canvas');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true; // Default wide canvas for edge-to-edge immersion
  });

  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    downloadedTrackIds,
    isOnline,
    setIsSongPopupOpen,
    toggleSongPopup,
  } = useMusicPlayer();

  const { bpm, isBeat, spectralBands } = useBeatSync({
    sensitivity: 1.15,
    bandCount: 16,
  });

  useEffect(() => {
    const handleOpenDsp = () => setIsDspOpen(true);
    window.addEventListener('nexora:open-dsp', handleOpenDsp);
    return () => window.removeEventListener('nexora:open-dsp', handleOpenDsp);
  }, []);

  const toggleAppFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsAppFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleSelectPlaylist = (pl: Playlist) => {
    setSelectedPlaylist(pl);
    setActiveTab('playlist-detail');
  };

  const handleNavigate = (tab: MusicSubTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  // ⌨️ Global Keyboard Shortcuts Engine
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // Ctrl + K or Cmd + K -> Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }

      // If user is actively typing in an input field, do not trigger single hotkeys
      if (isInput) return;

      if (e.key === '/') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      } else if (e.altKey && e.key === '1') {
        e.preventDefault();
        handleNavigate('home');
      } else if (e.altKey && e.key === '2') {
        e.preventDefault();
        handleNavigate('search');
      } else if (e.altKey && e.key === '3') {
        e.preventDefault();
        handleNavigate('offline');
      } else if (e.altKey && e.key === '4') {
        e.preventDefault();
        handleNavigate('playlists');
      } else if (e.altKey && e.key === '5') {
        e.preventDefault();
        handleNavigate('liked');
      } else if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        toggleSongPopup();
      } else if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setIsCustomizerOpen(true);
      } else if ((e.shiftKey || e.altKey) && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        if (activeTab !== 'home') {
          handleNavigate('home');
        }
        window.dispatchEvent(new CustomEvent('nexora:refresh-feed'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col font-sans selection:bg-primary/30 selection:text-white transition-colors duration-200 relative overflow-x-hidden">
      {/* 🚀 Clean Minimal Cyber Ambient Layer with Synced Song Lighting */}
      <CyberpunkBackground />

      {/* 🍎 Apple Operating System Fluid Glass Cursor */}
      <AppleCursor />

      {/* ⚡ Command Palette Omnibox Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateMusic={tabId => handleNavigate(tabId as MusicSubTab)}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* ⌨️ Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Modals & Universal Overlays */}
      <AuthModal />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <CustomizerModal isOpen={isCustomizerOpen} onClose={() => setIsCustomizerOpen(false)} />
      <FullscreenPlayer />

      {/* 🎚️ Luxury Audiophile Modals */}
      <AudiophileDspModal isOpen={isDspOpen} onClose={() => setIsDspOpen(false)} />
      <SleepTimerModal isOpen={isSleepTimerOpen} onClose={() => setIsSleepTimerOpen(false)} />
      <LocalAudioModal isOpen={isLocalAudioOpen} onClose={() => setIsLocalAudioOpen(false)} />

      {/* 🎵 Playing Song Popup with Separate Lyrics Side Wing */}
      <PlayingSongPopup />

      {/* Top Header - Ultra-Clean Liquid Water Bubble Glass Navbar */}
      <header className="sticky top-0 z-30 h-16 bg-dark-secondary/40 backdrop-blur-3xl border-b border-white/15 px-4 sm:px-6 flex items-center justify-between shadow-sm">
        {/* Left: Brand Monogram + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover md:hidden transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <div
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="font-mono font-bold text-white text-xs tracking-wider">CM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">CHILLMODE</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hidden sm:inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>320K AUDIOPHILE</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Clean Omnibox Search Trigger Button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden md:flex items-center justify-between w-64 lg:w-96 px-3.5 py-1.5 bg-dark-bg/80 hover:bg-dark-card border border-dark-border/80 hover:border-accent/40 rounded-xl text-xs text-gray-400 hover:text-gray-200 transition-all font-medium shadow-inner group"
          title="Open Omnibox (Ctrl+K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-accent" />
            <span className="truncate">Search Spotify, JioSaavn, YouTube, songs, artists...</span>
          </div>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-dark-card border border-dark-border text-[10px] font-mono text-gray-400">
            <span>⌘K</span>
          </kbd>
        </button>

        {/* Right: Consolidated Controls Dock */}
        <div className="flex items-center gap-2">
          {/* 📡 Network Online / Offline Status Badge */}
          <button
            onClick={() => handleNavigate('offline')}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl border transition-all flex items-center gap-1.5 active:scale-95 text-xs font-mono font-semibold ${
              isOnline
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
            }`}
            title={
              isOnline
                ? 'Network Connected • Tap to open Offline Library'
                : 'Offline Mode Active • Tap to open Offline Library'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className="hidden sm:inline">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            {downloadedTrackIds.size > 0 && (
              <span className="text-[10px] opacity-80 hidden md:inline">
                ({downloadedTrackIds.size} ready)
              </span>
            )}
          </button>

          {/* Mobile Search Button */}
          <button
            onClick={() => handleNavigate('search')}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-card border border-dark-border/80 md:hidden transition-all"
            title="Search Spotify, JioSaavn, YouTube, songs"
          >
            <Search className="w-4 h-4 text-accent" />
          </button>

          {/* Content Refresh Feed Button */}
          <button
            onClick={() => {
              if (activeTab !== 'home') {
                handleNavigate('home');
              }
              window.dispatchEvent(new CustomEvent('nexora:refresh-feed'));
            }}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-card border border-dark-border/80 transition-all flex items-center gap-1.5 active:scale-95 group"
            title="Content Refresh: Reload Home Feed (Shift+R)"
          >
            <RefreshCw className="w-4 h-4 text-accent group-hover:rotate-180 transition-transform duration-500" />
            <span className="hidden lg:inline text-xs font-semibold text-gray-300">Refresh</span>
          </button>

          {/* 🎚️ 1-Click Hi-Fi Master DSP Equalizer Button */}
          <button
            onClick={() => setIsDspOpen(true)}
            className="p-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1.5 active:scale-95"
            title="Open Audiophile Master DSP (320kbps Lossless Equalizer & Spatial 3D Audio)"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="hidden xl:inline text-xs font-mono font-bold">Hi-Fi DSP</span>
          </button>

          {/* 1-Click Fullscreen App Toggle */}
          <button
            onClick={toggleAppFullscreen}
            className={`p-2 rounded-xl border transition-all active:scale-95 ${
              isAppFullscreen
                ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-dark-card border-dark-border/80'
            }`}
            title={isAppFullscreen ? 'Exit Fullscreen App' : 'Full Screen App (F11 / Zen Mode)'}
          >
            {isAppFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Quick Style & Appearance Popover */}
          <QuickThemeBar onOpenFullCustomizer={() => setIsCustomizerOpen(true)} />

          {/* Shortcuts */}
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-card border border-dark-border/80 transition-colors hidden sm:flex items-center"
            title="Keyboard Shortcuts Cheat Sheet (?)"
          >
            <Keyboard className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-card border border-dark-border/80 transition-colors"
            title="Settings & Audio Bitrate"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Auth Profile */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-dark-border/80">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-primary/40 object-cover cursor-pointer hover:border-accent transition-colors"
                onClick={() => setIsSettingsOpen(true)}
                title={user.name}
              />
              <button
                onClick={logout}
                className="p-1.5 text-gray-400 hover:text-rose-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-xs font-semibold text-white transition-opacity shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Mobile Drawer Backdrop */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-15 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
          />
        )}

        {/* Sidebar Navigation - Water Bubble Glass Edge with Functional Dashboard Sections */}
        <aside
          className={`fixed inset-y-16 left-0 z-20 w-64 bg-dark-secondary/40 backdrop-blur-3xl border-r border-white/15 flex flex-col justify-between p-4 transition-transform duration-300 md:static md:translate-x-0 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Navigation Links + Dashboard Below Liked Songs */}
          <div className="space-y-4 overflow-y-auto pr-1 scrollbar-none flex-1">
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-mono font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>MUSIC STREAMING</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              </div>

              {[
                { id: 'home', label: 'Home Feed', icon: Home, keyHint: 'Alt+1' },
                { id: 'search', label: 'Search & Genres', icon: Compass, keyHint: 'Alt+2' },
                {
                  id: 'offline',
                  label: 'Offline Library',
                  icon: DownloadCloud,
                  badge: downloadedTrackIds.size > 0 ? String(downloadedTrackIds.size) : undefined,
                  keyHint: 'Alt+3',
                },
                { id: 'playlists', label: 'Your Library', icon: ListMusic, keyHint: 'Alt+4' },
                { id: 'liked', label: 'Liked Songs', icon: Heart, keyHint: 'Alt+5' },
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id as MusicSubTab)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-accent/20 text-white border border-accent/40 font-semibold shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-dark-hover/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-gray-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.id === 'home' && isActive && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            window.dispatchEvent(new CustomEvent('nexora:refresh-feed'));
                          }}
                          className="p-1 text-accent hover:text-white rounded transition-colors"
                          title="Refresh Home Feed (Shift+R)"
                        >
                          <RefreshCw className="w-3 h-3 hover:rotate-180 transition-transform duration-500" />
                        </span>
                      )}
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {item.badge}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-gray-500 opacity-60">
                        {item.keyHint}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ══════════════════════════════════════════════════════════════
                🎛️ AUDIOPHILE TOOLS SUITE (BELOW LIKED SONGS)
               ══════════════════════════════════════════════════════════════ */}
            <div className="pt-2 space-y-1.5 border-t border-white/10">
              <div className="px-3 py-1 text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>AUDIOPHILE TOOLS</span>
                <Sliders className="w-3 h-3 text-cyan-400" />
              </div>

              {/* Tool 1: Hi-Fi Master DSP & EQ */}
              <button
                onClick={() => setIsDspOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-black/35 hover:bg-black/60 border border-white/10 transition-all group"
                title="Open Studio Master Equalizer & Spatial 3D Audio"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Sliders className="w-3.5 h-3.5" />
                  </span>
                  <span>Hi-Fi Master DSP</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  320k
                </span>
              </button>

              {/* Tool 2: Smart Sleep Timer */}
              <button
                onClick={() => setIsSleepTimerOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-black/35 hover:bg-black/60 border border-white/10 transition-all group"
                title="Set Sleep Timer with gentle acoustic fadeout"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Moon className="w-3.5 h-3.5" />
                  </span>
                  <span>Smart Sleep Timer</span>
                </div>
                <Clock className="w-3 h-3 text-gray-500 group-hover:text-white transition-colors" />
              </button>

              {/* Tool 3: Local Hi-Res Audio Player */}
              <button
                onClick={() => setIsLocalAudioOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-black/35 hover:bg-black/60 border border-white/10 transition-all group"
                title="Play local lossless FLAC / WAV / MP3 from device"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <FolderOpen className="w-3.5 h-3.5" />
                  </span>
                  <span>Play Device Audio</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-400">FLAC</span>
              </button>

              {/* Tool 4: Separate Lyrics Wing Toggle */}
              <button
                onClick={() => {
                  setIsSongPopupOpen(true);
                  window.dispatchEvent(new CustomEvent('nexora:toggle-lyrics-wing'));
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-black/35 hover:bg-black/60 border border-white/10 transition-all group"
                title="Toggle Live Apple Karaoke Synced Lyrics Wing"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    <Mic className="w-3.5 h-3.5" />
                  </span>
                  <span>Karaoke Lyrics Wing</span>
                </div>
                <span className="text-[9px] font-mono text-pink-300">Live</span>
              </button>
            </div>



            {/* ══════════════════════════════════════════════════════════════
                ✨ QUICK VIBES & MOOD MIXES
               ══════════════════════════════════════════════════════════════ */}
            <div className="pt-2 space-y-1 border-t border-white/10">
              <div className="px-3 py-1 text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>QUICK VIBES</span>
                <Radio className="w-3 h-3 text-accent" />
              </div>
              {[
                { name: '🔥 Top Chartbusters', query: 'trending hits' },
                { name: '☕ Chill Acoustic & Lofi', query: 'chill lofi acoustic' },
                { name: '⚡ High Energy Bass', query: 'workout bass' },
                { name: '🌙 Midnight Synth Drive', query: 'synthwave night drive' },
              ].map(mix => (
                <button
                  key={mix.name}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('nexora:search-query', { detail: mix.query }));
                    handleNavigate('search');
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] text-gray-400 hover:text-white hover:bg-white/5 transition-all text-left group"
                >
                  <span className="truncate">{mix.name}</span>
                  <span className="text-[9px] font-mono text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    Play →
                  </span>
                </button>
              ))}
            </div>

            {/* ══════════════════════════════════════════════════════════════
                📊 LIVE AUDIO EQUALIZER SPECTRUM DECK
               ══════════════════════════════════════════════════════════════ */}
            {isPlaying && (
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-mono text-gray-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Activity className="w-3 h-3 animate-pulse" />
                    <span>LIVE EQ SPECTRUM</span>
                  </span>
                  <span className="text-accent font-bold">{bpm} BPM</span>
                </div>
                <div className="flex items-end justify-between gap-0.5 h-6 px-0.5">
                  {spectralBands.slice(0, 16).map((band, idx) => (
                    <span
                      key={idx}
                      className="flex-1 rounded-full transition-all duration-75"
                      style={{
                        height: `${Math.max(15, band * 100 * (isBeat ? 1.3 : 0.9))}%`,
                        backgroundColor: isBeat ? '#06b6d4' : '#a855f7',
                      }}
                    />
                  ))}
                </div>
                <div className="text-[8px] font-mono text-gray-500 text-center pt-0.5">
                  LOSSLESS 320 KBPS • STEREO
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                ⛶ APP DISPLAY CONTROLS: FULLSCREEN & EDGE-TO-EDGE CANVAS
               ══════════════════════════════════════════════════════════════ */}
            <div className="p-2.5 rounded-2xl bg-black/35 border border-white/10 space-y-2">
              <div className="px-1 text-[9px] font-mono text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>APP DISPLAY</span>
                <Sliders className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <button
                  onClick={toggleAppFullscreen}
                  className={`py-1.5 px-2 rounded-xl border flex items-center justify-center gap-1 transition-all ${
                    isAppFullscreen
                      ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/40 font-bold shadow-sm'
                      : 'bg-dark-bg/60 text-gray-300 border-dark-border/80 hover:text-white hover:bg-dark-card'
                  }`}
                  title="Toggle Fullscreen App (F11 / Zen Mode)"
                >
                  {isAppFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                  <span>{isAppFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsWideCanvas(prev => {
                      const next = !prev;
                      try {
                        localStorage.setItem('nexora_wide_canvas', String(next));
                      } catch {}
                      return next;
                    });
                  }}
                  className={`py-1.5 px-2 rounded-xl border flex items-center justify-center gap-1 transition-all ${
                    isWideCanvas
                      ? 'bg-purple-500/25 text-purple-300 border-purple-500/40 font-bold shadow-sm'
                      : 'bg-dark-bg/60 text-gray-300 border-dark-border/80 hover:text-white hover:bg-dark-card'
                  }`}
                  title="Toggle Edge-to-Edge Wide Canvas View"
                >
                  <Sliders className="w-3 h-3" />
                  <span>{isWideCanvas ? 'Full Width' : 'Standard'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Footer: Quick Omnibox Trigger & Mini Track Card */}
          <div className="pt-3 border-t border-dark-border/60 space-y-2.5">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-dark-bg/80 hover:bg-dark-card border border-dark-border/80 text-xs text-gray-300 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Universal Omnibox</span>
              </div>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-dark-card border border-dark-border text-gray-400">
                Ctrl+K
              </kbd>
            </button>

            {currentTrack ? (
              <div
                onClick={() => setIsSongPopupOpen(true)}
                data-apple-cursor="song-card"
                className="apple-gloss-card p-2.5 rounded-xl border border-dark-border hover:border-white/30 transition-all cursor-pointer group shadow-sm"
                title="Open Now Playing Song Popup"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div
                    data-apple-cursor="song-icon"
                    className="apple-gloss-icon w-8 h-8 rounded-lg flex-shrink-0"
                  >
                    <img
                      src={currentTrack.coverUrl}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="apple-sheen-sweep" />
                  </div>
                  <div className="truncate flex-1" data-apple-cursor="song-label">
                    <div className="apple-gloss-label apple-gloss-title text-xs font-bold text-white truncate">{currentTrack.title}</div>
                    <div className="text-[10px] text-gray-400 truncate group-hover:text-gray-200 transition-colors">{currentTrack.artist}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                  <span className="flex items-center gap-1 text-cyan-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    320k Lossless
                  </span>
                  <span className="text-accent group-hover:underline">Song Popup →</span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-dark-card/40 border border-dark-border/40 text-[10px] text-gray-400 text-center font-mono">
                Spotify • JioSaavn • YouTube
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area - Expansive Full-Screen Canvas with Zero Wasted Space */}
        <main
          className={`flex-1 overflow-y-auto p-3 sm:p-6 ${
            currentTrack ? 'pb-44 md:pb-32' : 'pb-24 md:pb-16'
          }`}
        >
          <div
            className={`${
              isWideCanvas ? 'w-full max-w-none px-1 sm:px-4' : 'max-w-[1600px] mx-auto w-full'
            } transition-all duration-300`}
          >
            {/* 📡 Offline Mode Alert Banner (when device is disconnected & not on offline tab) */}
            {!isOnline && activeTab !== 'offline' && (
              <div className="mb-4 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-transparent border border-amber-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-amber-200 shadow-md animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                  <span>
                    <strong>Offline Mode:</strong> Zero network connection. All {downloadedTrackIds.size} downloaded tracks and playback engine are ready.
                  </span>
                </div>
                <button
                  onClick={() => handleNavigate('offline')}
                  className="px-3 py-1 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 border border-amber-500/40 text-amber-100 font-bold text-[11px] transition-colors self-start sm:self-auto"
                >
                  Go to Offline Library →
                </button>
              </div>
            )}

            {activeTab === 'home' && (
              <MusicHome
                onSelectPlaylist={plId => handleNavigate('playlists')}
                onOpenOffline={() => handleNavigate('offline')}
              />
            )}
            {activeTab === 'search' && <MusicSearch />}
            {activeTab === 'offline' && (
              <OfflineLibrary
                onBack={() => handleNavigate('home')}
                onExplore={() => handleNavigate('search')}
              />
            )}
            {activeTab === 'playlists' && (
              <PlaylistsView
                onSelectPlaylist={handleSelectPlaylist}
                onOpenLikedSongs={() => handleNavigate('liked')}
              />
            )}
            {activeTab === 'playlist-detail' && selectedPlaylist && (
              <PlaylistDetailView
                playlist={selectedPlaylist}
                onBack={() => handleNavigate('playlists')}
                onUpdatePlaylist={updated => setSelectedPlaylist(updated)}
              />
            )}
            {activeTab === 'liked' && (
              <LikedTracksView onBack={() => handleNavigate('playlists')} />
            )}
          </div>
        </main>
      </div>

      {/* 📱 Mobile Bottom Navigation Dock (Home, Search, Offline, Library) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-14 bg-dark-secondary/95 backdrop-blur-2xl border-t border-white/10 px-4 flex items-center justify-around text-xs font-medium shadow-2xl">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'search', label: 'Search', icon: Search },
          {
            id: 'offline',
            label: 'Offline',
            icon: DownloadCloud,
            badge: downloadedTrackIds.size > 0 ? String(downloadedTrackIds.size) : undefined,
          },
          { id: 'playlists', label: 'Library', icon: ListMusic },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id as MusicSubTab)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all relative ${
                isActive ? 'text-accent font-bold scale-105' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{item.label}</span>
              {item.badge && (
                <span className="absolute top-0 right-1 px-1 rounded-full text-[8px] font-mono bg-emerald-500 text-black font-extrabold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Persistent Bottom Audio Player Bar */}
      <PlayerBar />
    </div>
  );
};
