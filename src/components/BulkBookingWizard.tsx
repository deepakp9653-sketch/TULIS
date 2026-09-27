'use client';

import React, { useState } from 'react';
import {
  Users,
  Building2,
  Calendar,
  MapPin,
  DollarSign,
  Briefcase,
  Plane,
  Hotel,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SharedBookingInput {
  category: 'stay' | 'flight' | 'transport' | 'activity';
  title: string;
  vendor: string;
  estimatedCost: number;
  confirmationRef: string;
}

interface BulkBookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newTripData: any) => void;
  defaultCostCenter?: string;
  orgName?: string;
}

export const BulkBookingWizard: React.FC<BulkBookingWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultCostCenter = 'CC-ENG-402',
  orgName = 'Acme Corp',
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Trip Scope
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetCeiling, setBudgetCeiling] = useState<number>(350000);
  const [costCenter, setCostCenter] = useState(defaultCostCenter);
  const [department, setDepartment] = useState('Engineering');

  // Step 2: Roster
  const [emailInput, setEmailInput] = useState('');
  const [employees, setEmployees] = useState<Array<{ name: string; email: string }>>([
    { name: 'Aditya Verma', email: 'aditya@acme.com' },
    { name: 'Priya Sharma', email: 'priya.sharma@acme.com' },
    { name: 'Rohan Mehta', email: 'rohan.mehta@acme.com' },
  ]);

  // Step 3: Shared Bookings
  const [sharedBookings, setSharedBookings] = useState<SharedBookingInput[]>([
    {
      category: 'flight',
      title: 'Group Flight BLR -> DEL (Indigo 6E-451)',
      vendor: 'IndiGo Airlines',
      estimatedCost: 75000,
      confirmationRef: 'PNR-IND-9921',
    },
    {
      category: 'stay',
      title: 'Corporate Room Block (5 Deluxe Rooms)',
      vendor: 'Taj City Centre Gurgaon',
      estimatedCost: 140000,
      confirmationRef: 'CONF-TAJ-8841',
    },
  ]);

  const [newBookingCategory, setNewBookingCategory] = useState<'stay' | 'flight' | 'transport' | 'activity'>('stay');
  const [newBookingTitle, setNewBookingTitle] = useState('');
  const [newBookingVendor, setNewBookingVendor] = useState('');
  const [newBookingCost, setNewBookingCost] = useState<string>('');
  const [newBookingRef, setNewBookingRef] = useState('');

  if (!isOpen) return null;

  // Handlers for Employee roster
  const handleAddEmployee = () => {
    if (!emailInput.trim()) return;
    const parts = emailInput.split(/[\n,;]+/).map((e) => e.trim()).filter(Boolean);
    const added: Array<{ name: string; email: string }> = [];

    parts.forEach((raw) => {
      let email = raw;
      let name = '';
      if (raw.includes('<') && raw.includes('>')) {
        name = raw.slice(0, raw.indexOf('<')).trim();
        email = raw.slice(raw.indexOf('<') + 1, raw.indexOf('>')).trim();
      } else {
        name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      }
      if (email && !employees.some((e) => e.email.toLowerCase() === email.toLowerCase())) {
        added.push({ name: name || 'Colleague', email });
      }
    });

    if (added.length > 0) {
      setEmployees([...employees, ...added]);
      setEmailInput('');
    }
  };

  const handleRemoveEmployee = (index: number) => {
    setEmployees(employees.filter((_, idx) => idx !== index));
  };

  // Handlers for Shared Bookings
  const handleAddBooking = () => {
    if (!newBookingTitle.trim() || !newBookingCost) return;
    setSharedBookings([
      ...sharedBookings,
      {
        category: newBookingCategory,
        title: newBookingTitle.trim(),
        vendor: newBookingVendor.trim() || 'Direct Booking',
        estimatedCost: Number(newBookingCost) || 0,
        confirmationRef: newBookingRef.trim() || `REF-${Date.now().toString().slice(-4)}`,
      },
    ]);
    setNewBookingTitle('');
    setNewBookingVendor('');
    setNewBookingCost('');
    setNewBookingRef('');
  };

  const handleRemoveBooking = (index: number) => {
    setSharedBookings(sharedBookings.filter((_, idx) => idx !== index));
  };

  // Final Deployment
  const handleDeploy = async () => {
    if (!title.trim() || !destination.trim()) {
      setErrorMessage('Trip Title and Destination are required.');
      setStep(1);
      return;
    }
    if (employees.length === 0) {
      setErrorMessage('At least one employee must be added to the roster.');
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk-create-corporate-trip',
          title: title.trim(),
          destination: destination.trim(),
          startDate: startDate || new Date().toISOString().slice(0, 10),
          endDate: endDate || null,
          budgetCeiling,
          costCenter,
          department,
          employees,
          sharedBookings,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to provision consolidated booking trip');
      }

      if (onSuccess) {
        onSuccess(data);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating bulk booking trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCommitted = sharedBookings.reduce((sum, b) => sum + b.estimatedCost, 0);
  const remainingBudget = budgetCeiling - totalCommitted;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0C110E] border border-[#213025] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-8"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#213025] flex items-center justify-between bg-[#111A14]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Consolidated Multi-Employee Trip Wizard
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                  FC.8
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Single-flow provisioning for corporate delegations, block stays & flight groups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-[#18251C] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-4 border-b border-[#213025] bg-[#0E1510] text-xs font-mono">
          {[
            { num: 1, label: 'Trip Scope' },
            { num: 2, label: 'Employee Roster' },
            { num: 3, label: 'Shared Bookings' },
            { num: 4, label: 'Deploy & Audit' },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => setStep(s.num as any)}
              className={`py-3 px-2 text-center cursor-pointer border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                step === s.num
                  ? 'border-emerald-500 text-emerald-300 font-bold bg-[#142018]'
                  : step > s.num
                  ? 'border-emerald-700/60 text-emerald-500/80 bg-transparent'
                  : 'border-transparent text-stone-500 hover:text-stone-300'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                step === s.num ? 'bg-emerald-500 text-black font-bold' : 'bg-[#1B271E] text-stone-400'
              }`}>
                {s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: TRIP SCOPE */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Trip Delegation Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q4 Cloud Architecture Client Delegation"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141E17] border border-[#26372B] focus:border-emerald-500 text-stone-100 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Destination City <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Delhi NCR, India"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#141E17] border border-[#26372B] focus:border-emerald-500 text-stone-100 text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Department Cost Center
                  </label>
                  <select
                    value={costCenter}
                    onChange={(e) => setCostCenter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141E17] border border-[#26372B] focus:border-emerald-500 text-stone-100 text-xs outline-none cursor-pointer"
                  >
                    <option value="CC-ENG-402">CC-ENG-402 (Engineering & Tech)</option>
                    <option value="CC-SALES-102">CC-SALES-102 (Enterprise Sales)</option>
                    <option value="CC-PROD-201">CC-PROD-201 (Product & Design)</option>
                    <option value="CC-EXEC-001">CC-EXEC-001 (Executive Leadership)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141E17] border border-[#26372B] focus:border-emerald-500 text-stone-100 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141E17] border border-[#26372B] focus:border-emerald-500 text-stone-100 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Budget Ceiling (INR)
                  </label>
                  <input
                    type="number"
                    value={budgetCeiling}
                    onChange={(e) => setBudgetCeiling(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#141E17] border border-[#26372B] focus:border-emerald-500 text-stone-100 text-xs font-mono outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EMPLOYEE ROSTER */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Batch Invite Employees (Paste emails or CSV)
                </label>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. rohit.sharma@acme.com, Tanya Roy <tanya@acme.com>"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#141E17] border border-[#26372B] focus:border-emerald-500 text-stone-100 text-xs outline-none resize-none font-mono"
                  />
                  <button
                    onClick={handleAddEmployee}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer self-start"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Supports comma, semicolon, or line-separated corporate emails.
                </span>
              </div>

              {/* Roster list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                  <span>Delegation Roster ({employees.length} Employees)</span>
                  <span className="text-emerald-400">Policy: Standard Business Tier</span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {employees.map((emp, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#141E17] border border-[#26372B] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 text-[10px] font-bold flex items-center justify-center">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-white block leading-tight">
                            {emp.name}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400">
                            {emp.email}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveEmployee(idx)}
                        className="p-1 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-950/20 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SHARED BOOKINGS */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#141E17] border border-[#26372B] space-y-3">
                <span className="text-xs font-bold text-white block">
                  Add Shared Group Booking / Reservation Block
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-stone-400 font-mono block mb-1">
                      Type & Title
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={newBookingCategory}
                        onChange={(e) => setNewBookingCategory(e.target.value as any)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#0E1510] border border-[#26372B] text-xs text-stone-200 outline-none"
                      >
                        <option value="stay">Stay</option>
                        <option value="flight">Flight</option>
                        <option value="transport">Cab</option>
                        <option value="activity">Event</option>
                      </select>
                      <input
                        type="text"
                        value={newBookingTitle}
                        onChange={(e) => setNewBookingTitle(e.target.value)}
                        placeholder="e.g. 5x Deluxe King Block"
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#0E1510] border border-[#26372B] text-xs text-stone-200 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-400 font-mono block mb-1">
                      Vendor Name
                    </label>
                    <input
                      type="text"
                      value={newBookingVendor}
                      onChange={(e) => setNewBookingVendor(e.target.value)}
                      placeholder="e.g. Hyatt Regency"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0E1510] border border-[#26372B] text-xs text-stone-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-400 font-mono block mb-1">
                      Total Cost (INR)
                    </label>
                    <input
                      type="number"
                      value={newBookingCost}
                      onChange={(e) => setNewBookingCost(e.target.value)}
                      placeholder="85000"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0E1510] border border-[#26372B] text-xs font-mono text-stone-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-400 font-mono block mb-1">
                      Confirmation PNR / Ref #
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newBookingRef}
                        onChange={(e) => setNewBookingRef(e.target.value)}
                        placeholder="PNR-HYATT-102"
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#0E1510] border border-[#26372B] text-xs font-mono text-stone-200 outline-none"
                      />
                      <button
                        onClick={handleAddBooking}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bookings List */}
              <div className="space-y-2">
                <span className="text-xs text-stone-400 font-mono block">
                  Configured Group Bookings ({sharedBookings.length})
                </span>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {sharedBookings.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#141E17] border border-[#26372B] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                          {b.category === 'flight' ? (
                            <Plane className="w-4 h-4" />
                          ) : (
                            <Hotel className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{b.title}</span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {b.vendor} • Ref: {b.confirmationRef}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-emerald-300 text-xs">
                          ₹{b.estimatedCost.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleRemoveBooking(idx)}
                          className="p-1 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-950/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & DEPLOY */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#141E17] border border-[#26372B] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{title || 'Consolidated Delegation'}</h3>
                    <p className="text-xs text-stone-400">
                      {destination || 'Destination'} • {costCenter}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                    Ready to Provision
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#26372B] text-center font-mono">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase block">Headcount</span>
                    <span className="text-sm font-bold text-white">{employees.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase block">Pre-Booked</span>
                    <span className="text-sm font-bold text-emerald-300">₹{totalCommitted.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase block">Runway</span>
                    <span className="text-sm font-bold text-stone-200">₹{remainingBudget.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-stone-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Automated Corporate Provisioning Engine</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Once confirmed, Tulis will set up the trip, assign all {employees.length} employee accounts with corporate travel credentials, and attach the shared group bookings.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-[#213025] bg-[#111A14] flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2 rounded-xl bg-[#16221A] hover:bg-[#1E2E23] text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <div>
            {step < 4 ? (
              <button
                onClick={() => setStep((step + 1) as any)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/50 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleDeploy}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950/60 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Provisioning Trip...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Deploy Consolidated Trip</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
