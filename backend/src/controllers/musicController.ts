import { Request, Response } from 'express';
import axios from 'axios';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { db, Playlist, Track } from '../database/db.js';
import { musicProvider } from '../services/music/jamendoProvider.js';
import { ROYALTY_FREE_TRACKS } from '../services/music/royaltyFreeCatalog.js';
import { YouTubeService } from '../services/music/youtubeService.js';
import { JioSaavnService } from '../services/music/jioSaavnService.js';
import { SpotifyService } from '../services/music/spotifyService.js';

export class MusicController {
  public static async getOfflinePack(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 30;
      const pack = ROYALTY_FREE_TRACKS.slice(0, limit);
      res.json({
        success: true,
        count: pack.length,
        tracks: pack,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getHomeFeed(req: Request, res: Response): Promise<void> {
    try {
      const isRefresh = req.query.refresh === 'true' || req.query.refresh === '1';
      const shouldShuffle = req.query.shuffle === 'true' || req.query.shuffle === '1' || isRefresh;

      if (isRefresh) {
        SpotifyService.clearCache();
      }

      const [trending, newReleases, albums, artists, youtubeTrending, jioSaavnTrending, spotifyTopHits] = await Promise.all([
        musicProvider.getTrendingTracks(24, shouldShuffle),
        musicProvider.getNewReleases(12),
        musicProvider.getPopularAlbums(6),
        musicProvider.getTopArtists(6),
        Promise.resolve(YouTubeService.getTrendingVideos(24, shouldShuffle)),
        JioSaavnService.getTrendingHits(24, shouldShuffle).catch(() => []),
        SpotifyService.getTodaysTopHits(24).catch(() => []),
      ]);

      // Ensure primary trending banner features working streams (JioSaavn hits & curated YouTube music)
      const primaryTrending = [
        ...jioSaavnTrending.slice(0, 10),
        ...youtubeTrending.slice(0, 10),
        ...trending.filter(t => t.youtubeId || (t.audioUrl && !t.audioUrl.includes('pixabay'))),
      ];

      res.json({
        success: true,
        refreshedAt: new Date().toISOString(),
        isRefresh,
        data: {
          trending: primaryTrending.length > 0 ? primaryTrending : trending,
          youtubeTrending,
          jioSaavnTrending,
          spotifyTopHits,
          newReleases,
          popularAlbums: albums,
          topArtists: artists,
          languages: musicProvider.getLanguages(),
          recommendedPlaylists: [
            {
              id: 'rec-hin',
              name: 'Bollywood & Sufi Melodies (Hindi)',
              description: 'Soulful Bollywood ballads, romantic raga, and acoustic vocals.',
              coverUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
              trackCount: 7,
            },
            {
              id: 'rec-pun',
              name: 'Punjabi Drip & Bhangra Heat',
              description: 'Desi drill swagger, heavy bass, and modern Majhail synthwave.',
              coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
              trackCount: 5,
            },
            {
              id: 'rec-spa',
              name: 'Viva Latino & Reggaeton Fuego',
              description: 'Caliente Caribbean dembow, Latin trap, and Havana acoustic nights.',
              coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
              trackCount: 5,
            },
            {
              id: 'rec-kor',
              name: 'K-Pop Daebak & Hallyu Waves',
              description: 'Seoul neon disco-pop, high-energy hooks, and dreamy K-R&B.',
              coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
              trackCount: 5,
            },
            {
              id: 'rec-jap',
              name: 'Tokyo Anime & 80s City Pop',
              description: 'Iconic anime openings, fast J-Rock, and nostalgic Shibuya city pop.',
              coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
              trackCount: 5,
            },
            {
              id: 'rec-tam',
              name: 'Tamil Kollywood Anthems',
              description: 'High-octane Tamil kuthu drops, Anirudh beats, and AR Rahman melodies.',
              coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
              trackCount: 4,
            },
            {
              id: 'rec-tel',
              name: 'Tollywood Mass Beats',
              description: 'Devi Sri Prasad, Thaman S, and MM Keeravani high-energy Telugu anthems.',
              coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
              trackCount: 4,
            },
            {
              id: 'rec-fre',
              name: 'French Touch & Paris Lounge',
              description: 'Electro-pop, French house, and Paris chanson harmonies.',
              coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
              trackCount: 3,
            },
            {
              id: 'rec-ara',
              name: 'Arabian Nights & Oriental Trap',
              description: 'Oud melodies, modern Rai, and desert mirage trap.',
              coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
              trackCount: 3,
            },
          ],
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async search(req: Request, res: Response): Promise<void> {
    try {
      const q = ((req.query.q as string) || '').trim();
      const genre = ((req.query.genre as string) || '').trim();
      const language = ((req.query.language as string) || '').trim();
      const source = ((req.query.source as string) || 'all').trim().toLowerCase();

      if (!q && !genre && !language) {
        const [spotifyHits, saavnHits, ytHits, catalogHits] = await Promise.all([
          SpotifyService.getTodaysTopHits(12).catch(() => []),
          JioSaavnService.getTrendingHits(12).catch(() => []),
          Promise.resolve(YouTubeService.getTrendingVideos(12)),
          musicProvider.getTrendingTracks(12),
        ]);
        res.json({
          success: true,
          tracks: [...spotifyHits, ...saavnHits, ...ytHits, ...catalogHits],
          query: '',
          total: spotifyHits.length + saavnHits.length + ytHits.length + catalogHits.length,
        });
        return;
      }

      let audioTracks: Track[] = [];

      if (source === 'spotify') {
        const queryTerm = q || (language ? `${language} hits` : `${genre} music`);
        audioTracks = await SpotifyService.searchTracks(queryTerm, 30);
      } else if (source === 'saavn' || source === 'jiosaavn') {
        const queryTerm = q || (language ? `${language} top songs` : `${genre} music`);
        audioTracks = await JioSaavnService.searchSongs(queryTerm, 30);
      } else if (source === 'youtube') {
        const queryTerm = q || (language ? `${language} hits` : `${genre} music`);
        audioTracks = await YouTubeService.searchVideos(queryTerm, 30);
      } else if (source === 'catalog') {
        if (language) {
          audioTracks = await musicProvider.getTracksByLanguage(language, 24);
        } else if (genre) {
          audioTracks = await musicProvider.getTracksByGenre(genre, 24);
        } else {
          audioTracks = await musicProvider.searchTracks(q, 24);
        }
      } else {
        // 'all' (default): Query Spotify + JioSaavn + YouTube Music + Catalog in parallel
        const queryTerm = q || (language ? `${language} top hits song` : `${genre} music song`);
        const [spotifyResult, saavnResult, ytResult, catResult] = await Promise.allSettled([
          SpotifyService.searchTracks(queryTerm, 15),
          JioSaavnService.searchSongs(queryTerm, 15),
          YouTubeService.searchVideos(queryTerm, 15),
          language
            ? musicProvider.getTracksByLanguage(language, 10)
            : genre
            ? musicProvider.getTracksByGenre(genre, 10)
            : musicProvider.searchTracks(q, 10),
        ]);

        const spotifyTracks = spotifyResult.status === 'fulfilled' ? spotifyResult.value : [];
        const saavnTracks = saavnResult.status === 'fulfilled' ? saavnResult.value : [];
        const ytTracks = ytResult.status === 'fulfilled' ? ytResult.value : [];
        const catTracks = catResult.status === 'fulfilled' ? catResult.value : [];

        // Interleave hits across all platforms
        const seen = new Set<string>();
        const merged: Track[] = [];
        const maxLen = Math.max(spotifyTracks.length, saavnTracks.length, ytTracks.length, catTracks.length);

        for (let i = 0; i < maxLen; i++) {
          if (spotifyTracks[i]) {
            const key = (spotifyTracks[i].title + '-' + spotifyTracks[i].artist).toLowerCase();
            if (!seen.has(key) && !seen.has(spotifyTracks[i].id)) {
              seen.add(key);
              seen.add(spotifyTracks[i].id);
              merged.push(spotifyTracks[i]);
            }
          }
          if (saavnTracks[i]) {
            const key = (saavnTracks[i].title + '-' + saavnTracks[i].artist).toLowerCase();
            if (!seen.has(key) && !seen.has(saavnTracks[i].id)) {
              seen.add(key);
              seen.add(saavnTracks[i].id);
              merged.push(saavnTracks[i]);
            }
          }
          if (ytTracks[i]) {
            const key = (ytTracks[i].title + '-' + ytTracks[i].artist).toLowerCase();
            if (!seen.has(key) && !seen.has(ytTracks[i].id)) {
              seen.add(key);
              seen.add(ytTracks[i].id);
              merged.push(ytTracks[i]);
            }
          }
          if (catTracks[i]) {
            const key = (catTracks[i].title + '-' + catTracks[i].artist).toLowerCase();
            if (!seen.has(key) && !seen.has(catTracks[i].id)) {
              seen.add(key);
              seen.add(catTracks[i].id);
              merged.push(catTracks[i]);
            }
          }
        }
        audioTracks = merged;
      }

      res.json({
        success: true,
        tracks: audioTracks,
        query: q || genre || language,
        total: audioTracks.length,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getLanguages(req: Request, res: Response): Promise<void> {
    try {
      const languages = musicProvider.getLanguages();
      res.json({ success: true, data: languages });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getTracksByLanguage(req: Request, res: Response): Promise<void> {
    try {
      const rawLang = String(req.params.lang || 'all').toLowerCase();
      const limit = Math.min(parseInt((req.query.limit as string) || '50', 10), 100);
      const catalogTracks = await musicProvider.getTracksByLanguage(rawLang, 100);

      // Multi-provider streaming queries tailored for each language
      let saavnQueries: string[] = [];
      let spotifyQueries: string[] = [];
      let ytQueries: string[] = [];

      if (rawLang === 'telugu') {
        saavnQueries = ['Telugu top hits', 'Telugu chartbusters', 'Telugu latest mass songs'];
        spotifyQueries = ['Telugu Top 50', 'Tollywood Hits'];
        ytQueries = ['Telugu songs', 'Telugu blockbuster hits'];
      } else if (rawLang === 'hindi') {
        saavnQueries = ['Top Bollywood Hits', 'Trending Hindi Songs', 'Arijit Singh Superhits'];
        spotifyQueries = ['Bollywood Butter', 'Hindi Top Hits'];
        ytQueries = ['Hindi top songs', 'Bollywood hits'];
      } else if (rawLang === 'punjabi') {
        saavnQueries = ['Punjabi Chartbusters', 'Desi Drill Hits', 'AP Dhillon Diljit'];
        spotifyQueries = ['Punjabi 101', 'Hot Hits Punjabi'];
        ytQueries = ['Punjabi top songs', 'Sidhu Moosewala hits'];
      } else if (rawLang === 'english') {
        saavnQueries = ['Global English Top Hits', 'Viral Pop Hits'];
        spotifyQueries = ["Today's Top Hits", 'Billboard Hot 100'];
        ytQueries = ['English top hits songs', 'Global pop hits'];
      } else if (rawLang === 'tamil') {
        saavnQueries = ['Tamil Cinema Superhits', 'Anirudh Ravichander hits'];
        spotifyQueries = ['Tamil Top 50', 'Kollywood Hits'];
        ytQueries = ['Tamil top hits songs', 'Kollywood songs'];
      } else if (rawLang !== 'all') {
        saavnQueries = [`${rawLang} top songs`];
        ytQueries = [`${rawLang} hits`];
      }

      // Fetch from JioSaavn, Spotify, and YouTube in parallel
      const fetchPromises: Promise<Track[]>[] = [];
      for (const q of saavnQueries.slice(0, 2)) {
        fetchPromises.push(JioSaavnService.searchSongs(q, 15).catch(() => []));
      }
      for (const q of spotifyQueries.slice(0, 1)) {
        fetchPromises.push(SpotifyService.searchTracks(q, 15).catch(() => []));
      }
      for (const q of ytQueries.slice(0, 1)) {
        fetchPromises.push(YouTubeService.searchVideos(q, 10).catch(() => []));
      }

      const results = await Promise.all(fetchPromises);
      const liveTracks = results.flat();

      // Prioritize working live streams from JioSaavn & YouTube first
      const seen = new Set<string>();
      const combined: Track[] = [];

      for (const t of liveTracks) {
        const key = (t.title + '-' + t.artist).toLowerCase();
        if (!seen.has(key) && !seen.has(t.id)) {
          seen.add(key);
          seen.add(t.id);
          combined.push(t);
        }
      }

      for (const t of catalogTracks) {
        const key = (t.title + '-' + t.artist).toLowerCase();
        if (!seen.has(key) && !seen.has(t.id)) {
          seen.add(key);
          seen.add(t.id);
          combined.push(t);
        }
      }

      res.json({ success: true, language: rawLang, tracks: combined.slice(0, limit), total: combined.length });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async searchVideos(req: Request, res: Response): Promise<void> {
    try {
      const q = ((req.query.q as string) || '').trim();
      const limit = parseInt((req.query.limit as string) || '15', 10);
      const videos = await YouTubeService.searchVideos(q, limit);
      res.json({ success: true, videos, total: videos.length });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getTrendingVideos(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt((req.query.limit as string) || '12', 10);
      const videos = YouTubeService.getTrendingVideos(limit);
      res.json({ success: true, videos, total: videos.length });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getTrackById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      if (id.startsWith('saavn-')) {
        const track = await JioSaavnService.getSongDetails(id);
        if (track) {
          res.json({ success: true, data: track });
          return;
        }
      }
      if (id.startsWith('sp-')) {
        const track = await SpotifyService.getTrackById(id);
        if (track) {
          res.json({ success: true, data: track });
          return;
        }
      }
      if (id.startsWith('yt-') || (id.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(id))) {
        const track = YouTubeService.getTrackByVideoId(id);
        res.json({ success: true, data: track });
        return;
      }

      const track = await musicProvider.getTrackById(id);
      if (!track) {
        res.status(404).json({ success: false, message: 'Track not found.' });
        return;
      }
      res.json({ success: true, data: track });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * High-Fidelity Audio Streaming Proxy for JioSaavn
   * Streams direct audio/mp4 / aac from CDN with full range/seeking support
   */
  public static async streamSaavnTrack(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const authUrl = await JioSaavnService.getStreamUrl(id);
      if (!authUrl) {
        res.status(404).json({ success: false, message: 'Audio stream not found on JioSaavn CDN.' });
        return;
      }

      const headers: Record<string, string> = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://www.jiosaavn.com/',
        Accept: '*/*',
      };

      if (req.headers.range) {
        headers['Range'] = req.headers.range;
      }

      const audioStream = await axios.get(authUrl, {
        headers,
        responseType: 'stream',
        timeout: 12000,
        validateStatus: status => status >= 200 && status < 400,
      });

      res.status(audioStream.status);
      res.setHeader('Content-Type', String(audioStream.headers['content-type'] || 'audio/mp4'));
      res.setHeader('Accept-Ranges', 'bytes');
      if (audioStream.headers['content-length']) {
        res.setHeader('Content-Length', String(audioStream.headers['content-length']));
      }
      if (audioStream.headers['content-range']) {
        res.setHeader('Content-Range', String(audioStream.headers['content-range']));
      }

      audioStream.data.pipe(res);
    } catch (err: any) {
      console.error('Audio streaming proxy error:', err.message);
      if (!res.headersSent) {
        res.status(502).json({ success: false, message: 'Failed to stream audio from provider.' });
      }
    }
  }

  public static async getJioSaavnTrending(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt((req.query.limit as string) || '24', 10);
      const tracks = await JioSaavnService.getTrendingHits(limit);
      res.json({ success: true, tracks, total: tracks.length });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async searchJioSaavn(req: Request, res: Response): Promise<void> {
    try {
      const q = ((req.query.q as string) || '').trim();
      const limit = parseInt((req.query.limit as string) || '25', 10);
      const tracks = await JioSaavnService.searchSongs(q, limit);
      res.json({ success: true, tracks, total: tracks.length });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * High-Fidelity Audio Streaming Proxy for Spotify tracks
   */
  public static async streamSpotifyTrack(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const title = String(req.query.title || '');
      const artist = String(req.query.artist || '');

      let authUrl: string | null = null;
      if (title && artist) {
        authUrl = await SpotifyService.resolveStreamUrl(title, artist);
      }

      if (!authUrl) {
        const saavnHits = await JioSaavnService.searchSongs(title || id, 1);
        if (saavnHits.length > 0) {
          authUrl = await JioSaavnService.getStreamUrl(saavnHits[0].id);
        }
      }

      if (!authUrl) {
        res.status(404).json({ success: false, message: 'Audio stream not available for this Spotify track.' });
        return;
      }

      const headers: Record<string, string> = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://www.jiosaavn.com/',
        Accept: '*/*',
      };

      if (req.headers.range) {
        headers['Range'] = req.headers.range;
      }

      const audioStream = await axios.get(authUrl, {
        headers,
        responseType: 'stream',
        timeout: 12000,
        validateStatus: status => status >= 200 && status < 400,
      });

      res.status(audioStream.status);
      res.setHeader('Content-Type', String(audioStream.headers['content-type'] || 'audio/mp4'));
      res.setHeader('Accept-Ranges', 'bytes');
      if (audioStream.headers['content-length']) {
        res.setHeader('Content-Length', String(audioStream.headers['content-length']));
      }
      if (audioStream.headers['content-range']) {
        res.setHeader('Content-Range', String(audioStream.headers['content-range']));
      }

      audioStream.data.pipe(res);
    } catch (err: any) {
      console.error('Spotify audio stream proxy error:', err.message);
      if (!res.headersSent) {
        res.status(502).json({ success: false, message: 'Failed to stream Spotify audio.' });
      }
    }
  }

  public static async getSpotifyTopHits(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt((req.query.limit as string) || '24', 10);
      const tracks = await SpotifyService.getTodaysTopHits(limit);
      res.json({ success: true, tracks, total: tracks.length });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async searchSpotify(req: Request, res: Response): Promise<void> {
    try {
      const q = ((req.query.q as string) || '').trim();
      const limit = parseInt((req.query.limit as string) || '25', 10);
      const tracks = await SpotifyService.searchTracks(q, limit);
      res.json({ success: true, tracks, total: tracks.length });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // --- Playlists ---
  public static async getUserPlaylists(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'demo_user';
      let playlists = db.getUserPlaylists(userId);

      // Seed a default playlist if empty
      if (playlists.length === 0) {
        const defaultPl = db.createPlaylist({
          id: `pl_init_${Date.now()}`,
          userId,
          name: 'Cyberpunk Investigation Mix',
          description: 'High adrenaline synthwave and glitch beats for reconnaissance operations.',
          isPublic: true,
          tracks: ROYALTY_FREE_TRACKS.slice(0, 5),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        playlists = [defaultPl];
      }

      res.json({ success: true, data: playlists });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getPlaylistById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const playlist = db.getPlaylistById(id);
      if (!playlist) {
        res.status(404).json({ success: false, message: 'Playlist not found.' });
        return;
      }
      res.json({ success: true, data: playlist });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async createPlaylist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'demo_user';
      const { name, description } = req.body;

      if (!name) {
        res.status(400).json({ success: false, message: 'Playlist name is required.' });
        return;
      }

      const playlist: Playlist = {
        id: `pl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        name: name.trim(),
        description: description?.trim() || '',
        coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        isPublic: true,
        tracks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const created = db.createPlaylist(playlist);
      res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async updatePlaylist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'demo_user';
      const id = String(req.params.id);
      const { name, description, coverImage } = req.body;

      const updated = db.updatePlaylist(id, userId, { name, description, coverImage });
      if (!updated) {
        res.status(404).json({ success: false, message: 'Playlist not found or unauthorized.' });
        return;
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async deletePlaylist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'demo_user';
      const id = String(req.params.id);

      const deleted = db.deletePlaylist(id, userId);
      res.json({ success: deleted, message: deleted ? 'Playlist removed.' : 'Playlist not found.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async addTrackToPlaylist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'demo_user';
      const id = String(req.params.id);
      const { track } = req.body;

      if (!track || !track.id) {
        res.status(400).json({ success: false, message: 'Track object is required.' });
        return;
      }

      const updated = db.addTrackToPlaylist(id, userId, track);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Playlist not found.' });
        return;
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async removeTrackFromPlaylist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'demo_user';
      const id = String(req.params.id);
      const trackId = String(req.params.trackId);

      const updated = db.removeTrackFromPlaylist(id, userId, trackId);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Playlist not found.' });
        return;
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // --- Likes ---
  public static async getLikedTracks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'demo_user';
      const tracks = db.getLikedTracks(userId);
      res.json({ success: true, data: tracks });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async toggleLikeTrack(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'demo_user';
      const { track } = req.body;

      if (!track || !track.id) {
        res.status(400).json({ success: false, message: 'Track object is required.' });
        return;
      }

      const isLiked = db.toggleLikeTrack(userId, track);
      res.json({
        success: true,
        isLiked,
        message: isLiked ? 'Track added to Liked Songs' : 'Track removed from Liked Songs',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
