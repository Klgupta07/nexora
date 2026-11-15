export interface ArtistProfile {
  name: string;
  photoUrl: string;
  monthlyListeners: string;
  verified: boolean;
  bio: string;
  genres: string[];
  followers: string;
  ranking: string;
}

export const POPULAR_ARTISTS_PROFILES: Record<string, ArtistProfile> = {
  'sabrina carpenter': {
    name: 'Sabrina Carpenter',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80',
    monthlyListeners: '88,421,950',
    verified: true,
    bio: 'Multi-platinum pop icon dominating Billboard Hot 100 with Short n\' Sweet, Espresso, and Taste.',
    genres: ['Pop', 'Synth-Pop', 'Disco-Pop'],
    followers: '24.2M',
    ranking: '#4 in the world',
  },
  'taylor swift': {
    name: 'Taylor Swift',
    photoUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=900&auto=format&fit=crop&q=80',
    monthlyListeners: '105,290,140',
    verified: true,
    bio: '14-time Grammy winner, historic Era tour record breaker, and iconic generational lyricist.',
    genres: ['Pop', 'Country-Pop', 'Synthwave'],
    followers: '112M',
    ranking: '#2 in the world',
  },
  'the weeknd': {
    name: 'The Weeknd',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&auto=format&fit=crop&q=80',
    monthlyListeners: '114,830,500',
    verified: true,
    bio: 'King of dark R&B and retro 80s synth-pop, creator of Blinding Lights, After Hours, and Starboy.',
    genres: ['R&B', 'Synth-Pop', 'Alternative'],
    followers: '85M',
    ranking: '#1 in the world',
  },
  'dua lipa': {
    name: 'Dua Lipa',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&auto=format&fit=crop&q=80',
    monthlyListeners: '74,500,200',
    verified: true,
    bio: '3-time Grammy-winning global dance-pop sensation, redefining modern disco with Future Nostalgia.',
    genres: ['Disco-Pop', 'Dance-Pop', 'Nu-Disco'],
    followers: '45M',
    ranking: '#9 in the world',
  },
  'arijit singh': {
    name: 'Arijit Singh',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop&q=80',
    monthlyListeners: '42,150,000',
    verified: true,
    bio: 'The soulful voice of Bollywood cinema, legendary Indian playback singer and raga maestro.',
    genres: ['Bollywood', 'Sufi', 'Romantic Ghazal'],
    followers: '38M',
    ranking: '#1 in India',
  },
  'diljit dosanjh': {
    name: 'Diljit Dosanjh',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&auto=format&fit=crop&q=80',
    monthlyListeners: '22,400,000',
    verified: true,
    bio: 'Global Punjabi sensation, Coachella pioneer, and superstar behind G.O.A.T., Lover, and Born to Shine.',
    genres: ['Punjabi Trap', 'Bhangra Drill', 'Pop'],
    followers: '19M',
    ranking: '#1 Punjabi Global',
  },
};

export function getArtistProfile(artistName: string, coverFallback?: string): ArtistProfile {
  if (!artistName) {
    return {
      name: 'Independent Artist',
      photoUrl: coverFallback || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&auto=format&fit=crop&q=80',
      monthlyListeners: '1,240,500',
      verified: true,
      bio: 'High-fidelity audio artist streaming across Chillmode multi-lingual engine.',
      genres: ['Global Music', 'Electronic'],
      followers: '450K',
      ranking: 'Trending Artist',
    };
  }

  const clean = artistName.trim().toLowerCase();
  for (const [key, profile] of Object.entries(POPULAR_ARTISTS_PROFILES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return profile;
    }
  }

  // Fallback realistic profile
  return {
    name: artistName,
    photoUrl: coverFallback || `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&auto=format&fit=crop&q=80`,
    monthlyListeners: '14,890,200',
    verified: true,
    bio: `Chart-topping recording artist streaming live in lossless high-definition audio.`,
    genres: ['Global Hits', 'Streaming Audio'],
    followers: '6.4M',
    ranking: 'Chartbuster',
  };
}

