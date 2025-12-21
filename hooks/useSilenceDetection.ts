import { useEffect, useRef } from 'react';

export function useSilenceDetection(
  stream: MediaStream | null, 
  onSilence: () => void, 
  minDecibels = -50, // Sensitivity threshold
  silenceDuration = 2500 // Wait 2.5s before stopping
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!stream) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;

    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let animationFrameId: number;

    const checkVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;

      // Logic: If volume > 10 (approx), user is speaking.
      if (average > 10) { 
        // User is speaking -> Clear the silence timer
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } else {
        // User is silent -> Start timer if not already running
        if (!timeoutRef.current) {
          timeoutRef.current = setTimeout(() => {
            onSilence(); // Trigger Auto-Stop
          }, silenceDuration);
        }
      }
      
      animationFrameId = requestAnimationFrame(checkVolume);
    };

    checkVolume();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (audioContext.state !== 'closed') audioContext.close();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [stream, onSilence, silenceDuration]);
}