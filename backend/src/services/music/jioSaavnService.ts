import axios from 'axios';
import { Track } from '../../database/db.js';

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

export class JioSaavnService {
  private static userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  private static streamUrlCache = new Map<string, { url: string; expiresAt: number }>();

  /**
   * Search JioSaavn's comprehensive library across Bollywood, Punjabi, Tamil, Telugu, and International hits
   */
  public static async searchSongs(query: string, limit = 25): Promise<Track[]> {
    const q = query.trim();
    if (!q) return [];

    try {
      const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&p=1&n=${limit}&q=${encodeURIComponent(
        q
      )}&_marker=0&api_version=4&ctx=web6dot0`;

      const res = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Language': 'en-US,en;q=0.9',
          Cookie: 'L=hindi;',
        },
        timeout: 5000,
      });

      const data = res.data;
      if (!data || !data.results || !Array.isArray(data.results)) {
        return [];
      }

      const tracks: Track[] = data.results.map((song: any) => {
        const title = decodeHtmlEntities(song.title);
        const primaryArtists =
          song.more_info?.artistMap?.primary_artists?.map((a: any) => a.name).join(', ') ||
          song.subtitle ||
          'Artist';
        const artist = decodeHtmlEntities(primaryArtists);
        const album = decodeHtmlEntities(song.more_info?.album || song.title);
        const duration = parseInt(song.more_info?.duration || '210', 10);
        const rawImg = song.image || '';
        const coverUrl = rawImg.replace(/150x150\.jpg|50x50\.jpg/, '500x500.jpg');

        return {
          id: `saavn-${song.id}`,
          title,
          artist,
          album,
          duration,
          audioUrl: `/api/music/saavn/stream/${song.id}`,
          coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
          genre: decodeHtmlEntities(song.more_info?.music || song.more_info?.label || 'JioSaavn Hit'),
          language: song.language ? song.language.charAt(0).toUpperCase() + song.language.slice(1) : 'Hindi',
          license: 'JioSaavn High-Fidelity Audio',
          source: 'JioSaavn',
          isVideo: false,
        };
      });

      return tracks;
    } catch (err: any) {
      console.warn('JioSaavn search error:', err.message);
      return [];
    }
  }

  /**
   * Fetch top trending hits from JioSaavn across Indian & international charts
   */
  public static async getTrendingHits(limit = 24, shuffle = false): Promise<Track[]> {
    try {
      const topKeywords = [
        'Top Bollywood Hits',
        'Punjabi Chartbusters',
        'Trending Hindi Songs',
        'Global English Top Hits',
        'Arijit Singh Superhits',
        'Top Bollywood 2024',
        'Viral Pop Hits',
        'Tamil Cinema Superhits',
        'Telugu Chartbusters',
        'Desi Drill Hits',
        'Romantic Sufi Melodies',
        'Indie India Hits',
      ];
      const randomKw = topKeywords[Math.floor(Math.random() * topKeywords.length)];
      const songs = await this.searchSongs(randomKw, Math.max(limit, 30));
      if (shuffle && songs.length > 0) {
        const copy = [...songs];
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy.slice(0, limit);
      }
      return songs.slice(0, limit);
    } catch {
      return [];
    }
  }

  /**
   * Retrieve direct signed audio stream URL from JioSaavn's CDN for high-res streaming & offline caching
   */
  public static async getStreamUrl(songId: string): Promise<string | null> {
    const cleanId = songId.replace(/^saavn-/, '');
    
    // Check in-memory cache for ultra-fast range requests & instant seeking
    const cached = this.streamUrlCache.get(cleanId);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.url;
    }

    try {
      // 1. Fetch song details to retrieve encrypted_media_url
      const detailsUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&pids=${cleanId}&_format=json&_marker=0&api_version=4&ctx=web6dot0`;
      const detRes = await axios.get(detailsUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 4500,
      });

      const songs = detRes.data?.songs;
      if (!songs || !songs[0]) return null;

      const encUrl = songs[0]?.more_info?.encrypted_media_url;
      if (!encUrl) return null;

      // 2. Generate signed authentication URL from JioSaavn CDN (320 kbps Ultra Lossless Audio)
      const tokenUrl = `https://www.jiosaavn.com/api.php?__call=song.generateAuthToken&url=${encodeURIComponent(
        encUrl
      )}&bitrate=320&_format=json&_marker=0&api_version=4&ctx=web6dot0`;

      const tokRes = await axios.get(tokenUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 4500,
      });

      if (tokRes.data && tokRes.data.auth_url) {
        const authUrl = tokRes.data.auth_url;
        // Cache token for 45 minutes
        this.streamUrlCache.set(cleanId, { url: authUrl, expiresAt: Date.now() + 45 * 60 * 1000 });
        return authUrl;
      }
      return null;
    } catch (err: any) {
      console.warn('JioSaavn getStreamUrl error:', err.message);
      return null;
    }
  }

  /**
   * Get track metadata for a specific JioSaavn ID
   */
  public static async getSongDetails(songId: string): Promise<Track | null> {
    const cleanId = songId.replace(/^saavn-/, '');
    try {
      const detailsUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&pids=${cleanId}&_format=json&_marker=0&api_version=4&ctx=web6dot0`;
      const detRes = await axios.get(detailsUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 4500,
      });

      const song = detRes.data?.songs?.[0];
      if (!song) return null;

      const title = decodeHtmlEntities(song.title);
      const primaryArtists =
        song.more_info?.artistMap?.primary_artists?.map((a: any) => a.name).join(', ') ||
        song.subtitle ||
        'Artist';
      const artist = decodeHtmlEntities(primaryArtists);
      const album = decodeHtmlEntities(song.more_info?.album || song.title);
      const duration = parseInt(song.more_info?.duration || '210', 10);
      const rawImg = song.image || '';
      const coverUrl = rawImg.replace(/150x150\.jpg|50x50\.jpg/, '500x500.jpg');

      return {
        id: `saavn-${song.id}`,
        title,
        artist,
        album,
        duration,
        audioUrl: `/api/music/saavn/stream/${song.id}`,
        coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        genre: decodeHtmlEntities(song.more_info?.music || song.more_info?.label || 'JioSaavn Hit'),
        language: song.language ? song.language.charAt(0).toUpperCase() + song.language.slice(1) : 'Hindi',
        license: 'JioSaavn High-Fidelity Audio',
        source: 'JioSaavn',
        isVideo: false,
      };
    } catch (err: any) {
      console.warn('JioSaavn getSongDetails error:', err.message);
      return null;
    }
  }
}

