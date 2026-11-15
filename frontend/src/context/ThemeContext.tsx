import React, { createContext, useContext, useState, useEffect } from 'react';
import { InterfaceLayoutMode } from '../types';

export type ColorPresetId =
  | 'cyberpunk-2077'
  | 'synthwave-neon'
  | 'matrix-acid'
  | 'tokyo-ultraviolet'
  | 'blade-runner'
  | 'akira-blood'
  | 'electric-cyber'
  | 'cyber-violet'
  | 'spotify-green'
  | 'arcade-sunset'
  | 'ghost-cyber'
  | 'electric-blue'
  | 'sunset-gold'
  | 'custom';

export type SurfacePresetId =
  | 'night-city'
  | 'oled-black'
  | 'matrix-terminal'
  | 'neo-tokyo'
  | 'synthwave-abyss'
  | 'deep-space'
  | 'modern-slate'
  | 'frost-light';

export type FontFamilyId =
  | 'orbitron'
  | 'rajdhani'
  | 'chakra'
  | 'audiowide'
  | 'righteous'
  | 'syne'
  | 'inter'
  | 'jakarta'
  | 'outfit'
  | 'montserrat'
  | 'poppins'
  | 'sora'
  | 'manrope'
  | 'space-grotesk'
  | 'system'
  | 'jetbrains'
  | 'fira-code'
  | 'playfair'
  | 'cinzel'
  | 'serif';

export type FontSizeId = 'compact' | 'default' | 'large' | 'xlarge';
export type TextContrastId = 'normal' | 'high' | 'ultra';
export type CardRadiusId = 'sharp' | 'modern' | 'pill';
export type GlowIntensityId = 'hyper' | 'intense' | 'subtle' | 'none';

export interface ColorPreset {
  id: ColorPresetId;
  name: string;
  category: 'cyberpunk' | 'neon' | 'streaming';
  primaryHex: string;
  accentHex: string;
}

export interface SurfacePreset {
  id: SurfacePresetId;
  name: string;
  bgHex: string;
  secondaryHex: string;
  cardHex: string;
  borderHex: string;
  hoverHex: string;
  isLight?: boolean;
}

export const COLOR_PRESETS: ColorPreset[] = [
  // ⚡ Cyberpunk & Neon Legends
  { id: 'cyberpunk-2077', name: 'Cyberpunk 2077 Neon Yellow & Cyan', category: 'cyberpunk', primaryHex: '#FCEE0A', accentHex: '#00F0FF' },
  { id: 'synthwave-neon', name: 'Synthwave Outrun Neon Magenta & Cyan', category: 'neon', primaryHex: '#FF007F', accentHex: '#00FFFF' },
  { id: 'matrix-acid', name: 'Matrix Toxic Glitch & Code Green', category: 'cyberpunk', primaryHex: '#00FF66', accentHex: '#39FF14' },
  { id: 'tokyo-ultraviolet', name: 'Tokyo Midnight Ultraviolet & Hot Pink', category: 'neon', primaryHex: '#BD00FF', accentHex: '#FF0055' },
  { id: 'blade-runner', name: 'Blade Runner 2049 Amber & Laser Gold', category: 'cyberpunk', primaryHex: '#FF6B00', accentHex: '#FFB800' },
  { id: 'akira-blood', name: 'Neo-Tokyo Akira Blood Crimson & Red', category: 'cyberpunk', primaryHex: '#FF003C', accentHex: '#FF2A6D' },
  { id: 'electric-cyber', name: 'Neuromancer High-Voltage Blue & Mint', category: 'neon', primaryHex: '#05D9E8', accentHex: '#00F5D4' },
  
  // 🎵 Streaming & Cyberspace Palettes
  { id: 'cyber-violet', name: 'Cyber Violet & Ice Cyan', category: 'streaming', primaryHex: '#8B5CF6', accentHex: '#06B6D4' },
  { id: 'spotify-green', name: 'Spotify Cyber Emerald & Mint', category: 'streaming', primaryHex: '#1DB954', accentHex: '#10B981' },
  { id: 'arcade-sunset', name: 'Arcade Neon Peach & Electric Gold', category: 'neon', primaryHex: '#FF5E7E', accentHex: '#FFD166' },
  { id: 'ghost-cyber', name: 'Ghost in the Shell Neon White & Ice Blue', category: 'cyberpunk', primaryHex: '#E2E8F0', accentHex: '#38BDF8' },
  { id: 'electric-blue', name: 'Electric Cobalt & Sky', category: 'streaming', primaryHex: '#3B82F6', accentHex: '#60A5FA' },
  { id: 'sunset-gold', name: 'Sunset Amber & Orange', category: 'streaming', primaryHex: '#F59E0B', accentHex: '#FB923C' },
];

export const SURFACE_PRESETS: SurfacePreset[] = [
  {
    id: 'night-city',
    name: 'Night City Dark Void',
    bgHex: '#050811',
    secondaryHex: '#0B1120',
    cardHex: '#0F172A',
    borderHex: '#1E293B',
    hoverHex: '#1E293B',
  },
  {
    id: 'oled-black',
    name: 'OLED Pure Black',
    bgHex: '#000000',
    secondaryHex: '#08080A',
    cardHex: '#111115',
    borderHex: '#222228',
    hoverHex: '#1B1B22',
  },
  {
    id: 'matrix-terminal',
    name: 'Matrix Terminal Black',
    bgHex: '#020804',
    secondaryHex: '#051208',
    cardHex: '#091B0D',
    borderHex: '#0E2F18',
    hoverHex: '#0D2A16',
  },
  {
    id: 'neo-tokyo',
    name: 'Neo-Tokyo Blood Dark',
    bgHex: '#0A0307',
    secondaryHex: '#14070E',
    cardHex: '#1C0B14',
    borderHex: '#301222',
    hoverHex: '#260E1B',
  },
  {
    id: 'synthwave-abyss',
    name: 'Synthwave Abyss Navy',
    bgHex: '#070512',
    secondaryHex: '#0E0A22',
    cardHex: '#150F33',
    borderHex: '#261B5C',
    hoverHex: '#1F164B',
  },
  {
    id: 'deep-space',
    name: 'Cyber Dark (Deep Space)',
    bgHex: '#0B0F19',
    secondaryHex: '#111827',
    cardHex: '#161F30',
    borderHex: '#1F293D',
    hoverHex: '#222F46',
  },
  {
    id: 'modern-slate',
    name: 'Modern Slate',
    bgHex: '#0A0F1D',
    secondaryHex: '#111827',
    cardHex: '#1E293B',
    borderHex: '#334155',
    hoverHex: '#293548',
  },
  {
    id: 'frost-light',
    name: 'Clean Frost Light',
    bgHex: '#F8FAFC',
    secondaryHex: '#FFFFFF',
    cardHex: '#F1F5F9',
    borderHex: '#E2E8F0',
    hoverHex: '#E2E8F0',
    isLight: true,
  },
];

export interface FontFamilyOption {
  id: FontFamilyId;
  name: string;
  category: 'Cyberpunk & Sci-Fi' | 'Modern Streaming' | 'Code & Monospace' | 'Editorial & Serif';
  value: string;
  description: string;
  previewText?: string;
}

export const FONT_FAMILIES: FontFamilyOption[] = [
  // ⚡ Cyberpunk & Sci-Fi
  {
    id: 'orbitron',
    name: 'Orbitron',
    category: 'Cyberpunk & Sci-Fi',
    value: "'Orbitron', system-ui, sans-serif",
    description: 'Iconic Cyberpunk HUD & Hologram display',
    previewText: 'CYBER AUDIO 2077 // STREAM',
  },
  {
    id: 'rajdhani',
    name: 'Rajdhani',
    category: 'Cyberpunk & Sci-Fi',
    value: "'Rajdhani', system-ui, sans-serif",
    description: 'Squared tactical sci-fi & gaming interface',
    previewText: 'TACTICAL AUDIO FREQUENCY',
  },
  {
    id: 'chakra',
    name: 'Chakra Petch',
    category: 'Cyberpunk & Sci-Fi',
    value: "'Chakra Petch', sans-serif",
    description: 'Chassis cybernetic stencil typography',
    previewText: 'HIGH VOLTAGE SYNTH STREAM',
  },
  {
    id: 'audiowide',
    name: 'Audiowide',
    category: 'Cyberpunk & Sci-Fi',
    value: "'Audiowide', cursive, sans-serif",
    description: 'Electronic music & 80s outrun synthwave',
    previewText: 'SYNTHWAVE OVERDRIVE',
  },
  {
    id: 'righteous',
    name: 'Righteous',
    category: 'Cyberpunk & Sci-Fi',
    value: "'Righteous', cursive, sans-serif",
    description: 'Retro arcade neon & electro rhythm',
    previewText: 'RETRO ARCADE FREQUENCY',
  },
  {
    id: 'syne',
    name: 'Syne',
    category: 'Cyberpunk & Sci-Fi',
    value: "'Syne', sans-serif",
    description: 'Avant-garde underground electronic club vibe',
    previewText: 'CLUB ELECTRO UNDERGROUND',
  },

  // 🎵 Modern Streaming & UI
  {
    id: 'inter',
    name: 'Inter',
    category: 'Modern Streaming',
    value: "'Inter', system-ui, -apple-system, sans-serif",
    description: 'Balanced modern high-legibility sans',
    previewText: 'Clean High-Fidelity Audio',
  },
  {
    id: 'jakarta',
    name: 'Plus Jakarta Sans',
    category: 'Modern Streaming',
    value: "'Plus Jakarta Sans', system-ui, sans-serif",
    description: 'Contemporary neo-grotesque streaming standard',
    previewText: 'Crystal Clear Spatial Audio',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    category: 'Modern Streaming',
    value: "'Outfit', system-ui, sans-serif",
    description: 'Minimalist geometric streaming player feel',
    previewText: 'Seamless Modern Audio Stream',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    category: 'Modern Streaming',
    value: "'Montserrat', system-ui, sans-serif",
    description: 'Classic clean geometric music streaming standard',
    previewText: 'Studio Grade Acoustic Precision',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    category: 'Modern Streaming',
    value: "'Poppins', system-ui, sans-serif",
    description: 'Rounded modern geometric aesthetic',
    previewText: 'Vibrant Grooves & Melodies',
  },
  {
    id: 'sora',
    name: 'Sora',
    category: 'Modern Streaming',
    value: "'Sora', system-ui, sans-serif",
    description: 'Futuristic Neo-Tokyo tech typeface',
    previewText: 'Lossless Hi-Res Audio Flow',
  },
  {
    id: 'manrope',
    name: 'Manrope',
    category: 'Modern Streaming',
    value: "'Manrope', system-ui, sans-serif",
    description: 'Semi-condensed sharp modern interface',
    previewText: '320kbps Extreme Fidelity',
  },
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    category: 'Modern Streaming',
    value: "'Space Grotesk', system-ui, sans-serif",
    description: 'Tech-forward quirky geometric sans',
    previewText: 'Universal Audio Omnibox',
  },
  {
    id: 'system',
    name: 'System Native',
    category: 'Modern Streaming',
    value: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    description: 'Zero-latency native operating system font',
    previewText: 'Instant OS Hardware Native',
  },

  // 💻 Code & Monospace
  {
    id: 'jetbrains',
    name: 'JetBrains Mono',
    category: 'Code & Monospace',
    value: "'JetBrains Mono', 'Fira Code', monospace",
    description: 'Hacker developer monospace with ligatures',
    previewText: 'async fn play_track(id: &str)',
  },
  {
    id: 'fira-code',
    name: 'Fira Code',
    category: 'Code & Monospace',
    value: "'Fira Code', monospace",
    description: 'Iconic programming font with math arrows',
    previewText: 'const bitrate = 320; // FLAC',
  },

  // 📜 Editorial & Serif
  {
    id: 'playfair',
    name: 'Playfair Display',
    category: 'Editorial & Serif',
    value: "'Playfair Display', Georgia, serif",
    description: 'High-contrast luxury editorial acoustic serif',
    previewText: 'Symphony in Classical Acoustics',
  },
  {
    id: 'cinzel',
    name: 'Cinzel',
    category: 'Editorial & Serif',
    value: "'Cinzel', Georgia, serif",
    description: 'Majestic cinematic & orchestral proportions',
    previewText: 'ORCHESTRAL SOUNDTRACKS',
  },
  {
    id: 'serif',
    name: 'Georgia Serif',
    category: 'Editorial & Serif',
    value: "Georgia, Cambria, 'Times New Roman', serif",
    description: 'Warm literary & traditional serif',
    previewText: 'Vintage Vinyl & Jazz Recordings',
  },
];

export const FONT_SIZES = [
  { id: 'compact', name: 'Compact', size: '14px', label: '90% Scaling' },
  { id: 'default', name: 'Balanced', size: '16px', label: '100% (Default)' },
  { id: 'large', name: 'Large', size: '18px', label: '112.5% Scaling' },
  { id: 'xlarge', name: 'Extra Large', size: '20px', label: '125% Accessible' },
];

export interface InterfaceModeOption {
  id: InterfaceLayoutMode;
  name: string;
  desc: string;
  badge: string;
}

export const INTERFACE_MODES: InterfaceModeOption[] = [
  { id: 'modern', name: 'Cyberpunk Streamer Deck', desc: 'Standard high-fidelity music streaming layout with responsive cards', badge: 'DEFAULT' },
  { id: 'studio-deck', name: 'DJ Studio & Telemetry Console', desc: 'Live audio analyzer, real-time BPM counter, and technical telemetry', badge: 'PRO DJ' },
  { id: 'minimalist', name: 'Zen Audio Minimalist', desc: 'Distraction-free listening experience with clean typography and deep blacks', badge: 'FOCUS' },
  { id: 'cyberpunk-hud', name: 'High-Voltage Tactical HUD', desc: 'High-contrast glowing neon grid, tactical brackets, and telemetry gauges', badge: 'OVERDRIVE' },
];

export const CARD_RADIUS_OPTIONS = [
  { id: 'modern', name: 'Modern Rounded', label: '16px Radius', desc: 'Balanced sleek modern curves' },
  { id: 'sharp', name: 'Tactical Cyber Sharp', label: '4px Radius', desc: 'Angular cyberpunk edges' },
  { id: 'pill', name: 'Ultra-Curved Pill', label: '28px Radius', desc: 'Organic fluid contours' },
];

export interface CustomizationSettings {
  colorPreset: ColorPresetId;
  primaryHex: string;
  accentHex: string;
  surfacePreset: SurfacePresetId;
  fontFamily: FontFamilyId;
  fontSize: FontSizeId;
  textContrast: TextContrastId;
  cardRadius: CardRadiusId;
  glowIntensity: GlowIntensityId;
  interfaceMode?: InterfaceLayoutMode;
}

const DEFAULT_SETTINGS: CustomizationSettings = {
  colorPreset: 'cyberpunk-2077',
  primaryHex: '#FCEE0A',
  accentHex: '#00F0FF',
  surfacePreset: 'night-city',
  fontFamily: 'inter',
  fontSize: 'default',
  textContrast: 'normal',
  cardRadius: 'modern',
  glowIntensity: 'intense',
  interfaceMode: 'modern',
};

export interface CustomizationContextType {
  settings: CustomizationSettings;
  updateSetting: <K extends keyof CustomizationSettings>(key: K, value: CustomizationSettings[K]) => void;
  setColorPreset: (presetId: ColorPresetId) => void;
  setCustomColors: (primary: string, accent: string) => void;
  setSurfacePreset: (surfaceId: SurfacePresetId) => void;
  setFontFamily: (fontId: FontFamilyId) => void;
  setFontSize: (sizeId: FontSizeId) => void;
  setTextContrast: (contrastId: TextContrastId) => void;
  setCardRadius: (radiusId: CardRadiusId) => void;
  setGlowIntensity: (glowId: GlowIntensityId) => void;
  resetToDefaults: () => void;
  // Compatibility with useTheme
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (t: 'dark' | 'light') => void;
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16) || 0;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function adjustBrightness(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const adjust = (c: number) => Math.min(255, Math.max(0, Math.round(c + (percent / 100) * 255)));
  const nr = adjust(r).toString(16).padStart(2, '0');
  const ng = adjust(g).toString(16).padStart(2, '0');
  const nb = adjust(b).toString(16).padStart(2, '0');
  return `#${nr}${ng}${nb}`;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CustomizationSettings>(() => {
    try {
      const saved = localStorage.getItem('nexora_customization_v2');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  // Apply customizations to CSS root variables whenever settings change
  useEffect(() => {
    const root = document.documentElement;

    // 1. Primary Colors
    const pRgb = hexToRgb(settings.primaryHex);
    const pHoverHex = adjustBrightness(settings.primaryHex, -12);
    const pHoverRgb = hexToRgb(pHoverHex);
    const pLightHex = adjustBrightness(settings.primaryHex, 20);
    const pLightRgb = hexToRgb(pLightHex);

    root.style.setProperty('--primary-rgb', `${pRgb.r} ${pRgb.g} ${pRgb.b}`);
    root.style.setProperty('--primary-hover-rgb', `${pHoverRgb.r} ${pHoverRgb.g} ${pHoverRgb.b}`);
    root.style.setProperty('--primary-light-rgb', `${pLightRgb.r} ${pLightRgb.g} ${pLightRgb.b}`);

    // Glow intensity
    const glowAlpha =
      settings.glowIntensity === 'hyper'
        ? 0.85
        : settings.glowIntensity === 'intense'
        ? 0.55
        : settings.glowIntensity === 'none'
        ? 0.0
        : 0.3;

    root.style.setProperty('--color-primary-glow', `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, ${glowAlpha})`);
    root.style.setProperty('--neon-glow-primary', `0 0 20px rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, ${glowAlpha * 0.75})`);
    root.style.setProperty('--neon-border', `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, ${Math.min(1, glowAlpha + 0.25)})`);

    // 2. Accent Colors
    const aRgb = hexToRgb(settings.accentHex);
    const aHoverHex = adjustBrightness(settings.accentHex, -12);
    const aHoverRgb = hexToRgb(aHoverHex);
    const aLightHex = adjustBrightness(settings.accentHex, 20);
    const aLightRgb = hexToRgb(aLightHex);

    root.style.setProperty('--accent-rgb', `${aRgb.r} ${aRgb.g} ${aRgb.b}`);
    root.style.setProperty('--accent-hover-rgb', `${aHoverRgb.r} ${aHoverRgb.g} ${aHoverRgb.b}`);
    root.style.setProperty('--accent-light-rgb', `${aLightRgb.r} ${aLightRgb.g} ${aLightRgb.b}`);
    root.style.setProperty('--color-accent-glow', `rgba(${aRgb.r}, ${aRgb.g}, ${aRgb.b}, ${glowAlpha})`);
    root.style.setProperty('--neon-glow-accent', `0 0 20px rgba(${aRgb.r}, ${aRgb.g}, ${aRgb.b}, ${glowAlpha * 0.75})`);

    // 3. Surface Background Colors
    const surface = SURFACE_PRESETS.find(s => s.id === settings.surfacePreset) || SURFACE_PRESETS[0];
    const bgRgb = hexToRgb(surface.bgHex);
    const secRgb = hexToRgb(surface.secondaryHex);
    const cardRgb = hexToRgb(surface.cardHex);
    const borderRgb = hexToRgb(surface.borderHex);
    const hoverRgb = hexToRgb(surface.hoverHex);

    root.style.setProperty('--bg-rgb', `${bgRgb.r} ${bgRgb.g} ${bgRgb.b}`);
    root.style.setProperty('--secondary-rgb', `${secRgb.r} ${secRgb.g} ${secRgb.b}`);
    root.style.setProperty('--card-rgb', `${cardRgb.r} ${cardRgb.g} ${cardRgb.b}`);
    root.style.setProperty('--border-rgb', `${borderRgb.r} ${borderRgb.g} ${borderRgb.b}`);
    root.style.setProperty('--hover-rgb', `${hoverRgb.r} ${hoverRgb.g} ${hoverRgb.b}`);

    // Light vs Dark class
    if (surface.isLight) {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }

    // 4. Typography Font Family
    const fontObj = FONT_FAMILIES.find(f => f.id === settings.fontFamily) || FONT_FAMILIES[0];
    root.style.setProperty('--font-family', fontObj.value);

    // 5. Font Size Scaling
    const sizeObj = FONT_SIZES.find(s => s.id === settings.fontSize) || FONT_SIZES[1];
    root.style.fontSize = sizeObj.size;
    root.style.setProperty('--font-scale', sizeObj.size);

    // 6. Text Contrast Classes
    root.classList.remove('high-contrast', 'ultra-contrast');
    if (settings.textContrast === 'high') {
      root.classList.add('high-contrast');
    } else if (settings.textContrast === 'ultra') {
      root.classList.add('ultra-contrast', 'high-contrast');
    }

    // 7. Card Geometry Radius & Interface Layout Mode
    const radius = settings.cardRadius === 'sharp' ? '6px' : settings.cardRadius === 'pill' ? '28px' : '16px';
    root.style.setProperty('--card-radius', radius);

    // Persist
    localStorage.setItem('nexora_customization_v2', JSON.stringify(settings));
    localStorage.setItem('nexora_theme', surface.isLight ? 'light' : 'dark');
  }, [settings]);

  const updateSetting = <K extends keyof CustomizationSettings>(key: K, value: CustomizationSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const setColorPreset = (presetId: ColorPresetId) => {
    const preset = COLOR_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSettings(prev => ({
        ...prev,
        colorPreset: presetId,
        primaryHex: preset.primaryHex,
        accentHex: preset.accentHex,
      }));
    }
  };

  const setCustomColors = (primary: string, accent: string) => {
    setSettings(prev => ({
      ...prev,
      colorPreset: 'custom',
      primaryHex: primary,
      accentHex: accent,
    }));
  };

  const setSurfacePreset = (surfaceId: SurfacePresetId) => {
    updateSetting('surfacePreset', surfaceId);
  };

  const setFontFamily = (fontId: FontFamilyId) => {
    updateSetting('fontFamily', fontId);
  };

  const setFontSize = (sizeId: FontSizeId) => {
    updateSetting('fontSize', sizeId);
  };

  const setTextContrast = (contrastId: TextContrastId) => {
    updateSetting('textContrast', contrastId);
  };

  const setCardRadius = (radiusId: CardRadiusId) => {
    updateSetting('cardRadius', radiusId);
  };

  const setGlowIntensity = (glowId: GlowIntensityId) => {
    updateSetting('glowIntensity', glowId);
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  // Theme compatibility functions
  const theme: 'dark' | 'light' = settings.surfacePreset === 'frost-light' ? 'light' : 'dark';

  const toggleTheme = () => {
    if (theme === 'dark') {
      setSurfacePreset('frost-light');
    } else {
      setSurfacePreset('deep-space');
    }
  };

  const setTheme = (t: 'dark' | 'light') => {
    if (t === 'light') {
      setSurfacePreset('frost-light');
    } else {
      setSurfacePreset('deep-space');
    }
  };

  return (
    <CustomizationContext.Provider
      value={{
        settings,
        updateSetting,
        setColorPreset,
        setCustomColors,
        setSurfacePreset,
        setFontFamily,
        setFontSize,
        setTextContrast,
        setCardRadius,
        setGlowIntensity,
        resetToDefaults,
        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
};

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within a ThemeProvider');
  }
  return context;
};

export const useTheme = () => {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return {
    theme: context.theme,
    toggleTheme: context.toggleTheme,
    setTheme: context.setTheme,
  };
};
