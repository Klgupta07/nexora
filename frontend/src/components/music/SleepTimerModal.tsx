import React, { useState, useEffect } from 'react';
import { X, Moon, Clock, Check, BellOff, VolumeX } from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { useNotification } from '../../context/NotificationContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

let activeTimerId: any = null;
let fadeIntervalId: any = null;

export const SleepTimerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('nexora_sleep_timer_end');
      if (saved) {
        const remaining = Math.round((parseInt(saved, 10) - Date.now()) / 60000);
        if (remaining > 0) return remaining;
      }
    } catch {}
    return null;
  });

  const { togglePlay, isPlaying, setVolume, volume } = useMusicPlayer();
  const { addNotification } = useNotification();

  const presets = [
    { label: '15 Minutes', mins: 15 },
    { label: '30 Minutes', mins: 30 },
    { label: '45 Minutes', mins: 45 },
    { label: '60 Minutes (1 Hour)', mins: 60 },
    { label: '90 Minutes', mins: 90 },
  ];

  const handleSetTimer = (mins: number) => {
    if (activeTimerId) clearTimeout(activeTimerId);
    if (fadeIntervalId) clearInterval(fadeIntervalId);

    setSelectedMinutes(mins);
    const endTime = Date.now() + mins * 60 * 1000;
    try {
      localStorage.setItem('nexora_sleep_timer_end', String(endTime));
    } catch {}

    // Schedule fadeout 30 seconds before timer ends
    const fadeoutMs = Math.max(0, (mins * 60 - 30) * 1000);
    setTimeout(() => {
      let currentVol = volume;
      fadeIntervalId = setInterval(() => {
        currentVol = Math.max(0, currentVol - 0.05);
        setVolume(currentVol);
        if (currentVol <= 0) {
          clearInterval(fadeIntervalId);
        }
      }, 1000);
    }, fadeoutMs);

    activeTimerId = setTimeout(() => {
      if (isPlaying) {
        togglePlay();
      }
      setSelectedMinutes(null);
      try {
        localStorage.removeItem('nexora_sleep_timer_end');
      } catch {}
      addNotification({
        type: 'info',
        title: 'Sleep Timer Activated',
        message: 'Audio paused for peaceful rest.',
        duration: 4000,
      });
    }, mins * 60 * 1000);

    addNotification({
      type: 'success',
      title: 'Sleep Timer Set',
      message: `Audio will smoothly fade out and pause in ${mins} minutes.`,
      duration: 3500,
    });

    onClose();
  };

  const handleCancelTimer = () => {
    if (activeTimerId) clearTimeout(activeTimerId);
    if (fadeIntervalId) clearInterval(fadeIntervalId);
    activeTimerId = null;
    fadeIntervalId = null;
    setSelectedMinutes(null);
    try {
      localStorage.removeItem('nexora_sleep_timer_end');
    } catch {}

    addNotification({
      type: 'info',
      title: 'Sleep Timer Cancelled',
      message: 'Audio playback will continue uninterrupted.',
      duration: 2500,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-2xl animate-fade-in select-none">
      <div className="apple-water-bubble relative w-full max-w-md rounded-3xl bg-dark-secondary/55 backdrop-blur-3xl border border-white/20 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.9)] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-sm">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Smart Sleep Timer</h2>
              <p className="text-[11px] font-mono text-gray-400">Gentle acoustic fadeout & sleep shutdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-dark-bg/80 hover:bg-dark-hover border border-dark-border text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {presets.map(p => {
            const isCurrent = selectedMinutes === p.mins;
            return (
              <button
                key={p.mins}
                onClick={() => handleSetTimer(p.mins)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200'
                    : 'bg-black/40 border-white/10 hover:border-white/25 hover:bg-white/5 text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>{p.label}</span>
                </div>
                {isCurrent && (
                  <span className="p-0.5 rounded-full bg-indigo-400 text-black">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selectedMinutes && (
          <button
            onClick={handleCancelTimer}
            className="w-full py-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <BellOff className="w-3.5 h-3.5" />
            <span>Cancel Active Sleep Timer</span>
          </button>
        )}
      </div>
    </div>
  );
};

