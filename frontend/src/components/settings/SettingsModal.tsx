import React, { useState } from 'react';
import { X, Settings, Shield, Moon, Sun, Volume2, User as UserIcon, Lock, Key, Check, Palette, Type, Sliders, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCustomization, COLOR_PRESETS, FONT_FAMILIES } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { CustomizerModal } from './CustomizerModal';
import { loadRefreshSettings, saveRefreshSettings } from '../music/ContentRefreshModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const { settings, setColorPreset, setFontFamily, toggleTheme, theme } = useCustomization();
  const { addNotification } = useNotification();

  const [name, setName] = useState(user?.name || 'Alex Vance');
  const [audioQuality, setAudioQuality] = useState('high');
  const [refreshInterval, setRefreshInterval] = useState<number>(() => loadRefreshSettings().autoRefreshInterval);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    updateUser({ name });
    addNotification({ type: 'success', title: 'Settings Saved' });
    onClose();
  };

  return (
    <>
      <CustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
        <div className="relative w-full max-w-xl bg-dark-secondary border border-dark-border rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary-light">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Platform Configuration</h3>
                <p className="text-xs text-gray-400">Manage security settings, streaming audio, text & color themes</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-dark-hover"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Identity Section */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5 text-accent" />
              <span>Profile Identity</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] text-gray-400 mb-1">Display Name</div>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-xl text-xs text-white focus:outline-none focus:border-primary font-medium"
                />
              </div>
              <div>
                <div className="text-[11px] text-gray-400 mb-1">Email Address</div>
                <input
                  type="text"
                  disabled
                  value={user?.email || 'listener@chillmode.io'}
                  className="w-full px-3 py-2 bg-dark-bg/60 border border-dark-border rounded-xl text-xs text-gray-400 cursor-not-allowed font-mono"
                />
              </div>
            </div>
          </div>

          {/* Appearance, Text & Color Customization Section */}
          <div className="space-y-3 pt-3 border-t border-dark-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-accent" />
                <span>Text & Color Appearance</span>
              </label>

              <button
                type="button"
                onClick={() => setIsCustomizerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/20 hover:bg-primary/30 text-xs text-primary-light font-semibold border border-primary/40 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Open Full Customizer</span>
              </button>
            </div>

            {/* Quick Palette Swatches */}
            <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300 font-semibold">Accent Theme Palette</span>
                <span className="text-[11px] font-mono text-accent">{settings.primaryHex} / {settings.accentHex}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setColorPreset(p.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                      settings.colorPreset === p.id
                        ? 'border-accent bg-dark-bg text-white shadow-glow-accent'
                        : 'border-dark-border bg-dark-bg text-gray-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: p.primaryHex }}
                    />
                    <span>{p.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Quick Font Selector */}
              <div className="pt-2 border-t border-dark-border/50 flex items-center justify-between">
                <span className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Typography Font</span>
                </span>
                <select
                  value={settings.fontFamily}
                  onChange={e => setFontFamily(e.target.value as any)}
                  className="px-2.5 py-1 rounded-lg bg-dark-bg border border-dark-border text-xs text-white focus:outline-none focus:border-accent"
                >
                  {(['Cyberpunk & Sci-Fi', 'Modern Streaming', 'Code & Monospace', 'Editorial & Serif'] as const).map(category => (
                    <optgroup key={category} label={category} className="bg-dark-secondary text-gray-300 font-bold">
                      {FONT_FAMILIES.filter(f => f.category === category).map(f => (
                        <option key={f.id} value={f.id} className="bg-dark-card text-white font-normal">
                          {f.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Dark / Light Toggle */}
              <div className="pt-2 border-t border-dark-border/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-300 font-semibold">Interface Surface</span>
                  <div className="text-[11px] text-gray-500">Currently: {theme === 'dark' ? 'Dark Cyber' : 'Light Mode'}</div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-xs text-gray-200 hover:text-white transition-colors"
                >
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                  <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Audio Quality Preferences */}
          <div className="space-y-3 pt-3 border-t border-dark-border">
            <label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Streaming Audio Bitrate</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'low', label: 'Data Saver', rate: '96 kbps' },
                { id: 'medium', label: 'Balanced', rate: '192 kbps' },
                { id: 'high', label: 'Lossless HQ', rate: '320 kbps' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setAudioQuality(opt.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    audioQuality === opt.id
                      ? 'border-primary bg-primary/20 text-white shadow-glow-primary'
                      : 'border-dark-border bg-dark-card text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-semibold">{opt.label}</div>
                  <div className="text-[10px] text-gray-500 font-mono mt-0.5">{opt.rate}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Audio Engine & Offline Storage Notice */}
          <div className="space-y-3 pt-3 border-t border-dark-border">
            <label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offline Storage & Device Memory</span>
            </label>
            <div className="p-4 rounded-xl bg-dark-bg border border-emerald-500/30 text-xs text-gray-300 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Check className="w-4 h-4" />
                <span>IndexedDB 100% Offline Audio Blob Engine</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Downloaded songs from Spotify, JioSaavn, and YouTube Music are saved directly into your device browser's persistent IndexedDB storage. Tracks can be played without an active internet connection at full high-resolution bitrates with zero tracking or advertisement injections.
              </p>
            </div>
          </div>

          {/* Feed Synchronization & Content Refresh Preferences */}
          <div className="space-y-3 pt-3 border-t border-dark-border">
            <label className="text-xs font-mono uppercase text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-accent" />
                <span>Home Feed Synchronization</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('nexora:refresh-feed'));
                  addNotification({
                    type: 'info',
                    title: 'Feed Refresh Triggered',
                    message: 'Home feed reloaded with latest chart releases',
                  });
                }}
                className="text-[11px] text-accent hover:underline flex items-center gap-1 font-mono"
              >
                <span>Trigger Refresh Now</span>
                <span>→</span>
              </button>
            </label>
            <div className="p-3.5 rounded-xl bg-dark-card border border-dark-border text-xs text-gray-300 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Auto-Refresh Interval</div>
                <div className="text-[11px] text-gray-400">Controls how often streaming charts poll and refresh in background</div>
              </div>
              <select
                value={refreshInterval}
                onChange={e => {
                  const val = Number(e.target.value);
                  setRefreshInterval(val);
                  const current = loadRefreshSettings();
                  saveRefreshSettings({ ...current, autoRefreshInterval: val });
                }}
                className="px-2.5 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-xs text-white focus:outline-none focus:border-accent"
              >
                <option value={0}>Disabled (Manual Only)</option>
                <option value={120}>Every 2 Minutes</option>
                <option value={300}>Every 5 Minutes (Default)</option>
                <option value={900}>Every 15 Minutes</option>
                <option value={1800}>Every 30 Minutes</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-dark-hover hover:bg-dark-border text-xs text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-xs shadow-glow-primary hover:opacity-95 transition-opacity"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
