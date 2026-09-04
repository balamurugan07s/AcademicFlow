import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LanguageSelector } from './components/LanguageSelector';
import { MicrophoneButton } from './components/MicrophoneButton';
import { SpeechInputCard } from './components/SpeechInputCard';
import { TranslationPanel } from './components/TranslationPanel';
import { ConversationMode } from './components/ConversationMode';
import { HistoryPanel } from './components/HistoryPanel';
import { ErrorBanner } from './components/ErrorBanner';

import { Language, AppMode, ThemeMode, TranslationHistoryItem, AppError } from './types';
import { DEFAULT_SOURCE_LANGUAGE, DEFAULT_TARGET_LANGUAGE, swapLanguages, getLanguageByCode } from './utils/languages';
import { storage } from './utils/storage';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useTranslation } from './hooks/useTranslation';
import { useTextToSpeech } from './hooks/useTextToSpeech';

export function App() {
  const [mode, setMode] = useState<AppMode>('single');
  const [theme, setTheme] = useState<ThemeMode>(() => storage.getTheme());
  const [sourceLang, setSourceLang] = useState<Language>(() => {
    const saved = storage.getSavedLanguagePair();
    return saved ? getLanguageByCode(saved.sourceCode) : DEFAULT_SOURCE_LANGUAGE;
  });
  const [targetLang, setTargetLang] = useState<Language>(() => {
    const saved = storage.getSavedLanguagePair();
    return saved ? getLanguageByCode(saved.targetCode) : DEFAULT_TARGET_LANGUAGE;
  });

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<TranslationHistoryItem[]>(() => storage.getHistory());
  const [dismissedErrorId, setDismissedErrorId] = useState<string | null>(null);

  // Translation Hook
  const {
    translationState,
    translatedText,
    error: translationError,
    translateText,
    clearTranslation,
  } = useTranslation();

  // Text-To-Speech Hook
  const {
    playbackState,
    speak,
    stop: stopTTS,
    errorMessage: ttsError,
  } = useTextToSpeech();

  // Speech Recognition Hook
  const {
    speechState,
    transcript,
    interimText,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    updateTranscript,
  } = useSpeechRecognition({
    onFinalTranscript: (text) => {
      // Auto-translate on speech capture completion
      if (text.trim().length > 0) {
        translateText(text, sourceLang.code, targetLang.code).then((res) => {
          if (res?.translatedText) {
            setHistoryItems(storage.getHistory());
            // Optional: Auto-speak translation
            speak(res.translatedText, targetLang.ttsLocale);
          }
        });
      }
    },
  });

  // Apply Theme to documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    storage.setTheme(theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Save language changes
  const handleSourceChange = (lang: Language) => {
    setSourceLang(lang);
    storage.setSavedLanguagePair(lang.code, targetLang.code);
  };

  const handleTargetChange = (lang: Language) => {
    setTargetLang(lang);
    storage.setSavedLanguagePair(sourceLang.code, lang.code);
  };

  // Swap Languages: swap languages and swap texts
  const handleSwap = () => {
    const swapped = swapLanguages(sourceLang, targetLang);
    setSourceLang(swapped.source);
    setTargetLang(swapped.target);
    storage.setSavedLanguagePair(swapped.source.code, swapped.target.code);

    if (transcript || translatedText) {
      const oldTranslated = translatedText;
      updateTranscript(oldTranslated);
      if (oldTranslated) {
        translateText(oldTranslated, swapped.source.code, swapped.target.code);
      } else {
        clearTranslation();
      }
    }
  };

  // Manual Translate Trigger
  const handleManualTranslate = () => {
    if (transcript.trim().length > 0) {
      translateText(transcript, sourceLang.code, targetLang.code).then((res) => {
        if (res?.translatedText) {
          setHistoryItems(storage.getHistory());
        }
      });
    }
  };

  // Clear all text
  const handleClearAll = () => {
    resetTranscript();
    clearTranslation();
    stopTTS();
  };

  // Audio Playback
  const handlePlayTTS = () => {
    if (translatedText) {
      speak(translatedText, targetLang.ttsLocale);
    }
  };

  const handleListenSource = () => {
    if (transcript) {
      speak(transcript, sourceLang.ttsLocale);
    }
  };

  // Load from History
  const handleSelectHistoryItem = (item: TranslationHistoryItem) => {
    const src = getLanguageByCode(item.sourceLang);
    const tgt = getLanguageByCode(item.targetLang);
    setSourceLang(src);
    setTargetLang(tgt);
    updateTranscript(item.originalText);
    translateText(item.originalText, src.code, tgt.code);
  };

  // History management
  const handleDeleteHistoryItem = (id: string) => {
    const updated = storage.deleteHistoryItem(id);
    setHistoryItems(updated);
  };

  const handleClearHistory = () => {
    storage.clearHistory();
    setHistoryItems([]);
  };

  // Consolidate Active Error
  const activeError: AppError | null = (() => {
    const err = speechError || translationError;
    if (err && err.id !== dismissedErrorId) {
      return err;
    }
    if (ttsError && ttsError !== dismissedErrorId) {
      return {
        id: 'tts_warning',
        type: 'tts',
        title: 'Voice Synthesizer Notice',
        message: ttsError,
        actionType: 'dismiss',
      };
    }
    return null;
  })();

  const isTranslating = translationState === 'translating';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-925 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Top Navigation */}
      <Navbar
        mode={mode}
        onModeChange={setMode}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        historyCount={historyItems.length}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Error Notification Banner */}
        <ErrorBanner
          error={activeError}
          onDismiss={() => {
            if (activeError) setDismissedErrorId(activeError.id);
          }}
          onRetry={() => {
            if (activeError?.type === 'microphone' || activeError?.type === 'recognition') {
              startListening(sourceLang.speechLocale);
            } else if (activeError?.type === 'translation') {
              handleManualTranslate();
            }
          }}
        />

        {/* Hero Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
            Speak Naturally. <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-indigo-500 to-cyan-500">Translate Instantly.</span>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Real-time speech-to-text, neural translation, and high-fidelity speech synthesis across Indian &amp; Global languages.
          </p>
        </div>

        {/* Mode 1: Single Translator Mode */}
        {mode === 'single' && (
          <div className="space-y-6">
            
            {/* Language Selection Row */}
            <LanguageSelector
              sourceLang={sourceLang}
              targetLang={targetLang}
              onSourceChange={handleSourceChange}
              onTargetChange={handleTargetChange}
              onSwap={handleSwap}
              disabled={speechState === 'listening' || isTranslating}
            />

            {/* Focal Microphone Button */}
            <MicrophoneButton
              state={speechState}
              onStart={() => startListening(sourceLang.speechLocale)}
              onStop={stopListening}
              disabled={isTranslating}
            />

            {/* Cards Grid: Original Speech vs Translation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              
              {/* Left: Original Speech (You said) */}
              <SpeechInputCard
                transcript={transcript}
                interimText={interimText}
                sourceLang={sourceLang}
                onTranscriptChange={updateTranscript}
                onClear={handleClearAll}
                onTranslate={handleManualTranslate}
                isTranslating={isTranslating}
                onListenSource={handleListenSource}
              />

              {/* Right: Translation Panel */}
              <TranslationPanel
                translatedText={translatedText}
                targetLang={targetLang}
                isTranslating={isTranslating}
                playbackState={playbackState}
                onPlayTTS={handlePlayTTS}
                onStopTTS={stopTTS}
                onTranslateAgain={handleManualTranslate}
              />

            </div>

          </div>
        )}

        {/* Mode 2: Two-Way Conversation Mode */}
        {mode === 'conversation' && (
          <ConversationMode
            speakerALang={sourceLang}
            speakerBLang={targetLang}
          />
        )}

      </main>

      {/* History Drawer Modal */}
      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={historyItems}
        onDeleteItem={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
        onReplayAudio={(text, locale) => speak(text, locale)}
        onSelectHistoryItem={handleSelectHistoryItem}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Developed by <span className="font-semibold text-slate-800 dark:text-slate-200">Balamurugan S</span> • SRM Institute of Science and Technology
          </p>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Web Speech API (STT/TTS)
            </span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              React + TypeScript
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
