import { useEffect, useRef } from 'react';

export function useSilenceDetection(
  currentVolume: number,
  onSilence: () => void,
  silenceThreshold = 30,
  silenceDuration = 2500,
  isEnabled = false
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // cleanup on unmount only
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    // 1. If logic is disabled, clear everything and stop.
    if (!isEnabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // 2. User is SPEAKING (Volume High) -> RESET Timer
    if (currentVolume > silenceThreshold) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } 
    // 3. User is SILENT (Volume Low) -> START Timer (if not already running)
    else {
      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          onSilence();
          timeoutRef.current = null; // Clean up ref after firing
        }, silenceDuration);
      }
    }
    
    // CRITICAL FIX: No cleanup function here. 
    // We want the timer to persist across volume updates as long as it's quiet.
  }, [currentVolume, silenceThreshold, silenceDuration, onSilence, isEnabled]);
}