# Mood-Mantra 🏵️

> **"Don't just type. Speak. Feel understood."**

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![AI Model](https://img.shields.io/badge/Model-Gemini%202.5%20Flash-blue)](https://deepmind.google/technologies/gemini/)
[![Voice](https://img.shields.io/badge/TTS-ElevenLabs-white)](https://elevenlabs.io/)
[![PWA](https://img.shields.io/badge/PWA-Installable-purple)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

## 📖 Overview

**Mood-Mantra** is a voice-first, empathetic AI companion designed to bridge the gap between "wellness apps" and "clinical therapy."

Unlike traditional chatbots that require tedious typing, Mood-Mantra offers a **Full-Duplex Voice Interface**. It listens, understands, and responds in real-time with a human-like emotional tone. It features **Voice Barge-In** technology, allowing users to interrupt the AI naturally—just like talking to a real friend.

Built for the "Next Billion Users," it supports vernacular context (Hindi/Marathi) and acts as a safe space for users to vent, practice interviews, or simply find calm.

## ✨ Key Features

### 🗣️ Immersive Voice Engine
* **Real-Time Barge-In:** Users can interrupt the AI mid-sentence. The system uses advanced **Acoustic Echo Cancellation (AEC)** and volume thresholding to distinguish between the AI's own voice and the user's interruption.
* **Silence Detection:** A "Hands-Free" loop that detects when you've finished speaking and automatically responds, creating a natural conversational flow.
* **Human-Like TTS:** Powered by ElevenLabs, the voice modulates tone based on the emotional context of the conversation.

### 🧠 Adaptive AI Persona (Gemini 2.5)
* **Therapist Mode (Default):** Warm, validating, and focused on "holding space" for the user.
* **Interviewer Mode:** Switches to a professional, strict persona for mock interview practice (triggered by user intent).
* **Crisis Protocol:** Silently detects keywords related to self-harm or extreme distress. It triggers a "Safe Mode," activating a subtle helpline UI while maintaining a compassionate verbal anchor.

### 📱 PWA & Privacy First
* **Installable App:** Fully functional Progressive Web App (PWA) that looks and feels native on iOS and Android.
* **Visual Privacy:** The UI features an abstract "Holographic Orb" rather than text logs, ensuring that prying eyes cannot read your private history over your shoulder.

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16, React | App structure and PWA configuration. |
| **Styling** | Tailwind CSS | Dark-mode focused, calming aesthetic. |
| **Visuals** | Canvas API / React Three Fiber | The reactive "Particle Orb" visualization. |
| **Audio Processing** | Web Audio API | Handling raw streams, volume analysis, and echo cancellation. |
| **AI Brain** | Google Vertex AI (Gemini 2.5) | Context awareness, intent classification, and empathy engine. |
| **Voice Synthesis** | ElevenLabs API | High-fidelity, emotionally resonant text-to-speech. |

## 🚀 Getting Started

### Prerequisites
* Node.js 18+
* A Google Cloud Project with Vertex AI enabled.
* An ElevenLabs API Key.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/kaushik0010/mood-mantra.git
    cd mood-mantra
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory:
    ```env
    # Google Cloud Vertex AI
    GOOGLE_APPLICATION_CREDENTIALS="./service-account.json"
    GCP_PROJECT_ID=your-project-id
    GCP_LOCATION=us-central1
    
    # ElevenLabs TTS
    ELEVENLABS_API_KEY=your-api-key-here
    ```

4.  **Run the Development Server:**
    ```bash
    pnpm dev
    ```

5.  **Open locally:**
    Visit `http://localhost:3000` in your browser.

## 🎧 Usage Guide (Best Experience)

1.  **Wear Headphones:** * *Why?* For the **Barge-In** feature to work perfectly, headphones prevent the microphone from physically hearing the speaker output. This creates the most immersive "Zero Latency" feel.
2.  **Tap the Mic:** Click the center button to start the session.
3.  **Just Speak:** Say "Hello" or "I'm feeling a bit overwhelmed."
4.  **Interrupt Anytime:** If you want to change the topic while the AI is talking, just speak over it. The AI will stop and listen immediately.
5.  **Install the App:** Open your mobile browser menu and select "Add to Home Screen" for the full app experience.

## 🛡️ Crisis Safety Architecture

Mood-Mantra is designed with safety rails. The prompt engineering includes a **Directive Prime** that forbids toxic positivity in crisis scenarios.

* **Trigger:** User mentions "suicide", "end it all", "harm myself".
* **Response:** The AI shifts to a grounding, protective tone.
* **UI Change:** A silent `is_crisis` flag is sent to the frontend, revealing a discreet "Professional Help" button without breaking the conversational flow.

## 🤝 Contributing

This project is open-source and we welcome contributions!
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Made with ❤️ for Mental Wellness
</p>