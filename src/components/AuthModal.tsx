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
  defaultMode?: 'otp-login' | 'login' | 'register' | 'otp';
  onSwitchToCorporate?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  defaultMode = 'otp-login',
  onSwitchToCorporate,
}) => {
  const [mode, setMode] = useState<'otp-login' | 'login' | 'register' | 'otp'>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-[#1B2119] border border-[#2A322A] p-6 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden"
      >
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#5FA97D]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2A322A] pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5FA97D]/20 border border-[#5FA97D]/40 text-[#5FA97D] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-lg text-[#F4F2E6]">
                {mode === 'otp'
                  ? 'Verify 6-Digit Code'
                  : mode === 'otp-login'
                  ? 'Sign In with Email OTP'
                  : mode === 'login'
                  ? 'Welcome to Tulis'
                  : 'Create an Account'}
              </h3>
              <p className="text-xs text-[#8B9A8C]">
                {mode === 'otp'
                  ? `Enter the 6-digit code sent to ${email}`
                  : mode === 'otp-login'
                  ? 'Passwordless verification delivered in real-time via Resend.'
                  : 'Manage squad trips, verify ledgers & settle balances.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8B9A8C] hover:text-[#F4F2E6] hover:bg-[#2A322A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-[#B5484C]/15 border border-[#B5484C]/30 text-[#F4F2E6] text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#B5484C] shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-[#5FA97D]/15 border border-[#5FA97D]/30 text-[#F4F2E6] text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#5FA97D] shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}


        {/* Mode Switcher Tabs (Email OTP vs Password vs Sign Up) */}
        {mode !== 'otp' && (
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#12160F] rounded-xl border border-[#2A322A] text-xs font-semibold mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('otp-login');
                resetMessages();
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'otp-login'
                  ? 'bg-[#5FA97D] text-[#12160F] font-bold shadow-md'
                  : 'text-[#8B9A8C] hover:text-[#F4F2E6]'
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
                  ? 'bg-[#5FA97D] text-[#12160F] font-bold shadow-md'
                  : 'text-[#8B9A8C] hover:text-[#F4F2E6]'
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
                  ? 'bg-[#5FA97D] text-[#12160F] font-bold shadow-md'
                  : 'text-[#8B9A8C] hover:text-[#F4F2E6]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        )}

        {/* Google One-Tap / Button Login */}
        {mode !== 'otp' && (
          <div className="mb-4">
            {googleClientId && googleClientId !== '' && googleClientId !== 'dummy_client_id' ? (
              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setErrorMessage('Google Sign-In failed or was dismissed.')}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  text="continue_with"
                  width="100%"
                />
              </div>
            ) : null}

            <div className="relative my-3 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2A322A]"></div>
              </div>
              <span className="relative bg-[#1B2119] px-3 text-[10px] text-[#8B9A8C] uppercase tracking-wider font-semibold">
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
              className="space-y-3.5 text-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#8B9A8C] font-semibold">Your Email Address</label>
                  <span className="text-[10px] text-[#5FA97D] font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Powered by Resend
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8B9A8C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email (e.g. traveler@gmail.com)"
                    className="w-full bg-[#12160F] border border-[#2A322A] rounded-xl pl-9 pr-3 py-2.5 text-[#F4F2E6] placeholder-[#8B9A8C]/50 focus:border-[#5FA97D] outline-none font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3 rounded-xl bg-[#5FA97D] hover:bg-[#4E9A6E] text-[#12160F] font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{loading ? 'Dispatching Code...' : 'Send 6-Digit Code via Resend'}</span>
              </button>

              <div className="p-3 bg-[#12160F] rounded-xl border border-[#2A322A] text-[11px] text-[#8B9A8C] flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#5FA97D] shrink-0" />
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
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-[#8B9A8C] mb-1 font-semibold">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8B9A8C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full bg-[#12160F] border border-[#2A322A] rounded-xl pl-9 pr-3 py-2.5 text-[#F4F2E6] placeholder-[#8B9A8C]/50 focus:border-[#5FA97D] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8B9A8C] mb-1 font-semibold">Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#8B9A8C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#12160F] border border-[#2A322A] rounded-xl pl-9 pr-3 py-2.5 text-[#F4F2E6] placeholder-[#8B9A8C]/50 focus:border-[#5FA97D] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#5FA97D] hover:bg-[#4E9A6E] text-[#12160F] font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{loading ? 'Authenticating...' : 'Sign In with Password'}</span>
              </button>

              {/* Instant Demo Switcher for fast evaluation */}
              <div className="pt-3 border-t border-[#2A322A] mt-4">
                <span className="text-[10px] text-[#8B9A8C] uppercase tracking-wider font-semibold block mb-2">
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
                      className="px-2.5 py-1 rounded-lg bg-[#12160F] hover:bg-[#2A322A] border border-[#2A322A] text-[11px] text-[#8B9A8C] hover:text-[#5FA97D] transition-colors cursor-pointer"
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
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-[#8B9A8C] mb-1 font-semibold">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8B9A8C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Sharma"
                    className="w-full bg-[#12160F] border border-[#2A322A] rounded-xl pl-9 pr-3 py-2.5 text-[#F4F2E6] placeholder-[#8B9A8C]/50 focus:border-[#5FA97D] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8B9A8C] mb-1 font-semibold">Email Address (For Verification Code)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8B9A8C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maya@example.com"
                    className="w-full bg-[#12160F] border border-[#2A322A] rounded-xl pl-9 pr-3 py-2.5 text-[#F4F2E6] placeholder-[#8B9A8C]/50 focus:border-[#5FA97D] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8B9A8C] mb-1 font-semibold">Create Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#8B9A8C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-[#12160F] border border-[#2A322A] rounded-xl pl-9 pr-3 py-2.5 text-[#F4F2E6] placeholder-[#8B9A8C]/50 focus:border-[#5FA97D] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#5FA97D] hover:bg-[#4E9A6E] text-[#12160F] font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'Sending Code...' : 'Send 6-Digit Email Code via Resend'}</span>
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
              className="space-y-4 text-xs"
            >
              <div>
                <div className="flex items-center justify-center gap-2 mb-2 text-[#8B9A8C]">
                  <Mail className="w-4 h-4 text-[#5FA97D]" />
                  <span className="font-semibold text-center">
                    Enter 6-Digit Code sent via Resend
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
                    className="w-48 text-center text-2xl font-mono font-bold tracking-[6px] bg-[#12160F] border-2 border-[#5FA97D] rounded-xl py-3 text-[#5FA97D] outline-none shadow-inner"
                  />
                </div>
                <p className="text-[11px] text-[#8B9A8C] text-center mt-2">
                  Code sent to <span className="text-[#F4F2E6] font-semibold">{email}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 rounded-xl bg-[#5FA97D] hover:bg-[#4E9A6E] text-[#12160F] font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{loading ? 'Verifying...' : 'Verify Code & Sign In'}</span>
              </button>

              <div className="flex items-center justify-between pt-2 text-[11px] text-[#8B9A8C]">
                <button
                  type="button"
                  onClick={() => setMode('otp-login')}
                  className="hover:text-[#F4F2E6] transition-colors cursor-pointer"
                >
                  ← Change Email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-[#5FA97D] hover:underline cursor-pointer"
                >
                  Resend Code
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Corporate / Enterprise Switcher Link */}
        <div className="mt-5 pt-3.5 border-t border-[#2A322A] flex items-center justify-between text-[11px]">
          <span className="text-[#8B9A8C]">Traveling for work or company?</span>
          {onSwitchToCorporate && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToCorporate();
              }}
              className="text-[#5FA97D] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
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
