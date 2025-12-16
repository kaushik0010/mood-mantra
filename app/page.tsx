'use client';
import { useState, useEffect } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { StatusDisplay } from '@/components/mantra/StatusDisplay';
import { RecordButton } from '@/components/mantra/RecordButton';
import { AudioDebug } from '@/components/mantra/AudioDebug';
import { sendAudioToVertex } from '@/services/api';

export default function Home() {
  const { isRecording, startRecording, stopRecording, audioBlob } = useAudioRecorder();
  const [status, setStatus] = useState("Ready to listen");

  const handleToggleRecord = () => {
    if (isRecording) {
      stopRecording();
      setStatus("Processing...");
    } else {
      startRecording();
      setStatus("Listening...");
    }
  };

  const playAudioResponse = async (text: string) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });

      // Create a blob from the audio stream
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Play it
      const audio = new Audio(url);
      audio.play();
    } catch (error) {
      console.error("Failed to play audio:", error);
    }
  };

  useEffect(() => {
    if (audioBlob) {
      setStatus("Analyzing Mood...");
      
      sendAudioToVertex(audioBlob)
        .then((reply) => {
          setStatus("Speaking...");
          console.log("AI Said:", reply);
          
          // Triggers the voice!
          playAudioResponse(reply); 
        })
        .catch((err) => {
          setStatus("Error!");
          console.error(err);
        });
    }
  }, [audioBlob]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
      {/* UPDATED TITLE */}
      <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent mb-8">
        Mood-Mantra
      </h1>
      
      <StatusDisplay status={status} />
      
      <RecordButton 
        isRecording={isRecording} 
        onToggle={handleToggleRecord} 
      />

      <AudioDebug audioBlob={audioBlob} />
    </div>
  );
}