'use client';

import React from 'react';
import { Participant } from '@/lib/types';
import {
  X,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
  UserCheck,
  UserMinus,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from './UserAvatar';

export type CapabilityType =
  | 'can_edit_bookings'
  | 'can_approve_refunds'
  | 'can_manage_roster'
  | 'can_remove_participants';

export const CAPABILITIES_CATALOG: Array<{
  id: CapabilityType;
  title: string;
  description: string;
  icon: any;
}> = [
  {
    id: 'can_edit_bookings',
    title: 'Edit Bookings & Itinerary',
    description: 'Create new reservations, update rates, or modify itinerary timeline.',
    icon: Calendar,
  },
  {
    id: 'can_approve_refunds',
    title: 'Approve Refunds & Credits',
    description: 'Process booking cancellations and distribute operator refund credits.',
    icon: DollarSign,
  },
  {
    id: 'can_manage_roster',
    title: 'Manage Squad Roster & Weights',
    description: 'Invite new travelers and configure room tiers or split weighting factors.',
    icon: UserCheck,
  },
  {
    id: 'can_remove_participants',
    title: 'Archive / Remove Travelers',
    description: 'Handle early departures while preserving mathematical ledger invariants.',
    icon: UserMinus,
  },
];

interface CapabilityPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant | null;
  currentCapabilities: string[];
  isOrganizer: boolean;
  onToggleCapability: (participantId: string, capability: CapabilityType, granted: boolean) => void;
}

export const CapabilityPermissionsModal: React.FC<CapabilityPermissionsModalProps> = ({
  isOpen,
  onClose,
  participant,
  currentCapabilities,
  isOrganizer,
  onToggleCapability,
}) => {
  if (!isOpen || !participant) return null;

  const isTargetOrganizer = participant.isOrganizer;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-[#182218] via-[#121712] to-[#0A0D0A] border border-[#3A4E39]/60 rounded-3xl shadow-2xl shadow-emerald-950/50 text-stone-100 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#283526] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">Delegated Permissions</h3>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-400 border border-emerald-700/40">
                    F2.3 Scoped Access
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  Delegate specific organizer powers without granting full account ownership
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Badge */}
          <div className="p-5 border-b border-[#223121] bg-[#121A12] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar name={participant.name} id={participant.id} avatarUrl={participant.avatarUrl} size="md" />
              <div>
                <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                  <span>{participant.name}</span>
                  {isTargetOrganizer && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700/50">
                      Primary Organizer
                    </span>
                  )}
                </div>
                <span className="text-xs text-stone-400">{participant.email}</span>
              </div>
            </div>

            {isTargetOrganizer && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Full Access</span>
              </span>
            )}
          </div>

          {/* Capability List */}
          <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
            {isTargetOrganizer ? (
              <div className="p-4 rounded-2xl bg-[#142015] border border-emerald-800/50 text-xs text-stone-300 space-y-1">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Inherited Organizer Authority</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  As the primary trip organizer, this traveler holds all capabilities inherently. Granular revocations only apply to non-organizer co-travelers.
                </p>
              </div>
            ) : null}

            {CAPABILITIES_CATALOG.map((cap) => {
              const IconComp = cap.icon;
              const isEnabled = isTargetOrganizer || currentCapabilities.includes(cap.id);

              return (
                <div
                  key={cap.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    isEnabled
                      ? 'bg-[#142015] border-emerald-700/50 shadow-sm'
                      : 'bg-[#0E140E] border-[#223021] opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl border shrink-0 ${
                        isEnabled
                          ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-400'
                          : 'bg-[#182318] border-[#2A3B29] text-stone-500'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{cap.title}</h4>
                      <p className="text-[11px] text-stone-400 leading-snug mt-0.5">{cap.description}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isTargetOrganizer || !isOrganizer}
                    onClick={() => onToggleCapability(participant.id, cap.id, !isEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                      isEnabled ? 'bg-emerald-500' : 'bg-stone-800'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-[#232F22] bg-[#0E130E] flex items-center justify-between">
            <span className="text-[11px] text-stone-400 font-medium">
              Actions are immediately logged in trip audit graph
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
