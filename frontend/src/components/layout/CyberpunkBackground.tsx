import React, { useState, useEffect, useMemo } from 'react';
import { useCustomization } from '../../context/ThemeContext';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { useBeatSync } from '../../hooks/useBeatSync';
import { getSongTheme, SongTheme } from '../../services/songThemeService';

export const CyberpunkBackground: React.FC = () => {
  const { theme } = useCustomization();
  const { currentTrack, isPlaying } = useMusicPlayer();
  const isLight = theme === 'light';

  // 🎵 Real-time Beat & Audio Cadence
  const { bpm, energy, isBeat, spectralBands } = useBeatSync({
    sensitivity: 1.15,
    bandCount: 16,
  });

  // 🎨 Dynamic Song Theme Lighting
  const songTheme: SongTheme = useMemo(() => {
    return getSongTheme(
      currentTrack?.title,
      currentTrack?.artist,
      currentTrack?.genre
    );
  }, [currentTrack?.title, currentTrack?.artist, currentTrack?.genre]);

  // Smooth cross-fade wallpaper state
  const [currentCover, setCurrentCover] = useState<string | null>(null);
  const [prevCover, setPrevCover] = useState<string | null>(null);
  const [isCrossFading, setIsCrossFading] = useState<boolean>(false);

  // Automatically update wallpaper whenever currentTrack changes
  useEffect(() => {
    const nextCover = currentTrack?.coverUrl || null;
    if (nextCover === currentCover) return;

    if (!currentCover) {
      setCurrentCover(nextCover);
      return;
    }

    if (nextCover) {
      setPrevCover(currentCover);
      setCurrentCover(nextCover);
      setIsCrossFading(true);

      const timer = setTimeout(() => {
        setIsCrossFading(false);
        setPrevCover(null);
      }, 1200);

      return () => clearTimeout(timer);
    } else {
      setPrevCover(currentCover);
      setCurrentCover(null);
      setIsCrossFading(true);
      const timer = setTimeout(() => {
        setIsCrossFading(false);
        setPrevCover(null);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentTrack?.coverUrl, currentCover]);

  // Average high-frequency energy for intense lighting flare
  const highBandEnergy = useMemo(() => {
    if (!spectralBands.length) return 0.2;
    const slice = spectralBands.slice(0, 8);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / slice.length;
  }, [spectralBands]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-dark-bg">
      {/* ========================================================
          1. 🎵 DYNAMIC LIVE SONG WALLPAPER (Automatic Cross-Fade)
          ======================================================== */}
      {prevCover && (
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            isCrossFading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-[60px] scale-125 opacity-55"
            style={{
              backgroundImage: `url(${prevCover})`,
              filter: 'blur(60px) saturate(1.6) brightness(0.7)',
            }}
          />
          <div
            className="absolute inset-0 bg-contain bg-center bg-no-repeat filter blur-[8px] scale-105 opacity-30"
            style={{
              backgroundImage: `url(${prevCover})`,
              maskImage:
                'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.3) 65%, transparent 95%)',
              WebkitMaskImage:
                'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.3) 65%, transparent 95%)',
            }}
          />
        </div>
      )}

      {currentCover && (
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            isCrossFading ? 'opacity-100' : 'opacity-100'
          }`}
        >
          {/* Deep atmospheric ambient glow from song artwork */}
          <div
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out ${
              isPlaying ? 'scale-125 opacity-70' : 'scale-110 opacity-45'
            }`}
            style={{
              backgroundImage: `url(${currentCover})`,
              filter: `blur(65px) saturate(1.8) brightness(${isBeat ? '0.85' : '0.65'})`,
              transform: isBeat ? 'scale(1.28)' : 'scale(1.22)',
            }}
          />

          {/* High-res Ambient Song Canvas with soft vignette */}
          <div
            className={`absolute inset-0 bg-contain bg-center bg-no-repeat transition-all duration-500 ease-out ${
              isPlaying ? 'scale-105 opacity-45' : 'scale-100 opacity-25'
            }`}
            style={{
              backgroundImage: `url(${currentCover})`,
              filter: 'blur(4px) saturate(1.3) brightness(0.85)',
              maskImage:
                'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0.95) 25%, rgba(0,0,0,0.4) 65%, transparent 95%)',
              WebkitMaskImage:
                'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0.95) 25%, rgba(0,0,0,0.4) 65%, transparent 95%)',
            }}
          />
        </div>
      )}

      {/* ========================================================
          2. ⚡ SYNCED THEME LIGHTING (BEAT PULSING ON WALLPAPER)
          ======================================================== */}
      {/* 🌟 Primary Theme Color Ambient Aura (Top-Left) */}
      <div
        className="absolute -top-32 -left-32 w-[680px] h-[680px] rounded-full blur-[130px] transition-all duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${songTheme.primary} 0%, transparent 70%)`,
          opacity: isPlaying ? (isBeat ? 0.6 : 0.35 + highBandEnergy * 0.3) : 0.2,
          transform: isBeat ? 'scale(1.25)' : 'scale(1.0)',
        }}
      />

      {/* 🌟 Secondary Theme Color Ambient Aura (Top-Right) */}
      <div
        className="absolute top-1/4 -right-28 w-[640px] h-[640px] rounded-full blur-[140px] transition-all duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${songTheme.secondary} 0%, transparent 70%)`,
          opacity: isPlaying ? (isBeat ? 0.55 : 0.3 + highBandEnergy * 0.25) : 0.18,
          transform: isBeat ? 'scale(1.2)' : 'scale(1.0)',
        }}
      />

      {/* 🌟 Accent Theme Color Aura (Bottom-Center Pulse) */}
      <div
        className="absolute -bottom-40 left-1/3 w-[750px] h-[550px] rounded-full blur-[150px] transition-all duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${songTheme.accent} 0%, transparent 75%)`,
          opacity: isPlaying ? (isBeat ? 0.5 : 0.25) : 0.15,
          transform: isBeat ? 'scale(1.22)' : 'scale(1.0)',
        }}
      />

      {/* 🌈 Reactive Chromatic Aurora Sweep Ribbon across Horizon */}
      <div
        className="absolute top-1/2 left-0 right-0 h-96 -translate-y-1/2 blur-[90px] transition-all duration-500 pointer-events-none opacity-30"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${songTheme.primary} 30%, ${songTheme.secondary} 60%, ${songTheme.accent} 85%, transparent 100%)`,
          opacity: isPlaying ? (isBeat ? 0.45 : 0.22) : 0.08,
          transform: `scaleY(${isBeat ? 1.4 : 1.0})`,
        }}
      />

      {/* 🔮 Active Perimeter Rim Light (Ambilight effect on browser viewport edges) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          boxShadow: isPlaying && isBeat
            ? `inset 0 0 100px 10px ${songTheme.primary}40, inset 0 0 40px 5px ${songTheme.accent}50`
            : isPlaying
            ? `inset 0 0 60px 5px ${songTheme.primary}20`
            : 'none',
        }}
      />

      {/* ========================================================
          3. 🌫️ SEMI-TRANSPARENT GLASS & VIGNETTE OVERLAYS
          ======================================================== */}
      {/* Dark Vignette Layer for crystal-clear readability with high wallpaper transparency */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/35 via-dark-bg/45 to-dark-bg/60 pointer-events-none" />

      {/* Cyber Grid Signature Texture with theme accent tint */}
      <div
        className="absolute inset-0 cyber-grid-pattern opacity-20 pointer-events-none"
        style={{
          maskImage:
            'radial-gradient(ellipse at 50% 35%, rgba(0,0,0,0.85) 15%, rgba(0,0,0,0.2) 65%, transparent 95%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at 50% 35%, rgba(0,0,0,0.85) 15%, rgba(0,0,0,0.2) 65%, transparent 95%)',
        }}
      />
    </div>
  );
};
