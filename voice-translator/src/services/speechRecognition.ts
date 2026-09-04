import { AppError } from '../types';

export interface SpeechRecognitionCallbacks {
  onStart: () => void;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: AppError) => void;
  onEnd: () => void;
}

// Declare Web Speech API types for TypeScript
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private currentLocale = 'en-US';

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as IWindow;
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  public start(locale: string, callbacks: SpeechRecognitionCallbacks): boolean {
    if (!this.isSupported()) {
      callbacks.onError({
        id: 'speech_unsupported',
        type: 'recognition',
        title: 'Browser Unsupported',
        message: 'Speech Recognition is not supported by your current browser. Please try Chrome, Edge, or Safari.',
        actionType: 'dismiss',
      });
      return false;
    }

    // Abort any existing instance
    this.stop();

    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    try {
      this.recognition = new SpeechRecognitionClass();
      this.currentLocale = locale;
      this.recognition.lang = locale;
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        callbacks.onStart();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const transcript = finalTranscript || interimTranscript;
        const isFinal = Boolean(finalTranscript);
        callbacks.onResult(transcript, isFinal);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        const normalizedError = this.normalizeError(event.error);
        // Ignore aborted error if user clicked stop
        if (event.error === 'aborted') {
          return;
        }
        callbacks.onError(normalizedError);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        callbacks.onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      this.isListening = false;
      callbacks.onError({
        id: 'recognition_init_error',
        type: 'recognition',
        title: 'Initialization Failed',
        message: err?.message || 'Unable to start speech recognition. Please try again.',
        actionType: 'retry',
      });
      return false;
    }
  }

  public stop(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // Ignored
      }
      this.recognition = null;
    }
    this.isListening = false;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  private normalizeError(errorCode: string): AppError {
    switch (errorCode) {
      case 'not-allowed':
      case 'service-not-allowed':
        return {
          id: 'mic_permission_denied',
          type: 'microphone',
          title: 'Microphone Permission Denied',
          message: 'Access to your microphone was blocked. Please click the camera/microphone icon in your browser address bar to allow permissions, then try again.',
          actionType: 'retry',
          actionLabel: 'Retry Permission',
        };
      case 'no-speech':
        return {
          id: 'no_speech_detected',
          type: 'recognition',
          title: 'No Speech Detected',
          message: 'We could not hear any speech. Please check your microphone connection and speak closer to the mic.',
          actionType: 'retry',
          actionLabel: 'Try Again',
        };
      case 'network':
        return {
          id: 'recognition_network_error',
          type: 'recognition',
          title: 'Speech Network Error',
          message: 'The speech recognition service experienced a network disruption. Please check your internet connection and try again.',
          actionType: 'retry',
          actionLabel: 'Retry',
        };
      case 'audio-capture':
        return {
          id: 'audio_capture_error',
          type: 'microphone',
          title: 'Microphone Unavailable',
          message: 'No microphone was detected on your system. Please plug in an audio input device.',
          actionType: 'dismiss',
        };
      case 'language-not-supported':
        return {
          id: 'speech_lang_unsupported',
          type: 'recognition',
          title: 'Locale Not Supported',
          message: `Your browser does not support voice recognition for the locale '${this.currentLocale}'. You can still type text directly into the input card.`,
          actionType: 'dismiss',
        };
      default:
        return {
          id: 'speech_unknown_error',
          type: 'recognition',
          title: 'Speech Recognition Error',
          message: `Speech recognition encountered an issue (${errorCode}). Please try again.`,
          actionType: 'retry',
          actionLabel: 'Retry',
        };
    }
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
