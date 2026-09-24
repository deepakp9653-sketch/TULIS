# GroupTrip Ledger — Product Requirements Document (PRD)

**Document Type:** PRD
**Status:** Phase 3 of 3 — Hackathon Documentation Suite
**Version:** 1.0

---

## 1. Problem Statement

Group travel — friend trips, family reunions, student groups, corporate offsites — routinely involves multiple travelers, multiple vendors, and asymmetric participation: not everyone joins every activity, rooms and transport are shared unevenly, and payments are frequently made by whoever's card is handy at the time.

As the trip evolves — participants joining or dropping out, activities changing, cancellations, refunds, new expenses appearing — it becomes genuinely difficult for anyone to answer three basic questions with confidence: **Who is in what? Who has paid? Who owes whom, and how much?**

Today this is handled with spreadsheets, group chats, and payment apps stitched together manually, which produces duplicate payments, silent errors, and a group financial picture that nobody actually trusts.

## 2. Product Vision

GroupTrip Ledger is a unified group travel coordination and settlement platform that treats a trip's itinerary and its finances as *one connected system* rather than two. Every change to the group — a new booking, a dropped participant, a refund — automatically and transparently propagates through to who owes what, with a full auditable history of why.

**Vision statement:** *Nobody should ever have to ask "wait, did we recalculate for that?" — the platform always has.*

## 3. Target Users & Personas

| Persona | Description | Core Need |
|---|---|---|
| **The Organizer** | Plans the trip, books most vendors, fronts costs | Needs control: create itinerary, assign participants, configure splits, track who owes what without micromanaging |
| **The Participant** | Joins some or all activities, pays their own share | Needs clarity: a personal view of their itinerary, what they owe, what they've paid, no surprises |
| **The Late Joiner / Early Leaver** | Joins or exits mid-trip planning or mid-trip itself | Needs fairness: accurate recalculation of their share without manual group renegotiation |
| **The Payer-on-Behalf** | Pays for a subgroup (e.g., a parent paying for their family unit within a larger group trip) | Needs delegation: ability to represent multiple participants' shares under one payment |

## 4. Core User Stories

### 4.1 Itinerary & Participant Management

- As an **Organizer**, I want to build a master itinerary covering transport, lodging, and activities, so the group has one source of truth for the trip plan.
- As an **Organizer**, I want to assign specific participants to specific bookings/activities, so people who don't join an activity aren't charged for it.
- As an **Organizer**, I want to add a new participant mid-trip and have them automatically slotted into the correct future bookings and share calculations, so I don't have to manually redo the math.
- As a **Participant**, I want to leave an activity or the trip and have my share removed and redistributed according to the original split rule, so remaining participants pay a fair, recalculated amount.

### 4.2 Expenses & Splitting

- As an **Organizer**, I want to log an expense and choose how it's split (equal, weighted/per-night, line-item, room-tier, or organizer-paid subsidy), so costs are divided the way the group actually agreed.
- As a **Participant**, I want to see exactly how my share of any given expense was calculated, so I trust the number I'm being asked to pay.
- As an **Organizer**, I want to record a partial cancellation or refund against an existing booking, so the ledger reflects reality without me manually reversing every affected participant's balance.

### 4.3 Payments & Settlement

- As a **Participant**, I want to record a payment I've made (to a vendor or to another participant), so my outstanding balance updates immediately.
- As any **User**, I want the platform to simplify the group's tangled web of debts into the minimum number of necessary payments, so settling up at the end of the trip takes three transactions instead of fifteen.
- As a **Participant**, I want a personal summary showing my full itinerary and my complete payment history/balance, so I have one place to check instead of five chat threads.

### 4.4 Transparency & Trust

- As any **User**, I want to see a plain-language history of every event that changed my balance (who joined, what was added, what was refunded), so recalculations never feel arbitrary.
- As an **Organizer**, I want to see budget-vs-actual variance across the trip, so I can catch overspending before it becomes a dispute.

## 5. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | System shall allow creation of a trip with a master itinerary composed of discrete bookings (transport, lodging, activity, other). | Must |
| FR-2 | System shall allow assignment of a subset of trip participants to each individual booking. | Must |
| FR-3 | System shall support at least 5 split methods: equal, weighted/per-night, line-item allocation, room-tier weighting, organizer-paid subsidy. | Must |
| FR-4 | System shall recalculate all affected balances automatically upon: participant addition, participant removal, booking modification, cancellation, refund, or new expense. | Must |
| FR-5 | System shall maintain an immutable, append-only event log of every state-changing action. | Must |
| FR-6 | System shall compute a minimal settlement transaction set (debt simplification) across all participants with non-zero balances. | Must |
| FR-7 | System shall provide each participant a personal itinerary + payment summary view, scoped to only their own participation and balance. | Must |
| FR-8 | System shall provide a group-level financial dashboard showing total spend, per-category variance, and outstanding balances. | Should |
| FR-9 | System shall support recording payments made both to external vendors and peer-to-peer between participants. | Must |
| FR-10 | System shall flag budget variance (actual vs. estimated cost) per booking and in aggregate. | Should |
| FR-11 | System shall support multi-currency expense logging with conversion to a trip base currency. | Could |
| FR-12 | System (stretch) shall surface AI-assisted suggestions: inconsistent bookings, cost-saving alternatives, optimal room/group arrangements. | Could |

## 6. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Consistency:** Balance recalculation must be deterministic — replaying the event log from empty state must always produce the same final balances. |
| NFR-2 | **Auditability:** Every balance must be traceable to the specific sequence of events that produced it, viewable by any participant. |
| NFR-3 | **Responsiveness:** Recalculation and UI update after a triggering event should complete and render within ~1.5s for a group of up to 50 participants. |
| NFR-4 | **Correctness under concurrency:** Simultaneous edits (e.g., two organizers logging expenses at once) must not corrupt balances or silently drop events. |
| NFR-5 | **Data integrity:** No destructive edits — corrections to historical expenses are recorded as new compensating events, not overwrites. |
| NFR-6 | **Accessibility:** UI must meet WCAG AA contrast standards for all financial-state indicators. |
| NFR-7 | **Scalability (conceptual):** Architecture should reasonably extend from a single trip of ~10 people to a multi-trip platform with thousands of concurrent trips. |

## 7. Edge Case Behaviors

| Scenario | Expected Behavior |
|---|---|
| Participant leaves after already paying their share of a now-void activity | Their payment is preserved as a credit; the credit is either refunded or auto-applied against their remaining balance on other bookings, organizer's choice. |
| Participant joins after an expense was already split among fewer people | Organizer is prompted whether the new participant should be retroactively included in the existing split (triggering a recalculation event) or only in future expenses. |
| Partial cancellation of a booking (e.g., 2 of 6 people cancel a shared activity) | The booking's total cost is redistributed among the remaining confirmed participants per the original split method; a `PARTIAL_CANCELLATION` event is logged with before/after share deltas. |
| Currency change mid-trip (e.g., crossing a border, vendor bills in a different currency) | Expense is logged in its native currency with a conversion snapshot (rate + timestamp) to the trip base currency; original currency is preserved for audit even if rates later fluctuate. |
| Refund issued for a booking already marked as paid-in-full by multiple participants | Refund is distributed back to payers proportional to their original contribution, not equally, unless manually overridden. |
| Two organizers modify the same booking's split simultaneously | Event-sourcing model resolves via event ordering (timestamp + sequence); the later event is applied on top of the current state, and both organizers are notified if their intended change was superseded. |
| A participant is removed but has outstanding unpaid debt | Debt is preserved as a standing balance tied to that (now-inactive) participant record; it does not vanish, and is surfaced in the organizer's outstanding-balances view until manually resolved. |

## 8. Success Metrics (Hackathon Framing)

Since this is a hackathon prototype, "success metrics" are framed as demonstrable proof points rather than production KPIs:

- **Recalculation correctness:** Given a scripted sequence of participant/expense changes, the final ledger state matches a manually-verified expected balance sheet with zero discrepancy.
- **Settlement compression:** Debt simplification reduces a demo scenario's transaction count by a clearly visible margin (e.g., from 12 raw debts down to 3–4 net settlements).
- **Time-to-clarity:** From triggering a mid-trip change (e.g., removing a participant) to the UI showing fully updated, correct balances — target under 2 seconds, visibly animated so judges can follow the causality.
- **Comprehensibility:** A judge unfamiliar with the product should be able to look at any single participant's summary view and correctly state what they owe and why, without narration.

## 9. Out of Scope (for Hackathon MVP)

- Real payment processing / actual money movement (Stripe, Venmo, etc. integration) — simulated/recorded only.
- Native mobile applications (web-responsive only).
- Multi-language localization.
- Full production-grade authentication/authorization (basic role simulation only: Organizer vs. Participant).
- Real AI/ML model training for the "intelligent suggestions" stretch feature — a rules-based or prompted-LLM approximation is acceptable for demo purposes.
