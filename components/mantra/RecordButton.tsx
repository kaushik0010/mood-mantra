'use client';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';

interface RecordButtonProps {
  isRecording: boolean;
  onToggle: () => void;
}

export function RecordButton({ isRecording, onToggle }: RecordButtonProps) {
  return (
    <div className="relative group">
      {/* Glow Effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 ${isRecording ? 'animate-pulse opacity-75' : ''}`}></div>
      
      <Button
        onClick={onToggle}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
          isRecording 
          ? 'bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20' 
          : 'bg-slate-900 border-slate-700 text-cyan-400 hover:bg-slate-800'
        }`}
      >
        {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
      </Button>
    </div>
  );
}