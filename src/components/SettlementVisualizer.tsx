'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Participant, ParticipantNetBalance, SimplifiedDebt, Payment } from '@/lib/types';
import { GitCommit, Sparkles, ArrowRight, CheckCircle2, QrCode, User, Zap, ShieldCheck, AlertCircle, Check, X, ArrowRightLeft, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { animate, stagger } from 'animejs';
import { UpiQrModal } from './UpiQrModal';
import { UserAvatar } from './UserAvatar';

interface SettlementVisualizerProps {
  participants: Participant[];
  netBalances: ParticipantNetBalance[];
  simplifiedDebts: SimplifiedDebt[];
  currentUserId: string;
  payments?: Payment[];
  onSettleDebt: (fromId: string, toId: string, amount: number) => void;
  onConfirmPaymentReceipt?: (paymentId: string) => void;
  onDisputePayment?: (paymentId: string) => void;
  isSettled: boolean;
  isCrossTripNetting?: boolean;
  onToggleCrossTripNetting?: () => void;
  onOpenReassignDebt?: (settlement: { id: string; fromParticipantId: string; toParticipantId: string; amount: number }) => void;
}

export const SettlementVisualizer: React.FC<SettlementVisualizerProps> = ({
  participants,
  netBalances,
  simplifiedDebts,
  currentUserId,
  payments = [],
  onSettleDebt,
  onConfirmPaymentReceipt,
  onDisputePayment,
  isSettled,
  isCrossTripNetting = false,
  onToggleCrossTripNetting,
  onOpenReassignDebt,
}) => {
  const [isSimplified, setIsSimplified] = useState<boolean>(true);
  const [filterPersonal, setFilterPersonal] = useState<boolean>(false);
  const [selectedUpiDebt, setSelectedUpiDebt] = useState<SimplifiedDebt | null>(null);

  const particlesRef = useRef<HTMLDivElement>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSettled && particlesRef.current) {
      // Anime.js v4 timeline celebration animation
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

  const handleTriggerSimplify = () => {
    setIsSimplified((prev) => !prev);
    if (graphContainerRef.current) {
      const nodes = graphContainerRef.current.querySelectorAll('.debt-node');
      animate(nodes, {
        scale: [1, 1.15, 1],
        rotate: [0, 6, -6, 0],
        duration: 700,
        ease: 'easeInOutElastic(1, .5)',
        delay: stagger(70),
      });
    }
  };

  const displayedDebts = filterPersonal
    ? simplifiedDebts.filter((d) => d.fromId === currentUserId || d.toId === currentUserId)
    : simplifiedDebts;

  return (
    <div className="page-container space-y-6">
      {/* Header Banner */}
      <div className="page-header-split bg-surface-raised p-5 rounded-xl border border-surface-hairline neu-raised">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-sans font-semibold text-ink-primary flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-brand-emerald" /> Ledger Settlement Graph
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30">
              Zero-Sum Verified
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Automated Debt Simplification engine with dynamic UPI QR Code instant settlement.
          </p>
        </div>

        {/* Control Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onToggleCrossTripNetting && (
            <button
              onClick={onToggleCrossTripNetting}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                isCrossTripNetting
                  ? 'cta-gradient-btn text-white font-semibold shadow-mint'
                  : 'bg-surface-inset text-ink-secondary border-surface-hairline hover:text-ink-primary'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isCrossTripNetting ? 'Multi-Trip Netting Active' : 'Consolidate Squad Trips'}</span>
            </button>
          )}

          <button
            onClick={() => setFilterPersonal(!filterPersonal)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
              filterPersonal
                ? 'cta-gradient-btn text-white font-semibold shadow-mint'
                : 'bg-surface-inset text-ink-secondary border-surface-hairline hover:text-ink-primary'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{filterPersonal ? 'Showing My Debts' : 'Filter Personal Debts'}</span>
          </button>

          <button
            onClick={handleTriggerSimplify}
            className="px-3.5 py-1.5 rounded-lg bg-brand-emerald/15 hover:bg-brand-emerald/25 text-brand-emerald border border-brand-emerald/30 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isSimplified ? 'Raw Debts' : 'Simplify Paths'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Debt Graph Container */}
      <div
        ref={graphContainerRef}
        className="relative bg-surface-inset border border-surface-hairline p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl overflow-hidden min-h-[560px] flex flex-col justify-between backdrop-blur-xl"
      >
        {/* Dot Grid Matrix Background */}
        <div className="absolute inset-0 z-0 w-full h-full bg-[radial-gradient(rgba(16,185,129,0.2)_1px,transparent_1px)] [background-size:22px_22px] pointer-events-none opacity-60" />

        {/* Ambient Sage Halo Glow */}
        <div className="absolute inset-0 m-auto w-80 h-80 rounded-full bg-brand-emerald/10 blur-3xl pointer-events-none" />

        {/* Concentric Orbit Rings */}
        <div className="absolute inset-0 m-auto w-[360px] h-[360px] rounded-full border border-brand-emerald/20 pointer-events-none" />
        <div className="absolute inset-0 m-auto w-[500px] h-[500px] rounded-full border border-brand-emerald/10 pointer-events-none" />

        {/* Celebration Particles Overlay */}
        {isSettled && (
          <div
            ref={particlesRef}
            className="absolute inset-0 pointer-events-none flex items-center justify-center gap-6 overflow-hidden z-20"
          >
            {[...Array(16)].map((_, idx) => (
              <div
                key={idx}
                className="w-3.5 h-3.5 rounded-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400"
              />
            ))}
          </div>
        )}

        {/* Top Status Indicator */}
        <div className="relative z-10 flex items-center justify-between text-xs border-b border-surface-hairline pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald animate-pulse shadow-sm" />
            <span className="font-semibold text-ink-primary">
              {isSimplified ? 'Compressed Graph (Greedy Netting Active)' : 'Raw Pairwise Debts Network'}
            </span>
          </div>

          <span className="font-numeric text-ink-muted text-xs">
            {simplifiedDebts.length} Optimal Transactions Remaining (₹ INR)
          </span>
        </div>

        {/* Circular Interactive Node Layout */}
        <div className="relative z-10 my-4 sm:my-8 py-6 sm:py-12 flex items-center justify-center min-h-[340px] sm:min-h-[440px] w-full overflow-hidden">
          <div className="relative w-[520px] h-[390px] shrink-0 flex items-center justify-center scale-[0.62] xs:scale-[0.78] sm:scale-100 origin-center transition-transform">
            {/* Subtle Vector Flow Lines from Center to Nodes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="-300 -220 600 440">
              {netBalances.map((nb, idx) => {
                const totalNodes = netBalances.length;
                const angle = (idx / totalNodes) * 2 * Math.PI - Math.PI / 2;
                const radius = 175;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const isCreditor = nb.netBalance > 0;
                return (
                  <g key={`line-${nb.participant.id}`}>
                    <line
                      x1={0}
                      y1={0}
                      x2={x}
                      y2={y}
                      stroke={isCreditor ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.3)'}
                      strokeWidth="1.5"
                      strokeDasharray={isCreditor ? 'none' : '4 4'}
                    />
                    <circle
                      cx={x * 0.45}
                      cy={y * 0.45}
                      r="2.5"
                      fill={isCreditor ? '#10B981' : '#F43F5E'}
                      opacity="0.8"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Central Pulsing Anchor */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="absolute w-36 h-36 rounded-full border border-brand-emerald/30 animate-pulse pointer-events-none" />
              <div className="w-28 h-28 rounded-full bg-surface-raised border border-brand-emerald/50 flex flex-col items-center justify-center text-center p-3 shadow-2xl backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-brand-emerald mb-1" />
                <span className="text-[9px] uppercase font-bold text-ink-muted tracking-wider">Settlement Hub</span>
                <span className="font-numeric font-extrabold text-xs text-brand-emerald mt-0.5">
                  ₹{netBalances.reduce((acc, n) => acc + (n.netBalance > 0 ? n.netBalance : 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[8px] font-mono text-ink-muted">Total Volume</span>
              </div>
            </div>

            {/* Participant Nodes Positioned in Ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {netBalances.map((nb, idx) => {
              const totalNodes = netBalances.length;
              const angle = (idx / totalNodes) * 2 * Math.PI - Math.PI / 2;
              const radius = 175;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              const isUser = nb.participant.id === currentUserId;

              return (
                <motion.div
                  key={nb.participant.id}
                  layout
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  className={`debt-node pointer-events-auto absolute px-3.5 py-2.5 rounded-2xl bg-surface-raised border flex items-center gap-3 shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-md ${
                    isUser
                      ? 'border-brand-emerald ring-2 ring-brand-emerald/40 z-20 scale-105 shadow-brand-emerald/20'
                      : 'border-surface-hairline hover:border-brand-emerald/40 z-10'
                  }`}
                >
                  <div className="relative shrink-0">
                    <UserAvatar
                      name={nb.participant.name}
                      id={nb.participant.id}
                      avatarUrl={nb.participant.avatarUrl}
                      size="sm"
                    />
                    {nb.participant.isOrganizer && (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-brand-emerald border-2 border-surface-base flex items-center justify-center text-[8px] text-white font-bold">
                        ★
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink-primary truncate max-w-[120px]">{nb.participant.name}</p>
                    <div className="mt-0.5">
                      <span
                        className={`font-numeric text-[11px] font-bold px-2 py-0.5 rounded-full border inline-block ${
                          nb.netBalance > 0
                            ? 'bg-brand-emerald/15 text-brand-emerald border-brand-emerald/30'
                            : nb.netBalance < 0
                            ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                            : 'bg-surface-inset text-ink-muted border-surface-hairline'
                        }`}
                      >
                        {nb.netBalance > 0 ? `+₹${nb.netBalance.toFixed(2)}` : nb.netBalance < 0 ? `-₹${Math.abs(nb.netBalance).toFixed(2)}` : '₹0.00'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

        {/* Two-Sided Verification Alerts */}
        {payments.some((p) => p.status === 'pending') && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-emerald" />
              <h5 className="font-bold text-xs uppercase tracking-wider text-ink-primary">
                Two-Sided Settlement Verification Required
              </h5>
            </div>

            <div className="space-y-2">
              {payments
                .filter((p) => p.status === 'pending')
                .map((p) => {
                  const payer = participants.find((part) => part.id === p.payerId)?.name || 'Member';
                  const payee = participants.find((part) => part.id === p.payeeId)?.name || 'Member';
                  const isPayee = p.payeeId === currentUserId;
                  const isPayer = p.payerId === currentUserId;

                  return (
                    <div
                      key={p.id}
                      className="p-3 bg-surface-raised/80 border border-surface-hairline rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-ink-primary">
                          <span>{payer}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-brand-emerald" />
                          <span>{payee}</span>
                          <span className="font-numeric font-bold text-brand-emerald ml-1">
                            ₹{p.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-muted mt-0.5">
                          {isPayee
                            ? `${payer} reported sending you ₹${p.amount} via UPI. Please confirm receipt.`
                            : isPayer
                            ? `You marked ₹${p.amount} as paid to ${payee}. Awaiting their verification.`
                            : `Payment pending confirmation between ${payer} and ${payee}.`}
                        </p>
                      </div>

                      {isPayee && onConfirmPaymentReceipt && onDisputePayment && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => onDisputePayment(p.id)}
                            className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" /> Dispute
                          </button>
                          <button
                            onClick={() => onConfirmPaymentReceipt(p.id)}
                            className="px-3 py-1.5 rounded-lg cta-gradient-btn text-white hover:brightness-110 text-xs font-bold transition flex items-center gap-1 shadow-mint cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Confirm Received
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Bottom Action Cards: Minimal Settlement Execution Paths */}
        <div className="relative z-10 pt-4 border-t border-surface-hairline space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-ink-primary">Simplified Settlement Execution Paths (₹ INR)</span>
            <span className="text-brand-emerald font-numeric">Click "UPI Settle" for instant QR Code</span>
          </h4>

          {displayedDebts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedDebts.map((debt, idx) => {
                const payee = participants.find((p) => p.id === debt.toId);
                const upiId = payee?.upiId || `${payee?.name.toLowerCase().replace(/\s+/g, '')}@upi`;

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-surface-raised border border-surface-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all hover:border-brand-emerald/50 backdrop-blur-md shadow-lg"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-rose-500">{debt.fromName}</span>
                      <ArrowRight className="w-4 h-4 text-ink-muted" />
                      <span className="font-semibold text-brand-emerald">{debt.toName}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                      <span className="font-numeric font-bold text-sm text-ink-primary mr-1">
                        ₹{debt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      {onOpenReassignDebt && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenReassignDebt({
                              id: `settle-${debt.fromId}-${debt.toId}`,
                              fromParticipantId: debt.fromId,
                              toParticipantId: debt.toId,
                              amount: debt.amount,
                            })
                          }
                          title="Transfer or reassign this debt obligation"
                          className="px-2.5 py-1.5 rounded-xl border border-surface-hairline hover:border-brand-emerald text-ink-muted hover:text-brand-emerald text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Reassign</span>
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedUpiDebt({ ...debt, payeeUpiId: upiId })}
                        className="px-3.5 py-1.5 rounded-xl cta-gradient-btn text-white text-xs font-semibold transition-all shadow-mint flex items-center gap-1.5 cursor-pointer hover:brightness-110 animate-pulse"
                      >
                        <QrCode className="w-3.5 h-3.5" /> UPI Settle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center bg-brand-emerald/15 rounded-2xl border border-brand-emerald/30 space-y-1">
              <CheckCircle2 className="w-8 h-8 text-brand-emerald mx-auto" />
              <p className="font-serif-display font-bold text-base text-brand-emerald">
                All Debts Fully Settled!
              </p>
              <p className="text-xs text-ink-muted">
                The TripSync ledger has reached zero net balance. No pending transactions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* UPI QR Code Settlement Modal */}
      {selectedUpiDebt && (
        <UpiQrModal
          isOpen={!!selectedUpiDebt}
          onClose={() => setSelectedUpiDebt(null)}
          fromName={selectedUpiDebt.fromName}
          toName={selectedUpiDebt.toName}
          amount={selectedUpiDebt.amount}
          payeeUpiId={selectedUpiDebt.payeeUpiId || 'payee@upi'}
          onConfirmPayment={() => onSettleDebt(selectedUpiDebt.fromId, selectedUpiDebt.toId, selectedUpiDebt.amount)}
        />
      )}
    </div>
  );
};
