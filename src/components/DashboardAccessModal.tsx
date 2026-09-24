'use client';

import React, { useState } from 'react';
import { X, Key, Plus, ArrowRight, Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidGlassButton } from './LiquidGlassButton';

interface DashboardAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterInviteCode: (code: string) => Promise<boolean | void> | boolean | void;
  onOpenCreateTrip: () => void;
  onOpenDemoTrip: () => void;
}

export const DashboardAccessModal: React.FC<DashboardAccessModalProps> = ({
  isOpen,
  onClose,
  onEnterInviteCode,
  onOpenCreateTrip,
  onOpenDemoTrip,
}) => {
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Please enter a 6-character Trip Invite Code.');
      return;
    }

    setIsSearching(true);
    try {
      const res = await onEnterInviteCode(cleanCode);
      if (res === false) {
        setErrorMsg('Trip invite code not found. Please verify with your organizer or try "GOA2026".');
      } else {
        setCode('');
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error checking trip invite code.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-surface-overlay border border-surface-hairline p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle gradient background highlight */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          {/* Modal Header */}
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-1">
                Workspace Access
              </span>
              <h2 className="font-sans font-bold text-xl sm:text-2xl text-ink-primary">
                Open Your Dashboard
              </h2>
              <p className="text-xs text-ink-secondary mt-1">
                Enter your squad invite code or initialize a brand new trip.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-ink-muted hover:text-ink-primary hover:bg-surface-overlay transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Action 1: Enter Invite Code */}
          <form onSubmit={handleSubmitCode} className="space-y-3 relative z-10">
            <label className="block text-xs font-semibold text-ink-primary">
              Have a Trip Invite Code?
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Key className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setErrorMsg(null);
                  }}
                  placeholder="e.g. GOA2026"
                  maxLength={10}
                  className="w-full bg-surface-base border border-surface-hairline rounded-xl pl-10 pr-3 py-2.5 text-xs font-mono tracking-wider uppercase text-ink-primary focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-ink-muted"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-subtle shrink-0 flex items-center gap-1.5 ${
                  isSearching
                    ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                    : 'bg-ink-primary text-surface-base hover:opacity-90 cursor-pointer'
                }`}
              >
                {isSearching ? (
                  <>
                    <span className="w-3 h-3 border-2 border-neutral-400 border-t-white rounded-full animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <span>Enter</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>

            {errorMsg && (
              <p className="text-[11px] text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
                {errorMsg}
              </p>
            )}
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-surface-hairline w-full" />
            <span className="bg-surface-raised px-3 text-[11px] font-mono text-ink-muted uppercase tracking-wider shrink-0">
              Or Start Fresh
            </span>
          </div>

          {/* Action 2 & 3 */}
          <div className="space-y-2.5 relative z-10">
            <button
              onClick={() => {
                onClose();
                onOpenCreateTrip();
              }}
              className="w-full p-3.5 rounded-2xl bg-surface-overlay border border-surface-hairline hover:border-emerald-500/50 hover:bg-surface-overlay/80 transition-all flex items-center justify-between group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-ink-primary block">
                    Create New Group Trip
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    Set budget, lodging tiers, and invite members
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-emerald-400 transition-colors shrink-0" />
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenDemoTrip();
              }}
              className="w-full p-3 rounded-2xl bg-surface-base/60 border border-surface-hairline/60 hover:border-zinc-500/50 transition-all flex items-center justify-between group cursor-pointer text-left text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-surface-hairline flex items-center justify-center text-ink-muted shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-ink-secondary block">
                    Explore Goa 2026 Demo Trip
                  </span>
                  <span className="text-[10px] text-ink-muted font-mono">
                    Code: GOA2026 • 6 Travelers • Live net balances
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink-primary transition-colors shrink-0" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
