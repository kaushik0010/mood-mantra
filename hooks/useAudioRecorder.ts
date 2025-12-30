import { useState, useRef, useCallback } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      // PRO AUDIO CONSTRAINTS
      // This tells the browser: "We are doing a call, turn on the Echo Canceller"
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,      // <--- THE KEY FIX
          noiseSuppression: true,      // Removes background fan noise
          autoGainControl: true,       // Normalizes volume
          sampleRate: 16000,           // Standard for Speech-to-Text
        } 
      });

      setStream(stream);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus' 
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        // Important: Keep the stream open if we want to support "Barge-in" 
        // monitoring without requesting permission again.
        // But for "Stop and Send" logic, standard cleanup is usually fine.
      };

      mediaRecorder.start();
      setIsRecording(true);

    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access denied. Please allow it to use the app.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // OPTIONAL: Don't kill the stream immediately if you want smooth restarting
      // But for now, let's keep it clean.
      // stream?.getTracks().forEach(track => track.stop()); 
      // setStream(null); 
    }
  }, []);

  return { isRecording, startRecording, stopRecording, audioBlob, stream };
}