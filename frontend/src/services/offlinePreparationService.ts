import { Track } from '../types';
import { offlineStorage } from './offlineStorage';
import { musicApi } from './musicApi';

export interface PreparationProgress {
  current: number;
  total: number;
  trackTitle: string;
  stage: 'metadata' | 'audio' | 'covers' | 'complete';
  percent: number;
}

export class OfflinePreparationService {
  /**
   * Pre-cache critical application metadata (Home feed, languages, playlists)
   * into localStorage for instantaneous offline rendering.
   */
  public static async precacheMetadata(): Promise<boolean> {
    try {
      const [feedRes, langRes, plRes, likesRes] = await Promise.all([
        musicApi.getHomeFeed({ refresh: false }).catch(() => null),
        musicApi.getLanguages().catch(() => null),
        musicApi.getUserPlaylists().catch(() => null),
        musicApi.getLikedTracks().catch(() => null),
      ]);

      if (feedRes?.data) {
        localStorage.setItem('chillmode_cached_home_feed', JSON.stringify(feedRes));
      }
      if (langRes?.data) {
        localStorage.setItem('chillmode_cached_languages', JSON.stringify(langRes));
      }
      if (plRes?.data) {
        localStorage.setItem('chillmode_cached_playlists', JSON.stringify(plRes));
      }
      if (likesRes?.data) {
        localStorage.setItem('chillmode_cached_likes', JSON.stringify(likesRes));
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * One-Click Offline Preparation Pack:
   * Downloads 15 essential high-fidelity tracks with audio blobs, cover artwork, and lyrics,
   * along with complete feed metadata so the app is 100% functional with zero internet.
   */
  public static async prepareOfflinePack(
    count = 15,
    onProgress?: (p: PreparationProgress) => void
  ): Promise<{ success: boolean; downloadedCount: number; message: string }> {
    if (onProgress) {
      onProgress({
        current: 0,
        total: count,
        trackTitle: 'Caching App Shell & Music Telemetry...',
        stage: 'metadata',
        percent: 5,
      });
    }

    // Step 1: Pre-cache metadata
    await this.precacheMetadata();

    // Step 2: Fetch tracks to download
    let candidateTracks: Track[] = [];

    try {
      const res = await fetch(`/api/music/offline-pack?limit=${count}`);
      if (res.ok) {
        const data = await res.json();
        if (data.tracks && data.tracks.length > 0) {
          candidateTracks = data.tracks;
        }
      }
    } catch {}

    // Fallback candidates from home feed if offline-pack endpoint was unreachable
    if (candidateTracks.length === 0) {
      try {
        const feedRes = await musicApi.getHomeFeed({ refresh: false });
        if (feedRes.success && feedRes.data) {
          candidateTracks = [
            ...(feedRes.data.trending || []),
            ...(feedRes.data.jioSaavnTrending || []),
          ].slice(0, count);
        }
      } catch {}
    }

    if (candidateTracks.length === 0) {
      throw new Error('Unable to discover tracks to prepare for offline.');
    }

    let downloadedCount = 0;
    const total = candidateTracks.length;

    for (let i = 0; i < total; i++) {
      const track = candidateTracks[i];
      const percent = Math.round(10 + ((i + 1) / total) * 85);

      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          trackTitle: `${track.title} • ${track.artist}`,
          stage: 'audio',
          percent,
        });
      }

      try {
        await offlineStorage.saveTrackOffline(track);
        downloadedCount++;
      } catch (e) {
        console.warn(`Failed to cache ${track.title}:`, e);
      }
    }

    if (onProgress) {
      onProgress({
        current: total,
        total,
        trackTitle: 'All Offline Audio Blobs & Covers Secured!',
        stage: 'complete',
        percent: 100,
      });
    }

    return {
      success: true,
      downloadedCount,
      message: `${downloadedCount} high-fidelity songs, artwork, and telemetry are prepared for offline playback.`,
    };
  }

  /**
   * Download all user's liked tracks for offline listening
   */
  public static async prepareLikedTracks(
    onProgress?: (p: PreparationProgress) => void
  ): Promise<number> {
    const likesRes = await musicApi.getLikedTracks().catch(() => null);
    if (!likesRes || !likesRes.data || likesRes.data.length === 0) {
      return 0;
    }

    const tracks = likesRes.data;
    let count = 0;
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: tracks.length,
          trackTitle: track.title,
          stage: 'audio',
          percent: Math.round(((i + 1) / tracks.length) * 100),
        });
      }
      try {
        await offlineStorage.saveTrackOffline(track);
        count++;
      } catch {}
    }
    return count;
  }
}
