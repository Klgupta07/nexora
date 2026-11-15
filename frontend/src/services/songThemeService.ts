export interface SongTheme {
  primary: string;    // Main vibrant glow color
  secondary: string;  // Supporting mood color
  accent: string;     // High-energy highlight color
  glowRgba: string;   // Alpha rgba string for lighting pulses
  mood: string;       // Mood descriptor
}

// Curated Signature Song Lighting Themes
export const CURATED_SONG_THEMES: Record<string, SongTheme> = {
  // Sabrina Carpenter - Espresso / Taste (Vibrant Retro Pop, Strawberry Coral, Warm Amber)
  'espresso': {
    primary: '#f43f5e', // Hot Strawberry Pink
    secondary: '#f59e0b', // Warm Amber Gold
    accent: '#06b6d4', // Electric Cyan pop
    glowRgba: 'rgba(244, 63, 94, 0.45)',
    mood: 'Sunset Disco Glow',
  },
  'taste': {
    primary: '#ec4899', // Pink
    secondary: '#8b5cf6', // Violet
    accent: '#facc15', // Bright Amber
    glowRgba: 'rgba(236, 72, 153, 0.45)',
    mood: 'Neon Pop Radiance',
  },
  'sabrina carpenter': {
    primary: '#f43f5e',
    secondary: '#fb7185',
    accent: '#f59e0b',
    glowRgba: 'rgba(244, 63, 94, 0.42)',
    mood: 'Pop Diva Glam',
  },

  // Taylor Swift - Cruel Summer (Dreamy Synthwave Lavender & Cyan)
  'cruel summer': {
    primary: '#8b5cf6', // Purple / Lavender
    secondary: '#06b6d4', // Cyan
    accent: '#f43f5e', // Rose
    glowRgba: 'rgba(139, 92, 246, 0.45)',
    mood: 'Pastel Horizon Aurora',
  },
  'taylor swift': {
    primary: '#a855f7',
    secondary: '#38bdf8',
    accent: '#f472b6',
    glowRgba: 'rgba(168, 85, 247, 0.42)',
    mood: 'Era Shimmer Aura',
  },

  // The Weeknd - Blinding Lights (80s Neon Cyber Synthwave Crimson & Violet)
  'blinding lights': {
    primary: '#ef4444', // Neon Crimson Red
    secondary: '#8b5cf6', // Deep Purple
    accent: '#3b82f6', // Electric Indigo Blue
    glowRgba: 'rgba(239, 68, 68, 0.5)',
    mood: 'Cyber Neon Midnight',
  },
  'the weeknd': {
    primary: '#ef4444',
    secondary: '#6366f1',
    accent: '#ec4899',
    glowRgba: 'rgba(239, 68, 68, 0.45)',
    mood: 'Sin City Pulse',
  },

  // Dua Lipa - Levitating (Nu-Disco Cyberpunk Cyan & Magenta)
  'levitating': {
    primary: '#d946ef', // Magenta
    secondary: '#06b6d4', // Cyan
    accent: '#3b82f6', // Royal Blue
    glowRgba: 'rgba(217, 70, 239, 0.45)',
    mood: 'Cosmic Nu-Disco',
  },
  'dua lipa': {
    primary: '#ec4899',
    secondary: '#06b6d4',
    accent: '#8b5cf6',
    glowRgba: 'rgba(236, 72, 153, 0.45)',
    mood: 'Future Nostalgia Beam',
  },

  // Bollywood / Romantic - Kesariya / Arijit Singh (Warm Saffron, Flame Gold & Emerald)
  'kesariya': {
    primary: '#f97316', // Saffron Orange
    secondary: '#eab308', // Sun Gold
    accent: '#10b981', // Emerald
    glowRgba: 'rgba(249, 115, 22, 0.45)',
    mood: 'Golden Saffron Warmth',
  },
  'arijit singh': {
    primary: '#f97316',
    secondary: '#ec4899',
    accent: '#06b6d4',
    glowRgba: 'rgba(249, 115, 22, 0.4)',
    mood: 'Soulful Sufi Twilight',
  },

  // Diljit Dosanjh - Bhangra Trap (High-Energy Electric Cyan & Gold)
  'diljit dosanjh': {
    primary: '#eab308',
    secondary: '#06b6d4',
    accent: '#ef4444',
    glowRgba: 'rgba(234, 179, 8, 0.45)',
    mood: 'Born to Shine Luminescence',
  },
};

// Procedural Theme Colors Palette based on Genre or Song Title Hash
const GENRE_THEMES: Record<string, SongTheme> = {
  pop: {
    primary: '#ec4899',
    secondary: '#06b6d4',
    accent: '#f59e0b',
    glowRgba: 'rgba(236, 72, 153, 0.4)',
    mood: 'Electric Pop Neon',
  },
  rock: {
    primary: '#ef4444',
    secondary: '#f97316',
    accent: '#eab308',
    glowRgba: 'rgba(239, 68, 68, 0.45)',
    mood: 'Crimson Amp Fire',
  },
  electronic: {
    primary: '#06b6d4',
    secondary: '#8b5cf6',
    accent: '#10b981',
    glowRgba: 'rgba(6, 182, 212, 0.45)',
    mood: 'Cyber Rave Laser',
  },
  hiphop: {
    primary: '#8b5cf6',
    secondary: '#ef4444',
    accent: '#f59e0b',
    glowRgba: 'rgba(139, 92, 246, 0.4)',
    mood: 'Urban Bass Heat',
  },
  ambient: {
    primary: '#10b981',
    secondary: '#06b6d4',
    accent: '#6366f1',
    glowRgba: 'rgba(16, 185, 129, 0.35)',
    mood: 'Ether Mystic Calm',
  },
  acoustic: {
    primary: '#f59e0b',
    secondary: '#f97316',
    accent: '#84cc16',
    glowRgba: 'rgba(245, 158, 11, 0.38)',
    mood: 'Warm Hearth Amber',
  },
};

/**
 * Returns a reactive lighting theme tailored for any song
 */
export function getSongTheme(title?: string, artist?: string, genre?: string): SongTheme {
  const cleanTitle = (title || '').toLowerCase().trim();
  const cleanArtist = (artist || '').toLowerCase().trim();

  // 1. Direct song title match
  for (const [key, theme] of Object.entries(CURATED_SONG_THEMES)) {
    if (cleanTitle.includes(key)) {
      return theme;
    }
  }

  // 2. Artist match
  for (const [key, theme] of Object.entries(CURATED_SONG_THEMES)) {
    if (cleanArtist.includes(key)) {
      return theme;
    }
  }

  // 3. Genre match
  const cleanGenre = (genre || '').toLowerCase().trim();
  for (const [key, theme] of Object.entries(GENRE_THEMES)) {
    if (cleanGenre.includes(key)) {
      return theme;
    }
  }

  // 4. Deterministic Hash-based Color Engine for any track
  let hash = 0;
  const str = `${cleanTitle}-${cleanArtist}`;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 50) % 360;
  const hue3 = (hue1 + 180) % 360;

  return {
    primary: `hsl(${hue1}, 85%, 60%)`,
    secondary: `hsl(${hue2}, 80%, 55%)`,
    accent: `hsl(${hue3}, 90%, 65%)`,
    glowRgba: `hsla(${hue1}, 85%, 60%, 0.4)`,
    mood: 'Dynamic Audio Prism',
  };
}

