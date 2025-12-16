import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, language } = await req.json();

    // 1. Choose the Voice ID
    // "Rachel" is a popular calm voice. You can change this ID later.
    // 21m00Tcm4TlvDq8ikWAM (Rachel)
    const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; 

    // 2. Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY || "",
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2", // The "Babel Fish" model (Speaks Hindi & English)
          voice_settings: {
            stability: 0.5, // Lower = More emotion/expressive
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("ElevenLabs API Failed");
    }

    // 3. Get the Audio Buffer
    const audioBuffer = await response.arrayBuffer();

    // 4. Return Audio to Frontend
    return new Response(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });

  } catch (error: any) {
    console.error("TTS Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}