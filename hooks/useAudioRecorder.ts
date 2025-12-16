import { useState, useRef } from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      // 1. Request Microphone Access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 2. Setup Recorder
      // We use 'audio/webm' because it is standard for web browsers.
      // Vertex AI accepts WebM directly.
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = []; // Reset chunks

      // 3. Listen for data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // 4. Handle Stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        
        // Stop all tracks to release microphone (turn off red light)
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioBlob(null); // Clear previous recording

    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access denied. Please enable permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return { isRecording, startRecording, stopRecording, audioBlob };
}