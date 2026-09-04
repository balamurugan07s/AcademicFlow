import { useState, useCallback } from 'react';
import { TranslationState, AppError } from '../types';
import { translationService, TranslationResult } from '../services/translation';
import { storage } from '../utils/storage';

export function useTranslation() {
  const [translationState, setTranslationState] = useState<TranslationState>('idle');
  const [translatedText, setTranslatedText] = useState('');
  const [activeResult, setActiveResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<AppError | null>(null);

  const translateText = useCallback(
    async (
      text: string,
      sourceLangCode: string,
      targetLangCode: string,
      saveToHistory = true
    ) => {
      const trimmed = text.trim();
      if (!trimmed) {
        setTranslatedText('');
        setTranslationState('idle');
        return;
      }

      setTranslationState('translating');
      setError(null);

      try {
        const result = await translationService.translate(
          trimmed,
          sourceLangCode,
          targetLangCode
        );

        setTranslatedText(result.translatedText);
        setActiveResult(result);
        setTranslationState('success');

        if (saveToHistory && result.translatedText) {
          storage.saveHistoryItem({
            originalText: result.originalText,
            translatedText: result.translatedText,
            sourceLang: sourceLangCode,
            targetLang: targetLangCode,
          });
        }

        return result;
      } catch (err: any) {
        setTranslationState('error');
        const appError: AppError = {
          id: 'translation_failed',
          type: 'translation',
          title: 'Translation Failed',
          message:
            err?.message ||
            'Unable to translate the text. Please verify your internet connection and try again.',
          actionType: 'retry',
          actionLabel: 'Retry Translation',
        };
        setError(appError);
        return null;
      }
    },
    []
  );

  const clearTranslation = useCallback(() => {
    setTranslatedText('');
    setActiveResult(null);
    setTranslationState('idle');
    setError(null);
  }, []);

  return {
    translationState,
    translatedText,
    activeResult,
    error,
    translateText,
    clearTranslation,
  };
}
