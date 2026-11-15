import React, { useEffect } from 'react';
import {
  X,
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
  ListMusic,
  Trash2,
} from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';

export const FullscreenPlayer: React.FC = () => {
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
    queue,
    isFullscreen,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    removeFromQueue,
    clearQueue,
    setIsFullscreen,
  } = useMusicPlayer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        togglePlay();
      }
    };
    if (isFullscreen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, setIsFullscreen, togglePlay]);

  if (!isFullscreen || !currentTrack) return null;

  const isLiked = likedTrackIds.has(currentTrack.id);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070A12] flex flex-col justify-between p-6 sm:p-12 overflow-hidden animate-fade-in text-white">
      {/* Blurred Album Artwork Ambient Glow */}
      <div
        className="absolute inset-0 opacity-20 filter blur-3xl scale-125 pointer-events-none transition-all duration-1000"
        style={{
          backgroundImage: `url(${currentTrack.coverUrl})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono uppercase tracking-widest text-primary-light">
            CHILLMODE HIGH-FIDELITY AUDIO ENGINE
          </span>
        </div>

        <button
          onClick={() => setIsFullscreen(false)}
          className="p-2 rounded-full bg-dark-card/60 hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white transition-colors"
          title="Exit Fullscreen (Esc)"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Center Layout: Cover Art, Animated Audio Waves & Track Info */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 my-auto">
        {/* Cover Art with Animated Audio Waves */}
        <div className="relative group">
          <div
            data-apple-cursor="song-icon"
            className="apple-gloss-icon w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl border border-white/20"
          >
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="apple-sheen-sweep" />
          </div>
          {/* Animated sound wave bars indicator */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-end gap-1.5 px-4 py-2 rounded-full bg-dark-bg/90 border border-dark-border shadow-lg">
            {[40, 75, 55, 90, 60, 85, 45, 100, 65, 80, 50, 70].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-primary to-accent rounded-full transition-all duration-300"
                style={{
                  height: isPlaying ? `${Math.max(8, (h * (0.4 + (i % 3) * 0.3)))}px` : '6px',
                  animation: isPlaying ? `wave 1.${(i % 5) + 1}s ease-in-out infinite` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Track Metadata & Queue Drawer */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-lg space-y-4">
          <div className="space-y-1" data-apple-cursor="song-label">
            <span className="text-xs font-mono text-accent uppercase tracking-wider">
              {currentTrack.genre || 'Electronic Soundscape'}
            </span>
            <h1 className="apple-gloss-label apple-gloss-title text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {currentTrack.title}
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 font-medium group-hover:text-white transition-colors">
              {currentTrack.artist}
            </p>
            {currentTrack.album && (
              <p className="text-xs text-gray-500 font-mono">
                Album: {currentTrack.album}
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-dark-card/60 border border-dark-border/60 text-xs text-gray-400 space-y-1">
            <div>License: <strong className="text-gray-300">{currentTrack.license || 'Creative Commons / Royalty Free'}</strong></div>
            <div>Source: <span className="text-accent">{currentTrack.source || 'Jamendo Legal Stream'}</span></div>
          </div>

          {/* Queue Section in Fullscreen */}
          {queue.length > 0 && (
            <div className="w-full pt-4 border-t border-dark-border/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                <div className="flex items-center gap-1.5">
                  <ListMusic className="w-4 h-4 text-primary" />
                  <span>UP NEXT IN QUEUE ({queue.length})</span>
                </div>
                <button onClick={clearQueue} className="text-rose-400 hover:underline">
                  Clear
                </button>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {queue.slice(0, 3).map((qTrack, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-dark-card/40 border border-dark-border/40"
                  >
                    <div className="truncate text-left">
                      <div className="text-white font-medium truncate">{qTrack.title}</div>
                      <div className="text-[11px] text-gray-400 truncate">{qTrack.artist}</div>
                    </div>
                    <button
                      onClick={() => removeFromQueue(idx)}
                      className="p-1 text-gray-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Large Controls & Scrubber */}
      <div className="relative z-10 max-w-2xl mx-auto w-full space-y-4">
        {/* Scrubber Time Bar */}
        <div className="w-full flex items-center gap-3 text-xs text-gray-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <div className="relative flex-1 flex items-center group">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onChange={e => seek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary group-hover:h-2 transition-all"
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => toggleLike(currentTrack)}
            className={`p-2 transition-colors ${
              isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          <div className="flex items-center gap-6">
            <button
              onClick={toggleShuffle}
              className={`p-2 transition-colors ${
                isShuffle ? 'text-primary' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button onClick={prevTrack} className="text-gray-300 hover:text-white p-2">
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center transition-transform shadow-glow-primary"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-1" />
              )}
            </button>

            <button onClick={nextTrack} className="text-gray-300 hover:text-white p-2">
              <SkipForward className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-2 transition-colors ${
                repeatMode !== 'off' ? 'text-primary' : 'text-gray-400 hover:text-white'
              }`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="text-gray-400 hover:text-white p-2">
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

