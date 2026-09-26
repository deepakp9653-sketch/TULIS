'use client';

import React, { useState, useMemo } from 'react';
import {
  Participant,
  Expense,
  Payment,
  RefundEvent,
  Booking,
  RefundPolicy,
  SplitMethod,
  BookingCategory,
} from '@/lib/types';
import { simulateDryRun } from '@/lib/ledger-engine';
import {
  Compass,
  X,
  Play,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  UserX,
  Ban,
  PlusCircle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface WhatIfSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  expenses: Expense[];
  payments: Payment[];
  refunds: RefundEvent[];
  bookings: Booking[];
  onCommitSimulation?: (action: any) => void;
}

export const WhatIfSimulatorModal: React.FC<WhatIfSimulatorModalProps> = ({
  isOpen,
  onClose,
  participants,
  expenses,
  payments,
  refunds,
  bookings,
  onCommitSimulation,
}) => {
  const [simType, setSimType] = useState<'REMOVE_PARTICIPANT' | 'CANCEL_BOOKING' | 'ADD_EXPENSE'>(
    'REMOVE_PARTICIPANT'
  );

  const [selectedParticipantId, setSelectedParticipantId] = useState<string>(
    participants.find((p) => p.status === 'active')?.id || ''
  );
  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    bookings.find((b) => b.status !== 'cancelled')?.id || ''
  );
  const [refundPolicy, setRefundPolicy] = useState<RefundPolicy>('partial');
  const [refundPercent, setRefundPercent] = useState<number>(75);

  const [newExpTitle, setNewExpTitle] = useState<string>('Luxury Yacht Charter');
  const [newExpAmount, setNewExpAmount] = useState<number>(15000);
  const [newExpSplit, setNewExpSplit] = useState<SplitMethod>('equal');
  const [newExpPayer, setNewExpPayer] = useState<string>(participants[0]?.id || '');

  const dryRunResult = useMemo(() => {
    return simulateDryRun(participants, expenses, payments, refunds, bookings, {
      type: simType,
      participantId: selectedParticipantId,
      bookingId: selectedBookingId,
      refundPolicy,
      refundPercent,
      newExpense:
        simType === 'ADD_EXPENSE'
          ? {
              title: newExpTitle,
              totalAmount: newExpAmount,
              splitMethod: newExpSplit,
              paidById: newExpPayer,
              category: 'activity',
            }
          : undefined,
    });
  }, [
    simType,
    selectedParticipantId,
    selectedBookingId,
    refundPolicy,
    refundPercent,
    newExpTitle,
    newExpAmount,
    newExpSplit,
    newExpPayer,
    participants,
    expenses,
    payments,
    refunds,
    bookings,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-4xl bg-surface-overlay border border-brand-gold/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Ribbon */}
        <div className="p-6 bg-gradient-to-r from-surface-base via-surface-raised to-surface-base border-b border-surface-hairline flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
              <Compass className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-serif-display font-bold text-ink-primary">
                  What-If Scenario Simulator (Dry-Run Engine)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
                  Speculative Fold
                </span>
              </div>
              <p className="text-xs text-ink-secondary mt-0.5">
                Preview exact ripple effects on participant balances before committing state changes to the immutable ledger.
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

        {/* Simulation Type Selector Tabs */}
        <div className="px-6 py-3 bg-surface-base/80 border-b border-surface-hairline flex flex-wrap gap-2">
          <button
            onClick={() => setSimType('REMOVE_PARTICIPANT')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              simType === 'REMOVE_PARTICIPANT'
                ? 'bg-surface-raised text-ink-primary shadow-subtle'
                : 'bg-surface-raised text-ink-secondary hover:text-ink-primary border border-surface-hairline'
            }`}
          >
            <UserX className="w-4 h-4" />
            <span>Drop Participant</span>
          </button>

          <button
            onClick={() => setSimType('CANCEL_BOOKING')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              simType === 'CANCEL_BOOKING'
                ? 'bg-surface-raised text-ink-primary shadow-subtle'
                : 'bg-surface-raised text-ink-secondary hover:text-ink-primary border border-surface-hairline'
            }`}
          >
            <Ban className="w-4 h-4" />
            <span>Cancel Itinerary Booking</span>
          </button>

          <button
            onClick={() => setSimType('ADD_EXPENSE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              simType === 'ADD_EXPENSE'
                ? 'bg-surface-raised text-ink-primary shadow-subtle'
                : 'bg-surface-raised text-ink-secondary hover:text-ink-primary border border-surface-hairline'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Hypothetical Cost</span>
          </button>
        </div>

        {/* Parameter Configuration Sub-Bar */}
        <div className="p-5 bg-surface-raised border-b border-surface-hairline text-xs">
          {simType === 'REMOVE_PARTICIPANT' && (
            <div className="flex flex-wrap items-center gap-4">
              <label className="font-semibold text-ink-primary">Select Participant to Remove:</label>
              <select
                value={selectedParticipantId}
                onChange={(e) => setSelectedParticipantId(e.target.value)}
                className="px-3 py-2 bg-surface-base border border-surface-hairline rounded-xl text-ink-primary font-medium focus:outline-none focus:border-brand-gold"
              >
                {participants
                  .filter((p) => p.status === 'active')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.isOrganizer ? '(Organizer)' : ''}
                    </option>
                  ))}
              </select>
              <span className="text-ink-muted text-[11px]">
                Historical expense participations are preserved at respective amounts; unexpensed bookings will redistribute.
              </span>
            </div>
          )}

          {simType === 'CANCEL_BOOKING' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-ink-muted mb-1 font-semibold">Booking:</label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-base border border-surface-hairline rounded-xl text-ink-primary font-medium"
                >
                  {bookings
                    .filter((b) => b.status !== 'cancelled')
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} (₹{b.actualCost})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-semibold">Refund Policy:</label>
                <select
                  value={refundPolicy}
                  onChange={(e) => setRefundPolicy(e.target.value as any)}
                  className="w-full px-3 py-2 bg-surface-base border border-surface-hairline rounded-xl text-ink-primary font-medium"
                >
                  <option value="full">100% Full Refund</option>
                  <option value="partial">Partial Percentage</option>
                  <option value="non_refundable">Non-Refundable (0%)</option>
                </select>
              </div>

              {refundPolicy === 'partial' && (
                <div>
                  <label className="block text-ink-muted mb-1 font-semibold">Refund Rate ({refundPercent}%):</label>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={refundPercent}
                    onChange={(e) => setRefundPercent(Number(e.target.value))}
                    className="w-full mt-2 accent-emerald-500"
                  />
                </div>
              )}
            </div>
          )}

          {simType === 'ADD_EXPENSE' && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-ink-muted mb-1">Expense Title:</label>
                <input
                  type="text"
                  value={newExpTitle}
                  onChange={(e) => setNewExpTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-base border border-surface-hairline rounded-xl text-ink-primary"
                />
              </div>
              <div>
                <label className="block text-ink-muted mb-1">Amount (₹):</label>
                <input
                  type="number"
                  value={newExpAmount}
                  onChange={(e) => setNewExpAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-surface-base border border-surface-hairline rounded-xl text-ink-primary font-numeric font-bold"
                />
              </div>
              <div>
                <label className="block text-ink-muted mb-1">Fronted By:</label>
                <select
                  value={newExpPayer}
                  onChange={(e) => setNewExpPayer(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-base border border-surface-hairline rounded-xl text-ink-primary"
                >
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-ink-muted mb-1">Split Strategy:</label>
                <select
                  value={newExpSplit}
                  onChange={(e) => setNewExpSplit(e.target.value as any)}
                  className="w-full px-3 py-2 bg-surface-base border border-surface-hairline rounded-xl text-ink-primary"
                >
                  <option value="equal">Equal Split</option>
                  <option value="weighted">Weighted (Nights)</option>
                  <option value="room_tier">Room-Tier Weighted</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Live Delta Matrix Table */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="bg-surface-base p-3.5 rounded-2xl border border-surface-hairline flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping" />
              <span className="font-semibold text-ink-primary">{dryRunResult.description}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-emerald-400">
                Zero-Sum Discrepancy Δ = ₹{dryRunResult.projectedAudit.discrepancy.toFixed(2)}
              </span>
              <span className="font-numeric font-bold text-brand-gold">
                {dryRunResult.newSimplifiedDebts.length} Simplified Transactions
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-hairline text-ink-muted uppercase tracking-wider">
                  <th className="py-2.5 px-3">Participant</th>
                  <th className="py-2.5 px-3">Current Position</th>
                  <th className="py-2.5 px-3">Projected Position</th>
                  <th className="py-2.5 px-3">Financial Delta</th>
                  <th className="py-2.5 px-3 text-right">Resulting State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-hairline/60">
                {dryRunResult.deltas.map((d) => {
                  const isPositiveDelta = d.delta > 0.01;
                  const isNegativeDelta = d.delta < -0.01;

                  return (
                    <tr key={d.participantId} className="hover:bg-surface-base/50 transition">
                      <td className="py-3 px-3 font-semibold text-ink-primary">{d.participantName}</td>
                      <td className="py-3 px-3 font-numeric font-medium">
                        <span
                          className={
                            d.currentNet > 0.01
                              ? 'text-emerald-400'
                              : d.currentNet < -0.01
                              ? 'text-red-400'
                              : 'text-ink-muted'
                          }
                        >
                          {d.currentNet > 0 ? `+₹${d.currentNet.toFixed(2)}` : `₹${d.currentNet.toFixed(2)}`}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-numeric font-bold">
                        <span
                          className={
                            d.projectedNet > 0.01
                              ? 'text-emerald-400'
                              : d.projectedNet < -0.01
                              ? 'text-red-400'
                              : 'text-ink-muted'
                          }
                        >
                          {d.projectedNet > 0
                            ? `+₹${d.projectedNet.toFixed(2)}`
                            : `₹${d.projectedNet.toFixed(2)}`}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-numeric font-bold">
                        {isPositiveDelta && (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            <TrendingUp className="w-3.5 h-3.5" /> +₹{d.delta.toFixed(2)}
                          </span>
                        )}
                        {isNegativeDelta && (
                          <span className="inline-flex items-center gap-1 text-red-400">
                            <TrendingDown className="w-3.5 h-3.5" /> ₹{d.delta.toFixed(2)}
                          </span>
                        )}
                        {!isPositiveDelta && !isNegativeDelta && (
                          <span className="text-ink-muted">₹0.00 (No change)</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            d.projectedNet > 0.01
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : d.projectedNet < -0.01
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-surface-hairline text-ink-muted'
                          }`}
                        >
                          {d.projectedNet > 0.01
                            ? 'Owed Surplus'
                            : d.projectedNet < -0.01
                            ? 'Owes Deficit'
                            : 'Fully Settled'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-surface-base border-t border-surface-hairline flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-ink-muted">
            <ShieldCheck className="w-4 h-4 text-brand-gold" />
            <span>Pure scratch calculation — zero state has been committed to disk.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-raised border border-surface-hairline text-ink-primary font-bold hover:bg-surface-hairline transition"
            >
              Discard Simulation
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};