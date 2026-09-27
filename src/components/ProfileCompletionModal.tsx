'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Phone,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  HeartHandshake,
} from 'lucide-react';
import { AuthSessionUser } from '@/lib/auth-service';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  user: AuthSessionUser | null;
  onComplete: (updatedUser: AuthSessionUser) => void;
  onClose?: () => void;
}

const GENDER_OPTIONS = [
  { id: 'male', label: 'Male', icon: '👨' },
  { id: 'female', label: 'Female', icon: '👩' },
  { id: 'non-binary', label: 'Non-binary', icon: '⚧' },
  { id: 'other', label: 'Prefer not to say', icon: '✨' },
];

export const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
  isOpen,
  user,
  onComplete,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('female');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.gender) setGender(user.gender);
      if (user.phone) {
        if (user.phone.startsWith('+91')) {
          setCountryCode('+91');
          setPhone(user.phone.replace('+91', '').trim());
        } else {
          setPhone(user.phone);
        }
      }
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = name.trim();
    const cleanPhoneDigits = phone.replace(/\D/g, '');

    if (!cleanName) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!gender) {
      setErrorMsg('Please select your gender.');
      return;
    }

    if (!cleanPhoneDigits || cleanPhoneDigits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    const fullPhoneNumber = `${countryCode} ${cleanPhoneDigits}`;

    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete-profile',
          userId: user.id,
          name: cleanName,
          gender,
          phone: fullPhoneNumber,
          upiId: user.upiId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete profile');
      }

      onComplete(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-[#F4F5EE] dark:bg-[#151D18] border border-[#5A7863]/20 dark:border-[#2B3E2F] p-6 sm:p-7 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden text-left text-[#3B4953] dark:text-[#F4F2E6]"
      >
        {/* Subtle warm accent glows: pastel yellow and soft forest */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FEF08A]/35 dark:bg-[#D9EE86]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#5A7863]/10 dark:bg-[#2D7A5C]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#5A7863]/15 dark:border-[#2B3E2F] pb-4 mb-5 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-[#5A7863]/15 border border-[#5A7863]/30 text-[#5A7863] flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-display font-bold text-lg text-[#3B4953] dark:text-[#F4F2E6]">
              Complete Your Profile
            </h3>
            <p className="text-xs text-[#5A7863] dark:text-[#8B9A8C]">
              Welcome to Tulis! A few quick details to personalize your trip experience.
            </p>
          </div>
        </div>

        {/* User Google Capsule */}
        <div className="p-3 bg-[#E8EEDC] dark:bg-[#101712] rounded-2xl border border-[#5A7863]/15 dark:border-[#2A322A] flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full border border-[#5A7863] object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#5A7863] text-[#EBF4DD] font-bold flex items-center justify-center text-sm shrink-0">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#3B4953] dark:text-[#F4F2E6] block truncate">{user.name}</span>
              <span className="text-[11px] text-[#78887B] dark:text-[#8B9A8C] truncate block">{user.email}</span>
            </div>
          </div>
          <span className="text-[10px] text-[#5A7863] dark:text-[#D9EE86] font-mono bg-[#5A7863]/10 border border-[#5A7863]/25 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 font-semibold">
            <ShieldCheck className="w-3 h-3" /> Verified
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#B5484C]/15 border border-[#B5484C]/30 text-[#B5484C] dark:text-[#FCA5A5] text-xs flex items-center gap-2 relative z-10">
            <AlertCircle className="w-4 h-4 text-[#B5484C] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs relative z-10">
          {/* Full Name */}
          <div>
            <label className="block text-[#3B4953] dark:text-[#8B9A8C] mb-1 font-semibold">
              Full Name <span className="text-[#5A7863]">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#5A7863] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya Sharma"
                className="w-full bg-[#FFFFFF] dark:bg-[#101712] border border-[#5A7863]/25 dark:border-[#2B3E2F] rounded-xl pl-9 pr-3 py-2.5 text-[#3B4953] dark:text-[#F4F2E6] placeholder-[#78887B]/60 focus:border-[#5A7863] outline-none font-medium shadow-xs"
              />
            </div>
          </div>

          {/* Gender Selector Chips */}
          <div>
            <label className="block text-[#3B4953] dark:text-[#8B9A8C] mb-1.5 font-semibold">
              Gender <span className="text-[#5A7863]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GENDER_OPTIONS.map((opt) => {
                const isSelected = gender.toLowerCase() === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setGender(opt.id)}
                    className={`py-2 px-3 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#5A7863] bg-[#5A7863] text-[#EBF4DD] font-bold shadow-xs'
                        : 'border-[#5A7863]/20 bg-[#E8EEDC] dark:bg-[#101712] text-[#3B4953] dark:text-[#8B9A8C] hover:border-[#5A7863]/40'
                    }`}
                  >
                    <span className="text-sm">{opt.icon}</span>
                    <span className="text-xs truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[#3B4953] dark:text-[#8B9A8C] font-semibold">
                Mobile Number <span className="text-[#5A7863]">*</span>
              </label>
              <span className="text-[10px] text-[#78887B] dark:text-[#8B9A8C]/80 font-mono">For settlement alerts</span>
            </div>
            <div className="flex gap-2">
              <div className="w-20 bg-[#E8EEDC] dark:bg-[#101712] border border-[#5A7863]/25 dark:border-[#2A322A] rounded-xl px-2.5 py-2.5 text-[#3B4953] dark:text-[#F4F2E6] font-mono text-center text-xs flex items-center justify-center font-bold">
                🇮🇳 {countryCode}
              </div>
              <div className="relative flex-1">
                <Phone className="w-4 h-4 text-[#5A7863] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className="w-full bg-[#FFFFFF] dark:bg-[#101712] border border-[#5A7863]/25 dark:border-[#2B3E2F] rounded-xl pl-9 pr-3 py-2.5 text-[#3B4953] dark:text-[#F4F2E6] placeholder-[#78887B]/60 focus:border-[#5A7863] outline-none font-mono font-medium text-xs tracking-wider shadow-xs"
                />
              </div>
            </div>
            <p className="text-[10px] text-[#78887B] dark:text-[#8B9A8C]/70 mt-1">
              Used for instant UPI payment notifications & squad contact during trips.
            </p>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-[#5A7863] hover:bg-[#4C6753] text-[#EBF4DD] font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            <span>{loading ? 'Saving Profile...' : 'Complete Profile & Continue'}</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
