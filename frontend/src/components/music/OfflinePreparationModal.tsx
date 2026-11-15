import React, { useState } from 'react';
import {
  DownloadCloud,
  CheckCircle,
  Wifi,
  WifiOff,
  Sparkles,
  HardDrive,
  Music,
  X,
  Play,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { OfflinePreparationService, PreparationProgress } from '../../services/offlinePreparationService';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { useNotification } from '../../context/NotificationContext';

interface OfflinePreparationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const OfflinePreparationModal: React.FC<OfflinePreparationModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { isOnline, downloadedTrackIds } = useMusicPlayer();
  const { addNotification } = useNotification();

  const [isPreparing, setIsPreparing] = useState(false);
  const [progress, setProgress] = useState<PreparationProgress | null>(null);
  const [selectedPack, setSelectedPack] = useState<'starter' | 'vault' | 'liked'>('starter');
  const [isSuccess, setIsSuccess] = useState(false);
  const [summaryMsg, setSummaryMsg] = useState('');

  if (!isOpen) return null;

  const handleStartPreparation = async () => {
    if (!navigator.onLine) {
      addNotification({
        type: 'error',
        title: 'Network Required',
        message: 'Please connect to Wi-Fi or cellular network to download tracks.',
      });
      return;
    }

    setIsPreparing(true);
    setIsSuccess(false);
    setProgress({
      current: 0,
      total: selectedPack === 'starter' ? 10 : selectedPack === 'vault' ? 25 : 0,
      trackTitle: 'Initializing High-Fidelity Audio Stream Buffer...',
      stage: 'metadata',
      percent: 5,
    });

    try {
      let res: { success: boolean; downloadedCount: number; message: string };

      if (selectedPack === 'liked') {
        const count = await OfflinePreparationService.prepareLikedTracks(p => setProgress(p));
        res = {
          success: true,
          downloadedCount: count,
          message: `${count} liked tracks downloaded directly to your local offline library.`,
        };
      } else {
        const count = selectedPack === 'starter' ? 10 : 25;
        res = await OfflinePreparationService.prepareOfflinePack(count, p => setProgress(p));
      }

      setIsSuccess(true);
      setSummaryMsg(res.message);
      addNotification({
        type: 'success',
        title: 'Offline Preparation Complete',
        message: res.message,
        duration: 4000,
      });

      if (onComplete) onComplete();
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Preparation Error',
        message: err.message || 'Failed downloading audio streams.',
      });
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xl animate-fade-in select-none">
      <div className="relative w-full max-w-xl rounded-3xl bg-dark-secondary/90 border border-white/20 p-6 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.9)] flex flex-col space-y-6 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>OFFLINE PREPARATION ENGINE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Prepare Full Offline Mode</span>
            </h2>
            <p className="text-xs text-gray-400 max-w-md">
              Download lossless audio streams, covers & lyrics directly to IndexedDB. Everything remains 100% playable with zero internet connection.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isPreparing}
            className="p-2 rounded-full bg-dark-card/60 hover:bg-dark-hover border border-dark-border text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Status Banner */}
        <div className="grid grid-cols-2 gap-3 relative z-10 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-2.5">
            {isOnline ? (
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Wifi className="w-4 h-4" />
              </span>
            ) : (
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <WifiOff className="w-4 h-4" />
              </span>
            )}
            <div>
              <div className="text-[10px] text-gray-400">NETWORK STATUS</div>
              <div className="font-bold text-white">
                {isOnline ? 'Online (Ready to Download)' : 'Offline (Disconnected)'}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/20 text-primary">
              <HardDrive className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[10px] text-gray-400">OFFLINE VAULT</div>
              <div className="font-bold text-white">
                {downloadedTrackIds.size} Songs Cached
              </div>
            </div>
          </div>
        </div>

        {/* Preset Selector */}
        {!isPreparing && !isSuccess && (
          <div className="space-y-2.5 relative z-10">
            <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
              Choose Preparation Pack
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Starter Pack */}
              <button
                type="button"
                onClick={() => setSelectedPack('starter')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedPack === 'starter'
                    ? 'bg-gradient-to-br from-primary/25 to-accent/15 border-accent text-white shadow-lg'
                    : 'bg-dark-card/40 border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/20 text-accent font-bold">
                    10 Songs
                  </span>
                </div>
                <div className="text-xs font-bold text-white">Starter Pack</div>
                <div className="text-[10px] text-gray-400 mt-1">
                  Fastest ~15MB. Essential top chart hits.
                </div>
              </button>

              {/* Full Vault */}
              <button
                type="button"
                onClick={() => setSelectedPack('vault')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedPack === 'vault'
                    ? 'bg-gradient-to-br from-cyan-500/25 to-blue-500/15 border-cyan-400 text-white shadow-lg'
                    : 'bg-dark-card/40 border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <DownloadCloud className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                    25 Songs
                  </span>
                </div>
                <div className="text-xs font-bold text-white">Full Vault</div>
                <div className="text-[10px] text-gray-400 mt-1">
                  Bollywood, Lofi, Desi Drill & Global Hits.
                </div>
              </button>

              {/* Liked Songs */}
              <button
                type="button"
                onClick={() => setSelectedPack('liked')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedPack === 'liked'
                    ? 'bg-gradient-to-br from-rose-500/25 to-pink-500/15 border-rose-400 text-white shadow-lg'
                    : 'bg-dark-card/40 border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Music className="w-4 h-4 text-rose-400" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                    Favorites
                  </span>
                </div>
                <div className="text-xs font-bold text-white">Liked Songs</div>
                <div className="text-[10px] text-gray-400 mt-1">
                  Cache your complete personal collection.
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Live Progress Deck */}
        {isPreparing && progress && (
          <div className="p-4 rounded-2xl bg-black/45 border border-white/15 space-y-3 relative z-10 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-2 text-cyan-400 font-bold">
                <DownloadCloud className="w-4 h-4 animate-bounce" />
                <span>Downloading Audio Stream {progress.current} of {progress.total}</span>
              </span>
              <span className="text-white font-extrabold">{progress.percent}%</span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-2 rounded-full bg-dark-card overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary via-accent to-cyan-400 transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>

            <div className="text-xs text-gray-300 truncate font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="truncate">{progress.trackTitle}</span>
            </div>
          </div>
        )}

        {/* Success Confirmation Card */}
        {isSuccess && (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 relative z-10 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Device 100% Prepared For Offline</h3>
              <p className="text-xs text-gray-300 mt-1">{summaryMsg}</p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-emerald-500/40 text-[11px] font-mono text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full Playback Supported Without Wi-Fi or Mobile Data</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2 relative z-10 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-white transition-colors"
          >
            {isSuccess ? 'Close' : 'Cancel'}
          </button>

          {!isSuccess ? (
            <button
              type="button"
              onClick={handleStartPreparation}
              disabled={isPreparing || !isOnline}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-xs font-bold text-white transition-all shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isPreparing ? (
                <>
                  <DownloadCloud className="w-4 h-4 animate-spin" />
                  <span>Preparing Offline Vault...</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="w-4 h-4" />
                  <span>Download & Prepare Offline</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-white transition-all shadow-lg flex items-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Done (Ready to Listen Offline)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
