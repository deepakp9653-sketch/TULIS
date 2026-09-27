'use client';

import React, { useState, useEffect } from 'react';
import {
  Scale,
  Shield,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  ArrowRight,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DisputeMediatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseTitle: string;
  amount: number;
  claimantName: string;
  opponentName: string;
  claimantReason: string;
  opponentReason?: string;
  onApplyResolution?: (resolutionText: string) => void;
}

export const DisputeMediatorModal: React.FC<DisputeMediatorModalProps> = ({
  isOpen,
  onClose,
  expenseTitle,
  amount,
  claimantName,
  opponentName,
  claimantReason,
  opponentReason = 'Activity was booked in advance for the entire confirmed squad roster.',
  onApplyResolution,
}) => {
  const [mediation, setMediation] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appliedOptionIndex, setAppliedOptionIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMediation();
    }
  }, [isOpen, expenseTitle]);

  const fetchMediation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mediate-dispute',
          expenseTitle,
          amount,
          claimantName,
          opponentName,
          claimantReason,
          opponentReason,
        }),
      });

      const data = await res.json();
      if (data.success && data.mediation) {
        setMediation(data.mediation);
      }
    } catch (err) {
      console.error('Mediation fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (idx: number, opt: any) => {
    setAppliedOptionIndex(idx);
    if (onApplyResolution) {
      onApplyResolution(`${opt.title}: ${opt.formula}`);
    }
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0C110E] border border-[#213025] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col my-8"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#213025] flex items-center justify-between bg-[#111A14]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  AI Neutral Dispute Mediator
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/40 font-semibold">
                  F6.3
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Symmetric, non-judgmental synthesis grounded in trip ledger principles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-[#18251C] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 flex-1">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
              <p className="text-xs text-stone-400 font-mono">
                Generating objective mediator synthesis...
              </p>
            </div>
          ) : mediation ? (
            <div className="space-y-4">
              {/* Conflict Summary */}
              <div className="p-3.5 rounded-xl bg-[#141E17] border border-[#26372B]">
                <span className="text-[10px] font-mono uppercase text-stone-400 block mb-1">
                  Dispute Context: {expenseTitle} (₹{amount.toLocaleString()})
                </span>
                <p className="text-xs text-stone-200 font-medium">{mediation.summary}</p>
              </div>

              {/* Symmetric Perspectives */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#131B15] border border-[#243527] space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 block">
                    {claimantName}&apos;s Perspective
                  </span>
                  <p className="text-[11px] text-stone-300 leading-snug">
                    {mediation.perspectiveA}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#131B15] border border-[#243527] space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-teal-400 block">
                    {opponentName}&apos;s Perspective
                  </span>
                  <p className="text-[11px] text-stone-300 leading-snug">
                    {mediation.perspectiveB}
                  </p>
                </div>
              </div>

              {/* Compromise Formulas */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                  Recommended Balanced Compromises
                </span>

                <div className="space-y-2">
                  {(mediation.compromiseOptions || []).map((opt: any, idx: number) => {
                    const isApplied = appliedOptionIndex === idx;
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                          isApplied
                            ? 'bg-emerald-950/60 border-emerald-500'
                            : 'bg-[#141E17] border-[#26372B] hover:border-emerald-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{opt.title}</span>
                          <button
                            type="button"
                            onClick={() => handleSelectOption(idx, opt)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shadow-sm"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isApplied ? 'Adopted' : 'Adopt Formula'}</span>
                          </button>
                        </div>
                        <p className="text-xs text-emerald-300 font-mono">{opt.formula}</p>
                        <p className="text-[11px] text-stone-400">{opt.rationale}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-stone-400">
              Unable to generate mediation. Check network connection.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#213025] bg-[#111A14] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </motion.div>
    </div>
  );
};
