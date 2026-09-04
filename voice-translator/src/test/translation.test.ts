import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TranslationService, ITranslationProvider } from '../services/translation';

describe('Translation Service & Architecture', () => {
  let service: TranslationService;
  let mockProvider: ITranslationProvider;

  beforeEach(() => {
    service = new TranslationService();
    mockProvider = {
      name: 'MockEngine',
      translate: vi.fn(async (text: string, _source: string, target: string) => {
        return `[${target}] ${text}`;
      }),
    };
    service.setProvider(mockProvider);
  });

  it('returns empty string for empty input without calling provider', async () => {
    const result = await service.translate('', 'en', 'ta');
    expect(result.translatedText).toBe('');
    expect(mockProvider.translate).not.toHaveBeenCalled();
  });

  it('returns original text directly when source and target language are identical', async () => {
    const result = await service.translate('Hello world', 'en', 'en');
    expect(result.translatedText).toBe('Hello world');
    expect(result.provider).toBe('Identity');
    expect(mockProvider.translate).not.toHaveBeenCalled();
  });

  it('calls translation provider for different languages', async () => {
    const result = await service.translate('Good morning', 'en', 'ta');
    expect(result.originalText).toBe('Good morning');
    expect(result.translatedText).toBe('[ta] Good morning');
    expect(mockProvider.translate).toHaveBeenCalledTimes(1);
    expect(mockProvider.translate).toHaveBeenCalledWith('Good morning', 'en', 'ta');
  });

  it('caches identical translation queries to avoid redundant API hits', async () => {
    const first = await service.translate('Repeat phrase', 'en', 'ta');
    const second = await service.translate('Repeat phrase', 'en', 'ta');

    expect(first.translatedText).toBe('[ta] Repeat phrase');
    expect(second.translatedText).toBe('[ta] Repeat phrase');
    expect(second.provider).toContain('Cached');
    // Called only once because second query is retrieved from memory cache
    expect(mockProvider.translate).toHaveBeenCalledTimes(1);
  });

  it('handles provider translation errors gracefully', async () => {
    const failingProvider: ITranslationProvider = {
      name: 'FailingEngine',
      translate: vi.fn(async () => {
        throw new Error('Network timeout during translation');
      }),
    };

    service.setProvider(failingProvider);

    await expect(service.translate('Hello', 'en', 'ta')).rejects.toThrow(
      'Network timeout during translation'
    );
  });
});
