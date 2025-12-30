'use client';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';

interface RecordButtonProps {
  isRecording: boolean;
  onToggle: () => void;
}

export function RecordButton({ isRecording, onToggle }: RecordButtonProps) {
  return (
    <div className="relative group" role="none">
      {/* Outer glow rings */}
      <div className={`absolute -inset-4 bg-linear-to-r from-cyan-500/30 to-blue-600/30 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-all duration-1000 @supports(backdrop-filter:blur(1px)):backdrop-blur-sm ${isRecording ? '@animation-pulse opacity-50' : ''}`}></div>
      
      {/* Middle ring */}
      <div className={`absolute -inset-2 bg-linear-to-r from-cyan-500/20 to-blue-600/20 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-all duration-700 ${isRecording ? 'opacity-30 @animation-[spin_20s_linear_infinite]' : ''}`}></div>
      
      <Button
        onClick={onToggle}
        className={`relative size-20 sm:size-24 lg:size-28 rounded-full flex items-center justify-center transition-all duration-500 border-2 backdrop-blur-sm ${
          isRecording 
          ? 'bg-red-500/10 border-red-400/50 text-red-300 hover:bg-red-500/20 shadow-lg shadow-red-900/30' 
          : 'bg-white/5 border-slate-600/30 text-cyan-300 hover:bg-white/10 hover:border-cyan-400/50 shadow-lg hover:shadow-cyan-900/20'
        } cursor-pointer focus:outline-2 focus:outline-cyan-500/50 focus:outline-offset-4`}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        aria-live="polite"
      >
        {/* Inner gradient */}
        <div className={`absolute inset-0 rounded-full bg-linear-to-br ${isRecording ? 'from-red-500/10 to-rose-600/10' : 'from-cyan-500/10 to-blue-600/10'} opacity-50`}></div>
        
        {isRecording ? (
          <Square className="size-6 sm:size-8 fill-current relative z-10 @animation-pulse" />
        ) : (
          <div className="relative">
            <Mic className="size-6 sm:size-8 relative z-10" />
            {/* Subtle mic glow */}
            <div className="absolute -inset-3 bg-cyan-500/20 blur-md rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
          </div>
        )}
        
        {/* Ripple effect */}
        <div className={`absolute inset-0 rounded-full border-2 ${isRecording ? 'border-red-500/30' : 'border-cyan-500/20'} @animation-[ping_2s_ease-in-out_infinite]`}></div>
      </Button>
    </div>
  );
}