import React from 'react';
import { Mic, Square, Loader2, CheckCircle2 } from 'lucide-react';
import { SpeechRecognitionState } from '../types';

interface MicrophoneButtonProps {
  state: SpeechRecognitionState;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  state,
  onStart,
  onStop,
  disabled = false,
}) => {
  const isListening = state === 'listening';
  const isProcessing = state === 'processing';
  const isCompleted = state === 'completed';

  const handleClick = () => {
    if (disabled) return;
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center my-6">
      <div className="relative flex items-center justify-center">
        
        {/* Pulsing Ripple Effect when actively listening */}
        {isListening && (
          <>
            <div className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-red-500/25 animate-ping pointer-events-none" />
            <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-red-500/35 animate-pulse pointer-events-none" />
          </>
        )}

        {/* Big Focal Microphone Button */}
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || isProcessing}
          aria-label={isListening ? 'Stop Listening' : 'Start Speaking'}
          className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 focus:outline-none focus:ring-4 ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white ring-red-500/50 shadow-red-500/30'
              : isProcessing
              ? 'bg-amber-500 text-white ring-amber-400/50 cursor-wait'
              : isCompleted
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-emerald-500/50 shadow-emerald-500/25'
              : 'bg-brand-600 hover:bg-brand-700 hover:scale-105 text-white ring-brand-500/40 shadow-brand-600/30'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? (
            <Square className="w-8 h-8 sm:w-9 sm:h-9 fill-current" />
          ) : isProcessing ? (
            <Loader2 className="w-8 h-8 sm:w-9 sm:h-9 animate-spin" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
          ) : (
            <Mic className="w-9 h-9 sm:w-10 sm:h-10" />
          )}
        </button>
      </div>

      {/* Dynamic Status Text & Waveform Bars */}
      <div className="mt-4 flex flex-col items-center">
        {isListening ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 h-6">
              <span className="w-1 bg-red-500 rounded-full animate-wave-bar-1" />
              <span className="w-1 bg-red-500 rounded-full animate-wave-bar-2" />
              <span className="w-1 bg-red-500 rounded-full animate-wave-bar-3" />
              <span className="w-1 bg-red-500 rounded-full animate-wave-bar-4" />
              <span className="w-1 bg-red-500 rounded-full animate-wave-bar-5" />
            </div>
            <span className="text-sm font-semibold text-red-600 dark:text-red-400 font-mono tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Listening... Click to stop
            </span>
          </div>
        ) : isProcessing ? (
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing speech...
          </span>
        ) : isCompleted ? (
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Speech captured! Tap to speak again
          </span>
        ) : (
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Click microphone to start speaking
          </span>
        )}
      </div>
    </div>
  );
};
