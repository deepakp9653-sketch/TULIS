'use client';

import React from 'react';
import {
  TrendingUp,
  Sparkles,
  PieChart,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface FinancialCoachInsightProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export const FinancialCoachInsight: React.FC<FinancialCoachInsightProps> = ({
  isOpen,
  onClose,
  userName = 'Traveler',
}) => {
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
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  TULIS Financial Coach Insights
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/40 font-semibold">
                  F6.6
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Actionable personal travel budgeting coaching derived from historical journeys
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
          {/* Hero Insight Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1A261B] to-[#111A13] border border-[#2D402F] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                Behavioral Habit Score
              </span>
              <span className="text-xs font-mono text-stone-300">Top 5% Prudent Settlers</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Pre-booking flight blocks 14 days earlier saved your squads ~19.4% in airfare surcharges.
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Across your last 3 trips, booking domestic sectors outside the 7-day surge window lowered average ticket price from ₹6,800 to ₹5,480.
            </p>
          </div>

          {/* Key Coach Nudges */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
              3 Data-Grounded Recommendations
            </span>

            {[
              {
                title: 'Dining vs Lodging Spending Ratio',
                metric: '1.38x Lodging',
                desc: 'Dining and social rounds represented 58% of trip spend. Setting a group meal kitty (Pool mode) reduces per-meal transaction friction by 60%.',
                color: 'text-amber-400',
              },
              {
                title: 'Dispute-Free Settlement Streak',
                metric: '4 Consecutive Trips',
                desc: '100% of your shared expenses were accepted without allocation disputes. Your transparent line-item itemization sets a high benchmark for squad trust.',
                color: 'text-emerald-400',
              },
              {
                title: 'Off-Peak Mid-Week Departures',
                metric: '₹4,200 Potential Saving',
                desc: 'Trips starting on Thursdays instead of Friday mornings consistently unlocked lower hotel baseline tariffs at high-demand resort venues.',
                color: 'text-teal-400',
              },
            ].map((coach, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#141E17] border border-[#26372B] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{coach.title}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0D150E] ${coach.color}`}>
                    {coach.metric}
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 leading-snug">{coach.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-stone-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong>Strict Privacy:</strong> Insights are compiled strictly for your account. TULIS never benchmarks your data against strangers or shares spending habits.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#213025] bg-[#111A14] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
};
