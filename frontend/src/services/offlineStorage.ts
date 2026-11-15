import { Track } from '../types';

const DB_NAME = 'ChillmodeOfflineMusicDB';
const LEGACY_DB_NAME = 'NexoraOfflineMusicDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_tracks';

export interface OfflineRecord {
  id: string;
  track: Track;
  audioBlob?: Blob;
  coverBlob?: Blob;
  lyrics?: any;
  size: number;
  mimeType: string;
  downloadedAt: number;
}

class OfflineStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private activeObjectUrls: string[] = [];

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('downloadedAt', 'downloadedAt', { unique: false });
        }
      };

      request.onsuccess = async () => {
        const db = request.result;

        // Perform one-time migration from legacy database if exists
        try {
          await this.migrateLegacyDB(db);
        } catch (e) {
          console.info('Legacy DB migration skipped or completed.');
        }

        resolve(db);
      };

      request.onerror = () => {
        this.dbPromise = null;
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  private async migrateLegacyDB(targetDb: IDBDatabase): Promise<void> {
    if (typeof indexedDB.databases !== 'function') return;
    const dbs = await indexedDB.databases().catch(() => []);
    const hasLegacy = dbs.some(d => d.name === LEGACY_DB_NAME);
    if (!hasLegacy) return;

    return new Promise((resolve) => {
      const legacyReq = indexedDB.open(LEGACY_DB_NAME);
      legacyReq.onsuccess = () => {
        const legacyDb = legacyReq.result;
        if (!legacyDb.objectStoreNames.contains(STORE_NAME)) {
          legacyDb.close();
          resolve();
          return;
        }

        const tx = legacyDb.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const getAll = store.getAll();

        getAll.onsuccess = () => {
          const records: OfflineRecord[] = getAll.result || [];
          if (records.length > 0) {
            const targetTx = targetDb.transaction(STORE_NAME, 'readwrite');
            const targetStore = targetTx.objectStore(STORE_NAME);
            records.forEach(r => targetStore.put(r));
          }
          legacyDb.close();
          resolve();
        };

        getAll.onerror = () => {
          legacyDb.close();
          resolve();
        };
      };
      legacyReq.onerror = () => resolve();
    });
  }

  /**
   * Download a track's audio stream, cover artwork, and lyrics into IndexedDB
   * for 100% offline, zero-network playback.
   */
  public async saveTrackOffline(
    track: Track,
    onProgress?: (percent: number) => void
  ): Promise<boolean> {
    try {
      const db = await this.openDB();

      let streamUrl = track.audioUrl;

      // 1. Resolve stream if missing or YouTube bridge
      if (!streamUrl || track.youtubeId) {
        try {
          const searchRes = await fetch(
            `/api/music/saavn/search?q=${encodeURIComponent(track.title + ' ' + track.artist)}`
          );
          if (searchRes.ok) {
            const data = await searchRes.json();
            if (data.tracks && data.tracks.length > 0 && data.tracks[0].audioUrl) {
              streamUrl = data.tracks[0].audioUrl;
            }
          }
        } catch {}
      }

      // If still missing, check offline pack endpoint
      if (!streamUrl) {
        try {
          const packRes = await fetch('/api/music/offline-pack?limit=40');
          if (packRes.ok) {
            const packData = await packRes.json();
            if (packData.tracks) {
              const match = packData.tracks.find(
                (t: Track) =>
                  t.id === track.id ||
                  t.title.toLowerCase().trim() === track.title.toLowerCase().trim()
              );
              if (match && match.audioUrl) {
                streamUrl = match.audioUrl;
              }
            }
          }
        } catch {}
      }

      let audioBlob: Blob | undefined;
      let size = 0;
      let mimeType = 'audio/mp4';

      if (onProgress) onProgress(20);

      if (streamUrl) {
        const response = await fetch(streamUrl);
        if (!response.ok) {
          throw new Error(`Failed to download audio stream (HTTP ${response.status})`);
        }
        audioBlob = await response.blob();
        size += audioBlob.size;
        mimeType = audioBlob.type || 'audio/mp4';
      }

      if (onProgress) onProgress(60);

      // 2. Download and cache cover art blob so images render completely offline
      let coverBlob: Blob | undefined;
      if (track.coverUrl) {
        try {
          const coverRes = await fetch(track.coverUrl);
          if (coverRes.ok) {
            coverBlob = await coverRes.blob();
            size += coverBlob.size;
          }
        } catch {
          // Non-blocking
        }
      }

      if (onProgress) onProgress(80);

      // 3. Pre-cache synced lyrics if online
      let lyrics: any = undefined;
      try {
        const query = new URLSearchParams({
          track_name: track.title,
          artist_name: track.artist,
        });
        const lRes = await fetch(`https://lrclib.net/api/get?${query.toString()}`, {
          signal: AbortSignal.timeout(2000),
        });
        if (lRes.ok) {
          lyrics = await lRes.json();
        }
      } catch {}

      if (onProgress) onProgress(90);

      const record: OfflineRecord = {
        id: track.id,
        track: {
          ...track,
          license: 'Available Offline (Local Device Storage)',
        },
        audioBlob,
        coverBlob,
        lyrics,
        size,
        mimeType,
        downloadedAt: Date.now(),
      };

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const putReq = store.put(record);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      });

      if (onProgress) onProgress(100);
      return true;
    } catch (err) {
      console.error('saveTrackOffline error:', err);
      throw err;
    }
  }

  /**
   * Retrieve a track from local offline storage and generate local Object URLs
   * for both audio stream and cover artwork.
   */
  public async getOfflineTrack(
    id: string
  ): Promise<{ track: Track; blob?: Blob; objectUrl?: string; coverUrl?: string; lyrics?: any } | null> {
    try {
      const db = await this.openDB();
      const record = await new Promise<OfflineRecord | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(id);
        getReq.onsuccess = () => resolve(getReq.result);
        getReq.onerror = () => reject(getReq.error);
      });

      if (!record) return null;

      let objectUrl: string | undefined;
      if (record.audioBlob) {
        objectUrl = URL.createObjectURL(record.audioBlob);
        this.activeObjectUrls.push(objectUrl);
      }

      let coverUrl = record.track.coverUrl;
      if (record.coverBlob) {
        coverUrl = URL.createObjectURL(record.coverBlob);
        this.activeObjectUrls.push(coverUrl);
      }

      return {
        track: {
          ...record.track,
          audioUrl: objectUrl || record.track.audioUrl,
          coverUrl,
        },
        blob: record.audioBlob,
        objectUrl,
        coverUrl,
        lyrics: record.lyrics,
      };
    } catch (err) {
      console.warn('getOfflineTrack error:', err);
      return null;
    }
  }

  /**
   * Revoke temporary object URLs to free mobile device RAM
   */
  public cleanupUrls() {
    while (this.activeObjectUrls.length > 20) {
      const url = this.activeObjectUrls.shift();
      if (url) {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      }
    }
  }

  /**
   * Get all tracks stored offline
   */
  public async getAllOfflineTracks(): Promise<Array<{ track: Track; size: number; downloadedAt: number }>> {
    try {
      const db = await this.openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const getAllReq = store.getAll();
        getAllReq.onsuccess = () => {
          const records: OfflineRecord[] = getAllReq.result || [];
          const list = records.map(r => {
            let coverUrl = r.track.coverUrl;
            if (r.coverBlob) {
              coverUrl = URL.createObjectURL(r.coverBlob);
              this.activeObjectUrls.push(coverUrl);
            }
            return {
              track: {
                ...r.track,
                coverUrl,
              },
              size: r.size,
              downloadedAt: r.downloadedAt,
            };
          });
          resolve(list);
        };
        getAllReq.onerror = () => reject(getAllReq.error);
      });
    } catch (err) {
      console.warn('getAllOfflineTracks error:', err);
      return [];
    }
  }

  /**
   * Check if a specific track is downloaded offline
   */
  public async isTrackOffline(id: string): Promise<boolean> {
    try {
      const db = await this.openDB();
      return await new Promise<boolean>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const countReq = store.count(id);
        countReq.onsuccess = () => resolve(countReq.result > 0);
        countReq.onerror = () => reject(countReq.error);
      });
    } catch {
      return false;
    }
  }

  /**
   * Remove a track from offline storage
   */
  public async removeOfflineTrack(id: string): Promise<boolean> {
    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const delReq = store.delete(id);
        delReq.onsuccess = () => resolve();
        delReq.onerror = () => reject(delReq.error);
      });
      return true;
    } catch (err) {
      console.warn('removeOfflineTrack error:', err);
      return false;
    }
  }

  /**
   * Clear all downloaded tracks from storage
   */
  public async clearAllOfflineTracks(): Promise<boolean> {
    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const clearReq = store.clear();
        clearReq.onsuccess = () => resolve();
        clearReq.onerror = () => reject(clearReq.error);
      });
      return true;
    } catch (err) {
      console.warn('clearAllOfflineTracks error:', err);
      return false;
    }
  }

  /**
   * Get storage usage metrics (track count & total megabytes)
   */
  public async getOfflineStats(): Promise<{ count: number; totalBytes: number; formattedSize: string }> {
    try {
      const db = await this.openDB();
      const records = await new Promise<OfflineRecord[]>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const getAllReq = store.getAll();
        getAllReq.onsuccess = () => resolve(getAllReq.result || []);
        getAllReq.onerror = () => reject(getAllReq.error);
      });

      const totalBytes = records.reduce((acc, r) => acc + (r.size || 0), 0);
      const count = records.length;

      let formattedSize = '0 MB';
      if (totalBytes > 1024 * 1024 * 1024) {
        formattedSize = `${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      } else {
        formattedSize = `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
      }

      return { count, totalBytes, formattedSize };
    } catch {
      return { count: 0, totalBytes: 0, formattedSize: '0 MB' };
    }
  }
}

export const offlineStorage = new OfflineStorageService();
