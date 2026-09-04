import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_LANGUAGES,
  getLanguageByCode,
  isValidLanguageCode,
  swapLanguages,
  DEFAULT_SOURCE_LANGUAGE,
  DEFAULT_TARGET_LANGUAGE,
} from '../utils/languages';

describe('Languages Configuration & Utilities', () => {
  it('contains all 13 required languages', () => {
    expect(SUPPORTED_LANGUAGES.length).toBe(13);
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain('en');
    expect(codes).toContain('ta');
    expect(codes).toContain('hi');
    expect(codes).toContain('te');
    expect(codes).toContain('ml');
    expect(codes).toContain('kn');
    expect(codes).toContain('bn');
    expect(codes).toContain('mr');
    expect(codes).toContain('fr');
    expect(codes).toContain('es');
    expect(codes).toContain('de');
    expect(codes).toContain('ja');
    expect(codes).toContain('zh');
  });

  it('provides valid speechLocale and ttsLocale for each language', () => {
    SUPPORTED_LANGUAGES.forEach((lang) => {
      expect(lang.speechLocale).toBeTruthy();
      expect(lang.ttsLocale).toBeTruthy();
      expect(lang.nativeName).toBeTruthy();
      expect(lang.flag).toBeTruthy();
    });
  });

  it('correctly retrieves language by code', () => {
    const tamil = getLanguageByCode('ta');
    expect(tamil.name).toBe('Tamil');
    expect(tamil.speechLocale).toBe('ta-IN');

    const hindi = getLanguageByCode('hi');
    expect(hindi.name).toBe('Hindi');
    expect(hindi.speechLocale).toBe('hi-IN');
  });

  it('falls back to default language for unknown code', () => {
    const fallback = getLanguageByCode('unknown-code');
    expect(fallback.code).toBe(DEFAULT_SOURCE_LANGUAGE.code);
  });

  it('validates language codes correctly', () => {
    expect(isValidLanguageCode('ta')).toBe(true);
    expect(isValidLanguageCode('en')).toBe(true);
    expect(isValidLanguageCode('xyz')).toBe(false);
  });

  it('swaps source and target languages properly', () => {
    const swapped = swapLanguages(DEFAULT_SOURCE_LANGUAGE, DEFAULT_TARGET_LANGUAGE);
    expect(swapped.source.code).toBe(DEFAULT_TARGET_LANGUAGE.code);
    expect(swapped.target.code).toBe(DEFAULT_SOURCE_LANGUAGE.code);
  });
});
