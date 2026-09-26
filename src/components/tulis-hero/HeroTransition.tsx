'use client';

import React from 'react';
import { interpolate, Easing } from './motion-config';
import { ArrowRight, Plus, Key, ShieldCheck, Users, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

interface HeroTransitionProps {
  progress: number;
  onEnterApp: () => void;
  onOpenCreateTrip: () => void;
  onOpenJoinTrip: () => void;
  prefersReducedMotion: boolean;
}

export const HeroTransition: React.FC<HeroTransitionProps> = ({
  progress,
  onEnterApp,
  onOpenCreateTrip,
  onOpenJoinTrip,
  prefersReducedMotion,
}) => {
  // Emergence math: 0% until progress reaches 0.36, then unfolds cleanly
  const opacity = prefersReducedMotion
    ? progress > 0.4
      ? 1
      : 0
    : interpolate(progress, [0.36, 0.72], [0, 1], Easing.easeOutQuad);

  const scale = prefersReducedMotion
    ? 1
    : interpolate(progress, [0.36, 0.88], [0.88, 1], Easing.easeOutCubic);

  const translateY = prefersReducedMotion
    ? 0
    : interpolate(progress, [0.36, 0.88], [50, 0], Easing.easeOutCubic);

  const isInteractive = progress >= 0.55;

  return (
    <div
      className={`relative z-30 w-full max-w-4xl mx-auto px-4 sm:px-6 transition-all duration-100 ${
        isInteractive ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      style={{
        opacity,
        transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
      }}
    >
      {/* Top Editorial Promise */}
      <div className="text-center space-y-1.5 sm:space-y-2 mb-3 sm:mb-6">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-0.5 sm:py-1 rounded-full bg-[#5A7863]/12 border border-[#5A7863]/30 text-[10px] sm:text-[11px] font-mono font-medium text-[#3B4953]">
          <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#5A7863]" />
          <span>Plan together. Split fairly. Settle with confidence.</span>
        </div>
        <h1 className="text-xl sm:text-4xl lg:text-5xl font-extrabold text-[#3B4953] tracking-tight leading-tight filter drop-shadow-[0_2px_12px_rgba(235,244,221,0.95)]">
          A physical world, organized into{' '}
          <span className="text-[#5A7863]">one shared ledger.</span>
        </h1>
        <p className="hidden sm:block text-xs sm:text-sm text-[#3B4953]/85 max-w-xl mx-auto font-normal filter drop-shadow-[0_1px_8px_rgba(235,244,221,0.95)]">
          TULIS unites route planning, expenses, and zero-sum debt netting into a clean, calm workspace.
        </p>
      </div>

      {/* Main Workspace Terminal Card (The Organised World) */}
      <div className="bg-[#EBF4DD]/95 backdrop-blur-md border border-[#3B4953]/25 rounded-2xl shadow-xl p-4 sm:p-7 space-y-3.5 sm:space-y-5">
        {/* Card Header: Live Trip Identity */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 pb-3 sm:pb-4 border-b border-[#3B4953]/15">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#5A7863] animate-pulse" />
              <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-[#5A7863] font-semibold">
                Active Trip Workspace
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-[#3B4953]">
              Goa Coastal Traverse • Vagator → Palolem
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-[#3B4953]/75 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#5A7863]" />
                Oct 14–20
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#5A7863]" />
                4 Waypoints
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-[#5A7863]" />
                5 Travelers
              </span>
            </div>
          </div>

          {/* Invite Code Pill */}
          <div className="flex items-center gap-2">
            <div className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg bg-[#5A7863]/12 border border-[#5A7863]/30 text-right">
              <span className="text-[8px] sm:text-[9px] uppercase font-mono tracking-wider text-[#5A7863] block">
                Trip Invite Code
              </span>
              <span className="text-xs font-mono font-bold text-[#3B4953] tracking-widest">
                GOA2026
              </span>
            </div>
          </div>
        </div>

        {/* Live Metrics Grid: Financial Snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-white/60 border border-[#3B4953]/15 space-y-0.5 sm:space-y-1">
            <span className="text-[9px] sm:text-[10px] uppercase font-mono text-[#5A7863]">Total Ledger Spend</span>
            <div className="text-base sm:text-xl font-bold text-[#3B4953] font-mono">₹1,42,850</div>
            <span className="text-[9px] sm:text-[10px] text-[#3B4953]/75 font-mono block">12 shared expenses</span>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-white/60 border border-[#3B4953]/15 space-y-0.5 sm:space-y-1">
            <span className="text-[9px] sm:text-[10px] uppercase font-mono text-[#5A7863]">Netting Engine</span>
            <div className="text-base sm:text-xl font-bold text-[#5A7863] font-mono">3 Transfers</div>
            <span className="text-[9px] sm:text-[10px] text-[#3B4953]/75 font-mono block">Greedy zero-sum</span>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-white/60 border border-[#3B4953]/15 space-y-0.5 sm:space-y-1">
            <span className="text-[9px] sm:text-[10px] uppercase font-mono text-[#5A7863]">Reconciliation Status</span>
            <div className="flex items-center gap-1.5 text-base sm:text-xl font-bold text-[#3B4953] font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5A7863]" />
              <span>Net 0.00</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-[#3B4953]/75 font-mono block">Verified</span>
          </div>
        </div>

        {/* Action Controls Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 pt-1 sm:pt-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onOpenCreateTrip}
              className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#5A7863] text-[#EBF4DD] hover:bg-[#3B4953] transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span>Create Custom Trip</span>
            </button>

            <button
              onClick={onOpenJoinTrip}
              className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[#3B4953]/25 bg-white/50 text-[#3B4953] hover:border-[#3B4953]/60 transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-[#5A7863]" />
              <span>Join with Code</span>
            </button>
          </div>

          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#3B4953] text-[#EBF4DD] hover:bg-[#5A7863] transition-colors text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Open Trip Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
