'use client';

import React, { useState } from 'react';
import { Trip, Participant } from '@/lib/types';
import { DEMO_USERS } from '@/lib/user-store';
import {
  X,
  Share2,
  Copy,
  Check,
  UserPlus,
  Shield,
  Eye,
  Edit3,
  Mail,
  CheckCircle2,
  QrCode,
  Link,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { UserAvatar } from './UserAvatar';

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  participants: Participant[];
  currentUserId: string;
  onAddParticipant?: (participant: Participant) => void;
}

export const ShareTripModal: React.FC<ShareTripModalProps> = ({
  isOpen,
  onClose,
  trip,
  participants,
  currentUserId,
  onAddParticipant,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [permissionRole, setPermissionRole] = useState<'editor' | 'viewer'>('editor');
  const [invitedSuccess, setInvitedSuccess] = useState('');

  if (!isOpen) return null;

  const inviteCode = trip.inviteCode || 'GOA2026';
  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}?join=${inviteCode}` : `https://fareshare.in?join=${inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWithUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserEmail.trim()) return;

    // Check if user is in demo users
    const foundUser = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === selectedUserEmail.trim().toLowerCase()
    );

    if (foundUser && onAddParticipant) {
      // Check if already participant
      const exists = participants.some((p) => p.id === foundUser.id);
      if (!exists) {
        onAddParticipant({
          id: foundUser.id,
          tripId: trip.id,
          name: foundUser.name,
          email: foundUser.email,
          avatarUrl: foundUser.avatar,
          isOrganizer: false,
          status: 'active',
          upiId: foundUser.upiId,
        });
      }
    }

    setInvitedSuccess(`Trip shared with ${selectedUserEmail} (${permissionRole})!`);
    setSelectedUserEmail('');
    setTimeout(() => setInvitedSuccess(''), 3000);
  };

  // Registered users not yet in this trip
  const externalUsers = DEMO_USERS.filter(
    (u) => !participants.some((p) => p.id === u.id)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-surface-overlay border border-surface-hairline p-6 rounded-3xl max-w-lg w-full space-y-5 shadow-2xl neu-raised"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-hairline pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ink-primary text-surface-base flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-lg text-ink-primary">
                Share Trip &amp; Manage Access
              </h3>
              <p className="text-xs text-ink-secondary">
                Invite friends and co-travelers to collaborate on &quot;{trip.title}&quot;.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-ink-muted hover:text-ink-primary hover:bg-surface-overlay transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instant Share Link */}
        <div className="p-3.5 rounded-2xl bg-surface-base border border-surface-hairline space-y-2">
          <label className="text-xs font-semibold text-ink-primary flex items-center justify-between">
            <span>Direct Trip Invite Link</span>
            <span className="font-mono text-[10px] text-ink-muted">Code: {inviteCode}</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Link className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                readOnly
                value={shareLink}
                className="w-full bg-surface-raised border border-surface-hairline rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-ink-secondary truncate"
              />
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-ink-primary text-surface-base text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-all shrink-0 shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Invite User Form */}
        <form onSubmit={handleShareWithUser} className="space-y-3">
          <label className="block text-xs font-bold text-ink-primary">
            Invite Registered User by Email or Preset Account
          </label>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="friend@fareshare.in"
                value={selectedUserEmail}
                onChange={(e) => setSelectedUserEmail(e.target.value)}
                className="w-full bg-surface-base border border-surface-hairline rounded-xl pl-9 pr-3 py-2.5 text-xs text-ink-primary focus:border-ink-primary outline-none transition-all"
              />
            </div>

            <select
              value={permissionRole}
              onChange={(e) => setPermissionRole(e.target.value as any)}
              className="bg-surface-base border border-surface-hairline rounded-xl px-3 py-2.5 text-xs font-semibold text-ink-primary outline-none cursor-pointer"
            >
              <option value="editor">Editor (Can add expenses)</option>
              <option value="viewer">Viewer (Read-only)</option>
            </select>
          </div>

          {/* Quick Demo User Pills */}
          {externalUsers.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] text-ink-muted font-medium">Quick invite registered demo member:</span>
              <div className="flex flex-wrap gap-1.5">
                {externalUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUserEmail(u.email)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-base border border-surface-hairline text-ink-primary hover:border-ink-primary transition-all flex items-center gap-1.5 font-medium"
                  >
                    <UserAvatar name={u.name} id={u.id} avatarUrl={u.avatar} size="xs" />
                    <span>{u.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {invitedSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{invitedSuccess}</span>
            </motion.div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!selectedUserEmail.trim()}
              className="px-5 py-2.5 rounded-xl bg-ink-primary text-surface-base font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-subtle cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Send Invite &amp; Grant Access</span>
            </button>
          </div>
        </form>

        {/* Current Members List */}
        <div className="pt-2 border-t border-surface-hairline">
          <label className="text-xs font-bold text-ink-primary block mb-2">
            Current Trip Members ({participants.length})
          </label>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2 rounded-xl bg-surface-base border border-surface-hairline text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <UserAvatar
                    name={p.name}
                    id={p.id}
                    avatarUrl={p.avatarUrl}
                    size="sm"
                  />
                  <div>
                    <span className="font-bold text-ink-primary">{p.name}</span>
                    <p className="text-[10px] text-ink-muted">{p.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-ink-muted">
                  {p.isOrganizer ? (
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      Owner
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-surface-overlay text-ink-secondary">
                      Editor
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
