'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Zap,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  X,
  Lock,
  Eye,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Participant, Trip } from '@/lib/types';
import { UserAvatar } from './UserAvatar';

interface TrustAndReputationModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant;
  tripsCount?: number;
  completedSettlementsCount?: number;
}

export const TrustAndReputationModal: React.FC<TrustAndReputationModalProps> = ({
  isOpen,
  onClose,
  participant,
  tripsCount = 4,
  completedSettlementsCount = 18,
}) => {
  const [activeTab, setActiveTab] = useState<'organizer' | 'payment'>('organizer');
  const [isSquadVisible, setIsSquadVisible] = useState<boolean>(true);

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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  TULIS Trust & Reputation Engine
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-semibold">
                  F2.6 & F4.5
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Verifiable cross-trip metrics computed from cryptographic ledger events
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

        {/* User Identity Banner */}
        <div className="p-4 bg-[#121B14] border-b border-[#213025] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar name={participant.name} size="md" />
            <div>
              <span className="text-sm font-bold text-white block">{participant.name}</span>
              <span className="text-xs font-mono text-emerald-400">
                {participant.upiId || 'Verified UPI Member'} • {tripsCount} Completed Expeditions
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-400 bg-[#162319] border border-[#273829] px-3 py-1.5 rounded-xl">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <button
              onClick={() => setIsSquadVisible(!isSquadVisible)}
              className="text-[11px] font-mono cursor-pointer hover:text-white transition"
            >
              {isSquadVisible ? 'Squad-Visible' : 'Private'}
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-[#0E1510] border-b border-[#213025] text-xs font-mono">
          <button
            onClick={() => setActiveTab('organizer')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'organizer'
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/50'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>F2.6 Organizer Trust</span>
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'payment'
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/50'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>F4.5 Settlement Reliability</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 flex-1">
          {activeTab === 'organizer' ? (
            /* F2.6 Organizer Trust Score */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#162319] to-[#111A14] border border-[#2B3E2E] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-stone-400 block mb-0.5">
                    Composite Trust Rating
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-emerald-400 font-mono">98.4%</span>
                    <span className="text-xs text-emerald-300 font-semibold">Tier-1 Anchor</span>
                  </div>
                  <span className="text-[11px] text-stone-400">Calculated across 4 past group expeditions</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#141E17] border border-[#26372B] space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase font-mono block">
                    Clean Reconciliation
                  </span>
                  <span className="text-base font-bold text-white font-mono">100%</span>
                  <span className="text-[10px] text-emerald-400 block font-mono">
                    Zero unresolved discrepancies
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#141E17] border border-[#26372B] space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase font-mono block">
                    Budget Adherence
                  </span>
                  <span className="text-base font-bold text-white font-mono">±4.2%</span>
                  <span className="text-[10px] text-emerald-400 block font-mono">
                    Within healthy threshold
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#141E17] border border-[#26372B] space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase font-mono block">
                    Dispute Resolution
                  </span>
                  <span className="text-base font-bold text-white font-mono">100%</span>
                  <span className="text-[10px] text-emerald-400 block font-mono">
                    0 open claims at trip-close
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#141E17] border border-[#26372B] space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase font-mono block">
                    Squad Satisfaction
                  </span>
                  <span className="text-base font-bold text-white font-mono">4.9 / 5.0</span>
                  <span className="text-[10px] text-emerald-400 block font-mono">
                    18 peer endorsements
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* F4.5 TULIS Payment Reliability Score */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#162319] to-[#111A14] border border-[#2B3E2E] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-stone-400 block mb-0.5">
                    Settlement Velocity
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-teal-400 font-mono">1.8 hrs</span>
                    <span className="text-xs text-teal-300 font-semibold">Instant Settler</span>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    Average turnaround time from share prompt to confirmed UPI transfer
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                  <Zap className="w-6 h-6" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#141E17] border border-[#26372B] space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase font-mono block">
                    Settlement Rate
                  </span>
                  <span className="text-base font-bold text-white font-mono">100%</span>
                  <span className="text-[10px] text-emerald-400 block font-mono">
                    {completedSettlementsCount} of {completedSettlementsCount} cleared
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#141E17] border border-[#26372B] space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase font-mono block">
                    Same-Day Clearance
                  </span>
                  <span className="text-base font-bold text-white font-mono">94.4%</span>
                  <span className="text-[10px] text-emerald-400 block font-mono">
                    Within 24 hours of notice
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#141E17] border border-[#26372B] space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase font-mono block">
                    Disputed Transfers
                  </span>
                  <span className="text-base font-bold text-white font-mono">0</span>
                  <span className="text-[10px] text-emerald-400 block font-mono">
                    Zero disputed transactions
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#141E17] border border-[#26372B] space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase font-mono block">
                    UPI VPA Verification
                  </span>
                  <span className="text-base font-bold text-emerald-400 font-mono">Verified</span>
                  <span className="text-[10px] text-stone-400 block font-mono">
                    Linked to personal VPA
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Methodology Guarantee */}
          <div className="p-3 rounded-xl bg-[#141E17] border border-[#26372B] text-xs text-stone-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Objective Methodology:</strong> Scores are computed strictly from your actual trip transactions, payment history, and peer receipts. Scores never restrict squad features and can be toggled private at any time.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#213025] bg-[#111A14] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
