import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Maximize2,
  DownloadCloud,
  Check,
  Disc,
  Sliders,
} from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';

export const PlayerBar: React.FC = () => {
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
    isQueueOpen,
    setIsQueueOpen,
    isSongPopupOpen,
    toggleSongPopup,
  } = useMusicPlayer();

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.has(currentTrack.id);
  const isDownloaded = downloadedTrackIds.has(currentTrack.id);
  const isDownloading = downloadingTrackIds.has(currentTrack.id);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="fixed bottom-14 md:bottom-0 left-0 right-0 h-20 sm:h-24 bg-dark-secondary/60 backdrop-blur-3xl border-t border-white/20 z-40 px-3 sm:px-6 flex items-center justify-between text-white shadow-2xl">
      {/* Left: Track Information */}
      <div className="flex items-center gap-3 w-1/4 min-w-[160px] max-w-[280px]">
        <div
          data-apple-cursor="song-icon"
          onClick={toggleSongPopup}
          className="apple-gloss-icon w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex-shrink-0 cursor-pointer shadow-md"
          title="Open Song Popup"
        >
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
          <div className="apple-sheen-sweep" />
        </div>
        <div className="truncate" data-apple-cursor="song-label">
          <div
            onClick={toggleSongPopup}
            className="apple-gloss-label apple-gloss-title text-xs sm:text-sm font-semibold truncate cursor-pointer flex items-center gap-1.5"
            title="Open Song Popup"
          >
            <span className="truncate">{currentTrack.title}</span>
            {isOfflinePlaying ? (
              <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span>OFFLINE LOCAL</span>
              </span>
            ) : currentTrack.source === 'Spotify' || currentTrack.id.startsWith('sp-') ? (
              <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0 font-bold">
                SPOTIFY
              </span>
            ) : currentTrack.source === 'JioSaavn' ? (
              <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-teal-500/20 text-teal-400 border border-teal-500/30 flex-shrink-0">
                JIOSAAVN
              </span>
            ) : currentTrack.youtubeId ? (
              <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-red-600/20 text-red-400 border border-red-500/30 flex-shrink-0 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                <span>YT MUSIC</span>
              </span>
            ) : null}
          </div>
          <div className="text-[11px] sm:text-xs text-gray-400 truncate hover:text-white transition-colors cursor-pointer">
            {currentTrack.artist}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => toggleLike(currentTrack)}
            className={`p-1.5 transition-colors ${
              isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-white'
            }`}
            title={isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => downloadTrackOffline(currentTrack)}
            disabled={isDownloading}
            className={`p-1.5 transition-colors ${
              isDownloaded
                ? 'text-emerald-400'
                : isDownloading
                ? 'text-accent animate-spin'
                : 'text-gray-400 hover:text-white'
            }`}
            title={
              isDownloaded
                ? 'Downloaded Offline (Click to remove)'
                : isDownloading
                ? 'Downloading...'
                : 'Download for Offline Playback'
            }
          >
            {isDownloaded ? (
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <DownloadCloud className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Center: Controls & Seek Bar */}
      <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1 max-w-xl mx-2 sm:mx-6">
        {/* Buttons */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 transition-colors ${
              isShuffle ? 'text-primary' : 'text-gray-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prevTrack}
            className="text-gray-300 hover:text-white transition-colors p-1"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center transition-transform shadow-glow-primary"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            ) : (
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="text-gray-300 hover:text-white transition-colors p-1"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-1.5 transition-colors ${
              repeatMode !== 'off' ? 'text-primary' : 'text-gray-400 hover:text-white'
            }`}
            title={`Repeat (${repeatMode})`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrubber Time Bar */}
        <div className="w-full flex items-center gap-2 text-[10px] sm:text-xs text-gray-400 font-mono">
          <span className="w-9 text-right">{formatTime(currentTime)}</span>
          <div className="relative flex-1 flex items-center group">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onChange={handleSeekChange}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary group-hover:h-1.5 transition-all"
            />
          </div>
          <span className="w-9 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume & Extra Controls */}
      <div className="flex items-center gap-2 sm:gap-3 justify-end w-1/4 min-w-[120px]">
        {/* Audiophile Master DSP Button */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('nexora:open-dsp'))}
          className="p-1.5 text-cyan-400 hover:text-cyan-300 transition-colors relative"
          title="Open Audiophile Master DSP (320kbps Lossless Equalizer & Spatial 3D Audio)"
        >
          <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        </button>

        {/* Queue Drawer Button */}
        <button
          onClick={() => setIsQueueOpen(!isQueueOpen)}
          className={`p-1.5 transition-colors ${
            isQueueOpen ? 'text-primary' : 'text-gray-400 hover:text-white'
          }`}
          title="Queue"
        >
          <ListMusic className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Volume */}
        <div className="hidden sm:flex items-center gap-2">
          <button onClick={toggleMute} className="text-gray-400 hover:text-white p-1">
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 lg:w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            title="Volume"
          />
        </div>

        {/* Now Playing Song Popup Button */}
        <button
          onClick={toggleSongPopup}
          className={`p-1.5 transition-colors ${
            isSongPopupOpen ? 'text-accent' : 'text-gray-400 hover:text-white'
          }`}
          title={isSongPopupOpen ? 'Close Song Popup' : 'Open Song Popup'}
        >
          <Disc className={`w-4 h-4 sm:w-5 sm:h-5 ${isPlaying ? 'animate-spin-slow' : ''}`} />
        </button>

        {/* Fullscreen Visualizer Button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="p-1.5 text-gray-400 hover:text-white transition-colors"
          title="Fullscreen Visualizer"
        >
          <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};
