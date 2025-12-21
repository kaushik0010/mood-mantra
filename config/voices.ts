// config/voices.ts

export type VoicePersona = {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: 'youth' | 'adult' | 'senior';
  accent: 'indian' | 'american'; // We prioritize Indian for your use case
  style: 'calm' | 'energetic' | 'authoritative';
};

export const VOICE_REGISTRY: VoicePersona[] = [
  // --- INDIAN VOICES (Prioritize finding these IDs) ---
  {
    id: "broqrJkktxd1CclKTudW", 
    name: "Anika",
    gender: "female",
    age: "adult",
    accent: "indian",
    style: "energetic"
  },
  {
    id: "gHu9GtaHOXcSqFTK06ux", 
    name: "Anjali",
    gender: "female",
    age: "adult",
    accent: "indian",
    style: "energetic"
  },
  {
    id: "ALCIIw5qAlLDox8iBl0U", 
    name: "Alisha",
    gender: "female",
    age: "youth",
    accent: "indian",
    style: "calm"
  },
  {
    id: "CpLFIATEbkaZdJr01erZ", 
    name: "Alisha",
    gender: "female",
    age: "senior",
    accent: "indian",
    style: "calm"
  },
  {
    id: "zT03pEAEi0VHKciJODfn", 
    name: "Raju",
    gender: "male",
    age: "youth",
    accent: "indian",
    style: "calm"
  },
  {
    id: "Sxk6njaoa7XLsAFT7WcN", 
    name: "Amit",
    gender: "male",
    age: "adult",
    accent: "indian",
    style: "calm"
  },
  {
    id: "zgqefOY5FPQ3bB7OZTVR", 
    name: "Neeraj",
    gender: "male",
    age: "senior",
    accent: "indian",
    style: "authoritative"
  },
  {
    id: "VbDz3QQGkAGePVWfkfwE", 
    name: "Anant",
    gender: "male",
    age: "adult",
    accent: "indian",
    style: "authoritative"
  },
  
  // --- FALLBACK INTERNATIONAL VOICES ---
  {
    id: "21m00Tcm4TlvDq8ikWAM", // Rachel
    name: "Rachel",
    gender: "female",
    age: "adult",
    accent: "american",
    style: "calm"
  },
  {
    id: "pNInz6obpgDQGcFmaJgB", // Adam
    name: "Adam",
    gender: "male",
    age: "adult",
    accent: "american",
    style: "authoritative"
  },
  {
    id: "AZnzlk1XvdvUeBnXmlld", // Domi
    name: "Domi",
    gender: "female",
    age: "youth",
    accent: "american",
    style: "energetic"
  }
];

// Helper function to find the best match
export function getVoiceId(
  gender: 'male' | 'female', 
  age: 'youth' | 'adult' | 'senior', 
  accent: 'indian' | 'american'
): string {
  
  // 1. Try to find an EXACT match
  const exactMatch = VOICE_REGISTRY.find(v => 
    v.gender === gender && 
    v.age === age && 
    v.accent === accent
  );
  if (exactMatch) return exactMatch.id;

  // 2. If no exact match, relax the "Age" constraint
  const genderAccentMatch = VOICE_REGISTRY.find(v => 
    v.gender === gender && 
    v.accent === accent
  );
  if (genderAccentMatch) return genderAccentMatch.id;

  // 3. Ultimate Fallback (Safety Net)
  return "21m00Tcm4TlvDq8ikWAM"; // Rachel
}