import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Sparkles,
  Zap,
  Activity,
  Check,
  Disc,
  Headphones,
  Waves,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { audioDspEngine, SoundstageProfile, DspState } from '../../services/audioDspEngine';
import { useBeatSync } from '../../hooks/useBeatSync';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AudiophileDspModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [dspState, setDspState] = useState<DspState>(audioDspEngine.state);
  const { bpm, isBeat, spectralBands } = useBeatSync({ sensitivity: 1.15, bandCount: 16 });

  useEffect(() => {
    return audioDspEngine.subscribe(setDspState);
  }, []);

  if (!isOpen) return null;

  const profiles: Array<{
    id: SoundstageProfile;
    title: string;
    tagline: string;
    icon: any;
    color: string;
  }> = [
    {
      id: 'reference',
      title: 'Studio Reference',
      tagline: 'Abbey Road bit-perfect flat line. Transparent, uncolored studio audio.',
      icon: Disc,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'bass',
      title: 'Bass Euphoria',
      tagline: '+6.5dB low-shelf 80Hz punch with deep transient sub-bass impact.',
      icon: Zap,
      color: 'from-amber-500 to-rose-600',
    },
    {
      id: 'vocals',
      title: 'Silk Acoustic Vocals',
      tagline: 'Intimate 2.4kHz vocal presence with velvet shimmer for crystal clarity.',
      icon: Headphones,
      color: 'from-pink-500 to-fuchsia-600',
    },
    {
      id: 'spatial',
      title: 'Spatial 3D Holographic',
      tagline: 'Expansive binaural soundstage projecting outside the headphones.',
      icon: Waves,
      color: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'tube',
      title: 'Analog Tube Warmth',
      tagline: 'Vintage McIntosh tube amp harmonics with rounded analog warmth.',
      icon: Sparkles,
      color: 'from-orange-500 to-amber-600',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-2xl animate-fade-in select-none">
      <div
        className="apple-water-bubble relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-dark-secondary/55 backdrop-blur-3xl border border-white/20 p-6 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.9)] flex flex-col space-y-6 scrollbar-none overflow-hidden"
      >
        {/* Top Specular Sheen */}
        <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/15 to-transparent rounded-t-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  AUDIOPHILE MASTER DSP
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>320 KBPS HI-RES</span>
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Studio-Grade Digital Signal Processing & Soundstage Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-dark-bg/80 hover:bg-dark-hover border border-dark-border text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Hi-Fi Audio Pipeline Telemetry Deck */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[11px]">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="text-gray-400 text-[9px] uppercase">Stream Bitrate</div>
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>320 kbps AAC/MP3</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="text-gray-400 text-[9px] uppercase">Sample Rate</div>
            <div className="text-cyan-300 font-bold">
              {dspState.sampleRate.toLocaleString()} Hz
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="text-gray-400 text-[9px] uppercase">Audio Precision</div>
            <div className="text-purple-300 font-bold">
              24-Bit FLAC Depth
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="text-gray-400 text-[9px] uppercase">Soundstage Mode</div>
            <div className="text-white font-bold capitalize truncate">
              {dspState.profile}
            </div>
          </div>
        </div>

        {/* Soundstage Profiles Grid */}
        <div className="relative z-10 space-y-2">
          <div className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
            <span>SOUNDSTAGE ACOUSTIC PROFILES</span>
            <span className="text-[10px] text-accent">Select Acoustic Curve</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {profiles.map(p => {
              const Icon = p.icon;
              const isSelected = dspState.profile === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => audioDspEngine.applyProfile(p.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-white/20 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                      : 'bg-black/40 border-white/10 hover:border-white/25 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-xl bg-gradient-to-tr ${p.color} text-white shadow-sm`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white tracking-tight">
                        {p.title}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="p-0.5 rounded-full bg-cyan-400 text-black shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    {p.tagline}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3-Band Parametric Fine Tuning Sliders */}
        <div className="relative z-10 p-4 rounded-2xl bg-black/40 border border-white/10 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-300">
            <span>MANUAL MASTERING FREQUENCY EQ</span>
            <span className="text-[10px] text-gray-400">dB Gain Adjust</span>
          </div>

          <div className="space-y-3.5">
            {/* Bass Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">Sub-Bass & Low-End (80 Hz)</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {dspState.bassGain > 0 ? `+${dspState.bassGain.toFixed(1)}` : dspState.bassGain.toFixed(1)} dB
                </span>
              </div>
              <input
                type="range"
                min={-12}
                max={12}
                step={0.5}
                value={dspState.bassGain}
                onChange={e => audioDspEngine.setBassGain(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Midrange Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">Vocal Intimacy & Midrange (2.4 kHz)</span>
                <span className="font-mono text-purple-400 font-bold">
                  {dspState.midGain > 0 ? `+${dspState.midGain.toFixed(1)}` : dspState.midGain.toFixed(1)} dB
                </span>
              </div>
              <input
                type="range"
                min={-12}
                max={12}
                step={0.5}
                value={dspState.midGain}
                onChange={e => audioDspEngine.setMidGain(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            {/* Treble Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">Air & Acoustic Treble Sheen (11 kHz)</span>
                <span className="font-mono text-pink-400 font-bold">
                  {dspState.trebleGain > 0 ? `+${dspState.trebleGain.toFixed(1)}` : dspState.trebleGain.toFixed(1)} dB
                </span>
              </div>
              <input
                type="range"
                min={-12}
                max={12}
                step={0.5}
                value={dspState.trebleGain}
                onChange={e => audioDspEngine.setTrebleGain(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-400"
              />
            </div>
          </div>
        </div>

        {/* Spatial 3D & Brickwall Limiter Toggles */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => audioDspEngine.toggleSpatialAudio()}
            className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
              dspState.spatialAudio
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200 shadow-sm'
                : 'bg-black/40 border-white/10 text-gray-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Waves className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-xs font-bold text-white">Spatial 3D Soundstage</div>
                <div className="text-[10px] text-gray-300">Expansive binaural stereo widening</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/40 border border-white/15">
              {dspState.spatialAudio ? 'ACTIVE' : 'OFF'}
            </span>
          </div>

          <div
            onClick={() => audioDspEngine.toggleLimiter()}
            className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
              dspState.limiterEnabled
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-200 shadow-sm'
                : 'bg-black/40 border-white/10 text-gray-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-xs font-bold text-white">Master Brickwall Limiter</div>
                <div className="text-[10px] text-gray-300">Prevents digital clipping & distortion</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/40 border border-white/15">
              {dspState.limiterEnabled ? 'PROTECTED' : 'BYPASS'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

