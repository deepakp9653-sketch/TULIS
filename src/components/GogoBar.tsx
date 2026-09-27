'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Mic,
  MicOff,
  Compass,
  Calendar,
  CloudSun,
  ShieldCheck,
  Send,
  Zap,
} from 'lucide-react';

interface GogoBarProps {
  onOpenGogoPlanner: () => void;
  onOpenAssistantWithMessage?: (message: string) => void;
  tripDestination?: string;
  className?: string;
}

export const GogoBar: React.FC<GogoBarProps> = ({
  onOpenGogoPlanner,
  onOpenAssistantWithMessage,
  tripDestination = 'Goa',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const promptChips = [
    { label: `Plan new trip with Gogo AI`, icon: Compass, action: () => onOpenGogoPlanner() },
    {
      label: `Top spots & weather in ${tripDestination}`,
      icon: CloudSun,
      action: () =>
        onOpenAssistantWithMessage
          ? onOpenAssistantWithMessage(`What are the top recommended spots and weather in ${tripDestination}?`)
          : onOpenGogoPlanner(),
    },
    {
      label: `How much do I owe?`,
      icon: Zap,
      action: () =>
        onOpenAssistantWithMessage
          ? onOpenAssistantWithMessage('How much do I owe right now? Explain my net balance.')
          : onOpenGogoPlanner(),
    },
    {
      label: `Log ₹1,200 group dinner`,
      icon: Sparkles,
      action: () =>
        onOpenAssistantWithMessage
          ? onOpenAssistantWithMessage('Log an expense of ₹1,200 for group dinner paid by me')
          : onOpenGogoPlanner(),
    },
  ];

  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setQuery(`Plan a 4-day weekend trip to ${tripDestination} under ₹40,000`);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setQuery(transcript);
        }
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = query.trim();
    if (!clean) {
      onOpenGogoPlanner();
      return;
    }

    if (onOpenAssistantWithMessage) {
      onOpenAssistantWithMessage(clean);
      setQuery('');
    } else {
      onOpenGogoPlanner();
    }
  };

  return (
    <section
      aria-label="Gogo AI Command Bar"
      className={`relative rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-[#121B15]/95 via-[#18261E]/95 to-[#101712]/95 border border-brand-emerald/30 shadow-2xl backdrop-blur-xl overflow-hidden ${className}`}
    >
      {/* Iridescent Accent Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-3.5">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-emerald/20 border border-brand-emerald/40 flex items-center justify-center text-brand-emerald shadow-inner">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white font-mono tracking-tight">
                  Gogo AI Command Bar
                </h2>
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30">
                  Autonomous Engine
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-mono">
                Ask anything, plan multi-day itineraries, or auto-audit trip balances
              </p>
            </div>
          </div>

          {/* Direct "Plan with Gogo" Launcher Button */}
          <button
            type="button"
            onClick={onOpenGogoPlanner}
            className="px-3.5 py-1.5 rounded-xl bg-brand-emerald text-surface-base hover:bg-emerald-400 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-subtle hover:scale-[1.02] active:scale-[0.98]"
            title="Start Guided 4-Step Gogo Interview"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Launch 4-Step Planner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Input Bar Form */}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Gogo: e.g. 'Plan 4-day Goa trip under ₹40k', 'Log ₹1,800 dinner', 'Who owes who?'"
            className="w-full pl-4 pr-24 py-3 rounded-xl bg-surface-base/80 border border-surface-hairline hover:border-brand-emerald/40 focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20 text-xs sm:text-sm text-ink-primary placeholder:text-ink-muted outline-none transition-all"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleVoiceInput}
              aria-label={isListening ? 'Stop listening' : 'Voice input'}
              title={isListening ? 'Listening... Speak now' : 'Voice query (Speech Recognition)'}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                  : 'text-ink-muted hover:text-brand-emerald hover:bg-surface-raised'
              }`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-rose-400 animate-bounce" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            <button
              type="submit"
              aria-label="Send query to Gogo AI"
              className="p-2 rounded-lg bg-brand-emerald text-surface-base hover:bg-emerald-400 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-[10px] font-mono text-ink-muted uppercase tracking-wider">
            Quick Prompts:
          </span>
          {promptChips.map((chip, idx) => {
            const Icon = chip.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={chip.action}
                className="px-2.5 py-1 rounded-lg bg-surface-base/60 hover:bg-surface-raised border border-surface-hairline hover:border-brand-emerald/40 text-[11px] font-medium text-ink-secondary hover:text-brand-emerald flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Icon className="w-3 h-3 text-brand-emerald shrink-0" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
