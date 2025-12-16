import { VertexAI } from '@google-cloud/vertexai';
import { NextResponse } from 'next/server';

const vertex_ai = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: process.env.GCP_LOCATION,
});

const model = vertex_ai.preview.getGenerativeModel({
  model: 'gemini-2.5-flash', // Flash supports Audio!
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Check if we received Audio or Text
    const userParts = [];
    
    if (body.audio) {
      // CASE 1: Audio Input
      userParts.push({
        inlineData: {
          mimeType: body.mimeType || 'audio/webm',
          data: body.audio
        }
      });
      // Add a System Prompt to guide the Audio analysis
      userParts.push({
        text: "System: You are Mood-Mantra. Listen to the user's voice. Detect their emotion. Reply in the same language they spoke. Be brief and supportive."
      });
    } else {
      // CASE 2: Text Input (Fallback)
      userParts.push({ text: body.message || "Hello" });
    }

    // Start Generation
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: userParts }]
    });

    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ success: true, reply: responseText });

  } catch (error: any) {
    console.error("Vertex AI Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}