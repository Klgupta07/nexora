import axios from 'axios';
import { Track } from '../../database/db.js';
import { Album, Artist, IMusicProvider } from './musicProvider.js';
import { ROYALTY_FREE_TRACKS, POPULAR_ALBUMS, TOP_ARTISTS, SUPPORTED_LANGUAGES, LanguageCategory } from './royaltyFreeCatalog.js';
import { config } from '../../config/index.js';

export class JamendoProvider implements IMusicProvider {
  public name = 'Jamendo Licensing API (Creative Commons / Royalty Free)';
  private baseUrl = 'https://api.jamendo.com/v3.0';
  private clientId = config.jamendoClientId;

  private mapJamendoTrack(item: any): Track {
    return {
      id: `jam-${item.id}`,
      title: item.name || 'Untitled Track',
      artist: item.artist_name || 'Independent Artist',
      album: item.album_name || 'Single',
      duration: item.duration || 180,
      audioUrl: item.audio || item.audiodl || '',
      coverUrl: item.image || item.album_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      genre: item.musicinfo?.tags?.genres?.[0] || 'Electronic',
      language: 'English',
      license: item.license_ccurl || 'Creative Commons BY-SA (Jamendo Licensed)',
      source: 'Jamendo Music API',
    };
  }

  public async searchTracks(query: string, limit = 24): Promise<Track[]> {
    const q = query.trim().toLowerCase();

    // 1. Check local catalog first (which includes multi-language songs!)
    const localMatches = ROYALTY_FREE_TRACKS.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.album && t.album.toLowerCase().includes(q)) ||
        (t.genre && t.genre.toLowerCase().includes(q)) ||
        (t.language && t.language.toLowerCase().includes(q))
    );

    try {
      const response = await axios.get(`${this.baseUrl}/tracks`, {
        params: {
          client_id: this.clientId,
          format: 'json',
          limit: 10,
          namesearch: q,
          audioformat: 'mp32',
          include: 'musicinfo',
        },
        timeout: 3000,
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        const jamTracks = response.data.results.map((r: any) => this.mapJamendoTrack(r));
        return [...localMatches, ...jamTracks].slice(0, limit);
      }
    } catch {
      // Fallback to local catalog
    }

    return localMatches.slice(0, limit);
  }

  public async getTracksByLanguage(language: string, limit = 50): Promise<Track[]> {
    const lang = language.trim().toLowerCase();
    if (!lang || lang === 'all') {
      return ROYALTY_FREE_TRACKS.slice(0, limit);
    }
    return ROYALTY_FREE_TRACKS.filter(
      t => t.language?.toLowerCase() === lang || t.language?.toLowerCase().includes(lang)
    ).slice(0, limit);
  }

  public getLanguages(): LanguageCategory[] {
    return SUPPORTED_LANGUAGES;
  }

  public async getTrendingTracks(limit = 24, shuffle = false): Promise<Track[]> {
    let baseList = [...ROYALTY_FREE_TRACKS];
    if (shuffle) {
      for (let i = baseList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [baseList[i], baseList[j]] = [baseList[j], baseList[i]];
      }
    }

    try {
      const response = await axios.get(`${this.baseUrl}/tracks`, {
        params: {
          client_id: this.clientId,
          format: 'json',
          limit: 10,
          order: 'popularity_total',
          audioformat: 'mp32',
          include: 'musicinfo',
        },
        timeout: 3000,
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        const jamTracks = response.data.results.map((r: any) => this.mapJamendoTrack(r));
        return [...baseList.slice(0, 16), ...jamTracks].slice(0, limit);
      }
    } catch {
      // Fallback
    }

    return baseList.slice(0, limit);
  }

  public async getNewReleases(limit = 15): Promise<Track[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/tracks`, {
        params: {
          client_id: this.clientId,
          format: 'json',
          limit: 8,
          order: 'releasedate_desc',
          audioformat: 'mp32',
          include: 'musicinfo',
        },
        timeout: 3000,
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        const jamTracks = response.data.results.map((r: any) => this.mapJamendoTrack(r));
        return [...ROYALTY_FREE_TRACKS.slice(12, 24), ...jamTracks].slice(0, limit);
      }
    } catch {
      // Fallback
    }

    return [...ROYALTY_FREE_TRACKS].reverse().slice(0, limit);
  }

  public async getTracksByGenre(genre: string, limit = 20): Promise<Track[]> {
    const gLower = genre.toLowerCase();
    const localMatches = ROYALTY_FREE_TRACKS.filter(
      t => t.genre && t.genre.toLowerCase().includes(gLower)
    );

    try {
      const response = await axios.get(`${this.baseUrl}/tracks`, {
        params: {
          client_id: this.clientId,
          format: 'json',
          limit: 10,
          tags: gLower,
          audioformat: 'mp32',
          include: 'musicinfo',
        },
        timeout: 3000,
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        const jamTracks = response.data.results.map((r: any) => this.mapJamendoTrack(r));
        return [...localMatches, ...jamTracks].slice(0, limit);
      }
    } catch {
      // Fallback
    }

    return localMatches.length > 0 ? localMatches.slice(0, limit) : ROYALTY_FREE_TRACKS.slice(0, limit);
  }

  public async getPopularAlbums(limit = 10): Promise<Album[]> {
    return POPULAR_ALBUMS.slice(0, limit);
  }

  public async getTopArtists(limit = 10): Promise<Artist[]> {
    return TOP_ARTISTS.slice(0, limit);
  }

  public async getTrackById(id: string): Promise<Track | null> {
    const local = ROYALTY_FREE_TRACKS.find(t => t.id === id);
    if (local) return local;

    if (id.startsWith('jam-')) {
      const jamId = id.replace('jam-', '');
      try {
        const response = await axios.get(`${this.baseUrl}/tracks`, {
          params: {
            client_id: this.clientId,
            format: 'json',
            id: jamId,
            audioformat: 'mp32',
          },
          timeout: 4000,
        });

        if (response.data && response.data.results && response.data.results[0]) {
          return this.mapJamendoTrack(response.data.results[0]);
        }
      } catch {
        // Fallback
      }
    }

    return null;
  }
}

export const musicProvider = new JamendoProvider();
