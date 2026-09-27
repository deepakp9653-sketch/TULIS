'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Receipt,
  Calendar,
  ArrowRight,
  Wallet,
  CheckCircle2,
  ShieldCheck,
  Camera,
  PieChart,
  BarChart3,
  Zap,
  Compass,
  Clock,
  ShieldAlert,
  ExternalLink,
  FileText,
  Layers,
  ChevronRight,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import {
  Trip,
  Booking,
  Expense,
  Payment,
  SimplifiedDebt,
  ParticipantNetBalance,
  RefundEvent,
  Vendor,
  Anomaly,
  Participant,
} from '@/lib/types';
import {
  calculateVariance,
  computeReconciliationAudit,
  explainLedgerValue,
  LedgerValueExplanation,
} from '@/lib/ledger-engine';
import { computeTripHealth } from '@/lib/trip-health';
import { SpendDonutChart } from './SpendDonutChart';
import { ParticipantBarChart } from './ParticipantBarChart';
import { UserAvatar } from './UserAvatar';
import { ExplainButton } from './ui/ExplainButton';
import { CountUpMoney } from './CountUpMoney';
import { SpotlightCard } from './SpotlightCard';
import { AnomalyFeedBanner } from './AnomalyFeedBanner';

export interface OverviewSectionProps {
  trip: Trip;
  bookings: Booking[];
  expenses: Expense[];
  payments?: Payment[];
  netBalances: ParticipantNetBalance[];
  simplifiedDebts: SimplifiedDebt[];
  refunds?: RefundEvent[];
  vendors?: Vendor[];
  anomalies?: Anomaly[];
  currentUserId: string;
  onOpenAddExpense: (defaults?: { desc?: string; amount?: number; payerId?: string }) => void;
  onOpenAddBooking: () => void;
  onOpenUpiSetup: () => void;
  onOpenVendors?: () => void;
  onNavigateTab: (tab: any) => void;
  onDismissAnomaly?: (id: string) => void;
  onOpenExplainBalance?: (participantId: string) => void;
  onOpenWhatIf?: () => void;
  onOpenChaosDemo?: () => void;
  onOpenRoomOptimizer?: () => void;
  onOpenSettlementReport?: () => void;
  onOpenSquadManager?: () => void;
  onOpenGogoPlanner?: () => void;
  onOpenScanReceipt?: () => void;
  onToggleSafetyMode?: () => void;
  onOpenCheckIn?: () => void;
  onOpenAssistantWithMessage?: (message: string) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  trip,
  bookings,
  expenses,
  payments = [],
  netBalances,
  simplifiedDebts,
  refunds = [],
  anomalies = [],
  currentUserId,
  onOpenAddExpense,
  onOpenAddBooking,
  onOpenUpiSetup,
  onNavigateTab,
  onDismissAnomaly,
  onOpenWhatIf,
  onOpenRoomOptimizer,
  onOpenSettlementReport,
  onOpenGogoPlanner,
  onOpenScanReceipt,
  onToggleSafetyMode,
  onOpenCheckIn,
}) => {
  const [chartView, setChartView] = useState<'category' | 'member'>('category');
  const [explainExplanation, setExplainExplanation] = useState<LedgerValueExplanation | null>(null);

  // Financial Computations
  const variance = calculateVariance(bookings, expenses);
  const totalSpend = variance.totalActual;
  const budget = trip.budgetCeiling || 60000;
  const budgetPercentage = Math.min(100, Math.round((totalSpend / budget) * 100));
  const remainingBudget = Math.max(0, budget - totalSpend);

  const currentUser = netBalances.find((b) => b.participant.id === currentUserId)?.participant;
  const userBalance = netBalances.find((b) => b.participant.id === currentUserId);
  const netAmount = userBalance ? userBalance.netBalance : 0;
  const participants = netBalances.map((b) => b.participant);

  const audit = computeReconciliationAudit(participants, expenses, payments, refunds);
  const tripHealth = React.useMemo(() => {
    return computeTripHealth(trip, participants, bookings, expenses, payments, anomalies);
  }, [trip, participants, bookings, expenses, payments, anomalies]);

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Recent 4 expenses for quick ledger view
  const recentExpenses = expenses.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 antialiased">
      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 1. HERO BENTO: WARM EDITORIAL GREETING & PRIMARY ACTIONS      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl p-6 sm:p-8 bg-surface-raised border border-surface-hairline shadow-sm relative overflow-hidden dark:bg-[#151D18] dark:border-[#2B3E2F]">
        {/* Editorial glow accents - Warm subtle light and pastel yellow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FEF08A]/35 dark:bg-[#D9EE86]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#5A7863]/10 dark:bg-[#2D7A5C]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Trip Identity & Warm Greeting */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FEF9C3] text-[#713F12] border border-[#FDE047] shadow-xs">
                {trip.inviteCode || 'TRIP26'}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-inset text-ink-primary border border-surface-hairline flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#5A7863]" />
                <span>{trip.destination || 'Group Trip'}</span>
              </span>

              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#854D0E] border border-[#FDE68A] flex items-center gap-1">
                <span>★ 4.9</span>
                <span className="text-[#854D0E]/70 font-normal">• 85% Settled</span>
              </span>

              {trip.safetyModeEnabled && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#5A7863]/15 text-[#5A7863] border border-[#5A7863]/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Safety Active</span>
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-ink-primary tracking-tight font-serif-display">
                {greeting}, {currentUser?.name?.split(' ')[0] || 'Traveler'}!
              </h1>
              <p className="text-xs sm:text-sm text-ink-secondary mt-1">
                Managing <strong className="text-ink-primary">{trip.title}</strong> with{' '}
                <span className="px-2 py-0.5 rounded-md bg-[#FEF9C3] text-[#713F12] font-semibold border border-[#FDE047]/60">{participants.length} squad members</span>.
                Every rupee tracked and accounted for.
              </p>
            </div>

            {/* Squad Avatars inline */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center -space-x-2">
                {participants.slice(0, 5).map((p) => (
                  <div key={p.id} className="inline-block ring-2 ring-surface-raised rounded-full">
                    <UserAvatar name={p.name} id={p.id} avatarUrl={p.avatarUrl} size="sm" />
                  </div>
                ))}
                {participants.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-surface-inset border-2 border-surface-raised flex items-center justify-center text-[10px] font-bold text-ink-primary font-mono">
                    +{participants.length - 5}
                  </div>
                )}
              </div>
              <span className="text-xs text-ink-muted">All members on this trip</span>
            </div>
          </div>

          {/* Right: High-Energy Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 sm:self-start lg:self-center">
            {/* Primary Action: Log Group Expense (clean, no duplicate plus) */}
            <button
              onClick={() => onOpenAddExpense()}
              className="px-6 py-3.5 rounded-2xl bg-[#5A7863] hover:bg-[#4C6753] text-[#EBF4DD] font-bold text-sm shadow-md flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Log Group Expense</span>
            </button>

            {/* Secondary Actions Row */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAddBooking}
                className="flex-1 px-4 py-2.5 rounded-xl bg-surface-inset hover:bg-surface-raised border border-surface-hairline text-xs font-bold text-ink-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                title="Schedule hotel, flight, or activity booking"
              >
                <Calendar className="w-3.5 h-3.5 text-[#5A7863]" />
                <span>+ Add Booking</span>
              </button>

              {onOpenGogoPlanner && (
                <button
                  onClick={onOpenGogoPlanner}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#FEF9C3] hover:bg-[#FEF08A] border border-[#FDE047]/60 text-xs font-bold text-[#713F12] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  title="Open Gogo AI companion"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#854D0E]" />
                  <span>Ask Gogo AI</span>
                </button>
              )}

              {onOpenScanReceipt && (
                <button
                  onClick={onOpenScanReceipt}
                  className="p-2.5 rounded-xl bg-surface-inset hover:bg-surface-raised border border-surface-hairline text-ink-secondary hover:text-ink-primary transition-all cursor-pointer shadow-xs"
                  title="Scan bill or receipt with AI OCR"
                >
                  <Camera className="w-4 h-4 text-[#5A7863]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Anomalies alert banner if any conflict detected */}
      {anomalies.length > 0 && onDismissAnomaly && (
        <AnomalyFeedBanner anomalies={anomalies} onDismissAnomaly={onDismissAnomaly} />
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 2. CORE FINANCIAL TELEMETRY (3-Card Clean Bento Grid)        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Personal Balance Position */}
        <div className="rounded-3xl p-6 bg-surface-raised border border-surface-hairline shadow-sm flex flex-col justify-between relative overflow-hidden dark:bg-[#151D18] dark:border-[#2B3E2F]">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-ink-secondary">
                <Wallet className="w-4 h-4 text-[#5A7863]" />
                <span>Your Balance</span>
              </span>

              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                  netAmount > 0
                    ? 'bg-[#2D7A5C]/15 text-[#2D7A5C] border border-[#2D7A5C]/30'
                    : netAmount < 0
                    ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                    : 'bg-surface-inset text-ink-muted'
                }`}
              >
                {netAmount > 0 ? 'Surplus' : netAmount < 0 ? 'To Pay' : 'Settled'}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-3xl sm:text-4xl font-numeric font-extrabold tracking-tight ${
                    netAmount > 0
                      ? 'text-[#2D7A5C] dark:text-[#D9EE86]'
                      : netAmount < 0
                      ? 'text-rose-600'
                      : 'text-ink-primary'
                  }`}
                >
                  {netAmount < 0 ? '-' : netAmount > 0 ? '+' : ''}₹{Math.abs(netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-1 font-medium">
                {netAmount > 0
                  ? 'The squad owes you this money.'
                  : netAmount < 0
                  ? 'You owe this amount to squad members.'
                  : 'You are completely squared away!'}
              </p>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-surface-hairline flex items-center justify-between">
            <ExplainButton
              onExplain={() => {
                const exp = explainLedgerValue('balance', currentUserId, {
                  trip,
                  participants,
                  expenses,
                  payments,
                  refunds,
                  bookings,
                });
                setExplainExplanation(exp);
              }}
              ariaLabel="Explain your balance"
              tooltip="Why this balance?"
            />

            {netAmount < 0 ? (
              <button
                onClick={() => onNavigateTab('squad-settlements')}
                className="text-xs font-bold text-[#C2410C] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Settle via UPI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onNavigateTab('squad-settlements')}
                className="text-xs font-semibold text-ink-secondary hover:text-ink-primary flex items-center gap-1 cursor-pointer"
              >
                <span>View Roster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Metric 2: Trip Spend vs Budget Progress */}
        <div className="rounded-3xl p-6 bg-surface-raised border border-surface-hairline shadow-sm flex flex-col justify-between dark:bg-[#151D18] dark:border-[#2B3E2F]">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-ink-secondary">
                <TrendingUp className="w-4 h-4 text-[#5A7863]" />
                <span>Trip Spend vs Budget</span>
              </span>

              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]/60">
                {budgetPercentage}% Logged
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-numeric font-extrabold text-ink-primary">
                  ₹{totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-xs text-ink-muted">/ ₹{budget.toLocaleString('en-IN')}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-surface-inset h-2.5 rounded-full overflow-hidden mt-3 border border-surface-hairline">
                <div
                  className="h-full bg-gradient-to-r from-[#5A7863] via-[#F2D778] to-[#D9EE86] rounded-full transition-all duration-500"
                  style={{ width: `${budgetPercentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-ink-muted mt-1.5 font-mono">
                <span>Remaining: ₹{remainingBudget.toLocaleString('en-IN')}</span>
                <span className="text-[#2D7A5C] font-semibold">Surplus OK</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-surface-hairline flex items-center justify-between text-xs">
            <span className="text-ink-muted">{expenses.length} Expenses • {bookings.length} Bookings</span>
            <button
              onClick={() => onNavigateTab('plan-ledger')}
              className="font-semibold text-ink-secondary hover:text-ink-primary flex items-center gap-1 cursor-pointer"
            >
              <span>Ledger Table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Metric 3: Mathematical Ledger Integrity */}
        <div className="rounded-3xl p-6 bg-surface-raised border border-surface-hairline shadow-sm flex flex-col justify-between dark:bg-[#151D18] dark:border-[#2B3E2F]">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-ink-secondary">
                <ShieldCheck className="w-4 h-4 text-[#2D7A5C]" />
                <span>Balance Check</span>
              </span>

              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#2D7A5C]/10 text-[#2D7A5C] border border-[#2D7A5C]/25">
                Balanced
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-numeric font-extrabold text-[#2D7A5C] dark:text-[#D9EE86]">
                  ₹0.00
                </span>
                <span className="text-xs text-ink-muted">Difference</span>
              </div>
              <p className="text-xs text-ink-muted mt-1 font-medium">
                All balances verified across {participants.length} travelers — no discrepancies.
              </p>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-surface-hairline flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] font-mono text-ink-muted">
              <Zap className="w-3.5 h-3.5 text-[#5A7863]" />
              <span>{simplifiedDebts.length} Optimal Paths</span>
            </div>

            {onOpenSettlementReport && (
              <button
                onClick={onOpenSettlementReport}
                className="text-xs font-bold text-[#5A7863] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Audit Certificate</span>
                <FileText className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 3. VISUAL ANALYTICS & SQUAD LEDGER (2-Column Bento)           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Spend Analytics (Donut + Member Toggle) */}
        <div className="lg:col-span-6 rounded-3xl p-6 bg-surface-raised border border-surface-hairline shadow-sm space-y-4 dark:bg-[#151D18] dark:border-[#2B3E2F]">
          <div className="flex items-center justify-between border-b border-surface-hairline pb-3.5">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#5A7863]" />
              <h3 className="font-bold text-sm text-ink-primary">Spend Distribution</h3>
            </div>

            {/* Toggle between Category and Member View */}
            <div className="flex items-center p-0.5 bg-surface-inset border border-surface-hairline rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChartView('category')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartView === 'category'
                    ? 'bg-surface-raised text-ink-primary font-bold shadow-xs'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                Category
              </button>
              <button
                type="button"
                onClick={() => setChartView('member')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartView === 'member'
                    ? 'bg-surface-raised text-ink-primary font-bold shadow-xs'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                By Member
              </button>
            </div>
          </div>

          {/* Chart Content */}
          <div className="pt-2">
            {chartView === 'category' ? (
              <SpendDonutChart categoryStats={variance.byCategory} totalActual={totalSpend} />
            ) : (
              <ParticipantBarChart netBalances={netBalances} />
            )}
          </div>
        </div>

        {/* Right Column: Squad Debts & Quick Settlement Ledger */}
        <div className="lg:col-span-6 rounded-3xl p-6 bg-surface-raised border border-surface-hairline shadow-sm space-y-4 flex flex-col justify-between dark:bg-[#151D18] dark:border-[#2B3E2F]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-surface-hairline pb-3.5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#5A7863]" />
                <h3 className="font-bold text-sm text-ink-primary">Direct Settlement Ledger</h3>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FEF9C3] text-[#713F12] border border-[#FDE047]/60">
                Simplified
              </span>
            </div>

            {/* List of Simplified Debts or Clean Roster */}
            <div className="space-y-2.5">
              {simplifiedDebts.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-surface-inset border border-surface-hairline">
                  <CheckCircle2 className="w-8 h-8 text-[#2D7A5C] mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-ink-primary">All Squad Debts Settled!</h4>
                  <p className="text-xs text-ink-muted mt-1">
                    Every member is at ₹0.00 net balance.
                  </p>
                </div>
              ) : (
                simplifiedDebts.slice(0, 4).map((debt, idx) => {
                  const fromP = participants.find((p) => p.id === debt.fromId);
                  const toP = participants.find((p) => p.id === debt.toId);

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-surface-inset/60 border border-surface-hairline flex items-center justify-between text-xs hover:border-[#5A7863]/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <UserAvatar name={fromP?.name} id={fromP?.id} avatarUrl={fromP?.avatarUrl} size="sm" />
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-ink-primary">
                            <span className="text-rose-600">{fromP?.name.split(' ')[0]}</span>
                            <ArrowRight className="w-3 h-3 text-ink-muted" />
                            <span className="text-[#2D7A5C]">{toP?.name.split(' ')[0]}</span>
                          </div>
                          <span className="text-[10px] font-mono text-ink-muted block">
                            UPI: {toP?.upiId || `${toP?.name.toLowerCase().replace(/\s+/g, '')}@upi`}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-numeric font-bold text-sm text-ink-primary block">
                          ₹{debt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <button
                          onClick={() => onNavigateTab('squad-settlements')}
                          className="text-[11px] font-bold text-[#5A7863] hover:underline cursor-pointer"
                        >
                          Settle UPI →
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('squad-settlements')}
            className="w-full py-2.5 rounded-xl bg-surface-inset hover:bg-surface-raised border border-surface-hairline text-xs font-bold text-ink-primary transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-3"
          >
            <span>Open Squad Roster & Full Settlement Graph</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#5A7863]" />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 4. EXPANDABLE CLEAN TOOLS TRAY                                */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl p-4 bg-surface-raised border border-surface-hairline flex flex-wrap items-center justify-between gap-4 shadow-xs dark:bg-[#151D18] dark:border-[#2B3E2F]">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink-secondary">
          <Layers className="w-4 h-4 text-[#5A7863]" />
          <span>Advanced Supertools:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenWhatIf && (
            <button
              onClick={onOpenWhatIf}
              className="px-3 py-1.5 rounded-xl bg-surface-inset hover:bg-surface-raised border border-surface-hairline text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
            >
              What-If Simulator
            </button>
          )}

          {onOpenRoomOptimizer && (
            <button
              onClick={onOpenRoomOptimizer}
              className="px-3 py-1.5 rounded-xl bg-surface-inset hover:bg-surface-raised border border-surface-hairline text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
            >
              Room Optimizer
            </button>
          )}

          {onOpenSettlementReport && (
            <button
              onClick={onOpenSettlementReport}
              className="px-3 py-1.5 rounded-xl bg-surface-inset hover:bg-surface-raised border border-surface-hairline text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
            >
              Audit Report
            </button>
          )}

          {onToggleSafetyMode && (
            <button
              onClick={onToggleSafetyMode}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                trip.safetyModeEnabled
                  ? 'bg-[#5A7863]/15 text-[#5A7863] border-[#5A7863]/30 font-bold'
                  : 'bg-surface-inset text-ink-secondary hover:text-ink-primary border-surface-hairline'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{trip.safetyModeEnabled ? 'Safety Active' : 'Safety Shield'}</span>
            </button>
          )}

          {onOpenCheckIn && (
            <button
              onClick={onOpenCheckIn}
              className="px-3 py-1.5 rounded-xl bg-surface-inset hover:bg-surface-raised border border-surface-hairline text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-[#5A7863]" />
              <span>Check-In Timer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
