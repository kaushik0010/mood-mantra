import { VertexAI } from '@google-cloud/vertexai';
import { NextResponse } from 'next/server';
import { getVoiceId } from '@/config/voices';

const vertex_ai = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: process.env.GCP_LOCATION,
});

const model = vertex_ai.preview.getGenerativeModel({
  model: 'gemini-2.5-flash', // Switched to 1.5 Flash for better instruction following
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.7,
  },
});

export async function POST(req: Request) {
  try {
    const { message, audio, history } = await req.json();
    const userParts = [];

    const SYSTEM_INSTRUCTION = `
    ROLE: You are 'Mood-Mantra', an advanced AI that can switch between TWO modes based on user intent.

    MODES:
    1. THERAPIST (Default): Empathetic, warm, listens to feelings. Use this if user talks about emotions, life, stress, or sadness.
    2. INTERVIEWER: Professional, strict but fair. Use this ONLY if user explicitly asks for "Interview Prep", "Mock Interview", or mentions "Job Application practice".

    CRISIS PROTOCOL (HIGHEST PRIORITY):
    - If user mentions suicide, self-harm, or extreme danger:
      1. Set 'is_crisis' to true.
      2. Reply SHORTLY and URGENTLY providing help.
      3. Do NOT act like a fun friend. Be a serious guardian.

    TASK:
    1. ANALYZE AUDIO & HISTORY to detect current Intent (Therapy vs Interview).
    2. DETECT LANGUAGE (Hindi/Marathi/English).
    3. GENERATE RESPONSE:
       - If Therapist: Be comforting.
       - If Interviewer: Ask a relevant technical or behavioral question.
    
    OUTPUT JSON FORMAT ONLY:
    {
      "transcript": "User's exact words",
      "reply": "Your response (in Devanagari if Hindi/Marathi)",
      "detected_mode": "THERAPIST" | "INTERVIEWER",
      "is_crisis": boolean,
      "persona_needed": {
        "gender": "male" | "female",
        "age": "adult",
        "accent": "indian" | "american"
      }
    }
    `;

    // History Formatting
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({ history: formattedHistory });

    if (audio) {
      userParts.push({ inlineData: { mimeType: 'audio/webm', data: audio } });
    } else {
      userParts.push({ text: message || "." });
    }
    userParts.push({ text: SYSTEM_INSTRUCTION });

    const result = await chat.sendMessage(userParts);
    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText || "{}");
    } catch (e) {
      parsedResponse = { 
        reply: "I am having trouble understanding. Could you speak again?", 
        transcript: "",
        detected_mode: "THERAPIST",
        is_crisis: false,
        persona_needed: { gender: 'female', age: 'adult', accent: 'indian' }
      };
    }

    // Dynamic Voice Selection
    // If it's an Interview, maybe force a specific 'Professional' voice?
    // For now, we stick to the smart registry.
    const needs = parsedResponse.persona_needed || { gender: 'female', age: 'adult', accent: 'indian' };
    const selectedVoiceId = getVoiceId(needs.gender, needs.age, needs.accent);

    return NextResponse.json({ 
      success: true, 
      reply: parsedResponse.reply,
      voiceId: selectedVoiceId,
      transcript: parsedResponse.transcript,
      mode: parsedResponse.detected_mode, // Sending mode back to UI
      isCrisis: parsedResponse.is_crisis    // Sending crisis flag back
    });

  } catch (error: any) {
    console.error("Vertex AI Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}