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
    <div className="fixed inset-0 z-50 bg-[#1C261F]/70 backdrop-blur-md flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 'splash' ? (
          <motion.div
            key="splash"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="max-w-lg w-full text-center space-y-6 p-6 sm:p-8 bg-[#F4F5EE] border-2 border-[#D1D8BE] rounded-3xl shadow-2xl text-[#3B4953]"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#EBF4DD] border border-[#D1D8BE] text-[#5A7863] flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-8 h-8 animate-pulse text-[#5A7863]" />
            </div>

            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#5A7863] font-bold">
                Tulis Human Safety Suite
              </span>
              <h1 className="font-serif-display text-2xl sm:text-3xl font-extrabold text-[#3B4953] tracking-tight leading-tight">
                "The world is big, go explore with confidence."
              </h1>
              <p className="text-xs sm:text-sm text-[#6B7C85] max-w-md mx-auto leading-relaxed">
                Tulis Safety Mode provides discreet, high-confidence peace of mind. Live location emergency beacon, 1-tap WhatsApp location sharing, 112 dialing, and nearby verified safe havens. Never restrictive — always protective.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => setStep('contacts')}
                className="px-6 py-3.5 rounded-2xl bg-[#5A7863] hover:bg-[#486350] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Setup Trusted Contacts (30s)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3.5 rounded-2xl bg-white hover:bg-[#EBF4DD] border border-[#D1D8BE] text-[#6B7C85] hover:text-[#3B4953] font-semibold text-xs transition-colors cursor-pointer"
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
            className="bg-[#F4F5EE] border-2 border-[#D1D8BE] p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl relative text-left text-[#3B4953]"
          >
            <div className="flex items-center justify-between border-b border-[#D1D8BE] pb-4 mb-5">
              <div>
                <h3 className="font-serif-display font-bold text-lg text-[#3B4953]">
                  Add Trusted Contacts
                </h3>
                <p className="text-xs text-[#6B7C85]">
                  These contacts receive your live beacon URL if SOS is tapped.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-[#6B7C85] hover:text-[#3B4953] hover:bg-[#EBF4DD] cursor-pointer"
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
                    className="p-2.5 rounded-xl bg-white border border-[#D1D8BE] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#3B4953]">{c.name}</span>
                      <span className="text-[#6B7C85] text-[11px] ml-2">({c.relationship})</span>
                      <p className="text-[11px] text-[#5A7863] font-mono font-bold">{c.phone}</p>
                    </div>
                    <span className="text-[10px] bg-[#EBF4DD] text-[#5A7863] border border-[#D1D8BE] px-2 py-0.5 rounded-full font-semibold">
                      Primary
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Add Contact Form */}
            <form onSubmit={handleAddContact} className="space-y-3 text-xs mb-5">
              <div>
                <label className="block text-[#6B7C85] mb-1 font-semibold">Contact Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#6B7C85] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mom, Maya Sharma"
                    className="w-full bg-white border border-[#D1D8BE] rounded-xl pl-9 pr-3 py-2 text-[#3B4953] placeholder:text-[#6B7C85]/60 focus:border-[#5A7863] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#6B7C85] mb-1 font-semibold">WhatsApp / Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#6B7C85] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-[#D1D8BE] rounded-xl pl-9 pr-3 py-2 text-[#3B4953] placeholder:text-[#6B7C85]/60 focus:border-[#5A7863] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#6B7C85] mb-1 font-semibold">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full bg-white border border-[#D1D8BE] rounded-xl px-3 py-2 text-[#3B4953] focus:border-[#5A7863] outline-none"
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
                className="w-full py-2.5 rounded-xl bg-white hover:bg-[#EBF4DD] border border-[#D1D8BE] text-[#3B4953] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#5A7863]" />
                <span>{loading ? 'Adding...' : 'Add Contact'}</span>
              </button>
            </form>

            <button
              type="button"
              onClick={onComplete}
              className="w-full py-3 rounded-2xl bg-[#5A7863] hover:bg-[#486350] text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
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
