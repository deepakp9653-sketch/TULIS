'use client';

import React, { useState } from 'react';
import {
  Crown,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  X,
  Users,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Participant, Trip } from '@/lib/types';
import { UserAvatar } from './UserAvatar';

interface OrganizerSuccessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  participants: Participant[];
  currentUserId: string;
  onSuccessionCompleted: (newOrganizerId: string) => void;
}

export const OrganizerSuccessionModal: React.FC<OrganizerSuccessionModalProps> = ({
  isOpen,
  onClose,
  trip,
  participants,
  currentUserId,
  onSuccessionCompleted,
}) => {
  const [selectedSuccessorId, setSelectedSuccessorId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const currentOrganizer = participants.find((p) => p.isOrganizer || p.id === trip.organizerId);
  const isCurrentOrganizer = currentOrganizer?.id === currentUserId || trip.organizerId === currentUserId;
  const eligibleCandidates = participants.filter((p) => p.id !== trip.organizerId && p.status === 'active');

  const handleTransfer = async () => {
    if (!selectedSuccessorId) return;
    const successor = participants.find((p) => p.id === selectedSuccessorId);
    if (!successor) return;

    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claim-succession',
          tripId: trip.id,
          successorParticipantId: successor.id,
          newOrganizerName: successor.name,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete succession');
      }

      setFeedbackMsg({
        type: 'success',
        text: `Trip leadership transferred to ${successor.name}!`,
      });

      onSuccessionCompleted(successor.id);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error transferring role' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReclaim = async () => {
    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reclaim-organizer',
          tripId: trip.id,
          originalOrganizerId: currentUserId,
          originalOrganizerName: participants.find((p) => p.id === currentUserId)?.name || 'Organizer',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reclaim role');
      }

      setFeedbackMsg({
        type: 'success',
        text: 'Organizer role successfully reclaimed!',
      });

      onSuccessionCompleted(currentUserId);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error reclaiming role' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0C110E] border border-[#213025] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col my-8"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#213025] flex items-center justify-between bg-[#111A14]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Organizer Succession
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/40">
                  F2.5
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Transfer trip stewardship with cryptographically verifiable audit events
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-[#18251C] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 flex-1">
          {feedbackMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-800/60 text-rose-300'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Current Organizer Display */}
          <div className="p-3.5 rounded-2xl bg-[#141E17] border border-[#26372B] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar name={currentOrganizer?.name || 'Organizer'} size="md" />
              <div>
                <span className="text-xs font-bold text-white block">
                  {currentOrganizer?.name || 'Current Organizer'}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>Active Organizer</span>
                </span>
              </div>
            </div>
            {isCurrentOrganizer ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                You
              </span>
            ) : (
              <button
                onClick={handleReclaim}
                disabled={isSubmitting}
                className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/50 flex items-center gap-1 cursor-pointer transition-all"
                title="Creator can reclaim organizer rights"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reclaim Role</span>
              </button>
            )}
          </div>

          {/* Transfer Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-300 block">
              Nominate Successor from Squad
            </label>
            <p className="text-[11px] text-stone-400">
              The designated successor will inherit full trip governance, expense approvals, and budget modification capabilities.
            </p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {eligibleCandidates.map((candidate) => {
                const isSelected = selectedSuccessorId === candidate.id;
                return (
                  <div
                    key={candidate.id}
                    onClick={() => setSelectedSuccessorId(candidate.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                        : 'bg-[#141E17] border-[#26372B] hover:border-[#384C36] text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <UserAvatar name={candidate.name} size="sm" />
                      <div>
                        <span className="text-xs font-semibold block">{candidate.name}</span>
                        <span className="text-[10px] font-mono text-stone-400">{candidate.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-xs">
                          ✓
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-stone-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#213025] bg-[#111A14] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleTransfer}
            disabled={!selectedSuccessorId || isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/50 cursor-pointer disabled:opacity-40"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Confirm Hand-Off</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
