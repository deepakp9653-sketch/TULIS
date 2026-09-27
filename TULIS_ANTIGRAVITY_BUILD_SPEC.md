# TULIS — The World's Best Build Specification
### One file. Every gap. Zero guesswork. — for Antigravity

> **Read `current_PROJECT_DOCUMENTATION.md` first.** That file is the source of truth for what TULIS
> *already is* — 67 components, 11 API route groups, a 1,421-line ledger engine, 20 database tables,
> full Gogo AI planner, receipt OCR, safety SOS, and a working corporate portal. This file is the source
> of truth for what TULIS *becomes next*. Do not re-derive architecture from scratch — cross-reference
> the two documents constantly.

---

## 0. Operating Rules — Read Before Touching Anything

These rules are not suggestions. They override any instinct to "just also fix" something adjacent.

1. **Nothing that already works gets changed without asking first.** If a feature below extends an
   existing table, component, or route, you may *add* to it. You may never rename, remove, restructure,
   or change the behavior of anything already shipped without first stopping and asking the user for
   explicit permission — even if you believe it's an improvement. A working feature is not a bug.
2. **No predefined, hardcoded, mocked, or placeholder values in anything you build here.** Every new
   number, status, score, or recommendation must be computed from real data already in the ledger, a
   real user input, or a real external API call. If a feature genuinely cannot be built without a real
   data source that doesn't exist yet (a corporate rate feed, a weather API key, an insurance partner),
   say so explicitly in the plan and mark it blocked — do not fake it with sample data to make progress
   look further along than it is. This applies with extra force to anything touching money: no feature
   in this document may ever bypass the zero-sum ledger invariant or write a balance directly. AI
   suggests; the ledger engine (`ledger-engine.ts`) decides. That principle already governs the shipped
   product — every feature below inherits it.
3. **Every feature must earn its place.** Each feature card below states the specific problem it solves
   and who it solves it for. If you find yourself building something from this spec that doesn't
   trace back to a stated problem, stop — that's scope creep, not the roadmap.
4. **Don't rebuild what's already real.** Section 4 is organized so that already-shipped functionality
   is named and skipped, not duplicated. Before starting any feature card, grep the existing codebase for
   the referenced files — if something described as "new" already partially exists, extend it, don't
   parallel-build it.
5. **Two features from the source roadmap are deliberately excluded.** See Section 7. Do not build them,
   even if referenced elsewhere as inspiration. This is a considered decision, not an oversight.
6. **Do not write implementation code yet.** Your first deliverable back to the user is a phased
   implementation plan (see Section 9) — sequencing, file-by-file scope, and effort estimate per feature.
   Wait for explicit go-ahead on that plan, and get sign-off phase by phase, before writing code.

---

## 1. What Already Exists — Compressed Primer

(Full detail lives in `current_PROJECT_DOCUMENTATION.md`. This is only so this spec is self-contained
enough to sanity-check against.)

TULIS is a working Next.js 16 / React 19 / TypeScript app on Neon Postgres. It already has: a
deterministic 6-method split engine with cent-exact rounding; a zero-sum, event-sourced ledger
(`events` table, 33+ event types); greedy debt-compression settlement; a What-If dry-run simulator;
anomaly detection (5 checks); duplicate-expense guard; debt reassignment; nudge reminders; cross-trip
squad netting; UPI QR + deep-link settlement; a full Gogo AI conversational trip planner with a
curated venue registry and Google Maps enrichment; a multi-engine receipt OCR pipeline (OpenCV +
Tesseract + Groq/OpenAI fallback); Whisper voice expense logging; Trip Chat with AI summarization; a
complete Safety & SOS system (live GPS tracking, nearest-police lookup, crowdsourced safety ratings,
a public `/live/[sosEventId]` tracking page); and a corporate layer (organizations, cost centers,
expense policies, an approval queue, corporate SSO-style auth). Offline queueing and CSV/PDF audit
export already work.

**This means most of the "moonshot" ambition from the original roadmap is already real.** The job of
this document is *not* "add AI to TULIS" or "add safety to TULIS" — those exist. The job is: close the
specific, named gaps that stop each pillar from being genuinely world-class, and build the handful of
ideas that are authentically still missing.

---

## 2. Design System — The "Editorial Forest" Evolution

### 2.1 Scope of this palette — resolve before building

The current shipped design system is a **cool blue-gray neumorphic system** (`--color-page: #EBF1F6`,
emerald brand accent `#059669`, dual-shadow soft-UI cards — see `current_PROJECT_DOCUMENTATION.md §15`).
The palette below is a **bolder, warmer, editorial evolution**, explicitly scoped to new work in this
roadmap, not a silent replacement of what's shipped.

> **Open question for the user, not yours to decide:** does "this section" mean (a) every new
> screen/component built under this spec should adopt the new palette while existing shipped screens
> stay neumorphic-blue as-is, or (b) a specific new feature area (e.g., the Moonshot program, or the
> Corporate layer) should get this treatment while the rest of the new work stays visually consistent
> with the current app? Default to **(a)** — apply it to everything new — unless the user says otherwise,
> but confirm before a full visual pass. Either way, Rule 1 in Section 0 still applies: the *existing*
> neumorphic tokens in `globals.css` and `tailwind.config.js` are not touched or removed.

### 2.2 Palette

| Token | Hex | Use |
|---|---|---|
| Deep Forest | `#12382E` | Darkest text / high-contrast surfaces |
| Forest Green | `#1F5A45` | Primary brand green, headers |
| Editorial Green | `#2D7A5C` | Secondary accents, links, active states |
| Soft Sage | `#DCEFE3` | Light surface fill |
| Pale Mint | `#EAF4E9` | Page background alternative |
| TULIS Lime | `#D9EE86` | High-energy accent — CTAs, highlights, bold blocks |
| Warm Yellow | `#F2D778` | Secondary accent — badges, callouts |
| Golden Yellow | `#D9B94E` | Tertiary accent — sparingly, for emphasis only |
| Paper | `#F4F5EE` | Primary new-surface background |
| Warm Cream | `#FFF9E8` | Card fill, soft contrast surface |
| Soft Navy | `#243B53` | Alternate dark text, financial figures |
| Muted Blue | `#4A6278` | Secondary text on Paper/Cream |

### 2.3 Design language

**Flat editorial vector + bold color blocking + oversized illustrations + subtle neumorphism +
controlled neo-brutalism.** In practice:

- Large, confident color blocks (Lime, Warm Yellow) behind key numbers and CTAs — not gradients.
- Flat vector illustration for empty states, onboarding, and the safety/organizer character moments —
  no photography, no 3D renders in this new layer (the existing globe/shader work stays where it is).
- Neo-brutalist touches used *sparingly and deliberately*: a visible 2px Deep Forest border and a hard
  offset shadow on a small number of high-priority elements per screen (primary CTA, the trip health
  score card, the moonshot badge) — never applied to every card, or it reads as noise, not confidence.
- Neumorphism kept subtle and only where the current system already uses it (buttons, inset inputs) —
  do not introduce heavy dual-shadow neumorphism into new Editorial-Forest surfaces; that's the old
  system's signature, not this one's.
- Bento-grid layouts for dashboards and summary screens — irregular, confident block sizing, not a
  uniform card grid. This is what `responsive-bento-architect` is for.
- Generous whitespace on Paper/Warm Cream backgrounds; Deep Forest and Soft Navy text only — never
  gray-on-gray.

### 2.4 Skill routing for design work

Every new screen or component in this spec must pass through, in order:
`ui-ux-pro-max` (concept + layout) → `antigravity-design-expert` (visual language / palette
application) → `responsive-bento-architect` (grid/breakpoint structure, where a dashboard-style layout
applies) → `front-end-design-system` (token + component consistency against Section 2.2) →
`wcag-accessibility-audit` (mandatory, no exceptions — contrast ratios on Lime/Warm Yellow especially,
since bright accent colors are the easiest place to fail contrast).

---

## 3. Full Skill Routing Map

| Skill | When to invoke |
|---|---|
| `ui-ux-pro-max` | Any new screen, modal, or dashboard view before layout work begins |
| `antigravity-design-expert` | Applying Section 2 palette/language to any new surface |
| `responsive-bento-architect` | Any dashboard, summary, or multi-card layout (Trip Health Score, Org Portfolio Dashboard, Post-Trip Retrospective, Moonshot badge page) |
| `wcag-accessibility-audit` | Every new screen, no exceptions — run before marking a feature UI-complete |
| `front-end-design-system` | Any time a new component is created, to keep it token-consistent with both the existing neumorphic system and the new Editorial Forest layer |
| `git-commit-formatter` | Every commit, for every feature in this document |
| `code-smell-refactor` | Pass over any file touched more than once across this roadmap (e.g., `ledger-engine.ts`, `page.tsx`) before considering that feature done |
| `opentestai-qa` | Every feature with a money-path or safety-path implication (which is most of them) needs test coverage before merge |
| `json-to-pydantic` | **Flagged mismatch — see note below.** |
| `mcp-builder` | Used when a feature is explicitly built as an MCP-exposed tool — see F-M3 (Ledger-as-a-Service) and any future email-forward or weather-API integration worth exposing as a reusable tool |
| `antigravity-guide` | General reference throughout |
| `agy-customizations` | Antigravity's own environment/workflow settings — not feature-specific |

> **Honest flag on `json-to-pydantic`:** Pydantic is a Python library. TULIS is a TypeScript/Next.js
> codebase end-to-end (`types.ts`, not Python models). This skill has no current target in this project
> unless a future feature introduces a separate Python microservice. Don't force a use for it — skip it
> unless that changes, and tell the user if you think one of the moonshot features (most plausibly the
> Ledger-as-a-Service API, if it's ever split into its own service) would justify introducing one.

---

## 4. Feature Build Plan, By Pillar

Each card: the problem it solves, what to build, data/API/UI deltas, acceptance criteria, skills, and
priority (**P0** = foundational/highest impact, **P1** = important, **P2** = valuable but sequenced later).

### Pillar 1 — Trip Planner

*Already shipped, do not rebuild:* Gogo's 4-step interview → itinerary generation, destination
registry, Google Maps enrichment, plan preview, swap-spot, convert-to-trip, and
`checkItineraryFeasibility` (transit overlap / checkout-departure conflict detection).

#### F1.1 — Budget-First Backward Planning
**Solves:** Gogo takes budget as an interview *label*, not a hard constraint — a generated plan can
still land over budget with no explanation.
**Build:** In the Gogo generation step (`/api/gogo`, `action=answer` → generation), after a plan is
produced, compare its total cost against the interview's stated budget. If over, iteratively downgrade
(room tier first, then lowest-priority activity) until within budget, and record every trade-off made.
**Data:** additive only — `gogo_sessions.generated_plan` JSONB gains a `budget_adjustments: []` array.
**UI:** `GogoPlanPreviewModal.tsx` shows a visible "Adjusted to fit ₹X" panel listing each trade-off.
**Acceptance:** [ ] No plan is silently returned over budget. [ ] Every adjustment is user-visible with
a stated reason. [ ] Removing a budget cap entirely restores current (unconstrained) behavior exactly.
**Skills:** `ui-ux-pro-max`, `front-end-design-system` · **Priority:** P1

#### F1.2 — Weather-Aware Replanning
**Solves:** Gogo has no concept of weather; a plan can schedule an outdoor activity into a forecast
washout with no warning.
**Build:** At plan-generation time, call a real weather-forecast API (needs a key — flag as blocked if
none is provisioned, do not fake forecast data) for the destination and trip dates. Flag any outdoor
booking against adverse forecast days and offer 1–2 real alternative-day/activity swaps via the
existing `swap-spot` action.
**Data:** additive — a `weather_snapshot` JSONB field on the `gogo_sessions` row, captured once at
generation time (not live-updated — avoid a background polling obligation this spec doesn't ask for).
**UI:** inline weather-conflict badges in `GogoPlanPreviewModal.tsx`, using existing swap-spot UI.
**Acceptance:** [ ] Feature no-ops cleanly (no error, no fake data) if no weather API key is configured.
[ ] A flagged conflict always offers a real, bookable alternative, not just a warning.
**Skills:** `ui-ux-pro-max` · **Priority:** P2 (blocked on API provisioning — confirm before starting)

#### F1.3 — Group Consensus Voting on a Gogo Plan
**Solves:** Gogo plans are generated for and converted by one organizer; the rest of the squad never
gets a say before it becomes the real trip.
**Build:** Before `convert-to-trip`, allow the organizer to share the plan preview with joined
participants for a lightweight yes/no/maybe vote per activity. Majority-preferred activities carry into
conversion; contested ones surface back to the organizer with the vote breakdown, not auto-resolved.
**Data:** new table `gogo_plan_votes (id, gogo_session_id FK, participant_id FK, activity_ref, vote,
created_at)` — no defaults, every row is a real cast vote.
**API:** new action on `/api/gogo`: `action=cast-vote`, `action=get-votes`.
**UI:** a voting view reachable from `GogoPlanPreviewModal.tsx`; participants who haven't joined the
trip yet vote via the existing invite-code flow.
**Acceptance:** [ ] Conversion is blocked from silently overriding a contested activity — organizer
must explicitly resolve it. [ ] Works correctly with zero votes cast (falls back to current behavior).
**Skills:** `ui-ux-pro-max`, `responsive-bento-architect` · **Priority:** P1

#### F1.4 — Auto-Rebooking Suggestions on Cancellation
**Solves:** `CancelBookingModal.tsx` handles the refund math correctly but leaves the traveler with a
gap in the itinerary and no next step.
**Build:** On booking cancellation, query the same destination-scraper registry Gogo already uses for
2–3 same-slot, same-category alternatives near the cancelled booking's time window and location.
**Data:** none — reuses `destination-scraper.ts` read-only.
**API:** extend `POST /api/trips` (`action=update-booking`) response to include `suggested_alternatives`
when a cancellation is processed.
**UI:** `CancelBookingModal.tsx` gains a "Here's what's still open nearby" panel post-cancellation.
**Acceptance:** [ ] Suggestions only appear when real registry matches exist — never a fabricated venue.
[ ] Declining suggestions leaves cancellation flow exactly as it works today.
**Skills:** `ui-ux-pro-max` · **Priority:** P1

#### F1.5 — Trip DNA: Clone a Past Trip's Itinerary Skeleton
**Solves:** No way to reuse a successful trip's structure for a new one; every trip starts from zero,
even for recurring squads (who already get *financial* netting via cross-trip squad balances, but no
*planning* reuse).
**Build:** From `MyTripsModal.tsx` or `TripSwitcherModal.tsx`, allow "Use this trip as a template" —
copies booking titles, categories, relative day-offsets, and durations (not dates, costs, or
participants) into a new trip draft for the organizer to adjust.
**Data:** no new tables — reads existing `bookings` rows for the source trip, writes fresh rows for the
new trip via the existing `save-booking` action, unmodified.
**UI:** new entry point in trip-selection modals; a lightweight review screen before commit.
**Acceptance:** [ ] Cloning never copies financial data (expenses, payments, allocations) — itinerary
structure only. [ ] Organizer can deselect individual bookings before cloning completes.
**Skills:** `ui-ux-pro-max`, `front-end-design-system` · **Priority:** P1 (this is also the seed for the
Moonshot Trip Template Marketplace — build this single-user version first, see F-M4)

---

### Pillar 2 — Organizer

*Already shipped:* trip creation, `is_organizer` flag, reconciliation audit, anomaly feed.

#### F2.1 — Trip Health Score
**Solves:** An organizer has to check the reconciliation audit, the anomaly banner, UPI setup status,
and booking confirmations separately to answer "is this trip under control."
**Build:** A single composite score computed live from data that already exists: reconciliation
discrepancy (from `computeReconciliationAudit`), open anomaly count (from `detectAnomalies`), % of
participants with UPI configured, % of bookings still `pending`. No new inputs, no hardcoded weighting
without justification — weighting logic must be documented in code comments, not a magic number.
**Data:** none — pure computed view over existing tables.
**UI:** a bento-card on `OverviewSection.tsx` — a Section 2 Editorial Forest candidate (bold color
block, oversized number).
**Acceptance:** [ ] Score updates immediately when any underlying signal changes — no caching staleness.
[ ] A trip with zero anomalies and full reconciliation always reads as fully healthy, verifiably.
**Skills:** `ui-ux-pro-max`, `responsive-bento-architect`, `antigravity-design-expert` · **Priority:** P0

#### F2.2 — Auto-Generated Readiness Checklist
**Solves:** No single place answers "what haven't we done yet" — organizer has to remember to check.
**Build:** Derive a checklist purely from existing data: participants without `upi_id`, bookings still
`pending`, expenses with unresolved allocation disputes, participants who haven't joined (`status`).
Zero new state — this is a read-only view composed from existing tables.
**UI:** lives alongside the Trip Health Score card (F2.1) — they share the same data-freshness contract.
**Acceptance:** [ ] Every checklist item links directly to the screen that resolves it. [ ] Nothing on
the checklist can go stale relative to the underlying table it reads.
**Skills:** `ui-ux-pro-max` · **Priority:** P0 (build alongside F2.1 — same underlying queries)

#### F2.3 — Capability-Scoped Delegation
**Solves:** `is_organizer` is a single boolean — all-or-nothing. A co-organizer can't be trusted with
"approve refunds" without also getting every other organizer power.
**Build:** Replace the binary flag's *authorization checks* (not the column itself, additively) with a
capability set: `can_edit_bookings`, `can_approve_refunds`, `can_manage_roster`, `can_remove_participants`.
Original organizer keeps all capabilities by default (no behavior change for existing trips).
**Data:** new table `participant_capabilities (participant_id FK, capability, granted_by, granted_at)` —
additive, existing `is_organizer=true` participants get all four rows seeded at migration time as a
*data migration*, not a hardcoded default for new rows.
**API:** capability checks added to relevant `/api/trips` actions; new `action=grant-capability` /
`action=revoke-capability`.
**UI:** a permissions panel in `SquadAndSettlementsView.tsx` or a new lightweight modal.
**Acceptance:** [ ] Every existing organizer action still works identically for the original organizer
post-migration. [ ] A participant with only `can_approve_refunds` cannot edit bookings.
**Skills:** `ui-ux-pro-max`, `opentestai-qa` (authorization logic needs real test coverage) ·
**Priority:** P1 — **ask the user before running the data migration on any existing trip data.**

#### F2.4 — Co-Pilot Announcement Drafting
**Solves:** Organizer manually retypes the same reminders ("settle up", "confirm RSVP") every trip.
**Build:** A Groq-backed draft generator (reuse the existing Groq integration pattern from
`explain-balance`/chat summarization) that composes a trip-chat-ready announcement from real trip state
(who owes what, which bookings need confirmation) — organizer reviews and sends via the existing
`TripChatPanel.tsx` send action; it never auto-sends.
**API:** new `/api/ai` action, e.g. `action=draft-announcement`.
**UI:** a "Draft an update" button inside `TripChatPanel.tsx`.
**Acceptance:** [ ] Draft always reflects live data at generation time — never templated placeholder
text. [ ] Sending requires an explicit organizer tap; nothing is dispatched automatically.
**Skills:** `ui-ux-pro-max` · **Priority:** P1

#### F2.5 — Organizer Succession
**Solves:** If the organizer goes unresponsive, nobody else can act — no existing mechanism at all.
**Build:** A participant with `can_manage_roster` (or a majority-participant vote, simplest real
mechanism: >50% of active participants request it) can trigger a succession request; if unresolved by
the current organizer within a stated window, capabilities transfer. Full event-logged via the existing
`events` table (new `event_type` values only — additive to the existing 33+, never overwrite the enum).
**Data:** no new tables — built on F2.3's capability table plus the existing `events` log.
**Acceptance:** [ ] Succession is always visible in the audit trail (`ActivityLogSection.tsx`) with who
requested it and why. [ ] Original organizer retains ability to reclaim if they return before the window
closes.
**Skills:** `opentestai-qa` · **Priority:** P2 — depends on F2.3

#### F2.6 — Cross-Trip Organizer Trust Score
**Solves:** No memory of who's a reliable organizer across a user's trip history.
**Build:** A private, opt-in score visible only to the user themself and squads they organize for,
computed from real historical signals only (on-time nudge follow-through, reconciliation cleanliness
across their past trips as organizer). Never public, never used to gate who *can* organize.
**Data:** a materialized/computed view over existing `trips`, `events`, `payments` — no new source data.
**Acceptance:** [ ] Score is never shown to anyone but the user themselves. [ ] No feature in this spec
gates capability based on this score — advisory only, per Section 0 Rule 2's spirit on not overclaiming.
**Skills:** `ui-ux-pro-max` · **Priority:** P2

---

### Pillar 3 — Arranging

*Already shipped:* `RoomOptimizerModal.tsx`, `VendorSummaryModal.tsx` (spend analysis), booking CRUD,
`optimizeRoomAllocations`.

#### F3.1 — Vendor Reliability Memory
**Solves:** `VendorSummaryModal.tsx` shows spend per vendor for *this* trip only — no memory across
trips of which vendors were actually reliable (refund speed, price accuracy vs. what was booked).
**Build:** Extend vendor tracking to be cross-trip: when a booking's `actual_cost` differs from
`estimated_cost`, or a refund is processed, log a reliability signal keyed by vendor name. Surface this
history the next time that same vendor name is selected in `AddBookingModal.tsx`.
**Data:** new table `vendor_reliability_signals (id, vendor_name, trip_id FK, signal_type, delta_value,
created_at)` — every row a real event, never seeded.
**UI:** a small "Booked before: refunds took ~6 days on average" hint in `AddBookingModal.tsx`.
**Acceptance:** [ ] Hint only appears once at least one real signal exists for that vendor name — no
placeholder "no data yet" fabrication beyond an honest empty state.
**Skills:** `ui-ux-pro-max` · **Priority:** P1

#### F3.2 — Partial-Attendance Calendar
**Solves:** Splits don't visually account for participants arriving/leaving mid-trip, even though
`REMOVE_PARTICIPANT` dry-runs already handle the math — there's no calendar view to set this up cleanly.
**Build:** A visual per-day attendance grid in `SquadAndSettlementsView.tsx` — mark each participant's
present/absent days. Feeds directly into existing split calculation (`calculateSplits`) as an additional
participant filter per expense day, not a new engine.
**Data:** new table `participant_attendance (participant_id FK, trip_id FK, date, present)` — additive.
**Acceptance:** [ ] Lodging/meal splits automatically exclude a participant on days marked absent.
[ ] Existing trips with no attendance data behave exactly as today (everyone present, every day).
**Skills:** `ui-ux-pro-max`, `responsive-bento-architect` · **Priority:** P1

#### F3.3 — Booking Auto-Import via Forwarded Email
**Solves:** Every booking is manually typed into `AddBookingModal.tsx`, even when the confirmation
already exists in the user's inbox.
**Build:** A dedicated forwarding address (or upload path) that runs a booking confirmation through the
same Groq vision/text extraction pattern already proven in the receipt OCR pipeline
(`opencv-ocr-engine.ts` + Groq cascade), mapped to booking fields instead of expense fields, landing in
a review screen before commit — never auto-creating a booking without human confirmation.
**Data:** none new — reuses the `receipt_extractions` pattern; consider a parallel
`booking_extractions` table mirroring its shape if booking fields diverge meaningfully from receipt fields.
**API:** new route or extended `/api/receipts` — confirm approach before building, since this is the
single highest-effort item in this pillar.
**Acceptance:** [ ] Nothing is written to `bookings` without explicit user confirmation in a review
screen, mirroring `ReceiptExtractionReviewModal.tsx`'s existing pattern exactly.
**Skills:** `ui-ux-pro-max`, `opentestai-qa` · **Priority:** P2 (highest-effort item in this pillar —
sequence after the P0/P1 items elsewhere are done)

#### F3.4 — Live "Who's Where" Logistics View
**Solves:** Live GPS tracking exists but only inside an active SOS event — there's no non-emergency,
opt-in "where's the squad right now" view for coordinating during the trip itself.
**Build:** An explicitly opt-in (separate consent from Safety Mode) live-location share, reusing the
existing location-ping infrastructure (`sos_location_pings` pattern) but *not* tied to an SOS event —
a new parallel table so this never gets confused with or degrades the emergency system.
**Data:** new table `trip_location_shares` + `trip_location_pings`, structurally similar to the SOS
tables but fully independent — **do not repurpose the SOS tables for this,** per Section 0 Rule 1;
emergency infrastructure stays untouched.
**UI:** a map view in `PlanAndLedgerView.tsx` or a new component, opt-in per participant per trip.
**Acceptance:** [ ] Fully separate consent and data path from the SOS system — confirmed by code review,
not just by table name. [ ] Turning it off for one participant never affects anyone else's view.
**Skills:** `ui-ux-pro-max`, `wcag-accessibility-audit` · **Priority:** P2

#### F3.5 — Concierge Mode for Trip Chat
**Solves:** `TripChatPanel.tsx`'s AI assistant is grounded in ledger data (spend, balances) but not in
itinerary/logistics questions ("what's the fastest way to the villa from here").
**Build:** Extend the existing AI-assistant context window to also include the trip's current
`bookings` and (if F3.4 ships) live location, so logistics questions get grounded answers instead of
generic ones. This is a context/prompt extension to existing infrastructure, not a new AI pipeline.
**Acceptance:** [ ] Answers about logistics are grounded in the actual trip's bookings — never invented
venues or times. [ ] Falls back gracefully (says it doesn't know) rather than guessing when data is thin.
**Skills:** `ui-ux-pro-max` · **Priority:** P1

---

### Pillar 4 — Financial

*Already shipped:* 6 split methods, zero-sum ledger, greedy debt simplification, dry-run simulator,
`calculateVariance`, cross-trip netting, debt reassignment, nudge reminders, CSV/PDF export.

#### F4.1 — Universal "Explain Any Number"
**Solves:** `ExplainBalanceModal.tsx` only explains a participant's *balance*. Every other number in the
app — an anomaly, a settlement transfer, a variance figure — has no equivalent trace-back.
**Build:** Generalize the existing `explainParticipantBalance` pattern into a reusable
`explainLedgerValue(eventRefs)` function that any UI number can call, tracing back through the actual
`events` rows that produced it, not just balances.
**API:** generalize `/api/ai/explain-balance` into a broader `/api/ai/explain` accepting a value type
and reference ID.
**UI:** every settlement transfer, anomaly card, and variance figure gets a "why?" affordance wired to
this.
**Acceptance:** [ ] Every explanation is generated from real `events` rows, never templated boilerplate.
[ ] The original balance-explanation entry point continues to work unchanged.
**Skills:** `ui-ux-pro-max`, `front-end-design-system` · **Priority:** P0 — this is the highest-leverage
single feature in the financial pillar; it turns the event-sourced architecture into something the user
actually sees.

#### F4.2 — Predictive Budget Variance
**Solves:** `calculateVariance` compares budget vs. actual *so far* — it doesn't project forward.
**Build:** Extend with a simple, honest time-series projection: current burn rate × remaining trip days
= projected final variance. No machine learning needed or wanted here — a transparent linear
projection the user can understand and distrust if it looks wrong is better than a black-box one.
**Acceptance:** [ ] Projection logic is inspectable/explainable in the UI, not a mystery number.
[ ] Never shown as a certainty — framed as a projection, explicitly.
**Skills:** `ui-ux-pro-max` · **Priority:** P1

#### F4.3 — Fairness Audit Report
**Solves:** No single end-of-trip artifact answers "who under-consumed vs. over-paid, relative to what
they actually used" — `explainParticipantBalance` explains one person's number, not the group's story.
**Build:** A trip-close-time report composing existing data (nights/activities attended via F3.2 if
shipped, else via `booking_participants`, and each participant's `NetBalance`) into a plain-language
per-person fairness narrative.
**UI:** a new report view, reachable from `ActivityLogSection.tsx` near the existing PDF certificate.
**Acceptance:** [ ] Entirely generated from real allocation and attendance data — no subjective scoring
invented. [ ] Available for any trip, not just ones with attendance data (degrades gracefully).
**Skills:** `ui-ux-pro-max`, `responsive-bento-architect` · **Priority:** P1

#### F4.4 — Locked FX Provenance
**Solves:** `currency` is a string field with no conversion tracking — a multi-currency trip has no
record of what rate was used when.
**Build:** When an expense is logged in a currency different from `trips.base_currency`, snapshot the
conversion rate *at that moment* (real rate from a real FX API — do not hardcode a static rate table)
as part of the immutable event payload, same pattern as every other ledger event.
**Data:** additive field on the `expenses` event payload — `fx_rate_snapshot`, `fx_source`, `fx_at`.
**Acceptance:** [ ] Rate is captured once, at logging time, and never silently re-fetched or changed
later — matching the immutability principle of the rest of the ledger. [ ] Feature is inert (no-op) for
trips where every expense matches `base_currency` — zero behavior change for the common case.
**Skills:** none design-specific · **Priority:** P2 — blocked on provisioning a real FX rate API; flag
if none is available rather than faking rates.

#### F4.5 — TULIS Score: Payment Reliability
**Solves:** No signal, even within a single squad, for who reliably settles promptly vs. who needs
repeated nudges.
**Build:** A private, opt-in, squad-visible score computed from real payment timing data already in the
`payments` and nudge-reminder history — time from debt creation to settlement, nudges required.
**Acceptance:** [ ] Computed only from real payment timestamps, never inferred or estimated.
[ ] Opt-in per user; a user who opts out is simply excluded from the display, not shown a fake score.
**Skills:** `ui-ux-pro-max` · **Priority:** P2

---

### Pillar 5 — Safety & Security

*Already shipped:* full SOS beacon + live GPS tracking + public `/live/[sosEventId]` page + nearest
police lookup + crowdsourced safety ratings + Safety Mode onboarding. This pillar is the most mature in
the entire roadmap — treat every card below as a genuine, narrow gap, not a rebuild.

#### F5.1 — Live SOS Accuracy Radius Display
**Solves:** `accuracy_meters` is already captured in `sos_location_pings` but may not be visually
surfaced on the public `/live/[sosEventId]` page — confirm current state first; this may be a UI-only
completion task, not new plumbing.
**Build:** If not already shown, render the accuracy radius as a visible circle/range indicator around
the location pin on the live tracking page, so imprecision never reads as false precision.
**Acceptance:** [ ] The displayed radius always matches the real `accuracy_meters` value for that ping
— never a fixed cosmetic circle.
**Skills:** `wcag-accessibility-audit` · **Priority:** P0 — cheap, real safety-honesty win; verify
current state before scoping further work.

#### F5.2 — AI-Generated Destination Safety Brief
**Solves:** Gogo generates an itinerary but no safety context for the destination.
**Build:** At Gogo plan-generation time, compose a one-page brief (nearest hospital via Google Maps
data already integrated, general regional safety notes) using the same Groq pipeline already used for
itinerary generation — reuse the integration, don't build a second one.
**Acceptance:** [ ] Brief content is generated from real destination data (Maps API results), never
generic filler text unconnected to the actual destination.
**Skills:** `ui-ux-pro-max` · **Priority:** P1

#### F5.3 — Passive Check-In
**Solves:** The only safety trigger today is active — a user has to remember to tap SOS. The far more
common real failure mode (someone going quiet, not someone in active crisis) has no coverage.
**Build:** A genuinely new, opt-in mechanism, fully separate from the SOS tables (same isolation
principle as F3.4): a participant can opt into a periodic "still okay?" prompt; a missed response after
a configurable window notifies their emergency contacts or the trip organizer — **not** a full SOS
trigger, a distinct lighter-weight alert, clearly labeled as such.
**Data:** new table `checkin_schedules` + `checkin_responses` — fully independent of `sos_events`.
**Acceptance:** [ ] Never conflated with or capable of automatically escalating into a full SOS event —
that distinction must be visible in the UI copy, not just the data model. [ ] Fully opt-in, per trip,
per participant.
**Skills:** `ui-ux-pro-max`, `wcag-accessibility-audit` · **Priority:** P1

#### F5.4 — Buddy Pairing for Split-Off Activities
**Solves:** No mechanism addresses the common real risk moment of a participant splitting from the
group for a solo activity.
**Build:** When a booking is logged with fewer assigned `booking_participants` than the trip's active
roster, prompt the assigned participant(s) to designate a check-in buddy from the rest of the squad for
that window — ties into F5.3's check-in mechanism if shipped, or a simple one-off nudge if not.
**Acceptance:** [ ] Purely a prompt/nudge — never blocks booking creation if declined.
**Skills:** `ui-ux-pro-max` · **Priority:** P2

#### F5.5 — Embassy/Consular Advisory Integration
**Solves:** The AI-generated safety brief (F5.2) has no authoritative government source alongside it.
**Build:** Pull real official travel advisory data for the destination (a government advisory API/feed
— must be a real source; do not summarize from general model knowledge and present it as an official
advisory) alongside the AI-generated brief, clearly attributed and separated from the AI content.
**Acceptance:** [ ] Advisory content is always sourced and attributed, never AI-paraphrased and passed
off as official. [ ] Feature no-ops cleanly for destinations/countries with no available feed.
**Skills:** none design-specific · **Priority:** P2 — blocked on sourcing a real advisory feed.

#### F5.6 — Audit Trail Reframed as Safety Evidence
**Solves:** The immutable event log is real and already exists, but it's not positioned or exposed as
usable safety-incident evidence — purely a UI/framing task, no new engineering.
**Build:** On the `/live/[sosEventId]` page (or a linked view), surface the relevant trip event history
around the SOS trigger time window — booking status, last known plan — as a factual record, clearly
labeled as a record, not as active protection.
**Acceptance:** [ ] Only ever labeled as a record of what happened/what was known — copy must never
imply active monitoring or guaranteed intervention, per Section 0 Rule 2 and the caution in Section 7.
**Skills:** none design-specific · **Priority:** P2

---

### Pillar 6 — AI Features

*Already shipped:* Gogo, receipt OCR cascade, Whisper voice logging, chat NLP parsing, chat AI
summarization, `ExplainBalanceModal`, anomaly detection + `AnomalyFeedBanner`, What-If simulator.

#### F6.1 — Anomaly Triage Assistant
**Solves:** `AnomalyFeedBanner.tsx` lists anomalies; it doesn't prioritize them or connect related ones
(a roster mismatch and a budget variance anomaly might share one root cause).
**Build:** A Groq-backed pass (reusing the existing summarization integration pattern) over the current
`detectAnomalies` output that groups related anomalies and proposes a fix order — advisory text only,
never auto-resolves anything.
**Acceptance:** [ ] Never modifies ledger state — output is explanatory/ordering only.
[ ] Grouping logic is traceable back to the real anomaly data, not invented connections.
**Skills:** `ui-ux-pro-max` · **Priority:** P1

#### F6.2 — Post-Trip AI Retrospective
**Solves:** Nothing currently synthesizes a trip's full financial/logistics story after it ends —
genuinely new, and per the original roadmap this is also the strongest retention/referral artifact.
**Build:** At trip-close, generate a summary (spend breakdown, most active organizer by event count,
fairness highlights if F4.3 shipped) from real `events`/`expenses` data — same Groq pattern as chat
summarization.
**UI:** a shareable retrospective view — a strong Editorial Forest / bento-grid design candidate.
**Acceptance:** [ ] Entirely generated from real trip data, no filler. [ ] Available for any completed
trip, regardless of size.
**Skills:** `ui-ux-pro-max`, `responsive-bento-architect`, `antigravity-design-expert` · **Priority:** P1

#### F6.3 — Dispute Mediator Mode
**Solves:** `expense_allocations` already has dispute tracking mentioned in the schema, but no AI
assistance exists for actually resolving a disputed allocation.
**Build:** When an allocation is flagged disputed, generate a neutral, event-grounded explanation of
both the payer's and the disputing participant's position from real ledger events — never writes
financial state; a human still resolves the dispute.
**Acceptance:** [ ] Read-only — cannot change an allocation itself. [ ] Explanation is symmetric — never
implicitly takes a side beyond what the events show.
**Skills:** `ui-ux-pro-max` · **Priority:** P2

#### F6.4 — Natural-Language What-If Queries
**Solves:** `WhatIfSimulatorModal.tsx` requires form input; a plain-English question like "what if
Rohan drops out and we upgrade to the suite" has to be manually translated into the form by the user.
**Build:** A Groq parsing layer in front of the *existing* `simulateDryRun` engine — translates free
text into the structured `DryRunDelta` inputs the engine already accepts. No changes to the simulation
engine itself.
**Acceptance:** [ ] Every parsed query is confirmed back to the user before running (show the
interpreted structured action) — never silently guesses and executes. [ ] Falls back to the existing
manual form if parsing confidence is low.
**Skills:** `ui-ux-pro-max` · **Priority:** P1

#### F6.5 — Visible Confidence Scoring, Everywhere
**Solves:** Confidence scores already exist in several places (`receipt_extractions.confidence_score`,
chat-parse confidence) but aren't surfaced consistently — a UI/consistency pass, not new AI work.
**Build:** Audit every AI-touchpoint component (`ReceiptExtractionReviewModal`, `ChatExpenseModal`,
`AudioShieldModal`, Gogo outputs) and ensure each surfaces its real confidence value using one shared,
consistent UI pattern.
**Acceptance:** [ ] No AI-touchpoint in the product silently hides a confidence score that already
exists in its data. [ ] The pattern is one shared component, not five bespoke implementations.
**Skills:** `front-end-design-system` · **Priority:** P0 — cheap, real trust win across the whole app.

#### F6.6 — Cross-Trip Financial Coach
**Solves:** `netCrossTripSquadBalances` already consolidates cross-trip *balances* — nothing yet
surfaces a behavioral insight from that same historical data.
**Build:** A periodic, opt-in insight ("you tend to run over on transport vs. your squad's average")
computed purely from the user's own historical `expenses`/`events` data — no comparison to other users
outside their own squads, ever.
**Acceptance:** [ ] Every insight is traceable to real historical numbers, shown alongside the insight.
[ ] Opt-in, dismissible, never a nag.
**Skills:** `ui-ux-pro-max` · **Priority:** P2

---

### Corporate Layer — Extensions

*Already shipped:* organizations, org members with roles and cost centers, expense policies (category
caps, auto-approval thresholds), the approval queue (`evaluate-expense` / `decide`), corporate auth,
`CorporateDashboardShell.tsx`, `OrgDashboardModal.tsx`.

#### FC.1 — Real-Time Policy Compliance Checking (pre-submit)
**Solves:** `evaluate-expense` currently checks policy *after* submission. The highest-value corporate
AI move is catching the violation at draft time, before it's submitted at all.
**Build:** Call the same policy-evaluation logic used by `evaluate-expense` at expense-*draft* time in
`DynamicSplitDrawer.tsx`/`ChatExpenseModal.tsx` when the trip is org-linked, surfacing the specific rule
and threshold inline, before commit.
**Acceptance:** [ ] Uses the exact same evaluation logic as the existing post-submit check — no second,
divergent rule engine. [ ] Never blocks submission outright for a non-organizer-configured trip.
**Skills:** `ui-ux-pro-max` · **Priority:** P0 for the corporate layer — highest leverage, reuses
existing logic almost entirely.

#### FC.2 — Multi-Level Approval Chains
**Solves:** `approvals` is currently single-approver. Real companies need manager → finance tiers for
larger spend.
**Build:** Extend `approvals` with a chain concept — a second threshold in `expense_policies` that
routes to a second approver role after the first approval, additive to the existing single-approver
path (which continues to work unchanged for spend under the second threshold).
**Data:** additive columns on `expense_policies` (`second_tier_threshold`, `second_tier_role`); no
change to existing `approvals` rows' meaning.
**Acceptance:** [ ] Existing single-tier orgs are entirely unaffected unless they explicitly configure a
second tier. [ ] Chain state is fully visible in `ApprovalQueueSection.tsx`.
**Skills:** `opentestai-qa` · **Priority:** P1

#### FC.3 — Central Travel-Desk Portfolio Dashboard
**Solves:** `OrgDashboardModal.tsx` exists but the roadmap's highest-leverage corporate idea — a
portfolio view across *all* active trips, not one at a time — needs confirming/building explicitly.
**Build:** A rollup view: every active org-linked trip's health (reusing F2.1's Trip Health Score
computation, if shipped), pending approvals count, and total spend, in one bento-grid dashboard.
**Acceptance:** [ ] Reuses the Trip Health Score logic rather than inventing a second scoring system.
[ ] Scales correctly whether an org has 2 trips or 200.
**Skills:** `responsive-bento-architect`, `antigravity-design-expert` · **Priority:** P0 for corporate.

#### FC.4 — Real-Time Department Spend Dashboard
**Solves:** Finance currently has no live view of spend by cost center — only per-trip data.
**Build:** Aggregate `expenses.cost_center` across all org trips in real time (query, not a report job).
**Acceptance:** [ ] Numbers always reflect current ledger state — no batch/cached staleness beyond
normal query latency.
**Skills:** `responsive-bento-architect` · **Priority:** P1

#### FC.5 — Per-Diem Auto-Calculation
**Solves:** No automated per-diem — currently every meal/incidental is manually logged.
**Build:** Org admins configure a real per-diem rate per grade/destination in policy settings (user-
configured, never a hardcoded default rate); the system auto-generates the corresponding daily expense.
**Acceptance:** [ ] Rate always comes from org-configured policy data, never a built-in default value.
[ ] Auto-generated expenses are clearly marked as such and remain editable.
**Skills:** none design-specific · **Priority:** P1

#### FC.6 — Duty-of-Care Dashboard
**Solves:** No org-scoped view of travelling-employee safety status exists — Safety Mode/SOS is
per-trip/per-user today.
**Build:** An admin view surfacing real-time SOS/Safety Mode status (opt-in per employee, per Section 0
Rule 2 and existing Safety Mode consent) across all org-linked trips.
**Caution — mandatory copy review:** this feature implies active monitoring. UI copy must never claim
guaranteed intervention or emergency dispatch — it surfaces what the existing SOS system already knows,
nothing more. **Do not ship without the user's explicit sign-off on the exact wording used**, per
Section 7.
**Acceptance:** [ ] Built entirely on existing SOS/Safety Mode data — no new safety claims invented.
[ ] Every employee shown has explicitly opted into Safety Mode for that trip — no silent inclusion.
**Skills:** `wcag-accessibility-audit`, `ui-ux-pro-max` · **Priority:** P1, gated on copy sign-off.

#### FC.7 — Document/Compliance Expiry Tracking
**Solves:** No tracking of passport/visa/insurance validity for upcoming employee trips.
**Build:** Org admins (or employees themselves) input real document expiry dates; the system alerts
ahead of trips where a document will be invalid — pure date-math, no external verification implied.
**Acceptance:** [ ] Never implies verification of document authenticity — purely a self-reported
reminder system, and copy must say so.
**Skills:** none design-specific · **Priority:** P1

#### FC.8 — Consolidated Multi-Employee Trip Booking
**Solves:** Booking many employees onto the same event today means repeating the trip-creation flow
per person.
**Build:** A bulk-invite/bulk-booking flow from the corporate dashboard — creates one trip, adds many
participants, and applies the same booking set to all in one pass, using existing `save-booking` and
join logic underneath, not a new engine.
**Acceptance:** [ ] Produces identical per-trip data to doing it manually N times — no shortcut that
skips validation.
**Skills:** `ui-ux-pro-max` · **Priority:** P1

#### FC.9 — GST-Ready Export
**Solves:** `generateAccountingExportCSV` produces a general CSV; corporate finance in India needs
GST-relevant fields.
**Build:** Extend the existing CSV export with GST-relevant columns (HSN/SAC where applicable, tax
breakdown if captured on the expense).
**Caution:** **this must never be marketed or labeled as tax-compliant or legally sufficient** without
real accounting/legal review — ship the export, do not ship a compliance claim. See Section 7.
**Acceptance:** [ ] No UI copy anywhere uses the word "compliant" or "GST-ready" without the user
having separately confirmed that claim is reviewed and accurate.
**Skills:** none design-specific · **Priority:** P2

#### FC.10 — Negotiated Corporate Rate Surfacing
**Solves:** No mechanism exists for surfacing a company's negotiated vendor rates during booking.
**Build:** **Blocked on a real data source** — this needs either manual org-admin-entered negotiated
rates (real, user-provided data) or a real vendor-rate API partnership. Build the data model and UI
slot; do not populate it with sample/fake rates to demonstrate the feature.
**Acceptance:** [ ] Feature is entirely inert/hidden for orgs that haven't entered real rate data —
never shows a placeholder rate.
**Skills:** `ui-ux-pro-max` · **Priority:** P2, and flag to the user that this needs a real data source
decision before any UI work starts.

---

## 5. Moonshot Program — TULIS 1000x

These are the biggest bets — the ideas that would make TULIS categorically different from every
competitor named in its own market research, not just incrementally better. Sequence these **after**
the P0/P1 items above are solid; a moonshot built on a shaky foundation just multiplies the shakiness.

#### F-M1 — The Unified AI Companion ("Gogo, Everywhere")
**The idea:** Gogo (planning), Trip Chat's AI assistant, `ExplainBalanceModal`, the Anomaly Triage
Assistant (F6.1), and the Post-Trip Retrospective (F6.2) are currently five separate AI touchpoints
using the same underlying Groq integration pattern. Unify them behind one persistent assistant identity
and entry point — one FAB, one conversational thread that follows the trip from planning through
settlement through retrospective, internally routing to the right specialized logic.
**Why this is the highest-leverage moonshot:** every piece already exists and works. This is an
integration and product-narrative move, not new AI capability — genuinely high impact for genuinely
bounded effort.
**Build:** Consolidate `GogoFAB.tsx` and `TripChatFAB.tsx` into one entry point; route user intent to
the correct existing backend action (`/api/gogo`, `/api/ai/*`, `/api/chat`) behind one conversational UI.
**Acceptance:** [ ] No existing individual capability regresses — this is a UI/routing consolidation,
not a rebuild of any of the five underlying features. [ ] The user should never be able to tell which
of the five original systems answered — it should feel like one assistant throughout.
**Skills:** `ui-ux-pro-max`, `antigravity-design-expert`, `front-end-design-system` · **Priority:**
Moonshot-1 (do this first among moonshots).

#### F-M2 — Pool Contribution Mode
**The idea:** A genuinely different settlement model from every competitor's settle-after approach —
participants pre-pay into a shared trip pool (tracked as real ledger events, never actual escrow —
TULIS stays a ledger, not a payment processor, per the product's own stated non-goals); expenses draw
down the pool instead of generating new peer debts.
**Build:** New event types (additive to the existing 33+, never overwriting), a `pool_contributions`
table, and new ledger-engine logic parallel to (not replacing) the existing debt-based flow — a trip
opts into Pool Mode explicitly; default behavior for every existing trip is unchanged.
**Acceptance:** [ ] Zero-sum invariant holds under Pool Mode exactly as under the default model —
`computeReconciliationAudit` must be extended to understand pool balances, not bypassed. [ ] A trip not
opted into Pool Mode is entirely unaffected by this feature's existence.
**Skills:** `opentestai-qa` (this touches the core ledger — test rigorously) · **Priority:** Moonshot-2.

#### F-M3 — Ledger-as-a-Service API
**The idea:** License the deterministic split/settlement/ledger engine itself as a documented,
authenticated public API — the actual defensible IP in this whole product is `ledger-engine.ts`'s pure
functions, not the app around them.
**Build:** A versioned, authenticated `/api/v1/ledger/*` surface exposing `calculateSplits`,
`simplifyDebts`, and `computeReconciliationAudit` as standalone, stateless operations (no TULIS account
required for the API-only use case). This is a genuine candidate for `mcp-builder` if exposing these as
MCP tools for other agentic systems is in scope — confirm with the user before committing to that path
versus a plain REST API.
**Acceptance:** [ ] Every exposed function is a pure, already-tested function from the existing engine
— no new financial logic invented for the API surface. [ ] Rate limiting and auth are real, not
placeholder.
**Skills:** `mcp-builder` (if MCP-exposed), `opentestai-qa` · **Priority:** Moonshot-3 — largest scope,
sequence last.

#### F-M4 — Trip Template Marketplace ("Trip DNA")
**The idea:** Extends F1.5 (single-user trip cloning) into a shareable, forkable template system —
users publish successful itineraries (privately to a squad, or public) for others to fork.
**Build:** Builds directly on F1.5's cloning mechanism plus a visibility/sharing layer and a browsable
gallery. Do not build this before F1.5 — it's the same mechanism with a publishing layer on top.
**Acceptance:** [ ] Published templates never carry financial or personal data — itinerary structure
only, same constraint as F1.5. [ ] A user can always tell whether a template is private (squad-only) or
public before publishing.
**Skills:** `ui-ux-pro-max`, `responsive-bento-architect` · **Priority:** Moonshot-4, depends on F1.5.

#### F-M5 — TULIS Verified Trust Badge
**The idea:** `computeReconciliationAudit` already produces a real zero-sum verification. Turn that
existing rigor into a shareable, public trust signal — a badge a completed trip can display showing it
was independently, mathematically verified.
**Build:** A shareable public badge/page (similar pattern to `/live/[sosEventId]`'s public-page
approach) generated from the trip's real, final reconciliation audit result — never generated for a
trip that hasn't actually reconciled cleanly.
**Acceptance:** [ ] Badge is only ever issued for a trip whose real reconciliation audit passed —
never issuable manually or for a trip in a disputed/unreconciled state.
**Skills:** `ui-ux-pro-max`, `antigravity-design-expert` · **Priority:** Moonshot-5 — cheapest moonshot,
good candidate to sequence early if the team wants a quick, real, high-polish win.

---

## 6. Design System Application Targets

Every screen/component newly introduced by Section 4 and Section 5 above is a candidate for the
Editorial Forest treatment (Section 2). The highest-value application targets, specifically:

- Trip Health Score card (F2.1) and Readiness Checklist (F2.2) — bold color-blocked bento cards
- Post-Trip AI Retrospective (F6.2) — the single best candidate for oversized-illustration + bold
  color-blocking; this is the "shareable artifact" screen and should look unmistakably different from
  the rest of the (currently neumorphic-blue) app
- Corporate Portfolio Dashboard (FC.3) — bento-grid, multiple trip cards at a glance
- TULIS Verified badge page (F-M5) — the public-facing trust artifact; should feel premium and bold,
  it's marketing surface as much as product surface
- The Unified AI Companion (F-M1) entry point — one confident, bold FAB replacing two existing ones

---

## 7. Explicitly Excluded — Do Not Build

1. **Chat sentiment analysis to detect "group tension."** Crosses into psychological inference about
   real people without consent. This was flagged as a bad idea in the original roadmap and stays
   excluded here — do not build it even if a future request references it in passing.
2. **A discreet SOS trigger gesture (silent panic activation).** Genuinely useful in a duress scenario,
   but carries real liability and false-positive risk that needs legal review before it's anything more
   than a spec — not a build item in this phase.
3. **Any GST/tax-compliance claim in UI copy** (FC.9) without real legal/accounting review — build the
   export, never the claim, until that review happens.
4. **Any Duty-of-Care copy** (FC.6) implying guaranteed monitoring, rescue, or emergency dispatch — the
   product is a browser-geolocation-plus-share-link system, and its own safety pillar has always been
   honest about that boundary. Keep it that way.
5. **Fabricated data of any kind** to make a feature demo-able before its real data source exists —
   see Section 0 Rule 2. A blocked feature stays visibly blocked, never faked.

---

## 8. Non-Negotiable Engineering Rules (recap)

- [ ] Every money-touching feature preserves `computeReconciliationAudit`'s zero-sum invariant —
  verified by test, not assumed.
- [ ] No new table duplicates the purpose of an existing one — check Section 5 of
  `current_PROJECT_DOCUMENTATION.md` before creating anything new.
- [ ] No existing API action's behavior changes without the user's explicit sign-off first.
- [ ] No hardcoded/mock/default values anywhere in new backend logic — real computed values, real user
  input, or a real external source only. A feature blocked on a missing real data source is marked
  blocked, not faked.
- [ ] Every new screen passes `wcag-accessibility-audit` before being marked complete.
- [ ] Every commit follows `git-commit-formatter`.
- [ ] Every feature touching money or safety gets real test coverage via `opentestai-qa` before merge.

---

## 9. What Antigravity Does With This File

**Step 1.** Read this file and `current_PROJECT_DOCUMENTATION.md` together.

**Step 2.** Do not write any code yet. Return a **phased implementation plan** to the user containing:
- Proposed phase groupings (a sensible sequence honoring the priorities marked P0 → P1 → P2 → Moonshot,
  and respecting the explicit dependency notes within each card, e.g. F1.5 before F-M4, F2.3 before
  F2.5, F5.3 as a prerequisite pattern for F5.4)
- For each feature: real files touched, new files/tables created, and an honest effort estimate
- Explicit call-outs for every item in this document marked "blocked" (weather API, FX API, advisory
  feed, corporate rate data) so the user can resolve those dependencies before that phase starts
- Explicit call-outs for every item requiring the user's sign-off before building (F2.3's data
  migration, FC.6 and FC.9's copy review, the Section 2.1 design-system scope question)

**Step 3.** Wait for the user's explicit approval of the plan — and of each phase as you reach it —
before writing implementation code. Section 0's rules apply throughout, not just at the start.

**Step 4.** Build one feature at a time, each ending in: passing tests (`opentestai-qa`), an
accessibility pass (`wcag-accessibility-audit`) for anything with new UI, a `code-smell-refactor` pass
on any file touched more than once, and a properly formatted commit (`git-commit-formatter`).

---

## 10. Open Questions — Resolve Before Phase 1

1. Does the Editorial Forest palette (Section 2) apply to *all* new work, or a specific feature area?
   (Section 2.1's default is "all new work" — confirm or override.)
2. Is `json-to-pydantic` relevant to any planned future Python microservice, or should it be dropped
   from the active skill set for this roadmap entirely?
3. Which of the four blocked-on-external-data features (F1.2 weather, F4.4 FX rates, F5.5 advisory
   feed, FC.10 corporate rates) does the user actually want to unblock now vs. leave deferred?
4. For F-M3 (Ledger-as-a-Service): REST API, MCP-exposed tool, or both?
5. Confirm the exact wording review process for FC.6 and FC.9 before either is built — who signs off?

---

<div align="center">
<strong>TULIS — One Trip. One Ledger. Zero Confusion.</strong><br/>
<sub>This spec adds nothing that doesn't trace to a real problem, and nothing that isn't real when it ships.</sub>
</div>
