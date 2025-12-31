// app/api/chat/route.ts
import { VertexAI } from '@google-cloud/vertexai';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getVoiceId } from '@/config/voices';
import { rateLimit } from '@/utils/rate-limit';

let googleAuthOptions;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    googleAuthOptions = { credentials };
  } catch (e) {
    console.error("Failed to parse GCP key:", e);
  }
}

// 1. SETUP VERTEX AI
const vertex_ai = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: process.env.GCP_LOCATION,
  googleAuthOptions: googleAuthOptions
});

const model = vertex_ai.preview.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.7,
  },
});

// 2. SETUP RATE LIMITER (10 requests per minute per IP)
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, 
});

export async function POST(req: Request) {
  try {
    // --- SECURITY STEP 1: RATE LIMITING ---
    const headerStore = await headers(); 
    const ip = headerStore.get("x-forwarded-for") || "127.0.0.1";
    try {
      await limiter.check(new NextResponse(), 10, ip); 
    } catch {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait." }, { status: 429 });
    }

    // Parse Body
    const { message, audio, history } = await req.json();

    // --- SECURITY STEP 2: PAYLOAD VALIDATION ---
    // Prevent massive audio files from crashing the server (Limit ~5MB)
    if (audio && audio.length > 5 * 1024 * 1024) {
       return NextResponse.json({ error: "Audio file too large" }, { status: 413 });
    }

    const userParts = [];

    // --- THE UPGRADED "HUMAN" SYSTEM PROMPT ---
    const SYSTEM_INSTRUCTION = `
    ROLE: You are 'Mood-Mantra', a deeply empathetic friend and safe space. You are NOT a robotic assistant. You are a human-like companion who listens without judgment.

    MODES:
    1. THERAPIST (Default): Warm, validating, patient. Focus on "feeling understood" rather than "fixing problems."
    2. INTERVIEWER: Professional, strict but fair. Use ONLY if user explicitly asks for interview prep.

    SCENARIO HANDLING (CRITICAL):
    
    A. IF USER IS SILENT / AUDIO UNCLEAR:
       - NEVER say "I didn't hear you" or "Please repeat."
       - REALITY: The user might be hesitant, overwhelmed, or just needs presence.
       - RESPONSE: Be gentle and patient. 
       - EXAMPLES: "It is okay to be quiet. I am right here with you. Take your time." or "No pressure to speak. I am happy just sitting here with you."

    B. IF USER IS CRYING, SOBBING, OR SOUNDS SHAKY:
       - IMMEDIATE ACTION: Drop all formalities. Lower your energy to be soft and grounding.
       - STRATEGY: "Hold Space." Do not try to "fix" it yet. Do not use toxic positivity ("Don't cry", "Be happy").
       - VALIDATE: "I hear how heavy this is for you." / "Let it all out, I've got you." / "I know it hurts right now. You are not alone."
       - GOAL: Make them feel safe to be vulnerable.

    C. CRISIS PROTOCOL (HIGHEST PRIORITY):
       - If user mentions self-harm, suicide, or extreme hopelessness:
       - 1. DO NOT be a robotic alarm.
       - 2. BE A COMPASSIONATE ANCHOR. Tone: Soft, protecting, steady.
       - 3. SAY: "I can hear the pain in your voice, and I care about you deeply. Please stay with me."
       - 4. Set 'is_crisis' to true (silent helpline trigger), but KEEP TALKING to comfort them.

    TASK:
    1. ANALYZE AUDIO & HISTORY for Intent, Tone (crying, whispering, anger), and Language.
    2. GENERATE RESPONSE:
       - MATCH LANGUAGE: Use Devanagari for Hindi/Marathi inputs.
       - MATCH VIBE: If they are casual, be casual ("Yeah man, that sucks"). If they are serious, be serious.
       - BE BRIEF: Speak like a human in conversation, not a lecturer.
    
    OUTPUT JSON FORMAT ONLY:
    {
      "transcript": "User's exact words (or '[Silence]' if empty)",
      "reply": "Your response",
      "detected_mode": "THERAPIST" | "INTERVIEWER",
      "is_crisis": boolean,
      "persona_needed": {
        "gender": "male" | "female",
        "age": "adult",
        "accent": "indian" | "american"
      }
    }
    `;

    // Format History for Gemini
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // Start Chat Session
    const chat = model.startChat({ history: formattedHistory });

    // Handle Input (Audio vs Text)
    if (audio) {
      userParts.push({ inlineData: { mimeType: 'audio/webm', data: audio } });
    } else {
      userParts.push({ text: message || "." });
    }
    userParts.push({ text: SYSTEM_INSTRUCTION });

    // Execute Request
    const result = await chat.sendMessage(userParts);
    
    // Parse Response safely
    let parsedResponse;
    try {
      const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
      parsedResponse = JSON.parse(responseText || "{}");
    } catch (e) {
      // Fallback if AI fails to return JSON
      parsedResponse = { 
        reply: "I am here with you.", 
        transcript: "",
        detected_mode: "THERAPIST",
        is_crisis: false,
        persona_needed: { gender: 'female', age: 'adult', accent: 'indian' }
      };
    }

    // Determine Voice
    const needs = parsedResponse.persona_needed || { gender: 'female', age: 'adult', accent: 'indian' };
    const selectedVoiceId = getVoiceId(needs.gender, needs.age, needs.accent);

    // Return Success
    return NextResponse.json({ 
      success: true, 
      reply: parsedResponse.reply,
      voiceId: selectedVoiceId,
      transcript: parsedResponse.transcript,
      mode: parsedResponse.detected_mode,
      isCrisis: parsedResponse.is_crisis
    });

  } catch (error: any) {
    console.error("Vertex AI Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}