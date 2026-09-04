import { TranslationHistoryItem, ThemeMode } from '../types';

const STORAGE_KEYS = {
  HISTORY: 'vt_translation_history',
  THEME: 'vt_app_theme',
  LANG_PAIR: 'vt_language_pair',
};

const MAX_HISTORY_ITEMS = 40;

export const storage = {
  // Translation History
  getHistory(): TranslationHistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse translation history from storage:', e);
      return [];
    }
  },

  saveHistoryItem(item: Omit<TranslationHistoryItem, 'id' | 'timestamp'>): TranslationHistoryItem {
    const history = this.getHistory();
    const newItem: TranslationHistoryItem = {
      ...item,
      id: `vt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };

    // Avoid duplicate immediate entries
    const isDuplicate = history.length > 0 && 
      history[0].originalText.trim().toLowerCase() === newItem.originalText.trim().toLowerCase() &&
      history[0].targetLang === newItem.targetLang;

    if (isDuplicate) {
      return history[0];
    }

    const updated = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to write translation history item to storage:', e);
    }
    return newItem;
  },

  deleteHistoryItem(id: string): TranslationHistoryItem[] {
    const history = this.getHistory();
    const updated = history.filter((item) => item.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete history item from storage:', e);
    }
    return updated;
  },

  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch (e) {
      console.error('Failed to clear translation history from storage:', e);
    }
  },

  // Theme
  getTheme(): ThemeMode {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode | null;
      if (saved === 'dark' || saved === 'light') return saved;
      // Check system preference
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      console.error('Failed to read theme preference:', e);
    }
    return 'dark';
  },

  setTheme(theme: ThemeMode): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.error('Failed to save theme preference:', e);
    }
  },

  // Language Preferences
  getSavedLanguagePair(): { sourceCode: string; targetCode: string } | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LANG_PAIR);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read saved language pair:', e);
    }
    return null;
  },

  setSavedLanguagePair(sourceCode: string, targetCode: string): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.LANG_PAIR,
        JSON.stringify({ sourceCode, targetCode })
      );
    } catch (e) {
      console.error('Failed to save language pair:', e);
    }
  },
};
