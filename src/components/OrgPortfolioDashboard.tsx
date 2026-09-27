'use client';

import React from 'react';
import {
  Briefcase,
  TrendingUp,
  Users,
  ShieldCheck,
  Calendar,
  MapPin,
  ArrowRight,
  Sparkles,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { Trip, Booking, Expense, Payment, Participant } from '@/lib/types';
import { computeTripHealth } from '@/lib/trip-health';

interface OrgPortfolioDashboardProps {
  orgName: string;
  trips: Trip[];
  expensesMap: Record<string, Expense[]>;
  bookingsMap: Record<string, Booking[]>;
  participantsMap: Record<string, Participant[]>;
  pendingApprovalsCount?: number;
  onSelectTrip?: (tripId: string) => void;
  onCreateBulkBooking?: () => void;
  onExportRFC4180?: () => void;
}

export const OrgPortfolioDashboard: React.FC<OrgPortfolioDashboardProps> = ({
  orgName,
  trips = [],
  expensesMap = {},
  bookingsMap = {},
  participantsMap = {},
  pendingApprovalsCount = 0,
  onSelectTrip,
  onCreateBulkBooking,
  onExportRFC4180,
}) => {
  // Aggregate stats across all org trips
  let totalOrgSpend = 0;
  let totalOrgCeiling = 0;
  let totalTravelersCount = 0;
  const healthScores: number[] = [];

  const tripSummaries = trips.map((t) => {
    const tExpenses = expensesMap[t.id] || [];
    const tBookings = bookingsMap[t.id] || [];
    const tParticipants = participantsMap[t.id] || [];

    const spend = tExpenses.reduce((sum, e) => sum + (e.totalAmount || 0), 0);
    const ceiling = Number(t.budgetCeiling || 0);

    totalOrgSpend += spend;
    totalOrgCeiling += ceiling;
    totalTravelersCount += tParticipants.length;

    const health = computeTripHealth(t, tParticipants, tBookings, tExpenses, []);

    healthScores.push(health.score);

    return {
      trip: t,
      spend,
      ceiling,
      participantsCount: tParticipants.length,
      health,
    };
  });

  const avgHealth =
    healthScores.length > 0
      ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length)
      : 95;

  return (
    <div className="space-y-6">
      {/* Portfolio Header Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#172318] via-[#111911] to-[#0A0E0A] border border-[#2B3C2A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
              FC.3 Central Travel-Desk
            </span>
            <span className="text-xs text-stone-400">• {orgName}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight font-serif-display">
            Organization Travel Portfolio
          </h2>
          <p className="text-xs text-stone-400">
            Real-time multi-trip oversight, global corporate spend telemetry, and automated compliance health.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onExportRFC4180 && (
            <button
              onClick={onExportRFC4180}
              className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export ERP CSV</span>
            </button>
          )}

          {onCreateBulkBooking && (
            <button
              onClick={onCreateBulkBooking}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/50 cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Bulk Booking Wizard</span>
            </button>
          )}
        </div>
      </div>

      {/* 4-Stat Portfolio Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend */}
        <div className="p-4 rounded-2xl bg-black/40 border border-stone-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Total Realized Spend</span>
          </div>
          <div className="text-2xl font-bold font-numeric text-white">
            ₹{totalOrgSpend.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-stone-400 block font-mono">
            {totalOrgCeiling > 0 ? `Budget: ₹${totalOrgCeiling.toLocaleString('en-IN')}` : 'Across all teams'}
          </span>
        </div>

        {/* Active Trips Count */}
        <div className="p-4 rounded-2xl bg-black/40 border border-stone-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Active Cohorts &amp; Trips</span>
          </div>
          <div className="text-2xl font-bold font-numeric text-sky-400">
            {trips.length}
          </div>
          <span className="text-[10px] text-stone-400 block font-mono">
            {totalTravelersCount} traveling personnel
          </span>
        </div>

        {/* Pending Approvals */}
        <div className="p-4 rounded-2xl bg-black/40 border border-stone-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending Approvals</span>
          </div>
          <div className="text-2xl font-bold font-numeric text-amber-400">
            {pendingApprovalsCount}
          </div>
          <span className="text-[10px] text-stone-400 block font-mono">
            Awaiting 2-tier authorization
          </span>
        </div>

        {/* Portfolio Health Index */}
        <div className="p-4 rounded-2xl bg-black/40 border border-stone-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Avg Portfolio Health</span>
          </div>
          <div className="text-2xl font-bold font-numeric text-emerald-400">
            {avgHealth}%
          </div>
          <span className="text-[10px] text-stone-400 block font-mono">
            Deterministic rule audits
          </span>
        </div>
      </div>

      {/* Trips Rollup Table / Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300">
            Enterprise Trip Directory
          </h3>
          <span className="text-[11px] text-stone-500 font-mono">
            {tripSummaries.length} tracked portfolios
          </span>
        </div>

        <div className="space-y-3">
          {tripSummaries.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-black/30 border border-stone-800/70 text-stone-500 text-xs">
              No corporate-linked trips found for {orgName}. Use Bulk Booking Wizard to launch a corporate trip.
            </div>
          ) : (
            tripSummaries.map(({ trip: t, spend, ceiling, participantsCount, health }) => {
              const spendPercent = ceiling > 0 ? Math.round((spend / ceiling) * 100) : 0;

              return (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-[#131A13] border border-[#273626] hover:border-[#384C36] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{t.title}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                        Score: {health.score}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        <span>{t.destination}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-stone-500" />
                        <span>{participantsCount} Travelers</span>
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">
                        {new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-5">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-stone-500 block">Spend vs Ceiling</span>
                      <div className="text-sm font-bold font-numeric text-white">
                        ₹{spend.toLocaleString('en-IN')}{' '}
                        <span className="text-xs text-stone-400 font-normal">
                          / ₹{ceiling > 0 ? ceiling.toLocaleString('en-IN') : 'Flex'}
                        </span>
                      </div>
                      {ceiling > 0 && (
                        <span className="text-[10px] font-mono text-emerald-400">
                          {spendPercent}% utilized
                        </span>
                      )}
                    </div>

                    {onSelectTrip && (
                      <button
                        onClick={() => onSelectTrip(t.id)}
                        className="px-3.5 py-2 rounded-xl bg-surface-base hover:bg-surface-elevated border border-surface-hairline text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
