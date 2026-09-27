'use client';

import React from 'react';
import { Trip, Participant } from '@/lib/types';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Users,
  Sparkles,
  Info,
  CheckCheck,
  RotateCcw,
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface AttendanceCalendarProps {
  trip: Trip;
  participants: Participant[];
  attendanceMatrix: Record<string, Record<string, boolean>>; // [participantId][dateKey] = true/false
  onChangeAttendance: (participantId: string, dateKey: string, isPresent: boolean) => void;
  onSetMatrix?: (newMatrix: Record<string, Record<string, boolean>>) => void;
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  trip,
  participants,
  attendanceMatrix,
  onChangeAttendance,
  onSetMatrix,
}) => {
  // Generate date columns from trip startDate/endDate, or fallback to 4-day window
  const daysList = React.useMemo(() => {
    const list: Array<{ dateKey: string; label: string; dayNum: number }> = [];
    const baseDate = trip.startDate ? new Date(trip.startDate) : new Date();

    const count = 4; // default 4-day trip window
    for (let i = 0; i < count; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const shortMonth = d.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = d.getDate();
      list.push({
        dateKey: iso,
        label: `${shortMonth} ${dayNum}`,
        dayNum: i + 1,
      });
    }
    return list;
  }, [trip.startDate]);

  const activeParticipants = participants.filter((p) => p.status === 'active');

  const handleMarkAllPresent = () => {
    if (!onSetMatrix) return;
    const newMatrix: Record<string, Record<string, boolean>> = {};
    activeParticipants.forEach((p) => {
      newMatrix[p.id] = {};
      daysList.forEach((d) => {
        newMatrix[p.id][d.dateKey] = true;
      });
    });
    onSetMatrix(newMatrix);
  };

  const handleToggleDayAll = (dateKey: string) => {
    if (!onSetMatrix) return;
    // Check if currently all active are present on this date
    const allPresent = activeParticipants.every(
      (p) => attendanceMatrix[p.id]?.[dateKey] !== false
    );
    const newTarget = !allPresent;

    const newMatrix: Record<string, Record<string, boolean>> = { ...attendanceMatrix };
    activeParticipants.forEach((p) => {
      if (!newMatrix[p.id]) newMatrix[p.id] = {};
      newMatrix[p.id][dateKey] = newTarget;
    });
    onSetMatrix(newMatrix);
  };

  return (
    <div className="p-5 rounded-3xl bg-[#141B13] border border-[#273726] shadow-xl space-y-4 text-stone-100">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#253624] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Partial-Attendance Matrix</h3>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-400 border border-emerald-700/40">
              F3.2 Zero-Waste Splits
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Toggle which days each squad member was physically present. Unmarked days exempt travelers from shared dining & activity expenses on that date.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSetMatrix && (
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="px-3 py-1.5 rounded-xl bg-[#1B281B] hover:bg-[#253925] border border-[#2F442E] text-xs font-semibold text-emerald-400 flex items-center gap-1.5 transition-all shadow-sm"
              title="Set all active squad members present on all trip days"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>
          )}
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-[#223121] text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              <th className="py-3 px-3">Squad Member</th>
              {daysList.map((d) => (
                <th key={d.dateKey} className="py-3 px-3 text-center">
                  <div
                    onClick={() => handleToggleDayAll(d.dateKey)}
                    className="cursor-pointer hover:text-emerald-400 transition-colors inline-flex flex-col items-center"
                    title="Click header to toggle entire day for all travelers"
                  >
                    <span>Day {d.dayNum}</span>
                    <span className="text-[9px] font-mono text-stone-500 font-normal">{d.label}</span>
                  </div>
                </th>
              ))}
              <th className="py-3 px-3 text-right">Attendance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1D2B1C] text-xs">
            {activeParticipants.map((p) => {
              const attendedCount = daysList.filter(
                (d) => attendanceMatrix[p.id]?.[d.dateKey] !== false
              ).length;
              const ratioPercent = Math.round((attendedCount / daysList.length) * 100);

              return (
                <tr key={p.id} className="hover:bg-[#182317]/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar name={p.name} id={p.id} avatarUrl={p.avatarUrl} size="sm" />
                      <div>
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {p.isOrganizer && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                              Org
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-500">{p.email}</span>
                      </div>
                    </div>
                  </td>

                  {daysList.map((d) => {
                    const isPresent = attendanceMatrix[p.id]?.[d.dateKey] !== false;

                    return (
                      <td key={d.dateKey} className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onChangeAttendance(p.id, d.dateKey, !isPresent)}
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center mx-auto transition-all ${
                            isPresent
                              ? 'bg-emerald-600/25 border-emerald-500/50 text-emerald-400 shadow-sm shadow-emerald-950 hover:bg-emerald-600/35'
                              : 'bg-stone-900/60 border-stone-800 text-stone-600 hover:border-stone-600 hover:text-stone-400'
                          }`}
                          title={`${p.name} on ${d.label}: ${isPresent ? 'Present (Included in splits)' : 'Absent (Exempted from splits)'}`}
                        >
                          {isPresent ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    );
                  })}

                  <td className="py-3 px-3 text-right">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg border ${
                        ratioPercent === 100
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                          : ratioPercent >= 50
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                          : 'bg-rose-950/60 text-rose-300 border-rose-800/40'
                      }`}
                    >
                      {attendedCount}/{daysList.length} ({ratioPercent}%)
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info Footer Note */}
      <div className="p-3 bg-[#0F160F] border border-[#202E1F] rounded-2xl flex items-center gap-2 text-[11px] text-stone-400">
        <Info className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          Mathematical Guarantee: When an expense date matches an itinerary day, any traveler marked absent has their debt allocation safely clamped to ₹0.00 without breaking group ledger invariant.
        </span>
      </div>
    </div>
  );
};
