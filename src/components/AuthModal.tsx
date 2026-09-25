'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, Key, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  defaultMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'otp'>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [simulatedOtpNotice, setSimulatedOtpNotice] = useState<string | null>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSimulatedOtpNotice(null);
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
        onAuthSuccess(data.user);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Google authentication failed');
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

      if (data.isSimulated && data.simulatedOtp) {
        setSimulatedOtpNotice(`Dev Sandbox Code: ${data.simulatedOtp}`);
      }

      setSuccessMessage('Verification code sent to your email!');
      setMode('otp');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify 6-digit OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setLoading(true);
    resetMessages();

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-otp', email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid or expired verification code');
      }

      setSuccessMessage('Email verified successfully! Setting up your session...');
      setTimeout(() => {
        onAuthSuccess(data.user);
        onClose();
      }, 700);
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
      if (data.isSimulated && data.simulatedOtp) {
        setSimulatedOtpNotice(`Dev Sandbox Code: ${data.simulatedOtp}`);
      }
      setSuccessMessage('A new verification code has been dispatched.');
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
                {mode === 'otp' ? 'Verify Your Email' : mode === 'login' ? 'Welcome to Tulis' : 'Create an Account'}
              </h3>
              <p className="text-xs text-[#8B9A8C]">
                {mode === 'otp'
                  ? `Enter the 6-digit code sent to ${email}`
                  : 'Manage squad trips, verify ledgers & settle balances.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8B9A8C] hover:text-[#F4F2E6] hover:bg-[#2A322A] transition-colors"
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

        {simulatedOtpNotice && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
            <span className="font-mono font-semibold">{simulatedOtpNotice}</span>
            <button
              type="button"
              onClick={() => {
                const match = simulatedOtpNotice.match(/\d{6}/);
                if (match) setOtp(match[0]);
              }}
              className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 rounded text-[11px] font-bold"
            >
              Auto-fill
            </button>
          </div>
        )}

        {/* Mode Switcher Tabs (Login vs Register) */}
        {mode !== 'otp' && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#12160F] rounded-xl border border-[#2A322A] text-xs font-semibold mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                resetMessages();
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[#5FA97D] text-[#12160F] font-bold shadow-md'
                  : 'text-[#8B9A8C] hover:text-[#F4F2E6]'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                resetMessages();
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-[#5FA97D] text-[#12160F] font-bold shadow-md'
                  : 'text-[#8B9A8C] hover:text-[#F4F2E6]'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Google One-Tap / Button Login */}
        {mode !== 'otp' && (
          <div className="mb-5">
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
            ) : (
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(
                    'To enable real Google Sign-In, add your NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env.local and configure Authorized JavaScript Origins.'
                  );
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#12160F] hover:bg-[#2A322A] border border-[#2A322A] text-xs font-semibold text-[#F4F2E6] flex items-center justify-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            )}

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2A322A]"></div>
              </div>
              <span className="relative bg-[#1B2119] px-3 text-[11px] text-[#8B9A8C] uppercase tracking-wider font-semibold">
                Or with Email
              </span>
            </div>
          </div>
        )}

        {/* Content Body Based on Mode */}
        <AnimatePresence mode="wait">
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
                className="w-full py-3 rounded-xl bg-[#5FA97D] hover:bg-[#4E9A6E] text-[#12160F] font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{loading ? 'Authenticating...' : 'Sign In to Account'}</span>
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
                      className="px-2.5 py-1 rounded-lg bg-[#12160F] hover:bg-[#2A322A] border border-[#2A322A] text-[11px] text-[#8B9A8C] hover:text-[#5FA97D] transition-colors"
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
                className="w-full py-3 rounded-xl bg-[#5FA97D] hover:bg-[#4E9A6E] text-[#12160F] font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
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
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[#8B9A8C] mb-2 font-semibold text-center">
                  Enter 6-Digit Code sent via Resend
                </label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-48 text-center text-2xl font-mono font-bold tracking-[6px] bg-[#12160F] border-2 border-[#5FA97D] rounded-xl py-3 text-[#5FA97D] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 rounded-xl bg-[#5FA97D] hover:bg-[#4E9A6E] text-[#12160F] font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{loading ? 'Verifying...' : 'Verify Code & Sign In'}</span>
              </button>

              <div className="flex items-center justify-between pt-2 text-[11px] text-[#8B9A8C]">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="hover:text-[#F4F2E6] transition-colors"
                >
                  ← Change Email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-[#5FA97D] hover:underline"
                >
                  Resend Code
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
