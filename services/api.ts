// services/api.ts

// 1. Update the Interface to match the new Backend Response
interface ChatResponse {
  reply: string;
  voiceId: string;
  transcript: string;
  mode: 'THERAPIST' | 'INTERVIEWER'; // <--- NEW
  isCrisis: boolean;                 // <--- NEW
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export async function sendAudioToVertex(audioBlob: Blob, history: Message[]): Promise<ChatResponse> {
  const reader = new FileReader();
  
  return new Promise<ChatResponse>((resolve, reject) => {
    reader.readAsDataURL(audioBlob);
    
    reader.onloadend = async () => {
      try {
        const base64Audio = (reader.result as string).split(',')[1];

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            audio: base64Audio,
            history: history 
          }),
        });

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error);
        }

        // 2. Resolve the full object
        resolve({ 
          reply: data.reply, 
          voiceId: data.voiceId,
          transcript: data.transcript,
          mode: data.mode,      // <--- Pass through
          isCrisis: data.isCrisis // <--- Pass through
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
  });
}