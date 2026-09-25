'use client';

import React from 'react';
import { Trip, Participant } from '@/lib/types';
import { X, Compass, Calendar, DollarSign, Users, Plus, CheckCircle2, ArrowRight, Copy, Key } from 'lucide-react';
import { motion } from 'framer-motion';

interface TripSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: Trip[];
  activeTripId: string;
  participantsMap: Record<string, Participant[]>;
  onSelectTrip: (tripId: string) => void;
  onOpenCreateTrip: () => void;
  onOpenJoinTrip: () => void;
}

export const TripSwitcherModal: React.FC<TripSwitcherModalProps> = ({
  isOpen,
  onClose,
  trips,
  activeTripId,
  participantsMap,
  onSelectTrip,
  onOpenCreateTrip,
  onOpenJoinTrip,
}) => {
  if (!isOpen) return null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Copied Trip Invite Code: ${code}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-surface-overlay border border-surface-hairline p-6 rounded-3xl max-w-2xl w-full space-y-5 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-hairline pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-emerald">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-lg text-ink-primary">
                My Group Trips ({trips.length})
              </h3>
              <p className="text-xs text-ink-secondary">
                View all created trips, share invite codes & switch workspaces.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl text-ink-muted hover:text-ink-primary hover:bg-surface-overlay">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenCreateTrip();
            }}
            className="flex-1 py-2.5 rounded-xl bg-ink-primary text-surface-base hover:opacity-90 text-xs font-semibold shadow-subtle flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Custom Trip</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenJoinTrip();
            }}
            className="flex-1 py-2.5 rounded-xl bg-surface-base border border-surface-hairline hover:bg-surface-overlay text-ink-primary text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Key className="w-4 h-4 text-brand-indigo" />
            <span>Join Trip via Code</span>
          </button>
        </div>

        {/* Trips Cards Grid Container */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {trips.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-surface-hairline rounded-2xl p-6">
              <Compass className="w-8 h-8 text-ink-muted/50 mx-auto mb-2" />
              <p className="text-sm font-semibold text-ink-primary">No associated trips found</p>
              <p className="text-xs text-ink-secondary mt-1">
                Create a new trip or ask your squad for their 6-character Invite Code.
              </p>
            </div>
          ) : (
            trips.map((t) => {
              const isActive = t.id === activeTripId;
              const tripParts = participantsMap[t.id] || [];
              const organizer = tripParts.find((p) => p.isOrganizer || p.id === t.organizerId) || tripParts[0];

              return (
                <div
                  key={t.id}
                  className={`p-4.5 rounded-2xl border transition-all space-y-3 ${
                    isActive
                      ? 'bg-surface-base border-emerald-500 ring-2 ring-emerald-500/20 shadow-paper'
                      : 'bg-surface-base border-surface-hairline hover:border-emerald-500/40'
                  }`}
                >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif-display font-bold text-base text-ink-primary">
                        {t.title}
                      </h4>
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-ledger-surplusBg text-ledger-surplus border border-ledger-surplus/30">
                          Active Workspace
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-secondary mt-0.5">
                      Destination: <strong className="text-ink-primary">{t.destination}</strong> • Organizer:{' '}
                      <span className="font-semibold text-ink-primary">{organizer?.name || 'User'}</span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-ink-muted block">Budget Ceiling</span>
                    <span className="font-numeric font-bold text-sm text-ink-primary">
                      ₹{t.budgetCeiling.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Bottom Row with Invite Code Pill & Switch CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-surface-hairline text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-ink-muted">Invite Code:</span>
                    <button
                      onClick={() => handleCopyCode(t.inviteCode)}
                      className="px-2.5 py-1 rounded-lg bg-surface-raised border border-surface-hairline text-emerald-400 font-numeric font-bold hover:bg-surface-overlay flex items-center gap-1.5 transition-all"
                      title="Click to Copy Code"
                    >
                      <span>{t.inviteCode}</span>
                      <Copy className="w-3 h-3" />
                    </button>
                    <span className="text-[11px] text-ink-muted">({tripParts.length} Travelers)</span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectTrip(t.id);
                      onClose();
                    }}
                    disabled={isActive}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-surface-overlay text-ink-muted cursor-default'
                        : 'bg-ink-primary text-surface-base hover:opacity-90 shadow-subtle'
                    }`}
                  >
                    <span>{isActive ? 'Current' : 'Enter Workspace'}</span>
                    {!isActive && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })
        )}
        </div>
      </motion.div>
    </div>
  );
};
