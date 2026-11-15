import React, { useState, useEffect } from 'react';
import { Heart, Play, ArrowLeft, Plus } from 'lucide-react';
import { Track } from '../../types';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { musicApi } from '../../services/musicApi';

interface Props {
  onBack: () => void;
}

export const LikedTracksView: React.FC<Props> = ({ onBack }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying, togglePlay, likedTrackIds, toggleLike, addToQueue } = useMusicPlayer();

  useEffect(() => {
    musicApi.getLikedTracks()
      .then(res => {
        if (res.success && res.data) {
          setTracks(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [likedTrackIds]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO LIBRARY</span>
      </button>

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-dark-secondary border border-rose-500/20">
        <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center shadow-2xl flex-shrink-0 text-white">
          <Heart className="w-20 h-20 fill-current" />
        </div>

        <div className="space-y-3 text-center sm:text-left">
          <span className="text-xs font-mono text-rose-400 uppercase tracking-widest">
            FAVORITES COLLECTION
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Liked Songs
          </h1>
          <p className="text-xs text-gray-300">
            {tracks.length} Saved Audio Tracks
          </p>

          <div className="pt-2">
            <button
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
              className="px-6 py-3 rounded-full bg-white hover:bg-gray-100 text-black font-bold text-xs tracking-wider flex items-center gap-2.5 shadow-glow-primary transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>PLAY LIKED SONGS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Track List */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-xs">
          Loading favorites...
        </div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-20 bg-dark-card rounded-2xl border border-dark-border p-6 text-gray-400 text-xs">
          <Heart className="w-10 h-10 mx-auto mb-2 text-gray-600" />
          You haven't liked any songs yet. Click the heart icon on any track to save it here!
        </div>
      ) : (
        <div className="rounded-2xl bg-dark-card border border-dark-border overflow-hidden divide-y divide-dark-border/40">
          {tracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;

            return (
              <div
                key={track.id}
                onClick={() => {
                  if (isCurrent) togglePlay();
                  else playTrack(track, tracks);
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
                    className="p-1.5 text-rose-500 transition-colors"
                  >
                    <Heart className="w-4 h-4 fill-current" />
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

