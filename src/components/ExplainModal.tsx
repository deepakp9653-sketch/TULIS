'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  X,
  Sparkles,
  Calculator,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Wallet,
} from 'lucide-react';
import { LedgerValueExplanation } from '@/lib/ledger-engine';

interface ExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: LedgerValueExplanation | null;
  tripTitle?: string;
}

export const ExplainModal: React.FC<ExplainModalProps> = ({
  isOpen,
  onClose,
  explanation,
  tripTitle = 'Trip',
}) => {
  const [aiText, setAiText] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  useEffect(() => {
    if (!isOpen || !explanation) {
      setAiText(null);
      return;
    }

    setAiText(explanation.summary);

    // Call /api/ai/explain for enhanced narrative
    setIsLoadingAi(true);
    fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valueType: explanation.valueType,
        referenceId: explanation.referenceId,
        headlineValue: explanation.headlineValue,
        contextData: {
          title: explanation.title,
          mathBreakdown: explanation.mathBreakdown,
        },
        tripTitle,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.explanation) {
          setAiText(data.explanation);
        }
      })
      .catch((err) => {
        console.warn('Explain AI error:', err);
      })
      .finally(() => {
        setIsLoadingAi(false);
      });
  }, [isOpen, explanation, tripTitle]);

  if (!isOpen || !explanation) return null;

  const typeIcons = {
    balance: Wallet,
    settlement: ArrowRight,
    anomaly: AlertTriangle,
    variance: TrendingUp,
    booking_cost: Calendar,
  };

  const IconComponent = typeIcons[explanation.valueType] || Calculator;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-gradient-to-b from-[#182419] via-[#121A12] to-[#0D120D] border-2 border-[#2F442D] rounded-3xl shadow-2xl text-[#F4F2E6] flex flex-col overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-[#5FA97D]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#263725] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5FA97D]/20 border border-[#5FA97D]/40 text-[#5FA97D] flex items-center justify-center shadow-lg">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-serif-display text-white">
                  {explanation.title}
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#5FA97D]/15 text-[#5FA97D] border border-[#5FA97D]/30">
                  {explanation.valueType}
                </span>
              </div>
              <p className="text-[11px] text-[#8B9A8C]">
                Deterministic mathematical breakdown & event lineage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#8B9A8C] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close explanation modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Headline Value Card */}
          <div className="p-4 rounded-2xl bg-[#0F160F] border border-[#233522] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8B9A8C] font-mono block">
                Target Figure
              </span>
              <span className="text-3xl font-black font-mono text-[#5FA97D]">
                {explanation.headlineValue}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#5FA97D]/15 border border-[#5FA97D]/30 text-xs text-[#5FA97D] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Sum Verified</span>
            </div>
          </div>

          {/* AI Narrative Box */}
          <div className="p-4 rounded-2xl bg-[#1B291B]/60 border border-[#2F442D] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#5FA97D] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explain AI Narrative</span>
              </span>
              {isLoadingAi && (
                <span className="text-[10px] font-mono text-[#E0B84C] animate-pulse">
                  Analyzing ledger events...
                </span>
              )}
            </div>
            <p className="text-xs text-[#F4F2E6] leading-relaxed">
              {aiText || explanation.summary}
            </p>
          </div>

          {/* Mathematical Step-by-Step Breakdown */}
          {explanation.mathBreakdown && explanation.mathBreakdown.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B9A8C] font-mono flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-[#5FA97D]" />
                <span>Mathematical Lineage</span>
              </span>

              <div className="space-y-2">
                {explanation.mathBreakdown.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0F160F] border border-white/5 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white block">{step.step}</span>
                      <p className="text-[11px] text-[#8B9A8C] mt-0.5">{step.detail}</p>
                    </div>
                    {step.formattedAmount && (
                      <span className="font-mono font-bold text-sm text-[#5FA97D] shrink-0">
                        {step.formattedAmount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contributing Events Table / List */}
          {explanation.contributingEvents && explanation.contributingEvents.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B9A8C] font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#5FA97D]" />
                <span>Contributing Events ({explanation.contributingEvents.length})</span>
              </span>

              <div className="space-y-1.5">
                {explanation.contributingEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2.5 rounded-xl bg-[#0F160F]/60 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="truncate">
                      <span className="font-medium text-[#F4F2E6] block truncate">{ev.label}</span>
                      {ev.actor && (
                        <span className="text-[10px] text-[#8B9A8C] block truncate">{ev.actor}</span>
                      )}
                    </div>
                    {ev.amount !== undefined && (
                      <span className="font-mono text-xs font-semibold text-white ml-2 shrink-0">
                        ₹{ev.amount.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#263725] bg-[#0E140E] flex items-center justify-between text-xs text-[#8B9A8C]">
          <span>Grounded in immutable events table</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#5FA97D] hover:bg-[#4E9A6E] text-[#0E120D] font-bold transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
export default ExplainModal;
