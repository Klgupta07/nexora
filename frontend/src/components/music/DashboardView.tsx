import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  Radio,
  Zap,
  HardDrive,
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Sliders,
  Volume2,
  DownloadCloud,
  Layers,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Disc,
} from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { useCustomization } from '../../context/ThemeContext';
import { useBeatSync } from '../../hooks/useBeatSync';
import { StreamTelemetry, DashboardStats } from '../../types';

interface Props {
  onNavigateTab?: (tab: string) => void;
  onOpenSettings?: () => void;
}

export const DashboardView: React.FC<Props> = ({ onNavigateTab, onOpenSettings }) => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    downloadedTrackIds,
    downloadTrackOffline,
    history,
  } = useMusicPlayer();

  const { settings } = useCustomization();
  const { bpm, energy, isBeat, beatCount, spectralBands } = useBeatSync({ sensitivity: 1.1, bandCount: 16 });

  // Stream Telemetry
  const telemetry: StreamTelemetry = {
    bitrateKbps: 320,
    sampleRateHz: 48000,
    bufferHealthPct: isPlaying ? 98 : 100,
    latencyMs: 14,
    activeProvider: currentTrack?.source?.toUpperCase() || 'MULTI-ENGINE',
    codec: 'AAC-LC / Ogg Opus 24-bit',
    droppedFrames: 0,
  };

  const [activeVisualizerMode, setActiveVisualizerMode] = useState<'spectrum' | 'waveform' | 'matrix'>('spectrum');

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Banner: Telemetry & Engine Overview */}
      <div className="relative overflow-hidden rounded-3xl bg-dark-card border border-dark-border/90 p-6 sm:p-7 shadow-xl">
        <div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-15 filter blur-3xl pointer-events-none transition-all duration-700"
          style={{
            backgroundColor: settings.primaryHex,
            transform: isBeat ? 'scale(1.2)' : 'scale(1.0)',
          }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider text-accent uppercase">
                CHILLMODE AUDIO COCKPIT & ENGINE DASHBOARD
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Streaming Telemetry</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-primary/20 text-primary border border-primary/30">
                PRO ENGINE
              </span>
            </h1>
            <p className="text-xs text-gray-400 max-w-xl">
              Real-time multi-source audio synthesis monitoring across Spotify charts, JioSaavn direct streaming, and YouTube audio.
            </p>
          </div>

          {/* Quick Metrics Cluster */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-dark-bg/80 border border-dark-border/70 text-left">
              <div className="text-[10px] font-mono text-gray-400">BITRATE</div>
              <div className="text-sm font-mono font-extrabold text-white">{telemetry.bitrateKbps} kbps</div>
              <div className="text-[9px] font-mono text-emerald-400">Extreme Fidelity</div>
            </div>

            <div className="p-3 rounded-2xl bg-dark-bg/80 border border-dark-border/70 text-left">
              <div className="text-[10px] font-mono text-gray-400">SAMPLE RATE</div>
              <div className="text-sm font-mono font-extrabold text-white">48.0 kHz</div>
              <div className="text-[9px] font-mono text-cyan-400">Studio Depth</div>
            </div>

            <div className="p-3 rounded-2xl bg-dark-bg/80 border border-dark-border/70 text-left">
              <div className="text-[10px] font-mono text-gray-400">BEAT SYNC</div>
              <div className="text-sm font-mono font-extrabold text-white">{bpm} BPM</div>
              <div className="text-[9px] font-mono text-accent">Phase Locked</div>
            </div>

            <div className="p-3 rounded-2xl bg-dark-bg/80 border border-dark-border/70 text-left">
              <div className="text-[10px] font-mono text-gray-400">OFFLINE CACHE</div>
              <div className="text-sm font-mono font-extrabold text-white">{downloadedTrackIds.size} Tracks</div>
              <div className="text-[9px] font-mono text-emerald-400">IndexedDB Blob</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Visualizer Cockpit + Audio Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time Audio Spectrum & Beat-Sync Console */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-dark-card border border-dark-border/90 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-dark-border/60">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-black font-bold shadow-sm"
                  style={{ backgroundColor: settings.primaryHex }}
                >
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Live Beat-Sync Spectrum Analyzer</h3>
                  <p className="text-[11px] font-mono text-gray-400">
                    Energy: {Math.round(energy * 100)}% • Beat #{beatCount}
                  </p>
                </div>
              </div>

              {/* Visualizer Mode Switcher */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-dark-bg border border-dark-border/80 text-[10px] font-mono">
                {(['spectrum', 'waveform', 'matrix'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setActiveVisualizerMode(mode)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                      activeVisualizerMode === mode
                        ? 'bg-accent/20 text-accent font-bold border border-accent/40 shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Interactive Spectrum Graphic */}
            <div className="relative h-44 rounded-2xl bg-dark-bg/90 border border-dark-border/80 p-4 flex items-end justify-between gap-1.5 sm:gap-2 overflow-hidden">
              {/* Background Cyber Grid */}
              <div className="absolute inset-0 cyber-grid-pattern opacity-15 pointer-events-none" />

              {/* Spectral Frequency Columns */}
              {spectralBands.map((level, i) => {
                const heightPct = Math.max(8, Math.min(100, level * 100));
                return (
                  <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-1 relative z-10">
                    <div
                      className="w-full rounded-t-md transition-all duration-75 relative group"
                      style={{
                        height: `${heightPct}%`,
                        background: isBeat
                          ? `linear-gradient(180deg, ${settings.accentHex}, ${settings.primaryHex})`
                          : `linear-gradient(180deg, ${settings.primaryHex}, #3b82f6)`,
                        boxShadow: isBeat ? `0 0 12px var(--color-primary-glow)` : 'none',
                      }}
                    >
                      {/* Top Peak Cap */}
                      <div className="w-full h-1 bg-white/80 rounded-t-md opacity-75" />
                    </div>
                    <span className="text-[8px] font-mono text-gray-500 hidden sm:block">
                      {i === 0 ? 'BASS' : i === 7 ? 'MID' : i === 15 ? 'TREB' : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Rhythm Pulse Status Bar */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-dark-bg/60 border border-dark-border/60 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full transition-transform duration-100 ${
                    isBeat ? 'scale-125 bg-accent shadow-glow-accent' : 'scale-90 bg-gray-600'
                  }`}
                />
                <span className="text-gray-300 font-bold">Rhythm Sensor:</span>
                <span className={isBeat ? 'text-accent font-bold' : 'text-gray-400'}>
                  {isBeat ? '⚡ DOWNBEAT DROP' : 'Holding cadence'}
                </span>
              </div>
              <span className="text-gray-500">
                Lat: <span className="text-white font-bold">{telemetry.latencyMs}ms</span>
              </span>
            </div>
          </div>

          {/* Engine Status & APIs Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Spotify Charts</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-gray-400">Global Top 50, Viral Hits & Playlist Embed Scraper</p>
              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE • 100% HEALTH
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">JioSaavn Engine</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-gray-400">Direct High-Bitrate AAC / MP4 Audio Streams & Lyrics</p>
              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE • DIRECT AAC
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">YouTube Audio Bridge</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-gray-400">Universal Catalog Fallback & Video Visualizer</p>
              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE • WEBAUDIO
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Audio Deck Focus & Controls */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-dark-card border border-dark-border/90 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
              <span className="text-xs font-mono font-bold text-accent uppercase">CURRENT AUDIO DECK</span>
              <span className="text-[10px] font-mono text-gray-400">DECK 01</span>
            </div>

            {currentTrack ? (
              <div className="space-y-4">
                <div className="relative group rounded-2xl overflow-hidden aspect-square border border-white/20 shadow-xl">
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4"
                  >
                    <div>
                      <div className="text-sm font-bold text-white truncate">{currentTrack.title}</div>
                      <div className="text-xs text-gray-300 truncate">{currentTrack.artist}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Source:</span>
                    <span className="text-white font-bold">{currentTrack.source || 'CHILLMODE Stream'}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Genre:</span>
                    <span className="text-white font-bold">{currentTrack.genre || 'Multi-Genre'}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>BPM Cadence:</span>
                    <span className="text-accent font-bold">{bpm} BPM</span>
                  </div>
                </div>

                {/* Deck Transport Buttons */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={prevTrack}
                    className="p-2.5 rounded-xl bg-dark-bg hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white transition-colors"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-black font-extrabold shadow-glow-primary transition-transform hover:scale-105"
                    style={{ backgroundColor: settings.primaryHex }}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={nextTrack}
                    className="p-2.5 rounded-xl bg-dark-bg hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white transition-colors"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => downloadTrackOffline(currentTrack)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>Download for 100% Offline Playback</span>
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 space-y-3">
                <Disc className="w-12 h-12 mx-auto text-gray-600 animate-spin" />
                <p className="text-xs font-mono">No audio currently queued on deck.</p>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('home')}
                  className="px-4 py-2 rounded-xl bg-primary text-black font-bold text-xs"
                >
                  Explore Home Feed
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

