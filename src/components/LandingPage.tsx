'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Receipt,
  Users,
  QrCode,
  FileCheck,
  Plus,
  Key,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  RefreshCw,
  FileText,
  Split,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Check,
} from 'lucide-react';
import { TulisHero } from './tulis-hero';
import { TulisCursor } from './TulisCursor';
import { HeroOpeningSection } from './HeroOpeningSection';
import { ThreePillarFeaturesSection } from './ThreePillarFeaturesSection';
import { StoryFeaturesSection } from './StoryFeaturesSection';
import { EditorialFeaturesSection } from './EditorialFeaturesSection';
import { TulisFooter } from './TulisFooter';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenCreateTrip: () => void;
  onOpenJoinTrip: () => void;
  currentUser?: any;
  onOpenAuth?: () => void;
  onOpenCorporateAuth?: () => void;
  onOpenMyTrips?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenCreateTrip,
  onOpenJoinTrip,
  currentUser,
  onOpenAuth,
  onOpenCorporateAuth,
  onOpenMyTrips,
}) => {
  // State for interactive debt netting sandbox
  const [sandboxNet, setSandboxNet] = useState<boolean>(true);

  // State for interactive split primitive selector
  const [activeSplitTab, setActiveSplitTab] = useState<'rooms' | 'nights' | 'optout' | 'itemized' | 'organizer'>('rooms');

  // State for interactive workspace preview tab
  const [workspaceTab, setWorkspaceTab] = useState<'itinerary' | 'expenses' | 'roster'>('itinerary');

  return (
    <div className="relative min-h-screen bg-[#EBF4DD] text-[#3B4953] font-sans antialiased selection:bg-[#90AB8B]/40 overflow-x-clip">
      {/* 00: Sophisticated TULIS Desktop Custom Cursor */}
      <TulisCursor />

      {/* 01: HERO (LOCKED & PRESERVED - Untouched TULIS Illustrated World -> Interface Transformation) */}
      <TulisHero
        onEnterApp={onEnterApp}
        onOpenCreateTrip={onOpenCreateTrip}
        onOpenJoinTrip={onOpenJoinTrip}
        currentUser={currentUser}
        onOpenAuth={onOpenAuth}
        onOpenMyTrips={onOpenMyTrips}
      />

      {/* 01.5: OPENING SHOWCASE SECTION (Natural Continuation of the Hero) */}
      <HeroOpeningSection />

      {/* 01.6: THREE-PILLAR FEATURE SECTION (One Plan, Fair Split, Changes Balance) */}
      <ThreePillarFeaturesSection />

      {/* 01.7: SCROLL-DRIVEN STORY FEATURE SECTION (Know What You Owe, Settle Without Mess, Every Change, Offline Sync) */}
      <StoryFeaturesSection />

      {/* ==========================================================================
          02: THE PROBLEM: "The trip is connected. The money is fragmented."
          Ratio: 50% Neumorphism / 20% Neo-Brutalism / 10% Glass / 20% Bento
          Authentic PNGs: travel-signpost.png, camera.png, rock-02.png
          ========================================================================== */}
      <section id="problem" className="relative py-28 sm:py-36 px-6 max-w-7xl mx-auto scroll-mt-24 sm:scroll-mt-28">
        {/* Genuine TULIS Asset: Leaning Signpost representing diverging directions */}
        <div className="hidden xl:block absolute -left-10 top-24 w-[130px] aspect-[823/1173] pointer-events-none z-10 filter drop-shadow-md -rotate-3">
          <Image
            src="/tulis/objects/travel-signpost.png"
            alt="Conflicting Directions Signpost"
            fill
            sizes="130px"
            className="object-contain"
          />
        </div>

        {/* Genuine TULIS Asset: Travel Camera capturing memories while receipts get buried */}
        <div className="hidden md:block absolute -right-6 top-20 w-[120px] aspect-[1326/1053] pointer-events-none z-10 filter drop-shadow-sm rotate-6">
          <Image
            src="/tulis/objects/camera.png"
            alt="Travel Camera"
            fill
            sizes="120px"
            className="object-contain"
          />
        </div>

        <div className="space-y-16">
          {/* Section Editorial Header (Restrained typography, no artificial tracking pills) */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-[#3B4953] tracking-tight leading-[1.12]">
              The trip is connected.{' '}
              <span className="text-[#5A7863] underline decoration-[#90AB8B]/60 decoration-wavy decoration-2">
                The money is fragmented.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-[#3B4953]/80 leading-relaxed font-normal max-w-2xl mx-auto">
              Shared memories are created together, but the finances fracture into 14 chat threads, 3 bank apps, screenshots of bills, and a spreadsheet only one exhausted organizer pretends to understand.
            </p>
          </div>

          {/* Bento Grid: 4 Concrete Friction Modes of Group Travel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: The Screenshot Graveyard */}
            <div className="p-6 rounded-3xl neu-raised space-y-4 relative overflow-hidden group hover:translate-y-[-2px] transition-transform">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl neu-inset flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-[#5A7863]" />
                </div>
                <span className="neo-accent-pill px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#EBF4DD] text-[#3B4953]">
                  CHAT NOISE
                </span>
              </div>
              <h3 className="font-bold text-base text-[#3B4953]">The Screenshot Graveyard</h3>
              <p className="text-xs text-[#3B4953]/75 leading-relaxed">
                Bill photos uploaded at midnight with blurry totals. Two days later: &quot;Who had the grilled prawns?&quot; &quot;Does this include service tax?&quot; Receipts drown in chat scrollback.
              </p>
              <div className="p-3 rounded-xl neu-inset-sm font-mono text-[10px] text-[#3B4953]/70 space-y-1">
                <div className="flex justify-between">
                  <span>BeachShack_Bill.jpg</span>
                  <span className="text-rose-700 font-bold">Unverified</span>
                </div>
                <div className="text-[9px] text-[#3B4953]/50 italic">&quot;Send me ₹640 on UPI whoever drank beer&quot;</div>
              </div>
            </div>

            {/* Card 2: The Forgotten Front-Runner */}
            <div className="p-6 rounded-3xl neu-raised space-y-4 relative overflow-hidden group hover:translate-y-[-2px] transition-transform">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl neu-inset flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#5A7863]" />
                </div>
                <span className="neo-accent-pill px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#EBF4DD] text-[#3B4953]">
                  CASHFLOW TRAP
                </span>
              </div>
              <h3 className="font-bold text-base text-[#3B4953]">The Forgotten Front-Runner</h3>
              <p className="text-xs text-[#3B4953]/75 leading-relaxed">
                Vikram fronted ₹28,000 for the villa advance 3 weeks ago. Two travelers have not reimbursed him because &quot;we will calculate everything at the end.&quot; One person acts as the group&apos;s unpaid bank.
              </p>
              <div className="p-3 rounded-xl neu-inset-sm font-mono text-[10px] text-[#3B4953]/70 space-y-1">
                <div className="flex justify-between">
                  <span>Vikram fronted:</span>
                  <span className="font-bold text-[#5A7863]">₹28,000.00</span>
                </div>
                <div className="flex justify-between text-rose-700 font-medium">
                  <span>Unreimbursed float:</span>
                  <span>3 weeks</span>
                </div>
              </div>
            </div>

            {/* Card 3: The Dropout Dilemma */}
            <div className="p-6 rounded-3xl neu-raised space-y-4 relative overflow-hidden group hover:translate-y-[-2px] transition-transform">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl neu-inset flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#5A7863]" />
                </div>
                <span className="neo-accent-pill px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#EBF4DD] text-[#3B4953]">
                  SCHEDULE SHIFT
                </span>
              </div>
              <h3 className="font-bold text-base text-[#3B4953]">The Early Dropout Dilemma</h3>
              <p className="text-xs text-[#3B4953]/75 leading-relaxed">
                Arjun leaves on Day 3 morning due to an urgent meeting. The villa was booked for 5 nights; the rental car for 7 days. Who does the manual arithmetic to prorate his departure without friction?
              </p>
              <div className="p-3 rounded-xl neu-inset-sm font-mono text-[10px] text-[#3B4953]/70 space-y-1">
                <div className="flex justify-between">
                  <span>Arjun attendance:</span>
                  <span className="font-bold text-[#3B4953]">2 of 5 nights</span>
                </div>
                <div className="text-[9px] text-amber-800 italic">Manual spreadsheet formula broken</div>
              </div>
            </div>

            {/* Card 4: The Tangled Debt Web */}
            <div className="p-6 rounded-3xl neu-raised space-y-4 relative overflow-hidden group hover:translate-y-[-2px] transition-transform">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl neu-inset flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-[#5A7863]" />
                </div>
                <span className="neo-accent-pill px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#EBF4DD] text-[#3B4953]">
                  CHURN
                </span>
              </div>
              <h3 className="font-bold text-base text-[#3B4953]">The Tangled Settlement Web</h3>
              <p className="text-xs text-[#3B4953]/75 leading-relaxed">
                Five friends generate 10 potential pairwise debts. Rohan owes Priya, Priya owes Vikram, Vikram owes Sneha. Everyone sends ₹450 back and forth in 8 redundant bank transfers.
              </p>
              <div className="p-3 rounded-xl neu-inset-sm font-mono text-[10px] text-[#3B4953]/70 space-y-1">
                <div className="flex justify-between">
                  <span>Pairwise debts:</span>
                  <span className="text-rose-700 font-bold">10 transfers</span>
                </div>
                <div className="flex justify-between text-[#5A7863]">
                  <span>TULIS net needed:</span>
                  <span className="font-bold">2 transfers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Architectural Synthesis Pill (Neo-brutalist border accent) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#EBF4DD] neo-accent-box flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#5A7863] font-bold block">
                The Fundamental Architectural Gap
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#3B4953] max-w-2xl">
                Traditional split apps track abstract debts between pairs. They do not understand your trip itinerary, check-in dates, room tiers, or attendance.
              </p>
            </div>
            <button
              onClick={onEnterApp}
              className="neu-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer flex items-center gap-2 group shrink-0"
            >
              <span>See the TULIS Solution</span>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="w-3.5 h-3.5 text-[#EBF4DD]" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          03: ONE TRIP WORKSPACE: "Plan the journey. Money follows the journey."
          Ratio: 50% Neumorphism / 20% Neo-Brutalism / 10% Glass / 20% Bento
          Authentic PNGs: travel-route.png, waypoint.png, destination-marker.png, tree-small.png
          ========================================================================== */}
      <section id="workspace" className="relative py-28 sm:py-36 px-6 bg-[#EBF4DD] border-t border-[#3B4953]/10 scroll-mt-24 sm:scroll-mt-28">
        {/* Genuine TULIS Asset: Travel Route ribbon sweeping behind the workspace */}
        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-10 w-[90vw] max-w-[1200px] aspect-[2261/828] pointer-events-none opacity-40 z-0">
          <Image
            src="/tulis/travel/travel-route.png"
            alt="Travel Journey Route"
            fill
            sizes="1200px"
            className="object-contain"
          />
        </div>

        {/* Genuine TULIS Assets: Waypoint and Destination Marker anchoring */}
        <div className="hidden lg:block absolute left-[8%] top-32 w-9 h-9 pointer-events-none z-10 filter drop-shadow-sm">
          <Image src="/tulis/travel/waypoint.png" alt="Waypoint" fill sizes="36px" className="object-contain" />
        </div>
        <div className="hidden lg:block absolute right-[9%] top-40 w-10 h-10 pointer-events-none z-10 filter drop-shadow-sm">
          <Image src="/tulis/travel/destination-marker.png" alt="Destination Marker" fill sizes="40px" className="object-contain" />
        </div>
        <div className="hidden xl:block absolute right-4 bottom-20 w-16 aspect-[434/732] pointer-events-none z-10 filter drop-shadow-sm opacity-70">
          <Image src="/tulis/nature/tree-small.png" alt="Pine Tree" fill sizes="64px" className="object-contain" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-[#3B4953] tracking-tight leading-[1.12]">
              One trip workspace.{' '}
              <span className="text-[#5A7863]">Money follows the journey.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#3B4953]/80 leading-relaxed font-normal max-w-2xl mx-auto">
              Instead of entering expenses into an isolated ledger, TULIS links every rupee directly to your itinerary, participants, bookings, and dates.
            </p>
          </div>

          {/* Double-Bezel Architecture Container (Doppelrand) */}
          <div className="doppelrand-shell">
            <div className="doppelrand-core p-5 sm:p-8 space-y-6">
              {/* Top Workspace Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#3B4953]/15">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#5A7863] animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#5A7863] font-bold">
                      Connected Trip Workspace
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#3B4953]">
                    Goa Coastal Traverse : Vagator to Palolem
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#3B4953]/70 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#5A7863]" /> Oct 14-20
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#5A7863]" /> 4 Waypoints
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#5A7863]" /> 5 Travelers
                    </span>
                  </div>
                </div>

                {/* View Switcher Tabs (Neumorphic Inset Selector) */}
                <div className="p-1 rounded-2xl neu-inset flex items-center gap-1">
                  {[
                    { id: 'itinerary', label: 'Itinerary Swimlanes' },
                    { id: 'expenses', label: 'Connected Expenses' },
                    { id: 'roster', label: 'Squad Net Positions' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setWorkspaceTab(tab.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        workspaceTab === tab.id
                          ? 'neu-raised text-[#3B4953]'
                          : 'text-[#3B4953]/60 hover:text-[#3B4953]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Content Body */}
              {workspaceTab === 'itinerary' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Day 1 */}
                  <div className="p-5 rounded-2xl neu-inset-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="neo-accent-pill px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#EBF4DD]">
                        DAY 01
                      </span>
                      <span className="text-[11px] font-mono text-[#5A7863] font-semibold">₹32,000 Linked</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#3B4953]">Vagator Cliffside Villa</h4>
                    <p className="text-xs text-[#3B4953]/70">5 Guests • 2 Nights • Room-tier split applied</p>
                    <div className="p-2.5 rounded-xl bg-white/60 text-[11px] font-mono text-[#3B4953]/80 space-y-1">
                      <div className="flex justify-between">
                        <span>Master Suite (2p):</span>
                        <span>₹18,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Standard Twin (3p):</span>
                        <span>₹14,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Day 2 */}
                  <div className="p-5 rounded-2xl neu-inset-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="neo-accent-pill px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#EBF4DD]">
                        DAY 02
                      </span>
                      <span className="text-[11px] font-mono text-[#5A7863] font-semibold">₹8,000 Linked</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#3B4953]">Morjim Catamaran Sailing</h4>
                    <p className="text-xs text-[#3B4953]/70">4 Attendees • 1 Opt-out (Arjun skipped)</p>
                    <div className="p-2.5 rounded-xl bg-white/60 text-[11px] font-mono text-[#3B4953]/80 space-y-1">
                      <div className="flex justify-between">
                        <span>Split:</span>
                        <span>₹2,000 × 4 pax</span>
                      </div>
                      <div className="flex justify-between text-[#5A7863]">
                        <span>Arjun charged:</span>
                        <span className="font-bold">₹0.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Day 3 */}
                  <div className="p-5 rounded-2xl neu-inset-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="neo-accent-pill px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#EBF4DD]">
                        DAY 03
                      </span>
                      <span className="text-[11px] font-mono text-[#5A7863] font-semibold">₹11,400 Linked</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#3B4953]">Thalassa Sunset Feast</h4>
                    <p className="text-xs text-[#3B4953]/70">Itemized line-item allocation</p>
                    <div className="p-2.5 rounded-xl bg-white/60 text-[11px] font-mono text-[#3B4953]/80 space-y-1">
                      <div className="flex justify-between">
                        <span>Shared Food:</span>
                        <span>₹6,200 (Equal)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cocktail Bar:</span>
                        <span>₹5,200 (Drinkers only)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {workspaceTab === 'expenses' && (
                <div className="space-y-3">
                  {[
                    { title: 'Villa Rental Advance', payer: 'Vikram Mehta paid', category: 'Lodging', date: 'Oct 14', amount: '₹32,000.00', badge: 'Room-Tier Split', proof: true },
                    { title: 'Morjim Catamaran Booking', payer: 'Priya Patel paid', category: 'Activities', date: 'Oct 15', amount: '₹8,000.00', badge: 'Opt-In Split (4 pax)', proof: true },
                    { title: 'Thalassa Sunset Feast', payer: 'Rohan Sharma paid', category: 'Food & Dining', date: 'Oct 16', amount: '₹11,400.00', badge: 'Itemized Split', proof: true },
                    { title: 'North Goa Self-Drive Thar', payer: 'Sneha Rao paid', category: 'Transport', date: 'Oct 14-20', amount: '₹18,500.00', badge: 'Equal Split', proof: true },
                  ].map((exp, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-white/60 border border-[#3B4953]/15 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#3B4953]">{exp.title}</span>
                          {exp.proof && (
                            <span className="px-1.5 py-0.5 rounded bg-[#5A7863]/12 text-[#5A7863] text-[9px] font-mono flex items-center gap-1 font-semibold">
                              <FileCheck className="w-3 h-3" /> Receipt Verified
                            </span>
                          )}
                        </div>
                        <span className="text-[#3B4953]/70 font-mono text-[11px]">{exp.payer} • {exp.date} • {exp.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-[#3B4953] block">{exp.amount}</span>
                        <span className="text-[10px] font-mono text-[#5A7863] font-semibold">{exp.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {workspaceTab === 'roster' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { name: 'Vikram Mehta', paid: '₹32,000', consumed: '₹17,800', net: '+₹14,200', status: 'Surplus' },
                    { name: 'Priya Patel', paid: '₹8,000', consumed: '₹14,250', net: '-₹6,250', status: 'Owes' },
                    { name: 'Rohan Sharma', paid: '₹11,400', consumed: '₹16,250', net: '-₹4,850', status: 'Owes' },
                    { name: 'Sneha Rao', paid: '₹18,500', consumed: '₹15,400', net: '+₹3,100', status: 'Surplus' },
                    { name: 'Arjun Nair', paid: '₹0', consumed: '₹6,200', net: '-₹6,200', status: 'Owes (Prorated)' },
                  ].map((person, idx) => (
                    <div key={idx} className="p-4 rounded-2xl neu-inset-sm space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#3B4953] truncate">{person.name}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                          person.status === 'Surplus' ? 'bg-[#5A7863]/15 text-[#5A7863]' : 'bg-rose-500/15 text-rose-700'
                        }`}>
                          {person.status}
                        </span>
                      </div>
                      <div className="font-mono text-[10px] text-[#3B4953]/70 space-y-0.5 pt-1 border-t border-[#3B4953]/10">
                        <div className="flex justify-between"><span>Fronted:</span><span>{person.paid}</span></div>
                        <div className="flex justify-between"><span>Share:</span><span>{person.consumed}</span></div>
                      </div>
                      <div className="pt-1 flex items-baseline justify-between font-mono font-bold">
                        <span className="text-[10px] text-[#3B4953]/60">Net Position:</span>
                        <span className={person.net.startsWith('+') ? 'text-[#5A7863]' : 'text-rose-700'}>
                          {person.net}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          04: SPLIT FAIRLY: "Everyone's share is visible."
          Ratio: 50% Neumorphism / 20% Neo-Brutalism / 10% Glass / 20% Bento
          Authentic PNGs: backpack.png, luggage.png, location-pin.png
          ========================================================================== */}
      <section id="split-fairly" className="relative py-28 sm:py-36 px-6 max-w-7xl mx-auto scroll-mt-24 sm:scroll-mt-28">
        {/* Genuine TULIS Assets: Backpack and Luggage partially outside containers */}
        <div className="hidden lg:block absolute -left-8 bottom-16 w-[130px] aspect-[962/1152] pointer-events-none z-10 filter drop-shadow-md -rotate-6">
          <Image
            src="/tulis/objects/backpack.png"
            alt="Travel Backpack"
            fill
            sizes="130px"
            className="object-contain"
          />
        </div>

        <div className="hidden xl:block absolute -right-6 top-36 w-[120px] aspect-[627/1091] pointer-events-none z-10 filter drop-shadow-md rotate-6">
          <Image
            src="/tulis/objects/luggage.png"
            alt="Luggage"
            fill
            sizes="120px"
            className="object-contain"
          />
        </div>

        <div className="space-y-14">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-[#3B4953] tracking-tight leading-[1.12]">
              Split fairly.{' '}
              <span className="text-[#5A7863]">Everyone&apos;s share is visible.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#3B4953]/80 leading-relaxed font-normal max-w-2xl mx-auto">
              No more blunt &quot;divide by N&quot;. TULIS natively models the nuanced real-world ways travelers incur costs.
            </p>
          </div>

          {/* Interactive Split Primitives Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 5 Primitives Selector Menu */}
            <div className="lg:col-span-5 space-y-3">
              {[
                {
                  id: 'rooms',
                  title: '1. Room-Tier Surcharge Allocation',
                  desc: 'Master suite with private plunge pool pays 35%; garden twin rooms split the remainder.',
                  icon: Sparkles,
                },
                {
                  id: 'nights',
                  title: '2. Weighted Per-Diem by Nights',
                  desc: "Friend staying 2 nights does not subsidize the 5-night stay. Dynamic time weighting.",
                  icon: Calendar,
                },
                {
                  id: 'optout',
                  title: '3. Opt-In / Opt-Out Activity Splits',
                  desc: "Did not take the scuba dive or sunset boat? Excluded from the ledger line item instantly.",
                  icon: Users,
                },
                {
                  id: 'itemized',
                  title: '4. Line-Item Alcohol / Food Separation',
                  desc: 'Non-drinkers never pay for ₹5,000 cocktails; vegetarians do not split the tandoori prawns.',
                  icon: Receipt,
                },
                {
                  id: 'organizer',
                  title: '5. Organizer Subsidy & Planner Credit',
                  desc: 'The designated driver or squad organizer receives a zero-split courtesy credit.',
                  icon: ShieldCheck,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = activeSplitTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSplitTab(item.id as any)}
                    className={`w-full p-4 rounded-2xl text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'neu-raised border-2 border-[#5A7863] translate-x-1'
                        : 'neu-raised-sm hover:border-[#3B4953]/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#5A7863] text-[#EBF4DD]' : 'neu-inset text-[#5A7863]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#3B4953] leading-snug">{item.title}</h4>
                      <p className="text-[11px] text-[#3B4953]/70 pt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Interactive Simulator Preview Panel (Doppelrand Architecture) */}
            <div className="lg:col-span-7 doppelrand-shell">
              <div className="doppelrand-core p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[#3B4953]/15 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#5A7863] font-bold">
                      Live Split Calculator Simulation
                    </span>
                    <h3 className="text-lg font-bold text-[#3B4953]">
                      {activeSplitTab === 'rooms' && 'Luxury Cliffside Villa (2 Nights • ₹32,000)'}
                      {activeSplitTab === 'nights' && 'Self-Drive Thar Rental (5 Days • ₹15,000)'}
                      {activeSplitTab === 'optout' && 'Catamaran Cruise & Snorkel (₹8,000)'}
                      {activeSplitTab === 'itemized' && 'Beach Shack Dinner & Cocktails (₹9,800)'}
                      {activeSplitTab === 'organizer' && 'Airport Van & Fuel (Organizer Credit • ₹6,500)'}
                    </h3>
                  </div>
                  <span className="neo-accent-pill px-2.5 py-1 rounded-full font-mono text-xs font-bold bg-[#EBF4DD] text-[#3B4953]">
                    ₹0.00 Drift
                  </span>
                </div>

                {/* Dynamic Live Breakdown Table */}
                <div className="space-y-2.5">
                  {activeSplitTab === 'rooms' && [
                    { member: 'Vikram & Priya (Master Suite)', math: '35% room share', amount: '₹11,200.00' },
                    { member: 'Rohan Sharma (Queen Room 1)', math: '21.67% share', amount: '₹6,933.33' },
                    { member: 'Sneha Rao (Queen Room 1)', math: '21.67% share', amount: '₹6,933.33' },
                    { member: 'Arjun Nair (Twin Room)', math: '21.66% share', amount: '₹6,933.34' },
                  ].map((row, idx) => (
                    <div key={idx} className="p-3 rounded-xl neu-inset-sm flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-[#3B4953] block">{row.member}</span>
                        <span className="text-[10px] font-mono text-[#3B4953]/60">{row.math}</span>
                      </div>
                      <span className="font-mono font-bold text-sm text-[#3B4953]">{row.amount}</span>
                    </div>
                  ))}

                  {activeSplitTab === 'nights' && [
                    { member: 'Vikram Mehta (Full 5 days)', math: '5/18 days weight', amount: '₹4,166.67' },
                    { member: 'Priya Patel (Full 5 days)', math: '5/18 days weight', amount: '₹4,166.67' },
                    { member: 'Rohan Sharma (Full 5 days)', math: '5/18 days weight', amount: '₹4,166.66' },
                    { member: 'Arjun Nair (Departed Day 3: 2 days)', math: '2/18 days weight', amount: '₹1,666.67' },
                    { member: 'Sneha Rao (Joined Day 5: 1 day)', math: '1/18 days weight', amount: '₹833.33' },
                  ].map((row, idx) => (
                    <div key={idx} className="p-3 rounded-xl neu-inset-sm flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-[#3B4953] block">{row.member}</span>
                        <span className="text-[10px] font-mono text-[#3B4953]/60">{row.math}</span>
                      </div>
                      <span className="font-mono font-bold text-sm text-[#3B4953]">{row.amount}</span>
                    </div>
                  ))}

                  {activeSplitTab === 'optout' && [
                    { member: 'Vikram Mehta (Attended)', math: '1 of 4 attendees', amount: '₹2,000.00' },
                    { member: 'Priya Patel (Attended)', math: '1 of 4 attendees', amount: '₹2,000.00' },
                    { member: 'Rohan Sharma (Attended)', math: '1 of 4 attendees', amount: '₹2,000.00' },
                    { member: 'Sneha Rao (Attended)', math: '1 of 4 attendees', amount: '₹2,000.00' },
                    { member: 'Arjun Nair (Opted Out / Slept in)', math: 'Excluded from split', amount: '₹0.00', exempt: true },
                  ].map((row, idx) => (
                    <div key={idx} className={`p-3 rounded-xl neu-inset-sm flex items-center justify-between text-xs ${row.exempt ? 'opacity-60' : ''}`}>
                      <div>
                        <span className="font-semibold text-[#3B4953] block">{row.member}</span>
                        <span className="text-[10px] font-mono text-[#3B4953]/60">{row.math}</span>
                      </div>
                      <span className={`font-mono font-bold text-sm ${row.exempt ? 'text-[#5A7863]' : 'text-[#3B4953]'}`}>{row.amount}</span>
                    </div>
                  ))}

                  {activeSplitTab === 'itemized' && [
                    { member: 'Vikram (Food + 3 Cocktails)', math: '₹1,240 food + ₹1,500 bar', amount: '₹2,740.00' },
                    { member: 'Priya (Food + 2 Mocktails)', math: '₹1,240 food + ₹500 soft', amount: '₹1,740.00' },
                    { member: 'Rohan (Food + 4 Craft Beers)', math: '₹1,240 food + ₹1,800 bar', amount: '₹3,040.00' },
                    { member: 'Sneha (Food Only - Non Drinker)', math: '₹1,240 food only', amount: '₹1,240.00' },
                    { member: 'Arjun (Food Only)', math: '₹1,040 light items', amount: '₹1,040.00' },
                  ].map((row, idx) => (
                    <div key={idx} className="p-3 rounded-xl neu-inset-sm flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-[#3B4953] block">{row.member}</span>
                        <span className="text-[10px] font-mono text-[#3B4953]/60">{row.math}</span>
                      </div>
                      <span className="font-mono font-bold text-sm text-[#3B4953]">{row.amount}</span>
                    </div>
                  ))}

                  {activeSplitTab === 'organizer' && [
                    { member: 'Rohan Sharma (Trip Planner & Driver)', math: 'Granted 100% subsidy by squad', amount: '₹0.00', subsidy: true },
                    { member: 'Vikram Mehta (Equal share)', math: '25% of van & fuel', amount: '₹1,625.00' },
                    { member: 'Priya Patel (Equal share)', math: '25% of van & fuel', amount: '₹1,625.00' },
                    { member: 'Sneha Rao (Equal share)', math: '25% of van & fuel', amount: '₹1,625.00' },
                    { member: 'Arjun Nair (Equal share)', math: '25% of van & fuel', amount: '₹1,625.00' },
                  ].map((row, idx) => (
                    <div key={idx} className="p-3 rounded-xl neu-inset-sm flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-[#3B4953] block">{row.member}</span>
                        <span className="text-[10px] font-mono text-[#3B4953]/60">{row.math}</span>
                      </div>
                      <span className={`font-mono font-bold text-sm ${row.subsidy ? 'text-[#5A7863]' : 'text-[#3B4953]'}`}>{row.amount}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom Guarantee Banner */}
                <div className="p-3.5 rounded-xl bg-[#5A7863]/10 border border-[#5A7863]/25 flex items-center justify-between text-xs text-[#3B4953]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5A7863]" />
                    <span className="font-semibold">Calculated on double-entry principles.</span>
                  </div>
                  <span className="font-mono font-bold text-[#5A7863]">Deterministic to ₹0.01</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          05: HANDLE CHANGES: "When plans change, the numbers change safely."
          Ratio: 50% Neumorphism / 20% Neo-Brutalism / 10% Glass / 20% Bento
          Authentic PNGs: destination-flag.png, bush.png, rock-01.png
          ========================================================================== */}
      <section id="changes" className="relative py-28 sm:py-36 px-6 bg-[#EBF4DD] border-t border-[#3B4953]/10 scroll-mt-24 sm:scroll-mt-28">
        {/* Genuine TULIS Asset: Destination Flag Anchor */}
        <div className="hidden lg:block absolute right-14 top-20 w-11 h-11 pointer-events-none z-10 filter drop-shadow-sm">
          <Image
            src="/tulis/travel/destination-flag.png"
            alt="Destination Flag"
            fill
            sizes="44px"
            className="object-contain"
          />
        </div>

        <div className="hidden xl:block absolute left-6 bottom-16 w-20 aspect-[460/328] pointer-events-none z-10 filter drop-shadow-sm opacity-60">
          <Image src="/tulis/nature/bush.png" alt="Bush" fill sizes="80px" className="object-contain" />
        </div>

        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-[#3B4953] tracking-tight leading-[1.12]">
              When plans change,{' '}
              <span className="text-[#5A7863]">the numbers change safely.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#3B4953]/80 leading-relaxed font-normal max-w-2xl mx-auto">
              Travel plans are never static. Flights get rescheduled, weather cancels outdoor boats, and people depart early. TULIS handles edge-cases without corrupting your audit trail.
            </p>
          </div>

          {/* Bento Grid: 4 Core Change Handlers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Trip Dropout & Proration */}
            <div className="p-7 rounded-3xl neu-raised space-y-4">
              <div className="flex items-center justify-between">
                <span className="neo-accent-pill px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EBF4DD] text-[#3B4953]">
                  SCENARIO 01
                </span>
                <span className="text-xs font-mono text-[#5A7863] font-semibold">Automatic Proration</span>
              </div>
              <h3 className="text-lg font-bold text-[#3B4953]">Friend Leaves Early on Day 3</h3>
              <p className="text-xs text-[#3B4953]/75 leading-relaxed">
                When Arjun marks his departure on the timeline, the engine unlinks him from all future shared activities (catamaran, dinner, return cabs). Prior shared costs remain immutably locked.
              </p>
              <div className="p-4 rounded-xl neu-inset-sm space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[#3B4953]">
                  <span>Prior Days (1 & 2):</span>
                  <span className="font-bold text-[#5A7863]">Billed ₹4,800 (Locked)</span>
                </div>
                <div className="flex items-center justify-between text-[#3B4953]">
                  <span>Subsequent Days (3 to 5):</span>
                  <span className="font-bold text-rose-700">Auto-Bypassed (₹0.00)</span>
                </div>
              </div>
            </div>

            {/* 2. Vendor Partial Refunds */}
            <div className="p-7 rounded-3xl neu-raised space-y-4">
              <div className="flex items-center justify-between">
                <span className="neo-accent-pill px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EBF4DD] text-[#3B4953]">
                  SCENARIO 02
                </span>
                <span className="text-xs font-mono text-[#5A7863] font-semibold">Proportional Reversal</span>
              </div>
              <h3 className="text-lg font-bold text-[#3B4953]">Vendor Refunds ₹6,000 Due to Weather</h3>
              <p className="text-xs text-[#3B4953]/75 leading-relaxed">
                When the sailing school issues a refund to Priya&apos;s UPI, TULIS links the refund to the original catamaran expense and credits back every participant in their exact original contribution ratio.
              </p>
              <div className="p-4 rounded-xl neu-inset-sm space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[#3B4953]">
                  <span>Original Expense:</span>
                  <span className="font-bold">₹8,000 (4 participants)</span>
                </div>
                <div className="flex items-center justify-between text-[#5A7863]">
                  <span>Refund Disbursed:</span>
                  <span className="font-bold">-₹1,500 credited to each</span>
                </div>
              </div>
            </div>

            {/* 3. Non-Refundable Cost Isolation */}
            <div className="p-7 rounded-3xl neu-raised space-y-4">
              <div className="flex items-center justify-between">
                <span className="neo-accent-pill px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EBF4DD] text-[#3B4953]">
                  SCENARIO 03
                </span>
                <span className="text-xs font-mono text-[#5A7863] font-semibold">No Group Penalty</span>
              </div>
              <h3 className="text-lg font-bold text-[#3B4953]">Missed Flight or Overslept Cab</h3>
              <p className="text-xs text-[#3B4953]/75 leading-relaxed">
                If Vikram misses the shared morning ferry and takes a separate private water taxi, that cost is flagged as an isolated individual expense. The squad is never unfairly billed for an individual mishap.
              </p>
              <div className="p-4 rounded-xl neu-inset-sm space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[#3B4953]">
                  <span>Private Taxi Cost:</span>
                  <span className="font-bold">₹2,400.00</span>
                </div>
                <div className="flex items-center justify-between text-[#5A7863]">
                  <span>Squad Allocation:</span>
                  <span className="font-bold">100% assigned to Vikram</span>
                </div>
              </div>
            </div>

            {/* 4. Midway Late Joiner */}
            <div className="p-7 rounded-3xl neu-raised space-y-4">
              <div className="flex items-center justify-between">
                <span className="neo-accent-pill px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EBF4DD] text-[#3B4953]">
                  SCENARIO 04
                </span>
                <span className="text-xs font-mono text-[#5A7863] font-semibold">Zero Retroactive Drift</span>
              </div>
              <h3 className="text-lg font-bold text-[#3B4953]">Friend Joins Squad on Day 4</h3>
              <p className="text-xs text-[#3B4953]/75 leading-relaxed">
                Meera lands in Goa on Day 4 and scans the trip QR code. She is dynamically attached only to Day 4 onward activities, leaving past audited calculations 100% untouched.
              </p>
              <div className="p-4 rounded-xl neu-inset-sm space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[#3B4953]">
                  <span>Days 1 to 3 History:</span>
                  <span className="font-bold text-[#5A7863]">Untouched (0% share)</span>
                </div>
                <div className="flex items-center justify-between text-[#3B4953]">
                  <span>Days 4 & 5 Splits:</span>
                  <span className="font-bold text-[#5A7863]">Joined 6th participant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          06: UNDERSTAND YOUR BALANCE: "Who paid? Who consumed? Why do I owe?"
          Ratio: 50% Neumorphism / 20% Neo-Brutalism / 10% Glass / 20% Bento
          Authentic PNGs: compass.png, rock-01.png
          ========================================================================== */}
      <section id="balances" className="relative py-28 sm:py-36 px-6 max-w-7xl mx-auto scroll-mt-24 sm:scroll-mt-28">
        {/* Genuine TULIS Asset: Compass overlapping top-right corner of the balance card */}
        <div className="hidden lg:block absolute right-4 top-20 w-24 h-24 pointer-events-none z-20 filter drop-shadow-md">
          <Image
            src="/tulis/travel/compass.png"
            alt="True North Compass"
            fill
            sizes="96px"
            className="object-contain"
          />
        </div>

        <div className="space-y-14">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-[#3B4953] tracking-tight leading-[1.12]">
              Understand your balance.{' '}
              <span className="text-[#5A7863]">Every single rupee.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#3B4953]/80 leading-relaxed font-normal max-w-2xl mx-auto">
              Stop squinting at arbitrary final totals. TULIS breaks down every member&apos;s position through a 4-step plain-English verification chain.
            </p>
          </div>

          {/* The 4-Step Chain: PAID -> CONSUMED -> ALLOCATED -> OWED */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl neu-raised space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="neo-accent-pill px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EBF4DD]">
                  STEP 01
                </span>
                <span className="text-[10px] font-mono text-[#5A7863] uppercase font-bold">Fronted Cash</span>
              </div>
              <h3 className="font-bold text-base text-[#3B4953]">What You Paid</h3>
              <p className="text-xs text-[#3B4953]/75 leading-relaxed">
                Total money you physically fronted out of pocket for the group across all verified receipts.
              </p>
              <div className="p-3 rounded-xl neu-inset-sm font-mono font-bold text-base text-[#3B4953]">
                ₹22,000.00
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl neu-raised space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="neo-accent-pill px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EBF4DD]">
                  STEP 02
                </span>
                <span className="text-[10px] font-mono text-[#5A7863] uppercase font-bold">Fair Consumption</span>
              </div>
              <h3 className="font-bold text-base text-[#3B4953]">What You Consumed</h3>
              <p className="text-xs text-[#3B4953]/75 leading-relaxed">
                Your personal itemized share across accommodation, meals, drinks, activities, and transport.
              </p>
              <div className="p-3 rounded-xl neu-inset-sm font-mono font-bold text-base text-[#3B4953]">
                ₹17,150.00
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl neu-raised space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="neo-accent-pill px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EBF4DD]">
                  STEP 03
                </span>
                <span className="text-[10px] font-mono text-[#5A7863] uppercase font-bold">Adjustments</span>
              </div>
              <h3 className="font-bold text-base text-[#3B4953]">What Was Allocated</h3>
              <p className="text-xs text-[#3B4953]/75 leading-relaxed">
                Any subsidies, organizer discounts, non-refundable refunds, or private adjustments applied.
              </p>
              <div className="p-3 rounded-xl neu-inset-sm font-mono font-bold text-base text-[#5A7863]">
                ₹0.00 (Neutral)
              </div>
            </div>

            {/* Step 4: Final Net */}
            <div className="p-6 rounded-3xl neu-raised space-y-3 relative bg-[#EBF4DD] border-2 border-[#5A7863]">
              <div className="flex items-center justify-between">
                <span className="neo-accent-pill px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#5A7863] text-[#EBF4DD]">
                  STEP 04
                </span>
                <span className="text-[10px] font-mono text-[#5A7863] uppercase font-bold">Audit Position</span>
              </div>
              <h3 className="font-bold text-base text-[#3B4953]">Your True Balance</h3>
              <p className="text-xs text-[#3B4953]/75 leading-relaxed">
                Difference between cash fronted and consumption. Squad owes you this exact amount.
              </p>
              <div className="p-3 rounded-xl bg-[#5A7863] text-[#EBF4DD] font-mono font-black text-base flex items-center justify-between">
                <span>Surplus:</span>
                <span>+₹4,850.00</span>
              </div>
            </div>
          </div>

          {/* Plain-English Audit Guarantee Box (Doppelrand nested shell) */}
          <div className="doppelrand-shell">
            <div className="doppelrand-core p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#5A7863]" />
                <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-[#5A7863]">
                  The Plain-English Explainability Card
                </h4>
              </div>
              <p className="text-sm sm:text-base text-[#3B4953] leading-relaxed font-serif italic">
                &quot;Rohan fronted ₹22,000.00 across 2 group bookings (Villa Advance and Scooter Rentals). Across the 6 days, his itemized personal consumption in group activities and lodging totaled ₹17,150.00. Therefore, the group owes Rohan ₹4,850.00 upon final settlement. All 5 participants have a verified audit trail.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          07: SETTLEMENT: "Complex obligations become simple settlement."
          Ratio: 50% Neumorphism / 20% Neo-Brutalism / 10% Glass / 20% Bento
          Authentic PNGs: airplane.png, destination-marker.png
          ========================================================================== */}
      <section id="settlement" className="relative py-28 sm:py-36 px-6 bg-[#EBF4DD] border-t border-[#3B4953]/10 scroll-mt-24 sm:scroll-mt-28">
        {/* Genuine TULIS Asset: Airplane soaring across sky toward resolution */}
        <div className="hidden lg:block absolute left-[15%] top-16 w-[160px] aspect-[1444/536] pointer-events-none z-10 filter drop-shadow-sm">
          <Image
            src="/tulis/travel/airplane.png"
            alt="Airplane Reaching Destination"
            fill
            sizes="160px"
            className="object-contain"
          />
        </div>

        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-[#3B4953] tracking-tight leading-[1.12]">
              Complex obligations.{' '}
              <span className="text-[#5A7863]">Simple settlement.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#3B4953]/80 leading-relaxed font-normal max-w-2xl mx-auto">
              Traditional apps tell everyone to pay everyone else. TULIS runs a greedy graph-netting algorithm that compresses the entire squad&apos;s IOUs into the absolute minimum number of UPI transfers.
            </p>
          </div>

          {/* Interactive Netting Sandbox Console (Doppelrand Architecture) */}
          <div className="doppelrand-shell">
            <div className="doppelrand-core p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#3B4953]/15">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#5A7863] font-bold block">
                    Algorithm Sandbox Mode
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#3B4953]">
                    {sandboxNet
                      ? 'Compressed Graph Topology (3 Optimized Transfers)'
                      : 'Raw Tangled Network (6 Redundant Pairwise Debts)'}
                  </h3>
                </div>

                {/* Execution Toggle Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSandboxNet(!sandboxNet)}
                    className="neu-btn px-4 py-2 rounded-xl text-xs font-bold text-[#3B4953] hover:text-[#5A7863] flex items-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#5A7863]" />
                    <span>{sandboxNet ? 'View Raw Pairwise Tangled Debts' : 'Execute Greedy Graph Netting'}</span>
                  </button>

                  {sandboxNet && (
                    <button
                      onClick={onEnterApp}
                      className="neu-btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Settle via UPI</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Debt Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(sandboxNet
                  ? [
                      { from: 'Vikram Mehta', to: 'Rohan Sharma', amount: '₹9,650.00', note: 'Single UPI scan completes full obligation' },
                      { from: 'Priya Patel', to: 'Rohan Sharma', amount: '₹4,850.00', note: 'Villa & activity balance resolved' },
                      { from: 'Arjun Nair', to: 'Sneha Rao', amount: '₹3,200.00', note: 'Prorated early checkout closed' },
                    ]
                  : [
                      { from: 'Priya Patel', to: 'Rohan Sharma', amount: '₹3,200.00', note: 'Raw pairwise loan' },
                      { from: 'Vikram Mehta', to: 'Rohan Sharma', amount: '₹6,400.00', note: 'Raw pairwise loan' },
                      { from: 'Priya Patel', to: 'Arjun Nair', amount: '₹1,650.00', note: 'Raw pairwise loan' },
                      { from: 'Vikram Mehta', to: 'Arjun Nair', amount: '₹3,250.00', note: 'Raw pairwise loan' },
                      { from: 'Sneha Rao', to: 'Rohan Sharma', amount: '₹4,900.00', note: 'Raw pairwise loan' },
                      { from: 'Arjun Nair', to: 'Sneha Rao', amount: '₹8,100.00', note: 'Raw pairwise loan' },
                    ]
                ).map((debt, idx) => (
                  <div key={idx} className="p-4 rounded-2xl neu-inset-sm space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-rose-700">{debt.from}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#5A7863]" />
                      <span className="font-semibold text-[#5A7863]">{debt.to}</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="font-mono font-black text-base text-[#3B4953]">{debt.amount}</span>
                      <span className="text-[10px] font-mono text-[#5A7863] font-semibold">UPI Ready</span>
                    </div>
                    <p className="text-[10px] text-[#3B4953]/60 italic">{debt.note}</p>
                  </div>
                ))}
              </div>

              {/* Zero-Sum Assurance Badge */}
              <div className="p-3.5 rounded-xl bg-white/70 border border-[#3B4953]/15 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5A7863]" />
                  <span className="font-semibold text-[#3B4953]">Zero-Sum Ledger Verified: Sum of all credits equals sum of all debits exactly.</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-[#3B4953]/60">Net Drift:</span>
                  <span className="font-bold text-[#5A7863]">₹0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          08: TRUST / AUDIT: "Every number has a trail."
          Ratio: 50% Neumorphism / 20% Neo-Brutalism / 10% Glass / 20% Bento
          Authentic PNGs: rock-01.png, rock-03.png
          ========================================================================== */}
      <section id="audit" className="relative py-28 sm:py-36 px-6 max-w-7xl mx-auto scroll-mt-24 sm:scroll-mt-28">
        {/* Genuine TULIS Assets: Grounding rocks in foreground */}
        <div className="hidden lg:block absolute left-4 bottom-12 w-24 aspect-[487/423] pointer-events-none z-10 filter drop-shadow-sm">
          <Image src="/tulis/nature/rock-01.png" alt="Audit Rock" fill sizes="96px" className="object-contain" />
        </div>
        <div className="hidden lg:block absolute right-6 bottom-14 w-28 aspect-[637/318] pointer-events-none z-10 filter drop-shadow-sm">
          <Image src="/tulis/nature/rock-03.png" alt="Audit Rock 3" fill sizes="112px" className="object-contain" />
        </div>

        <div className="space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-[#3B4953] tracking-tight leading-[1.12]">
              Every number{' '}
              <span className="text-[#5A7863]">has a trail.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#3B4953]/80 leading-relaxed font-normal max-w-2xl mx-auto">
              No silent edits. No deleted rows. No mysteriously altered formulas. Every transaction, upload, and payment is an immutable append-only event.
            </p>
          </div>

          {/* Immutable Event Stream Strip (Doppelrand Architecture) */}
          <div className="doppelrand-shell">
            <div className="doppelrand-core p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#3B4953]/15 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#5A7863] font-bold block">
                    Append-Only Ledger Log
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#3B4953]">Live Cryptographic Event Stream</h3>
                </div>
                <span className="neo-accent-pill px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#EBF4DD] text-[#3B4953]">
                  100% Deterministic
                </span>
              </div>

              {/* Horizontal Timeline Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { time: '09:14 IST', actor: 'Rohan Sharma', action: 'Added expense', detail: 'Villa Rental Advance • ₹32,000', badge: 'Receipt Attached' },
                  { time: '11:32 IST', actor: 'Priya Patel', action: 'Uploaded bill proof', detail: 'Morjim Catamaran Invoice PDF', badge: 'Verified' },
                  { time: '14:05 IST', actor: 'Arjun Nair', action: 'Registered checkout', detail: 'Departed Vagator on Day 3', badge: 'Prorated' },
                  { time: '16:40 IST', actor: 'System Engine', action: 'Executed graph netting', detail: '10 IOUs converted to 3 minimal UPI paths', badge: 'Deterministic' },
                  { time: '18:15 IST', actor: 'Vikram Mehta', action: 'Settled via UPI', detail: '₹9,650.00 to Rohan (UTR 92841)', badge: 'Settled' },
                  { time: '19:00 IST', actor: 'Sneha Rao', action: 'Exported audit log', detail: 'Full trip CSV journal generated', badge: 'Archived' },
                ].map((ev, idx) => (
                  <div key={idx} className="p-4 rounded-2xl neu-inset-sm space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#3B4953]/60">{ev.time}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#5A7863]/15 text-[#5A7863] text-[9px] font-mono font-bold">
                        {ev.badge}
                      </span>
                    </div>
                    <h4 className="font-bold text-[#3B4953]">{ev.action}</h4>
                    <p className="text-[11px] text-[#3B4953]/70">{ev.detail}</p>
                    <span className="text-[10px] font-mono text-[#5A7863] block pt-1">By {ev.actor}</span>
                  </div>
                ))}
              </div>

              {/* Bottom Capabilities Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/60 border border-[#3B4953]/15 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#5A7863] font-bold block">One-Click Export</span>
                  <p className="text-xs font-semibold text-[#3B4953]">Download complete CSV and PDF accounting journal for post-trip archives.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/60 border border-[#3B4953]/15 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#5A7863] font-bold block">Offline-First Engine</span>
                  <p className="text-xs font-semibold text-[#3B4953]">CRDT deterministic sync functions without cell reception in mountain treks.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/60 border border-[#3B4953]/15 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#5A7863] font-bold block">Zero Silent Edits</span>
                  <p className="text-xs font-semibold text-[#3B4953]">Every adjustment creates a new reversal transaction with full squad visibility.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          ADVANCED FEATURES (3-Card Editorial Section: Multimodal AI, What-If Scenarios, Emergency SOS)
          ========================================================================== */}
      <EditorialFeaturesSection />

      {/* ==========================================================================
          FINAL FOOTER (Cinematic Editorial Dark TULIS Signature Footer)
          ========================================================================== */}
      <TulisFooter
        onEnterApp={onEnterApp}
        onOpenCreateTrip={onOpenCreateTrip}
        onOpenJoinTrip={onOpenJoinTrip}
        onOpenMyTrips={onOpenMyTrips}
        currentUser={currentUser}
      />
    </div>
  );
};
