'use client';
import { useState, useEffect, useRef } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useConversationHistory } from '@/hooks/useConversationHistory'; // <--- New Hook
import { sendAudioToVertex } from '@/services/api';
import { RecordButton } from '@/components/mantra/RecordButton';
import { StatusDisplay } from '@/components/mantra/StatusDisplay';
import { useSilenceDetection } from '@/hooks/useSilenceDetection';

// REMOVED: AudioDebug (User doesn't need to see the audio player)

export default function Home() {
  const { isRecording, startRecording, stopRecording, audioBlob, stream } = useAudioRecorder();
  const { history, addToHistory, clearHistory } = useConversationHistory(); // <--- Invisible Memory
  const [status, setStatus] = useState("Tap to talk");

  const isConversationActive = useRef(false); 

  // 1. SILENCE DETECTION HOOK
  useSilenceDetection(stream, () => {
    // Only stop if we are actually recording
    if (isRecording) {
      console.log("Silence detected... Auto-sending.");
      stopRecording();
    }
  });

  const handleToggleRecord = () => {
    if (isRecording) {
      isConversationActive.current = false; // User manually stopped
      stopRecording();
      setStatus("Paused");
    } else {
      isConversationActive.current = true; // User started session
      startRecording();
      setStatus("Listening...");
    }
  };

  const playAudioResponse = async (text: string, voiceId: string) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      // 2. AUTO-RESUME LOGIC
      audio.onended = () => {
        if (isConversationActive.current) {
          setStatus("Listening...");
          startRecording(); // <--- The Loop!
        } else {
          setStatus("Tap to talk");
        }
      };
      
      audio.play();
    } catch (error) {
      console.error("Audio playback failed", error);
      setStatus("Error playing audio");
    }
  };

  useEffect(() => {
    if (audioBlob) {
      setStatus("Thinking...");
      
      sendAudioToVertex(audioBlob, history)
        .then((data) => {
          setStatus(data.mode === 'INTERVIEWER' ? "Interviewing..." : "Speaking...");
          
          // CRISIS CHECK
          if (data.isCrisis) {
            alert("CRISIS DETECTED: Please call 988 or your local emergency number immediately.");
            // Stop the auto-loop here
            isConversationActive.current = false; 
          }

          addToHistory(data.transcript, data.reply);
          playAudioResponse(data.reply, data.voiceId);
        })
        .catch((err) => {
          setStatus("Connection Error");
          console.error(err);
          isConversationActive.current = false; // Stop loop on error
        });
    }
  }, [audioBlob])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
      {/* Brand Header */}
      <div className="absolute top-8 flex flex-col items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
          Mood-Mantra
        </h1>
        <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">
          Secure • Private • Local
        </p>
      </div>
      
      {/* The Visual Centerpiece */}
      <div className="flex flex-col items-center gap-8">
        <StatusDisplay status={status} />
        
        <RecordButton 
          isRecording={isRecording} 
          onToggle={handleToggleRecord} 
        />
        
        {/* Helper text for user */}
        {isRecording && (
          <p className="text-xs text-slate-500 animate-pulse">
            Hands-free mode active. Just speak naturally.
          </p>
        )}


        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="text-xs text-slate-600 hover:text-red-400 mt-12 transition-colors"
          >
            Clear Memory
          </button>
        )}
      </div>
    </div>
  );
}