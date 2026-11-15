/**
 * CHILLMODE Backend Core Types & Domain Interfaces
 */

export type UserRole = 'user' | 'analyst' | 'admin';
export type AudioQuality = 'high' | 'medium' | 'low';
export type StreamingSource = 'spotify' | 'saavn' | 'youtube' | 'catalog' | 'jamendo' | 'all';

export interface UserSettings {
  theme?: 'dark' | 'light';
  defaultAudioQuality?: AudioQuality;
  enableTelemetry?: boolean;
  autoSaveSearches?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  settings?: UserSettings;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  settings?: UserSettings;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  audioUrl: string;
  coverUrl: string;
  genre?: string;
  language?: string;
  license?: string;
  source?: string;
  youtubeId?: string;
  isVideo?: boolean;
  bitrate?: number;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  coverUrl: string;
  releaseDate?: string;
  trackCount: number;
  tracks?: Track[];
}

export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  genre: string;
  monthlyListeners?: number;
  bio?: string;
  topTracks?: Track[];
}

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description: string;
  coverImage?: string;
  isPublic: boolean;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
}

export interface LikedTrack {
  userId: string;
  track: Track;
  likedAt: string;
}

export interface DatabaseSchema {
  users: User[];
  playlists: Playlist[];
  likedTracks: LikedTrack[];
}

export interface LanguageCategory {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  color: string;
  description: string;
}

export interface RecommendedPlaylist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  trackCount: number;
}

export interface HomeFeedData {
  trending: Track[];
  youtubeTrending: Track[];
  jioSaavnTrending: Track[];
  spotifyTopHits: Track[];
  newReleases: Track[];
  popularAlbums: Album[];
  topArtists: Artist[];
  languages: LanguageCategory[];
  recommendedPlaylists: RecommendedPlaylist[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface SearchApiResponse {
  success: boolean;
  tracks: Track[];
  query: string;
  total: number;
}

export interface AuthApiResponse {
  success: boolean;
  token?: string;
  user?: UserProfile;
  message?: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  service: string;
  version: string;
  capabilities: string[];
}

