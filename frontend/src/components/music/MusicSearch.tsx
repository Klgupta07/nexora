import React, { useState, useEffect } from 'react';
import { Search, Play, Heart, Plus, Sparkles, Globe, DownloadCloud, Check, WifiOff } from 'lucide-react';
import { musicApi } from '../../services/musicApi';
import { offlineStorage } from '../../services/offlineStorage';
import { Track } from '../../types';
import { useMusicPlayer } from '../../context/MusicPlayerContext';

export const MusicSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<'all' | 'spotify' | 'saavn' | 'youtube' | 'catalog' | 'offline'>('all');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const {
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    likedTrackIds,
    toggleLike,
    addToQueue,
    downloadTrackOffline,
    downloadedTrackIds,
    downloadingTrackIds,
    isOnline,
  } = useMusicPlayer();

  const languages = [
    { id: 'Hindi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', color: 'from-orange-500 to-amber-700', subtitle: 'Bollywood & Sufi' },
    { id: 'Punjabi', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '⚡', color: 'from-yellow-500 to-amber-600', subtitle: 'Desi Trap & Drill' },
    { id: 'Spanish', name: 'Spanish', native: 'Español', flag: '🇪🇸', color: 'from-red-500 to-rose-700', subtitle: 'Reggaeton & Dembow' },
    { id: 'Korean', name: 'Korean', native: '한국어', flag: '🇰🇷', color: 'from-pink-500 to-fuchsia-700', subtitle: 'K-Pop & Hallyu Wave' },
    { id: 'Japanese', name: 'Japanese', native: '日本語', flag: '🇯🇵', color: 'from-rose-500 to-red-800', subtitle: 'Anime & Tokyo City Pop' },
    { id: 'Tamil', name: 'Tamil', native: 'தமிழ்', flag: '🪕', color: 'from-amber-600 to-red-700', subtitle: 'Kollywood & Kuthu' },
    { id: 'Telugu', name: 'Telugu', native: 'తెలుగు', flag: '🪘', color: 'from-orange-500 to-amber-600', subtitle: 'Tollywood Mass Beats' },
    { id: 'French', name: 'French', native: 'Français', flag: '🇫🇷', color: 'from-blue-600 to-indigo-800', subtitle: 'French Touch & Pop' },
    { id: 'Arabic', name: 'Arabic', native: 'العربية', flag: '🌙', color: 'from-emerald-600 to-teal-800', subtitle: 'Oud & Rai Grooves' },
    { id: 'English', name: 'English', native: 'Global', flag: '🌍', color: 'from-cyan-600 to-blue-700', subtitle: 'Pop & Synthwave' },
  ];

  const genres = [
    { name: 'Bollywood', color: 'from-amber-500 to-orange-700' },
    { name: 'K-Pop', color: 'from-pink-500 to-rose-600' },
    { name: 'Reggaeton', color: 'from-red-600 to-amber-700' },
    { name: 'Anime OST', color: 'from-purple-600 to-indigo-800' },
    { name: 'Pop', color: 'from-fuchsia-600 to-purple-800' },
    { name: 'Synthwave', color: 'from-cyan-600 to-teal-800' },
    { name: 'Lo-Fi', color: 'from-indigo-600 to-blue-800' },
    { name: 'Hip-Hop', color: 'from-purple-600 to-indigo-900' },
    { name: 'Electronic', color: 'from-blue-500 to-cyan-700' },
    { name: 'Rock', color: 'from-red-600 to-orange-800' },
    { name: 'R&B', color: 'from-amber-600 to-pink-700' },
    { name: 'Sufi', color: 'from-teal-700 to-emerald-900' },
  ];

  const searchMusic = async (q: string, g?: string, l?: string, s?: string) => {
    setLoading(true);

    // If offline or if user explicitly chose the Offline Vault filter
    if (!navigator.onLine || s === 'offline') {
      try {
        const offlineList = await offlineStorage.getAllOfflineTracks();
        const lowerQ = (q || '').toLowerCase().trim();
        const lowerG = (g || '').toLowerCase().trim();
        const lowerL = (l || '').toLowerCase().trim();

        const filtered = offlineList
          .map(i => i.track)
          .filter(t => {
            const matchesQ =
              !lowerQ ||
              t.title.toLowerCase().includes(lowerQ) ||
              t.artist.toLowerCase().includes(lowerQ);
            const matchesG = !lowerG || t.genre?.toLowerCase().includes(lowerG);
            const matchesL = !lowerL || t.language?.toLowerCase().includes(lowerL);
            return matchesQ && matchesG && matchesL;
          });

        setTracks(filtered);
      } catch (err) {
        console.warn('Offline search error:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await musicApi.search(q, g, l, s);
      if (res.success && res.tracks) {
        setTracks(res.tracks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchMusic(query, selectedGenre, selectedLanguage, selectedSource);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, selectedGenre, selectedLanguage, selectedSource]);

  useEffect(() => {
    const handleSetLang = (e: any) => {
      if (e.detail) {
        setSelectedLanguage(e.detail);
      }
    };
    window.addEventListener('nexora:search-language', handleSetLang);
    return () => window.removeEventListener('nexora:search-language', handleSetLang);
  }, []);

  const handleTrackClick = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, tracks);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {!isOnline && (
        <div className="p-3 px-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-mono flex items-center justify-between max-w-2xl">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Device is offline. Searching your downloaded Offline Vault ({downloadedTrackIds.size} songs).</span>
          </div>
          <span className="text-[10px] font-bold text-amber-300">LOCAL INDEX</span>
        </div>
      )}

      {/* Search Input */}
      <div className="space-y-2.5 max-w-2xl">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              if (selectedGenre) setSelectedGenre('');
              if (selectedLanguage) setSelectedLanguage('');
            }}
            placeholder="Search literally any song in the world (Taylor Swift, Arijit Singh, Bad Bunny, Drake)..."
            className="w-full pl-12 pr-16 py-3.5 bg-dark-card border border-dark-border/80 focus:border-accent/60 rounded-2xl text-white placeholder-gray-400 text-sm focus:outline-none shadow-sm transition-all font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {/* Source Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <span className="text-[11px] font-mono text-gray-400 font-semibold flex-shrink-0">
            PLATFORM:
          </span>
          <button
            onClick={() => setSelectedSource('all')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              selectedSource === 'all'
                ? 'bg-accent/20 border border-accent text-accent font-bold'
                : 'bg-dark-card/60 border border-dark-border/80 text-gray-400 hover:text-white'
            }`}
          >
            All Platforms
          </button>
          <button
            onClick={() => setSelectedSource('spotify')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedSource === 'spotify'
                ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-bold'
                : 'bg-dark-card/60 border border-dark-border/80 text-gray-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Spotify (Charts & Viral)</span>
          </button>
          <button
            onClick={() => setSelectedSource('saavn')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedSource === 'saavn'
                ? 'bg-teal-500/20 border border-teal-500 text-teal-400 font-bold'
                : 'bg-dark-card/60 border border-dark-border/80 text-gray-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>JioSaavn (Direct MP4/AAC)</span>
          </button>
          <button
            onClick={() => setSelectedSource('youtube')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedSource === 'youtube'
                ? 'bg-red-500/20 border border-red-500 text-red-400 font-bold'
                : 'bg-dark-card/60 border border-dark-border/80 text-gray-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>YouTube Music</span>
          </button>
          <button
            onClick={() => setSelectedSource('catalog')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              selectedSource === 'catalog'
                ? 'bg-purple-500/20 border border-purple-500 text-purple-300 font-bold'
                : 'bg-dark-card/60 border border-dark-border/80 text-gray-400 hover:text-white'
            }`}
          >
            Royalty Free
          </button>
          <button
            onClick={() => setSelectedSource('offline')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedSource === 'offline'
                ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-300 font-bold'
                : 'bg-dark-card/60 border border-dark-border/80 text-gray-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Offline Vault ({downloadedTrackIds.size})</span>
          </button>
        </div>
      </div>

      {/* Multi-Language Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1 font-semibold flex-shrink-0">
          <Globe className="w-3.5 h-3.5 text-accent" />
          <span>LANGUAGE:</span>
        </span>
        <button
          onClick={() => setSelectedLanguage('')}
          className={`px-3 py-1 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
            !selectedLanguage
              ? 'bg-accent/20 border border-accent text-accent font-bold'
              : 'bg-dark-card/60 border border-dark-border/80 text-gray-400 hover:text-white'
          }`}
        >
          All
        </button>
        {languages.map(l => {
          const isActive = selectedLanguage === l.id;
          return (
            <button
              key={l.id}
              onClick={() => {
                setSelectedLanguage(isActive ? '' : l.id);
                if (selectedGenre) setSelectedGenre('');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-accent/20 border border-accent text-white font-bold shadow-sm'
                  : 'bg-dark-card/60 border border-dark-border/80 text-gray-400 hover:text-white'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          );
        })}
      </div>

      {/* Multi-Language Discovery Grid (Shown when no search query) */}
      {!query && !selectedLanguage && !selectedGenre && (
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-sm font-bold font-mono uppercase text-gray-400 tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent" />
              <span>Browse By Language & Region</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {languages.map(l => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLanguage(l.id)}
                  className={`p-3.5 rounded-2xl text-left text-white font-bold transition-all bg-gradient-to-br ${l.color} hover:scale-105 hover:shadow-xl flex flex-col justify-between h-28 border border-white/15 relative overflow-hidden group`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl drop-shadow-sm">{l.flag}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/40 border border-white/20 backdrop-blur-md">
                      {l.native}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold tracking-tight group-hover:translate-x-0.5 transition-transform">
                      {l.name}
                    </div>
                    {l.subtitle && (
                      <div className="text-[10px] font-mono text-white/80 truncate mt-0.5">
                        {l.subtitle}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h2 className="text-sm font-bold font-mono uppercase text-gray-400 tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-light" />
              <span>Browse By Genre</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {genres.map(g => (
                <button
                  key={g.name}
                  onClick={() => {
                    setSelectedGenre(selectedGenre === g.name ? '' : g.name);
                  }}
                  className={`p-3 rounded-xl font-bold text-xs text-white transition-all text-left bg-gradient-to-br ${g.color} ${
                    selectedGenre === g.name
                      ? 'ring-2 ring-white scale-102 shadow-sm'
                      : 'opacity-90 hover:opacity-100 hover:scale-101'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search Results */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-gray-400">
          <span>
            {selectedLanguage
              ? `${selectedLanguage} Songs`
              : selectedGenre
              ? `${selectedGenre} Hits`
              : query
              ? `Results for "${query}"`
              : 'All Available Tracks'}
          </span>
          <span>{tracks.length} Tracks</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tracks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 rounded-2xl bg-dark-card/40 border border-dark-border/40">
            No matching tracks found. Try searching by artist, title, or language (e.g. "Hindi", "K-Pop", "Spanish", "Arijit").
          </div>
        ) : (
          <div className="space-y-1.5">
            {tracks.map(track => {
              const isCurrent = currentTrack?.id === track.id;
              const isLiked = likedTrackIds.has(track.id);
              return (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track)}
                  data-apple-cursor="song-card"
                  className={`apple-gloss-row p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                    isCurrent
                      ? 'bg-primary/25 border-primary/50 text-white'
                      : 'hover:border-accent/40 text-gray-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
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
                      <div className="flex items-center gap-2 truncate">
                        <span className={`apple-gloss-label apple-gloss-title text-xs font-semibold truncate ${isCurrent ? 'text-accent font-bold' : 'text-white'}`}>
                          {track.title}
                        </span>
                        {track.source === 'Spotify' || track.id.startsWith('sp-') ? (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0 font-bold">
                            SPOTIFY
                          </span>
                        ) : track.source === 'JioSaavn' ? (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-teal-500/20 text-teal-400 border border-teal-500/30 flex-shrink-0">
                            JIOSAAVN
                          </span>
                        ) : track.youtubeId ? (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-red-600/20 text-red-400 border border-red-500/30 flex-shrink-0 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-red-500" />
                            <span>YT MUSIC</span>
                          </span>
                        ) : null}
                        {track.language && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-dark-bg text-accent border border-dark-border flex-shrink-0">
                            {track.language}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate flex items-center gap-2">
                        <span>{track.artist}</span>
                        {track.duration ? (
                          <span className="text-[10px] font-mono text-gray-500">
                            • {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline px-2 py-0.5 rounded text-[10px] font-mono bg-dark-bg text-gray-400 border border-dark-border">
                      {track.source || 'Music'}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleLike(track);
                      }}
                      className={`p-1.5 transition-colors ${
                        isLiked ? 'text-rose-500' : 'text-gray-500 hover:text-white'
                      }`}
                      title={isLiked ? 'Remove from Liked' : 'Save to Liked'}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        downloadTrackOffline(track);
                      }}
                      disabled={downloadingTrackIds.has(track.id)}
                      className={`p-1.5 transition-colors ${
                        downloadedTrackIds.has(track.id)
                          ? 'text-emerald-400'
                          : downloadingTrackIds.has(track.id)
                          ? 'text-accent animate-spin'
                          : 'text-gray-500 hover:text-white'
                      }`}
                      title={downloadedTrackIds.has(track.id) ? 'Downloaded Offline' : 'Download for Offline Playback'}
                    >
                      {downloadedTrackIds.has(track.id) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <DownloadCloud className="w-4 h-4" />
                      )}
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
    </div>
  );
};
