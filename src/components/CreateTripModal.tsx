'use client';

import React, { useState } from 'react';
import { Trip, Participant } from '@/lib/types';
import { X, Compass, Calendar, DollarSign, Users, Plus, Trash2, CheckCircle2, ArrowRight, Sparkles, MapPin, User, QrCode, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (
    creator: {
      name: string;
      email: string;
      upiId: string;
      avatarUrl?: string;
    },
    tripData: {
      title: string;
      destination: string;
      startDate: string;
      endDate: string;
      budgetCeiling: number;
    },
    initialParticipants: Array<{
      name: string;
      email: string;
      upiId: string;
      roomTier: 'suite' | 'standard' | 'economy';
      avatarUrl?: string;
    }>
  ) => void;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onCreateTrip,
}) => {
  const [step, setStep] = useState<number>(1);

  // Step 1: Creator Details
  const [creatorName, setCreatorName] = useState('');
  const [creatorEmail, setCreatorEmail] = useState('');
  const [creatorUpi, setCreatorUpi] = useState('');
  const [creatorAvatarUrl, setCreatorAvatarUrl] = useState('');

  // Step 2: Trip Details
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('2026-12-01');
  const [endDate, setEndDate] = useState('2026-12-08');
  const [budgetCeiling, setBudgetCeiling] = useState<number>(120000);

  // Step 3: Additional Members
  const [travelers, setTravelers] = useState<
    Array<{
      name: string;
      email: string;
      upiId: string;
      roomTier: 'suite' | 'standard' | 'economy';
      avatarUrl?: string;
    }>
  >([]);

  const [newTravelerName, setNewTravelerName] = useState('');
  const [newTravelerUpi, setNewTravelerUpi] = useState('');
  const [newTravelerAvatarUrl, setNewTravelerAvatarUrl] = useState('');

  if (!isOpen) return null;

  const handleAddTraveler = () => {
    if (!newTravelerName.trim()) return;
    setTravelers((prev) => [
      ...prev,
      {
        name: newTravelerName,
        email: `${newTravelerName.toLowerCase().replace(/\s+/g, '')}@fareshare.in`,
        upiId: newTravelerUpi || `${newTravelerName.toLowerCase().replace(/\s+/g, '')}@upi`,
        roomTier: 'standard',
        avatarUrl: newTravelerAvatarUrl.trim() || undefined,
      },
    ]);
    setNewTravelerName('');
    setNewTravelerUpi('');
    setNewTravelerAvatarUrl('');
  };

  const handleRemoveTraveler = (idx: number) => {
    setTravelers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorName.trim() || !title.trim() || !destination.trim() || budgetCeiling <= 0) return;

    onCreateTrip(
      {
        name: creatorName.trim(),
        email: creatorEmail.trim() || `${creatorName.toLowerCase().replace(/\s+/g, '')}@fareshare.in`,
        upiId: creatorUpi.trim() || `${creatorName.toLowerCase().replace(/\s+/g, '')}@okicici`,
        avatarUrl: creatorAvatarUrl.trim() || undefined,
      },
      {
        title: title.trim(),
        destination: destination.trim(),
        startDate,
        endDate,
        budgetCeiling,
      },
      travelers
    );

    // Reset Form
    setStep(1);
    setCreatorName('');
    setCreatorAvatarUrl('');
    setTitle('');
    setDestination('');
    setTravelers([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-surface-overlay border border-surface-hairline p-6 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl neu-raised"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-surface-hairline pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-emerald">
              <Compass className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-lg text-ink-primary">
                Create New Group Trip
              </h3>
              <p className="text-xs text-ink-secondary">
                Step {step} of 3:{' '}
                {step === 1 ? 'Trip Chief Details' : step === 2 ? 'Trip Info & Budget' : 'Traveler Roster'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl text-ink-muted hover:text-ink-primary hover:bg-surface-overlay">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-ink-secondary space-y-1">
                  <span className="font-bold text-emerald-400 block">You are the Trip Organizer / Chief 👑</span>
                  <p>Enter your details below. You will be set as the trip creator and initial admin.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                    Your Full Name (Organizer)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      placeholder="e.g. Deepak V"
                      className="w-full bg-surface-base border border-surface-hairline rounded-xl pl-9 pr-3 py-2.5 text-xs text-ink-primary font-medium focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-ink-muted mb-1 font-semibold">Email Address</label>
                    <input
                      type="email"
                      value={creatorEmail}
                      onChange={(e) => setCreatorEmail(e.target.value)}
                      placeholder="deepak@fareshare.in"
                      className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2.5 text-xs text-ink-primary focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-ink-muted mb-1 font-semibold">UPI VPA for Instant Payments</label>
                    <div className="relative">
                      <QrCode className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={creatorUpi}
                        onChange={(e) => setCreatorUpi(e.target.value)}
                        placeholder="deepak@okicici"
                        className="w-full bg-surface-base border border-surface-hairline rounded-xl pl-9 pr-3 py-2.5 text-xs text-ink-primary font-numeric focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-ink-muted font-semibold">
                      Profile Image URL (Optional)
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">Defaults to Geometric SVG Persona</span>
                  </div>
                  <input
                    type="url"
                    value={creatorAvatarUrl}
                    onChange={(e) => setCreatorAvatarUrl(e.target.value)}
                    placeholder="https://... (leave empty for crisp designer SVG avatar)"
                    className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2 text-xs text-ink-primary focus:border-emerald-500 outline-none placeholder:text-ink-muted"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-ink-muted mb-1 font-semibold">Trip Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Manali Snow Expedition 2026"
                      className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2.5 text-xs text-ink-primary focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-ink-muted mb-1 font-semibold">Destination</label>
                    <input
                      type="text"
                      required
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Manali & Solang, Himachal"
                      className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2.5 text-xs text-ink-primary focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-ink-muted mb-1 font-semibold">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2 text-xs text-ink-primary focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-ink-muted mb-1 font-semibold">End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2 text-xs text-ink-primary focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-ink-muted mb-1 font-semibold">Budget Ceiling (₹ INR)</label>
                    <input
                      type="number"
                      required
                      step="1000"
                      value={budgetCeiling}
                      onChange={(e) => setBudgetCeiling(parseFloat(e.target.value) || 0)}
                      className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2 text-xs font-numeric font-bold text-ink-primary focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="p-3 rounded-xl bg-surface-base border border-surface-hairline flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-ink-primary">Organizer: {creatorName}</span>
                    <span className="text-[10px] text-ink-muted block">A unique 6-character Invite Code will be generated!</span>
                  </div>
                  <span className="font-numeric font-bold text-emerald-400 text-sm">₹{budgetCeiling.toLocaleString('en-IN')}</span>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Additional Travelers (Optional — {travelers.length} Added)
                  </label>

                  {travelers.length > 0 && (
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {travelers.map((t, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-surface-base border border-surface-hairline flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-ink-primary">{t.name}</span>
                            <span className="text-[10px] text-ink-muted block">UPI: {t.upiId}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveTraveler(idx)}
                            className="p-1 rounded text-ink-muted hover:text-ledger-deficit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Quick Traveler Row */}
                <div className="p-3 rounded-xl bg-surface-base border border-surface-hairline space-y-2">
                  <span className="text-xs font-semibold text-ink-secondary block">Add Member</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Traveler Name (e.g. Rohan Mehta)"
                      value={newTravelerName}
                      onChange={(e) => setNewTravelerName(e.target.value)}
                      className="bg-surface-raised border border-surface-hairline rounded-lg px-2.5 py-1.5 text-xs text-ink-primary outline-none"
                    />
                    <input
                      type="text"
                      placeholder="UPI VPA (e.g. rohan@upi)"
                      value={newTravelerUpi}
                      onChange={(e) => setNewTravelerUpi(e.target.value)}
                      className="bg-surface-raised border border-surface-hairline rounded-lg px-2.5 py-1.5 text-xs text-ink-primary outline-none"
                    />
                  </div>
                  <input
                    type="url"
                    placeholder="Profile Photo URL (Optional - defaults to SVG persona)"
                    value={newTravelerAvatarUrl}
                    onChange={(e) => setNewTravelerAvatarUrl(e.target.value)}
                    className="w-full bg-surface-raised border border-surface-hairline rounded-lg px-2.5 py-1.5 text-xs text-ink-primary outline-none placeholder:text-ink-muted"
                  />
                  <button
                    type="button"
                    onClick={handleAddTraveler}
                    className="w-full py-1.5 rounded-lg bg-surface-overlay text-emerald-400 text-xs font-semibold hover:bg-surface-hairline transition-all flex items-center justify-center gap-1 border border-surface-hairline hover:border-emerald-500/30"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Member to Roster
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Footer Controls */}
          <div className="card-actions pt-4 border-t border-surface-hairline">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-secondary hover:text-ink-primary cursor-pointer"
              >
                Back
              </button>
            ) : (
              <span />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !creatorName.trim()) return;
                  if (step === 2 && (!title.trim() || !destination.trim())) return;
                  setStep((s) => s + 1);
                }}
                className="px-6 py-2.5 rounded-xl bg-ink-primary text-surface-base hover:opacity-90 text-xs font-semibold shadow-subtle flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-ink-primary text-surface-base hover:opacity-90 text-xs font-semibold shadow-subtle flex items-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Initialize Custom Trip Ledger</span>
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};
