// app/api/tts/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, voiceId } = await req.json();

    // 1. Validate Input immediately
    if (!text || text.trim().length === 0) {
      console.error("TTS Error: Text is empty");
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      console.error("TTS Error: Missing API Key");
      return NextResponse.json({ error: "Server misconfigured: Missing API Key" }, { status: 500 });
    }

    // Default to Rachel if no ID provided
    const FINAL_VOICE_ID = voiceId || "21m00Tcm4TlvDq8ikWAM"; 

    console.log(`TTS Request: Generating audio for voice ${FINAL_VOICE_ID}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${FINAL_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2", 
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    // 2. DETAILED ERROR LOGGING
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown Error" }));
      console.error("ElevenLabs API Error:", response.status, errorData);
      
      // Pass the specific error back to the frontend
      return NextResponse.json(
        { error: `ElevenLabs Error: ${errorData.detail?.message || JSON.stringify(errorData)}` }, 
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, { headers: { 'Content-Type': 'audio/mpeg' } });

  } catch (error: any) {
    console.error("TTS Route Exception:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}