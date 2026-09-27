'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  CreditCard,
  Calendar,
  Layers,
} from 'lucide-react';
import { TripHealthResult } from '@/lib/trip-health';

interface TripHealthScoreCardProps {
  health: TripHealthResult;
  onNavigateTab: (tab: any) => void;
  className?: string;
}

export const TripHealthScoreCard: React.FC<TripHealthScoreCardProps> = ({
  health,
  onNavigateTab,
  className = '',
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const { score, status, statusLabel, deductions, metrics } = health;

  // Status visual configurations using Editorial Forest palette
  const statusConfig = {
    healthy: {
      badgeBg: 'bg-[#5FA97D]/20 text-[#5FA97D] border-[#5FA97D]/40',
      heroBg: 'bg-[#182619]',
      border: 'border-[#5FA97D]/40',
      icon: ShieldCheck,
      pill: 'bg-[#5FA97D] text-[#0E120D]',
    },
    attention: {
      badgeBg: 'bg-[#E0B84C]/20 text-[#E0B84C] border-[#E0B84C]/40',
      heroBg: 'bg-[#262115]',
      border: 'border-[#E0B84C]/40',
      icon: AlertTriangle,
      pill: 'bg-[#E0B84C] text-[#0E120D]',
    },
    action_required: {
      badgeBg: 'bg-[#B5484C]/20 text-[#B5484C] border-[#B5484C]/40',
      heroBg: 'bg-[#291719]',
      border: 'border-[#B5484C]/40',
      icon: AlertOctagon,
      pill: 'bg-[#B5484C] text-[#F4F2E6]',
    },
  }[status];

  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`rounded-3xl border-2 ${statusConfig.border} ${statusConfig.heroBg} p-5 sm:p-6 text-[#F4F2E6] shadow-xl relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Background radial gradient glow */}
      <div
        className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{
          backgroundColor:
            status === 'healthy' ? '#5FA97D' : status === 'attention' ? '#E0B84C' : '#B5484C',
        }}
      />

      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#0E120D]/60 border border-white/10 flex items-center justify-center text-[#5FA97D]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-display font-bold text-base sm:text-lg text-[#F4F2E6] tracking-tight">
              Trip Health Score
            </h3>
            <span className="text-[11px] text-[#8B9A8C] block">
              Continuous algorithmic financial & operational audit
            </span>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${statusConfig.badgeBg}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {statusLabel}
        </span>
      </div>

      {/* Main Score Display Row */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center relative z-10">
        {/* Score Block */}
        <div className="sm:col-span-5 flex items-baseline gap-2 bg-[#0E120D]/60 border border-white/10 rounded-2xl p-4">
          <span className="text-5xl font-black font-mono tracking-tight" style={{ color: health.statusColor }}>
            {score}
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-mono text-[#8B9A8C]">/ 100</span>
            <span className="text-[10px] text-[#8B9A8C] uppercase tracking-wider font-semibold">
              {score === 100 ? 'Zero Defects' : `${deductions.length} Deductions`}
            </span>
          </div>
        </div>

        {/* 4 Quick Telemetry Chips */}
        <div className="sm:col-span-7 grid grid-cols-2 gap-2 text-xs">
          {/* Reconciliation chip */}
          <div className="p-2.5 rounded-xl bg-[#0E120D]/40 border border-white/5 flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                metrics.isReconciled ? 'bg-[#5FA97D]' : 'bg-[#B5484C] animate-pulse'
              }`}
            />
            <div className="truncate">
              <span className="text-[10px] text-[#8B9A8C] block uppercase">Ledger Reconciled</span>
              <span className="font-mono font-semibold text-white">
                {metrics.isReconciled ? '₹0.00 Drift' : `₹${metrics.discrepancyAmount.toFixed(2)} Drift`}
              </span>
            </div>
          </div>

          {/* Anomalies chip */}
          <div className="p-2.5 rounded-xl bg-[#0E120D]/40 border border-white/5 flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                metrics.openAnomaliesCount === 0 ? 'bg-[#5FA97D]' : 'bg-[#E0B84C] animate-pulse'
              }`}
            />
            <div className="truncate">
              <span className="text-[10px] text-[#8B9A8C] block uppercase">Open Anomalies</span>
              <span className="font-mono font-semibold text-white">
                {metrics.openAnomaliesCount === 0 ? '0 Detected' : `${metrics.openAnomaliesCount} Alerts`}
              </span>
            </div>
          </div>

          {/* UPI coverage chip */}
          <div className="p-2.5 rounded-xl bg-[#0E120D]/40 border border-white/5 flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                metrics.participantsTotal > 0 && metrics.participantsWithUpi === metrics.participantsTotal
                  ? 'bg-[#5FA97D]'
                  : 'bg-[#E0B84C]'
              }`}
            />
            <div className="truncate">
              <span className="text-[10px] text-[#8B9A8C] block uppercase">UPI Configured</span>
              <span className="font-mono font-semibold text-white">
                {metrics.participantsWithUpi}/{metrics.participantsTotal} Ready
              </span>
            </div>
          </div>

          {/* Bookings chip */}
          <div className="p-2.5 rounded-xl bg-[#0E120D]/40 border border-white/5 flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                metrics.pendingBookingsCount === 0 ? 'bg-[#5FA97D]' : 'bg-[#B5484C]'
              }`}
            />
            <div className="truncate">
              <span className="text-[10px] text-[#8B9A8C] block uppercase">Pending Bookings</span>
              <span className="font-mono font-semibold text-white">
                {metrics.pendingBookingsCount === 0 ? 'All Confirmed' : `${metrics.pendingBookingsCount} Pending`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expand/Collapse Breakdown Toggle */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs relative z-10">
        <button
          type="button"
          onClick={() => setShowBreakdown((prev) => !prev)}
          className="text-[#8B9A8C] hover:text-[#F4F2E6] flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
        >
          <span>{showBreakdown ? 'Hide Deduction Breakdown' : 'View Health Audit Breakdown'}</span>
          {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {deductions.length > 0 && (
          <span className="text-[11px] font-mono text-[#E0B84C]">
            {deductions.reduce((sum, d) => sum + d.points, 0)} pts total penalties
          </span>
        )}
      </div>

      {/* Expanded Deduction Breakdown Tray */}
      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-white/10 space-y-2 overflow-hidden relative z-10"
          >
            {deductions.length === 0 ? (
              <div className="p-3.5 rounded-2xl bg-[#0E120D]/50 border border-[#5FA97D]/30 flex items-center gap-2.5 text-xs text-[#5FA97D]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Trip is in perfect operational and financial health. No point penalties applied!</span>
              </div>
            ) : (
              deductions.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-2xl bg-[#0E120D]/60 border border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#F4F2E6]">{d.label}</span>
                      <span className="font-mono text-xs font-bold text-[#B5484C] bg-[#B5484C]/20 px-1.5 py-0.5 rounded">
                        {d.points} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8B9A8C] truncate">{d.reason}</p>
                  </div>

                  {d.actionTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab(d.actionTab)}
                      className="px-3 py-1.5 rounded-xl bg-[#5FA97D]/20 hover:bg-[#5FA97D]/30 border border-[#5FA97D]/40 text-[#5FA97D] text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      <span>{d.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default TripHealthScoreCard;
