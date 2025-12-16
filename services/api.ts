// Add ': Promise<string>' here 👇
export async function sendAudioToVertex(audioBlob: Blob): Promise<string> {
  const reader = new FileReader();
  
  // Add '<string>' generic to the Promise constructor 👇
  return new Promise<string>((resolve, reject) => {
    reader.readAsDataURL(audioBlob);
    
    reader.onloadend = async () => {
      try {
        const base64Audio = (reader.result as string).split(',')[1];

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            audio: base64Audio,
            mimeType: 'audio/webm' 
          }),
        });

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error);
        }

        // TypeScript now knows this must be a string
        resolve(data.reply);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
  });
}