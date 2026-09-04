export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  provider: string;
}

export interface ITranslationProvider {
  name: string;
  translate(text: string, sourceLang: string, targetLang: string): Promise<string>;
}

/**
 * HTML Entity decoder for API responses (e.g., &quot; -> ", &#39; -> ')
 */
function decodeHtmlEntities(str: string): string {
  if (typeof document === 'undefined') {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#039;/g, "'");
  }
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

/**
 * Public MyMemory Translation Provider (Zero-config free tier)
 * Docs: https://mymemory.translated.net/doc/spec.php
 */
export class MyMemoryTranslationProvider implements ITranslationProvider {
  public name = 'MyMemory';
  private email = import.meta.env?.VITE_MYMEMORY_EMAIL || '';

  async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    const pair = `${sourceLang.toLowerCase()}|${targetLang.toLowerCase()}`;
    let url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(pair)}`;

    if (this.email) {
      url += `&de=${encodeURIComponent(this.email)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Translation service returned status code ${response.status}`);
    }

    const data = await response.json();

    if (data.responseStatus !== 200 && data.responseStatus !== '200') {
      // 403 or quota exceeded
      const statusMsg = data.responseDetails || 'Translation service limit reached or pair unavailable';
      throw new Error(statusMsg);
    }

    const translated = data?.responseData?.translatedText;
    if (!translated) {
      throw new Error('No translated text received from translation service.');
    }

    return decodeHtmlEntities(translated);
  }
}

/**
 * LibreTranslate Provider (For self-hosted or configured API keys)
 */
export class LibreTranslateProvider implements ITranslationProvider {
  public name = 'LibreTranslate';
  private apiUrl = import.meta.env?.VITE_TRANSLATION_API_URL || 'https://translate.argosopentech.com';
  private apiKey = import.meta.env?.VITE_TRANSLATION_API_KEY || '';

  async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    const response = await fetch(`${this.apiUrl}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text',
        api_key: this.apiKey || undefined,
      }),
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate service error (${response.status})`);
    }

    const data = await response.json();
    return data.translatedText || '';
  }
}

/**
 * Translation Service Orchestrator with memory cache
 */
export class TranslationService {
  private provider: ITranslationProvider;
  private cache = new Map<string, string>();

  constructor() {
    const providerType = import.meta.env?.VITE_TRANSLATION_PROVIDER;
    if (providerType === 'libretranslate') {
      this.provider = new LibreTranslateProvider();
    } else {
      this.provider = new MyMemoryTranslationProvider();
    }
  }

  public setProvider(provider: ITranslationProvider): void {
    this.provider = provider;
    this.cache.clear();
  }

  public getProviderName(): string {
    return this.provider.name;
  }

  public async translate(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult> {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        originalText: text,
        translatedText: '',
        sourceLang,
        targetLang,
        provider: this.provider.name,
      };
    }

    // Direct return if source and target are identical
    if (sourceLang.toLowerCase() === targetLang.toLowerCase()) {
      return {
        originalText: trimmed,
        translatedText: trimmed,
        sourceLang,
        targetLang,
        provider: 'Identity',
      };
    }

    const cacheKey = `${sourceLang}:${targetLang}:${trimmed}`;
    if (this.cache.has(cacheKey)) {
      return {
        originalText: trimmed,
        translatedText: this.cache.get(cacheKey)!,
        sourceLang,
        targetLang,
        provider: `${this.provider.name} (Cached)`,
      };
    }

    try {
      const translated = await this.provider.translate(trimmed, sourceLang, targetLang);
      this.cache.set(cacheKey, translated);

      return {
        originalText: trimmed,
        translatedText: translated,
        sourceLang,
        targetLang,
        provider: this.provider.name,
      };
    } catch (err: any) {
      console.error('TranslationService error:', err);
      throw new Error(
        err?.message || 'Translation request failed. Please check your internet connection and try again.'
      );
    }
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

export const translationService = new TranslationService();
