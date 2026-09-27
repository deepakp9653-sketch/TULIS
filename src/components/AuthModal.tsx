'use client';

import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Key,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Send,
  Building2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any, needsProfileCompletion?: boolean) => void;
  defaultMode?: 'otp-login' | 'login' | 'register' | 'otp' | 'google';
  onSwitchToCorporate?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  defaultMode = 'otp-login',
  onSwitchToCorporate,
}) => {
  const [mode, setMode] = useState<'otp-login' | 'login' | 'register' | 'otp' | 'google'>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');

  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '510179913493-prnuldb8fundps402c431u7eo7tea8mb.apps.googleusercontent.com';

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Google OAuth Success Handler
  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      setErrorMessage('No credential returned by Google.');
      return;
    }
    setLoading(true);
    resetMessages();

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to authenticate with Google');
      }

      setSuccessMessage('Successfully logged in with Google!');
      setTimeout(() => {
        onAuthSuccess(data.user, Boolean(data.needsProfileCompletion));
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Passwordless Email OTP Login / Sign In
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    resetMessages();

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch verification code');
      }

      setSuccessMessage('6-digit verification code dispatched via Resend! Check your inbox.');
      setMode('otp');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Email / Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    resetMessages();

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      setSuccessMessage(`Welcome back, ${data.user.name}!`);
      setTimeout(() => {
        onAuthSuccess(data.user);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Register with Email
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    setLoading(true);
    resetMessages();

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccessMessage('Verification code sent to your email via Resend! Check your inbox.');
      setMode('otp');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify 6-digit OTP
  const handleVerifyOtp = async (e?: React.FormEvent, customOtp?: string) => {
    if (e) e.preventDefault();
    const activeCode = (customOtp || otp).trim();
    if (!activeCode || activeCode.length < 6) return;

    setLoading(true);
    resetMessages();

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-otp', email: email.trim(), otp: activeCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid or expired verification code');
      }

      setSuccessMessage('Email verified successfully! Setting up your session...');
      setTimeout(() => {
        onAuthSuccess(data.user);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    setLoading(true);
    resetMessages();
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend-otp', email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not resend OTP code');
      }
      setSuccessMessage('A fresh 6-digit verification code has been dispatched via Resend. Check your inbox.');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Demo 1-Click Login for Instant Evaluation
  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setLoading(true);
    resetMessages();

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: demoEmail, password: 'password123' }),
      });
      const data = await res.json();
      if (data.success) {
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage('Demo login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-[#F4F5EE] dark:bg-[#151D18] border border-[#5A7863]/20 dark:border-[#2B3E2F] p-6 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden text-[#3B4953] dark:text-[#F4F2E6]"
      >
        {/* Subtle warm accent glows: pastel yellow and soft forest */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FEF08A]/35 dark:bg-[#D9EE86]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#5A7863]/10 dark:bg-[#2D7A5C]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#5A7863]/15 dark:border-[#2B3E2F] pb-4 mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5A7863]/15 border border-[#5A7863]/30 text-[#5A7863] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-lg text-[#3B4953] dark:text-[#F4F5EE]">
                {mode === 'otp'
                  ? 'Verify 6-Digit Code'
                  : mode === 'otp-login'
                  ? 'Sign In with Email OTP'
                  : mode === 'login'
                  ? 'Welcome to Tulis'
                  : 'Create an Account'}
              </h3>
              <p className="text-xs text-[#5A7863] dark:text-[#8B9A8C]">
                {mode === 'otp'
                  ? `Enter the 6-digit code sent to ${email}`
                  : mode === 'otp-login'
                  ? 'Passwordless verification delivered directly to your inbox.'
                  : 'Manage squad trips, verify ledgers & settle balances.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#5A7863] hover:text-[#3B4953] dark:text-[#8B9A8C] dark:hover:text-[#F4F5EE] hover:bg-[#E8EEDC] dark:hover:bg-[#2A322A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-[#B5484C]/15 border border-[#B5484C]/30 text-[#B5484C] dark:text-[#FCA5A5] text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#B5484C] shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-[#5A7863]/15 border border-[#5A7863]/30 text-[#2D7A5C] dark:text-[#D9EE86] text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#5A7863] shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Mode Switcher Tabs (Email OTP vs Password vs Sign Up) */}
        {mode !== 'otp' && (
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#E8EEDC] dark:bg-[#101712] rounded-xl border border-[#5A7863]/15 dark:border-[#2A322A] text-xs font-semibold mb-5 relative z-10">
            <button
              type="button"
              onClick={() => {
                setMode('otp-login');
                resetMessages();
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'otp-login'
                  ? 'bg-[#5A7863] text-[#EBF4DD] font-bold shadow-sm'
                  : 'text-[#5A7863] hover:text-[#3B4953] dark:text-[#8B9A8C] dark:hover:text-[#F4F2E6]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Email OTP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                resetMessages();
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#5A7863] text-[#EBF4DD] font-bold shadow-sm'
                  : 'text-[#5A7863] hover:text-[#3B4953] dark:text-[#8B9A8C] dark:hover:text-[#F4F2E6]'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Password</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                resetMessages();
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#5A7863] text-[#EBF4DD] font-bold shadow-sm'
                  : 'text-[#5A7863] hover:text-[#3B4953] dark:text-[#8B9A8C] dark:hover:text-[#F4F2E6]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        )}

        {/* Google One-Tap / Button Login */}
        {mode !== 'otp' && (
          <div className="mb-4 relative z-10">
            {googleClientId && googleClientId !== '' && googleClientId !== 'dummy_client_id' ? (
              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setErrorMessage('Google Sign-In failed or was dismissed.')}
                  theme="outline"
                  shape="pill"
                  size="large"
                  text="continue_with"
                  width="320"
                />
              </div>
            ) : null}

            <div className="relative my-3 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#5A7863]/15 dark:border-[#2A322A]"></div>
              </div>
              <span className="relative bg-[#F4F5EE] dark:bg-[#151D18] px-3 text-[10px] text-[#78887B] dark:text-[#8B9A8C] uppercase tracking-wider font-semibold">
                {mode === 'otp-login' ? 'Passwordless Email Code' : mode === 'login' ? 'Or Password Sign In' : 'Account Details'}
              </span>
            </div>
          </div>
        )}

        {/* Content Body Based on Mode */}
        <AnimatePresence mode="wait">
          {mode === 'otp-login' && (
            <motion.form
              key="otp-login"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              onSubmit={handleSendOtp}
              className="space-y-3.5 text-xs relative z-10"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#3B4953] dark:text-[#F4F5EE] font-semibold">Your Email Address</label>
                  <span className="text-[10px] text-[#5A7863] font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Secure Verification
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5A7863] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email (e.g. traveler@gmail.com)"
                    className="w-full bg-[#FFFFFF] dark:bg-[#101712] border border-[#5A7863]/25 dark:border-[#2B3E2F] rounded-xl pl-9 pr-3 py-2.5 text-[#3B4953] dark:text-[#F4F5EE] placeholder-[#78887B]/60 focus:border-[#5A7863] outline-none font-medium shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3 rounded-xl bg-[#5A7863] hover:bg-[#4C6753] text-[#EBF4DD] font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{loading ? 'Dispatching Code...' : 'Send 6-Digit Code'}</span>
              </button>

              {/* Pastel Yellow Accent Callout */}
              <div className="p-3 bg-[#FEF9C3] dark:bg-[#242A16] rounded-xl border border-[#FDE047]/60 dark:border-[#53491E] text-[11px] text-[#713F12] dark:text-[#FEF08A] flex items-center gap-2.5 shadow-xs">
                <Sparkles className="w-4 h-4 text-[#854D0E] dark:text-[#FDE047] shrink-0" />
                <span>
                  Real-time OTP email delivery to your inbox. No passwords required. Zero friction.
                </span>
              </div>
            </motion.form>
          )}

          {mode === 'login' && (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              onSubmit={handleLogin}
              className="space-y-3.5 text-xs relative z-10"
            >
              <div>
                <label className="block text-[#3B4953] dark:text-[#F4F5EE] mb-1 font-semibold">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5A7863] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full bg-[#FFFFFF] dark:bg-[#101712] border border-[#5A7863]/25 dark:border-[#2B3E2F] rounded-xl pl-9 pr-3 py-2.5 text-[#3B4953] dark:text-[#F4F5EE] placeholder-[#78887B]/60 focus:border-[#5A7863] outline-none shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#3B4953] dark:text-[#F4F5EE] mb-1 font-semibold">Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#5A7863] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#FFFFFF] dark:bg-[#101712] border border-[#5A7863]/25 dark:border-[#2B3E2F] rounded-xl pl-9 pr-3 py-2.5 text-[#3B4953] dark:text-[#F4F5EE] placeholder-[#78887B]/60 focus:border-[#5A7863] outline-none shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#5A7863] hover:bg-[#4C6753] text-[#EBF4DD] font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{loading ? 'Authenticating...' : 'Sign In with Password'}</span>
              </button>

              {/* Instant Demo Switcher for fast evaluation */}
              <div className="pt-3 border-t border-[#5A7863]/15 dark:border-[#2A322A] mt-4">
                <span className="text-[10px] text-[#78887B] dark:text-[#8B9A8C] uppercase tracking-wider font-semibold block mb-2">
                  Fast Demo Personas (One-Click Login):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: 'Alex Rivera (Organizer)', email: 'alex@tulis.in' },
                    { name: 'Sam Chen', email: 'sam@tulis.in' },
                    { name: 'Jordan Taylor', email: 'jordan@tulis.in' },
                  ].map((p) => (
                    <button
                      key={p.email}
                      type="button"
                      onClick={() => handleDemoLogin(p.email)}
                      className="px-2.5 py-1 rounded-lg bg-[#E8EEDC] hover:bg-[#DDE5D0] dark:bg-[#101712] dark:hover:bg-[#2A322A] border border-[#5A7863]/20 dark:border-[#2A322A] text-[11px] text-[#3B4953] hover:text-[#5A7863] dark:text-[#8B9A8C] dark:hover:text-[#D9EE86] transition-colors cursor-pointer"
                    >
                      {p.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </motion.form>
          )}

          {mode === 'register' && (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              onSubmit={handleRegister}
              className="space-y-3.5 text-xs relative z-10"
            >
              <div>
                <label className="block text-[#3B4953] dark:text-[#F4F5EE] mb-1 font-semibold">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5A7863] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Sharma"
                    className="w-full bg-[#FFFFFF] dark:bg-[#101712] border border-[#5A7863]/25 dark:border-[#2B3E2F] rounded-xl pl-9 pr-3 py-2.5 text-[#3B4953] dark:text-[#F4F5EE] placeholder-[#78887B]/60 focus:border-[#5A7863] outline-none shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#3B4953] dark:text-[#F4F5EE] mb-1 font-semibold">Email Address (For Verification Code)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5A7863] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maya@example.com"
                    className="w-full bg-[#FFFFFF] dark:bg-[#101712] border border-[#5A7863]/25 dark:border-[#2B3E2F] rounded-xl pl-9 pr-3 py-2.5 text-[#3B4953] dark:text-[#F4F5EE] placeholder-[#78887B]/60 focus:border-[#5A7863] outline-none shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#3B4953] dark:text-[#F4F5EE] mb-1 font-semibold">Create Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#5A7863] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-[#FFFFFF] dark:bg-[#101712] border border-[#5A7863]/25 dark:border-[#2B3E2F] rounded-xl pl-9 pr-3 py-2.5 text-[#3B4953] dark:text-[#F4F5EE] placeholder-[#78887B]/60 focus:border-[#5A7863] outline-none shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#5A7863] hover:bg-[#4C6753] text-[#EBF4DD] font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'Sending Code...' : 'Send 6-Digit Email Code'}</span>
              </button>
            </motion.form>
          )}

          {mode === 'otp' && (
            <motion.form
              key="otp"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onSubmit={handleVerifyOtp}
              className="space-y-4 text-xs relative z-10"
            >
              <div>
                <div className="flex items-center justify-center gap-2 mb-2 text-[#5A7863]">
                  <Mail className="w-4 h-4" />
                  <span className="font-semibold text-center text-[#3B4953] dark:text-[#F4F5EE]">
                    Enter 6-Digit Verification Code
                  </span>
                </div>
                <div className="flex justify-center">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtp(val);
                      if (val.length === 6) {
                        handleVerifyOtp(undefined, val);
                      }
                    }}
                    placeholder="123456"
                    className="w-48 text-center text-2xl font-mono font-bold tracking-[6px] bg-[#FFFFFF] dark:bg-[#101712] border-2 border-[#5A7863] rounded-xl py-3 text-[#5A7863] outline-none shadow-inner"
                  />
                </div>
                <p className="text-[11px] text-[#78887B] dark:text-[#8B9A8C] text-center mt-2">
                  Code sent to <span className="text-[#3B4953] dark:text-[#F4F5EE] font-semibold">{email}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 rounded-xl bg-[#5A7863] hover:bg-[#4C6753] text-[#EBF4DD] font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{loading ? 'Verifying...' : 'Verify Code & Sign In'}</span>
              </button>

              <div className="flex items-center justify-between pt-2 text-[11px] text-[#5A7863]">
                <button
                  type="button"
                  onClick={() => setMode('otp-login')}
                  className="hover:text-[#3B4953] dark:hover:text-[#F4F5EE] transition-colors cursor-pointer"
                >
                  ← Change Email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="hover:underline cursor-pointer font-semibold"
                >
                  Resend Code
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Corporate / Enterprise Switcher Link */}
        <div className="mt-5 pt-3.5 border-t border-[#5A7863]/15 dark:border-[#2A322A] flex items-center justify-between text-[11px] relative z-10">
          <span className="text-[#78887B] dark:text-[#8B9A8C]">Traveling for work or company?</span>
          {onSwitchToCorporate && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToCorporate();
              }}
              className="text-[#5A7863] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Corporate Portal →</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
