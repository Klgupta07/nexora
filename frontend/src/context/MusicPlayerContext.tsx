import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Track } from '../types';
import { musicApi } from '../services/musicApi';
import { offlineStorage } from '../services/offlineStorage';
import { useNotification } from './NotificationContext';
import { audioDspEngine } from '../services/audioDspEngine';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

type RepeatMode = 'off' | 'all' | 'one';

interface MusicPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  currentTime: number; // in seconds
  duration: number; // in seconds
  queue: Track[];
  history: Track[];
  isShuffle: boolean;
  repeatMode: RepeatMode;
  isFullscreen: boolean;
  isQueueOpen: boolean;
  likedTrackIds: Set<string>;
  downloadedTrackIds: Set<string>;
  downloadingTrackIds: Set<string>;
  isOfflinePlaying: boolean;
  isOnline: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isAudioDashboardOpen: boolean;
  isSongPopupOpen: boolean;
  
  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleLike: (track: Track) => Promise<void>;
  downloadTrackOffline: (track: Track) => Promise<boolean>;
  removeOfflineTrack: (trackId: string) => Promise<boolean>;
  downloadAllOffline: (tracks: Track[]) => Promise<void>;
  setIsFullscreen: (val: boolean) => void;
  setIsQueueOpen: (val: boolean) => void;
  setIsAudioDashboardOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleAudioDashboard: () => void;
  setIsSongPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSongPopup: () => void;
  resetContentComposition: (options?: { purgeOffline?: boolean; keepLiked?: boolean }) => Promise<void>;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [queue, setQueue] = useState<Track[]>([]);
  const [history, setHistory] = useState<Track[]>([]);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set());
  const [downloadedTrackIds, setDownloadedTrackIds] = useState<Set<string>>(new Set());
  const [downloadingTrackIds, setDownloadingTrackIds] = useState<Set<string>>(new Set());
  const [isOfflinePlaying, setIsOfflinePlaying] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSongPopupOpen, setIsSongPopupOpen] = useState<boolean>(true);
  const isAudioDashboardOpen = isSongPopupOpen;
  const setIsAudioDashboardOpen = setIsSongPopupOpen;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const isYtReadyRef = useRef<boolean>(false);
  const pendingTrackRef = useRef<Track | null>(null);
  const syncTimerRef = useRef<any>(null);
  const currentTrackRef = useRef<Track | null>(null);
  currentTrackRef.current = currentTrack;

  const { addNotification } = useNotification();
  const nextTrackRef = useRef<() => void>(() => {});

  // Monitor network status transitions (Mobile & Desktop)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addNotification({
        type: 'success',
        title: 'Network Connected',
        message: 'Online streaming, charts & multi-source search restored.',
        duration: 3000,
      });
      // Re-sync liked songs from backend
      musicApi.getLikedTracks()
        .then(res => {
          if (res.success && res.data) {
            setLikedTrackIds(new Set(res.data.map(t => t.id)));
          }
        })
        .catch(() => {});
    };

    const handleOffline = () => {
      setIsOnline(false);
      addNotification({
        type: 'info',
        title: 'Offline Mode Active',
        message: 'Device is offline. All downloaded songs and local audio remain 100% playable.',
        duration: 4000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addNotification]);

  // 1. Initialize HTML5 Audio Element & Load Offline Library
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    audio.volume = volume;
    audioRef.current = audio;

    // Attach high-fidelity Audiophile DSP audio engine
    audioDspEngine.attach(audio);

    const handleTimeUpdate = () => {
      if (!currentTrackRef.current?.youtubeId || isOfflinePlaying) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (!currentTrackRef.current?.youtubeId || isOfflinePlaying) {
        setDuration(audio.duration || 0);
      }
    };

    const handlePlay = () => {
      if (!currentTrackRef.current?.youtubeId || isOfflinePlaying) {
        setIsPlaying(true);
      }
    };

    const handlePause = () => {
      if (!currentTrackRef.current?.youtubeId || isOfflinePlaying) {
        setIsPlaying(false);
      }
    };

    const handleEnded = () => {
      if (!currentTrackRef.current?.youtubeId || isOfflinePlaying) {
        nextTrackRef.current();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    // Load initial liked tracks & offline saved tracks
    musicApi.getLikedTracks()
      .then(res => {
        if (res.success && res.data) {
          setLikedTrackIds(new Set(res.data.map(t => t.id)));
        }
      })
      .catch(() => {});

    offlineStorage.getAllOfflineTracks()
      .then(items => {
        setDownloadedTrackIds(new Set(items.map(i => i.track.id)));
      })
      .catch(() => {});

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // 2. Initialize YouTube IFrame API Off-Screen Audio Bridge
  useEffect(() => {
    let bridgeDiv = document.getElementById('nexora-yt-audio-bridge');
    if (!bridgeDiv) {
      bridgeDiv = document.createElement('div');
      bridgeDiv.id = 'nexora-yt-audio-bridge';
      bridgeDiv.style.position = 'fixed';
      bridgeDiv.style.top = '-9999px';
      bridgeDiv.style.left = '-9999px';
      bridgeDiv.style.width = '1px';
      bridgeDiv.style.height = '1px';
      bridgeDiv.style.opacity = '0';
      bridgeDiv.style.pointerEvents = 'none';
      bridgeDiv.style.zIndex = '-999';
      document.body.appendChild(bridgeDiv);
    }

    const initBridge = () => {
      if (ytPlayerRef.current || !window.YT || !window.YT.Player) return;
      try {
        ytPlayerRef.current = new window.YT.Player('nexora-yt-audio-bridge', {
          height: '1',
          width: '1',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: (event: any) => {
              isYtReadyRef.current = true;
              event.target.setVolume(Math.round(volume * 100));
              if (pendingTrackRef.current) {
                const pending = pendingTrackRef.current;
                pendingTrackRef.current = null;
                if (pending.youtubeId) {
                  event.target.loadVideoById(pending.youtubeId);
                  event.target.playVideo();
                  setIsPlaying(true);
                }
              }
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                const d = event.target.getDuration ? event.target.getDuration() : 0;
                if (d > 0) setDuration(d);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (event.data === window.YT.PlayerState.ENDED) {
                nextTrackRef.current();
              }
            },
            onError: (event: any) => {
              console.warn('YouTube Player Audio Bridge event error:', event.data);
            },
          },
        });
      } catch (err) {
        console.warn('Error creating YT Player bridge:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      initBridge();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === 'function') prevCallback();
        initBridge();
      };
    }

    return () => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
        ytPlayerRef.current = null;
      }
    };
  }, []);

  // 3. YouTube Playback Time & Duration Sync
  useEffect(() => {
    if (!currentTrack?.youtubeId || isOfflinePlaying || !isPlaying) {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
        syncTimerRef.current = null;
      }
      return;
    }

    syncTimerRef.current = setInterval(() => {
      if (ytPlayerRef.current && isYtReadyRef.current) {
        try {
          if (typeof ytPlayerRef.current.getCurrentTime === 'function') {
            const t = ytPlayerRef.current.getCurrentTime();
            if (typeof t === 'number') setCurrentTime(t);
          }
          if (typeof ytPlayerRef.current.getDuration === 'function') {
            const d = ytPlayerRef.current.getDuration();
            if (typeof d === 'number' && d > 0) setDuration(d);
          }
        } catch {}
      }
    }, 400);

    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    };
  }, [currentTrack, isPlaying, isOfflinePlaying]);

  // Play a track: Checks Offline Storage first, then JioSaavn direct audio, then YouTube bridge
  const playTrack = useCallback(async (track: Track, newQueue?: Track[]) => {
    if (newQueue && newQueue.length > 0) {
      const trackIdx = newQueue.findIndex(t => t.id === track.id);
      if (trackIdx !== -1) {
        setQueue(newQueue.slice(trackIdx + 1));
      } else {
        setQueue(newQueue);
      }
    }

    if (currentTrack) {
      setHistory(prev => [currentTrack, ...prev.slice(0, 25)]);
    }

    // 1. Check if track exists in Offline Local Storage!
    const offlineItem = await offlineStorage.getOfflineTrack(track.id);
    if (offlineItem && offlineItem.objectUrl) {
      setIsOfflinePlaying(true);
      setCurrentTrack(offlineItem.track);
      setIsSongPopupOpen(true);
      setCurrentTime(0);
      setDuration(offlineItem.track.duration || 0);

      // Pause YouTube player if active
      if (ytPlayerRef.current && isYtReadyRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {}
      }

      // Play directly from local device Blob
      if (audioRef.current) {
        audioRef.current.src = offlineItem.objectUrl;
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.warn('Offline audio play error:', err);
          });
      }
      offlineStorage.cleanupUrls();
      return;
    }

    // 2. Offline Resilience: If device is offline and track is not downloaded, auto-fallback to available offline audio!
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      try {
        const offlineList = await offlineStorage.getAllOfflineTracks();
        if (offlineList && offlineList.length > 0) {
          addNotification({
            type: 'info',
            title: 'Playing from Offline Storage',
            message: `"${track.title}" is not downloaded. Playing "${offlineList[0].track.title}" from your offline vault.`,
            duration: 4000,
          });
          playTrack(offlineList[0].track, offlineList.map(i => i.track));
          return;
        } else {
          addNotification({
            type: 'error',
            title: 'Offline & No Tracks Saved',
            message: 'Connect to network or tap "Prepare Offline" to download tracks for zero-network playback.',
            duration: 4500,
          });
        }
      } catch {}
    }

    setIsOfflinePlaying(false);
    setCurrentTrack(track);
    setIsSongPopupOpen(true);
    setCurrentTime(0);
    setDuration(track.duration || 0);

    // 2. Online playback
    if (track.youtubeId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      if (ytPlayerRef.current && isYtReadyRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
        try {
          ytPlayerRef.current.loadVideoById(track.youtubeId);
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        } catch (err) {
          console.warn('Error loading YT track:', err);
        }
      } else {
        pendingTrackRef.current = track;
      }
    } else if (track.audioUrl) {
      if (ytPlayerRef.current && isYtReadyRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {}
      }

      if (audioRef.current) {
        audioRef.current.src = track.audioUrl;
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.warn('Playback autoplay was prevented or failed:', err);
          });
      }
    }
  }, [currentTrack]);

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;

    if (isOfflinePlaying) {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      return;
    }

    if (currentTrack.youtubeId) {
      if (ytPlayerRef.current && isYtReadyRef.current) {
        try {
          if (isPlaying) {
            ytPlayerRef.current.pauseVideo();
            setIsPlaying(false);
          } else {
            ytPlayerRef.current.playVideo();
            setIsPlaying(true);
          }
        } catch (err) {
          console.warn('YT toggle play error:', err);
        }
      }
    } else {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        if (audioRef.current.src) {
          audioRef.current.play().catch(console.error);
        }
      }
    }
  }, [isPlaying, currentTrack, isOfflinePlaying]);

  const nextTrack = useCallback(() => {
    if (repeatMode === 'one') {
      if (isOfflinePlaying && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
        return;
      }
      if (currentTrack?.youtubeId && ytPlayerRef.current && isYtReadyRef.current) {
        try {
          ytPlayerRef.current.seekTo(0, true);
          ytPlayerRef.current.playVideo();
          return;
        } catch {}
      }
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
        return;
      }
    }

    if (queue.length > 0) {
      let nextIndex = 0;
      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * queue.length);
      }
      const next = queue[nextIndex];
      const remainingQueue = queue.filter((_, idx) => idx !== nextIndex);
      setQueue(remainingQueue);
      playTrack(next);
    } else {
      if (repeatMode === 'all' && history.length > 0) {
        const loopTrack = history[history.length - 1];
        setHistory([]);
        playTrack(loopTrack);
      } else {
        setIsPlaying(false);
      }
    }
  }, [queue, isShuffle, repeatMode, history, playTrack, currentTrack, isOfflinePlaying]);

  nextTrackRef.current = nextTrack;

  const seek = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    if (isOfflinePlaying) {
      if (audioRef.current) audioRef.current.currentTime = seconds;
      return;
    }
    if (currentTrack?.youtubeId) {
      if (ytPlayerRef.current && isYtReadyRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
        try {
          ytPlayerRef.current.seekTo(seconds, true);
        } catch {}
      }
    } else {
      if (audioRef.current) {
        audioRef.current.currentTime = seconds;
      }
    }
  }, [currentTrack, isOfflinePlaying]);

  const prevTrack = useCallback(() => {
    if (currentTime > 3) {
      seek(0);
      return;
    }

    if (history.length > 0) {
      const [prev, ...restHistory] = history;
      if (currentTrack) {
        setQueue(prevQ => [currentTrack, ...prevQ]);
      }
      setHistory(restHistory);
      playTrack(prev);
    }
  }, [history, currentTrack, currentTime, playTrack, seek]);

  // Mobile Lock Screen & Headphone Controls via Media Session API
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !currentTrack) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || 'CHILLMODE Lossless Audio',
        artwork: [
          { src: currentTrack.coverUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: currentTrack.coverUrl, sizes: '192x192', type: 'image/jpeg' },
          { src: currentTrack.coverUrl, sizes: '512x512', type: 'image/jpeg' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (!isPlaying) togglePlay();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (isPlaying) togglePlay();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        prevTrack();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextTrack();
      });
      navigator.mediaSession.setActionHandler('seekto', details => {
        if (typeof details.seekTime === 'number') {
          seek(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', details => {
        seek(Math.max(0, currentTime - (details.seekOffset || 10)));
      });
      navigator.mediaSession.setActionHandler('seekforward', details => {
        seek(Math.min(duration, currentTime + (details.seekOffset || 10)));
      });
    } catch (e) {
      // Ignored for platforms with partial MediaSession support
    }
  }, [currentTrack, isPlaying, duration, currentTime, togglePlay, prevTrack, nextTrack, seek]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (ytPlayerRef.current && isYtReadyRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      try {
        ytPlayerRef.current.setVolume(Math.round(clamped * 100));
        if (clamped > 0 && typeof ytPlayerRef.current.unMute === 'function') {
          ytPlayerRef.current.unMute();
        }
      } catch {}
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      if (audioRef.current) audioRef.current.volume = volume;
      if (ytPlayerRef.current && isYtReadyRef.current) {
        try {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(Math.round(volume * 100));
        } catch {}
      }
      setIsMuted(false);
    } else {
      if (audioRef.current) audioRef.current.volume = 0;
      if (ytPlayerRef.current && isYtReadyRef.current) {
        try {
          ytPlayerRef.current.mute();
        } catch {}
      }
      setIsMuted(true);
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => {
      const next = !prev;
      addNotification({
        type: 'info',
        title: next ? 'Shuffle On' : 'Shuffle Off',
        duration: 1500,
      });
      return next;
    });
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      let next: RepeatMode = 'off';
      if (prev === 'off') next = 'all';
      else if (prev === 'all') next = 'one';
      else next = 'off';

      const label = next === 'all' ? 'Repeat All' : next === 'one' ? 'Repeat Track' : 'Repeat Off';
      addNotification({
        type: 'info',
        title: label,
        duration: 1500,
      });
      return next;
    });
  };

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
    addNotification({
      type: 'info',
      title: 'Added to Queue',
      message: `${track.title} • ${track.artist}`,
      duration: 2000,
    });
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, idx) => idx !== index));
  };

  const clearQueue = () => {
    setQueue([]);
    addNotification({
      type: 'info',
      title: 'Queue Cleared',
      duration: 1500,
    });
  };

  const toggleLike = async (track: Track) => {
    try {
      const res = await musicApi.toggleLikeTrack(track);
      if (res.success) {
        if (res.isLiked) {
          setLikedTrackIds(prev => new Set(prev).add(track.id));
          addNotification({
            type: 'success',
            title: 'Saved to Liked Songs',
            message: track.title,
            duration: 1500,
          });

          // Auto-cache liked songs into offline storage if enabled
          try {
            if (localStorage.getItem('nexora_auto_save_offline') === 'true') {
              downloadTrackOffline(track);
            }
          } catch {}
        } else {
          setLikedTrackIds(prev => {
            const next = new Set(prev);
            next.delete(track.id);
            return next;
          });
          addNotification({
            type: 'info',
            title: 'Removed from Liked Songs',
            message: track.title,
            duration: 1500,
          });
        }
      }
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: err.message,
      });
    }
  };

  // --- Offline Download Actions ---
  const downloadTrackOffline = useCallback(
    async (track: Track): Promise<boolean> => {
      if (downloadedTrackIds.has(track.id)) {
        await removeOfflineTrack(track.id);
        return false;
      }

      setDownloadingTrackIds(prev => new Set(prev).add(track.id));
      addNotification({
        type: 'info',
        title: 'Downloading for Offline Playback',
        message: `${track.title} • ${track.artist}`,
        duration: 2500,
      });

      try {
        await offlineStorage.saveTrackOffline(track);
        setDownloadedTrackIds(prev => new Set(prev).add(track.id));
        addNotification({
          type: 'success',
          title: 'Available Offline',
          message: `${track.title} stored in device memory`,
          duration: 2500,
        });
        return true;
      } catch (err: any) {
        addNotification({
          type: 'error',
          title: 'Download Failed',
          message: err.message || 'Unable to cache audio',
          duration: 3000,
        });
        return false;
      } finally {
        setDownloadingTrackIds(prev => {
          const next = new Set(prev);
          next.delete(track.id);
          return next;
        });
      }
    },
    [downloadedTrackIds, addNotification]
  );

  const removeOfflineTrack = useCallback(
    async (trackId: string): Promise<boolean> => {
      try {
        await offlineStorage.removeOfflineTrack(trackId);
        setDownloadedTrackIds(prev => {
          const next = new Set(prev);
          next.delete(trackId);
          return next;
        });
        addNotification({
          type: 'info',
          title: 'Removed from Offline Library',
          duration: 1500,
        });
        return true;
      } catch {
        return false;
      }
    },
    [addNotification]
  );

  const downloadAllOffline = useCallback(
    async (tracks: Track[]) => {
      addNotification({
        type: 'info',
        title: `Starting Batch Download`,
        message: `Downloading ${tracks.length} tracks for offline playback...`,
        duration: 3000,
      });

      let successCount = 0;
      for (const track of tracks) {
        if (!downloadedTrackIds.has(track.id)) {
          try {
            await offlineStorage.saveTrackOffline(track);
            setDownloadedTrackIds(prev => new Set(prev).add(track.id));
            successCount++;
          } catch {
            // continue
          }
        }
      }

      addNotification({
        type: 'success',
        title: 'Offline Download Complete',
        message: `${successCount} new tracks are now available offline!`,
        duration: 3500,
      });
    },
    [downloadedTrackIds, addNotification]
  );

  const toggleSongPopup = useCallback(() => {
    setIsSongPopupOpen(prev => !prev);
  }, []);
  const toggleAudioDashboard = toggleSongPopup;

  const resetContentComposition = useCallback(
    async (options?: { purgeOffline?: boolean; keepLiked?: boolean }) => {
      // 1. Stop audio playback immediately
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
      }

      // 2. Stop YouTube Audio Bridge if active
      if (ytPlayerRef.current && isYtReadyRef.current && typeof ytPlayerRef.current.stopVideo === 'function') {
        try {
          ytPlayerRef.current.stopVideo();
        } catch {}
      }

      // 3. Clear current song and timeline
      setCurrentTrack(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setQueue([]);
      setHistory([]);
      setIsOfflinePlaying(false);

      // 4. Optionally clear liked tracks
      if (!options?.keepLiked) {
        setLikedTrackIds(new Set());
      }

      // 5. Optionally purge offline downloaded songs
      if (options?.purgeOffline) {
        try {
          await offlineStorage.clearAllOfflineTracks();
          setDownloadedTrackIds(new Set());
        } catch (err) {
          console.warn('Failed clearing offline tracks:', err);
        }
      }

      // 6. Clear session caches
      try {
        sessionStorage.removeItem('nexora_active_queue');
        sessionStorage.removeItem('nexora_last_track');
      } catch {}

      addNotification({
        type: 'success',
        title: 'Songs Composition Reset',
        message: 'Active playback stopped, queue & song composition reset to factory default.',
        duration: 3500,
      });
    },
    [addNotification]
  );

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        isMuted,
        currentTime,
        duration,
        queue,
        history,
        isShuffle,
        repeatMode,
        isFullscreen,
        isQueueOpen,
        likedTrackIds,
        downloadedTrackIds,
        downloadingTrackIds,
        isOfflinePlaying,
        isOnline,
        audioRef,
        isAudioDashboardOpen,
        isSongPopupOpen,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        removeFromQueue,
        clearQueue,
        toggleLike,
        downloadTrackOffline,
        removeOfflineTrack,
        downloadAllOffline,
        setIsFullscreen,
        setIsQueueOpen,
        setIsAudioDashboardOpen,
        toggleAudioDashboard,
        setIsSongPopupOpen,
        toggleSongPopup,
        resetContentComposition,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
