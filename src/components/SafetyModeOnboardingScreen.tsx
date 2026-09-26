'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Heart,
  UserPlus,
  Phone,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  Radio,
} from 'lucide-react';

interface SafetyModeOnboardingScreenProps {
  isOpen: boolean;
  userId: string;
  onComplete: () => void;
  onClose: () => void;
}

export const SafetyModeOnboardingScreen: React.FC<SafetyModeOnboardingScreenProps> = ({
  isOpen,
  userId,
  onComplete,
  onClose,
}) => {
  const [step, setStep] = useState<'splash' | 'contacts'>('splash');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Friend');
  const [loading, setLoading] = useState(false);
  const [savedContacts, setSavedContacts] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-emergency-contact',
          userId,
          name: name.trim(),
          phone: phone.trim(),
          relationship,
          isPrimary: savedContacts.length === 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedContacts((prev) => [
          ...prev,
          { id: data.id, name: name.trim(), phone: phone.trim(), relationship },
        ]);
        setName('');
        setPhone('');
      }
    } catch (err) {
      console.warn('Add emergency contact error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 'splash' ? (
          <motion.div
            key="splash"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="max-w-lg w-full text-center space-y-6 p-6 sm:p-8"
          >
            <div className="w-20 h-20 rounded-3xl bg-[#5FA97D]/20 border border-[#5FA97D]/40 text-[#5FA97D] flex items-center justify-center mx-auto shadow-2xl">
              <ShieldCheck className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#5FA97D] font-bold">
                Tulis Women's Safety Mode
              </span>
              <h1 className="font-serif-display text-3xl sm:text-4xl font-extrabold text-[#F4F2E6] tracking-tight leading-tight">
                "The world is big, go make it yours."
              </h1>
              <p className="text-sm text-[#8B9A8C] max-w-md mx-auto leading-relaxed">
                Tulis Safety Mode provides discreet, high-confidence peace of mind. Live location emergency beacon, 1-tap 112 dialing, and nearby verified safe havens. Never restrictive — always protective.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => setStep('contacts')}
                className="px-6 py-3.5 rounded-2xl bg-[#5FA97D] hover:bg-[#4E9A6E] text-[#12160F] font-bold text-xs shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Setup Trusted Contacts (30s)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3.5 rounded-2xl bg-[#1B2119] hover:bg-[#252E23] border border-[#2A322A] text-[#8B9A8C] hover:text-[#F4F2E6] font-semibold text-xs transition-colors cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="contacts"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#1B2119] border border-[#2A322A] p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl relative text-left"
          >
            <div className="flex items-center justify-between border-b border-[#2A322A] pb-4 mb-5">
              <div>
                <h3 className="font-serif-display font-bold text-lg text-[#F4F2E6]">
                  Add Trusted Contacts
                </h3>
                <p className="text-xs text-[#8B9A8C]">
                  These contacts receive your live beacon URL if SOS is tapped.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-[#8B9A8C] hover:text-[#F4F2E6] hover:bg-[#2A322A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Added Contacts */}
            {savedContacts.length > 0 && (
              <div className="mb-4 space-y-2">
                {savedContacts.map((c, idx) => (
                  <div
                    key={c.id || idx}
                    className="p-2.5 rounded-xl bg-[#12160F] border border-[#2A322A] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#F4F2E6]">{c.name}</span>
                      <span className="text-[#8B9A8C] text-[11px] ml-2">({c.relationship})</span>
                      <p className="text-[11px] text-[#5FA97D] font-mono">{c.phone}</p>
                    </div>
                    <span className="text-[10px] bg-[#5FA97D]/20 text-[#5FA97D] px-2 py-0.5 rounded font-semibold">
                      Primary
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Add Contact Form */}
            <form onSubmit={handleAddContact} className="space-y-3 text-xs mb-5">
              <div>
                <label className="block text-[#8B9A8C] mb-1 font-semibold">Contact Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8B9A8C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mom, Maya Sharma"
                    className="w-full bg-[#12160F] border border-[#2A322A] rounded-xl pl-9 pr-3 py-2 text-[#F4F2E6] placeholder-[#8B9A8C]/50 focus:border-[#5FA97D] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8B9A8C] mb-1 font-semibold">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8B9A8C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#12160F] border border-[#2A322A] rounded-xl pl-9 pr-3 py-2 text-[#F4F2E6] placeholder-[#8B9A8C]/50 focus:border-[#5FA97D] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8B9A8C] mb-1 font-semibold">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full bg-[#12160F] border border-[#2A322A] rounded-xl px-3 py-2 text-[#F4F2E6] focus:border-[#5FA97D] outline-none"
                >
                  <option value="Friend">Friend</option>
                  <option value="Parent">Parent</option>
                  <option value="Partner">Partner</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Trip Lead">Trip Lead</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim() || !phone.trim()}
                className="w-full py-2.5 rounded-xl bg-[#2A322A] hover:bg-[#343F34] text-[#F4F2E6] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#5FA97D]" />
                <span>{loading ? 'Adding...' : 'Add Contact'}</span>
              </button>
            </form>

            <button
              type="button"
              onClick={onComplete}
              className="w-full py-3 rounded-xl bg-[#5FA97D] hover:bg-[#4E9A6E] text-[#12160F] font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Enable Safety Mode & Done</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
