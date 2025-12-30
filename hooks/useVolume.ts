// hooks/useVolume.ts
import { useState, useEffect } from 'react';

export function useVolume(stream: MediaStream | null) {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (!stream || !stream.active) {
      setVolume(0);
      return;
    }

    let audioContext: AudioContext | null = null;
    let animationId: number;
    let source: MediaStreamAudioSourceNode | null = null;

    const setupAudio = async () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        audioContext = new AudioContext();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.5;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          setVolume(sum / dataArray.length);
          animationId = requestAnimationFrame(checkVolume);
        };
        checkVolume();
      } catch (error) {
        console.error("Volume hook error:", error);
      }
    };

    setupAudio();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      try {
        source?.disconnect();
        if (audioContext && audioContext.state !== 'closed') audioContext.close();
      } catch (e) {}
    };
  }, [stream]);

  return volume;
}