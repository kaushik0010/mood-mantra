import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, voiceId } = await req.json(); // <--- Now accepting voiceId

    // Default to Rachel if no ID provided
    const FINAL_VOICE_ID = voiceId || "21m00Tcm4TlvDq8ikWAM"; 

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${FINAL_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY || "",
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

    if (!response.ok) throw new Error("ElevenLabs API Failed");

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, { headers: { 'Content-Type': 'audio/mpeg' } });

  } catch (error: any) {
    console.error("TTS Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}