'use client';

import React, { useState } from 'react';
import { BookingCategory, Participant } from '@/lib/types';
import { X, Calendar, DollarSign, Tag, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserAvatar } from './UserAvatar';

interface AddBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  onAddBooking: (bookingData: {
    category: BookingCategory;
    title: string;
    vendor: string;
    estimatedCost: number;
    actualCost: number;
    participantIds: string[];
  }) => void;
}

export const AddBookingModal: React.FC<AddBookingModalProps> = ({
  isOpen,
  onClose,
  participants,
  onAddBooking,
}) => {
  const [title, setTitle] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState<BookingCategory>('activity');
  const [estimatedCost, setEstimatedCost] = useState<number>(500);
  const [actualCost, setActualCost] = useState<number>(550);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>(
    participants.map((p) => p.id)
  );

  if (!isOpen) return null;

  const handleToggleParticipant = (id: string) => {
    setSelectedParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddBooking({
      category,
      title,
      vendor,
      estimatedCost,
      actualCost,
      participantIds: selectedParticipantIds,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-surface-overlay border border-surface-hairline p-6 rounded-2xl max-w-lg w-full space-y-5 shadow-2xl neu-raised"
      >
        <div className="flex items-center justify-between border-b border-surface-hairline pb-4">
          <h3 className="text-lg font-display font-bold text-ink-primary flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" /> Create Itinerary Booking
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-ink-muted hover:text-ink-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-ink-muted mb-1">Booking Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fuji-Hakone Sightseeing Express Pass"
              className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2.5 text-ink-primary focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-ink-muted mb-1">Vendor / Operator</label>
              <input
                type="text"
                required
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Odakyu Electric Railway"
                className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2.5 text-ink-primary focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-ink-muted mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2.5 text-ink-primary focus:border-emerald-500 outline-none cursor-pointer"
              >
                <option value="transport">Transport</option>
                <option value="lodging">Lodging</option>
                <option value="activity">Activity</option>
                <option value="food">Food & Dining</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-ink-muted mb-1">Estimated Budget (₹)</label>
              <input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2.5 font-numeric text-ink-primary focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-ink-muted mb-1">Actual Final Cost (₹)</label>
              <input
                type="number"
                value={actualCost}
                onChange={(e) => setActualCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2.5 font-numeric font-bold text-emerald-400 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Participant Scope Selector */}
          <div className="space-y-2 pt-2 border-t border-surface-hairline">
            <label className="block text-ink-muted font-semibold">Participating Members</label>
            <div className="grid grid-cols-2 gap-2">
              {participants.map((p) => {
                const isSelected = selectedParticipantIds.includes(p.id);
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => handleToggleParticipant(p.id)}
                    className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                        : 'bg-surface-base border-surface-hairline text-ink-muted opacity-50'
                    }`}
                  >
                    <UserAvatar name={p.name} id={p.id} avatarUrl={p.avatarUrl} size="xs" />
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card-actions pt-3 border-t border-surface-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-ink-secondary hover:text-ink-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-ink-primary text-surface-base hover:opacity-90 font-semibold text-xs shadow-subtle transition-all active:scale-95"
            >
              Save Booking to Timeline
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
