import fs from 'fs';
import path from 'path';
import os from 'os';
import { User, Track, Playlist, LikedTrack, DatabaseSchema } from '../types/index.js';

export { User, Track, Playlist, LikedTrack, DatabaseSchema };

const isServerless = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) || Boolean(process.env.NOW_REGION);
const DB_DIR = isServerless ? path.resolve(os.tmpdir(), 'chillmode_data') : path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'chillmode_db.json');

class Database {
  private data: DatabaseSchema = {
    users: [],
    playlists: [],
    likedTracks: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        try {
          const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
          this.data = JSON.parse(fileContent);
          return;
        } catch (err) {
          console.error('Failed to parse database file, checking seed...', err);
        }
      }

      // If DB_FILE does not exist or failed to parse, look for seeds
      const seedCandidates = [
        path.resolve(process.cwd(), 'data', 'chillmode_db.json'),
        path.resolve(process.cwd(), 'data', 'nexora_db.json'),
        path.resolve(process.cwd(), 'backend', 'data', 'chillmode_db.json'),
        path.resolve(process.cwd(), 'backend', 'data', 'nexora_db.json'),
        path.resolve(__dirname, '..', '..', 'data', 'chillmode_db.json'),
        path.resolve(__dirname, '..', '..', 'data', 'nexora_db.json'),
        path.resolve(__dirname, '..', 'data', 'nexora_db.json'),
      ];

      const foundSeed = seedCandidates.find(p => fs.existsSync(p));
      if (foundSeed) {
        try {
          const seedContent = fs.readFileSync(foundSeed, 'utf-8');
          this.data = JSON.parse(seedContent);
          console.log(`Loaded initial database state from seed: ${foundSeed}`);
          this.save();
          return;
        } catch (err) {
          console.warn('Failed reading seed file:', err);
        }
      }

      this.save();
    } catch (err) {
      console.warn('Database initialization warning (using in-memory schema):', err);
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.warn('Warning: Could not persist database file (in-memory state active):', err);
    }
  }

  // --- Users ---
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // --- Playlists ---
  public getUserPlaylists(userId: string): Playlist[] {
    return this.data.playlists.filter(p => p.userId === userId);
  }

  public getPlaylistById(id: string): Playlist | undefined {
    return this.data.playlists.find(p => p.id === id);
  }

  public createPlaylist(playlist: Playlist): Playlist {
    this.data.playlists.push(playlist);
    this.save();
    return playlist;
  }

  public updatePlaylist(id: string, userId: string, updates: Partial<Playlist>): Playlist | null {
    const idx = this.data.playlists.findIndex(p => p.id === id && p.userId === userId);
    if (idx === -1) return null;
    this.data.playlists[idx] = {
      ...this.data.playlists[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.playlists[idx];
  }

  public deletePlaylist(id: string, userId: string): boolean {
    const idx = this.data.playlists.findIndex(p => p.id === id && p.userId === userId);
    if (idx === -1) return false;
    this.data.playlists.splice(idx, 1);
    this.save();
    return true;
  }

  public addTrackToPlaylist(playlistId: string, userId: string, track: Track): Playlist | null {
    const playlist = this.data.playlists.find(p => p.id === playlistId && p.userId === userId);
    if (!playlist) return null;
    // Don't add duplicate
    if (!playlist.tracks.some(t => t.id === track.id)) {
      playlist.tracks.push(track);
      playlist.updatedAt = new Date().toISOString();
      this.save();
    }
    return playlist;
  }

  public removeTrackFromPlaylist(playlistId: string, userId: string, trackId: string): Playlist | null {
    const playlist = this.data.playlists.find(p => p.id === playlistId && p.userId === userId);
    if (!playlist) return null;
    playlist.tracks = playlist.tracks.filter(t => t.id !== trackId);
    playlist.updatedAt = new Date().toISOString();
    this.save();
    return playlist;
  }

  // --- Liked Tracks ---
  public getLikedTracks(userId: string): Track[] {
    return this.data.likedTracks
      .filter(l => l.userId === userId)
      .map(l => l.track);
  }

  public isTrackLiked(userId: string, trackId: string): boolean {
    return this.data.likedTracks.some(l => l.userId === userId && l.track.id === trackId);
  }

  public toggleLikeTrack(userId: string, track: Track): boolean {
    const idx = this.data.likedTracks.findIndex(l => l.userId === userId && l.track.id === track.id);
    if (idx !== -1) {
      this.data.likedTracks.splice(idx, 1);
      this.save();
      return false; // unliked
    } else {
      this.data.likedTracks.unshift({
        userId,
        track,
        likedAt: new Date().toISOString()
      });
      this.save();
      return true; // liked
    }
  }
}

export const db = new Database();
