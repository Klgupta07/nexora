import { request } from './api';
import { Track, Album, Artist, Playlist } from '../types';

export interface LanguageCategory {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  color: string;
  description: string;
}

export interface HomeFeedData {
  trending: Track[];
  youtubeTrending?: Track[];
  jioSaavnTrending?: Track[];
  spotifyTopHits?: Track[];
  newReleases: Track[];
  popularAlbums: Album[];
  topArtists: Artist[];
  languages?: LanguageCategory[];
  trendingVideos?: Track[];
  recommendedPlaylists: Array<{
    id: string;
    name: string;
    description: string;
    coverUrl: string;
    trackCount: number;
  }>;
}

export const musicApi = {
  getHomeFeed: (options?: { refresh?: boolean; shuffle?: boolean }) => {
    const params = new URLSearchParams();
    if (options?.refresh) params.append('refresh', 'true');
    if (options?.shuffle) params.append('shuffle', 'true');
    params.append('_t', Date.now().toString());
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<{ success: boolean; refreshedAt?: string; isRefresh?: boolean; data: HomeFeedData }>(`/music/home${qs}`);
  },

  search: (query: string, genre?: string, language?: string, source?: string) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (genre) params.append('genre', genre);
    if (language) params.append('language', language);
    if (source) params.append('source', source);
    return request<{ success: boolean; tracks: Track[]; query: string; total: number }>(`/music/search?${params.toString()}`);
  },

  getSpotifyTopHits: (limit = 24) =>
    request<{ success: boolean; tracks: Track[]; total: number }>(`/music/spotify/trending?limit=${limit}`),

  searchSpotify: (query: string, limit = 25) =>
    request<{ success: boolean; tracks: Track[]; total: number }>(`/music/spotify/search?q=${encodeURIComponent(query)}&limit=${limit}`),

  getJioSaavnTrending: (limit = 24) =>
    request<{ success: boolean; tracks: Track[]; total: number }>(`/music/saavn/trending?limit=${limit}`),

  searchJioSaavn: (query: string, limit = 25) =>
    request<{ success: boolean; tracks: Track[]; total: number }>(`/music/saavn/search?q=${encodeURIComponent(query)}&limit=${limit}`),

  getLanguages: () =>
    request<{ success: boolean; data: LanguageCategory[] }>('/music/languages'),

  getTracksByLanguage: (language: string, limit = 50) =>
    request<{ success: boolean; language: string; tracks: Track[]; total: number }>(`/music/languages/${encodeURIComponent(language)}?limit=${limit}`),

  getTrendingVideos: (limit = 12) =>
    request<{ success: boolean; videos: Track[]; total: number }>(`/music/videos/trending?limit=${limit}`),

  searchVideos: (query: string, limit = 15) =>
    request<{ success: boolean; videos: Track[]; total: number }>(`/music/videos/search?q=${encodeURIComponent(query)}&limit=${limit}`),

  getTrackById: (id: string) =>
    request<{ success: boolean; data: Track }>(`/music/tracks/${id}`),

  getUserPlaylists: () =>
    request<{ success: boolean; data: Playlist[] }>('/music/playlists'),

  getPlaylistById: (id: string) =>
    request<{ success: boolean; data: Playlist }>(`/music/playlists/${id}`),

  createPlaylist: (name: string, description?: string) =>
    request<{ success: boolean; data: Playlist }>('/music/playlists', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),

  updatePlaylist: (id: string, name: string, description?: string, coverImage?: string) =>
    request<{ success: boolean; data: Playlist }>(`/music/playlists/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description, coverImage }),
    }),

  deletePlaylist: (id: string) =>
    request<{ success: boolean; message: string }>(`/music/playlists/${id}`, {
      method: 'DELETE',
    }),

  addTrackToPlaylist: (playlistId: string, track: Track) =>
    request<{ success: boolean; data: Playlist }>(`/music/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ track }),
    }),

  removeTrackFromPlaylist: (playlistId: string, trackId: string) =>
    request<{ success: boolean; data: Playlist }>(`/music/playlists/${playlistId}/tracks/${trackId}`, {
      method: 'DELETE',
    }),

  getLikedTracks: () =>
    request<{ success: boolean; data: Track[] }>('/music/likes'),

  toggleLikeTrack: (track: Track) =>
    request<{ success: boolean; isLiked: boolean; message: string }>('/music/likes/toggle', {
      method: 'POST',
      body: JSON.stringify({ track }),
    }),
};
