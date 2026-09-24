import React, { useState, useEffect } from 'react';
import { Booking, BookingCategory, Participant } from '@/lib/types';
import { X, Edit3, Save, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from './UserAvatar';

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  participants: Participant[];
  onSaveBooking: (updatedBooking: Partial<Booking> & { id: string }) => void;
}

export const EditBookingModal: React.FC<EditBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  participants,
  onSaveBooking,
}) => {
  const [title, setTitle] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState<BookingCategory>('activity');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [actualCost, setActualCost] = useState<number>(0);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);

  useEffect(() => {
    if (booking) {
      setTitle(booking.title);
      setVendor(booking.vendor);
      setCategory(booking.category);
      setEstimatedCost(booking.estimatedCost);
      setActualCost(booking.actualCost);
      setSelectedParticipantIds(booking.participantIds || []);
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const toggleParticipant = (pId: string) => {
    setSelectedParticipantIds((prev) =>
      prev.includes(pId) ? prev.filter((id) => id !== pId) : [...prev, pId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBooking({
      id: booking.id,
      title,
      vendor,
      category,
      estimatedCost,
      actualCost,
      participantIds: selectedParticipantIds,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface-card border border-surface-border rounded-2xl p-6 w-full max-w-lg shadow-2xl relative text-ink-primary"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-ink-muted hover:text-ink-primary rounded-full hover:bg-surface-elevated transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
              <Edit3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Edit Booking & Revision</h3>
              <p className="text-sm text-ink-muted">Modify rates, vendor, or traveler list</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                Booking Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-sm focus:outline-none focus:border-accent-cyan"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-sm focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BookingCategory)}
                  className="w-full px-4 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-sm focus:outline-none focus:border-accent-cyan"
                >
                  <option value="lodging">Lodging</option>
                  <option value="transport">Transport</option>
                  <option value="activity">Activity</option>
                  <option value="food">Food & Dining</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                  Estimated Cost (₹)
                </label>
                <input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  min="0"
                  className="w-full px-4 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-sm focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                  Actual / Revised Cost (₹)
                </label>
                <input
                  type="number"
                  value={actualCost}
                  onChange={(e) => setActualCost(Number(e.target.value))}
                  min="0"
                  className="w-full px-4 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-sm focus:outline-none focus:border-accent-cyan"
                />
              </div>
            </div>

            {/* Participant Selection */}
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-accent-cyan" /> Scoped Travelers
                </span>
                <span className="text-accent-cyan text-[11px] font-normal">
                  {selectedParticipantIds.length} of {participants.length} selected
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {participants.map((p) => {
                  const isSelected = selectedParticipantIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleParticipant(p.id)}
                      className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 border text-left transition ${
                        isSelected
                          ? 'border-accent-cyan bg-accent-cyan/10 font-medium text-accent-cyan'
                          : 'border-surface-border bg-surface-elevated text-ink-muted hover:border-ink-muted'
                      }`}
                    >
                      <UserAvatar name={p.name} id={p.id} avatarUrl={p.avatarUrl} size="xs" />
                      <span className="truncate">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-surface-border text-ink-muted hover:text-ink-primary hover:bg-surface-elevated transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-accent-gradient text-white shadow-lg shadow-accent-cyan/20 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Booking Revision
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
