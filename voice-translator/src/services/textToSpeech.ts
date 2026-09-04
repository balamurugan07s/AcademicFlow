export interface TTSCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (errorMessage: string) => void;
}

export class TextToSpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isVoicesLoaded = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.synth);
  }

  private loadVoices(): void {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    if (this.voices.length > 0) {
      this.isVoicesLoaded = true;
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.isVoicesLoaded && this.synth) {
      this.loadVoices();
    }
    return this.voices;
  }

  /**
   * Find the most appropriate voice matching a target locale (e.g., 'ta-IN' or 'ta')
   */
  public findBestVoice(locale: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices || voices.length === 0) return null;

    const normalizedLocale = locale.toLowerCase().replace('_', '-');
    const langPrefix = normalizedLocale.split('-')[0];

    // 1. Exact match (e.g., 'ta-IN')
    const exact = voices.find(
      (v) => v.lang.toLowerCase().replace('_', '-') === normalizedLocale
    );
    if (exact) return exact;

    // 2. Language prefix match (e.g. any voice starting with 'ta')
    const prefix = voices.find(
      (v) => v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix)
    );
    if (prefix) return prefix;

    return null;
  }

  public speak(
    text: string,
    locale: string,
    callbacks?: TTSCallbacks
  ): boolean {
    if (!this.isSupported() || !this.synth) {
      callbacks?.onError?.('Text-to-speech is not supported in this browser.');
      return false;
    }

    if (!text || text.trim().length === 0) {
      callbacks?.onError?.('No text provided to speak.');
      return false;
    }

    // Cancel any active speech
    this.stop();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      const voice = this.findBestVoice(locale);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = locale;
      }

      utterance.rate = 0.95; // Natural cadence
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        callbacks?.onStart?.();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        callbacks?.onEnd?.();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        if (event.error === 'canceled' || event.error === 'interrupted') {
          return;
        }
        callbacks?.onError?.(`Speech playback error: ${event.error || 'Playback interrupted'}`);
      };

      this.synth.speak(utterance);
      return true;
    } catch (err: any) {
      callbacks?.onError?.(err?.message || 'Failed to synthesize speech audio.');
      return false;
    }
  }

  public pause(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public stop(): void {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        // Ignored
      }
    }
    this.currentUtterance = null;
  }

  public isSpeaking(): boolean {
    return Boolean(this.synth && this.synth.speaking);
  }

  public getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }
}

export const textToSpeechService = new TextToSpeechService();
