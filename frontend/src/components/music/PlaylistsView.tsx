import React, { useState, useEffect } from 'react';
import { ListMusic, Plus, Play, Trash2, Edit2, Disc, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { musicApi } from '../../services/musicApi';
import { Playlist, Track } from '../../types';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { useNotification } from '../../context/NotificationContext';

interface Props {
  onSelectPlaylist?: (playlist: Playlist) => void;
  onOpenLikedSongs?: () => void;
}

export const PlaylistsView: React.FC<Props> = ({ onSelectPlaylist, onOpenLikedSongs }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const { playTrack, likedTrackIds } = useMusicPlayer();
  const { addNotification } = useNotification();

  const loadPlaylists = async () => {
    try {
      const res = await musicApi.getUserPlaylists();
      if (res.success && res.data) {
        setPlaylists(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      const res = await musicApi.createPlaylist(newPlaylistName, newPlaylistDesc);
      if (res.success && res.data) {
        setPlaylists(prev => [res.data, ...prev]);
        setIsCreateModalOpen(false);
        setNewPlaylistName('');
        setNewPlaylistDesc('');
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        addNotification({
          type: 'success',
          title: 'Playlist Created',
          message: res.data.name,
        });
      }
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: err.message,
      });
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this playlist?')) return;

    try {
      await musicApi.deletePlaylist(id);
      setPlaylists(prev => prev.filter(p => p.id !== id));
      addNotification({ type: 'info', title: 'Playlist Deleted' });
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Delete Failed', message: err.message });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-light text-sm font-mono mb-1">
            <ListMusic className="w-4 h-4 text-primary" />
            <span>PERSONAL LIBRARY</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Your Playlists & Collections</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenLikedSongs}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500/20 to-purple-500/20 hover:from-rose-500/30 hover:to-purple-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all shadow-sm"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>Liked Songs ({likedTrackIds.size})</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-semibold text-xs tracking-wide shadow-glow-primary transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>Create Playlist</span>
          </button>
        </div>
      </div>

      {/* Grid of Playlists */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 text-xs">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
          Loading playlists...
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-20 bg-dark-card rounded-3xl border border-dark-border p-8">
          <Disc className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No playlists yet</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Create your first collection to organize your favorite tracks during reconnaissance operations.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
          >
            Create Playlist Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.map(pl => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist && onSelectPlaylist(pl)}
              data-apple-cursor="song-card"
              className="apple-gloss-card p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div
                  data-apple-cursor="song-icon"
                  className="apple-gloss-icon relative mb-3 aspect-square rounded-xl overflow-hidden bg-dark-secondary"
                >
                  <img
                    src={pl.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'}
                    alt={pl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="apple-sheen-sweep" />
                  {pl.tracks.length > 0 && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        playTrack(pl.tracks[0], pl.tracks);
                      }}
                      className="apple-gloss-play absolute right-3 bottom-3 w-11 h-11 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:scale-105"
                      title="Play Playlist"
                    >
                      <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
                    </button>
                  )}
                </div>

                <div data-apple-cursor="song-label">
                  <h3 className="apple-gloss-label apple-gloss-title font-bold text-white text-sm truncate transition-colors">
                    {pl.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {pl.description || 'Personal playlist'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-dark-border/40 flex items-center justify-between text-xs text-gray-500 font-mono">
                <span>{pl.tracks.length} Tracks</span>
                <button
                  onClick={e => handleDelete(pl.id, e)}
                  className="p-1 hover:text-rose-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-dark-secondary border border-dark-border rounded-2xl p-6 text-white shadow-2xl">
            <h3 className="text-lg font-bold">Create New Playlist</h3>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Add a name and description to curate your stream
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Playlist Name</label>
                <input
                  type="text"
                  required
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                  placeholder="e.g. Midnight Cyber Synth"
                  className="w-full px-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={newPlaylistDesc}
                  onChange={e => setNewPlaylistDesc(e.target.value)}
                  placeholder="Atmospheric soundscapes for deep concentration..."
                  className="w-full px-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-dark-hover hover:bg-dark-border text-xs text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-xs shadow-glow-primary"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

