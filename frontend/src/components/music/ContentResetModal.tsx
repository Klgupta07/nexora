import React, { useState } from 'react';
import { RotateCcw, X, AlertTriangle, Check, Trash2, Music } from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ContentResetModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { resetContentComposition, queue, currentTrack } = useMusicPlayer();
  const [purgeOffline, setPurgeOffline] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsResetting(true);
    try {
      await resetContentComposition({ purgeOffline });
      onClose();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="apple-gloss-card relative w-full max-w-md bg-dark-secondary/95 border border-rose-500/30 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-5">
        {/* Top Specular Sheen */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-dark-border/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reset Songs Composition</h3>
              <p className="text-xs text-gray-400 font-mono">Factory Catalog & Deck Re-initialization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Explanation */}
        <div className="space-y-3 relative z-10 text-xs text-gray-300">
          <p className="leading-relaxed">
            This will immediately stop any active audio, clear your active playlist queue (
            <span className="text-white font-bold">{queue.length} songs</span>), wipe playback history, and reset the audio decks to factory defaults.
          </p>

          {currentTrack && (
            <div className="p-3 rounded-2xl bg-dark-bg/80 border border-dark-border flex items-center gap-3">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-9 h-9 rounded-xl object-cover"
              />
              <div className="truncate">
                <div className="font-bold text-white truncate">{currentTrack.title}</div>
                <div className="text-[11px] text-gray-400 truncate">{currentTrack.artist}</div>
              </div>
            </div>
          )}

          {/* Purge Offline Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-dark-bg/60 border border-dark-border/80 cursor-pointer hover:border-dark-border transition-colors">
            <input
              type="checkbox"
              checked={purgeOffline}
              onChange={e => setPurgeOffline(e.target.checked)}
              className="mt-0.5 rounded text-rose-500 focus:ring-0 accent-rose-500"
            />
            <div className="text-xs">
              <div className="text-gray-200 font-medium">Purge Offline Audio Storage Cache</div>
              <div className="text-[11px] text-gray-400">
                Wipes IndexedDB blob memory for saved offline songs.
              </div>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-dark-border/60 relative z-10">
          <button
            onClick={onClose}
            disabled={isResetting}
            className="px-4 py-2 rounded-xl bg-dark-bg hover:bg-dark-hover border border-dark-border text-xs text-gray-300 font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={isResetting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:opacity-95 text-xs font-bold text-white transition-opacity flex items-center gap-1.5 shadow-md"
          >
            {isResetting ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            <span>Reset Composition</span>
          </button>
        </div>
      </div>
    </div>
  );
};
