'use client';

import React, { useState, useMemo } from 'react';
import { Participant } from '@/lib/types';
import { optimizeRoomAllocations } from '@/lib/ledger-engine';
import {
  BedDouble,
  X,
  Sparkles,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { UserAvatar } from './UserAvatar';

interface RoomDef {
  name: string;
  tier: 'suite' | 'standard' | 'economy';
  capacity: number;
}

const DEFAULT_ROOMS: RoomDef[] = [
  { name: 'Villa Master Suite (Pool View)', tier: 'suite', capacity: 2 },
  { name: 'Deluxe Ocean Room', tier: 'standard', capacity: 2 },
  { name: 'Garden Guest Room', tier: 'standard', capacity: 2 },
  { name: 'Loft Twin Studio', tier: 'economy', capacity: 2 },
];

interface RoomOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  onApplyAssignments?: (assignments: any) => void;
}

export const RoomOptimizerModal: React.FC<RoomOptimizerModalProps> = ({
  isOpen,
  onClose,
  participants,
  onApplyAssignments,
}) => {
  const [rooms, setRooms] = useState<RoomDef[]>(DEFAULT_ROOMS);
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [newRoomTier, setNewRoomTier] = useState<'suite' | 'standard' | 'economy'>('standard');
  const [newRoomCapacity, setNewRoomCapacity] = useState<number>(2);

  const optimization = useMemo(() => {
    return optimizeRoomAllocations(participants, rooms);
  }, [participants, rooms]);

  if (!isOpen) return null;

  const handleAddRoom = () => {
    if (!newRoomName.trim()) return;
    setRooms((prev) => [
      ...prev,
      { name: newRoomName.trim(), tier: newRoomTier, capacity: newRoomCapacity },
    ]);
    setNewRoomName('');
  };

  const handleRemoveRoom = (index: number) => {
    setRooms((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl bg-surface-overlay border border-brand-gold/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Header Ribbon */}
        <div className="p-6 bg-gradient-to-r from-surface-base via-surface-raised to-surface-base border-b border-surface-hairline flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
              <BedDouble className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-serif-display font-bold text-ink-primary">
                  Lodging & Room Allocation Optimizer
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
                  Bin-Packing Heuristic
                </span>
              </div>
              <p className="text-xs text-ink-secondary mt-0.5">
                Automatically packs travelers to minimize single-supplement wastage while respecting preferred room tiers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-ink-muted hover:text-ink-primary rounded-xl hover:bg-surface-base transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Efficiency Metric Banner */}
        <div className="px-6 py-4 bg-surface-base/70 border-b border-surface-hairline flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-ink-muted uppercase tracking-wider">Capacity Utilization:</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2.5 bg-surface-hairline rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-gold transition-all duration-500"
                  style={{ width: `${optimization.efficiencyScore}%` }}
                />
              </div>
              <span className="font-numeric font-bold text-brand-gold">
                {optimization.efficiencyScore}%
              </span>
            </div>
          </div>

          <div>
            {optimization.unassignedCount === 0 ? (
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> All Travelers Successfully Assigned
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" /> {optimization.unassignedCount} Travelers Need Rooms
              </span>
            )}
          </div>
        </div>

        {/* Room Assignments Feed */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {optimization.assignments.map((assignment, idx) => (
              <div
                key={idx}
                className="p-4 bg-surface-base border border-surface-hairline rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-ink-primary">
                        {assignment.roomName}
                      </h4>
                      <button
                        onClick={() => handleRemoveRoom(idx)}
                        className="text-ink-muted hover:text-red-400 transition"
                        title="Remove room"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        assignment.tier === 'suite'
                          ? 'bg-purple-500/20 text-purple-300'
                          : assignment.tier === 'standard'
                          ? 'bg-brand-gold/20 text-brand-gold'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {assignment.tier} tier · Max {assignment.capacity} Guests
                    </span>
                  </div>

                  <span className="font-numeric font-bold text-xs text-ink-muted">
                    {assignment.assignedParticipants.length} / {assignment.capacity}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {assignment.assignedParticipants.length > 0 ? (
                    assignment.assignedParticipants.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 bg-surface-raised rounded-xl border border-surface-hairline flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            name={p.name}
                            id={p.id}
                            avatarUrl={p.avatarUrl}
                            size="xs"
                          />
                          <span className="font-semibold text-ink-primary">{p.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-ink-muted uppercase">
                          {p.roomTier || 'standard'} pref
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-ink-muted text-xs bg-surface-raised/50 rounded-xl border border-dashed border-surface-hairline">
                      Vacant Room
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Room Form */}
          <div className="p-4 bg-surface-base/50 rounded-2xl border border-surface-hairline space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-ink-secondary">
              Add Another Room to Property
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Room Title (e.g. Penthouse Suite)"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-base border border-surface-hairline rounded-xl text-ink-primary"
                />
              </div>
              <div>
                <select
                  value={newRoomTier}
                  onChange={(e) => setNewRoomTier(e.target.value as any)}
                  className="w-full px-3 py-2 bg-surface-base border border-surface-hairline rounded-xl text-ink-primary"
                >
                  <option value="suite">Suite (1.4x)</option>
                  <option value="standard">Standard (1.0x)</option>
                  <option value="economy">Economy (0.8x)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={newRoomCapacity}
                  onChange={(e) => setNewRoomCapacity(Number(e.target.value))}
                  className="w-16 px-3 py-2 bg-surface-base border border-surface-hairline rounded-xl text-ink-primary font-numeric"
                />
                <button
                  onClick={handleAddRoom}
                  className="flex-1 py-2 rounded-xl bg-ink-primary text-surface-base hover:opacity-90 font-semibold shadow-subtle flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-base border-t border-surface-hairline flex items-center justify-between text-xs">
          <span className="text-ink-muted">
            Assignments respect room-tier multipliers when calculated in Split Drawer.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-raised border border-surface-hairline text-ink-primary font-bold hover:bg-surface-hairline transition"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};