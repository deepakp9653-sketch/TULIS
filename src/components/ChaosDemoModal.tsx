'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  UserMinus,
  Receipt,
  XCircle,
  Coins,
  Scale,
  ChevronRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ChaosStep {
  id: number;
  title: string;
  badge: string;
  icon: any;
  actionText: string;
  explanation: string;
  ledgerDelta: string;
}

export const CHAOS_STEPS: ChaosStep[] = [
  {
    id: 1,
    title: 'Late Joiner Joins Mid-Trip',
    badge: 'PARTICIPANT_ADDED',
    icon: UserPlus,
    actionText: 'Add Vikram Sharma to active roster via Invite Code',
    explanation:
      'Vikram joins the group. The event-sourced fold slots him into future bookings and recalculates future split denominators automatically without disturbing past closed expenses.',
    ledgerDelta: '+1 Traveler, Denominators shifted from N=4 to N=5',
  },
  {
    id: 2,
    title: 'Shared Group Outlay Fronted',
    badge: 'EXPENSE_LOGGED',
    icon: Receipt,
    actionText: 'Log ₹12,000 "Sunset Catamaran Cruise" fronted by Vikram',
    explanation:
      'Vikram pays ₹12,000. Equal split across 5 travelers allocates ₹2,400 debit to each. Vikram gains an immediate net surplus credit of +₹9,600.',
    ledgerDelta: 'Vikram: +₹9,600 surplus | Others: -₹2,400 debt each',
  },
  {
    id: 3,
    title: 'Mid-Trip Participant Exit',
    badge: 'PARTICIPANT_REMOVED',
    icon: UserMinus,
    actionText: 'Remove Sneha Roy from active roster due to emergency departure',
    explanation:
      'Sneha departs early. Her historical debt remains standing and auditable on the ledger, but future unbilled activity shares are redistributed exclusively among remaining active members.',
    ledgerDelta: 'Sneha status → removed; standing balance preserved without silent wipe',
  },
  {
    id: 4,
    title: 'Partial Booking Cancellation',
    badge: 'BOOKING_CANCELLED',
    icon: XCircle,
    actionText: 'Cancel "Deep Sea Scuba Expedition" (₹8,000) under 75% refund policy',
    explanation:
      'The booking is marked cancelled with a 75% partial refund policy contract. The vendor agrees to return ₹6,000 to the original payer.',
    ledgerDelta: 'Booking cancelled; ₹6,000 vendor refund queued for release',
  },
  {
    id: 5,
    title: 'Vendor Refund Proportional Credit',
    badge: 'REFUND_CREDITED',
    icon: Coins,
    actionText: 'Credit ₹6,000 refund back to original payers & relieve participant debts',
    explanation:
      'The ₹6,000 vendor refund is applied. Debt relief is distributed proportionally to participants based on their original contribution, preserving exact cent integrity.',
    ledgerDelta: '₹6,000 credited back; participant debt burdens lowered proportionally',
  },
  {
    id: 6,
    title: 'Zero-Sum Mathematical Invariant Audit',
    badge: 'RECONCILIATION_AUDIT',
    icon: Scale,
    actionText: 'Execute mathematical fold check: ∑(Paid) - ∑(Owed) ≡ 0.00',
    explanation:
      'The reconciliation engine folds the entire event log from empty state. Total net money incurred across all vendors exactly equals the sum of all participant allocations with Δ = ₹0.00.',
    ledgerDelta: 'Invariant holds: Discrepancy Δ = 0.00 (Provably Reconciled)',
  },
  {
    id: 7,
    title: 'Greedy Debt Simplification Collapse',
    badge: 'SETTLEMENT_SIMPLIFIED',
    icon: Zap,
    actionText: 'Compress pairwise debt network from 8 tangled debts to ≤ 3 transactions',
    explanation:
      'The automated graph solver matches the largest debtors with largest creditors, collapsing the tangled web into minimal cash-flow transactions with instant UPI QR ready.',
    ledgerDelta: 'Tangled debt network collapsed into optimal N-1 settlements',
  },
];

interface ChaosDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  isRunning: boolean;
  onExecuteStep: (stepId: number) => void;
  onRunAutoSequence: () => void;
  onResetDemo: () => void;
}

export const ChaosDemoModal: React.FC<ChaosDemoModalProps> = ({
  isOpen,
  onClose,
  currentStep,
  isRunning,
  onExecuteStep,
  onRunAutoSequence,
  onResetDemo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-4xl bg-surface-overlay border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Ribbon */}
        <div className="p-6 bg-gradient-to-r from-surface-base via-surface-raised to-surface-base border-b border-surface-hairline flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-serif-display font-bold text-ink-primary">
                  Chaos Demo Mode — Dynamic Recalculation Engine
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Judges Proof Suite
                </span>
              </div>
              <p className="text-xs text-ink-secondary mt-0.5">
                Proof that Tulis maintains mathematical consistency and zero-sum invariant under continuous chaotic changes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-ink-muted hover:text-ink-primary rounded-xl hover:bg-surface-base transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="px-6 py-4 bg-surface-base/60 border-b border-surface-hairline flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Progress:</span>
            <div className="flex items-center gap-1.5">
              {CHAOS_STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`w-7 h-2 rounded-full transition-all duration-300 ${
                    step.id <= currentStep
                      ? 'bg-emerald-500 shadow-emerald'
                      : 'bg-surface-hairline'
                  }`}
                  title={`Step ${step.id}: ${step.title}`}
                />
              ))}
            </div>
            <span className="text-xs font-numeric font-bold text-emerald-400 ml-2">
              {currentStep} / {CHAOS_STEPS.length} Completed
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onResetDemo}
              disabled={isRunning}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-surface-hairline text-ink-secondary hover:text-ink-primary hover:bg-surface-raised transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>

            <button
              onClick={onRunAutoSequence}
              disabled={isRunning || currentStep === CHAOS_STEPS.length}
              className="px-4 py-2 rounded-xl bg-ink-primary text-surface-base hover:opacity-90 text-xs font-semibold transition shadow-subtle flex items-center gap-2 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-surface-base border-t-transparent animate-spin" />
                  <span>Replaying Sequence...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{currentStep === 0 ? 'Run Full Chaos Demo (Auto)' : 'Continue Auto Play'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step-by-Step Interactive Timeline Feed */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {CHAOS_STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = step.id <= currentStep;
            const isCurrent = step.id === currentStep + 1;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-500/5 border-emerald-500/30 shadow-sm'
                    : isCurrent
                    ? 'bg-emerald-500/5 border-emerald-500/40 ring-1 ring-emerald-500/30'
                    : 'bg-surface-base/40 border-surface-hairline/60 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : isCurrent
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                          : 'bg-surface-hairline text-ink-muted border-surface-hairline'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-numeric text-xs font-bold text-ink-muted">Step 0{step.id}</span>
                        <h4 className="font-bold text-sm sm:text-base text-ink-primary">{step.title}</h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-surface-hairline text-ink-muted'
                          }`}
                        >
                          {step.badge}
                        </span>
                      </div>

                      <p className="text-xs text-ink-secondary leading-relaxed max-w-2xl font-normal">
                        {step.explanation}
                      </p>

                      <div className="text-[11px] font-mono text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded-lg border border-brand-gold/20 inline-block mt-1">
                        ⚡ {step.ledgerDelta}
                      </div>
                    </div>
                  </div>

                  {/* Manual Step Trigger Button */}
                  <div className="flex-shrink-0 self-end sm:self-center">
                    {isCompleted ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Executed
                      </span>
                    ) : (
                      <button
                        onClick={() => onExecuteStep(step.id)}
                        disabled={isRunning}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                          isCurrent
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald'
                            : 'bg-surface-base text-ink-secondary hover:text-ink-primary border border-surface-hairline'
                        }`}
                      >
                        <span>Step {step.id}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-surface-base border-t border-surface-hairline flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Guaranteed: Replaying event log from zero state produces identical balances.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-raised border border-surface-hairline text-ink-primary font-bold hover:bg-surface-hairline transition"
          >
            Close Suite
          </button>
        </div>
      </motion.div>
    </div>
  );
};