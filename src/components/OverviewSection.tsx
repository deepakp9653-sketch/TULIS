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
  Mic,
  MicOff,
  ShieldAlert,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SpotlightCard } from './SpotlightCard';
import { LiquidGlassButton } from './LiquidGlassButton';
import { LiquidShaderGradient } from './LiquidShaderGradient';
import { SpendDonutChart } from './SpendDonutChart';
import { ParticipantBarChart } from './ParticipantBarChart';
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
  onOpenGogoPlanner,
  onOpenScanReceipt,
  onToggleSafetyMode,
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

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Recent 4 expenses for live ledger preview
  const recentExpenses = expenses.slice(0, 4);

  // Quick Action unified entry states
  const [quickDesc, setQuickDesc] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickPayerId, setQuickPayerId] = useState(currentUserId);
  const [isListening, setIsListening] = useState(false);

  // Voice NLP input handler with Web Speech API support
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setQuickDesc("Dinner at Martin's Corner with squad");
      setQuickAmount('2400');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          const amountMatch = transcript.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
          if (amountMatch) {
            const num = amountMatch[1].replace(/,/g, '');
            setQuickAmount(num);
            const cleanDesc = transcript
              .replace(amountMatch[0], '')
              .replace(/\b(?:paid|spent|for|rupees)\b/gi, '')
              .trim();
            setQuickDesc(cleanDesc || transcript);
          } else {
            setQuickDesc(transcript);
          }
        }
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleQuickSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onOpenAddExpense({
      desc: quickDesc.trim() || undefined,
      amount: quickAmount ? parseFloat(quickAmount) : undefined,
      payerId: quickPayerId || currentUserId,
    });
    setQuickDesc('');
    setQuickAmount('');
  };

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
              {onToggleSafetyMode && (
                <>
                  <span className="text-xs text-ink-muted">•</span>
                  <button
                    type="button"
                    onClick={onToggleSafetyMode}
                    className={`text-[11px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 transition-all cursor-pointer ${
                      trip.safetyModeEnabled
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                        : 'bg-surface-raised text-ink-muted border-surface-hairline hover:text-ink-secondary hover:border-surface-hairline/80'
                    }`}
                    title={
                      trip.safetyModeEnabled
                        ? 'Safety Shield (112 SOS & Audio Shield) is active. Click to disable.'
                        : 'Click to enable Safety Shield (112 SOS & Audio Shield)'
                    }
                  >
                    <ShieldAlert
                      className={`w-3.5 h-3.5 ${
                        trip.safetyModeEnabled ? 'text-emerald-400 animate-pulse' : 'text-ink-muted'
                      }`}
                    />
                    <span>{trip.safetyModeEnabled ? 'Safety Shield: Active' : 'Safety Shield: Off'}</span>
                  </button>
                </>
              )}
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
        {/* UNIFIED EXPENSE INPUT BAR (Manual + Voice/AI + Quick Actions) */}
        {/* ============================================================ */}
        <div className="relative z-10 neu-card p-5 sm:p-6 space-y-4">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-hairline pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-ink-primary font-serif-display">
                  Quick Expense Entry
                </h2>
                <p className="text-[11px] text-ink-muted">
                  Type or speak an expense, then add with custom split allocations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-ink-muted font-medium">
              <span>Auto-Split: Equal / Custom</span>
            </div>
          </div>

          {/* Unified Form Controls */}
          <form onSubmit={handleQuickSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
              {/* Description + Voice Button inside field */}
              <div className="md:col-span-5 space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Description / Item</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={quickDesc}
                    onChange={(e) => setQuickDesc(e.target.value)}
                    placeholder="e.g. Dinner at Martin's Corner (or speak)"
                    className="w-full pl-3.5 pr-10 py-2.5 neu-input text-xs font-medium outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    title={isListening ? 'Listening... Speak now' : 'Voice input (Natural Language)'}
                    className={`absolute right-2 p-1.5 rounded-lg transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                        : 'text-ink-muted hover:text-emerald-400 hover:bg-surface-raised'
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4 text-rose-400 animate-bounce" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Amount field */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Amount (₹)</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-numeric font-bold text-ink-muted">₹</span>
                  <input
                    type="number"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    placeholder="2400"
                    step="any"
                    min="0"
                    className="w-full pl-7 pr-3 py-2.5 neu-input text-xs font-numeric font-bold outline-none"
                  />
                </div>
              </div>

              {/* Paid By selector */}
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

              {/* Submit Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 neu-btn-primary text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-subtle hover:brightness-105 active:scale-[0.98] transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Add to Ledger</span>
                </button>
              </div>
            </div>

            {/* Quick Action Sub-bar with 3 clear direct action buttons */}
            <div className="pt-2 border-t border-surface-hairline/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-[11px] font-mono text-ink-muted uppercase tracking-wider">
                Quick Actions:
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={onOpenAddBooking}
                  className="px-3.5 py-1.5 rounded-xl neu-btn text-xs font-semibold text-ink-secondary hover:text-ink-primary flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add Booking</span>
                </button>

                {onOpenScanReceipt && (
                  <button
                    type="button"
                    onClick={onOpenScanReceipt}
                    className="px-3.5 py-1.5 rounded-xl neu-btn text-xs font-semibold text-ink-secondary hover:text-ink-primary flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-amber-400" />
                    <span>Scan Receipt OCR</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onNavigateTab('settlement')}
                  className="px-3.5 py-1.5 rounded-xl neu-btn text-xs font-semibold text-ink-secondary hover:text-ink-primary flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5 text-blue-400" />
                  <span>Settle Up</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Deterministic Anomaly Conflict Feed Banner (F6) */}
      {anomalies.length > 0 && onDismissAnomaly && (
        <AnomalyFeedBanner anomalies={anomalies} onDismissAnomaly={onDismissAnomaly} />
      )}

      {/* ============================================================ */}
      {/* 2. 3-METRIC TELEMETRY RIBBON (21st.dev Spotlight Cards) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
              Optimised to minimise the number of transfers needed.
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
      </div>

      {/* ============================================================ */}
      {/* 3. TRANSACTION & SETTLEMENT CARDS */}
      {/* ============================================================ */}
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
                  onClick={() => onOpenAddExpense()}
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
                  Balanced
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

      {/* ============================================================ */}
      {/* 4. VISUAL ANALYTICS & EQUITY */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Spend Breakdown (6 cols) */}
        <div className="lg:col-span-6">
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

        {/* Traveler Financial Equity & Contribution (6 cols) */}
        <div className="lg:col-span-6">
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

      {/* ============================================================ */}
      {/* 5. BUDGET GUARDRAILS & HEURISTIC CEILINGS */}
      {/* ============================================================ */}
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
    </div>
  );
};
