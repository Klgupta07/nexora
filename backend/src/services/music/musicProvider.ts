import { Track, Album, Artist } from '../../types/index.js';

export { Album, Artist };

export interface IMusicProvider {
  name: string;
  searchTracks(query: string, limit?: number): Promise<Track[]>;
  getTrendingTracks(limit?: number, shuffle?: boolean): Promise<Track[]>;
  getNewReleases(limit?: number): Promise<Track[]>;
  getTracksByGenre(genre: string, limit?: number): Promise<Track[]>;
  getPopularAlbums(limit?: number): Promise<Album[]>;
  getTopArtists(limit?: number): Promise<Artist[]>;
  getTrackById(id: string): Promise<Track | null>;
}
