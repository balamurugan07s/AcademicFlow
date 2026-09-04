import { Language } from '../types';

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    speechLocale: 'en-US',
    ttsLocale: 'en-US',
    flag: '🇺🇸',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    speechLocale: 'ta-IN',
    ttsLocale: 'ta-IN',
    flag: '🇮🇳',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechLocale: 'hi-IN',
    ttsLocale: 'hi-IN',
    flag: '🇮🇳',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    speechLocale: 'te-IN',
    ttsLocale: 'te-IN',
    flag: '🇮🇳',
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    speechLocale: 'ml-IN',
    ttsLocale: 'ml-IN',
    flag: '🇮🇳',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    speechLocale: 'kn-IN',
    ttsLocale: 'kn-IN',
    flag: '🇮🇳',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    speechLocale: 'bn-IN',
    ttsLocale: 'bn-IN',
    flag: '🇮🇳',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    speechLocale: 'mr-IN',
    ttsLocale: 'mr-IN',
    flag: '🇮🇳',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    speechLocale: 'fr-FR',
    ttsLocale: 'fr-FR',
    flag: '🇫🇷',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    speechLocale: 'es-ES',
    ttsLocale: 'es-ES',
    flag: '🇪🇸',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    speechLocale: 'de-DE',
    ttsLocale: 'de-DE',
    flag: '🇩🇪',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    speechLocale: 'ja-JP',
    ttsLocale: 'ja-JP',
    flag: '🇯🇵',
  },
  {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    speechLocale: 'zh-CN',
    ttsLocale: 'zh-CN',
    flag: '🇨🇳',
  },
];

export const DEFAULT_SOURCE_LANGUAGE: Language = SUPPORTED_LANGUAGES[0]; // English
export const DEFAULT_TARGET_LANGUAGE: Language = SUPPORTED_LANGUAGES[1]; // Tamil

export function getLanguageByCode(code: string): Language {
  const found = SUPPORTED_LANGUAGES.find((lang) => lang.code.toLowerCase() === code.toLowerCase());
  return found || DEFAULT_SOURCE_LANGUAGE;
}

export function isValidLanguageCode(code: string): boolean {
  return SUPPORTED_LANGUAGES.some((lang) => lang.code.toLowerCase() === code.toLowerCase());
}

export function swapLanguages(
  source: Language,
  target: Language
): { source: Language; target: Language } {
  return {
    source: target,
    target: source,
  };
}
