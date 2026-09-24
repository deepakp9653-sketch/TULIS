'use client';

import React, { useState } from 'react';
import {
  Compass,
  Wallet,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Calculator,
  Receipt,
  Layers,
  Sparkles,
  Users,
  QrCode,
  FileCheck,
  Lock,
  ChevronRight,
  Plus,
  Key,
  Check,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LiquidLogo } from './LiquidLogo';
import { LiquidShaderGradient } from './LiquidShaderGradient';
import { SpotlightCard } from './SpotlightCard';
import { LiquidGlassButton } from './LiquidGlassButton';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenCreateTrip: () => void;
  onOpenJoinTrip: () => void;
}

interface BarChartItem {
  label: string;
  value: number;
  formattedValue: string;
}

/**
 * Polished Financial Bar Chart Component (Locked Palette Styling)
 * Rounded top bars filled with #3E7D5A -> #5FA97D accent gradient,
 * hover tooltips, #8B9A8C axis labels, sitting on #1B2119 card surface with #2A322A border.
 * Bars grow from baseline up via scaleY Framer Motion animation.
 */
const FinancialBarChart: React.FC<{
  title: string;
  subtitle: string;
  items: BarChartItem[];
}> = ({ title, subtitle, items }) => {
  const maxVal = Math.max(...items.map((i) => i.value), 1);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="p-5 rounded-2xl bg-surface-raised border border-surface-hairline space-y-4 shadow-paper">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-ink-primary">{title}</h4>
          <p className="text-[11px] text-ink-muted font-mono">{subtitle}</p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-brand-emerald/15 border border-brand-emerald/30 text-[11px] font-mono font-medium text-brand-emerald">
          Verified
        </div>
      </div>

      <div className="h-48 pt-8 pb-2 px-2 flex items-end justify-between gap-3 bg-surface-inset border border-surface-hairline rounded-xl relative">
        {/* Subtle Horizontal Grid Lines */}
        <div className="absolute inset-x-3 top-8 border-b border-surface-hairline/50 pointer-events-none" />
        <div className="absolute inset-x-3 top-24 border-b border-surface-hairline/50 pointer-events-none" />

        {items.map((item, idx) => {
          const heightPercent = Math.min(100, Math.max(14, (item.value / maxVal) * 100));
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip on Hover */}
              {isHovered && (
                <div className="absolute -top-7 px-2.5 py-1 rounded bg-surface-overlay text-ink-primary text-[10px] font-mono whitespace-nowrap shadow-lg border border-brand-emerald/50 z-10 animate-fade-in">
                  {item.formattedValue}
                </div>
              )}

              {/* Bar Filled with Accent Gradient */}
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: 'easeOut' }}
                style={{ height: `${heightPercent}%`, transformOrigin: 'bottom' }}
                className={`w-full max-w-[38px] rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all ${
                  isHovered ? 'brightness-125 shadow-[0_0_14px_rgba(16,185,129,0.4)]' : 'opacity-90'
                }`}
              />

              {/* X-Axis Label */}
              <span className="text-[10px] sm:text-[11px] font-mono text-ink-muted mt-2 truncate w-full text-center group-hover:text-ink-primary transition-colors">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Compact In-Phone Bar Graph showing category spend — styled native to the app palette.
 * Used exclusively inside the HeroPhoneMockup extended screen.
 */
const PhoneBarGraph: React.FC = () => {
  const bars = [
    { label: 'Lodge', value: 85 },
    { label: 'Food', value: 64 },
    { label: 'Trans', value: 44 },
    { label: 'Activ', value: 32 },
    { label: 'Misc', value: 18 },
  ];

  return (
    <div className="pt-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase font-mono text-ink-muted tracking-wider">Category Spend</span>
        <TrendingUp className="w-3 h-3 text-brand-emerald" />
      </div>
      <div className="h-24 flex items-end justify-between gap-1.5 px-1">
        {bars.map((bar, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.6, delay: 0.4 + idx * 0.08, ease: 'easeOut' }}
              style={{ height: `${bar.value}%`, transformOrigin: 'bottom' }}
              className="w-full rounded-t-[4px] bg-gradient-to-t from-emerald-600 to-emerald-400 opacity-90"
            />
            <span className="text-[8px] font-mono text-ink-muted truncate w-full text-center">{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Phone Mockup Component (Sole Primary Hero Visual — globe removed)
 * Extended vertically to fill full hero column.
 * Displays real app interface with bar graph + floating pop-out notification toast.
 */
const HeroPhoneMockup: React.FC = () => {
  return (
    <div className="relative w-full max-w-[310px] sm:max-w-[330px] mx-auto z-10">
      {/* Phone Body Container — extended height via taller inner content */}
      <div className="rounded-[40px] border-[5px] border-surface-hairline bg-surface-inset p-3 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Phone Speaker Notch */}
        <div className="w-24 h-3.5 bg-surface-hairline rounded-full mx-auto mb-3 flex items-center justify-center">
          <div className="w-8 h-1 rounded-full bg-surface-inset" />
        </div>

        {/* Real In-App Screen Content */}
        <div className="space-y-3 bg-surface-raised rounded-[26px] p-3.5 border border-surface-hairline">
          {/* App Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-surface-hairline">
            <div className="flex items-center gap-2">
              <LiquidLogo size={22} />
              <span className="text-xs font-bold text-ink-primary tracking-tight">Goa Squad 2026</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30">
              GOA2026
            </span>
          </div>

          {/* User Net Balance Position Card */}
          <div className="p-3 rounded-2xl bg-surface-inset border border-surface-hairline space-y-1">
            <span className="text-[10px] uppercase font-mono text-ink-muted">Your Net Position</span>
            <div className="flex items-baseline justify-between">
              <span className="font-numeric font-extrabold text-lg text-brand-emerald">+₹4,850.00</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-brand-emerald/15 text-brand-emerald font-semibold">
                Surplus
              </span>
            </div>
          </div>

          {/* Recent Ledger Proofs */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-ink-muted block">Recent Transactions</span>
            {[
              { title: 'Villa Resort Booking', amount: '₹14,500.00', paidBy: 'You paid', badge: 'Weighted' },
              { title: 'Dinner at Thalassa', amount: '₹4,800.00', paidBy: 'Rohan paid', badge: 'Equal' },
            ].map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-surface-inset border border-surface-hairline flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-ink-primary block truncate max-w-[130px]">{item.title}</span>
                  <span className="text-[10px] text-ink-muted">{item.paidBy}</span>
                </div>
                <div className="text-right">
                  <span className="font-numeric font-bold text-xs text-ink-primary block">{item.amount}</span>
                  <span className="text-[9px] font-mono text-brand-emerald">{item.badge}</span>
                </div>
              </div>
            ))}
          </div>

          {/* In-Phone Bar Graph — Category Spend Breakdown */}
          <div className="p-2.5 rounded-xl bg-surface-inset border border-surface-hairline">
            <PhoneBarGraph />
          </div>

          {/* Quick Action Settle CTA */}
          <div className="pt-1">
            <button className="w-full py-2 rounded-xl cta-gradient-btn text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-mint">
              <Zap className="w-3.5 h-3.5 text-white" />
              <span>Instant UPI Settle QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Pop-Out Notification Toast Card */}
      <motion.div
        initial={{ opacity: 0, y: 18, x: 25 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        className="absolute -bottom-4 -right-5 sm:-right-8 bg-surface-overlay border border-brand-emerald/50 p-3 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 z-30 max-w-[220px]"
      >
        <div className="w-8 h-8 rounded-full bg-brand-emerald/20 border border-brand-emerald/40 flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 text-brand-emerald stroke-[3]" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-mono text-brand-emerald font-bold block uppercase tracking-wide">
            Settlement Received
          </span>
          <p className="text-xs font-semibold text-ink-primary truncate">
            Rohan settled <span className="font-numeric text-brand-emerald">₹3,200</span>
          </p>
          <span className="text-[9px] text-ink-muted block font-mono">Just now • UPI Verified</span>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Ledger Proof Timeline Strip — shows immutable event-log entries as a
 * horizontal scrollable timeline between Sandbox and Features sections.
 */
const LedgerProofStrip: React.FC = () => {
  const events = [
    { time: '09:14', actor: 'Rohan', action: 'Added expense', detail: 'Villa Booking • ₹14,500', type: 'add' },
    { time: '09:31', actor: 'Priya', action: 'Uploaded receipt', detail: 'Bill PDF verified', type: 'proof' },
    { time: '10:02', actor: 'System', action: 'Debt netting run', detail: '6 debts → 3 transfers', type: 'net' },
    { time: '10:47', actor: 'Vikram', action: 'Settled via UPI', detail: '₹6,400 • QR scanned', type: 'settle' },
    { time: '11:15', actor: 'Arjun', action: 'Approved split', detail: 'Weighted • 2 nights', type: 'approve' },
    { time: '12:00', actor: 'Sneha', action: 'Joined trip', detail: 'Code GOA2026', type: 'join' },
  ];

  const typeStyles: Record<string, string> = {
    add: 'bg-brand-emerald/15 text-brand-emerald border-brand-emerald/30',
    proof: 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/25',
    net: 'bg-brand-emerald/15 text-brand-emerald border-brand-emerald/30',
    settle: 'bg-brand-emerald/20 text-brand-emerald border-brand-emerald/40',
    approve: 'bg-surface-inset text-ink-muted border-surface-hairline',
    join: 'bg-surface-inset text-ink-primary border-surface-hairline',
  };

  return (
    <section className="py-10 border-y border-surface-hairline bg-surface-base overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-5">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-mono tracking-widest text-ink-muted">Immutable Audit Log</span>
          <div className="flex-1 h-px bg-surface-hairline" />
          <span className="text-[10px] font-mono text-brand-emerald">Append-Only • Deterministic</span>
        </div>
      </div>
      <div className="flex gap-4 px-6 overflow-x-auto pb-2 scrollbar-hide">
        {events.map((ev, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.07 }}
            className="shrink-0 p-3.5 rounded-2xl bg-surface-raised border border-surface-hairline min-w-[180px] space-y-2 hover:border-brand-emerald/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-ink-muted">{ev.time}</span>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${typeStyles[ev.type]}`}>
                {ev.actor}
              </span>
            </div>
            <p className="text-xs font-semibold text-ink-primary">{ev.action}</p>
            <p className="text-[10px] font-mono text-ink-muted">{ev.detail}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

/**
 * How It Works — Glassmorphic numbered step section with mint accent connectors.
 */
const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Create or Join a Trip',
      desc: 'Spin up a squad trip in seconds, or join one with a 6-character invite code (e.g. GOA2026). No account required.',
      icon: Plus,
    },
    {
      num: '02',
      title: 'Add Expenses & Upload Receipts',
      desc: 'Log any expense — flights, hotels, food, activities. Attach high-res bill receipts. Choose from 5 smart split modes.',
      icon: Receipt,
    },
    {
      num: '03',
      title: 'Auto-Compress Debts',
      desc: 'The greedy graph-netting engine collapses your squad\'s tangled IOUs into the fewest possible UPI transfers.',
      icon: Zap,
    },
    {
      num: '04',
      title: 'Settle Instantly via UPI QR',
      desc: 'Tap Settle → scan a generated QR code in PhonePe / Google Pay / Paytm. Verified on-chain. Trip closed.',
      icon: QrCode,
    },
  ];

  return (
    <section className="py-20 max-w-7xl mx-auto px-6">
      <div className="text-center space-y-2 mb-12">
        <span className="text-xs uppercase font-mono tracking-widest text-brand-emerald">How It Works</span>
        <h2 className="font-sans font-bold text-2xl sm:text-3xl text-ink-primary tracking-tight">
          From first expense to final settlement in 4 steps
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              className="relative p-6 rounded-2xl bg-surface-raised/80 backdrop-blur-md border border-surface-hairline hover:border-brand-emerald/50 transition-all space-y-4"
            >
              {/* Step number accent */}
              <div className="flex items-center justify-between">
                <span className="font-numeric text-3xl font-extrabold text-ink-muted/30 leading-none select-none">
                  {step.num}
                </span>
                <div className="w-9 h-9 rounded-xl bg-surface-inset border border-surface-hairline flex items-center justify-center">
                  <Icon className="w-4 h-4 text-brand-emerald" />
                </div>
              </div>
              <h3 className="font-sans font-bold text-sm text-ink-primary">{step.title}</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">{step.desc}</p>

              {/* Connector arrow between steps (not on last) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-6 h-6 rounded-full bg-surface-raised border border-brand-emerald/40 flex items-center justify-center shadow-sm">
                    <ChevronRight className="w-3 h-3 text-brand-emerald" />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenCreateTrip, onOpenJoinTrip }) => {
  const [sandboxNet, setSandboxNet] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-surface-base text-ink-primary font-sans antialiased selection:bg-brand-emerald/20">
      {/* Elevated Glassmorphic Header */}
      <header className="sticky top-0 z-50 bg-surface-raised/80 backdrop-blur-md border-b border-surface-hairline px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LiquidLogo size={36} />
            <div>
              <span className="font-sans font-bold text-lg tracking-tight text-ink-primary">
                TripSync
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-ink-muted block">
                One Trip. One Ledger. Zero Confusion.
              </span>
            </div>
          </div>

          {/* Navigation Links — glassmorphism hover per link */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Home', href: '#' },
              { label: 'Features', href: '#features' },
              { label: 'Sandbox', href: '#sandbox' },
              { label: 'Dashboard', action: onEnterApp },
            ].map((link, idx) => (
              <a
                key={idx}
                href={link.href || undefined}
                onClick={link.action ? (e: React.MouseEvent) => { e.preventDefault(); link.action?.(); } : undefined}
                className="relative px-3.5 py-1.5 rounded-lg text-xs font-medium text-ink-secondary hover:text-ink-primary transition-all duration-200 cursor-pointer hover:bg-surface-raised hover:backdrop-blur-[12px] border border-transparent"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <LiquidGlassButton
              variant="subtle"
              size="sm"
              onClick={onOpenJoinTrip}
              icon={<Key className="w-3.5 h-3.5 text-ink-muted" />}
              className="hidden sm:inline-flex"
            >
              Join Trip
            </LiquidGlassButton>

            <LiquidGlassButton
              variant="primary"
              size="sm"
              onClick={onEnterApp}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Open Dashboard
            </LiquidGlassButton>
          </div>
        </div>
      </header>

      {/* Hero Section — Phone Mockup as sole primary hero visual (globe removed) */}
      <section className="relative w-full overflow-hidden border-b border-surface-hairline">
        {/* Soft Ambient Aurora Backdrop (18–25% visible range) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[20%] w-[650px] h-[500px] rounded-full bg-gradient-to-tr from-emerald-600/20 to-emerald-400/15 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-[550px] h-[450px] rounded-full bg-emerald-600/15 blur-[120px]" />
          <LiquidShaderGradient />
        </div>

        <div className="relative z-10 px-6 pt-16 pb-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Copy & CTAs */}
            <div className="lg:col-span-7 space-y-6 lg:pt-8">
              {/* Glassmorphic Hero Invite Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-raised backdrop-blur-md border border-surface-hairline text-xs font-mono font-medium text-brand-emerald shadow-subtle">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
                <span>One Trip. One Ledger. Zero Confusion.</span>
              </div>

              <h1 className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-ink-primary leading-[1.12]">
                Group trip finances without the <span className="text-ink-muted">spreadsheets.</span>
              </h1>

              <p className="text-base sm:text-lg text-ink-secondary leading-relaxed max-w-2xl font-normal">
                Connect your itinerary with an immutable financial ledger. Invite squad members with a 6-character code (e.g. <code className="text-brand-emerald font-mono font-semibold bg-surface-inset border border-surface-hairline px-2 py-0.5 rounded">GOA2026</code>), upload bill receipts, and compress group debts via greedy zero-sum graph netting.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <LiquidGlassButton
                  variant="primary"
                  size="md"
                  onClick={onOpenCreateTrip}
                  icon={<Plus className="w-4 h-4 stroke-[3]" />}
                >
                  Create Custom Trip
                </LiquidGlassButton>

                <LiquidGlassButton
                  variant="glass"
                  size="md"
                  onClick={onOpenJoinTrip}
                  icon={<Key className="w-4 h-4 text-ink-muted" />}
                >
                  Join with Invite Code
                </LiquidGlassButton>

                <LiquidGlassButton
                  variant="subtle"
                  size="md"
                  onClick={onEnterApp}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Open Dashboard
                </LiquidGlassButton>
              </div>

              {/* Quick Metrics Cards */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-surface-hairline max-w-lg">
                <div>
                  <span className="font-numeric font-bold text-2xl text-ink-primary block">Net 0.00</span>
                  <span className="text-xs text-ink-muted font-mono">Zero-Sum Audit</span>
                </div>
                <div>
                  <span className="font-numeric font-bold text-2xl text-brand-emerald block">Minimal Paths</span>
                  <span className="text-xs text-ink-muted font-mono">Debt Compression</span>
                </div>
                <div>
                  <span className="font-numeric font-bold text-2xl text-ink-primary block">₹ INR UPI</span>
                  <span className="text-xs text-ink-muted font-mono">Instant QR Settle</span>
                </div>
              </div>
            </div>

            {/* Right Visual: Taller Phone Mockup (sole hero visual — globe removed) */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-start">
              <HeroPhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Ledger Proof Timeline Strip */}
      <LedgerProofStrip />

      {/* Interactive Debt Netting Sandbox */}
      <section id="sandbox" className="bg-surface-raised py-16 border-y border-surface-hairline">
        <div className="max-w-5xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-mono tracking-widest text-brand-emerald">Algorithm Sandbox</span>
            <h2 className="font-sans font-bold text-2xl sm:text-3xl text-ink-primary tracking-tight">
              Minimal Zero-Sum Debt Simplification
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted max-w-xl mx-auto">
              Instead of everyone exchanging small amounts back and forth, greedy graph netting calculates the exact minimal UPI transfers needed.
            </p>
          </div>

          {/* Sandbox Netting Execution Box */}
          <div className="p-6 rounded-2xl bg-surface-inset border border-surface-hairline space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-mono text-ink-muted">
                Current Topology: {sandboxNet ? 'Compressed (3 Net Transfers)' : 'Raw Tangled (6 Pairwise Debts)'}
              </span>

              <div className="flex items-center gap-2">
                {/* Execute / Reset Netting Toggle */}
                <button
                  onClick={() => setSandboxNet(!sandboxNet)}
                  className="px-4 py-2 rounded-xl cta-gradient-btn text-white border border-brand-emerald/30 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-mint"
                >
                  <Zap className="w-3.5 h-3.5 text-white" />
                  <span>{sandboxNet ? 'Show Raw Pairwise Debts' : 'Execute Greedy Netting'}</span>
                </button>

                {/* Settle All Instant CTA */}
                {sandboxNet && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="px-4 py-2 rounded-xl bg-surface-raised border border-brand-emerald/50 text-brand-emerald text-xs font-semibold flex items-center gap-2 hover:bg-brand-emerald/10 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Settle All via UPI</span>
                  </motion.button>
                )}
              </div>
            </div>

            {/* Clean Debt Rows Layout (No Avatars) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(sandboxNet
                ? [
                    { from: 'Priya Patel', to: 'Rohan Sharma', amount: '₹4,850.00' },
                    { from: 'Vikram Mehta', to: 'Rohan Sharma', amount: '₹9,650.00' },
                    { from: 'Arjun Nair', to: 'Sneha Rao', amount: '₹3,200.00' },
                  ]
                : [
                    { from: 'Priya Patel', to: 'Rohan Sharma', amount: '₹3,200.00' },
                    { from: 'Vikram Mehta', to: 'Rohan Sharma', amount: '₹6,400.00' },
                    { from: 'Priya Patel', to: 'Arjun Nair', amount: '₹1,650.00' },
                    { from: 'Vikram Mehta', to: 'Arjun Nair', amount: '₹3,250.00' },
                    { from: 'Sneha Rao', to: 'Rohan Sharma', amount: '₹4,900.00' },
                    { from: 'Arjun Nair', to: 'Sneha Rao', amount: '₹8,100.00' },
                  ]
              ).map((debt, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-surface-raised border border-surface-hairline text-xs space-y-1 hover:border-brand-emerald/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-rose-500">{debt.from}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
                    <span className="font-medium text-brand-emerald">{debt.to}</span>
                  </div>
                  <span className="font-numeric font-bold text-sm text-ink-primary block pt-1">
                    {debt.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — Glassmorphic numbered steps */}
      <HowItWorksSection />

      {/* Feature Showcase Grid + Meaningful Financial Bar Charts */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-mono tracking-widest text-ink-muted">Core Capabilities</span>
          <h2 className="font-sans font-bold text-2xl sm:text-3xl text-ink-primary tracking-tight">
            Engineered for Flawless Group Accountability
          </h2>
        </div>

        {/* Polished Financial Bar Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FinancialBarChart
            title="Squad Category Spend Breakdown"
            subtitle="Actual INR expenditure across trip spending categories"
            items={[
              { label: 'Lodging', value: 24500, formattedValue: '₹24,500' },
              { label: 'Food', value: 18200, formattedValue: '₹18,200' },
              { label: 'Transport', value: 12400, formattedValue: '₹12,400' },
              { label: 'Activities', value: 8900, formattedValue: '₹8,900' },
              { label: 'Logistics', value: 5100, formattedValue: '₹5,100' },
            ]}
          />

          <FinancialBarChart
            title="Squad Member Spend Allocation"
            subtitle="Total amount fronted per participant prior to zero-sum netting"
            items={[
              { label: 'Priya', value: 18500, formattedValue: '₹18,500' },
              { label: 'Rohan', value: 16200, formattedValue: '₹16,200' },
              { label: 'Vikram', value: 14000, formattedValue: '₹14,000' },
              { label: 'Sneha', value: 12800, formattedValue: '₹12,800' },
              { label: 'Arjun', value: 9500, formattedValue: '₹9,500' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Calculator,
              title: '5 Dynamic Split Primitives',
              desc: 'Choose from Equal, Weighted per night, Line-Item, Room-Tier (Suite vs Standard), or Organizer Subsidy.',
            },
            {
              icon: FileCheck,
              title: 'Bill & Receipt Spending Proofs',
              desc: 'Upload high-resolution bill receipts or PDFs directly to any expense. Verify spending before settling.',
            },
            {
              icon: QrCode,
              title: 'Instant UPI Settle QR Codes',
              desc: 'Generate instant Google Pay / PhonePe / Paytm QR codes directly on settlement cards in Indian Rupees (₹).',
            },
            {
              icon: Compass,
              title: 'Master Itinerary Swimlanes',
              desc: 'Day-by-day connected timeline with participant visual encoding—opt out of activities without getting charged.',
            },
            {
              icon: ShieldCheck,
              title: 'Event-Sourced Audit Log',
              desc: 'Immutable append-only event stream ensuring 100% deterministic math.',
            },
            {
              icon: Wallet,
              title: 'Persistent Balance Pill',
              desc: 'Always know your exact net position (Surplus green / Deficit red / Settled) from any view in the app.',
            },
          ].map((f, idx) => {
            const Icon = f.icon;
            return (
              <SpotlightCard
                key={idx}
                className="p-6 space-y-3 bg-surface-raised border border-surface-hairline hover:border-brand-emerald/50 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-surface-inset flex items-center justify-center text-ink-primary border border-surface-hairline">
                  <Icon className="w-4 h-4 text-brand-emerald" />
                </div>
                <h3 className="font-sans font-bold text-base text-ink-primary">{f.title}</h3>
                <p className="text-xs text-ink-secondary leading-relaxed">{f.desc}</p>
              </SpotlightCard>
            );
          })}
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="bg-surface-raised border-t border-surface-hairline py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-sans font-bold text-3xl text-ink-primary tracking-tight">
            Ready to plan your next squad trip?
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted">
            Initialize your custom trip or join an existing trip via 6-digit code.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <LiquidGlassButton
              variant="primary"
              size="lg"
              onClick={onOpenCreateTrip}
              icon={<Plus className="w-4 h-4 stroke-[3]" />}
            >
              Create Custom Trip
            </LiquidGlassButton>
            <LiquidGlassButton
              variant="glass"
              size="lg"
              onClick={onOpenJoinTrip}
              icon={<Key className="w-4 h-4 text-ink-muted" />}
            >
              Join with Invite Code
            </LiquidGlassButton>
          </div>
        </div>
      </section>

      {/* Full Footer */}
      <footer className="border-t border-surface-hairline py-14 px-6 bg-surface-base">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            {/* Brand Column */}
            <div className="space-y-4 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3">
                <LiquidLogo size={32} />
                <div>
                  <span className="font-bold text-sm text-ink-primary block leading-tight">TripSync</span>
                  <span className="text-[10px] text-ink-muted uppercase tracking-wider block font-mono">One Trip. One Ledger. Zero Confusion.</span>
                </div>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed max-w-xs">
                Immutable double-entry group ledger engine for squad trips. Split expenses, compress debts, settle instantly via UPI.
              </p>
            </div>

            {/* Navigate Column */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-brand-emerald block">Navigate</span>
              {[
                { label: 'Home', href: '#' },
                { label: 'Features', href: '#features' },
                { label: 'Algorithm Sandbox', href: '#sandbox' },
              ].map((link, idx) => (
                <a key={idx} href={link.href} className="block text-xs text-ink-muted hover:text-ink-primary transition-colors">
                  {link.label}
                </a>
              ))}
            </div>

            {/* Actions Column */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-brand-emerald block">Actions</span>
              <button onClick={onOpenCreateTrip} className="block text-xs text-ink-muted hover:text-ink-primary transition-colors cursor-pointer bg-transparent border-none p-0 text-left">
                Create Trip
              </button>
              <button onClick={onOpenJoinTrip} className="block text-xs text-ink-muted hover:text-ink-primary transition-colors cursor-pointer bg-transparent border-none p-0 text-left">
                Join Trip
              </button>
              <button onClick={onEnterApp} className="block text-xs text-ink-muted hover:text-ink-primary transition-colors cursor-pointer bg-transparent border-none p-0 text-left">
                Open Dashboard
              </button>
            </div>

            {/* Built With Column */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-brand-emerald block">Built With</span>
              {['Zero-Sum Graph Netting', 'Event-Sourced Ledger', 'UPI QR Settlement', 'Append-Only Audit Log'].map((item, idx) => (
                <span key={idx} className="block text-xs text-ink-muted">{item}</span>
              ))}
            </div>
          </div>

          {/* Divider + Copyright */}
          <div className="pt-6 border-t border-surface-hairline flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-ink-muted font-mono">
              © 2026 TripSync. Deterministic Double-Entry Group Ledger Engine.
            </p>
            <p className="text-[10px] text-ink-muted/60 font-mono">
              One Trip. One Ledger. Zero Confusion.
            </p>
          </div>
        </div>
      </footer>

      {/* Oversized TRIPSYNC Wordmark — closing brand flourish with aurora backdrop */}
      <div className="relative bg-surface-base overflow-hidden py-8 pb-12">
        {/* Aurora ambient glow behind wordmark */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-30%] left-[15%] w-[500px] h-[350px] rounded-full bg-gradient-to-tr from-emerald-600/20 to-emerald-400/15 blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[20%] w-[450px] h-[300px] rounded-full bg-emerald-600/15 blur-[100px]" />
          <LiquidShaderGradient />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 text-center select-none"
        >
          <span
            className="font-sans font-black text-[clamp(3rem,12vw,10rem)] leading-none tracking-tighter bg-gradient-to-r from-emerald-600/60 via-emerald-400/50 to-emerald-600/60 bg-clip-text text-transparent bg-[length:200%_100%] animate-[shimmer_6s_ease-in-out_infinite]"
          >
            TRIPSYNC
          </span>
        </motion.div>
      </div>
    </div>
  );
};
