'use client';

import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Flame,
  ArrowRight,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ProjectedVarianceResult } from '@/lib/ledger-engine';

interface PredictiveVarianceCardProps {
  projection: ProjectedVarianceResult;
  onOpenWhatIf?: () => void;
}

export const PredictiveVarianceCard: React.FC<PredictiveVarianceCardProps> = ({
  projection,
  onOpenWhatIf,
}) => {
  const {
    elapsedDays,
    totalDays,
    remainingDays,
    currentActualSpend,
    dailyBurnRate,
    projectedFinalSpend,
    budgetCeiling,
    projectedVariance,
    projectedVariancePercent,
    status,
    narrative,
  } = projection;

  const isOverrun = projectedVariance > 0;
  const timeProgressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));
  const spendVsCeilingPercent =
    budgetCeiling > 0
      ? Math.min(150, Math.round((projectedFinalSpend / budgetCeiling) * 100))
      : 100;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#162217] via-[#101710] to-[#0A0D0A] border border-[#3A4E39]/70 text-stone-100 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#243523] pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner ${
              status === 'exceeded'
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                : status === 'at_risk'
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Predictive Budget Variance</h3>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                F4.2 Linear Forecast
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Extrapolates current daily burn rate through remaining days against budget ceiling
            </p>
          </div>
        </div>

        {/* Trajectory Status Pill */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 ${
              status === 'exceeded'
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                : status === 'at_risk'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {status === 'exceeded' ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>
              {status === 'exceeded'
                ? 'Overrun Risk'
                : status === 'at_risk'
                ? 'Pacing Tight'
                : 'Pacing On Track'}
            </span>
          </span>
        </div>
      </div>

      {/* 4-Stat Telemetry Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Stat 1: Daily Burn Rate */}
        <div className="p-3.5 rounded-2xl bg-black/35 border border-stone-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Daily Burn Rate</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-numeric text-white">
            ₹{dailyBurnRate.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-stone-400 block font-mono">
            Across {elapsedDays} elapsed day{elapsedDays > 1 ? 's' : ''}
          </span>
        </div>

        {/* Stat 2: Current Spend */}
        <div className="p-3.5 rounded-2xl bg-black/35 border border-stone-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Current Realized</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-numeric text-emerald-400">
            ₹{currentActualSpend.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-stone-400 block font-mono">
            {timeProgressPercent}% itinerary elapsed
          </span>
        </div>

        {/* Stat 3: Projected Final */}
        <div className="p-3.5 rounded-2xl bg-black/35 border border-stone-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Projected Final</span>
          </div>
          <div
            className={`text-xl sm:text-2xl font-bold font-numeric ${
              isOverrun ? 'text-rose-400' : 'text-stone-100'
            }`}
          >
            ₹{projectedFinalSpend.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-stone-400 block font-mono">
            {budgetCeiling > 0 ? `Ceiling: ₹${budgetCeiling.toLocaleString('en-IN')}` : 'Flexible budget'}
          </span>
        </div>

        {/* Stat 4: Projected Variance */}
        <div className="p-3.5 rounded-2xl bg-black/35 border border-stone-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            <span>Forecast Delta</span>
          </div>
          <div
            className={`text-xl sm:text-2xl font-bold font-numeric ${
              isOverrun ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {isOverrun ? `+₹${projectedVariance.toLocaleString('en-IN')}` : `-₹${Math.abs(projectedVariance).toLocaleString('en-IN')}`}
          </div>
          <span className="text-[10px] text-stone-400 block font-mono">
            {isOverrun ? `+${projectedVariancePercent}% over` : `${Math.abs(projectedVariancePercent)}% savings`}
          </span>
        </div>
      </div>

      {/* Trajectory Bar Visualizer */}
      <div className="p-4 rounded-2xl bg-[#0e150e] border border-[#223321] space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-300">Pacing Trajectory</span>
            <span className="text-stone-500">•</span>
            <span className="text-stone-400">
              {elapsedDays} of {totalDays} days ({remainingDays} remaining)
            </span>
          </div>
          <span className="font-mono text-stone-400 font-semibold">
            {spendVsCeilingPercent}% of budget pace
          </span>
        </div>

        {/* Dual Progress Stack */}
        <div className="h-3 w-full rounded-full bg-stone-900 border border-stone-800 overflow-hidden flex">
          {/* Realized spend portion */}
          <div
            style={{ width: `${Math.min(100, (currentActualSpend / (budgetCeiling || projectedFinalSpend || 1)) * 100)}%` }}
            className="bg-emerald-500 h-full transition-all"
            title="Realized Spend"
          />
          {/* Projected remaining burn portion */}
          <div
            style={{
              width: `${Math.min(
                100,
                ((dailyBurnRate * remainingDays) / (budgetCeiling || projectedFinalSpend || 1)) * 100
              )}%`,
            }}
            className={`h-full transition-all ${isOverrun ? 'bg-rose-500/80' : 'bg-emerald-700/60'}`}
            title="Projected Remaining Burn"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 pt-0.5">
          <span>₹0</span>
          <span>Target Ceiling: ₹{budgetCeiling.toLocaleString('en-IN')}</span>
          <span>Projected: ₹{projectedFinalSpend.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Narrative & What-If Action Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
          {narrative}
        </p>

        {onOpenWhatIf && (
          <button
            onClick={onOpenWhatIf}
            className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulate Scenarios</span>
          </button>
        )}
      </div>
    </div>
  );
};
