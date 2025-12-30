'use client';
import { useState, useEffect, useRef } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useConversationHistory } from '@/hooks/useConversationHistory';
import { useSilenceDetection } from '@/hooks/useSilenceDetection';
import { sendAudioToVertex } from '@/services/api';
import { useVolume } from '@/hooks/useVolume';
import { ParticleOrb } from '@/components/mantra/ParticleOrb'; 
import { RecordButton } from '@/components/mantra/RecordButton';

// --- CONFIGURATION ---
// Set to TRUE only for the final demo recording to use ElevenLabs
const USE_PREMIUM_VOICE = false; 

type OrbState = 'idle' | 'listening' | 'speaking' | 'thinking';

export default function Home() {
  const { isRecording, startRecording, stopRecording, audioBlob, stream } = useAudioRecorder();
  const { history, addToHistory, clearHistory } = useConversationHistory();
  const currentVolume = useVolume(stream);
  
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [statusText, setStatusText] = useState("Tap to begin your mindful journey");
  const [showHelpline, setShowHelpline] = useState(false);
  
  const isConversationActive = useRef(false);
  const shouldLoop = useRef(true); 
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechStartTime = useRef<number>(0);
  const recordingStartTime = useRef<number>(0); // To track Grace Period

  // --- FALLBACK: BROWSER NATIVE TTS ---
  const speakWithBrowser = (text: string) => {
    console.log("Using Browser TTS Fallback");
    
    // Cancel any active speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Optional: Try to find a better voice (Google/Female)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google") && v.name.includes("Female")) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    // Tweak to sound slightly less robotic
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setOrbState('speaking');
      setStatusText("Speaking (Dev Mode)...");
      speechStartTime.current = Date.now();
      // Important: Keep barge-in active
      if (!isRecording) startRecording();
    };

    utterance.onend = () => {
      if (shouldLoop.current) {
        setOrbState('listening');
        setStatusText("Listening...");
        if (!isRecording) startRecording();
      } else {
        setOrbState('idle');
        setStatusText("Tap mic to resume");
        stopRecording();
      }
    };

    utterance.onerror = (e) => {
      console.error("Browser TTS Error:", e);
      setOrbState('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  // 1. SILENCE DETECTION (Auto = LOOP)
  useSilenceDetection(
    currentVolume, 
    () => {
      // Grace Period Check: Ignore silence for first 1.5s
      const timeSinceStart = Date.now() - recordingStartTime.current;
      if (timeSinceStart < 1500) { 
        console.log("Ignoring initial silence (Grace Period)");
        return; 
      }

      console.log("Silence detected. Auto-sending.");
      shouldLoop.current = true; // <--- AUTO = KEEP LOOPING
      stopRecording();
    },
    30,   // Threshold
    2500, // Duration
    orbState === 'listening' // Enabled only when listening
  );

  // 2. BUTTON HANDLER (Manual = NO LOOP)
  const handleToggleInteraction = () => {
    if (orbState === 'thinking') {
      console.log("User clicked during thinking -> Cancelling loop");
      shouldLoop.current = false; 
      return; 
    }

    if (orbState === 'speaking') {
      shouldLoop.current = false;
      
      // Stop Audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis.cancel();

      setOrbState('idle'); 
      setStatusText("Finishing thought...");
      return;
    }

    if (orbState === 'listening') {
      shouldLoop.current = false; // <--- EXPLICITLY DISABLE LOOP
      stopRecording(); 
      return;
    }

    // CASE D: Start Fresh
    shouldLoop.current = true;
    isConversationActive.current = true;
    recordingStartTime.current = Date.now(); // Set Grace Period Start
    startRecording();
    setOrbState('listening'); 
    setStatusText("Listening...");
  };

  // 3. BARGE-IN (Voice Interrupt = LOOP)
  useEffect(() => {
    // Threshold set to 25 based on your testing
    if (orbState === 'speaking' && currentVolume > 25) {
       const timeSpeaking = Date.now() - speechStartTime.current;
       if (timeSpeaking < 500) return; // Prevent instant echo trigger

       console.log("Barge-in detected! Stopping AI.");
       
       // Stop Premium Audio
       if (audioRef.current) {
         audioRef.current.pause();
         audioRef.current = null;
       }
       // Stop Browser Audio
       window.speechSynthesis.cancel();

       shouldLoop.current = true; // <--- INTERRUPT = KEEP LOOPING
       isConversationActive.current = true;
       recordingStartTime.current = Date.now(); // Reset Grace Period
       startRecording();
       setOrbState('listening');
       setStatusText("Listening...");
    }
  }, [currentVolume, orbState, startRecording]);

  const playAudioResponse = async (text: string, voiceId: string) => {
    if (!text || text.trim() === "") {
        console.warn("TTS Error: No text to speak.");
        setOrbState('idle');
        return;
    }

    // 1. CHECK SAFETY SWITCH
    if (!USE_PREMIUM_VOICE) {
        console.log("Dev Mode: Using Browser Voice to save credits.");
        speakWithBrowser(text);
        return;
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("TTS API Error:", errorData);
        throw new Error(errorData.error || "TTS request failed");
      }

      const blob = await response.blob();
      
      if (blob.size < 100) {
        console.error("TTS Error: Audio blob is suspiciously small.");
        setOrbState('idle');
        return;
      }

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audioRef.current = audio; 

      audio.onended = () => {
        if (shouldLoop.current) {
          setOrbState('listening');
          setStatusText("Listening...");
          if (!isRecording) startRecording();
        } else {
          setOrbState('idle');
          setStatusText("Tap mic to resume");
          stopRecording();
        }
      };
      
      audio.onerror = (e) => {
        console.error("Audio Playback Error:", e);
        setOrbState('idle');
      };

      setOrbState('speaking');
      setStatusText("Speaking...");
      speechStartTime.current = Date.now();
      
      await audio.play();

      if (!isRecording) startRecording(); 

    } catch (error) {
      console.warn("Play Audio Failed (Switching to Fallback):", error);
      // Fallback in case Premium fails unexpectedly
      speakWithBrowser(text);
    }
  };

  // 4. API HANDLER
  useEffect(() => {
    if (audioBlob) {
      // Guard: If we manually exited while idle, ignore cleanup blobs
      if (orbState === 'idle') return;

      setOrbState('thinking');
      setStatusText("Thinking...");
      
      sendAudioToVertex(audioBlob, history)
        .then((data) => {
          if (data.mode === 'INTERVIEWER') setStatusText("Interview Mode");
          
          if (data.isCrisis) setShowHelpline(true);
          else setShowHelpline(false);

          addToHistory(data.transcript, data.reply);
          playAudioResponse(data.reply, data.voiceId);
        })
        .catch((err) => {
          console.error("Vertex Error:", err);
          setStatusText("Connection Error");
          setOrbState('idle');
        });
    }
  }, [audioBlob]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-950 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-violet-900/20 via-slate-950 to-slate-950"></div>

        {/* Header */}
        <div className="absolute top-8 z-30 flex flex-col items-center pointer-events-none transition-opacity duration-500">
            <h1 className={`font-serif text-4xl sm:text-5xl lg:text-6xl font-bold bg-linear-to-r from-teal-200 via-cyan-200 to-violet-300 bg-clip-text text-transparent tracking-tight transition-all duration-700 ease-out ${orbState !== 'idle' ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}`}>
            Mood-Mantra
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-400 font-light max-w-md sm:max-w-lg transition-all duration-500">
            {statusText}
            </p>
        </div>

        {/* Orb Container - Faster transition for instant feel */}
        <div className={`relative z-10 w-full h-screen max-h-[600px] mb-32 transition-all duration-300 ease-out ${orbState === 'idle' ? 'opacity-0 scale-90 blur-sm pointer-events-none' : 'opacity-100 scale-100 blur-0'}`}>
            <ParticleOrb state={orbState} />
        </div>

        {/* Button */}
        <div className="absolute bottom-20 z-50">
            <RecordButton 
              isRecording={orbState === 'listening'} 
              onToggle={handleToggleInteraction} 
            />
        </div>

        {/* Helpline */}
        <div className={`absolute bottom-40 z-40 transition-all duration-1000 ease-out transform ${showHelpline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <a href="tel:988" className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 backdrop-blur-md px-6 py-3 rounded-full text-rose-200 text-sm font-medium hover:bg-rose-500/20 transition-colors shadow-lg shadow-rose-900/20">
            <span>❤️</span>
            <span>You matter. Professional help is here.</span>
            </a>
        </div>

        {/* Reset */}
        {history.length > 0 && orbState === 'idle' && (
            <button 
            onClick={(e) => {
                e.stopPropagation();
                clearHistory();
                window.location.reload();
            }}
            className="absolute bottom-8 z-30 text-[10px] text-slate-700 hover:text-red-400 transition-colors uppercase tracking-widest"
            >
            Reset
            </button>
        )}
    </div>
  );
}