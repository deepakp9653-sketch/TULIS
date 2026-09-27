'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  PlusCircle,
  KeyRound,
  ArrowRight,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Sparkles,
  LogOut,
  FolderOpen,
  CheckCircle2,
} from 'lucide-react';
import { Trip } from '@/lib/types';
import { AuthSessionUser } from '@/lib/auth-service';

interface TripSelectionGatewayModalProps {
  isOpen: boolean;
  user: AuthSessionUser | null;
  userTrips: Trip[];
  onSelectTrip: (tripId: string) => void;
  onCreateNewTrip: () => void;
  onJoinTrip: () => void;
  onQuickJoinCode?: (code: string) => Promise<boolean | void>;
  onLogout: () => void;
}

export const TripSelectionGatewayModal: React.FC<TripSelectionGatewayModalProps> = ({
  isOpen,
  user,
  userTrips,
  onSelectTrip,
  onCreateNewTrip,
  onJoinTrip,
  onQuickJoinCode,
  onLogout,
}) => {
  const [quickCode, setQuickCode] = useState('');
  const [quickCodeLoading, setQuickCodeLoading] = useState(false);
  const [quickCodeError, setQuickCodeError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleQuickCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = quickCode.trim().toUpperCase();
    if (!clean) return;

    if (onQuickJoinCode) {
      setQuickCodeLoading(true);
      setQuickCodeError(null);
      try {
        const res = await onQuickJoinCode(clean);
        if (res === false) {
          setQuickCodeError('Invalid invite code. Please check with your organizer.');
        }
      } catch (err: any) {
        setQuickCodeError(err.message || 'Could not join trip.');
      } finally {
        setQuickCodeLoading(false);
      }
    } else {
      onJoinTrip();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-[#F4F5EE] dark:bg-[#151D18] border border-[#5A7863]/20 dark:border-[#2B3E2F] p-6 sm:p-8 rounded-3xl max-w-2xl w-full shadow-2xl relative overflow-hidden my-8 text-[#3B4953] dark:text-[#F4F2E6]"
      >
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#FEF08A]/35 dark:bg-[#D9EE86]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#5A7863]/10 dark:bg-[#2D7A5C]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar: User Capsule & Logout */}
        <div className="flex items-center justify-between border-b border-[#5A7863]/15 dark:border-[#2B3E2F] pb-4 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full border border-[#5A7863] object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#5A7863] text-[#EBF4DD] font-bold flex items-center justify-center text-sm">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#3B4953] dark:text-[#F4F2E6]">{user.name}</span>
                <span className="text-[10px] text-[#5A7863] font-mono bg-[#5A7863]/15 border border-[#5A7863]/25 px-2 py-0.5 rounded-full font-bold">
                  Logged In
                </span>
              </div>
              <span className="text-xs text-[#78887B] dark:text-[#8B9A8C]">{user.email}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign out of account"
            className="px-3 py-1.5 rounded-xl border border-surface-hairline bg-surface-raised hover:bg-rose-500/15 text-[#5A7863] hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* Gateway Heading */}
        <div className="text-left mb-6 relative z-10">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#5A7863] font-bold block mb-1">
            Trip Gateway
          </span>
          <h2 className="font-serif-display font-bold text-2xl text-[#3B4953] dark:text-[#F4F2E6]">
            Where would you like to go?
          </h2>
          <p className="text-xs text-[#5A7863] dark:text-[#8B9A8C] mt-1">
            Choose an option below to enter your group ledger or start a new trip.
          </p>
        </div>

        {/* The 3 Core Pillars */}
        <div className="space-y-4 relative z-10">
          {/* Option 1: Create a New Trip */}
          <div
            onClick={onCreateNewTrip}
            className="group p-4 sm:p-5 rounded-2xl bg-[#E8EEDC] dark:bg-[#101712] border border-[#5A7863]/20 dark:border-[#2A322A] hover:border-[#5A7863] hover:bg-[#DDE5D0] dark:hover:bg-[#151D14] transition-all cursor-pointer flex items-center justify-between text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#5A7863]/15 border border-[#5A7863]/30 text-[#5A7863] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm text-[#3B4953] dark:text-[#F4F2E6] group-hover:text-[#5A7863] transition-colors">
                    Create a New Trip
                  </h3>
                  <span className="text-[10px] bg-[#FEF9C3] text-[#713F12] border border-[#FDE047]/60 font-bold px-2 py-0.5 rounded-md">
                    Organizer
                  </span>
                </div>
                <p className="text-xs text-[#78887B] dark:text-[#8B9A8C] max-w-md">
                  Set up a fresh ledger for your vacation, road trip, or offsite. Configure room tiers and invite your squad.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#5A7863] group-hover:translate-x-1 transition-transform">
              <span>Start</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Option 2: Join with Code */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#E8EEDC] dark:bg-[#101712] border border-[#5A7863]/20 dark:border-[#2A322A] text-left">
            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-[#5A7863]/15 border border-[#5A7863]/30 text-[#5A7863] flex items-center justify-center shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm text-[#3B4953] dark:text-[#F4F2E6]">
                    Join with Invite Code
                  </h3>
                  <span className="text-[10px] bg-[#5A7863]/15 text-[#5A7863] font-bold px-2 py-0.5 rounded-md">
                    Member
                  </span>
                </div>
                <p className="text-xs text-[#78887B] dark:text-[#8B9A8C]">
                  Have a 6-character squad invite code (e.g. GOA2026) or link from your organizer?
                </p>
              </div>
            </div>

            <form onSubmit={handleQuickCodeSubmit} className="flex gap-2 pl-0 sm:pl-16">
              <input
                type="text"
                maxLength={8}
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE (e.g. GOA26)"
                className="flex-1 bg-[#FFFFFF] dark:bg-[#1B2119] border border-[#5A7863]/25 dark:border-[#2A322A] rounded-xl px-3 py-2 text-xs font-mono font-bold tracking-widest text-[#5A7863] uppercase placeholder-[#78887B]/50 focus:border-[#5A7863] outline-none shadow-xs"
              />
              <button
                type="submit"
                disabled={quickCodeLoading || !quickCode.trim()}
                className="px-4 py-2 rounded-xl bg-[#5A7863] hover:bg-[#4C6753] text-[#EBF4DD] font-bold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{quickCodeLoading ? 'Checking...' : 'Join Trip'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {quickCodeError && (
              <p className="text-[11px] text-[#B5484C] mt-2 pl-0 sm:pl-16 font-medium">
                {quickCodeError}
              </p>
            )}
          </div>

          {/* Option 3: Enter Pre-Existing Trips */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#E8EEDC] dark:bg-[#101712] border border-[#5A7863]/20 dark:border-[#2A322A] text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5A7863]/15 border border-[#5A7863]/30 text-[#5A7863] flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#3B4953] dark:text-[#F4F2E6]">
                    Your Associated Trips
                  </h3>
                  <p className="text-[11px] text-[#78887B] dark:text-[#8B9A8C]">
                    Linked to <span className="text-[#5A7863] font-semibold">{user.email}</span>
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-[#FEF9C3] text-[#713F12] border border-[#FDE047]/60">
                {userTrips.length} {userTrips.length === 1 ? 'Trip' : 'Trips'}
              </span>
            </div>

            {userTrips.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1 mt-3">
                {userTrips.map((t) => {
                  const isOrganizer = t.organizerId === user.id || t.organizerId === 'p1';
                  return (
                    <div
                      key={t.id}
                      onClick={() => onSelectTrip(t.id)}
                      className="group p-3 rounded-xl bg-[#FFFFFF] dark:bg-[#1B2119] border border-[#5A7863]/15 dark:border-[#2A322A] hover:border-[#5A7863] hover:bg-[#F4F5EE] dark:hover:bg-[#1E261C] transition-all flex items-center justify-between cursor-pointer shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#3B4953] dark:text-[#F4F2E6] group-hover:text-[#5A7863] transition-colors truncate">
                            {t.title}
                          </span>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                              isOrganizer
                                ? 'bg-[#5A7863]/15 text-[#5A7863] font-bold'
                                : 'bg-[#E8EEDC] text-[#78887B] dark:bg-[#2A322A] dark:text-[#8B9A8C]'
                            }`}
                          >
                            {isOrganizer ? 'Organizer' : 'Member'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-[#78887B] dark:text-[#8B9A8C]">
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-[#5A7863]" />
                            {t.destination}
                          </span>
                          {t.inviteCode && (
                            <span className="font-mono text-[9px] bg-[#FEF9C3] text-[#713F12] px-1.5 py-0.5 rounded border border-[#FDE047]/60">
                              Code: {t.inviteCode}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-[#5A7863]/15 hover:bg-[#5A7863] text-[#5A7863] hover:text-[#EBF4DD] font-bold text-[11px] transition-colors flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#1B2119] border border-dashed border-[#5A7863]/25 text-center mt-3">
                <FolderOpen className="w-6 h-6 text-[#78887B] mx-auto mb-1.5 opacity-60" />
                <p className="text-xs font-semibold text-[#3B4953] dark:text-[#F4F2E6] mb-1">
                  No trips linked to this email yet
                </p>
                <p className="text-[11px] text-[#78887B] dark:text-[#8B9A8C] max-w-sm mx-auto">
                  Create a new trip above to become an organizer, or ask your friend for their 6-character squad invite code to join.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
