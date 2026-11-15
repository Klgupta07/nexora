import React, { useState } from 'react';
import {
  X,
  Palette,
  Type,
  Sun,
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
  Zap,
  Flame,
  ArrowRightLeft,
  Shuffle,
  Layers,
} from 'lucide-react';
import {
  useCustomization,
  COLOR_PRESETS,
  SURFACE_PRESETS,
  FONT_FAMILIES,
  FONT_SIZES,
  INTERFACE_MODES,
  CARD_RADIUS_OPTIONS,
  ColorPresetId,
  SurfacePresetId,
  FontFamilyId,
  FontSizeId,
  CardRadiusId,
  GlowIntensityId,
} from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Curated 1-Click Neon Swatches for Custom Studio
const NEON_SWATCHES = [
  { name: 'Cyber Yellow', hex: '#FCEE0A' },
  { name: 'Electric Cyan', hex: '#00F0FF' },
  { name: 'Neon Magenta', hex: '#FF007F' },
  { name: 'Toxic Lime', hex: '#00FF66' },
  { name: 'Ultraviolet', hex: '#BD00FF' },
  { name: 'Blade Orange', hex: '#FF5E00' },
  { name: 'Laser Crimson', hex: '#FF003C' },
  { name: 'Ice Blue', hex: '#05D9E8' },
  { name: 'Mint Neon', hex: '#00F5D4' },
  { name: 'Pure White', hex: '#FFFFFF' },
];

export const CustomizerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    settings,
    setColorPreset,
    setCustomColors,
    setSurfacePreset,
    setFontFamily,
    setFontSize,
    setGlowIntensity,
    setCardRadius,
    updateSetting,
    resetToDefaults,
  } = useCustomization();

  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'palettes' | 'custom' | 'surface' | 'glow' | 'typography' | 'interfaces'>('palettes');

  if (!isOpen) return null;

  const handleInvertColors = () => {
    setCustomColors(settings.accentHex, settings.primaryHex);
    addNotification({
      type: 'info',
      title: 'Neon Colors Inverted',
      duration: 1200,
    });
  };

  const handleRandomizeNeon = () => {
    const p = NEON_SWATCHES[Math.floor(Math.random() * NEON_SWATCHES.length)];
    let a = NEON_SWATCHES[Math.floor(Math.random() * NEON_SWATCHES.length)];
    while (a.hex === p.hex) {
      a = NEON_SWATCHES[Math.floor(Math.random() * NEON_SWATCHES.length)];
    }
    setCustomColors(p.hex, a.hex);
    addNotification({
      type: 'success',
      title: 'Randomized Neon Duo',
      message: `${p.name} + ${a.name}`,
      duration: 1500,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
      <div className="relative w-full max-w-3xl bg-dark-secondary border border-dark-border/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-dark-border flex items-center justify-between bg-dark-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-glow-primary">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Cyberpunk & Neon Studio</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-accent/20 text-accent border border-accent/30 font-bold">
                  HIGH-VOLTAGE THEMES
                </span>
              </div>
              <p className="text-xs text-gray-400">Customize neon colors, cyberpunk dark surfaces, glow aura, typography, and UI interfaces</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Interactive Preview Card */}
        <div className="px-6 pt-4 pb-2 bg-dark-bg/60 border-b border-dark-border/60">
          <div
            className="p-4 rounded-2xl bg-dark-card border border-dark-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md relative overflow-hidden"
            style={{ fontFamily: FONT_FAMILIES.find(f => f.id === settings.fontFamily)?.value }}
          >
            <div
              className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 filter blur-xl pointer-events-none"
              style={{ backgroundColor: settings.primaryHex }}
            />
            <div className="flex items-center gap-3 relative z-10">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-extrabold text-sm shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${settings.primaryHex}, ${settings.accentHex})`,
                  boxShadow: `0 0 15px var(--color-primary-glow)`,
                }}
              >
                NX
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Cyberpunk Audio Stream</span>
                  <span
                    className="px-2 py-0.2 rounded text-[9px] font-mono font-bold"
                    style={{
                      backgroundColor: `${settings.accentHex}20`,
                      color: settings.accentHex,
                      border: `1px solid ${settings.accentHex}40`,
                    }}
                  >
                    LIVE PREVIEW
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 font-mono">
                  Primary: {settings.primaryHex} • Accent: {settings.accentHex} • Font: {FONT_FAMILIES.find(f => f.id === settings.fontFamily)?.name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 relative z-10 w-full sm:w-auto justify-end">
              <button
                className="px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md transition-transform hover:scale-105"
                style={{
                  backgroundColor: settings.primaryHex,
                  color: '#000000',
                  boxShadow: `0 0 16px var(--color-primary-glow)`,
                }}
              >
                Neon Button
              </button>
              <button
                className="px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors"
                style={{
                  backgroundColor: `${settings.accentHex}20`,
                  color: settings.accentHex,
                  border: `1px solid ${settings.accentHex}50`,
                }}
              >
                Accent Outline
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center border-b border-dark-border px-6 bg-dark-bg/40 overflow-x-auto scrollbar-none">
          {[
            { id: 'palettes', label: 'Neon Palettes', icon: Palette },
            { id: 'custom', label: 'Custom Neon Studio', icon: Sliders },
            { id: 'surface', label: 'Dark Cyber Surfaces', icon: Sun },
            { id: 'glow', label: 'Neon Glow & Atmosphere', icon: Sparkles },
            { id: 'typography', label: 'Typography & Size', icon: Type },
            { id: 'interfaces', label: 'UI Layout Interfaces', icon: Layers },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: CURATED NEON & CYBERPUNK PALETTES */}
          {activeTab === 'palettes' && (
            <div className="space-y-6 animate-fade-in">
              {/* Group 1: Cyberpunk Legends */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase text-gray-400 flex items-center gap-1.5 font-bold">
                    <Zap className="w-3.5 h-3.5 text-accent" />
                    <span>Cyberpunk Neon Legends</span>
                  </h4>
                  <span className="text-[10px] font-mono text-accent">High-Contrast Glow</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COLOR_PRESETS.filter(p => p.category === 'cyberpunk' || p.category === 'neon').map(preset => {
                    const isSelected = settings.colorPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => setColorPreset(preset.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                          isSelected
                            ? 'bg-dark-card border-accent shadow-glow-accent'
                            : 'bg-dark-bg/80 border-dark-border hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center -space-x-1.5">
                            <span
                              className="w-6 h-6 rounded-full border-2 border-dark-secondary shadow-md"
                              style={{ backgroundColor: preset.primaryHex }}
                            />
                            <span
                              className="w-6 h-6 rounded-full border-2 border-dark-secondary shadow-md"
                              style={{ backgroundColor: preset.accentHex }}
                            />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-accent transition-colors">
                              {preset.name}
                            </div>
                            <div className="text-[10px] font-mono text-gray-500">
                              {preset.primaryHex} • {preset.accentHex}
                            </div>
                          </div>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-accent" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group 2: Modern Cyberspace & Streaming */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono uppercase text-gray-400 flex items-center gap-1.5 font-bold">
                  <Flame className="w-3.5 h-3.5 text-primary" />
                  <span>Streaming & Cyberspace Palettes</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COLOR_PRESETS.filter(p => p.category === 'streaming').map(preset => {
                    const isSelected = settings.colorPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => setColorPreset(preset.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                          isSelected
                            ? 'bg-dark-card border-accent shadow-glow-accent'
                            : 'bg-dark-bg/80 border-dark-border hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center -space-x-1.5">
                            <span
                              className="w-6 h-6 rounded-full border-2 border-dark-secondary shadow-md"
                              style={{ backgroundColor: preset.primaryHex }}
                            />
                            <span
                              className="w-6 h-6 rounded-full border-2 border-dark-secondary shadow-md"
                              style={{ backgroundColor: preset.accentHex }}
                            />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-accent transition-colors">
                              {preset.name}
                            </div>
                            <div className="text-[10px] font-mono text-gray-500">
                              {preset.primaryHex} • {preset.accentHex}
                            </div>
                          </div>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-accent" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM NEON STUDIO (Choose Any Colors) */}
          {activeTab === 'custom' && (
            <div className="space-y-6 animate-fade-in">
              {/* Quick 1-Click Neon Swatches Bar */}
              <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span>Quick Neon Swatches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleInvertColors}
                      className="px-2.5 py-1 rounded-lg bg-dark-bg hover:bg-dark-hover border border-dark-border text-[10px] font-mono text-gray-300 flex items-center gap-1 transition-colors"
                      title="Swap Primary & Accent"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>Swap</span>
                    </button>
                    <button
                      onClick={handleRandomizeNeon}
                      className="px-2.5 py-1 rounded-lg bg-dark-bg hover:bg-dark-hover border border-dark-border text-[10px] font-mono text-accent flex items-center gap-1 transition-colors"
                      title="Random Neon Combo"
                    >
                      <Shuffle className="w-3 h-3" />
                      <span>Shuffle</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {NEON_SWATCHES.map(swatch => (
                    <div key={swatch.hex} className="p-2 rounded-xl bg-dark-bg border border-dark-border space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: swatch.hex }}
                        />
                        <span className="text-[10px] font-mono font-bold text-gray-300 truncate">
                          {swatch.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCustomColors(swatch.hex, settings.accentHex)}
                          className="flex-1 py-0.5 rounded text-[8px] font-mono bg-dark-card hover:bg-dark-hover border border-dark-border text-gray-400 hover:text-white text-center"
                        >
                          Primary
                        </button>
                        <button
                          onClick={() => setCustomColors(settings.primaryHex, swatch.hex)}
                          className="flex-1 py-0.5 rounded text-[8px] font-mono bg-dark-card hover:bg-dark-hover border border-dark-border text-gray-400 hover:text-white text-center"
                        >
                          Accent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dual Color Wheels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Neon Wheel */}
                <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Primary Neon Color</div>
                      <div className="text-[10px] font-mono text-gray-400">Buttons, glows & major highlights</div>
                    </div>
                    <span
                      className="w-4 h-4 rounded-full shadow-md"
                      style={{ backgroundColor: settings.primaryHex }}
                    />
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-xl bg-dark-bg border border-dark-border">
                    <input
                      type="color"
                      value={settings.primaryHex}
                      onChange={e => setCustomColors(e.target.value, settings.accentHex)}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={settings.primaryHex}
                      onChange={e => setCustomColors(e.target.value, settings.accentHex)}
                      className="flex-1 bg-transparent text-xs font-mono font-bold text-white uppercase focus:outline-none"
                    />
                  </div>
                </div>

                {/* Accent Neon Wheel */}
                <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Secondary Neon Color</div>
                      <div className="text-[10px] font-mono text-gray-400">Badges, links & subtle radiance</div>
                    </div>
                    <span
                      className="w-4 h-4 rounded-full shadow-md"
                      style={{ backgroundColor: settings.accentHex }}
                    />
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-xl bg-dark-bg border border-dark-border">
                    <input
                      type="color"
                      value={settings.accentHex}
                      onChange={e => setCustomColors(settings.primaryHex, e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={settings.accentHex}
                      onChange={e => setCustomColors(settings.primaryHex, e.target.value)}
                      className="flex-1 bg-transparent text-xs font-mono font-bold text-white uppercase focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DARK CYBER SURFACES */}
          {activeTab === 'surface' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase text-gray-400 font-bold">
                  Cyberpunk Dark & Light Backdrops
                </h4>
                <span className="text-[10px] font-mono text-gray-500">8 Curated Surface Grades</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SURFACE_PRESETS.map(s => {
                  const isSelected = settings.surfacePreset === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSurfacePreset(s.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'border-accent bg-dark-card shadow-sm'
                          : 'border-dark-border/80 bg-dark-bg/80 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-xl border border-white/20 shadow-sm flex items-center justify-center text-xs font-mono font-bold"
                          style={{ backgroundColor: s.bgHex, color: s.isLight ? '#000' : '#fff' }}
                        >
                          #
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-accent transition-colors">
                            {s.name}
                          </div>
                          <div className="text-[10px] font-mono text-gray-500">
                            Surface: {s.bgHex} • Card: {s.cardHex}
                          </div>
                        </div>
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-accent" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: NEON GLOW & ATMOSPHERE */}
          {activeTab === 'glow' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-gray-400 font-bold">
                  Neon Glow Intensity & Bloom
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'hyper',
                      name: 'Hyper Neon Overdrive',
                      desc: 'Maximum bloom, radiant ambient light & vivid glowing halos',
                      badge: 'MAX VIBRANCY',
                    },
                    {
                      id: 'intense',
                      name: 'Intense Cyber Glow',
                      desc: 'Standard vibrant cyberpunk illumination across buttons & borders',
                      badge: 'RECOMMENDED',
                    },
                    {
                      id: 'subtle',
                      name: 'Balanced Glow',
                      desc: 'Gentle, modern neon highlights with clean contrast',
                      badge: 'BALANCED',
                    },
                    {
                      id: 'none',
                      name: 'Stealth Matte',
                      desc: 'Zero atmospheric glow, sharp high-contrast matte surfaces',
                      badge: 'MINIMAL',
                    },
                  ].map(g => {
                    const isSelected = settings.glowIntensity === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => setGlowIntensity(g.id as GlowIntensityId)}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'border-accent bg-dark-card shadow-glow-accent'
                            : 'border-dark-border/80 bg-dark-bg/80 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{g.name}</span>
                          <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-dark-bg border border-dark-border text-accent">
                            {g.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400">{g.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TYPOGRAPHY & SCALING */}
          {activeTab === 'typography' && (
            <div className="space-y-6 animate-fade-in">
              {/* Font Family Categories */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-dark-border/60">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-accent" />
                    <h4 className="text-xs font-mono uppercase text-gray-200 font-bold">
                      Typography Font Family ({FONT_FAMILIES.length} Curated Fonts)
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-accent bg-accent/10 px-2.5 py-1 rounded-lg border border-accent/20">
                    <span className="text-gray-400">Active:</span>
                    <span className="font-bold">{FONT_FAMILIES.find(f => f.id === settings.fontFamily)?.name}</span>
                  </div>
                </div>

                {/* Category Groups */}
                {(['Cyberpunk & Sci-Fi', 'Modern Streaming', 'Code & Monospace', 'Editorial & Serif'] as const).map(category => {
                  const categoryFonts = FONT_FAMILIES.filter(f => f.category === category);
                  if (categoryFonts.length === 0) return null;

                  return (
                    <div key={category} className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase font-bold text-gray-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          <span>{category}</span>
                        </span>
                        <span className="text-[10px] font-mono text-gray-500">
                          {categoryFonts.length} styles
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {categoryFonts.map(f => {
                          const isSelected = settings.fontFamily === f.id;
                          return (
                            <button
                              key={f.id}
                              onClick={() => setFontFamily(f.id as FontFamilyId)}
                              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                                isSelected
                                  ? 'border-accent bg-dark-card shadow-glow-accent'
                                  : 'border-dark-border/80 bg-dark-bg/80 hover:border-gray-500'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full mb-1">
                                <span
                                  className={`text-sm font-bold truncate ${
                                    isSelected ? 'text-accent' : 'text-white group-hover:text-accent'
                                  }`}
                                  style={{ fontFamily: f.value }}
                                >
                                  {f.name}
                                </span>
                                {isSelected && <Check className="w-4 h-4 text-accent flex-shrink-0 ml-2" />}
                              </div>

                              <p className="text-[10px] text-gray-400 mb-2 truncate">
                                {f.description}
                              </p>

                              <div
                                className="px-2.5 py-1.5 rounded-xl bg-dark-card/60 border border-dark-border/60 text-xs text-gray-300 truncate w-full"
                                style={{ fontFamily: f.value }}
                              >
                                {f.previewText || 'Chillmode 2077 // Lossless Audio'}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Font Scaling */}
              <div className="space-y-3 pt-3 border-t border-dark-border/60">
                <h4 className="text-xs font-mono uppercase text-gray-400 font-bold">
                  Interface Text Scaling
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FONT_SIZES.map(sz => {
                    const isSelected = settings.fontSize === sz.id;
                    return (
                      <button
                        key={sz.id}
                        onClick={() => setFontSize(sz.id as FontSizeId)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'border-accent bg-accent/20 text-accent font-bold'
                            : 'border-dark-border/80 bg-dark-bg/80 text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold">{sz.name}</div>
                        <div className="text-[10px] font-mono text-gray-500 mt-0.5">{sz.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: UI LAYOUT INTERFACES */}
          {activeTab === 'interfaces' && (
            <div className="space-y-6 animate-fade-in">
              {/* Interface Modes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase text-gray-200 font-bold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-accent" />
                    <span>Interface Layout Modes</span>
                  </h4>
                  <span className="text-[10px] font-mono text-accent">Active: {settings.interfaceMode || 'modern'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INTERFACE_MODES.map(mode => {
                    const isSelected = (settings.interfaceMode || 'modern') === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => {
                          updateSetting('interfaceMode', mode.id);
                          addNotification({
                            type: 'info',
                            title: `Interface: ${mode.name}`,
                            duration: 1200,
                          });
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'border-accent bg-dark-card shadow-glow-accent'
                            : 'border-dark-border/80 bg-dark-bg/80 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{mode.name}</span>
                          <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-dark-bg border border-dark-border text-accent">
                            {mode.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400">{mode.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interface Corner Radius */}
              <div className="space-y-3 pt-3 border-t border-dark-border/60">
                <h4 className="text-xs font-mono uppercase text-gray-200 font-bold">
                  Interface Card Geometry & Corners
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CARD_RADIUS_OPTIONS.map(r => {
                    const isSelected = settings.cardRadius === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setCardRadius(r.id as CardRadiusId)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-accent bg-dark-card shadow-sm text-accent font-bold'
                            : 'border-dark-border/80 bg-dark-bg/80 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-xs font-bold">{r.name}</div>
                        <div className="text-[10px] font-mono text-gray-500 mt-0.5">{r.label}</div>
                        <p className="text-[10px] text-gray-400 mt-1">{r.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-dark-border bg-dark-card/50 flex items-center justify-between">
          <button
            onClick={() => {
              resetToDefaults();
              addNotification({
                type: 'info',
                title: 'Reset to Cyberpunk 2077 Default',
                duration: 1500,
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-bg hover:bg-dark-hover text-xs font-mono text-gray-400 hover:text-white border border-dark-border transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-black font-extrabold text-xs shadow-glow-primary hover:opacity-95 transition-opacity"
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};
