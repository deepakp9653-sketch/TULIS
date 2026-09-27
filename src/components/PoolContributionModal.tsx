'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  Plus,
  X,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  Users,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Receipt,
  QrCode,
} from 'lucide-react';
import { Trip, Participant, Expense, PoolContribution, PoolState } from '@/lib/types';
import { computePoolState } from '@/lib/ledger-engine';

interface PoolContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  participants: Participant[];
  expenses: Expense[];
  contributions: PoolContribution[];
  currentUser?: any;
  onAddContribution: (contribution: Omit<PoolContribution, 'id' | 'createdAt'>) => void;
  onOpenAddExpenseWithPool?: () => void;
}

export const PoolContributionModal: React.FC<PoolContributionModalProps> = ({
  isOpen,
  onClose,
  trip,
  participants,
  expenses,
  contributions,
  currentUser,
  onAddContribution,
  onOpenAddExpenseWithPool,
}) => {
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>(
    currentUser?.id || participants[0]?.id || ''
  );
  const [amount, setAmount] = useState<string>('2000');
  const [note, setNote] = useState<string>('Common Squad Kitty Upfront');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showRefundBreakdown, setShowRefundBreakdown] = useState<boolean>(false);

  const poolState: PoolState = computePoolState(trip.id, contributions, expenses);
  const poolExpenses = expenses.filter((e) => e.isPoolExpense || e.paidById === 'pool');

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    setIsSubmitting(true);
    onAddContribution({
      tripId: trip.id,
      participantId: selectedParticipantId,
      amount: parsedAmount,
      note: note.trim() || 'Pool Contribution',
    });

    setIsSubmitting(false);
    setAmount('2000');
  };

  const quickAmounts = [1000, 2000, 3000, 5000];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#0E1511] border border-[#213025] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-stone-100"
      >
        {/* Header Bar */}
        <div className="p-5 border-b border-[#213025] bg-[#121B15] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white font-mono">
                  Squad Common Pot (Kitty Mode)
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-950 text-amber-300 border border-amber-800/60 font-mono font-bold uppercase">
                  F-M2
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono">
                Upfront group pool • Shared spends draw from pot before individual splits
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#1A261E] text-stone-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Pot Gauge Bento Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#16221A] via-[#111A14] to-[#0D1310] border border-[#26372B] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-stone-400 tracking-wider block">
                  Current Available Pot
                </span>
                <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-0.5">
                  ₹{poolState.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block">Total In</span>
                  <span className="font-bold text-stone-200">
                    ₹{poolState.totalContributed.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-px h-7 bg-[#213025]" />
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block">Spent</span>
                  <span className="font-bold text-rose-400">
                    -₹{poolState.totalDrawn.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Fill Gauge */}
            <div className="space-y-1.5">
              <div className="w-full h-2.5 bg-[#0A0F0C] rounded-full overflow-hidden border border-[#213025]">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 via-teal-400 to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      poolState.totalContributed > 0
                        ? Math.min(100, (poolState.balance / poolState.totalContributed) * 100)
                        : 0
                    }%`,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                <span>
                  {poolState.totalContributed > 0
                    ? `${((poolState.balance / poolState.totalContributed) * 100).toFixed(0)}% funds remaining`
                    : 'Pot uninitialized'}
                </span>
                <span>{poolExpenses.length} shared pot draws recorded</span>
              </div>
            </div>
          </div>

          {/* Add Funds Form */}
          <form onSubmit={handleContribute} className="p-5 rounded-3xl bg-[#111A14] border border-[#213025] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-200 font-mono flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Contribute Funds into Kitty</span>
              </h4>
              <span className="text-[10px] font-mono text-emerald-400">Instant UPI Sync</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-mono text-stone-400 block mb-1">
                  Contributing Traveler
                </label>
                <select
                  value={selectedParticipantId}
                  onChange={(e) => setSelectedParticipantId(e.target.value)}
                  className="w-full bg-[#16221A] border border-[#26372B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                >
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.isOrganizer ? '(Organizer)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-stone-400 block mb-1">
                  Contribution Amount (₹ INR)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="2000"
                  min="1"
                  className="w-full bg-[#16221A] border border-[#26372B] rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-emerald-500/50"
                  required
                />
              </div>
            </div>

            {/* Quick Amount Pills */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-stone-400">Quick:</span>
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className="px-2.5 py-1 rounded-lg bg-[#16221A] hover:bg-[#203025] border border-[#26372B] text-[11px] font-mono text-stone-300 hover:text-white transition cursor-pointer"
                >
                  +₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              <Coins className="w-4 h-4" />
              <span>Contribute ₹{parseFloat(amount || '0').toLocaleString('en-IN')} to Squad Kitty</span>
            </button>
          </form>

          {/* Proportional Refund Breakdown Accordion */}
          <div className="p-4 rounded-2xl bg-[#111A14] border border-[#213025] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-stone-200">
                  Proportional Leftover Refund Guarantees
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowRefundBreakdown(!showRefundBreakdown)}
                className="text-[11px] font-mono text-teal-400 hover:text-teal-300 cursor-pointer"
              >
                {showRefundBreakdown ? 'Hide Details' : 'Preview Leftover Returns'}
              </button>
            </div>

            <p className="text-[11px] text-stone-400 leading-relaxed">
              If the trip concludes with ₹{poolState.balance.toFixed(2)} remaining, TULIS automatically returns funds proportionally according to each member&apos;s contribution ratio with zero leakage.
            </p>

            {showRefundBreakdown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-2 border-t border-[#213025] space-y-2 text-xs font-mono"
              >
                {poolState.refundDistribution.length === 0 ? (
                  <div className="text-stone-500 py-2 text-center text-xs">
                    No contributions recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-[#213025]">
                    {poolState.refundDistribution.map((item) => {
                      const part = participants.find((p) => p.id === item.participantId);
                      return (
                        <div key={item.participantId} className="py-2 flex items-center justify-between">
                          <span className="text-stone-300 font-medium">
                            {part?.name || 'Traveler'}
                          </span>
                          <div className="text-right">
                            <span className="text-emerald-400 font-bold">
                              ₹{item.refundAmount.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-stone-500 ml-2">
                              ({(item.contributionRatio * 100).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Contributors & Draws Roster */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-300 font-mono">
              Contribution History ({poolState.contributions.length})
            </h4>

            {poolState.contributions.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#111A14] border border-[#213025] text-stone-500 text-xs font-mono text-center">
                No pool contributions recorded yet.
              </div>
            ) : (
              <div className="space-y-2">
                {poolState.contributions.map((c) => {
                  const part = participants.find((p) => p.id === c.participantId);
                  return (
                    <div
                      key={c.id}
                      className="p-3 rounded-2xl bg-[#131D16] border border-[#26372B] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-[10px]">
                          {part?.name ? part.name.slice(0, 2).toUpperCase() : 'TR'}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{part?.name || 'Traveler'}</div>
                          <div className="text-[10px] text-stone-400 font-mono">{c.note || 'Kitty Top-up'}</div>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="font-bold text-emerald-300">
                          +₹{Number(c.amount).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#213025] bg-[#121B15] flex items-center justify-between text-xs text-stone-400 font-mono">
          <span>Zero-Sum Invariant Conserved</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#16221A] hover:bg-[#203025] text-white font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
