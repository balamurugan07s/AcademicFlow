import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../utils/storage';

// In-memory localStorage mock for node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Storage Utility & LocalStorage Persistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('starts with empty history', () => {
    expect(storage.getHistory()).toEqual([]);
  });

  it('saves and retrieves history item', () => {
    const item = storage.saveHistoryItem({
      originalText: 'Hello world',
      translatedText: 'வணக்கம் உலகம்',
      sourceLang: 'en',
      targetLang: 'ta',
    });

    expect(item.id).toBeTruthy();
    expect(item.timestamp).toBeGreaterThan(0);

    const history = storage.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].originalText).toBe('Hello world');
    expect(history[0].translatedText).toBe('வணக்கம் உலகம்');
  });

  it('deletes history item by id', () => {
    const item1 = storage.saveHistoryItem({
      originalText: 'First',
      translatedText: 'முதல்',
      sourceLang: 'en',
      targetLang: 'ta',
    });

    const item2 = storage.saveHistoryItem({
      originalText: 'Second',
      translatedText: 'இரண்டாவது',
      sourceLang: 'en',
      targetLang: 'ta',
    });

    expect(storage.getHistory().length).toBe(2);

    storage.deleteHistoryItem(item1.id);
    const updated = storage.getHistory();
    expect(updated.length).toBe(1);
    expect(updated[0].id).toBe(item2.id);
  });

  it('clears all history items', () => {
    storage.saveHistoryItem({
      originalText: 'Sample',
      translatedText: 'மாதிரி',
      sourceLang: 'en',
      targetLang: 'ta',
    });

    expect(storage.getHistory().length).toBe(1);
    storage.clearHistory();
    expect(storage.getHistory().length).toBe(0);
  });

  it('persists and restores theme preference', () => {
    storage.setTheme('light');
    expect(storage.getTheme()).toBe('light');

    storage.setTheme('dark');
    expect(storage.getTheme()).toBe('dark');
  });
});
