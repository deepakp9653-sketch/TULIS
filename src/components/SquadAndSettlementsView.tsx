'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Participant, ParticipantNetBalance, SimplifiedDebt, Payment } from '@/lib/types';
import {
  Users,
  UserPlus,
  GitCommit,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  QrCode,
  Zap,
  ShieldCheck,
  Check,
  X,
  Layers,
  Crown,
  Trophy,
  Sliders,
  Mail,
  UserMinus,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { animate, stagger } from 'animejs';
import { UserAvatar } from './UserAvatar';
import { UpiQrModal } from './UpiQrModal';

export interface SquadAndSettlementsViewProps {
  participants: Participant[];
  netBalances: ParticipantNetBalance[];
  simplifiedDebts: SimplifiedDebt[];
  currentUserId: string;
  payments?: Payment[];
  onAddParticipant: (name: string, email: string, isOrganizer: boolean, avatarUrl?: string) => void;
  onToggleStatus: (participantId: string) => void;
  onUpdateParticipantWeight: (
    participantId: string,
    weight: number,
    roomTier: 'suite' | 'standard' | 'economy'
  ) => void;
  onSettleDebt: (fromId: string, toId: string, amount: number) => void;
  onConfirmPaymentReceipt?: (paymentId: string) => void;
  onDisputePayment?: (paymentId: string) => void;
  isSettled: boolean;
  isCrossTripNetting?: boolean;
  onToggleCrossTripNetting?: () => void;
  onOpenReassignDebt?: (settlement: {
    id: string;
    fromParticipantId: string;
    toParticipantId: string;
    amount: number;
  }) => void;
  onOpenExplainBalance?: (participantId: string) => void;
}

export const SquadAndSettlementsView: React.FC<SquadAndSettlementsViewProps> = ({
  participants,
  netBalances,
  simplifiedDebts,
  currentUserId,
  payments = [],
  onAddParticipant,
  onToggleStatus,
  onUpdateParticipantWeight,
  onSettleDebt,
  onConfirmPaymentReceipt,
  onDisputePayment,
  isSettled,
  isCrossTripNetting = false,
  onToggleCrossTripNetting,
  onOpenReassignDebt,
  onOpenExplainBalance,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterPersonal, setFilterPersonal] = useState(false);
  const [selectedUpiDebt, setSelectedUpiDebt] = useState<SimplifiedDebt | null>(null);
  const [editingWeightId, setEditingWeightId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isOrganizer, setIsOrganizer] = useState(false);

  const particlesRef = useRef<HTMLDivElement>(null);

  // Big Banker calculation
  const sortedByPaid = [...netBalances].sort((a, b) => b.totalPaid - a.totalPaid);
  const bigBankerId = sortedByPaid[0]?.participant.id;

  useEffect(() => {
    if (isSettled && particlesRef.current) {
      animate(particlesRef.current.children, {
        translateY: [0, -140],
        translateX: () => (Math.random() - 0.5) * 160,
        opacity: [1, 0],
        scale: [1, 2.2],
        rotate: () => Math.random() * 360,
        delay: stagger(60),
        duration: 2000,
        ease: 'easeOutExpo',
      });
    }
  }, [isSettled]);

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddParticipant(name, email, isOrganizer, avatarUrl.trim() || undefined);
    setName('');
    setEmail('');
    setAvatarUrl('');
    setIsOrganizer(false);
    setShowAddModal(false);
  };

  const displayedDebts = filterPersonal
    ? simplifiedDebts.filter((d) => d.fromId === currentUserId || d.toId === currentUserId)
    : simplifiedDebts;

  const totalOwedInTrip = simplifiedDebts.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="page-container space-y-6">
      {/* 1. UNIFIED COMMAND HEADER */}
      <div className="page-header-split bg-surface-raised p-5 rounded-3xl border border-surface-hairline neu-raised flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-serif-display font-bold text-ink-primary">
              Squad & Settlements
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {participants.length} Travelers • {simplifiedDebts.length} Optimal Paths
            </span>
          </div>
          <p className="text-xs text-ink-secondary">
            Unified squad roster, real-time participant net balances & minimal-flow UPI debt resolution.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onToggleCrossTripNetting && (
            <button
              onClick={onToggleCrossTripNetting}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                isCrossTripNetting
                  ? 'bg-brand-gold/15 text-brand-gold border-brand-gold/40'
                  : 'bg-surface-inset text-ink-secondary hover:text-ink-primary border-surface-hairline'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Cross-Trip Netting: {isCrossTripNetting ? 'ON' : 'OFF'}</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-ink-primary text-surface-base hover:opacity-90 text-xs sm:text-sm font-bold transition shadow-subtle flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Traveler</span>
          </button>
        </div>
      </div>

      {/* 2. SQUAD MEMBERS ROSTER WITH NET BALANCES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-ink-primary">Squad Members & Balance Positions</h3>
            <span className="text-[11px] text-ink-muted">({participants.length} total)</span>
          </div>
          <span className="text-xs text-ink-muted">
            Total Dues to Settle: <strong className="font-numeric text-brand-gold font-bold">₹{totalOwedInTrip.toLocaleString('en-IN')}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {participants.map((p) => {
            const balanceInfo = netBalances.find((b) => b.participant.id === p.id);
            const net = balanceInfo?.netBalance || 0;
            const isBigBanker = p.id === bigBankerId && (balanceInfo?.totalPaid || 0) > 0;
            const isMe = p.id === currentUserId;

            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isMe
                    ? 'bg-surface-raised border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/20'
                    : 'bg-surface-raised border-surface-hairline hover:border-surface-subtle'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <UserAvatar name={p.name} id={p.id} avatarUrl={p.avatarUrl} size="md" />
                      {p.isOrganizer && (
                        <div
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-brand-gold text-surface-base flex items-center justify-center shadow-subtle"
                          title="Trip Organizer"
                        >
                          <Crown className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-ink-primary">{p.name}</span>
                        {isMe && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-500">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-ink-muted block truncate max-w-[150px]">
                        {p.upiId || p.email}
                      </span>
                    </div>
                  </div>

                  {/* Net Balance Status Badge */}
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-ink-muted block">Position</span>
                    <span
                      className={`text-xs font-bold font-numeric block ${
                        net > 0
                          ? 'text-emerald-500'
                          : net < 0
                          ? 'text-rose-400'
                          : 'text-ink-muted'
                      }`}
                    >
                      {net > 0 ? `+₹${net.toLocaleString('en-IN')}` : net < 0 ? `-₹${Math.abs(net).toLocaleString('en-IN')}` : '₹0 Settled'}
                    </span>
                    <span className="text-[10px] text-ink-muted block">
                      {net > 0 ? 'Gets back' : net < 0 ? 'Owes squad' : 'Zero balance'}
                    </span>
                  </div>
                </div>

                {/* Sub-strip with Room Tier, Weight & Actions */}
                <div className="mt-3 pt-2.5 border-t border-surface-hairline/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-surface-inset text-[10px] font-semibold text-ink-secondary capitalize border border-surface-hairline">
                      Tier: {p.roomTier || 'standard'}
                    </span>
                    {isBigBanker && (
                      <span className="px-1.5 py-0.5 rounded bg-brand-gold/15 text-brand-gold text-[10px] font-bold flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Top Payer
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {onOpenExplainBalance && (
                      <button
                        onClick={() => onOpenExplainBalance(p.id)}
                        className="text-[11px] text-ink-secondary hover:text-ink-primary underline cursor-pointer"
                      >
                        Explain
                      </button>
                    )}
                    <button
                      onClick={() => onToggleStatus(p.id)}
                      className={`text-[11px] px-2 py-0.5 rounded cursor-pointer ${
                        p.status === 'active'
                          ? 'text-ink-muted hover:text-rose-400'
                          : 'text-rose-400 bg-rose-500/10 font-bold'
                      }`}
                    >
                      {p.status === 'active' ? 'Active' : 'Paused'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SETTLEMENT GRAPH & RESOLUTION PATHS */}
      <div className="space-y-4 pt-4 border-t border-surface-hairline">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                <GitCommit className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-sm text-ink-primary">
                Minimal Cash-Flow Settlement Graph
              </h3>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">
              Algorithmically reduces complex multi-way squad debts down to the fewest direct UPI payments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterPersonal(!filterPersonal)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                filterPersonal
                  ? 'bg-ink-primary text-surface-base border-ink-primary font-bold'
                  : 'bg-surface-inset text-ink-secondary hover:text-ink-primary border-surface-hairline'
              }`}
            >
              {filterPersonal ? 'Showing My Dues' : 'Filter: My Dues Only'}
            </button>
          </div>
        </div>

        {/* Settlement Path Cards */}
        {displayedDebts.length === 0 ? (
          <div className="p-8 rounded-3xl bg-surface-raised border border-dashed border-surface-hairline text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-ink-primary">All Squad Debts Settled!</h4>
            <p className="text-xs text-ink-secondary max-w-sm mx-auto">
              Everyone is squared away. No pending payments or outstanding balance paths remain.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {displayedDebts.map((debt, index) => {
              const fromPart = participants.find((p) => p.id === debt.fromId);
              const toPart = participants.find((p) => p.id === debt.toId);
              const isPayerMe = debt.fromId === currentUserId;
              const isReceiverMe = debt.toId === currentUserId;

              return (
                <div
                  key={`${debt.fromId}-${debt.toId}-${index}`}
                  className={`p-4 rounded-2xl bg-surface-raised border transition-all space-y-3 ${
                    isPayerMe
                      ? 'border-brand-gold/40 shadow-sm'
                      : isReceiverMe
                      ? 'border-emerald-500/40 shadow-sm'
                      : 'border-surface-hairline'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-inset text-ink-muted border border-surface-hairline">
                        Path #{index + 1}
                      </span>
                      {isPayerMe && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-gold/15 text-brand-gold">
                          You Pay
                        </span>
                      )}
                      {isReceiverMe && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500">
                          You Receive
                        </span>
                      )}
                    </div>

                    <span className="font-numeric font-bold text-base text-emerald-500">
                      ₹{debt.amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Flow Direction Indicator */}
                  <div className="p-2.5 rounded-xl bg-surface-base/80 border border-surface-hairline flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {fromPart && <UserAvatar name={fromPart.name} id={fromPart.id} avatarUrl={fromPart.avatarUrl} size="sm" />}
                      <div>
                        <span className="font-bold text-ink-primary block">{fromPart?.name}</span>
                        <span className="text-[10px] text-ink-muted">Debtor</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-ink-muted px-2">
                      <span className="text-[10px] font-bold">PAYS</span>
                      <ArrowRight className="w-3.5 h-3.5 text-brand-gold" />
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <div>
                        <span className="font-bold text-ink-primary block">{toPart?.name}</span>
                        <span className="text-[10px] text-ink-muted">{toPart?.upiId || 'Receiver'}</span>
                      </div>
                      {toPart && <UserAvatar name={toPart.name} id={toPart.id} avatarUrl={toPart.avatarUrl} size="sm" />}
                    </div>
                  </div>

                  {/* Direct Settle Actions */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => setSelectedUpiDebt(debt)}
                      className="px-3 py-1.5 rounded-xl bg-surface-inset hover:bg-surface-elevated text-ink-secondary hover:text-ink-primary text-xs font-semibold border border-surface-hairline flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <QrCode className="w-3.5 h-3.5 text-brand-gold" />
                      <span>Scan UPI QR</span>
                    </button>

                    <button
                      onClick={() => onSettleDebt(debt.fromId, debt.toId, debt.amount)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-surface-base font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Mark Settled</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* UPI QR MODAL */}
      {selectedUpiDebt && (
        <UpiQrModal
          isOpen={Boolean(selectedUpiDebt)}
          onClose={() => setSelectedUpiDebt(null)}
          fromName={participants.find((p) => p.id === selectedUpiDebt.fromId)?.name || 'Traveler'}
          toName={participants.find((p) => p.id === selectedUpiDebt.toId)?.name || 'Recipient'}
          amount={selectedUpiDebt.amount}
          payeeUpiId={participants.find((p) => p.id === selectedUpiDebt.toId)?.upiId || 'payee@upi'}
          payeeQrCodeUrl={selectedUpiDebt.payeeQrCodeUrl}
          onConfirmPayment={() => {
            if (selectedUpiDebt) {
              onSettleDebt(selectedUpiDebt.fromId, selectedUpiDebt.toId, selectedUpiDebt.amount);
              setSelectedUpiDebt(null);
            }
          }}
        />
      )}

      {/* ADD PARTICIPANT MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-surface-raised border border-surface-hairline rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-surface-hairline">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-base text-ink-primary">Add Squad Traveler</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-ink-muted hover:text-ink-primary cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitAdd} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-ink-secondary block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Sen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-base border border-surface-hairline text-ink-primary focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink-secondary block mb-1">Email or UPI ID</label>
                  <input
                    type="text"
                    placeholder="e.g. maya@tulis.in or maya@okaxis"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-base border border-surface-hairline text-ink-primary focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isOrgCheck"
                    checked={isOrganizer}
                    onChange={(e) => setIsOrganizer(e.target.checked)}
                    className="rounded border-surface-hairline text-brand-gold focus:ring-0"
                  />
                  <label htmlFor="isOrgCheck" className="text-ink-secondary cursor-pointer">
                    Grant Trip Organizer privileges
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-surface-inset text-ink-secondary text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-ink-primary text-surface-base font-bold text-xs cursor-pointer shadow-subtle"
                  >
                    Add to Squad
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
