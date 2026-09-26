'use client';

import React, { useState } from 'react';
import {
  Trip,
  Participant,
  ParticipantNetBalance,
  SimplifiedDebt,
  TabType,
} from '@/lib/types';
import { LiquidLogo } from './LiquidLogo';
import { LiquidGlassButton } from './LiquidGlassButton';
import { CountUpMoney } from './CountUpMoney';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Receipt,
  GitCommit,
  Activity,
  Plus,
  Share2,
  ShieldCheck,
  Wallet,
  ChevronDown,
  Sparkles,
  Zap,
  Key,
  Menu,
  X,
  Compass,
  Building2,
  CheckCircle2,
  Wifi,
  WifiOff,
  LogOut,
  MoreHorizontal,
  Sun,
  Moon,
  FolderHeart,
  MessageSquare,
  Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from './UserAvatar';
import { MOTION_TOKENS } from '@/lib/motion';

interface DashboardShellProps {
  children: React.ReactNode;
  trip: Trip;
  participants: Participant[];
  currentUserId: string;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  netBalances: ParticipantNetBalance[];
  simplifiedDebts: SimplifiedDebt[];
  eventCount: number;
  expensesCount: number;
  bookingsCount: number;
  isOffline: boolean;
  onToggleOffline: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenTripSwitcher: () => void;
  onOpenAccountSwitcher: () => void;
  onOpenShareTrip: () => void;
  onOpenAddExpense: () => void;
  onOpenAddBooking: () => void;
  onOpenChaosDemo?: () => void;
  onOpenWhatIf?: () => void;
  onOpenRoomOptimizer?: () => void;
  onOpenSettlementReport?: () => void;
  onOpenExplainBalance?: (participantId: string) => void;
  onOpenMyTrips?: () => void;
  onOpenAuth?: () => void;
  currentUserSession?: any;
  onGoToLanding?: () => void;
  onOpenScanReceipt?: () => void;
  onOpenCorporateOrg?: () => void;
  onOpenGogoPlanner?: () => void;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  trip,
  participants,
  currentUserId,
  activeTab,
  onTabChange,
  netBalances,
  simplifiedDebts,
  eventCount,
  expensesCount,
  bookingsCount,
  isOffline,
  onToggleOffline,
  theme = 'dark',
  onToggleTheme,
  onOpenTripSwitcher,
  onOpenAccountSwitcher,
  onOpenShareTrip,
  onOpenAddExpense,
  onOpenAddBooking,
  onOpenChaosDemo,
  onOpenWhatIf,
  onOpenRoomOptimizer,
  onOpenSettlementReport,
  onOpenExplainBalance,
  onOpenMyTrips,
  onOpenAuth,
  currentUserSession,
  onGoToLanding,
  onOpenScanReceipt,
  onOpenCorporateOrg,
  onOpenGogoPlanner,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentUser = participants.find((p) => p.id === currentUserId) || participants[0];
  const userBalance = netBalances.find((b) => b.participant.id === currentUserId);
  const netAmount = userBalance ? userBalance.netBalance : 0;

  // Normalize legacy tab ids to consolidated views
  const normalizedActiveTab: TabType =
    activeTab === 'expenses' || activeTab === 'itinerary'
      ? 'plan-ledger'
      : activeTab === 'participants' || activeTab === 'settlement'
      ? 'squad-settlements'
      : activeTab;

  interface NavItem {
    id: TabType;
    label: string;
    icon: any;
    count?: number;
    badge?: string;
  }

  const navItems: NavItem[] = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
    {
      id: 'plan-ledger' as TabType,
      label: 'Plan & Ledger',
      icon: Calendar,
      count: bookingsCount + expensesCount,
    },
    {
      id: 'squad-settlements' as TabType,
      label: 'Squad & Settlements',
      icon: Users,
      count: participants.length,
    },
    { id: 'activity' as TabType, label: 'Audit Trail', icon: Activity, count: eventCount },
  ];

  const showDevTools = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen ambient-canvas text-ink-primary p-2 sm:p-4 lg:p-6 flex flex-col font-sans antialiased selection:bg-brand-emerald/20">
      {/* FRAMED WORKSPACE CONTAINER */}
      <div className="framed-workspace rounded-[24px] lg:rounded-[32px] overflow-hidden min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-3rem)] flex flex-1 w-full relative">
        {/* 1. LEFT COMMAND SIDEBAR RAIL (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-surface-hairline bg-surface-base/90 backdrop-blur-xl shrink-0 h-auto sticky top-0 z-40 justify-between">
          <div className="flex flex-col h-full overflow-y-auto scrollbar-none p-4 space-y-5">
            {/* Top Brand Header */}
            <div className="space-y-3 pb-3 border-b border-surface-hairline">
              <div className="flex items-center justify-between">
                <button
                  onClick={onGoToLanding}
                  title="Tulis Home"
                  className="flex items-center gap-2.5 text-left group cursor-pointer"
                >
                  <LiquidLogo size={30} />
                  <div>
                    <span className="font-bold text-sm text-ink-primary tracking-tight block leading-tight group-hover:text-brand-emerald transition-colors">
                      Tulis
                    </span>
                    <span className="text-[10px] font-mono text-ink-muted tracking-wider block">
                      Smart Expense Engine
                    </span>
                  </div>
                </button>

                {/* Network Status Toggle */}
                <button
                  onClick={onToggleOffline}
                  title={isOffline ? 'Offline Outbox Active' : 'Connected to Live Cloud'}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isOffline
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-500'
                      : 'bg-surface-raised border-surface-hairline text-brand-emerald'
                  }`}
                >
                  {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Active Workspace Selector Dropdown Trigger */}
              <button
                onClick={onOpenTripSwitcher}
                className="w-full p-2.5 rounded-xl bg-surface-raised border border-surface-hairline hover:border-brand-emerald/50 transition-all flex items-center justify-between text-left group cursor-pointer shadow-subtle"
              >
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] uppercase font-mono text-ink-muted block tracking-wider">
                    Active Workspace
                  </span>
                  <span className="text-xs font-bold text-ink-primary truncate block">
                    {trip.title}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-surface-inset text-brand-emerald border border-surface-hairline">
                    {trip.inviteCode || 'GOA2026'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink-primary transition-colors" />
                </div>
              </button>

              {/* My Cloud Trips Quick Launcher */}
              {onOpenMyTrips && (
                <button
                  onClick={onOpenMyTrips}
                  className="w-full px-3 py-1.5 rounded-xl bg-surface-inset hover:bg-surface-raised border border-surface-hairline text-xs font-medium text-ink-secondary hover:text-ink-primary flex items-center justify-between transition-all cursor-pointer group"
                  title="Manage personal cloud trips"
                >
                  <div className="flex items-center gap-2">
                    <FolderHeart className="w-3.5 h-3.5 text-brand-emerald" />
                    <span>My Trips</span>
                  </div>
                  {currentUserSession && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-brand-emerald/15 text-brand-emerald">
                      {currentUserSession.name?.split(' ')[0] || 'Cloud'}
                    </span>
                  )}
                </button>
              )}

              {/* Intelligent Supertools */}
              {onOpenScanReceipt && (
                <button
                  onClick={onOpenScanReceipt}
                  className="w-full px-3 py-2 rounded-xl bg-surface-inset hover:bg-surface-raised border border-surface-hairline text-xs font-semibold text-ink-secondary hover:text-brand-emerald flex items-center justify-center gap-2 transition-all cursor-pointer shadow-subtle"
                  title="Scan receipt with Groq Vision OCR"
                >
                  <Camera className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                  <span>Scan Bill Receipt</span>
                </button>
              )}
            </div>

            {/* Navigation Links with Sliding Active Pill */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-ink-muted px-2.5 pb-1 block">
                Workspace Views
              </span>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = normalizedActiveTab === item.id;

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    whileHover={{ x: 2 }}
                    transition={{ duration: MOTION_TOKENS.duration.fast }}
                    className={`w-full relative px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer select-none group ${
                      isActive ? 'text-ink-primary font-semibold' : 'text-ink-secondary hover:text-ink-primary'
                    }`}
                  >
                    {/* Motion Active Pill Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebarNav"
                        className="absolute inset-0 rounded-xl bg-surface-raised border border-surface-hairline shadow-subtle"
                        transition={MOTION_TOKENS.spring}
                      />
                    )}

                    <div className="relative z-10 flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-all ${
                          isActive
                            ? 'text-brand-emerald scale-110'
                            : 'text-ink-muted group-hover:text-ink-primary'
                        }`}
                      />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </div>

                    <div className="relative z-10 flex items-center gap-1.5">
                      {item.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30 font-semibold">
                          {item.badge}
                        </span>
                      )}

                      {item.count !== undefined && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-inset text-ink-muted border border-surface-hairline font-medium">
                          {item.count}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Precision Tools & Simulations */}
            <div className="space-y-1 pt-2 border-t border-surface-hairline">
              <span className="text-[10px] font-mono uppercase tracking-widest text-ink-muted px-2.5 pb-1 block">
                Intelligence & Tools
              </span>

              {onOpenWhatIf && (
                <button
                  onClick={onOpenWhatIf}
                  className="w-full px-3 py-1.5 rounded-lg text-xs text-ink-secondary hover:text-ink-primary hover:bg-surface-raised/60 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-brand-emerald" />
                  <span>What-If Simulator</span>
                </button>
              )}
            </div>

            {/* Single Primary Action Entry Point */}
            <div className="pt-2">
              <LiquidGlassButton
                variant="primary"
                size="sm"
                onClick={onOpenAddExpense}
                icon={<Plus className="w-3.5 h-3.5 stroke-[3]" />}
                className="w-full justify-center"
              >
                Log Expense
              </LiquidGlassButton>
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="p-3 border-t border-surface-hairline bg-surface-base/40 space-y-2">
            {!currentUserSession && onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="w-full p-2 rounded-xl bg-brand-emerald/15 hover:bg-brand-emerald/25 border border-brand-emerald/30 text-xs font-bold text-brand-emerald flex items-center justify-center gap-2 transition-all cursor-pointer shadow-subtle"
                title="Sign in with Email OTP via Resend"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verify with Email OTP</span>
              </button>
            )}

            <button
              onClick={onOpenAccountSwitcher}
              className="w-full p-2 rounded-xl bg-surface-raised border border-surface-hairline hover:border-brand-emerald/50 transition-all flex items-center justify-between text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <UserAvatar
                  name={currentUserSession ? currentUserSession.name : currentUser?.name}
                  id={currentUserSession ? currentUserSession.id : currentUser?.id}
                  avatarUrl={currentUserSession ? currentUserSession.avatar : currentUser?.avatarUrl}
                  size="sm"
                  className="shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-ink-primary truncate block">
                      {currentUserSession ? currentUserSession.name : currentUser?.name}
                    </span>
                    {currentUserSession && (
                      <span title="Email OTP Verified">
                        <ShieldCheck className="w-3 h-3 text-brand-emerald shrink-0" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-ink-muted block truncate font-mono">
                    {currentUserSession ? currentUserSession.email : 'Switch Account'}
                  </span>
                </div>
              </div>

              <div className="p-1 rounded-md bg-surface-inset text-ink-muted group-hover:text-ink-primary transition-colors shrink-0">
                <Key className="w-3 h-3" />
              </div>
            </button>
          </div>
        </aside>

        {/* 2. MAIN APPLICATION WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Command & Telemetry Bar */}
          <header className="sticky top-0 z-30 bg-surface-base/85 backdrop-blur-xl border-b border-surface-hairline px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-surface-raised border border-surface-hairline text-ink-primary cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-ink-muted uppercase hidden sm:inline-block">
                  {trip.destination}
                </span>
                <span className="text-ink-muted text-xs hidden sm:inline-block">•</span>
                <span className="text-sm font-bold text-ink-primary capitalize">
                  {activeTab.replace('-', ' ')}
                </span>
              </div>


            </div>

            {/* Right Telemetry: Single Balance, Single Theme Toggle, Single Log Out */}
            <div className="flex items-center gap-2.5">
              {/* Personal Balance Chip with CountUp animation */}
              <motion.div
                onClick={() => onOpenExplainBalance && onOpenExplainBalance(currentUserId)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 cursor-pointer transition-all shadow-subtle ${
                  netAmount > 0
                    ? 'bg-brand-emerald/15 border-brand-emerald/30 text-brand-emerald'
                    : netAmount < 0
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-500'
                    : 'bg-surface-raised border-surface-hairline text-ink-muted hover:text-ink-primary'
                }`}
                title="Click to view full balance breakdown"
              >
                <Wallet className="w-3.5 h-3.5" />
                <CountUpMoney value={netAmount} prefix="₹" className="font-bold text-xs" />
                <span className="text-[10px] font-mono uppercase opacity-85 hidden sm:inline">
                  {netAmount > 0 ? 'Surplus' : netAmount < 0 ? 'Payable' : 'Settled'}
                </span>
              </motion.div>

              {/* Single Theme Toggle with 250ms rotate/morph icon */}
              {onToggleTheme && (
                <motion.button
                  onClick={onToggleTheme}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  className="p-2 rounded-xl border border-surface-hairline bg-surface-raised text-ink-primary hover:bg-surface-overlay transition-colors duration-250 cursor-pointer flex items-center justify-center"
                >
                  <motion.div
                    key={theme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: MOTION_TOKENS.duration.base }}
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-indigo-500" />
                    )}
                  </motion.div>
                </motion.button>
              )}

              {/* Authenticated User Status or OTP Trigger */}
              {currentUserSession ? (
                <div
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-emerald/10 border border-brand-emerald/25 text-xs font-semibold text-brand-emerald"
                  title={`Authenticated as ${currentUserSession.email} via Resend OTP / Google`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px]">{currentUserSession.name?.split(' ')[0]}</span>
                </div>
              ) : onOpenAuth ? (
                <button
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-emerald text-white hover:bg-brand-emerald/90 text-xs font-bold transition-all shadow-subtle cursor-pointer"
                  title="Verify identity with 6-digit Email OTP via Resend"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sign In with OTP</span>
                </button>
              ) : null}

              {/* My Trips Cloud Switcher Button */}
              {onOpenMyTrips && (
                <button
                  onClick={onOpenMyTrips}
                  title="View your cloud trips"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-raised hover:bg-surface-overlay border border-surface-hairline text-xs font-semibold text-ink-primary transition-colors cursor-pointer"
                >
                  <FolderHeart className="w-3.5 h-3.5 text-brand-emerald" />
                  <span>My Trips</span>
                </button>
              )}

              {/* Share Trip Button */}
              <LiquidGlassButton
                variant="glass"
                size="sm"
                onClick={onOpenShareTrip}
                icon={<Share2 className="w-3.5 h-3.5 text-ink-muted" />}
              >
                <span className="hidden sm:inline">Share</span>
              </LiquidGlassButton>

              {/* Single Clear Log Out Button */}
              {onGoToLanding && (
                <button
                  onClick={onGoToLanding}
                  title="Log Out to Homepage"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-raised hover:bg-rose-500/15 border border-surface-hairline hover:border-rose-500/30 text-xs font-semibold text-rose-500 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              )}
            </div>
          </header>

          {/* Mobile Drawer */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={MOTION_TOKENS.spring}
                className="lg:hidden bg-surface-overlay border-b border-surface-hairline px-4 py-4 space-y-4 z-40 max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-3 border-b border-surface-hairline">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar
                      name={currentUser?.name}
                      id={currentUser?.id}
                      avatarUrl={currentUser?.avatarUrl}
                      size="sm"
                    />
                    <div>
                      <span className="text-xs font-bold text-ink-primary block">{currentUser?.name}</span>
                      <span className="text-[10px] text-ink-muted font-mono">{trip.title} ({trip.inviteCode})</span>
                    </div>
                  </div>
                </div>

                {/* Mobile My Cloud Trips Trigger */}
                {onOpenMyTrips && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenMyTrips();
                    }}
                    className="w-full p-2.5 rounded-xl bg-surface-raised border border-surface-hairline text-xs font-semibold text-ink-primary flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FolderHeart className="w-4 h-4 text-brand-emerald" />
                      <span>My Cloud Trips</span>
                    </div>
                    {currentUserSession && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-emerald/15 text-brand-emerald">
                        {currentUserSession.name?.split(' ')[0]}
                      </span>
                    )}
                  </button>
                )}

                {/* Mobile Navigation Tabs Grid */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-ink-muted block px-1">
                    Workspace Sections
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {navItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onTabChange(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`p-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                          normalizedActiveTab === item.id
                            ? 'bg-brand-emerald text-white font-bold shadow-subtle'
                            : 'bg-surface-inset text-ink-secondary hover:text-ink-primary border border-surface-hairline'
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.count !== undefined && <span className="font-mono text-[10px] opacity-80">{item.count}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Canvas Scroll Area with Tab Crossfade & 8px Slide */}
          <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6 pb-24 lg:pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={normalizedActiveTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: MOTION_TOKENS.duration.fast, ease: MOTION_TOKENS.easing.easeOut }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Mobile Bottom Navigation Bar */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-overlay/95 backdrop-blur-xl border-t border-surface-hairline px-3 py-2 flex items-center justify-around shadow-2xl">
            <button
              onClick={() => onTabChange('overview')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
                normalizedActiveTab === 'overview' ? 'text-brand-emerald font-bold' : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-[10px]">Overview</span>
            </button>

            <button
              onClick={() => onTabChange('plan-ledger')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
                normalizedActiveTab === 'plan-ledger' ? 'text-brand-emerald font-bold' : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="text-[10px]">Plan & Ledger</span>
            </button>

            {/* Quick Log Button */}
            <button
              onClick={onOpenAddExpense}
              className="p-3 -mt-5 rounded-full bg-brand-emerald text-white font-bold shadow-lg shadow-brand-emerald/40 hover:brightness-110 transition-transform active:scale-95 cursor-pointer flex items-center justify-center border-2 border-surface-base"
              title="Log New Expense"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
            </button>

            <button
              onClick={() => onTabChange('squad-settlements')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
                normalizedActiveTab === 'squad-settlements' ? 'text-brand-emerald font-bold' : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-[10px]">Squad & Dues</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
                isMobileMenuOpen ? 'text-brand-emerald font-bold' : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              <MoreHorizontal className="w-4 h-4" />
              <span className="text-[10px]">More</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
