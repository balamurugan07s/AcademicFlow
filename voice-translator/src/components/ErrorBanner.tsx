import React from 'react';
import { AlertCircle, MicOff, WifiOff, X, RefreshCw } from 'lucide-react';
import { AppError } from '../types';

interface ErrorBannerProps {
  error: AppError | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  error,
  onDismiss,
  onRetry,
}) => {
  if (!error) return null;

  const getIcon = () => {
    switch (error.type) {
      case 'microphone':
        return <MicOff className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />;
      case 'recognition':
      case 'translation':
        return <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />;
    }
  };

  const isWarning = error.id === 'no_speech_detected';

  return (
    <div
      className={`w-full p-4 rounded-2xl border transition-all mb-6 flex items-start justify-between gap-3 shadow-sm ${
        isWarning
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
      }`}
      role="alert"
    >
      <div className="flex items-start gap-3 flex-1">
        <div className="mt-0.5">{getIcon()}</div>
        <div>
          <h4 className="text-sm font-bold tracking-tight">
            {error.title}
          </h4>
          <p className="text-xs sm:text-sm mt-0.5 opacity-90 leading-relaxed">
            {error.message}
          </p>

          {error.actionType === 'retry' && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-900 dark:text-white shadow-sm transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{error.actionLabel || 'Try Again'}</span>
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss error"
      >
        <X className="w-4 h-4 opacity-70 hover:opacity-100" />
      </button>
    </div>
  );
};
