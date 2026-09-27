'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Trophy,
  Award,
  Calendar,
  Share2,
  Copy,
  CheckCircle2,
  X,
  Loader2,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trip, Expense, Booking, Participant } from '@/lib/types';

interface TripRetrospectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  expenses: Expense[];
  bookings: Booking[];
  participants: Participant[];
}

export const TripRetrospectiveModal: React.FC<TripRetrospectiveModalProps> = ({
  isOpen,
  onClose,
  trip,
  expenses,
  bookings,
  participants,
}) => {
  const [retrospective, setRetrospective] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchRetrospective();
    }
  }, [isOpen, trip.id]);

  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.totalAmount) || 0), 0);

  const fetchRetrospective = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trip-retrospective',
          tripTitle: trip.title,
          destination: trip.destination,
          budgetCeiling: trip.budgetCeiling,
          totalSpent,
          expensesCount: expenses.length,
          participants,
        }),
      });

      const data = await res.json();
      if (data.success && data.retrospective) {
        setRetrospective(data.retrospective);
      }
    } catch (err) {
      console.error('Retrospective fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!retrospective) return;
    const shareText = `🌴 ${retrospective.headline}\n📍 ${trip.destination} • ₹${totalSpent.toLocaleString()} Disbursed\n${retrospective.verdict}\n\n🏆 Squad Superlatives:\n${(retrospective.superlatives || [])
      .map((s: any) => `• ${s.award}: ${s.recipient} (${s.description})`)
      .join('\n')}\n\n✨ Reconciled via TULIS Group Travel Ledger.`;

    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0C110E] border border-[#213025] rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col my-8"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#213025] flex items-center justify-between bg-[#111A14]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Trip Retrospective & Superlatives
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-semibold">
                  F6.2
                </span>
              </div>
              <p className="text-xs text-stone-400">
                AI celebration story, superlative awards & post-trip financial health
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
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
              <p className="text-xs text-stone-400 font-mono">
                Synthesizing ledger events and squad awards with Groq AI...
              </p>
            </div>
          ) : retrospective ? (
            <div className="space-y-4">
              {/* Hero Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#18261B] to-[#111A14] border border-[#2B3E2E] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-emerald-400 font-bold">
                    Official Expedition Wrap-up
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                    {retrospective.budgetStatus || 'Reconciled'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {retrospective.headline}
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {retrospective.verdict}
                </p>

                <div className="pt-2 border-t border-[#26372A] flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-400">Total Squad Spend</span>
                  <span className="text-emerald-300 font-bold">
                    ₹{totalSpent.toLocaleString()} / ₹{trip.budgetCeiling.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Superlatives Awards */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                  Squad Superlative Awards
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(retrospective.superlatives || []).map((sup: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#141E17] border border-[#26372B] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{sup.award}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/40">
                          {sup.recipient}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400">{sup.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Highlights */}
              <div className="p-3.5 rounded-xl bg-[#141E17] border border-[#26372B] space-y-2">
                <span className="text-xs font-bold text-stone-300 block">
                  Financial Highlights & Milestones
                </span>
                <ul className="space-y-1 text-xs text-stone-300">
                  {(retrospective.keyHighlights || []).map((h: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Fairness Audit Summary */}
              {retrospective.fairnessAuditSummary && (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-stone-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    {retrospective.fairnessAuditSummary}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-stone-400">
              No retrospective data available. Click below to generate.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#213025] bg-[#111A14] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-semibold cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handleCopy}
            disabled={!retrospective}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Retrospective</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
