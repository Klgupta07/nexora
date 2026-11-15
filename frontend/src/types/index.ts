export type MainSection = 'music';

export type UserRole = 'user' | 'analyst' | 'admin';
export type AudioQuality = 'high' | 'medium' | 'low';
export type MusicSource = 'all' | 'spotify' | 'saavn' | 'youtube' | 'catalog';
export type RepeatMode = 'off' | 'all' | 'one';
export type InterfaceLayoutMode = 'modern' | 'cyberpunk-hud' | 'minimalist' | 'studio-deck';
export type InterfaceDensity = 'compact' | 'balanced' | 'spacious';

export interface UserSettings {
  theme?: 'dark' | 'light';
  defaultAudioQuality?: AudioQuality;
  enableTelemetry?: boolean;
  autoSaveSearches?: boolean;
  interfaceMode?: InterfaceLayoutMode;
  interfaceDensity?: InterfaceDensity;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
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
  bpm?: number;
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

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  tracks?: Track[];
  token?: string;
  user?: User;
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

// 🎛️ Audio Beat Sync & Frequency Analysis Interfaces
export interface BeatSyncState {
  bpm: number;
  energy: number; // 0.0 to 1.0
  isBeat: boolean;
  beatCount: number;
  peakFrequency: number;
  spectralBands: number[]; // frequency spectrum levels [bass, mid, treble...]
}

export interface AudioAnalysisData {
  timeData: Uint8Array;
  freqData: Uint8Array;
  volume: number;
  bassLevel: number;
  midLevel: number;
  trebleLevel: number;
}

// 📊 Audio Engine & Dashboard Telemetry Interfaces
export interface StreamTelemetry {
  bitrateKbps: number;
  sampleRateHz: number;
  bufferHealthPct: number;
  latencyMs: number;
  activeProvider: string;
  codec: string;
  droppedFrames: number;
}

export interface DashboardStats {
  totalStreams: number;
  hoursListened: number;
  savedOfflineTracks: number;
  offlineStorageUsedBytes: number;
  activeAudioEngine: string;
  topGenre: string;
  connectedAPIs: {
    spotify: boolean;
    jioSaavn: boolean;
    youtube: boolean;
  };
}

export interface OfflineTrackItem {
  track: Track;
  blob?: Blob;
  size: number;
  downloadedAt: number;
  format?: string;
}

export interface OfflineStorageStats {
  count: number;
  totalBytes: number;
  formattedSize: string;
}
