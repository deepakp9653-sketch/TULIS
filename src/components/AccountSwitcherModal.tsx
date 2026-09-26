'use client';

import React, { useState, useEffect } from 'react';
import { UserAccount, DEMO_USERS } from '@/lib/user-store';
import {
  X,
  Lock,
  UserCheck,
  Key,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Users,
  Shield,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from './UserAvatar';

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onSwitchUser: (userId: string) => void;
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  onSwitchUser,
}) => {
  // Exclusively lock to curated demo personas for privacy protection
  const [users, setUsers] = useState<UserAccount[]>(DEMO_USERS);
  const [selectedUserId, setSelectedUserId] = useState<string>(
    DEMO_USERS.find((u) => u.id !== currentUserId)?.id || 'p2'
  );
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only load demo accounts; never expose real registered users
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.users)) {
          // Strictly filter only official demo users
          const filtered = data.users.filter(
            (u: any) =>
              ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'].includes(u.id) ||
              u.email.endsWith('@tulis.in') ||
              u.email.endsWith('@fareshare.in')
          );
          if (filtered.length > 0) {
            setUsers(
              filtered.map((u: any) => ({
                ...u,
                password: u.demoPassword || 'password123',
                accessibleTripIds: ['trip-1'],
              }))
            );
          }
        }
      })
      .catch(() => {
        setUsers(DEMO_USERS);
      });
  }, []);

  if (!isOpen) return null;

  const targetUser = users.find((u) => u.id === selectedUserId) || users[0];
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const handleSwitchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'switch',
          id: selectedUserId,
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Incorrect password. Demo password is "password123".');
        setIsLoading(false);
        return;
      }

      setSuccessMsg(`Authenticated as ${data.user.name}! Switching dashboard...`);
      setTimeout(() => {
        onSwitchUser(selectedUserId);
        setIsLoading(false);
        setPassword('');
        onClose();
      }, 700);
    } catch (err: any) {
      // Local fallback verification
      if (password.trim() === 'password123') {
        setSuccessMsg(`Authenticated as ${targetUser.name}! Switching dashboard...`);
        setTimeout(() => {
          onSwitchUser(selectedUserId);
          setIsLoading(false);
          setPassword('');
          onClose();
        }, 700);
      } else {
        setErrorMsg('Invalid password. Demo password is "password123".');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-surface-overlay border border-surface-hairline p-6 rounded-3xl max-w-lg w-full space-y-5 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-hairline pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ink-primary text-surface-base flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-lg text-ink-primary">
                Switch User Account
              </h3>
              <p className="text-xs text-ink-secondary">
                Securely authenticate to access a different member&apos;s trip dashboard.
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

        {/* Current Active Account Pill */}
        <div className="p-3.5 rounded-2xl bg-surface-base border border-surface-hairline flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={currentUser.name}
              id={currentUser.id}
              avatarUrl={currentUser.avatar}
              size="sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink-primary">{currentUser.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                  Active Now
                </span>
              </div>
              <span className="text-[11px] text-ink-muted">{currentUser.email}</span>
            </div>
          </div>
          <span className="text-xs font-mono text-ink-muted uppercase tracking-wider font-semibold">
            {currentUser.role}
          </span>
        </div>

        {/* Account Selector Cards */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-ink-primary">
              Select Demo Account to Test
            </label>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Sandbox Mode
            </span>
          </div>

          <div className="mb-3 p-2.5 rounded-xl bg-surface-base border border-surface-hairline text-[11px] text-ink-muted flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Real user accounts are hidden for privacy. Only curated demo squad personas are displayed here.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
            {users.map((u) => {
              const isSelected = u.id === selectedUserId;
              const isCurrent = u.id === currentUserId;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setSelectedUserId(u.id);
                    setErrorMsg('');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-surface-overlay ring-1 ring-emerald-500/40 shadow-sm'
                      : 'border-surface-hairline bg-surface-base hover:bg-surface-overlay'
                  }`}
                >
                  <UserAvatar
                    name={u.name}
                    id={u.id}
                    avatarUrl={u.avatar}
                    size="xs"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink-primary truncate">{u.name}</span>
                      {isCurrent && (
                        <span className="text-[9px] text-emerald-400 font-bold">• Active</span>
                      )}
                    </div>
                    <p className="text-[10px] text-ink-muted truncate">{u.email}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Password Verification Form */}
        <form onSubmit={handleSwitchSubmit} className="space-y-3 pt-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-ink-primary">
                Enter Password for <span className="font-bold underline">{targetUser.name}</span>
              </label>
              <span className="text-[11px] font-mono text-ink-muted bg-surface-base px-2 py-0.5 rounded border border-surface-hairline">
                Demo: <code className="text-emerald-400 font-bold">password123</code>
              </span>
            </div>

            <div className="relative">
              <Key className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-surface-base border border-surface-hairline rounded-xl pl-9 pr-3 py-2.5 text-xs text-ink-primary focus:border-ink-primary focus:ring-1 focus:ring-ink-primary outline-none transition-all font-mono"
              />
            </div>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-surface-hairline text-xs font-semibold text-ink-secondary hover:text-ink-primary hover:bg-surface-overlay transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="px-5 py-2 rounded-xl bg-ink-primary text-surface-base font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Verify & Switch Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
