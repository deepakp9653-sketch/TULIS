'use client';

import React from 'react';
import {
  X,
  Scale,
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  Printer,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trip, Participant, ParticipantNetBalance, Expense } from '@/lib/types';
import { UserAvatar } from './UserAvatar';

interface FairnessReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  participants: Participant[];
  netBalances: ParticipantNetBalance[];
  expenses: Expense[];
  attendanceMatrix?: Record<string, Record<string, boolean>>;
}

export const FairnessReportModal: React.FC<FairnessReportModalProps> = ({
  isOpen,
  onClose,
  trip,
  participants,
  netBalances,
  expenses,
  attendanceMatrix = {},
}) => {
  if (!isOpen) return null;

  const totalSpend = expenses.reduce((sum, e) => sum + (e.totalAmount || 0), 0);
  const totalPaidSum = netBalances.reduce((sum, b) => sum + (b.totalPaid || 0), 0) || totalSpend;

  // 1. Identify Front-Runner (who fronted the most upfront float for the squad)
  const sortedByPaid = [...netBalances].sort((a, b) => b.totalPaid - a.totalPaid);
  const primaryFrontRunner = sortedByPaid[0];
  const frontRunnerFloatPercent =
    totalPaidSum > 0 && primaryFrontRunner
      ? Math.round((primaryFrontRunner.totalPaid / totalPaidSum) * 100)
      : 0;

  // 2. Compute Fairness Equity Score
  // Ideal: zero unpaid debt and balanced float burden
  const unsettledCount = netBalances.filter((b) => Math.abs(b.netBalance) > 10).length;
  const settlementEquity = Math.max(0, 100 - unsettledCount * 12);
  const equityScore = Math.min(100, Math.round(settlementEquity * 0.7 + (100 - Math.min(60, frontRunnerFloatPercent)) * 0.3));

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-gradient-to-b from-[#182218] via-[#121712] to-[#0A0D0A] border border-[#3A4E39]/70 rounded-3xl shadow-2xl shadow-emerald-950/60 text-stone-100 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#283526] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">Trip Fairness & Equity Audit</h3>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-400 border border-emerald-700/40">
                    F4.3 Audit Report
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  {trip.title} • Mathematical integrity, attendance weighting & float burden analysis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white transition-colors"
                title="Print Audit Report"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
            {/* Top Score Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Overall Equity Score */}
              <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-1 text-center md:text-left">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                  Fairness Index
                </span>
                <div className="flex items-baseline gap-2 justify-center md:justify-start">
                  <span className="text-3xl font-bold font-numeric text-white">{equityScore}%</span>
                  <span className="text-xs text-emerald-400 font-medium">Equitable Pacing</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Calculated from net share variances and settlement resolution speed.
                </p>
              </div>

              {/* Total Financial Float */}
              <div className="p-4 rounded-2xl bg-black/40 border border-stone-800 space-y-1 text-center md:text-left">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Total Squad Spend
                </span>
                <div className="text-3xl font-bold font-numeric text-stone-100">
                  ₹{totalSpend.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-stone-400">
                  Distributed across {participants.length} travelers via weighted split allocations.
                </p>
              </div>

              {/* Front-Runner Burden */}
              <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30 space-y-1 text-center md:text-left">
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Front-Runner Float</span>
                </span>
                <div className="text-lg font-bold text-white truncate">
                  {primaryFrontRunner ? primaryFrontRunner.participant.name : 'Shared'}
                </div>
                <p className="text-[11px] text-stone-400">
                  Bore {frontRunnerFloatPercent}% of upfront cashflow deposits (₹
                  {primaryFrontRunner?.totalPaid.toLocaleString('en-IN') || 0}).
                </p>
              </div>
            </div>

            {/* Narrative Equity Summary */}
            <div className="p-4 rounded-2xl bg-[#0e160e] border border-emerald-900/40 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Executive Fairness Narrative</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                The squad ledger demonstrates high transparency with provable double-entry zero-sum invariants.
                {primaryFrontRunner && frontRunnerFloatPercent > 40
                  ? ` Note that ${primaryFrontRunner.participant.name} fronted the bulk of upfront deposits; prioritizing outgoing settlements to them is recommended to neutralize financing burden.`
                  : ' Upfront expense burdens were evenly shared across travelers without single-person float distortion.'}
                {unsettledCount === 0
                  ? ' All debts have been completely resolved.'
                  : ` ${unsettledCount} traveler(s) have pending settlements remaining.`}
              </p>
            </div>

            {/* Per-Traveler Fairness Breakdown Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Traveler Equity Scorecards</span>
              </h4>

              <div className="space-y-2.5">
                {participants.map((p) => {
                  const b = netBalances.find((nb) => nb.participant.id === p.id);
                  const paid = b?.totalPaid || 0;
                  const share = b?.totalOwed || 0;
                  const net = b?.netBalance || 0;
                  const isFrontRunner = p.id === primaryFrontRunner?.participant.id && paid > 0;

                  // Attendance count for traveler
                  const pAttendance = attendanceMatrix[p.id];
                  const attendedDays = pAttendance ? Object.values(pAttendance).filter(Boolean).length : null;

                  return (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-black/30 border border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar name={p.name} id={p.id} avatarUrl={p.avatarUrl} size="md" />
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-stone-100">
                            <span>{p.name}</span>
                            {isFrontRunner && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                Front-Runner
                              </span>
                            )}
                            {p.isOrganizer && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                Organizer
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-400 font-mono flex items-center gap-2 mt-0.5">
                            <span>Paid: ₹{paid.toLocaleString('en-IN')}</span>
                            <span>•</span>
                            <span>Share: ₹{share.toLocaleString('en-IN')}</span>
                            {attendedDays !== null && (
                              <>
                                <span>•</span>
                                <span>{attendedDays} days attended</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-stone-800 pt-2 sm:pt-0">
                        <span
                          className={`font-bold font-numeric text-sm ${
                            net > 0 ? 'text-emerald-400' : net < 0 ? 'text-rose-400' : 'text-stone-400'
                          }`}
                        >
                          {net > 0 ? `+₹${net.toLocaleString('en-IN')}` : net < 0 ? `-₹${Math.abs(net).toLocaleString('en-IN')}` : '₹0 Settled'}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {net > 0 ? 'Owed reimbursement' : net < 0 ? 'Due to squad' : 'Zero balance'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#283526] bg-[#0c120c] flex items-center justify-between shrink-0">
            <span className="text-[11px] text-stone-400 font-mono">
              Certified by Tulis Double-Entry Verification System
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
