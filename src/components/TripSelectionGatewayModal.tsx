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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-[#1B2119] border border-[#2A322A] p-6 sm:p-8 rounded-3xl max-w-2xl w-full shadow-2xl relative overflow-hidden my-8"
      >
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#5FA97D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#5FA97D]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar: User Capsule & Logout */}
        <div className="flex items-center justify-between border-b border-[#2A322A] pb-4 mb-6">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full border border-[#5FA97D] object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#5FA97D]/20 text-[#5FA97D] font-bold flex items-center justify-center text-sm">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#F4F2E6]">{user.name}</span>
                <span className="text-[10px] text-[#5FA97D] font-mono bg-[#5FA97D]/10 border border-[#5FA97D]/25 px-2 py-0.5 rounded-full">
                  Logged In
                </span>
              </div>
              <span className="text-xs text-[#8B9A8C]">{user.email}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign out of account"
            className="px-3 py-1.5 rounded-xl border border-[#2A322A] bg-[#12160F] text-[#8B9A8C] hover:text-[#B5484C] hover:border-[#B5484C]/40 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* Gateway Heading */}
        <div className="text-left mb-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#5FA97D] font-semibold block mb-1">
            Trip Gateway
          </span>
          <h2 className="font-serif-display font-bold text-2xl text-[#F4F2E6]">
            Where would you like to go?
          </h2>
          <p className="text-xs text-[#8B9A8C] mt-1">
            Choose an option below to enter your group ledger or start a new trip.
          </p>
        </div>

        {/* The 3 Core Pillars */}
        <div className="space-y-4">
          {/* Option 1: Create a New Trip */}
          <div
            onClick={onCreateNewTrip}
            className="group p-4 sm:p-5 rounded-2xl bg-[#12160F] border border-[#2A322A] hover:border-[#5FA97D]/60 hover:bg-[#151D14] transition-all cursor-pointer flex items-center justify-between text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#5FA97D]/15 border border-[#5FA97D]/30 text-[#5FA97D] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm text-[#F4F2E6] group-hover:text-[#5FA97D] transition-colors">
                    Create a New Trip
                  </h3>
                  <span className="text-[10px] bg-[#5FA97D]/20 text-[#5FA97D] font-semibold px-2 py-0.5 rounded-md">
                    Organizer
                  </span>
                </div>
                <p className="text-xs text-[#8B9A8C] max-w-md">
                  Set up a fresh ledger for your vacation, road trip, or offsite. Configure room tiers and invite your squad.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#5FA97D] group-hover:translate-x-1 transition-transform">
              <span>Start</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Option 2: Join with Code */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#12160F] border border-[#2A322A] text-left">
            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-[#5FA97D]/15 border border-[#5FA97D]/30 text-[#5FA97D] flex items-center justify-center shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm text-[#F4F2E6]">
                    Join with Invite Code
                  </h3>
                  <span className="text-[10px] bg-[#2A322A] text-[#8B9A8C] font-semibold px-2 py-0.5 rounded-md">
                    Member
                  </span>
                </div>
                <p className="text-xs text-[#8B9A8C]">
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
                className="flex-1 bg-[#1B2119] border border-[#2A322A] rounded-xl px-3 py-2 text-xs font-mono font-bold tracking-widest text-[#5FA97D] uppercase placeholder-[#8B9A8C]/50 focus:border-[#5FA97D] outline-none"
              />
              <button
                type="submit"
                disabled={quickCodeLoading || !quickCode.trim()}
                className="px-4 py-2 rounded-xl bg-[#5FA97D] hover:bg-[#4E9A6E] text-[#12160F] font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
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
          <div className="p-4 sm:p-5 rounded-2xl bg-[#12160F] border border-[#2A322A] text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5FA97D]/15 border border-[#5FA97D]/30 text-[#5FA97D] flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#F4F2E6]">
                    Your Associated Trips
                  </h3>
                  <p className="text-[11px] text-[#8B9A8C]">
                    Linked to <span className="text-[#5FA97D] font-medium">{user.email}</span>
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-[#1B2119] border border-[#2A322A] text-[#5FA97D]">
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
                      className="group p-3 rounded-xl bg-[#1B2119] border border-[#2A322A] hover:border-[#5FA97D]/60 hover:bg-[#1E261C] transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#F4F2E6] group-hover:text-[#5FA97D] transition-colors truncate">
                            {t.title}
                          </span>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                              isOrganizer
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-[#2A322A] text-[#8B9A8C]'
                            }`}
                          >
                            {isOrganizer ? 'Organizer' : 'Member'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-[#8B9A8C]">
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-[#5FA97D]" />
                            {t.destination}
                          </span>
                          {t.inviteCode && (
                            <span className="font-mono text-[#5FA97D]/80">
                              Code: {t.inviteCode}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-[#5FA97D]/10 hover:bg-[#5FA97D] text-[#5FA97D] hover:text-[#12160F] font-bold text-[11px] transition-colors flex items-center gap-1 shrink-0 ml-2"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#1B2119] border border-dashed border-[#2A322A] text-center mt-3">
                <FolderOpen className="w-6 h-6 text-[#8B9A8C] mx-auto mb-1.5 opacity-60" />
                <p className="text-xs font-semibold text-[#F4F2E6] mb-1">
                  No trips linked to this email yet
                </p>
                <p className="text-[11px] text-[#8B9A8C] max-w-sm mx-auto">
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
