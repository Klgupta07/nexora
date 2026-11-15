import axios from 'axios';
import { Track } from '../../database/db.js';

export interface YouTubeVideoItem {
  id: string; // YouTube Video ID
  title: string;
  artist: string;
  thumbnail: string;
  duration?: number;
  viewCount?: string;
}

// Curated Top Global Hits from YouTube Music & Spotify Charts
export const CURATED_TRENDING_VIDEOS: Track[] = [
  // --- GLOBAL POP & TOP 50 ---
  {
    id: 'yt-ic8j13piAhQ',
    title: 'Cruel Summer',
    artist: 'Taylor Swift',
    album: 'Lover',
    duration: 178,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg',
    genre: 'Pop',
    language: 'English',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'ic8j13piAhQ',
    isVideo: true,
  },
  {
    id: 'yt-4NRXx6U8ABQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 260,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
    genre: 'Pop / Synthwave',
    language: 'English',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: '4NRXx6U8ABQ',
    isVideo: true,
  },
  {
    id: 'yt-TUVcZfQe-Kw',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: 223,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg',
    genre: 'Pop / Disco',
    language: 'English',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'TUVcZfQe-Kw',
    isVideo: true,
  },
  {
    id: 'yt-H5v3kku4y6Q',
    title: 'As It Was',
    artist: 'Harry Styles',
    album: "Harry's House",
    duration: 167,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg',
    genre: 'Indie Pop',
    language: 'English',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'H5v3kku4y6Q',
    isVideo: true,
  },
  {
    id: 'yt-b1kbLwvqugk',
    title: 'Anti-Hero',
    artist: 'Taylor Swift',
    album: 'Midnights',
    duration: 310,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg',
    genre: 'Pop',
    language: 'English',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'b1kbLwvqugk',
    isVideo: true,
  },
  {
    id: 'yt-eVli-tstM5E',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    album: 'Short n Sweet',
    duration: 175,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/eVli-tstM5E/hqdefault.jpg',
    genre: 'Pop / Nu-Disco',
    language: 'English',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'eVli-tstM5E',
    isVideo: true,
  },
  {
    id: 'yt-G7KNmW9a75Y',
    title: 'Flowers',
    artist: 'Miley Cyrus',
    album: 'Endless Summer Vacation',
    duration: 200,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/G7KNmW9a75Y/hqdefault.jpg',
    genre: 'Pop / Disco',
    language: 'English',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'G7KNmW9a75Y',
    isVideo: true,
  },

  // --- HIP-HOP & RAP GLOBAL ---
  {
    id: 'yt-H2mE_oJzV0g',
    title: 'Not Like Us',
    artist: 'Kendrick Lamar',
    album: 'Single',
    duration: 274,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/H2mE_oJzV0g/hqdefault.jpg',
    genre: 'Hip-Hop / West Coast',
    language: 'English',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'H2mE_oJzV0g',
    isVideo: true,
  },
  {
    id: 'yt-ApXoWvfEYVU',
    title: 'Sunflower',
    artist: 'Post Malone, Swae Lee',
    album: 'Spider-Man Soundtrack',
    duration: 158,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/ApXoWvfEYVU/hqdefault.jpg',
    genre: 'Hip-Hop / Pop',
    language: 'English',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'ApXoWvfEYVU',
    isVideo: true,
  },
  {
    id: 'yt-xpVfcZ0ZcFM',
    title: "God's Plan",
    artist: 'Drake',
    album: 'Scorpion',
    duration: 356,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/xpVfcZ0ZcFM/hqdefault.jpg',
    genre: 'Hip-Hop / Trap',
    language: 'English',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'xpVfcZ0ZcFM',
    isVideo: true,
  },
  {
    id: 'yt-Uq9gPaIzbe8',
    title: 'FE!N',
    artist: 'Travis Scott ft. Playboi Carti',
    album: 'UTOPIA',
    duration: 191,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/Uq9gPaIzbe8/hqdefault.jpg',
    genre: 'Rage / Trap',
    language: 'English',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'Uq9gPaIzbe8',
    isVideo: true,
  },

  // --- BOLLYWOOD & DESI HITS (YouTube Music India Top) ---
  {
    id: 'yt-BddP6PYo2gs',
    title: 'Kesariya',
    artist: 'Arijit Singh, Pritam',
    album: 'Brahmastra',
    duration: 268,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg',
    genre: 'Bollywood / Romantic',
    language: 'Hindi',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'BddP6PYo2gs',
    isVideo: true,
  },
  {
    id: 'yt-BjL7AuPsmEk',
    title: 'Tum Hi Ho',
    artist: 'Arijit Singh, Mithoon',
    album: 'Aashiqui 2',
    duration: 262,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/BjL7AuPsmEk/hqdefault.jpg',
    genre: 'Bollywood / Sufi',
    language: 'Hindi',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'BjL7AuPsmEk',
    isVideo: true,
  },
  {
    id: 'yt-YxWlaYCA8MU',
    title: 'Chaleya',
    artist: 'Arijit Singh, Shilpa Rao, Anirudh',
    album: 'Jawan',
    duration: 200,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/YxWlaYCA8MU/hqdefault.jpg',
    genre: 'Bollywood Dance',
    language: 'Hindi',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'YxWlaYCA8MU',
    isVideo: true,
  },
  {
    id: 'yt-V7LwfY5U5WI',
    title: 'Brown Munde',
    artist: 'AP Dhillon, Gurinder Gill, Shinda Kahlon',
    album: 'Not by Chance',
    duration: 266,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/V7LwfY5U5WI/hqdefault.jpg',
    genre: 'Punjabi Drill',
    language: 'Punjabi',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'V7LwfY5U5WI',
    isVideo: true,
  },
  {
    id: 'yt-5Eqb_-j3FDA',
    title: 'Pasoori',
    artist: 'Ali Sethi, Shae Gill',
    album: 'Coke Studio Season 14',
    duration: 224,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/5Eqb_-j3FDA/hqdefault.jpg',
    genre: 'Desi Pop',
    language: 'Hindi',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: '5Eqb_-j3FDA',
    isVideo: true,
  },

  // --- LATIN & REGGAETON (YouTube Music Latin Top) ---
  {
    id: 'yt-Cr8K88UcO0s',
    title: 'Tití Me Preguntó',
    artist: 'Bad Bunny',
    album: 'Un Verano Sin Ti',
    duration: 243,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/Cr8K88UcO0s/hqdefault.jpg',
    genre: 'Dembow / Reggaeton',
    language: 'Spanish',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'Cr8K88UcO0s',
    isVideo: true,
  },
  {
    id: 'yt-kJQP7kiw5Fk',
    title: 'Despacito',
    artist: 'Luis Fonsi ft. Daddy Yankee',
    album: 'VIDA',
    duration: 281,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    genre: 'Latin Pop / Reggaeton',
    language: 'Spanish',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'kJQP7kiw5Fk',
    isVideo: true,
  },
  {
    id: 'yt-ca6Zvew_k3E',
    title: 'Provenza',
    artist: 'Karol G',
    album: 'Mañana Será Bonito',
    duration: 210,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/ca6Zvew_k3E/hqdefault.jpg',
    genre: 'Latin Dance',
    language: 'Spanish',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'ca6Zvew_k3E',
    isVideo: true,
  },

  // --- K-POP & ANIME / J-POP ---
  {
    id: 'yt-gdZLi9oWNZg',
    title: 'Dynamite',
    artist: 'BTS',
    album: 'BE',
    duration: 223,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/gdZLi9oWNZg/hqdefault.jpg',
    genre: 'K-Pop / Disco',
    language: 'Korean',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'gdZLi9oWNZg',
    isVideo: true,
  },
  {
    id: 'yt-gQlMMD8auMs',
    title: 'Pink Venom',
    artist: 'BLACKPINK',
    album: 'BORN PINK',
    duration: 193,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/gQlMMD8auMs/hqdefault.jpg',
    genre: 'K-Pop / Hip-Hop',
    language: 'Korean',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'gQlMMD8auMs',
    isVideo: true,
  },
  {
    id: 'yt-pSUydWEqKwE',
    title: 'Ditto',
    artist: 'NewJeans',
    album: 'OMG',
    duration: 185,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/pSUydWEqKwE/hqdefault.jpg',
    genre: 'K-Pop / Lo-Fi Pop',
    language: 'Korean',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'pSUydWEqKwE',
    isVideo: true,
  },
  {
    id: 'yt-by4SYYWlhEs',
    title: 'Yoru ni Kakeru (Racing into the Night)',
    artist: 'YOASOBI',
    album: 'THE BOOK',
    duration: 261,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/by4SYYWlhEs/hqdefault.jpg',
    genre: 'J-Pop',
    language: 'Japanese',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'by4SYYWlhEs',
    isVideo: true,
  },
  {
    id: 'yt-MpYy6wwqxoo',
    title: 'Gurenge (Demon Slayer Opening)',
    artist: 'LiSA',
    album: 'LEO-NiNE',
    duration: 236,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/MpYy6wwqxoo/hqdefault.jpg',
    genre: 'Anime OST / J-Rock',
    language: 'Japanese',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'MpYy6wwqxoo',
    isVideo: true,
  },
  {
    id: 'yt-KUN5Uf9mObQ',
    title: 'Arabic Kuthu (Halamithi Habibo)',
    artist: 'Anirudh Ravichander, Jonita Gandhi',
    album: 'Beast',
    duration: 280,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/KUN5Uf9mObQ/hqdefault.jpg',
    genre: 'Tamil Kuthu / Electronic',
    language: 'Tamil',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'KUN5Uf9mObQ',
    isVideo: true,
  },
  {
    id: 'yt-Os_heh8vPfs',
    title: 'Naatu Naatu',
    artist: 'Rahul Sipligunj, Kaala Bhairava, M.M. Keeravani',
    album: 'RRR',
    duration: 275,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/Os_heh8vPfs/hqdefault.jpg',
    genre: 'Telugu Folk / Mass',
    language: 'Telugu',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'Os_heh8vPfs',
    isVideo: true,
  },
  {
    id: 'yt-d5gf9dXFK9U',
    title: 'Birds of a Feather',
    artist: 'Billie Eilish',
    album: 'HIT ME HARD AND SOFT',
    duration: 196,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/d5gf9dXFK9U/hqdefault.jpg',
    genre: 'Alt Pop',
    language: 'English',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'd5gf9dXFK9U',
    isVideo: true,
  },
  {
    id: 'yt-JGwWNGJdvx8',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    duration: 233,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    genre: 'Pop',
    language: 'English',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'JGwWNGJdvx8',
    isVideo: true,
  },
  {
    id: 'yt-34Na4j8AVgA',
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    album: 'Starboy',
    duration: 230,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg',
    genre: 'R&B / Electro',
    language: 'English',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: '34Na4j8AVgA',
    isVideo: true,
  },
  {
    id: 'yt-cl0a3i2wFcc',
    title: 'Lover',
    artist: 'Diljit Dosanjh',
    album: 'MoonChild Era',
    duration: 188,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/cl0a3i2wFcc/hqdefault.jpg',
    genre: 'Punjabi Pop',
    language: 'Punjabi',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'cl0a3i2wFcc',
    isVideo: true,
  },
  {
    id: 'yt-n_FCrCQ6-9U',
    title: '295',
    artist: 'Sidhu Moose Wala',
    album: 'Moosetape',
    duration: 270,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/n_FCrCQ6-9U/hqdefault.jpg',
    genre: 'Punjabi Hip-Hop',
    language: 'Punjabi',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'n_FCrCQ6-9U',
    isVideo: true,
  },
  {
    id: 'yt-8lZfZl44E5E',
    title: 'Love Dose',
    artist: 'Yo Yo Honey Singh',
    album: 'Desi Kalakaar',
    duration: 228,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/8lZfZl44E5E/hqdefault.jpg',
    genre: 'Desi Hip-Hop',
    language: 'Hindi',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: '8lZfZl44E5E',
    isVideo: true,
  },
  {
    id: 'yt-QU9c0053UAU',
    title: 'Seven',
    artist: 'Jung Kook ft. Latto',
    album: 'Golden',
    duration: 184,
    audioUrl: '',
    coverUrl: 'https://i.ytimg.com/vi/QU9c0053UAU/hqdefault.jpg',
    genre: 'K-Pop / Garage Pop',
    language: 'Korean',
    license: 'YouTube Music Official Stream',
    source: 'YouTube Music',
    youtubeId: 'QU9c0053UAU',
    isVideo: true,
  },
];

export class YouTubeService {
  /**
   * Search real YouTube music videos and songs across the global catalogue
   */
  public static async searchVideos(rawQuery: string, limit = 20): Promise<Track[]> {
    const q = rawQuery.trim();
    if (!q) return CURATED_TRENDING_VIDEOS.slice(0, limit);

    // Direct YouTube link or 11-char video ID support
    const urlMatch = q.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/);
    if (urlMatch) {
      const vid = urlMatch[1];
      return [this.getTrackByVideoId(vid)];
    }
    if (/^[a-zA-Z0-9_-]{11}$/.test(q)) {
      return [this.getTrackByVideoId(q)];
    }

    // Check curated hits first
    const localMatches = CURATED_TRENDING_VIDEOS.filter(
      v =>
        v.title.toLowerCase().includes(q.toLowerCase()) ||
        v.artist.toLowerCase().includes(q.toLowerCase()) ||
        (v.album && v.album.toLowerCase().includes(q.toLowerCase())) ||
        (v.genre && v.genre.toLowerCase().includes(q.toLowerCase())) ||
        (v.language && v.language.toLowerCase().includes(q.toLowerCase()))
    );

    try {
      // Query YouTube search endpoint for music tracks
      const isMusicKeywordPresent = /song|music|audio|track|remix|official/i.test(q);
      const queryParam = isMusicKeywordPresent ? q : `${q} official audio`;
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(queryParam)}&sp=EgIQAQ%253D%253D`;
      const res = await axios.get(searchUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 4500,
      });

      const match = res.data.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
      if (match) {
        const data = JSON.parse(match[1]);
        const contents =
          data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]
            ?.itemSectionRenderer?.contents;

        if (contents && Array.isArray(contents)) {
          const liveResults: Track[] = [];

          for (const item of contents) {
            const v = item.videoRenderer;
            if (v && v.videoId) {
              const title = v.title?.runs?.[0]?.text || 'Music Track';
              const artist = v.ownerText?.runs?.[0]?.text || 'Artist';
              const thumb =
                v.thumbnail?.thumbnails?.[v.thumbnail?.thumbnails?.length - 1]?.url ||
                `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

              // Parse length string (e.g. "3:45")
              let duration = 210;
              const lenText = v.lengthText?.simpleText;
              if (lenText) {
                const parts = lenText.split(':').map(Number);
                if (parts.length === 2) {
                  duration = parts[0] * 60 + parts[1];
                } else if (parts.length === 3) {
                  duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
                }
              }

              liveResults.push({
                id: `yt-${v.videoId}`,
                title,
                artist,
                album: 'YouTube Music Hit',
                duration,
                audioUrl: '', // Streamed via YouTube Audio Bridge
                coverUrl: thumb,
                genre: 'Global Hit',
                language: 'Global',
                license: 'Official Music Video / Audio (YouTube Music)',
                source: 'YouTube Music',
                youtubeId: v.videoId,
                isVideo: true,
              });

              if (liveResults.length >= limit) break;
            }
          }

          if (liveResults.length > 0) {
            // Deduplicate
            const seen = new Set<string>();
            const combined: Track[] = [];
            for (const item of [...localMatches, ...liveResults]) {
              if (item.youtubeId && !seen.has(item.youtubeId)) {
                seen.add(item.youtubeId);
                combined.push(item);
              }
            }
            return combined.slice(0, limit);
          }
        }
      }
    } catch (err: any) {
      console.warn('Live YouTube resolution error, falling back to curated registry:', err.message);
    }

    return localMatches.length > 0 ? localMatches : CURATED_TRENDING_VIDEOS.slice(0, limit);
  }

  public static getTrendingVideos(limit = 24, shuffle = false): Track[] {
    if (shuffle && CURATED_TRENDING_VIDEOS.length > 0) {
      const copy = [...CURATED_TRENDING_VIDEOS];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy.slice(0, limit);
    }
    return CURATED_TRENDING_VIDEOS.slice(0, limit);
  }

  public static getTrackByVideoId(videoId: string): Track {
    const cleanId = videoId.replace(/^yt-/, '');
    const found = CURATED_TRENDING_VIDEOS.find(v => v.youtubeId === cleanId || v.id === `yt-${cleanId}`);
    if (found) return found;

    return {
      id: `yt-${cleanId}`,
      title: `YouTube Music Track (${cleanId})`,
      artist: 'YouTube Music Stream',
      album: 'YouTube Music Hit',
      duration: 210,
      audioUrl: '',
      coverUrl: `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`,
      genre: 'Global Hit',
      language: 'Global',
      license: 'YouTube Music Official Stream',
      source: 'YouTube Music',
      youtubeId: cleanId,
      isVideo: true,
    };
  }
}
