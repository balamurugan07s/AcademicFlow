import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Language } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/languages';

interface LanguageSelectorProps {
  sourceLang: Language;
  targetLang: Language;
  onSourceChange: (lang: Language) => void;
  onTargetChange: (lang: Language) => void;
  onSwap: () => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  onSwap,
  disabled = false,
}) => {
  const [isSwapping, setIsSwapping] = useState(false);

  const handleSwapClick = () => {
    if (disabled) return;
    setIsSwapping(true);
    onSwap();
    setTimeout(() => setIsSwapping(false), 300);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Source Language (From) */}
        <div className="w-full sm:flex-1">
          <label
            htmlFor="source-language-select"
            className="block text-xs font-mono font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
          >
            Translate From
          </label>
          <div className="relative">
            <select
              id="source-language-select"
              value={sourceLang.code}
              onChange={(e) => {
                const selected = SUPPORTED_LANGUAGES.find((l) => l.code === e.target.value);
                if (selected) onSourceChange(selected);
              }}
              disabled={disabled}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed pr-10"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={`src_${lang.code}`} value={lang.code}>
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400">
              <span className="text-xs font-mono">▼</span>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex items-center justify-center pt-2 sm:pt-5">
          <button
            type="button"
            onClick={handleSwapClick}
            disabled={disabled}
            className={`p-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-700 dark:hover:text-brand-300 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm disabled:opacity-50 ${
              isSwapping ? 'rotate-180 scale-95' : 'hover:scale-105'
            }`}
            title="Swap Source and Target Languages"
            aria-label="Swap Languages"
          >
            <ArrowLeftRight className="w-4 h-4 transition-transform duration-300" />
          </button>
        </div>

        {/* Target Language (To) */}
        <div className="w-full sm:flex-1">
          <label
            htmlFor="target-language-select"
            className="block text-xs font-mono font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
          >
            Translate To
          </label>
          <div className="relative">
            <select
              id="target-language-select"
              value={targetLang.code}
              onChange={(e) => {
                const selected = SUPPORTED_LANGUAGES.find((l) => l.code === e.target.value);
                if (selected) onTargetChange(selected);
              }}
              disabled={disabled}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed pr-10"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={`tgt_${lang.code}`} value={lang.code}>
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400">
              <span className="text-xs font-mono">▼</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
