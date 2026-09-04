import React, { useState } from 'react';
import { Copy, Check, Trash2, Edit3, ArrowRight, Volume2 } from 'lucide-react';
import { Language } from '../types';

interface SpeechInputCardProps {
  transcript: string;
  interimText: string;
  sourceLang: Language;
  onTranscriptChange: (text: string) => void;
  onClear: () => void;
  onTranslate: () => void;
  isTranslating: boolean;
  onListenSource?: () => void;
}

export const SpeechInputCard: React.FC<SpeechInputCardProps> = ({
  transcript,
  interimText,
  sourceLang,
  onTranscriptChange,
  onClear,
  onTranslate,
  isTranslating,
  onListenSource,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const displayText = transcript || interimText;
  const hasContent = displayText.trim().length > 0;

  const handleCopy = async () => {
    if (!displayText) return;
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{sourceLang.flag}</span>
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Original Speech ({sourceLang.name})
            </h3>
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
              You Said
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {hasContent && onListenSource && (
            <button
              type="button"
              onClick={onListenSource}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Listen to original speech"
              aria-label="Listen to original speech"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}

          {hasContent && (
            <>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Copy recognized text"
                aria-label="Copy text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isEditing
                    ? 'text-brand-600 bg-brand-50 dark:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isEditing ? 'Done editing' : 'Edit text'}
                aria-label="Edit text"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClear}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                title="Clear text"
                aria-label="Clear text"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Text Area / View */}
      <div className="flex-1 min-h-[140px] flex flex-col justify-start">
        {isEditing ? (
          <textarea
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            placeholder={`Type or speak something in ${sourceLang.name}...`}
            className="w-full h-full min-h-[120px] bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 text-base leading-relaxed"
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="w-full h-full flex flex-col cursor-text rounded-xl p-2 hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors"
            title="Click to edit or type text"
          >
            {hasContent ? (
              <p className="text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-relaxed font-normal whitespace-pre-wrap break-words">
                {transcript}
                {interimText && (
                  <span className="text-slate-400 dark:text-slate-500 italic">
                    {' '}{interimText}...
                  </span>
                )}
              </p>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                <p className="text-sm">
                  Click the microphone above and speak, or click here to type manually in {sourceLang.name}.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer with Translate Action */}
      {hasContent && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-2">
          <span className="text-[11px] font-mono text-slate-400">
            {displayText.length} characters
          </span>

          <button
            type="button"
            onClick={onTranslate}
            disabled={isTranslating || !hasContent}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
          >
            <span>{isTranslating ? 'Translating...' : 'Translate'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
