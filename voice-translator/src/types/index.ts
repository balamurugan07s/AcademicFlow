export interface Language {
  code: string;         // ISO 639-1 code (e.g., 'en', 'ta', 'hi')
  name: string;         // English display name (e.g., 'Tamil')
  nativeName: string;   // Native script representation (e.g., 'தமிழ்')
  speechLocale: string; // BCP-47 speech recognition locale (e.g., 'ta-IN')
  ttsLocale: string;    // BCP-47 speech synthesis locale (e.g., 'ta-IN')
  flag: string;         // Flag or symbol representation
}

export type SpeechRecognitionState = 'idle' | 'listening' | 'processing' | 'completed' | 'error';

export type TranslationState = 'idle' | 'translating' | 'success' | 'error';

export type AudioPlaybackState = 'idle' | 'playing' | 'paused';

export interface TranslationHistoryItem {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLang: string; // Language code
  targetLang: string; // Language code
  timestamp: number;
}

export interface ConversationMessage {
  id: string;
  speaker: 'speakerA' | 'speakerB';
  sourceLang: string;
  targetLang: string;
  originalText: string;
  translatedText: string;
  timestamp: number;
}

export interface AppError {
  id: string;
  type: 'microphone' | 'recognition' | 'translation' | 'tts' | 'general';
  title: string;
  message: string;
  actionLabel?: string;
  actionType?: 'retry' | 'dismiss' | 'settings';
}

export type AppMode = 'single' | 'conversation';
export type ThemeMode = 'light' | 'dark';
