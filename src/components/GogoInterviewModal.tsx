'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
  Calendar,
  Users,
  Wallet,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface Question {
  step: number;
  key: string;
  title: string;
  subtitle: string;
  placeholder: string;
  presets: string[];
}

interface GogoInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated: (plan: any) => void;
  currentUserId?: string;
}

export const GogoInterviewModal: React.FC<GogoInterviewModalProps> = ({
  isOpen,
  onClose,
  onPlanGenerated,
  currentUserId,
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [question, setQuestion] = useState<Question | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = 'en-IN';

        recog.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInputValue(transcript);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        recog.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          setIsListening(false);
        };

        recognitionRef.current = recog;
      }
    }
  }, []);

  // Start interview when modal opens
  useEffect(() => {
    if (isOpen) {
      startInterview();
    } else {
      // Reset state
      setSessionId(null);
      setCurrentStep(1);
      setQuestion(null);
      setInputValue('');
      setAnswers({});
      setIsGenerating(false);
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    }
  }, [isOpen]);

  const startInterview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gogo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start-interview', userId: currentUserId }),
      });
      const data = await res.json();
      if (data.success) {
        setSessionId(data.sessionId);
        setCurrentStep(data.currentStep);
        setQuestion(data.question);
        setInputValue('');
      }
    } catch (err) {
      console.error('Failed to start Gogo interview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Cannot start recognition:', err);
      }
    }
  };

  const handlePresetClick = (preset: string) => {
    setInputValue(preset);
  };

  const handleSubmitStep = async (valueToSubmit?: string) => {
    const finalVal = (valueToSubmit !== undefined ? valueToSubmit : inputValue).trim();
    if (!finalVal || !question || !sessionId) return;

    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const isLastStep = currentStep === 4;
    if (isLastStep) {
      setIsGenerating(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await fetch('/api/gogo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'answer',
          sessionId,
          step: currentStep,
          key: question.key,
          answer: finalVal,
          previousAnswers: answers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAnswers(data.updatedAnswers || { ...answers, [question.key]: finalVal });

        if (data.isComplete && data.generatedPlan) {
          setIsGenerating(false);
          onPlanGenerated(data.generatedPlan);
          onClose();
        } else {
          setCurrentStep(data.currentStep);
          setQuestion(data.question);
          setInputValue('');
        }
      }
    } catch (err) {
      console.error('Failed to submit Gogo answer:', err);
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  const stepIcons = [Compass, Calendar, Users, Wallet];
  const StepIcon = stepIcons[currentStep - 1] || Sparkles;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#182218] via-[#121712] to-[#0A0D0A] border border-[#3A4E39]/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 text-stone-100 overflow-hidden">
        {/* Glow ambient circle */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#283526]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 text-white">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">Gogo Travel Architect</h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-400 border border-emerald-700/40">
                  AI Conversational
                </span>
              </div>
              <p className="text-xs text-stone-400">Autonomous itinerary generation & budget drafting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-stone-400">
            <span>
              STEP {currentStep} OF 4:{' '}
              <strong className="text-emerald-400 uppercase">{question?.key || 'PLANNING'}</strong>
            </span>
            <span>{Math.round((currentStep / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full h-1.5 bg-[#202B1F] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content Area */}
        {isGenerating ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center animate-ping absolute inset-0" />
              <div className="w-20 h-20 rounded-full bg-[#1A251A] border-2 border-emerald-500/50 flex items-center justify-center relative shadow-xl shadow-emerald-900/50">
                <Sparkles className="w-9 h-9 text-emerald-400 animate-spin" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Synthesizing Itinerary & Costs...</h3>
              <p className="text-xs text-stone-400 max-w-sm">
                Gogo is querying destination heuristics, accommodations, experiences, and allocating the budget.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400/80 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-800/30">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Optimizing via Groq llama-3.3-70b-versatile</span>
            </div>
          </div>
        ) : isLoading && !question ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-sm text-stone-400">Warming up Gogo session...</p>
          </div>
        ) : question ? (
          <div className="mt-6 space-y-5">
            {/* Question Card */}
            <div className="p-4 rounded-2xl bg-[#141B14] border border-[#2B3B2A] flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800/40 text-emerald-400 shrink-0">
                <StepIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white leading-snug">{question.title}</h3>
                <p className="text-xs text-stone-400">{question.subtitle}</p>
              </div>
            </div>

            {/* Presets Pills */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">Quick Suggestions:</div>
              <div className="flex flex-wrap gap-2">
                {question.presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all text-left ${
                      inputValue === preset
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/60 font-medium'
                        : 'bg-[#182017] hover:bg-[#202B1F] text-stone-300 border-[#2A3829] hover:border-emerald-700/50'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Input + Voice Recognition */}
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmitStep();
                }}
                placeholder={question.placeholder}
                className="w-full bg-[#111711] border border-[#2B3B29] rounded-2xl py-3.5 pl-4 pr-12 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 transition-all"
                disabled={isLoading}
                autoFocus
              />

              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleSpeech}
                  title={isListening ? 'Stop listening' : 'Speak your answer'}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                      : 'text-stone-400 hover:text-emerald-400 hover:bg-[#1E291D]'
                  }`}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
              )}
            </div>

            {isListening && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 px-3 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Listening to your voice... Speak naturally.
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#232F22]">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-stone-400 hover:text-stone-200 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSubmitStep()}
                disabled={!inputValue.trim() || isLoading}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold shadow-lg transition-all ${
                  inputValue.trim() && !isLoading
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/60 scale-100'
                    : 'bg-[#212C20] text-stone-500 cursor-not-allowed border border-[#2C3A2B]'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : currentStep === 4 ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Complete Itinerary</span>
                  </>
                ) : (
                  <>
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
