import { useState, useEffect } from 'react';

type Message = {
  role: 'user' | 'model';
  text: string;
};

export function useConversationHistory() {
  const [history, setHistory] = useState<Message[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Load from LocalStorage on startup
  useEffect(() => {
    const saved = localStorage.getItem('mood_mantra_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // 2. Save to LocalStorage whenever history changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('mood_mantra_history', JSON.stringify(history));
    }
  }, [history, isLoaded]);

  // 3. Helper to add a new interaction
  const addToHistory = (userText: string, aiText: string) => {
    setHistory(prev => {
      // Keep only the last 10 turns to save tokens/space
      const newHistory = [
        ...prev,
        { role: 'user' as const, text: userText },
        { role: 'model' as const, text: aiText }
      ];
      return newHistory.slice(-20); // Keep last 20 messages
    });
  };

  // 4. Helper to clear memory (for a "New Session" button)
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('mood_mantra_history');
  };

  return { history, addToHistory, clearHistory };
}