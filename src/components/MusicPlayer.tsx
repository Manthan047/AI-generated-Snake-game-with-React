import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Terminal } from 'lucide-react';

const TRACKS = [
  { id: 1, title: "SECTOR_1_BREACH", artist: "NULL_ENTITY", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "DATA_CORRUPTION", artist: "SYS_ADMIN_OVERRIDE", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "VOID_SIGNAL", artist: "UNKNOWN_ORIGIN", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleTrackEnd = () => {
    nextTrack();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const percentage = x / bounds.width;
      audioRef.current.currentTime = percentage * audioRef.current.duration;
    }
  };

  return (
    <div className="bg-black border-4 border-[#00FFFF] p-6 w-full max-w-md mx-auto flex flex-col gap-6 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#FF00FF] animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#00FFFF]"></div>
      
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
      />
      
      {/* Header */}
      <div className="flex justify-between items-center border-b-2 border-[#FF00FF] pb-2">
        <span className="text-[#FF00FF] text-xl">{'>'} AUDIO_STREAM</span>
        <span className="text-[#00FFFF] animate-pulse">{isPlaying ? 'ACTIVE' : 'IDLE'}</span>
      </div>

      {/* Track Info */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 border-2 border-[#00FFFF] bg-black flex items-center justify-center relative overflow-hidden">
          <Terminal className={`w-8 h-8 text-[#FF00FF] ${isPlaying ? 'glitch-effect' : ''}`} data-text=">_" />
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="text-[#00FFFF] font-bold text-2xl truncate uppercase">
            {currentTrack.title}
          </h3>
          <p className="text-[#FF00FF] text-lg truncate uppercase tracking-wider">
            SRC: {currentTrack.artist}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div 
          className="h-4 bg-black border-2 border-[#FF00FF] cursor-pointer relative"
          onClick={handleProgressClick}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-[#00FFFF] transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[#FF00FF] text-sm">
          <span>{Math.floor(progress)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between border-t-2 border-[#FF00FF] pt-4">
        <div className="flex items-center gap-2 text-[#00FFFF]">
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-[#FF00FF] hover:text-black transition-colors border-2 border-transparent hover:border-[#00FFFF]">
            {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setIsMuted(false);
            }}
            className="w-24 h-2 bg-black border border-[#00FFFF] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#FF00FF]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={prevTrack}
            className="p-2 text-[#00FFFF] border-2 border-[#00FFFF] hover:bg-[#00FFFF] hover:text-black transition-colors"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-14 h-14 flex items-center justify-center bg-black border-4 border-[#FF00FF] text-[#FF00FF] hover:bg-[#FF00FF] hover:text-black transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>
          
          <button 
            onClick={nextTrack}
            className="p-2 text-[#00FFFF] border-2 border-[#00FFFF] hover:bg-[#00FFFF] hover:text-black transition-colors"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
