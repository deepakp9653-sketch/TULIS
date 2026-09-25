'use client';

import React, { useState } from 'react';
import { ShieldAlert, Lock, Key, ArrowRight, Home, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface TripAccessGateModalProps {
  isOpen: boolean;
  tripTitle?: string;
  onUnlockWithCode: (inviteCode: string) => Promise<boolean>;
  onOpenAuth: () => void;
  onGoHome: () => void;
}

export const TripAccessGateModal: React.FC<TripAccessGateModalProps> = ({
  isOpen,
  tripTitle,
  onUnlockWithCode,
  onOpenAuth,
  onGoHome,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const ok = await onUnlockWithCode(code.trim().toUpperCase());
      if (!ok) {
        setError('Invalid invite code. Please check with your trip organizer.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to unlock trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B2119] border border-[#2A322A] p-6 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-[#B5484C]/20 border border-[#B5484C]/40 text-[#B5484C] flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="font-serif-display font-bold text-xl text-[#F4F2E6] mb-1">
          Private Trip Ledger
        </h3>
        <p className="text-xs text-[#8B9A8C] mb-6">
          {tripTitle ? `"${tripTitle}"` : 'This trip'} is restricted to authorized squad members only.
          Sign in or enter the 6-character Trip Invite Code to unlock.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#B5484C]/15 border border-[#B5484C]/30 text-[#F4F2E6] text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 mb-5">
          <div className="relative">
            <Key className="w-4 h-4 text-[#8B9A8C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ENTER INVITE CODE (e.g. GOA24)"
              className="w-full bg-[#12160F] border border-[#2A322A] rounded-xl pl-9 pr-3 py-3 text-center font-mono font-bold tracking-widest text-[#5FA97D] text-sm focus:border-[#5FA97D] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-3 rounded-xl bg-[#5FA97D] hover:bg-[#4E9A6E] text-[#12160F] font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>{loading ? 'Verifying Invite...' : 'Unlock Trip with Code'}</span>
          </button>
        </form>

        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#2A322A]"></div>
          </div>
          <span className="relative bg-[#1B2119] px-3 text-[11px] text-[#8B9A8C] uppercase tracking-wider font-semibold">
            Or
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenAuth}
            className="py-2.5 px-3 rounded-xl bg-[#12160F] hover:bg-[#2A322A] border border-[#2A322A] text-xs font-semibold text-[#F4F2E6] transition-colors"
          >
            Sign In with Account
          </button>
          <button
            type="button"
            onClick={onGoHome}
            className="py-2.5 px-3 rounded-xl bg-[#12160F] hover:bg-[#2A322A] border border-[#2A322A] text-xs font-semibold text-[#8B9A8C] hover:text-[#F4F2E6] flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go to Home</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
