import React from 'react';
import { X, Keyboard, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Audio Streaming & Playback',
      items: [
        { key: 'Space', desc: 'Play / Pause current track (when outside inputs)' },
        { key: 'Alt + P', desc: 'Toggle Now Playing Song Popup Window' },
        { key: 'M', desc: 'Toggle Audio Mute / Unmute' },
        { key: 'F', desc: 'Toggle Fullscreen Cyber Visualizer mode' },
        { key: 'S', desc: 'Toggle Shuffle Mode' },
        { key: 'R', desc: 'Cycle Repeat Mode (Off → All → One)' },
      ],
    },
    {
      category: 'Quick Navigation',
      items: [
        { key: 'Shift + R', desc: 'Content Refresh: Reload Home Feed & Music Charts' },
        { key: 'Alt + 1', desc: 'Jump to Home Feed (Charts & Multi-Language)' },
        { key: 'Alt + 2', desc: 'Jump to Universal Search (Spotify, Saavn, YT)' },
        { key: 'Alt + 3', desc: 'Jump to Offline Library (Downloaded Songs)' },
        { key: 'Alt + 4', desc: 'Jump to Your Playlists' },
        { key: 'Alt + 5', desc: 'Jump to Liked Songs' },
      ],
    },
    {
      category: 'Universal Omnibox & Studio',
      items: [
        { key: 'Ctrl + K / ⌘K', desc: 'Open Universal Omnibox & Quick Search' },
        { key: '/', desc: 'Quick search trigger (when outside inputs)' },
        { key: 'Alt + C', desc: 'Open Studio Customizer (Colors, Fonts, Scaling)' },
        { key: 'Esc', desc: 'Close any active modal, drawer, or palette' },
        { key: '?', desc: 'Toggle this Keyboard Shortcuts guide' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-dark-secondary/95 border border-dark-border/90 rounded-3xl shadow-2xl backdrop-blur-2xl p-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-dark-border/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/20 text-accent border border-primary/40">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Keyboard Shortcuts & Hotkeys</h3>
              <p className="text-xs text-gray-400">Hyper-flexible hands-on-keyboard music control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-5 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-[11px] font-mono font-bold text-accent uppercase tracking-wider">
                {group.category}
              </div>
              <div className="space-y-1.5">
                {group.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-xl bg-dark-card/50 border border-dark-border/60 text-xs"
                  >
                    <span className="text-gray-300">{item.desc}</span>
                    <kbd className="px-2.5 py-1 rounded-lg bg-dark-bg border border-dark-border text-primary-light font-mono text-[11px] font-bold shadow-inner">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-dark-border/80 flex items-center justify-between text-xs text-gray-400 font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CHILLMODE Cyberpunk Audio Engine</span>
          </span>
          <span>Press ESC anytime to exit</span>
        </div>
      </div>
    </div>
  );
};
