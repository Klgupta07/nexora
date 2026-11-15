import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles, ChevronDown, Sliders, Moon, Sun, Zap } from 'lucide-react';
import {
  useCustomization,
  COLOR_PRESETS,
  SURFACE_PRESETS,
  FONT_SIZES,
  ColorPresetId,
  SurfacePresetId,
  FontSizeId,
} from '../../context/ThemeContext';

interface Props {
  onOpenFullCustomizer: () => void;
}

export const QuickThemeBar: React.FC<Props> = ({ onOpenFullCustomizer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { settings, setColorPreset, setSurfacePreset, setFontSize, theme, toggleTheme } = useCustomization();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const activeColor = COLOR_PRESETS.find(p => p.id === settings.colorPreset) || COLOR_PRESETS[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Sleek Trigger Button with Glowing Neon Dot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-card/60 hover:bg-dark-card border border-dark-border/80 hover:border-accent/40 text-xs text-gray-300 hover:text-white transition-all shadow-sm group"
        title="Quick Neon Themes & Appearance"
      >
        <span
          className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform"
          style={{
            background: `linear-gradient(135deg, ${activeColor.primaryHex}, ${activeColor.accentHex})`,
            boxShadow: `0 0 10px var(--color-primary-glow)`,
          }}
        />
        <span className="hidden lg:inline text-xs font-bold text-gray-200">
          Neon Themes
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-84 bg-dark-secondary/95 border border-dark-border/90 rounded-2xl shadow-2xl backdrop-blur-2xl p-4 z-50 animate-fade-in space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Zap className="w-4 h-4 text-accent fill-current" />
              <span>Cyberpunk & Neon Themes</span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenFullCustomizer();
              }}
              className="text-[11px] text-accent hover:underline flex items-center gap-1 font-mono font-bold"
            >
              <span>Full Studio</span>
              <Sliders className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Surface Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-dark-bg border border-dark-border/80">
            <button
              onClick={() => {
                if (theme === 'light') toggleTheme();
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                theme === 'dark'
                  ? 'bg-dark-card text-white shadow-sm border border-dark-border'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-purple-400" />
              <span>Cyber Dark</span>
            </button>
            <button
              onClick={() => {
                if (theme === 'dark') toggleTheme();
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                theme === 'light'
                  ? 'bg-white text-gray-900 shadow-sm font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Frost Light</span>
            </button>
          </div>

          {/* Cyberpunk & Neon Palettes */}
          <div>
            <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Cyberpunk Neon Presets</span>
              <span className="text-accent text-[9px]">1-Click</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {COLOR_PRESETS.slice(0, 8).map(preset => {
                const isActive = settings.colorPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setColorPreset(preset.id as ColorPresetId)}
                    title={preset.name}
                    className={`relative p-2 rounded-xl border flex items-center gap-2 transition-all text-left ${
                      isActive
                        ? 'border-accent bg-accent/15 shadow-sm'
                        : 'border-dark-border/60 bg-dark-card/50 hover:border-gray-500'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${preset.primaryHex}, ${preset.accentHex})`,
                      }}
                    />
                    <span className="text-[10px] font-bold text-gray-200 truncate flex-1">
                      {preset.name.split(' ')[0]} {preset.name.split(' ')[1] || ''}
                    </span>
                    {isActive && <Check className="w-3 h-3 text-accent flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cyber Dark Surfaces */}
          <div>
            <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">
              Cyberpunk Surfaces
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'night-city', label: 'Night City Void' },
                { id: 'oled-black', label: 'OLED Pure Black' },
                { id: 'matrix-terminal', label: 'Matrix Terminal' },
                { id: 'neo-tokyo', label: 'Neo-Tokyo Blood' },
              ].map(s => {
                const isActive = settings.surfacePreset === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSurfacePreset(s.id as SurfacePresetId)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-all text-left flex items-center justify-between ${
                      isActive
                        ? 'border-primary bg-primary/20 text-white font-bold'
                        : 'border-dark-border/60 bg-dark-card/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{s.label}</span>
                    {isActive && <Check className="w-3 h-3 text-accent flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Font Size Scaling */}
          <div>
            <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Text Scaling</span>
              <span className="text-accent">{settings.fontSize}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {FONT_SIZES.map(f => {
                const isActive = settings.fontSize === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFontSize(f.id as FontSizeId)}
                    className={`py-1 rounded-xl border text-[10px] font-mono font-bold transition-all text-center ${
                      isActive
                        ? 'border-accent bg-accent/20 text-accent'
                        : 'border-dark-border/60 bg-dark-card/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    {f.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Studio Trigger button at bottom */}
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenFullCustomizer();
            }}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-black font-extrabold text-xs transition-opacity flex items-center justify-center gap-1.5 shadow-glow-primary"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Open Custom Neon Studio</span>
          </button>
        </div>
      )}
    </div>
  );
};
