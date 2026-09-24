'use client';

import React, { useState } from 'react';
import { Participant } from '@/lib/types';
import { X, Lock, Mail, User, Key, CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  onLogin: (participantId: string, email: string) => void;
  onRegister: (name: string, email: string, password: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  participants,
  onLogin,
  onRegister,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedUser, setSelectedUser] = useState<string>(participants[0]?.id || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = participants.find((p) => p.id === selectedUser);
    onLogin(selectedUser, user?.email || email || 'user@fareshare.in');
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) return;
    onRegister(regName, regEmail, regPassword);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-surface-overlay border border-surface-hairline p-6 rounded-3xl max-w-md w-full space-y-5 shadow-2xl overflow-hidden neu-raised"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-hairline pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-emerald">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-lg text-ink-primary">
                Account Authentication
              </h3>
              <p className="text-xs text-ink-secondary">
                Log in or sign up to manage your trip balance & UPI payment QR.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl text-ink-muted hover:text-ink-primary hover:bg-surface-overlay">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-surface-inset rounded-xl border border-surface-hairline text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-surface-raised text-ink-primary shadow-subtle font-semibold'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            Login Existing Member
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-surface-raised text-ink-primary shadow-subtle font-semibold'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            Create New Account
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'login' ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleLoginSubmit}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-ink-muted mb-1 font-semibold">Select Member Persona</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2.5 text-ink-primary font-medium focus:border-emerald-500 outline-none cursor-pointer"
                >
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.isOrganizer ? '(Organizer)' : ''} — {p.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-semibold">Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  className="w-full bg-surface-inset border border-surface-hairline rounded-xl pl-9 pr-3 py-2.5 text-ink-primary focus:border-emerald-500 outline-none placeholder:text-ink-muted"
                />
                </div>
                <span className="text-[10px] text-ink-muted mt-1 block">Demo password preset accepted for testing.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-ink-primary text-surface-base hover:opacity-90 font-semibold text-xs shadow-subtle flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
              >
                <span>Login & Setup UPI Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleRegisterSubmit}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-ink-muted mb-1 font-semibold">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Vikramaditya Sen"
                    className="w-full bg-surface-base border border-surface-hairline rounded-xl pl-9 pr-3 py-2.5 text-ink-primary focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-semibold">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="vikram@fareshare.in"
                    className="w-full bg-surface-base border border-surface-hairline rounded-xl pl-9 pr-3 py-2.5 text-ink-primary focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-semibold">Account Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-surface-base border border-surface-hairline rounded-xl pl-9 pr-3 py-2.5 text-ink-primary focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-ink-primary text-surface-base hover:opacity-90 font-semibold text-xs shadow-subtle flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Create Account & Setup UPI</span>
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
