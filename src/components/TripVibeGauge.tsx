'use client';

import React from 'react';
import { ShieldCheck, Activity, CheckCircle2, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface TripVibeGaugeProps {
  settlementPercent: number;
  budgetCushionPercent: number;
  confirmedEventsCount: number;
}

export const TripVibeGauge: React.FC<TripVibeGaugeProps> = ({
  settlementPercent,
  budgetCushionPercent,
  confirmedEventsCount,
}) => {
  // Financial stability metric calculation
  const stabilityScore = Math.min(100, Math.round((settlementPercent * 0.6) + (budgetCushionPercent * 1.5) + (confirmedEventsCount > 0 ? 15 : 0)));
  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - (stabilityScore / 100) * circumference;

  return (
    <div className="flex flex-col h-full justify-between space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">
          Health Telemetry
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <ShieldCheck className="w-3 h-3" /> Healthy & Balanced
        </span>
      </div>

      {/* Modern Circular FinTech Dial with SVG */}
      <div className="flex items-center justify-center py-2">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
            {/* Outer track */}
            <circle
              cx="55"
              cy="55"
              r="46"
              fill="transparent"
              stroke="#27272a"
              strokeWidth="7"
            />
            {/* Animated Progress */}
            <motion.circle
              cx="55"
              cy="55"
              r="46"
              fill="transparent"
              stroke="#10b981"
              strokeWidth="7"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>

          {/* Central Metric Value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl sm:text-3xl font-numeric font-bold text-ink-primary tracking-tight">
              {stabilityScore}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">
              Trip Health
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Metrics Telemetry Grid */}
      <div className="grid grid-cols-3 gap-2 w-full pt-1">
        <div className="p-2.5 rounded-xl bg-surface-overlay border border-surface-hairline text-center space-y-1">
          <span className="text-[10px] font-medium text-ink-muted block uppercase tracking-wider">Settlement</span>
          <span className="font-numeric font-bold text-xs text-emerald-400 block">
            {settlementPercent}%
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-surface-overlay border border-surface-hairline text-center space-y-1">
          <span className="text-[10px] font-medium text-ink-muted block uppercase tracking-wider">Cushion</span>
          <span className="font-numeric font-bold text-xs text-ink-primary block">
            +{budgetCushionPercent}%
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-surface-overlay border border-surface-hairline text-center space-y-1">
          <span className="text-[10px] font-medium text-ink-muted block uppercase tracking-wider">Bookings</span>
          <span className="font-numeric font-bold text-xs text-ink-primary block">
            {confirmedEventsCount} Active
          </span>
        </div>
      </div>
    </div>
  );
};
