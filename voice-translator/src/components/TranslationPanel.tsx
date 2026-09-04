import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, RotateCcw, Loader2 } from 'lucide-react';
import { Language, AudioPlaybackState } from '../types';

interface TranslationPanelProps {
  translatedText: string;
  targetLang: Language;
  isTranslating: boolean;
  playbackState: AudioPlaybackState;
  onPlayTTS: () => void;
  onStopTTS: () => void;
  onTranslateAgain: () => void;
  providerName?: string;
}

export const TranslationPanel: React.FC<TranslationPanelProps> = ({
  translatedText,
  targetLang,
  isTranslating,
  playbackState,
  onPlayTTS,
  onStopTTS,
  onTranslateAgain,
  providerName = 'MyMemory Engine',
}) => {
  const [copied, setCopied] = useState(false);
  const isPlaying = playbackState === 'playing';
  const hasContent = translatedText.trim().length > 0;

  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy translated text:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{targetLang.flag}</span>
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Translation ({targetLang.name})
            </h3>
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
              {targetLang.nativeName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {hasContent && (
            <>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Copy translated text"
                aria-label="Copy translated text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={onTranslateAgain}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Translate Again"
                aria-label="Translate Again"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Text Area / Result */}
      <div className="flex-1 min-h-[140px] flex flex-col justify-start">
        {isTranslating ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-brand-600 dark:text-brand-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm font-medium">Translating into {targetLang.name}...</p>
          </div>
        ) : hasContent ? (
          <div className="w-full h-full p-2">
            <p className="text-lg sm:text-xl font-medium text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap break-words">
              {translatedText}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
            <p className="text-sm">
              Your translated speech will appear here in {targetLang.name} ({targetLang.nativeName}).
            </p>
          </div>
        )}
      </div>

      {/* Card Footer with Audio Playback Controls */}
      {hasContent && !isTranslating && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-2">
          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            {providerName}
          </span>

          <div className="flex items-center gap-2">
            {isPlaying ? (
              <button
                type="button"
                onClick={onStopTTS}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-200 text-xs sm:text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Stop audio playback"
              >
                <VolumeX className="w-4 h-4" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onPlayTTS}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-brand-500/20"
                aria-label="Listen to translation"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
