import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Volume2, Trash2, Loader2, VolumeX } from 'lucide-react';
import { Language, ConversationMessage } from '../types';
import { speechRecognitionService } from '../services/speechRecognition';
import { translationService } from '../services/translation';
import { textToSpeechService } from '../services/textToSpeech';

interface ConversationModeProps {
  speakerALang: Language; // e.g. English
  speakerBLang: Language; // e.g. Tamil
  onBackToSingle?: () => void;
}

export const ConversationMode: React.FC<ConversationModeProps> = ({
  speakerALang,
  speakerBLang,
}) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<'speakerA' | 'speakerB' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveTranscript]);

  const handleStartSpeaking = (speaker: 'speakerA' | 'speakerB') => {
    setErrorMsg(null);
    textToSpeechService.stop();
    setPlayingMessageId(null);

    const sourceLang = speaker === 'speakerA' ? speakerALang : speakerBLang;
    const targetLang = speaker === 'speakerA' ? speakerBLang : speakerALang;

    setActiveSpeaker(speaker);
    setLiveTranscript('');

    speechRecognitionService.start(sourceLang.speechLocale, {
      onStart: () => {
        // Listening started
      },
      onResult: async (text, isFinal) => {
        setLiveTranscript(text);
        if (isFinal && text.trim().length > 0) {
          setIsProcessing(true);
          speechRecognitionService.stop();
          setActiveSpeaker(null);
          setLiveTranscript('');

          try {
            const result = await translationService.translate(
              text,
              sourceLang.code,
              targetLang.code
            );

            const newMsg: ConversationMessage = {
              id: `conv_${Date.now()}`,
              speaker,
              sourceLang: sourceLang.name,
              targetLang: targetLang.name,
              originalText: result.originalText,
              translatedText: result.translatedText,
              timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, newMsg]);

            // Auto-speak translated sentence in target language
            textToSpeechService.speak(result.translatedText, targetLang.ttsLocale, {
              onStart: () => setPlayingMessageId(newMsg.id),
              onEnd: () => setPlayingMessageId(null),
              onError: () => setPlayingMessageId(null),
            });
          } catch (err: any) {
            setErrorMsg(err?.message || 'Translation failed during conversation turn.');
          } finally {
            setIsProcessing(false);
          }
        }
      },
      onError: (err) => {
        setActiveSpeaker(null);
        setLiveTranscript('');
        setErrorMsg(err.message);
      },
      onEnd: () => {
        if (!isProcessing) {
          setActiveSpeaker(null);
        }
      },
    });
  };

  const handleStopSpeaking = () => {
    speechRecognitionService.stop();
    setActiveSpeaker(null);
    setLiveTranscript('');
  };

  const handlePlayAudio = (msg: ConversationMessage) => {
    if (playingMessageId === msg.id) {
      textToSpeechService.stop();
      setPlayingMessageId(null);
      return;
    }

    const targetLocale =
      msg.speaker === 'speakerA' ? speakerBLang.ttsLocale : speakerALang.ttsLocale;

    textToSpeechService.speak(msg.translatedText, targetLocale, {
      onStart: () => setPlayingMessageId(msg.id),
      onEnd: () => setPlayingMessageId(null),
      onError: () => setPlayingMessageId(null),
    });
  };

  const handleClearConversation = () => {
    textToSpeechService.stop();
    speechRecognitionService.stop();
    setMessages([]);
    setPlayingMessageId(null);
    setErrorMsg(null);
  };

  return (
    <div className="flex flex-col h-[650px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/70">
        <div>
          <h2 className="text-sm font-bold font-display text-slate-900 dark:text-white">
            Dual Conversation Mode
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {speakerALang.flag} {speakerALang.name} &nbsp;⇄&nbsp; {speakerBLang.flag} {speakerBLang.name}
          </p>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClearConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="px-4 py-2.5 bg-red-50 dark:bg-red-950/50 border-b border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-700 dark:text-red-300 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Conversation Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 && !liveTranscript && !isProcessing && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Mic className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Start a Conversation
            </h3>
            <p className="text-xs max-w-sm">
              Tap the microphone below for <strong>{speakerALang.name}</strong> or <strong>{speakerBLang.name}</strong>. Each phrase will automatically translate and speak in the other party's language.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isA = msg.speaker === 'speakerA';
          const isPlayingThis = playingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isA ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                  isA
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                    : 'bg-brand-600 text-white rounded-tr-none shadow-brand-500/10'
                }`}
              >
                {/* Speaker Tag */}
                <div className="flex items-center justify-between gap-3 text-[11px] font-mono pb-2 border-b border-black/10 dark:border-white/10 mb-2">
                  <span className="font-semibold">
                    {isA ? `${speakerALang.flag} ${speakerALang.name}` : `${speakerBLang.flag} ${speakerBLang.name}`}
                  </span>
                  <span className="opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Original Text */}
                <p className="text-sm opacity-90 mb-2">
                  "{msg.originalText}"
                </p>

                {/* Translated Text */}
                <div
                  className={`pt-2 border-t ${
                    isA ? 'border-slate-200 dark:border-slate-700' : 'border-white/20'
                  } flex items-center justify-between gap-3`}
                >
                  <p className="text-base font-medium">
                    {msg.translatedText}
                  </p>

                  <button
                    type="button"
                    onClick={() => handlePlayAudio(msg)}
                    className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                      isA
                        ? 'hover:bg-slate-200 dark:hover:bg-slate-700 text-brand-600 dark:text-brand-400'
                        : 'hover:bg-brand-700 text-white'
                    }`}
                    title="Listen to translation"
                    aria-label="Listen to translation"
                  >
                    {isPlayingThis ? (
                      <VolumeX className="w-4 h-4 animate-pulse" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Interim Transcript Bubble */}
        {activeSpeaker && liveTranscript && (
          <div className={`flex flex-col ${activeSpeaker === 'speakerA' ? 'items-start' : 'items-end'}`}>
            <div className="max-w-[80%] rounded-2xl p-4 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 animate-pulse text-brand-900 dark:text-brand-200">
              <span className="text-[10px] font-mono uppercase font-bold text-brand-600 block mb-1">
                Listening to {activeSpeaker === 'speakerA' ? speakerALang.name : speakerBLang.name}...
              </span>
              <p className="text-sm italic">"{liveTranscript}"</p>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center justify-center p-3 text-brand-600 dark:text-brand-400 text-xs font-medium gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Translating conversation turn...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Dual Push-to-Talk Footer Controls */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          
          {/* Speaker A Button */}
          <button
            type="button"
            disabled={activeSpeaker === 'speakerB' || isProcessing}
            onClick={() => {
              if (activeSpeaker === 'speakerA') {
                handleStopSpeaking();
              } else {
                handleStartSpeaking('speakerA');
              }
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 sm:p-4 rounded-xl font-medium text-sm transition-all focus:outline-none focus:ring-2 shadow-sm ${
              activeSpeaker === 'speakerA'
                ? 'bg-red-600 text-white ring-red-500 animate-pulse'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            } disabled:opacity-50`}
          >
            {activeSpeaker === 'speakerA' ? (
              <Square className="w-5 h-5 fill-current" />
            ) : (
              <Mic className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            )}
            <div className="text-center sm:text-left leading-tight">
              <span className="block font-bold">
                {activeSpeaker === 'speakerA' ? 'Stop Speaking' : `Speak ${speakerALang.name}`}
              </span>
              <span className="text-[11px] opacity-70">
                {speakerALang.flag} Translates to {speakerBLang.name}
              </span>
            </div>
          </button>

          {/* Speaker B Button */}
          <button
            type="button"
            disabled={activeSpeaker === 'speakerA' || isProcessing}
            onClick={() => {
              if (activeSpeaker === 'speakerB') {
                handleStopSpeaking();
              } else {
                handleStartSpeaking('speakerB');
              }
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 sm:p-4 rounded-xl font-medium text-sm transition-all focus:outline-none focus:ring-2 shadow-sm ${
              activeSpeaker === 'speakerB'
                ? 'bg-red-600 text-white ring-red-500 animate-pulse'
                : 'bg-brand-600 hover:bg-brand-700 text-white ring-brand-500 shadow-brand-500/20'
            } disabled:opacity-50`}
          >
            {activeSpeaker === 'speakerB' ? (
              <Square className="w-5 h-5 fill-current" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
            <div className="text-center sm:text-left leading-tight">
              <span className="block font-bold">
                {activeSpeaker === 'speakerB' ? 'Stop Speaking' : `Speak ${speakerBLang.name}`}
              </span>
              <span className="text-[11px] opacity-80">
                {speakerBLang.flag} Translates to {speakerALang.name}
              </span>
            </div>
          </button>

        </div>
      </div>

    </div>
  );
};
