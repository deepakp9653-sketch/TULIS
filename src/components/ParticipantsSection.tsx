'use client';

import React, { useState } from 'react';
import { Participant, ParticipantNetBalance } from '@/lib/types';
import { Users, UserPlus, Shield, UserMinus, Sliders, Mail, QrCode, Crown, Trophy, Zap, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserAvatar } from './UserAvatar';

interface ParticipantsSectionProps {
  participants: Participant[];
  netBalances: ParticipantNetBalance[];
  onAddParticipant: (name: string, email: string, isOrganizer: boolean, avatarUrl?: string) => void;
  onToggleStatus: (participantId: string) => void;
  onUpdateParticipantWeight: (participantId: string, weight: number, roomTier: 'suite' | 'standard' | 'economy') => void;
}

export const ParticipantsSection: React.FC<ParticipantsSectionProps> = ({
  participants,
  netBalances,
  onAddParticipant,
  onToggleStatus,
  onUpdateParticipantWeight,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isOrganizer, setIsOrganizer] = useState(false);

  // Determine Big Banker (highest total paid)
  const sortedByPaid = [...netBalances].sort((a, b) => b.totalPaid - a.totalPaid);
  const bigBankerId = sortedByPaid[0]?.participant.id;

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

  return (
    <div className="page-container space-y-6">
      {/* Header Banner */}
      <div className="page-header-split bg-surface-raised p-5 rounded-3xl border border-surface-hairline neu-raised">
        <div>
          <h2 className="text-xl font-serif-display font-bold text-ink-primary flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" /> Travelers & Gamified Badges
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Traveler roster with active achievement badges, UPI VPAs & room tier multipliers.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-ink-primary text-surface-base hover:opacity-90 text-xs sm:text-sm font-semibold transition-all shadow-subtle flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" /> Add Traveler Mid-Trip
        </button>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {participants.map((p) => {
          const balance = netBalances.find((b) => b.participant.id === p.id);
          const netAmount = balance ? balance.netBalance : 0;
          const totalPaid = balance ? balance.totalPaid : 0;
          const totalOwed = balance ? balance.totalOwed : 0;
          const isInactive = p.status === 'removed';
          const isBigBanker = p.id === bigBankerId && totalPaid > 0;

          return (
            <motion.div
              key={p.id}
              layout
              className={`p-5 rounded-3xl bg-surface-raised border space-y-4 transition-all shadow-paper ${
                isInactive
                  ? 'border-surface-hairline/40 opacity-50 bg-surface-base/50'
                  : 'border-surface-hairline hover:border-emerald-500/40'
              }`}
            >
              {/* Participant Profile Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <UserAvatar
                      name={p.name}
                      id={p.id}
                      avatarUrl={p.avatarUrl}
                      size="lg"
                      className="border-2 border-surface-hairline"
                    />
                    {isBigBanker && (
                      <span className="absolute -top-1 -right-1 p-1 bg-brand-gold text-surface-base rounded-full shadow-sm" title="Big Banker (Highest Paid Upfront)">
                        <Trophy className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-serif-display font-bold text-sm text-ink-primary flex items-center gap-1.5">
                      {p.name}
                      {p.isOrganizer && (
                        <span title="Trip Chief (Organizer)">
                          <Crown className="w-4 h-4 text-brand-gold inline shrink-0" />
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                      <QrCode className="w-3 h-3 text-emerald-400" /> {p.upiId || `${p.name.toLowerCase().replace(/\s+/g, '')}@upi`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleStatus(p.id)}
                  title={isInactive ? 'Re-activate Participant' : 'Remove Participant (Mid-trip exit)'}
                  className="p-1.5 rounded-lg text-ink-muted hover:text-ledger-deficit hover:bg-surface-overlay transition-all"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>

              {/* Gamified Badges Row */}
              <div className="flex flex-wrap gap-1.5">
                {p.isOrganizer && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold font-bold border border-brand-gold/30 flex items-center gap-1">
                    👑 Trip Chief
                  </span>
                )}
                {isBigBanker && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                    🏆 Big Banker
                  </span>
                )}
                {p.roomTier === 'economy' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-ledger-surplusBg text-ledger-surplus font-bold border border-ledger-surplus/30 flex items-center gap-1">
                    🛡️ Budget Guardian
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-overlay text-ink-secondary font-bold flex items-center gap-1">
                  ⚡ UPI Ready
                </span>
              </div>

              {/* Balance Summary Box */}
              <div className="p-3 rounded-2xl bg-surface-base border border-surface-hairline/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-ink-muted uppercase tracking-wider block font-medium">Net Ledger Position</span>
                  <span className="text-[10px] text-ink-secondary">
                    Paid ₹{totalPaid.toLocaleString('en-IN')} • Share ₹{totalOwed.toLocaleString('en-IN')}
                  </span>
                </div>
                <span
                  className={`font-numeric text-xs font-bold px-2.5 py-1 rounded-full ${
                    netAmount > 0
                      ? 'bg-ledger-surplusBg text-ledger-surplus border border-ledger-surplus/30'
                      : netAmount < 0
                      ? 'bg-ledger-deficitBg text-ledger-deficit border border-ledger-deficit/30'
                      : 'bg-surface-overlay text-ledger-neutral'
                  }`}
                >
                  {netAmount > 0 ? `+₹${netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : netAmount < 0 ? `-₹${Math.abs(netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'}
                </span>
              </div>

              {/* Room Tier & Weight Configuration */}
              <div className="pt-2 border-t border-surface-hairline flex items-center justify-between text-xs">
                <span className="text-ink-muted flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" /> Room Tier:
                </span>
                <select
                  value={p.roomTier || 'standard'}
                  onChange={(e) =>
                    onUpdateParticipantWeight(p.id, p.weight || 1, e.target.value as any)
                  }
                  className="bg-surface-base border border-surface-hairline text-xs rounded-xl px-2.5 py-1 text-ink-primary cursor-pointer focus:outline-none"
                >
                  <option value="suite">Suite (1.4x)</option>
                  <option value="standard">Standard (1.0x)</option>
                  <option value="economy">Economy (0.8x)</option>
                </select>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Participant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface-raised border border-surface-hairline p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl"
          >
            <h3 className="text-lg font-serif-display font-bold text-ink-primary">
              Add Traveler Mid-Trip
            </h3>
            <p className="text-xs text-ink-secondary">
              The Ledger engine will automatically back-calculate room tiers and future splits upon adding.
            </p>

            <form onSubmit={handleSubmitAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-ink-muted mb-1">Traveler Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikramaditya Sen"
                  className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2 text-ink-primary focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-ink-muted mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vikram@fareshare.in"
                  className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2 text-ink-primary focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-ink-muted">Profile Image URL (Optional)</label>
                  <span className="text-[10px] text-emerald-400">Defaults to SVG</span>
                </div>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://... (or leave blank for SVG avatar)"
                  className="w-full bg-surface-inset border border-surface-hairline rounded-xl px-3 py-2 text-ink-primary focus:border-emerald-500 outline-none placeholder:text-ink-muted"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="organizerCheck"
                  checked={isOrganizer}
                  onChange={(e) => setIsOrganizer(e.target.checked)}
                  className="rounded border-surface-hairline text-emerald-500"
                />
                <label htmlFor="organizerCheck" className="text-ink-secondary cursor-pointer">
                  Grant Trip Organizer privileges
                </label>
              </div>

              <div className="card-actions pt-3 border-t border-surface-hairline">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-ink-secondary hover:text-ink-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-ink-primary text-surface-base hover:opacity-90 font-semibold shadow-subtle transition-all cursor-pointer"
                >
                  Add to Roster
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
