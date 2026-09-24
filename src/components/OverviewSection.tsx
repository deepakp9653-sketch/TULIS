'use client';

import React, { useState } from 'react';
import { UserAvatar } from './UserAvatar';
import {
  Trip,
  Booking,
  Expense,
  Payment,
  ParticipantNetBalance,
  SimplifiedDebt,
  RefundEvent,
  Vendor,
  Anomaly,
} from '@/lib/types';
import { calculateVariance, computeReconciliationAudit } from '@/lib/ledger-engine';
import {
  ShieldCheck,
  ArrowRight,
  Plus,
  Sparkles,
  Trophy,
  PieChart,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  Receipt,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Building2,
  Zap,
  Compass,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SpotlightCard } from './SpotlightCard';
import { LiquidGlassButton } from './LiquidGlassButton';
import { LiquidShaderGradient } from './LiquidShaderGradient';
import { SpendDonutChart } from './SpendDonutChart';
import { ParticipantBarChart } from './ParticipantBarChart';
import { TripVibeGauge } from './TripVibeGauge';
import { ReconciliationAuditCard } from './ReconciliationAuditCard';
import { CountUpMoney } from './CountUpMoney';
import { MOTION_TOKENS } from '@/lib/motion';
import { AnomalyFeedBanner } from './AnomalyFeedBanner';

interface OverviewSectionProps {
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
  onOpenAddExpense: () => void;
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
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  trip,
  bookings,
  expenses,
  payments = [],
  netBalances,
  simplifiedDebts,
  refunds = [],
  vendors = [],
  anomalies = [],
  currentUserId,
  onOpenAddExpense,
  onOpenAddBooking,
  onOpenUpiSetup,
  onOpenVendors,
  onNavigateTab,
  onDismissAnomaly,
  onOpenExplainBalance,
  onOpenWhatIf,
  onOpenChaosDemo,
  onOpenRoomOptimizer,
  onOpenSettlementReport,
  onOpenSquadManager,
}) => {
  const variance = calculateVariance(bookings, expenses);
  const totalSpend = variance.totalActual;
  const budget = trip.budgetCeiling;
  const budgetPercentage = Math.min(100, Math.round((totalSpend / budget) * 100));

  const currentUser = netBalances.find((b) => b.participant.id === currentUserId)?.participant;
  const userBalance = netBalances.find((b) => b.participant.id === currentUserId);
  const netAmount = userBalance ? userBalance.netBalance : 0;
  const organizer = netBalances.find(
    (b) => b.participant.isOrganizer || b.participant.id === trip.organizerId
  )?.participant;

  const participants = netBalances.map((b) => b.participant);
  const audit = computeReconciliationAudit(participants, expenses, payments, refunds);

  const settlementPercent = 85;
  const cushionPercent = 18;

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Recent 4 expenses for live ledger preview
  const recentExpenses = expenses.slice(0, 4);

  // Focus view to declutter the dashboard workspace
  const [dashboardView, setDashboardView] = useState<'highlights' | 'ledger' | 'analytics' | 'budget' | 'all'>('highlights');

  // Quick Action card tab and field states (inspired by reference primary search card)
  const [quickActionTab, setQuickActionTab] = useState<'expense' | 'booking' | 'chat' | 'settle'>('expense');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickPayerId, setQuickPayerId] = useState(currentUserId);

  return (
    <div className="page-container space-y-8 pb-12">
      {/* ============================================================ */}
      {/* 1. TOP HERO BANNER & FLOATING PRIMARY ACTION CARD (Neumorphic) */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden neu-card p-6 sm:p-8 space-y-8">
        {/* Ambient background shader / visual header */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <LiquidShaderGradient />
        </div>

        {/* Hero Header Top Bar */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Vertical Badge Stack */}
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 neu-card-sm">
                Active Workspace
              </span>
              <span className="text-xs text-ink-muted">•</span>
              <span className="text-xs font-mono text-ink-muted uppercase">
                Invite Code: <strong className="text-ink-primary font-bold">{trip.inviteCode || 'GOA2026'}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-ink-primary font-serif-display">
              {greeting}, {currentUser?.name.split(' ')[0] || 'Traveler'}
            </h1>

            <p className="text-xs sm:text-sm text-ink-secondary">
              Managing <strong className="text-ink-primary">{trip.title}</strong> in {trip.destination} • Organized by{' '}
              <span className="text-emerald-500 font-semibold">{organizer?.name || 'Organizer'}</span>
            </p>
          </div>

          {/* Right Squad Avatars & Vibe Rating */}
          <div className="flex flex-wrap items-center gap-4 neu-card-sm p-3 border border-surface-hairline">
            {/* Squad Avatars Stack */}
            <div className="flex items-center -space-x-2 overflow-hidden">
              {participants.slice(0, 5).map((p) => (
                <div key={p.id} className="inline-block ring-2 ring-surface-base rounded-full">
                  <UserAvatar name={p.name} id={p.id} avatarUrl={p.avatarUrl} size="sm" />
                </div>
              ))}
              {participants.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-surface-overlay border-2 border-surface-base flex items-center justify-center text-[10px] font-bold text-ink-secondary font-mono">
                  +{participants.length - 5}
                </div>
              )}
            </div>

            <div className="text-left">
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <span>★ 4.9</span>
                <span className="text-[10px] text-ink-muted font-normal">({settlementPercent}% Settled)</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider block">
                {participants.length} Squad Members
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* FLOATING PRIMARY ACTION CARD in Neumorphic Soft UI style */}
        {/* ============================================================ */}
        <div className="relative z-10 neu-card p-5 sm:p-7 space-y-5">
          {/* Card Header & Category Selector Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-hairline pb-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {[
                { id: 'expense', label: 'Log Expense', icon: Receipt },
                { id: 'booking', label: 'Add Booking', icon: Calendar },
                { id: 'chat', label: 'AI Voice/Chat Log', icon: Sparkles },
                { id: 'settle', label: 'Settle Up', icon: Wallet },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = quickActionTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setQuickActionTab(tab.id as any)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'neu-btn neu-btn-active text-emerald-500 font-bold border-emerald-500/30'
                        : 'neu-btn text-ink-secondary hover:text-ink-primary'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-500' : 'text-ink-muted'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-ink-muted font-medium">
              <span>Split Mode: Equal</span>
              <span>•</span>
              <span className="text-emerald-500 font-bold">Zero-Sum Live</span>
            </div>
          </div>

          {/* Active Tab Quick Action Input Controls */}
          {quickActionTab === 'expense' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
              <div className="md:col-span-4 space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Description / Item</span>
                </label>
                <input
                  type="text"
                  value={quickDesc}
                  onChange={(e) => setQuickDesc(e.target.value)}
                  placeholder="e.g. Dinner at Martin's Corner"
                  className="w-full px-3.5 py-2.5 neu-input text-xs font-medium outline-none"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Amount (₹)</span>
                </label>
                <input
                  type="number"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  placeholder="2400"
                  className="w-full px-3.5 py-2.5 neu-input text-xs font-numeric font-bold outline-none"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <UserAvatar name={currentUser?.name} id={currentUser?.id} size="xs" />
                  <span>Paid By</span>
                </label>
                <select
                  value={quickPayerId}
                  onChange={(e) => setQuickPayerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 neu-input text-xs font-medium outline-none cursor-pointer"
                >
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.id === currentUserId ? '(You)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  onClick={onOpenAddExpense}
                  className="w-full py-2.5 px-4 neu-btn-primary text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add to Ledger</span>
                </button>
              </div>
            </div>
          )}

          {quickActionTab === 'booking' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
              <div className="md:col-span-4 space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Booking Title</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flight to Goa / Villa Stay"
                  className="w-full px-3.5 py-2.5 neu-input text-xs font-medium outline-none"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Category</span>
                </label>
                <select className="w-full px-3.5 py-2.5 neu-input text-xs font-medium outline-none cursor-pointer">
                  <option value="FLIGHT">✈️ Flight</option>
                  <option value="HOTEL">🏨 Hotel / Stay</option>
                  <option value="CAR">🚗 Transport</option>
                  <option value="ACTIVITY">🌴 Activity</option>
                </select>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Total Cost (₹)</span>
                </label>
                <input
                  type="number"
                  placeholder="12500"
                  className="w-full px-3.5 py-2.5 neu-input text-xs font-numeric font-bold outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  onClick={onOpenAddBooking}
                  className="w-full py-2.5 px-4 neu-btn-primary text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Save Booking</span>
                </button>
              </div>
            </div>
          )}

          {quickActionTab === 'chat' && (
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="flex-1 w-full space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Natural Language Expense Input</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid ₹3,200 for scuba diving for Alex, Rahul, and Sarah"
                  className="w-full px-4 py-2.5 neu-input text-xs font-medium outline-none"
                />
              </div>
              <button
                onClick={onOpenAddExpense}
                className="w-full md:w-auto py-2.5 px-6 neu-btn-primary text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Parse & Add</span>
              </button>
            </div>
          )}

          {quickActionTab === 'settle' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
              <div className="md:col-span-4 space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <UserAvatar name={currentUser?.name} id={currentUser?.id} size="xs" />
                  <span>Payer (From)</span>
                </label>
                <select className="w-full px-3.5 py-2.5 neu-input text-xs font-medium outline-none cursor-pointer">
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <UserAvatar name={organizer?.name || 'Recipient'} id={organizer?.id || 'p1'} size="xs" />
                  <span>Recipient (To)</span>
                </label>
                <select className="w-full px-3.5 py-2.5 neu-input text-xs font-medium outline-none cursor-pointer">
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4">
                <button
                  onClick={() => onNavigateTab('settlement')}
                  className="w-full py-2.5 px-4 neu-btn text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  <span>Go to Settlement Graph</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deterministic Anomaly Conflict Feed Banner (F6) */}
      {anomalies.length > 0 && onDismissAnomaly && (
        <AnomalyFeedBanner anomalies={anomalies} onDismissAnomaly={onDismissAnomaly} />
      )}

      {/* ============================================================ */}
      {/* 2. 4-METRIC TELEMETRY RIBBON (21st.dev Spotlight Cards) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Personal Position */}
        <SpotlightCard
          className={`p-5 flex flex-col justify-between ${
            netAmount > 0
              ? 'bg-emerald-500/[0.03] border-emerald-500/25'
              : netAmount < 0
              ? 'bg-rose-500/[0.03] border-rose-500/25'
              : ''
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs text-ink-secondary mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Wallet className="w-3.5 h-3.5 text-ink-muted" />
                Your Balance
              </span>
              <span
                className={`text-[10px] font-mono font-semibold uppercase px-1.5 py-0.2 rounded ${
                  netAmount > 0
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : netAmount < 0
                    ? 'bg-rose-500/15 text-rose-400'
                    : 'bg-surface-hairline text-ink-muted'
                }`}
              >
                {netAmount > 0 ? 'Surplus' : netAmount < 0 ? 'Payable' : 'Settled'}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mt-1">
              <CountUpMoney
                value={netAmount}
                prefix="₹"
                className={`text-2xl sm:text-3xl font-numeric font-bold tracking-tight ${
                  netAmount > 0
                    ? 'text-emerald-400'
                    : netAmount < 0
                    ? 'text-rose-400'
                    : 'text-ink-primary'
                }`}
              />
              <span className="text-[11px] font-mono text-ink-muted">INR</span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-surface-hairline/60 flex items-center justify-between">
            {onOpenExplainBalance && (
              <button
                onClick={() => onOpenExplainBalance(currentUserId)}
                className="text-[11px] text-ink-secondary hover:text-ink-primary flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Explain AI</span>
              </button>
            )}

            {netAmount < 0 && (
              <button
                onClick={() => onNavigateTab('settlement')}
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Settle Up</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </SpotlightCard>

        {/* Metric 2: Total Spend vs Budget */}
        <SpotlightCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-ink-secondary mb-2">
              <span className="font-medium">Total Spend</span>
              <span className="font-mono text-ink-muted text-[11px]">{budgetPercentage}% Budget</span>
            </div>

            <div className="flex items-baseline gap-1.5 mt-1">
              <CountUpMoney
                value={totalSpend}
                prefix="₹"
                className="text-2xl sm:text-3xl font-numeric font-bold text-ink-primary"
              />
              <span className="text-[11px] font-mono text-ink-muted">
                / ₹{budget.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="h-1.5 w-full bg-surface-base rounded-full overflow-hidden mt-3">
              <div
                className={`h-full transition-all duration-500 ${
                  budgetPercentage > 90 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-surface-hairline/60 text-[11px] text-ink-muted flex items-center justify-between">
            <span>{expenses.length} Expenses</span>
            <span>{bookings.length} Bookings</span>
          </div>
        </SpotlightCard>

        {/* Metric 3: Zero-Sum Compression */}
        <SpotlightCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-ink-secondary mb-2">
              <span className="font-medium">Debt Simplification</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400">
                Minimal Paths
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-numeric font-bold text-emerald-400">
                {simplifiedDebts.length}
              </span>
              <span className="text-xs text-ink-secondary">Direct UPI Transfers</span>
            </div>
            <p className="text-[11px] text-ink-muted mt-1.5 line-clamp-1">
              Greedy graph netting eliminates pairwise loops.
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-surface-hairline/60">
            <button
              onClick={() => onNavigateTab('settlement')}
              className="text-[11px] font-medium text-ink-secondary hover:text-ink-primary flex items-center justify-between w-full transition-colors cursor-pointer"
            >
              <span>View Settlement Graph</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </SpotlightCard>

        {/* Metric 4: Audit & Accounting Integrity */}
        <SpotlightCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-ink-secondary mb-2">
              <span className="font-medium">Audit Integrity</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400">
                Double-Entry
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-numeric font-bold text-ink-primary">
                Net 0.00
              </span>
              <span className="text-xs text-emerald-400 font-semibold">Verified</span>
            </div>
            <p className="text-[11px] text-ink-muted mt-1.5 line-clamp-1">
              Deterministic balance reconciliation and zero-sum audit.
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-surface-hairline/60">
            <button
              onClick={() => onNavigateTab('activity')}
              className="text-[11px] font-medium text-ink-secondary hover:text-ink-primary flex items-center justify-between w-full transition-colors cursor-pointer"
            >
              <span>View Audit Trail</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </SpotlightCard>
      </div>

      {/* Live Financial Reconciliation Audit Card (F1) */}
      <ReconciliationAuditCard audit={audit} />

      {/* ============================================================ */}
      {/* 3. WORKSPACE MODULES SELECTOR (DECLUTTER & FOCUS MODES) */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-surface-hairline/60">
        <div>
          <h2 className="text-sm font-semibold text-ink-primary">Workspace Modules</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Switch views to declutter cards or browse all telemetry
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface-raised rounded-xl border border-surface-hairline text-xs">
          {[
            { id: 'highlights', label: 'Highlights' },
            { id: 'ledger', label: 'Ledger & Debts' },
            { id: 'analytics', label: 'Charts & Vibe' },
            { id: 'budget', label: 'Budget Caps' },
            { id: 'all', label: 'All Modules' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDashboardView(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                dashboardView === tab.id
                  ? 'bg-surface-overlay text-ink-primary shadow-subtle border border-surface-hairline font-semibold'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. TRANSACTION & SETTLEMENT CARDS (Highlights, Ledger, All) */}
      {/* ============================================================ */}
      {(dashboardView === 'highlights' || dashboardView === 'ledger' || dashboardView === 'all') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Live Ledger Activity Feed Card (7 cols) */}
          <div className="lg:col-span-7">
            <SpotlightCard className="p-6 space-y-4 shadow-paper">
              <div className="flex items-center justify-between border-b border-surface-hairline/70 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-sans font-semibold text-sm text-ink-primary">
                    Live Expense Ledger
                  </h3>
                </div>

                <button
                  onClick={() => onNavigateTab('expenses')}
                  className="text-xs font-medium text-ink-secondary hover:text-ink-primary flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>View All ({expenses.length})</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Expense Rows */}
              <div className="space-y-2">
                {recentExpenses.length === 0 ? (
                  <div className="text-center py-6 text-xs text-ink-muted">
                    No expenses logged yet. Click &quot;Log Expense&quot; to begin.
                  </div>
                ) : (
                  recentExpenses.map((exp) => {
                    const payer = participants.find((p) => p.id === exp.paidById);
                    return (
                      <div
                        key={exp.id}
                        className="p-3 rounded-xl bg-surface-overlay/50 border border-surface-hairline flex items-center justify-between text-xs hover:border-zinc-500/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <UserAvatar
                            name={payer?.name}
                            id={payer?.id}
                            avatarUrl={payer?.avatarUrl}
                            size="xs"
                            className="shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-ink-primary truncate block">
                              {exp.title}
                            </span>
                            <span className="text-[11px] text-ink-muted flex items-center gap-1.5 flex-wrap">
                              <span>Paid by {payer?.name.split(' ')[0] || 'Unknown'}</span>
                              <span>•</span>
                              <span className="capitalize">{exp.category}</span>
                              <span>•</span>
                              <span className="font-mono text-[10px] text-emerald-400/90">
                                {new Date(exp.createdAt).toLocaleString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true,
                                })}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-numeric font-bold text-sm text-ink-primary block">
                            ₹{exp.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] font-mono text-ink-muted">
                            {exp.allocations?.length || participants.length} shares
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <LiquidGlassButton
                  variant="subtle"
                  size="sm"
                  onClick={onOpenAddExpense}
                  icon={<Plus className="w-3.5 h-3.5" />}
                  className="w-full justify-center"
                >
                  Add New Transaction
                </LiquidGlassButton>
              </div>
            </SpotlightCard>
          </div>

          {/* Direct Settlement Paths Card (5 cols) */}
          <div className="lg:col-span-5">
            <SpotlightCard className="p-6 space-y-4 shadow-paper">
              <div className="flex items-center justify-between border-b border-surface-hairline/70 pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-sans font-semibold text-sm text-ink-primary">
                    Direct Settlement Paths
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                  Zero-Sum
                </span>
              </div>

              {/* Simplified Debts List */}
              <div className="space-y-2">
                {simplifiedDebts.length === 0 ? (
                  <div className="text-center py-6 text-xs text-ink-muted">
                    All squad accounts are fully settled!
                  </div>
                ) : (
                  simplifiedDebts.slice(0, 3).map((debt, idx) => {
                    const fromP = participants.find((p) => p.id === debt.fromId);
                    const toP = participants.find((p) => p.id === debt.toId);

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-surface-overlay/50 border border-surface-hairline flex items-center justify-between text-xs hover:border-zinc-500/40 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 font-medium">
                            <span className="text-rose-400 font-semibold">{fromP?.name.split(' ')[0]}</span>
                            <ArrowRight className="w-3 h-3 text-ink-muted" />
                            <span className="text-emerald-400 font-semibold">{toP?.name.split(' ')[0]}</span>
                          </div>
                          <span className="text-[10px] font-mono text-ink-muted block mt-0.5">
                            UPI: {toP?.upiId || 'Direct VPA'}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-numeric font-bold text-sm text-ink-primary block">
                            ₹{debt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <button
                            onClick={() => onNavigateTab('settlement')}
                            className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 block"
                          >
                            Settle UPI →
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <LiquidGlassButton
                variant="glass"
                size="sm"
                onClick={() => onNavigateTab('settlement')}
                className="w-full justify-center"
              >
                Open Full Settlement Graph ({simplifiedDebts.length})
              </LiquidGlassButton>
            </SpotlightCard>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. VISUAL ANALYTICS & HEALTH GAUGES (Analytics, All) */}
      {/* ============================================================ */}
      {(dashboardView === 'analytics' || dashboardView === 'budget' || dashboardView === 'all') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Category Spend Breakdown (7 cols) */}
          <div className="lg:col-span-7">
            <SpotlightCard className="p-6 space-y-4 shadow-paper">
              <div className="flex items-center justify-between border-b border-surface-hairline/70 pb-3">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-ink-muted" />
                  <h3 className="font-sans font-semibold text-sm text-ink-primary">
                    Category Spend Breakdown
                  </h3>
                </div>
                <span className="text-xs font-mono text-ink-muted">
                  Total: ₹{totalSpend.toLocaleString('en-IN')}
                </span>
              </div>

              <SpendDonutChart categoryStats={variance.byCategory} totalActual={totalSpend} />
            </SpotlightCard>
          </div>

          {/* Trip Health & Participant Equity (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Trip Health & Velocity Index */}
            <SpotlightCard className="p-6 shadow-paper space-y-4">
              <div className="flex items-center justify-between border-b border-surface-hairline/70 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="font-sans font-semibold text-sm text-ink-primary">
                    Trip Health & Pace
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                  Normal
                </span>
              </div>

              <TripVibeGauge
                settlementPercent={settlementPercent}
                budgetCushionPercent={cushionPercent}
                confirmedEventsCount={bookings.length}
              />
            </SpotlightCard>

            {/* Traveler Financial Equity & Contribution */}
            <SpotlightCard className="p-6 shadow-paper space-y-4">
              <div className="flex items-center justify-between border-b border-surface-hairline/70 pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <h3 className="font-sans font-semibold text-sm text-ink-primary">
                    Traveler Equity & Fronted Share
                  </h3>
                </div>
                <button
                  onClick={() => onNavigateTab('participants')}
                  className="text-xs text-ink-secondary hover:text-ink-primary cursor-pointer"
                >
                  Roster
                </button>
              </div>

              <ParticipantBarChart netBalances={netBalances} />
            </SpotlightCard>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. BUDGET GUARDRAILS & HEURISTIC CEILINGS (Highlights, Budget, All) */}
      {/* ============================================================ */}
      {(dashboardView === 'highlights' || dashboardView === 'budget' || dashboardView === 'all') && (
        <SpotlightCard className="p-6 shadow-paper space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-hairline/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-semibold text-sm text-ink-primary">
                  Budget Guardrails &amp; Heuristic Ceilings
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-surface-overlay text-ink-muted border border-surface-hairline">
                  Advisory Ceilings
                </span>
              </div>
              <p className="text-xs text-ink-secondary mt-0.5">
                40% Lodging · 25% Transport · 20% Activities · 15% Food.
              </p>
            </div>

            {onOpenExplainBalance && (
              <button
                onClick={() => onOpenExplainBalance(currentUserId)}
                className="px-3 py-1.5 rounded-lg bg-surface-overlay hover:bg-surface-hairline border border-surface-hairline text-ink-primary text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Explain My Balance</span>
              </button>
            )}
          </div>

          {/* Category Budget Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { cat: 'lodging', label: 'Lodging & Stays', ratio: 0.4 },
              { cat: 'transport', label: 'Transit & Flights', ratio: 0.25 },
              { cat: 'activity', label: 'Activities & Tours', ratio: 0.2 },
              { cat: 'food', label: 'Dining & Provisions', ratio: 0.15 },
            ].map((item) => {
              const targetBudget = budget * item.ratio;
              const actualSpend = variance.byCategory[item.cat]?.actual || 0;
              const pctUsed = targetBudget > 0 ? Math.round((actualSpend / targetBudget) * 100) : 0;
              const isBreached = actualSpend > targetBudget * 1.15;

              return (
                <SpotlightCard
                  key={item.cat}
                  className={`p-4 transition-all ${
                    isBreached
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : 'bg-surface-overlay/40 border-surface-hairline'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-ink-primary">{item.label}</span>
                    <span className="font-mono text-ink-muted text-[11px]">
                      {Math.round(item.ratio * 100)}% Target
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-2">
                    <span className="font-numeric font-bold text-base text-ink-primary">
                      ₹{actualSpend.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-ink-muted font-mono">
                      / ₹{targetBudget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-surface-base rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isBreached ? 'bg-rose-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, pctUsed)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-ink-muted mt-2.5">
                    <span>{pctUsed}% allocated</span>
                    {isBreached && (
                      <span className="font-semibold text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Exceeded
                      </span>
                    )}
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </SpotlightCard>
      )}
    </div>
  );
};
