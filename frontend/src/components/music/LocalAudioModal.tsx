import React, { useRef } from 'react';
import { X, FolderOpen, Music, Check, Sparkles, Upload } from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { useNotification } from '../../context/NotificationContext';
import { Track } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalAudioModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { playTrack } = useMusicPlayer();
  const { addNotification } = useNotification();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    const tracks: Track[] = fileList.map((file, idx) => {
      const objectUrl = URL.createObjectURL(file);
      const nameParts = file.name.replace(/\.[^/.]+$/, '').split(' - ');
      const artist = nameParts.length > 1 ? nameParts[0].trim() : 'Local Audiophile Artist';
      const title = nameParts.length > 1 ? nameParts.slice(1).join(' - ').trim() : nameParts[0].trim();

      return {
        id: `local-${Date.now()}-${idx}`,
        title,
        artist,
        album: 'Local Lossless Collection',
        duration: 0,
        audioUrl: objectUrl,
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        genre: file.name.endsWith('.flac') ? 'Lossless FLAC' : 'High-Res Audio',
        language: 'Local',
        license: 'Local Device Audio',
        source: 'Local Device',
        isVideo: false,
      };
    });

    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
      addNotification({
        type: 'success',
        title: 'Loaded Local Lossless Audio',
        message: `Imported ${tracks.length} track(s) from device into Hi-Fi engine.`,
        duration: 4000,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-2xl animate-fade-in select-none">
      <div className="apple-water-bubble relative w-full max-w-md rounded-3xl bg-dark-secondary/55 backdrop-blur-3xl border border-white/20 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.9)] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-sm">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Local Hi-Res Audio Player</h2>
              <p className="text-[11px] font-mono text-gray-400">Stream lossless FLAC, WAV, MP3 from device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-dark-bg/80 hover:bg-dark-hover border border-dark-border text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.flac,.wav,.mp3,.aac,.m4a"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-8 rounded-2xl border-2 border-dashed border-white/20 hover:border-accent/60 bg-black/40 hover:bg-black/60 transition-all cursor-pointer text-center space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/10 group-hover:bg-accent/20 text-white group-hover:text-accent flex items-center justify-center mx-auto transition-all shadow-sm">
            <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-sm font-bold text-white group-hover:text-accent transition-colors">
              Click to browse audio files
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Supports FLAC (24-bit/96kHz), WAV, MP3, AAC, M4A
            </div>
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-white/10 text-gray-300 border border-white/15">
            Direct Web Audio DSP Master Playback
          </span>
        </div>
      </div>
    </div>
  );
};

