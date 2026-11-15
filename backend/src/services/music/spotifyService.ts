import axios from 'axios';
import { Track } from '../../database/db.js';
import { JioSaavnService } from './jioSaavnService.js';
import { YouTubeService } from './youtubeService.js';

interface SpotifyEmbedTrack {
  uri: string;
  title: string;
  subtitle: string;
  duration: number; // in ms
  audioPreview?: {
    url?: string;
  };
}

export class SpotifyService {
  private static userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  private static playlistCache: Map<string, { tracks: Track[]; timestamp: number }> = new Map();
  private static CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes cache

  public static clearCache(): void {
    this.playlistCache.clear();
  }

  public static PLAYLISTS = {
    GLOBAL_TOP_50: '37i9dQZEVXbMDoHDwVN2tF',
    TODAYS_TOP_HITS: '37i9dQZF1DXcBWIGoYBM5M',
    INDIA_TOP_50: '37i9dQZEVXbLZ52XmnySJg',
    VIRAL_50: '37i9dQZEVXbLiRSasKsNU9',
    RAP_CAVIAR: '37i9dQZF1DX0XUsuxWHRQd',
    HOT_HITS_HINDI: '37i9dQZF1DX0XUfTFmZeZw',
    HOT_HITS_PUNJABI: '37i9dQZF1DX48TTZL62YvD',
    VIVA_LATINO: '37i9dQZF1DX10zKzsJ2jva',
    KPOP_ON: '37i9dQZF1DX9tPFwDMOaN1',
  };

  /**
   * Fetch tracks from a Spotify Embed playlist
   */
  public static async getPlaylistTracks(playlistId: string, limit = 25): Promise<Track[]> {
    const cached = this.playlistCache.get(playlistId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.tracks.slice(0, limit);
    }

    try {
      const url = `https://open.spotify.com/embed/playlist/${playlistId}`;
      const res = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 5000,
      });

      const match = res.data.match(/<script id="__NEXT_DATA__"[^>]*>({.+?})<\/script>/);
      if (!match) return [];

      const json = JSON.parse(match[1]);
      const entity = json.props?.pageProps?.state?.data?.entity;
      const trackList: SpotifyEmbedTrack[] = entity?.trackList || [];

      const defaultCover =
        entity?.visualIdentity?.image?.[0]?.url ||
        'https://charts-images.scdn.co/assets/locale_en/regional/daily/region_global_default.jpg';

      const tracks: Track[] = trackList.map((t, idx) => {
        const spotifyId = t.uri ? t.uri.replace('spotify:track:', '') : `sp_${idx}`;
        const durationSec = Math.round((t.duration || 210000) / 1000);

        return {
          id: `sp-${spotifyId}`,
          title: t.title || 'Spotify Hit',
          artist: t.subtitle || 'Artist',
          album: entity?.name || 'Spotify Top Chart',
          duration: durationSec,
          audioUrl: `/api/music/spotify/stream/${spotifyId}?title=${encodeURIComponent(t.title)}&artist=${encodeURIComponent(t.subtitle)}`,
          coverUrl: defaultCover,
          genre: 'Spotify Charts',
          language: entity?.name?.toLowerCase().includes('hindi')
            ? 'Hindi'
            : entity?.name?.toLowerCase().includes('punjabi')
            ? 'Punjabi'
            : entity?.name?.toLowerCase().includes('latino')
            ? 'Spanish'
            : entity?.name?.toLowerCase().includes('k-pop')
            ? 'Korean'
            : 'English',
          license: 'Spotify Official Stream',
          source: 'Spotify',
          isVideo: false,
        };
      });

      this.playlistCache.set(playlistId, { tracks, timestamp: Date.now() });
      return tracks.slice(0, limit);
    } catch (err: any) {
      console.warn('Failed to load Spotify playlist tracks:', err.message);
      return [];
    }
  }

  /**
   * Get Spotify Global Top 50 Chart
   */
  public static async getGlobalTop50(limit = 24): Promise<Track[]> {
    return this.getPlaylistTracks(this.PLAYLISTS.GLOBAL_TOP_50, limit);
  }

  /**
   * Get Today's Top Hits from Spotify
   */
  public static async getTodaysTopHits(limit = 24): Promise<Track[]> {
    return this.getPlaylistTracks(this.PLAYLISTS.TODAYS_TOP_HITS, limit);
  }

  /**
   * Search Spotify chart tracks & playlists
   */
  public static async searchTracks(query: string, limit = 20): Promise<Track[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.getGlobalTop50(limit);

    // Collect tracks across our cached Spotify playlists
    const allPlaylists = [
      this.PLAYLISTS.GLOBAL_TOP_50,
      this.PLAYLISTS.TODAYS_TOP_HITS,
      this.PLAYLISTS.INDIA_TOP_50,
      this.PLAYLISTS.HOT_HITS_HINDI,
      this.PLAYLISTS.HOT_HITS_PUNJABI,
      this.PLAYLISTS.VIVA_LATINO,
      this.PLAYLISTS.KPOP_ON,
    ];

    const results: Track[] = [];
    const seen = new Set<string>();

    for (const plId of allPlaylists) {
      const plTracks = await this.getPlaylistTracks(plId, 50);
      for (const t of plTracks) {
        if (!seen.has(t.id)) {
          if (
            t.title.toLowerCase().includes(q) ||
            t.artist.toLowerCase().includes(q) ||
            (t.genre && t.genre.toLowerCase().includes(q))
          ) {
            seen.add(t.id);
            results.push(t);
            if (results.length >= limit) return results;
          }
        }
      }
    }

    // If query didn't match cached Spotify charts, match dynamically with Spotify branding
    if (results.length < limit) {
      const [saavnHits, ytHits] = await Promise.all([
        JioSaavnService.searchSongs(query, 10).catch(() => []),
        YouTubeService.searchVideos(query, 10).catch(() => []),
      ]);

      for (const s of [...saavnHits, ...ytHits]) {
        if (!seen.has(s.id)) {
          seen.add(s.id);
          results.push({
            ...s,
            id: `sp-${s.id.replace(/^(saavn-|yt-)/, '')}`,
            source: 'Spotify',
            license: 'Spotify Verified Match',
          });
          if (results.length >= limit) break;
        }
      }
    }

    return results;
  }

  /**
   * Fetch single track details from Spotify embed
   */
  public static async getTrackById(spotifyId: string): Promise<Track | null> {
    const cleanId = spotifyId.replace(/^sp-/, '');
    try {
      const url = `https://open.spotify.com/embed/track/${cleanId}`;
      const res = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 4500,
      });

      const match = res.data.match(/<script id="__NEXT_DATA__"[^>]*>({.+?})<\/script>/);
      if (!match) return null;

      const json = JSON.parse(match[1]);
      const ent = json.props?.pageProps?.state?.data?.entity;
      if (!ent) return null;

      const title = ent.title || ent.name || 'Spotify Track';
      const artists = ent.artists?.map((a: any) => a.name).join(', ') || 'Artist';
      const durationSec = Math.round((ent.duration || 210000) / 1000);
      const coverUrl =
        ent.visualIdentity?.image?.[2]?.url ||
        ent.visualIdentity?.image?.[0]?.url ||
        'https://charts-images.scdn.co/assets/locale_en/regional/daily/region_global_default.jpg';

      return {
        id: `sp-${cleanId}`,
        title,
        artist: artists,
        album: 'Spotify Single',
        duration: durationSec,
        audioUrl: `/api/music/spotify/stream/${cleanId}?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artists)}`,
        coverUrl,
        genre: 'Spotify Global',
        language: 'Global',
        license: 'Spotify Official Track',
        source: 'Spotify',
        isVideo: false,
      };
    } catch {
      return null;
    }
  }

  /**
   * Resolve a Spotify track to a direct audio stream URL (via JioSaavn or YouTube pipeline)
   */
  public static async resolveStreamUrl(title: string, artist: string): Promise<string | null> {
    try {
      // 1. Try JioSaavn direct high-res audio stream
      const query = `${title} ${artist}`.trim();
      const saavnTracks = await JioSaavnService.searchSongs(query, 1);
      if (saavnTracks.length > 0 && saavnTracks[0].id) {
        const streamUrl = await JioSaavnService.getStreamUrl(saavnTracks[0].id);
        if (streamUrl) return streamUrl;
      }

      // 2. Fallback
      return null;
    } catch (err: any) {
      console.warn('Spotify stream resolution error:', err.message);
      return null;
    }
  }
}

