# GroupTrip Ledger — Feature Extension Pack (Phase 4)

**Document Type:** Addendum to PRD (Doc 02) & TRD (Doc 03)
**Purpose:** New features + execution instructions for the build agent (Antigravity)
**Status:** Phase 4 — Post-Analysis Differentiation Layer
**Version:** 1.0
**Read alongside:** `02-GroupTrip-Ledger-PRD.md`, `03-GroupTrip-Ledger-TRD.md`, `GroupTrip_Ledger_PS_Deep_Analysis.docx`

---

## 0. Why This Doc Exists

Your PRD + TRD already build the **judged floor correctly**: event sourcing, all 5 split
methods, debt simplification, audit log, variance engine. That is necessary but is also
what every competent team will attempt. The Deep Analysis doc correctly identifies that
the *real* test is recalculation under chaos — but it stops at architecture and doesn't
specify the **product-level features that make correctness visible, trustworthy, and
demoable**, or the ones that make the submission memorable beyond "clone with a nicer
data model."

This doc adds exactly that layer: net-new features, the new events/state they require
(extending TRD §2.1), and step-by-step execution guidance an AI coding agent can act on
directly.

---

## 1. Gap Analysis

| Already covered (PRD/TRD) | Not yet covered — added here |
|---|---|
| Event-sourced ledger, 5 split models, debt simplification, audit log, variance engine | Live proof-of-correctness UI, pre-commit simulation, two-sided trust, dispute handling, vendor analytics, anomaly detection *product surface*, demo tooling, multi-trip memory, exports, room optimizer |

---

## 2. New Features

Each feature: **why it wins**, user story, new event(s) to append to TRD §2.1, functional
requirements, execution notes, effort.

### TIER 1.5 — Trust & Live-Correctness (build these right after Tier 1; highest ROI per hour)

**F1. Live Reconciliation Widget**
- *Why it wins:* Directly operationalizes the Deep Analysis's "invariant that must always
hold" (§6.7) as something judges can *see* update in real time, not just read about.
- *User story:* As any user, I see a persistent badge — `Σ Expenses (net of refunds) = Σ Shares Owed → ✅ Reconciled` — that recomputes after every event.
- *New event:* none (pure read-model, runs the existing fold after every mutation).
- *Functional req:* Recompute and re-render within NFR-3's 1.5s budget; turn red with a diff amount if it ever fails (should never happen — this is the point).
- *Execution:* Subscribe the widget to the same projection layer that renders balances. No new backend logic — just expose `Σ(expense.amount - refunds) - Σ(allocations)` as an endpoint.
- *Effort:* S

**F2. Dry-Run / What-If Simulator**
- *Why it wins:* The Deep Analysis flags "what happens if I remove this person now?" as the #1 live-judge question and the #1 failure point. This feature turns that risk into your best demo moment.
- *User story:* As an Organizer, before I confirm an action (remove participant, cancel booking, revise price), I see a preview of resulting balance deltas, and can cancel or confirm.
- *New event:* none committed — the command layer runs the event fold **speculatively** against a cloned in-memory state and discards it if not confirmed.
- *Functional req:* Preview must use the exact same reducer as real commits (no parallel "preview logic" — that's a correctness trap).
- *Execution:* Add a `dryRun: boolean` flag to the command layer; if true, run the same event→projection fold on a scratch copy of state and return the diff without appending to the event log.
- *Effort:* M

**F3. Two-Sided Settlement Confirmation**
- *Why it wins:* PRD's `PAYMENT_RECORDED` currently trusts the payer's word alone. A payee-confirms step is a realistic fintech-grade trust control and costs almost nothing to add.
- *User story:* As a Participant who is owed money, I can mark a reported payment as "confirmed received" or "dispute," so a balance isn't wiped by a one-sided claim.
- *New events:* `PAYMENT_CONFIRMED`, `PAYMENT_DISPUTED` (both reference the original `PAYMENT_RECORDED` event id).
- *Functional req:* Balance shows as "pending confirmation" (visually distinct) until confirmed; disputed payments revert to outstanding and surface in the Activity Log.
- *Execution:* Extend TRD §2.1 event table; payment state machine = `recorded → confirmed | disputed`.
- *Effort:* S–M

**F4. Dispute & Resolution Flow (on expenses, not just payments)**
- *Why it wins:* Extends the trust story from F3 to expense allocations themselves — "I don't think I should owe this" — which is a real group-travel scenario the PRD's edge cases don't cover.
- *User story:* As a Participant, I can flag a specific allocation as disputed with a note; the Organizer resolves it (adjust, reject, split differently), and the resolution is logged.
- *New events:* `ALLOCATION_DISPUTED`, `ALLOCATION_DISPUTE_RESOLVED`.
- *Functional req:* Disputed allocations are visually flagged in both personal and group views until resolved; resolution is a compensating event, never an overwrite (consistent with NFR-5).
- *Effort:* M

---

### TIER 2.5 — Differentiators (build once Tier 1 + 1.5 are solid)

**F5. Vendor Intelligence Dashboard**
- *Why it wins:* The Deep Analysis explicitly calls out that most teams will drop the *multi-vendor* half of the product's own title. This makes it a first-class, demoable surface.
- *User story:* As an Organizer, I see per-vendor totals paid, refunds pending/received, and number of bookings, across the trip.
- *New event:* none — pure projection over existing `BOOKING_CREATED`/`REFUND_CREDITED` events, grouped by `vendor_id`.
- *Execution:* Add `vendor` as a first-class field on Booking (TRD §6 already implies this — make it explicit and queryable).
- *Effort:* S

**F6. Deterministic Anomaly Detection Engine (+ optional LLM explanation)**
- *Why it wins:* This is PRD FR-12 / Deep Analysis §8, made concrete instead of left as a vague "AI stretch."
- *User story:* As an Organizer, I get flagged: (a) overlapping bookings for the same participant, (b) a room's occupant count exceeding capacity, (c) a payment total that doesn't match its booking's recorded cost, (d) a participant marked in an activity but not on the trip roster.
- *New event:* `ANOMALY_FLAGGED` (system-generated, references the offending event(s)), `ANOMALY_DISMISSED`.
- *Functional req:* Rules run synchronously after any relevant mutation; **the LLM (if used) only narrates an already-computed anomaly list — it never decides what counts as an anomaly.** This is the single most important guardrail from the Deep Analysis (§8) — do not let a model touch the financial math.
- *Execution:* Rules engine = simple predicate functions run over the current projection; keep them in one `anomalyRules.ts`/`.py` file so they're easy to demo and extend live.
- *Effort:* M

**F7. Chaos Demo Mode (Scenario Seeder)**
- *Why it wins:* The Deep Analysis's entire pitch strategy (§17) hinges on live-demoing a chaotic sequence. Don't leave that to manual clicking under pressure — script it.
- *User story:* As a demo presenter, I click "Run Chaos Sequence" and the app executes, with visible pacing/animation: add participant → log shared expense → remove a different participant who already paid → cancel a booking → issue partial refund → run reconciliation check → run settlement simplification.
- *New event:* none — it's an orchestrated replay of existing commands with UI delays between steps.
- *Functional req:* Each step pauses briefly and highlights the balance delta on screen so judges can visually track causality (ties directly to PRD's "Time-to-clarity" success metric).
- *Effort:* S (high leverage — this is your judging-round insurance policy)

**F8. "Explain My Balance" Conversational Assistant**
- *Why it wins:* Turns the audit log (already required, FR-5) into an interactive trust feature instead of a static list — a natural-language layer strictly grounded in real events (RAG-style), not a free-floating chatbot.
- *User story:* As a Participant, I can ask "why do I owe ₹1,200?" and get a plain-language answer built **only** from my own event history, with each claim traceable to a specific event.
- *New event:* none.
- *Functional req:* The prompt to the LLM must include only the requesting participant's filtered event slice, and the system prompt must instruct it to summarize, never compute new numbers. This mirrors the Deep Analysis's core AI-safety framing (§8, §10.4).
- *Effort:* M

**F9. Budget Guardrails (UI for TRD §4's Variance Engine)**
- *Why it wins:* TRD already specs the variance math conceptually; this makes it an actual visible feature judges interact with, not backend logic they have to take on faith.
- *User story:* As an Organizer, I set a total trip budget ceiling; the system suggests category sub-budgets (lodging/transport/activities) and pulses a warning when actual spend crosses a configurable threshold (default ±15%, per TRD §4).
- *New event:* `BUDGET_CEILING_SET`, `VARIANCE_THRESHOLD_BREACHED` (advisory, never blocking — consistent with TRD's "flags, never blocks" principle).
- *Effort:* S–M

---

### TIER 3 — Stretch / "Wow" (only if Tier 1–2.5 are demo-ready)

**F10. Room/Seat Allocation Optimizer**
- Bin-packing/constraint-satisfaction: minimize total single-supplement cost while respecting stated preferences (keep families together). LLM, if used, only explains the assignment logic in plain language. *(Deep Analysis §8, §9.3 — made concrete here.)*
- *Effort:* L

**F11. Persistent "Travel Squad" Profiles**
- *Why it wins:* A genuine product differentiator no competing team is likely to build — remembers a friend group across multiple trips (names, default split preferences, past balances), so setting up trip #2 takes 30 seconds instead of re-entering everyone.
- *New event:* `SQUAD_CREATED`, `SQUAD_MEMBER_LINKED`.
- *Effort:* M–L (touches the "multi-trip platform" NFR-7 directly — good story for scalability questions)

**F12. Shareable Read-Only Settlement Report**
- One click generates a public read-only link/PDF of final balances + settlement plan, for people who never open the app. Strong "real-world usability" signal for judges.
- *Effort:* S

**F13. Multi-Currency Auto-FX**
- Upgrades PRD FR-11 from "Could" to "Should" — live rate fetch at expense-log time, snapshot preserved per TRD's currency edge case.
- *Effort:* M

---

## 3. New Events — Additions to TRD §2.1 Table

| Event | Triggered By | Effect on Read Model |
|---|---|---|
| `PAYMENT_CONFIRMED` | Payee confirms receipt | Marks payment as trusted; removes "pending" flag |
| `PAYMENT_DISPUTED` | Payee disputes a claimed payment | Reverts payment's effect on payer's balance; logged for organizer review |
| `ALLOCATION_DISPUTED` | Participant flags a share | Marks allocation as contested in both personal & group views |
| `ALLOCATION_DISPUTE_RESOLVED` | Organizer resolves dispute | Emits compensating allocation delta; closes dispute |
| `ANOMALY_FLAGGED` | Rules engine, post-mutation | Adds entry to Anomaly feed; no balance effect |
| `ANOMALY_DISMISSED` | Organizer dismisses a flag | Removes from active anomaly feed; retained in log |
| `BUDGET_CEILING_SET` | Organizer sets trip/category budget | Enables variance threshold checks |
| `VARIANCE_THRESHOLD_BREACHED` | Variance engine, post-expense | UI pulse + Activity Log entry; advisory only |
| `SQUAD_CREATED` / `SQUAD_MEMBER_LINKED` | Organizer saves a recurring group | Links participant identity across trips |

All new events follow the existing NFR-5 rule: **compensating events only, never overwrites.**

---

## 4. Execution Plan for the Antigravity Agent

**Feed the agent, in this order:** `02-GroupTrip-Ledger-PRD.md` → `03-GroupTrip-Ledger-TRD.md` → this doc → the Deep Analysis doc (as strategic rationale/context, not literal spec).

**Recommended build order (extends TRD's implicit phase plan):**

1. **Phase 1 (Foundation):** Entity model + event store + fold logic for core events only (per TRD §6, §2). Do not start any Tier-1.5+ feature before F1 (Reconciliation Widget) can pass on the core event set — it's your correctness canary.
2. **Phase 2 (Tier 1 complete):** All 5 split models, change-management events (join/leave/cancel/refund/revise), personal + group dashboards.
3. **Phase 3 (Tier 1.5):** F1 → F2 → F3 → F4, in that order. F1 and F2 reuse the exact same reducer — do not fork logic for "preview" vs. "real."
4. **Phase 4 (Tier 2 + 2.5):** Debt simplification (already in TRD §5) → F5 → F6 → F9 → F8.
5. **Phase 5 (Demo insurance):** F7 (Chaos Demo Mode) — build this *before* polishing visuals; it's what actually wins the room.
6. **Phase 6 (Stretch, time-permitting):** F12 → F13 → F10 → F11, in that priority order (ascending effort-to-wow ratio).

**Guardrail to hardcode into every AI-touching feature (F6, F8, F10):** the LLM only ever consumes already-computed, already-validated outputs and produces natural-language explanation. It never performs arithmetic that affects a stored balance. State this constraint explicitly in the agent's system prompt for those features — it is the single most judge-defensible design choice in the whole project.

---

## 5. Open Questions (need your input before the agent starts)

1. **Tech stack** — TRD is framework-agnostic. Which stack are you actually running in Antigravity (e.g., Node/Express + Postgres + React, or something else)? This changes the concrete execution instructions I'd give per feature.
2. **LLM access** — Do you have an API key/provider set up for F6/F8's explanation layer, or should those ship as rules-engine-only for the hackathon and the LLM layer be marked optional/stubbed?
3. **Scope call for Tier 1.5** — F3 (two-sided payment confirmation) adds real UX friction (payee must act). Given "no real payment processing" is explicitly out of scope (PRD §9), do you want F3 simulated/simplified, or fully built?
4. **Time budget** — How many hours/days remain until submission? That determines where I'd tell you to hard-stop on Tier 2.5 vs. push into Tier 3.

---

## 6. Priority Matrix (effort vs. judge impact)

| Feature | Effort | Demo Impact | Rubric Tie |
|---|---|---|---|
| F1 Reconciliation Widget | S | Very High | Correctness/robustness |
| F2 Dry-Run Simulator | M | Very High | State mgmt maturity |
| F7 Chaos Demo Mode | S | Very High | Presentation quality |
| F3 Payment Confirmation | S–M | Medium | UX for trust |
| F5 Vendor Dashboard | S | Medium | Completeness vs. brief |
| F6 Anomaly Detection | M | High | Technical complexity |
| F9 Budget Guardrails | S–M | Medium | Completeness vs. brief |
| F8 Explain-My-Balance | M | High | Innovation |
| F4 Dispute Flow | M | Medium | UX for trust |
| F12 Shareable Report | S | Medium | Usability/design |
| F13 Multi-Currency | M | Medium | Completeness vs. brief |
| F10 Room Optimizer | L | High (if working) | Technical complexity |
| F11 Squad Profiles | M–L | Medium | Scalability story |
