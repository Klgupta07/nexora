import React, { useState } from 'react';
import { Play, ArrowLeft, Heart, Trash2, Plus, Clock, Disc } from 'lucide-react';
import { Playlist, Track } from '../../types';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { musicApi } from '../../services/musicApi';
import { useNotification } from '../../context/NotificationContext';

interface Props {
  playlist: Playlist;
  onBack: () => void;
  onUpdatePlaylist?: (updated: Playlist) => void;
}

export const PlaylistDetailView: React.FC<Props> = ({ playlist, onBack, onUpdatePlaylist }) => {
  const [currentPl, setCurrentPl] = useState<Playlist>(playlist);
  const { playTrack, currentTrack, isPlaying, togglePlay, likedTrackIds, toggleLike, addToQueue } = useMusicPlayer();
  const { addNotification } = useNotification();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const totalDuration = currentPl.tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  const handlePlayAll = () => {
    if (currentPl.tracks.length > 0) {
      playTrack(currentPl.tracks[0], currentPl.tracks);
      addNotification({
        type: 'success',
        title: 'Playing Playlist',
        message: currentPl.name,
      });
    }
  };

  const handleRemoveTrack = async (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await musicApi.removeTrackFromPlaylist(currentPl.id, trackId);
      if (res.success && res.data) {
        setCurrentPl(res.data);
        if (onUpdatePlaylist) onUpdatePlaylist(res.data);
        addNotification({ type: 'info', title: 'Track removed from playlist' });
      }
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Error', message: err.message });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO PLAYLISTS</span>
      </button>

      {/* Playlist Hero Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 rounded-3xl bg-gradient-to-r from-dark-card to-dark-secondary border border-dark-border">
        <img
          src={currentPl.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'}
          alt={currentPl.name}
          className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl object-cover shadow-2xl flex-shrink-0 border border-dark-border"
        />

        <div className="space-y-3 text-center sm:text-left">
          <span className="text-xs font-mono text-accent uppercase tracking-widest">
            PLAYLIST COLLECTION
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {currentPl.name}
          </h1>
          <p className="text-xs text-gray-300 max-w-lg leading-relaxed">
            {currentPl.description || 'Curated audio selection'}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono text-gray-400 pt-2">
            <span>{currentPl.tracks.length} Songs</span>
            <span>•</span>
            <span>{Math.round(totalDuration / 60)} Minutes</span>
          </div>

          <div className="pt-2">
            <button
              onClick={handlePlayAll}
              disabled={currentPl.tracks.length === 0}
              className="px-6 py-3 rounded-full bg-white hover:bg-gray-100 text-black font-bold text-xs tracking-wider flex items-center gap-2.5 shadow-glow-primary transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>PLAY ALL</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tracks Table */}
      {currentPl.tracks.length === 0 ? (
        <div className="text-center py-16 bg-dark-card rounded-2xl border border-dark-border p-6 text-gray-400 text-xs">
          <Disc className="w-10 h-10 mx-auto mb-2 text-gray-600" />
          This playlist is currently empty. Add tracks from the Search or Home discovery feed!
        </div>
      ) : (
        <div className="rounded-2xl bg-dark-card border border-dark-border overflow-hidden divide-y divide-dark-border/40">
          {currentPl.tracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const isLiked = likedTrackIds.has(track.id);

            return (
              <div
                key={track.id}
                onClick={() => {
                  if (isCurrent) togglePlay();
                  else playTrack(track, currentPl.tracks);
                }}
                data-apple-cursor="song-card"
                className={`apple-gloss-row px-4 py-3 flex items-center justify-between gap-4 transition-all cursor-pointer group ${
                  isCurrent ? 'bg-primary/20 border-primary/50 text-white' : 'hover:border-accent/40'
                }`}
              >
                <div className="flex items-center gap-3.5 truncate">
                  <span className="w-5 text-center text-xs font-mono text-gray-500 group-hover:hidden">
                    {idx + 1}
                  </span>
                  <button className="w-5 text-center text-xs text-white hidden group-hover:block">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <div
                    data-apple-cursor="song-icon"
                    className="apple-gloss-icon w-10 h-10 rounded-lg flex-shrink-0"
                  >
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="apple-sheen-sweep" />
                  </div>

                  <div className="truncate" data-apple-cursor="song-label">
                    <div className={`apple-gloss-label apple-gloss-title text-xs sm:text-sm font-semibold truncate ${
                      isCurrent ? 'text-primary-light font-bold' : 'text-white'
                    }`}>
                      {track.title}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate group-hover:text-gray-200 transition-colors">{track.artist}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
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

                  <button
                    onClick={e => handleRemoveTrack(track.id, e)}
                    className="p-1.5 text-gray-500 hover:text-rose-400"
                    title="Remove from playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-10 text-right">{formatDuration(track.duration)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

