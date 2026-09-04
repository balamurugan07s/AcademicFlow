import { useState, useCallback, useEffect } from 'react';
import { AudioPlaybackState } from '../types';
import { textToSpeechService } from '../services/textToSpeech';

export function useTextToSpeech() {
  const [playbackState, setPlaybackState] = useState<AudioPlaybackState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSupported = textToSpeechService.isSupported();

  const speak = useCallback((text: string, locale: string) => {
    setErrorMessage(null);
    if (!text || text.trim().length === 0) return;

    textToSpeechService.speak(text, locale, {
      onStart: () => {
        setPlaybackState('playing');
      },
      onEnd: () => {
        setPlaybackState('idle');
      },
      onError: (err) => {
        setPlaybackState('idle');
        setErrorMessage(err);
      },
    });
  }, []);

  const pause = useCallback(() => {
    textToSpeechService.pause();
    setPlaybackState('paused');
  }, []);

  const resume = useCallback(() => {
    textToSpeechService.resume();
    setPlaybackState('playing');
  }, []);

  const stop = useCallback(() => {
    textToSpeechService.stop();
    setPlaybackState('idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      textToSpeechService.stop();
    };
  }, []);

  return {
    playbackState,
    errorMessage,
    isSupported,
    speak,
    pause,
    resume,
    stop,
  };
}
