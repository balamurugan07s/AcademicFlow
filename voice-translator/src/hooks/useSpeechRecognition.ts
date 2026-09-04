import { useState, useCallback, useEffect, useRef } from 'react';
import { SpeechRecognitionState, AppError } from '../types';
import { speechRecognitionService } from '../services/speechRecognition';

interface UseSpeechRecognitionOptions {
  onFinalTranscript?: (transcript: string) => void;
  onError?: (error: AppError) => void;
}

export function useSpeechRecognition(options?: UseSpeechRecognitionOptions) {
  const [speechState, setSpeechState] = useState<SpeechRecognitionState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<AppError | null>(null);

  const isSupported = speechRecognitionService.isSupported();
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const startListening = useCallback((locale: string) => {
    setError(null);
    setInterimText('');

    const started = speechRecognitionService.start(locale, {
      onStart: () => {
        setSpeechState('listening');
      },
      onResult: (text, isFinal) => {
        if (isFinal) {
          setSpeechState('processing');
          setTranscript(text);
          setInterimText('');
          optionsRef.current?.onFinalTranscript?.(text);
          // Transition to completed after processing
          setTimeout(() => {
            setSpeechState('completed');
          }, 300);
        } else {
          setInterimText(text);
        }
      },
      onError: (err) => {
        setSpeechState('error');
        setError(err);
        optionsRef.current?.onError?.(err);
      },
      onEnd: () => {
        setSpeechState((prev) => (prev === 'listening' ? 'idle' : prev));
      },
    });

    if (!started) {
      setSpeechState('error');
    }
  }, []);

  const stopListening = useCallback(() => {
    speechRecognitionService.stop();
    setSpeechState((prev) => (prev === 'listening' ? 'idle' : prev));
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimText('');
    setSpeechState('idle');
    setError(null);
  }, []);

  const updateTranscript = useCallback((newText: string) => {
    setTranscript(newText);
    setSpeechState(newText.trim().length > 0 ? 'completed' : 'idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechRecognitionService.stop();
    };
  }, []);

  return {
    speechState,
    transcript,
    interimText,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    updateTranscript,
  };
}
