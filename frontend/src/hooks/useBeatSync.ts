import { useState, useEffect, useRef, useCallback } from 'react';
import { BeatSyncState } from '../types';
import { useMusicPlayer } from '../context/MusicPlayerContext';

export interface UseBeatSyncOptions {
  enabled?: boolean;
  baseBpm?: number;
  sensitivity?: number;
  bandCount?: number;
}

/**
 * 🎛️ useBeatSync: Real-time Audio Rhythm, BPM & Beat-Pulse Synchronization Hook
 * Calculates dynamic spectral bands, bass drops, and rhythm pulses for interactive visualizers.
 */
export function useBeatSync(options: UseBeatSyncOptions = {}) {
  const { enabled = true, baseBpm = 124, sensitivity = 1.0, bandCount = 12 } = options;
  const { isPlaying, currentTrack } = useMusicPlayer();

  const [beatState, setBeatState] = useState<BeatSyncState>({
    bpm: baseBpm,
    energy: 0,
    isBeat: false,
    beatCount: 0,
    peakFrequency: 60,
    spectralBands: new Array(bandCount).fill(0.05),
  });

  const rafId = useRef<number | null>(null);
  const lastBeatTime = useRef<number>(Date.now());
  const beatCountRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);

  // Dynamic BPM based on track genre/title or fallback to baseBpm
  const activeBpm = currentTrack?.bpm || (
    currentTrack?.genre?.toLowerCase().includes('techno') || currentTrack?.genre?.toLowerCase().includes('synthwave')
      ? 130
      : currentTrack?.genre?.toLowerCase().includes('hip-hop') || currentTrack?.genre?.toLowerCase().includes('rap')
      ? 95
      : currentTrack?.genre?.toLowerCase().includes('k-pop')
      ? 126
      : baseBpm
  );

  const beatIntervalMs = (60 / activeBpm) * 1000;

  useEffect(() => {
    if (!enabled || !isPlaying) {
      setBeatState(prev => ({
        ...prev,
        bpm: activeBpm,
        energy: 0,
        isBeat: false,
        spectralBands: new Array(bandCount).fill(0.02),
      }));
      if (rafId.current) cancelAnimationFrame(rafId.current);
      return;
    }

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const now = Date.now();
      const elapsedSinceBeat = now - lastBeatTime.current;
      const isDownbeat = elapsedSinceBeat >= beatIntervalMs;

      if (isDownbeat) {
        lastBeatTime.current = now;
        beatCountRef.current += 1;
      }

      // Rhythm phase calculation (0 to 1 cycle per beat)
      phaseRef.current = (elapsedSinceBeat % beatIntervalMs) / beatIntervalMs;

      // Pulse decay curve for instantaneous punch
      const pulseDecay = Math.max(0, 1 - phaseRef.current * 2.2);
      const baseEnergy = 0.35 + Math.sin(currentTime * 0.003) * 0.15;
      const currentEnergy = Math.min(1.0, (baseEnergy + pulseDecay * 0.6) * sensitivity);

      // Procedural synthetic spectral audio bands for cyber visualizers
      const bands = new Array(bandCount).fill(0).map((_, i) => {
        const freqOffset = i * 0.45;
        const wave = Math.sin(currentTime * 0.005 + freqOffset) * 0.5 + 0.5;
        const bassBoost = i < 3 ? pulseDecay * 0.7 : pulseDecay * 0.3;
        const value = Math.max(0.08, Math.min(1.0, (wave * 0.45 + bassBoost) * sensitivity));
        return parseFloat(value.toFixed(2));
      });

      setBeatState({
        bpm: activeBpm,
        energy: parseFloat(currentEnergy.toFixed(2)),
        isBeat: isDownbeat,
        beatCount: beatCountRef.current,
        peakFrequency: 60 + Math.round(Math.sin(currentTime * 0.002) * 20),
        spectralBands: bands,
      });

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enabled, isPlaying, activeBpm, beatIntervalMs, sensitivity, bandCount]);

  const tapTempo = useCallback(() => {
    lastBeatTime.current = Date.now();
    beatCountRef.current += 1;
    setBeatState(prev => ({ ...prev, isBeat: true, beatCount: beatCountRef.current }));
  }, []);

  return {
    ...beatState,
    tapTempo,
  };
}

