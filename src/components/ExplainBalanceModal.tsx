'use client';

import React from 'react';
import {
  Participant,
  Expense,
  Payment,
  RefundEvent,
  Booking,
} from '@/lib/types';
import { explainParticipantBalance } from '@/lib/ledger-engine';
import {
  Sparkles,
  X,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Receipt,
  ArrowRight,
  Coins,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ExplainBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantId: string;
  participants: Participant[];
  expenses: Expense[];
  payments: Payment[];
  refunds: RefundEvent[];
  bookings: Booking[];
}

export const ExplainBalanceModal: React.FC<ExplainBalanceModalProps> = ({
  isOpen,
  onClose,
  participantId,
  participants,
  expenses,
  payments,
  refunds,
  bookings,
}) => {
  if (!isOpen) return null;

  const explanation = explainParticipantBalance(
    participantId,
    participants,
    expenses,
    payments,
    refunds,
    bookings
  );

  const { participant, netBalance, status, items, summaryText, totalFronted, totalConsumed, totalP2PNet } =
    explanation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-2xl bg-surface-overlay border border-surface-hairline rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Header Ribbon */}
        <div className="p-6 bg-gradient-to-r from-surface-base via-surface-raised to-surface-base border-b border-surface-hairline flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-serif-display font-bold text-ink-primary">
                  Explain My Balance: {participant.name}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    status === 'surplus'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : status === 'deficit'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-surface-hairline text-ink-muted'
                  }`}
                >
                  {status === 'surplus'
                    ? `+₹${netBalance.toFixed(2)} Surplus`
                    : status === 'deficit'
                    ? `₹${netBalance.toFixed(2)} Deficit`
                    : 'Settled'}
                </span>
              </div>
              <p className="text-xs text-ink-secondary mt-0.5">
                Deterministic line-item mathematical proof derived strictly from the append-only event ledger.
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

        {/* Narrative Summary Card */}
        <div className="p-5 bg-surface-base/80 border-b border-surface-hairline">
          <div className="p-4 rounded-2xl bg-surface-raised border border-surface-hairline space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> AI & Deterministic Lineage Narrative
            </div>
            <p className="text-xs sm:text-sm text-ink-primary leading-relaxed font-medium">
              {summaryText}
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="p-3 bg-surface-raised rounded-xl border border-surface-hairline">
              <div className="text-[10px] uppercase font-bold text-ink-muted">Gross Outlay Fronted</div>
              <div className="font-numeric font-bold text-sm text-emerald-400 mt-1">
                +₹{totalFronted.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-3 bg-surface-raised rounded-xl border border-surface-hairline">
              <div className="text-[10px] uppercase font-bold text-ink-muted">Consumed Activity Shares</div>
              <div className="font-numeric font-bold text-sm text-red-400 mt-1">
                -₹{totalConsumed.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-3 bg-surface-raised rounded-xl border border-surface-hairline">
              <div className="text-[10px] uppercase font-bold text-ink-muted">P2P Transfers Net</div>
              <div className="font-numeric font-bold text-sm text-brand-gold mt-1">
                {totalP2PNet >= 0 ? `+₹${totalP2PNet.toLocaleString('en-IN')}` : `-₹${Math.abs(totalP2PNet).toLocaleString('en-IN')}`}
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Audit Feed */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          <h4 className="font-bold text-ink-secondary text-[11px] uppercase tracking-wider mb-2">
            Event Log Traceability Matrix ({items.length} Transactions)
          </h4>

          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-surface-base/60 border border-surface-hairline rounded-xl flex items-center justify-between gap-3 hover:bg-surface-base transition"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 ${
                    item.type === 'paid_expense'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : item.type === 'owed_expense'
                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                      : item.type === 'received_refund'
                      ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                      : 'bg-brand-gold/15 text-brand-gold border-brand-gold/30'
                  }`}
                >
                  {item.type === 'paid_expense' && <Receipt className="w-4 h-4" />}
                  {item.type === 'owed_expense' && <ArrowRight className="w-4 h-4" />}
                  {item.type === 'received_refund' && <Coins className="w-4 h-4" />}
                  {(item.type === 'p2p_payment_sent' || item.type === 'p2p_payment_received') && (
                    <CreditCard className="w-4 h-4" />
                  )}
                  {item.type === 'subsidy' && <Sparkles className="w-4 h-4" />}
                </div>

                <div>
                  <div className="font-bold text-ink-primary">{item.title}</div>
                  <div className="text-ink-secondary text-[11px] mt-0.5">{item.description}</div>
                </div>
              </div>

              <div className="font-numeric font-bold text-sm text-right flex-shrink-0">
                <span
                  className={
                    item.amount > 0
                      ? 'text-emerald-400'
                      : item.amount < 0
                      ? 'text-red-400'
                      : 'text-purple-400'
                  }
                >
                  {item.formattedAmount}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-base border-t border-surface-hairline flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audit Guarantee: No hidden rounding adjustments or arbitrary offsets.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-raised border border-surface-hairline text-ink-primary font-bold hover:bg-surface-hairline transition"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};