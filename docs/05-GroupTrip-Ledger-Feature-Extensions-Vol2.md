# GroupTrip Ledger — Feature Extension Pack, Vol. 2 (Beyond F1–F13)

**Document Type:** Addendum to PRD (Doc 02), TRD (Doc 03), UI/UX Spec (Doc 01) & Feature
Extension Pack Phase 4 (Doc 04)
**Purpose:** A further batch of net-new features — genuinely additive, not overlapping with
F1–F13 — plus execution guidance for the build agent (Antigravity)
**Status:** Phase 5 — Second Differentiation Layer
**Version:** 1.0
**Read alongside:** `02-GroupTrip-Ledger-PRD.md`, `03-GroupTrip-Ledger-TRD.md`,
`01-GroupTrip-Ledger-UIUX-Theme-Spec.md`, `04-GroupTrip-Ledger-Feature-Extensions.md`,
`GroupTrip_Ledger_PS_Deep_Analysis.docx`

---

## 0. Why This Doc Exists

Doc 04 (Feature Extension Pack) already closes the biggest gap between "judged floor" and
"memorable submission": it makes correctness *visible* (F1, F2, F7), adds real trust
mechanics (F3, F4), and turns the multi-vendor and AI-stretch lines of the brief into
concrete, guardrailed features (F5, F6, F8). That pack is strong and should still be built
first.

This doc goes one layer further and asks a different question: **what would make a judge,
or a real user, say "I haven't seen that in any other trip-splitting tool" — not just "this
one is more correct than the others"?**

The features below fall into four buckets that F1–F13 don't yet cover:

1. **Meeting the user where they already are** (chat, voice, photos) — because the PRD's
   own problem statement names "group chats" as part of the failure mode being replaced,
   and the strongest response to that is to absorb the chat workflow, not just out-compete it.
2. **Preventing bad data before it enters the ledger**, rather than only detecting anomalies
   after the fact (F6 is post-hoc; several features below are pre-commit).
3. **Real-world travel conditions** — specifically, unreliable connectivity, which no
   current doc addresses despite it being one of the most realistic failure modes of an
   actual group trip (trekking routes, rural stays, international roaming gaps).
4. **Structural product depth beyond a single trip** — extending the "Squad" idea (F11)
   from shared identity into shared, netted finances across trips.

All features below follow the same non-negotiable guardrail established in Doc 04 §4: **any
LLM used in these features only narrates or parses into a structured proposal that a human
or the deterministic reducer confirms — it never writes a number directly into the ledger.**

---

## 1. Gap Analysis (Extending Doc 04 §1)

| Already covered (PRD/TRD/Doc 04) | Not yet covered — added here |
|---|---|
| Event-sourced ledger, 5 split models, debt simplification, audit log, variance engine, reconciliation widget, dry-run simulator, payment confirmation, disputes, vendor dashboard, anomaly detection, chaos demo mode, explain-my-balance, budget guardrails, room optimizer, squad profiles, shareable report, multi-currency | Chat-native capture, voice/photo receipt ingestion, duplicate-expense prevention, an algorithmic split-method advisor, debt/IOU reassignment between participants, offline-first command queueing, a nudge/reminder engine, cross-trip squad netting, a logistics (non-financial) feasibility checker, and a structured accounting export adapter |

---

## 2. New Features

Same format as Doc 04: **why it wins**, user story, new event(s) extending TRD §2.1, functional
requirements, execution notes, effort, and which doc/section it ties back to.

### TIER 4 — Meeting Users Where They Already Are

**F14. Chat-Native Expense Capture**
- *Why it wins:* The PRD's own Problem Statement (§1) names "group chats" as one of the
  tools people currently stitch together and lose trust in. Every competing team will treat
  chat as the enemy to be replaced. This feature treats it as an input channel instead —
  forward or paste a chat message ("I paid 1200 for the cab, just me Raj and Priya") and
  the system parses it into a structured expense proposal.
- *User story:* As a Participant, I can paste or forward a message from our existing group
  chat, and the system proposes a fully-formed expense (amount, likely participants matched
  by name, suggested split method) that I review and confirm — never auto-committed.
- *New event:* none directly — produces a **draft** that, on confirmation, emits the
  existing `EXPENSE_LOGGED` event. The parse itself is not an event; only the confirmed
  result is.
- *Functional req:* The parser (LLM or lightweight NLU) must never auto-commit; UI must
  show the raw parsed fields for review pre-confirm (participant name matching is often
  wrong — e.g., nicknames — and must be human-correctable before commit, consistent with
  Doc 04's AI guardrail).
- *Execution:* Reuses the existing Split Drawer (UI/UX spec §4.2) as the confirmation
  surface — the parser just pre-fills it instead of the organizer typing from scratch.
- *Effort:* M

**F15. Voice & Photo Receipt Capture**
- *Why it wins:* Logging an expense mid-activity (on a trek, at a noisy restaurant) by
  typing into a form is friction that causes people to "log it later" — and later never
  comes, which is exactly the failure mode the PRD is trying to solve. A photo of a receipt
  or a 5-second voice note is realistic capture behavior for this domain.
- *User story:* As a Participant, I can snap a photo of a bill or speak a short voice note,
  and the system extracts a vendor name and amount (OCR/vision for photos, transcription +
  parse for voice) into the same draft-expense flow as F14.
- *New event:* none — same draft → confirm → `EXPENSE_LOGGED` pattern as F14.
- *Functional req:* Extraction confidence below a threshold must force manual review fields
  to be highlighted, not silently guessed; original photo/audio is retained as an attachment
  on the resulting expense for later dispute reference (ties directly into F4's dispute flow
  from Doc 04 — a photo attachment is strong evidence in a dispute).
- *Execution:* Vision/OCR call → structured JSON → same Split Drawer prefill path as F14.
  Keep the extraction service isolated from the reducer, per the standing AI guardrail.
- *Effort:* M–L

---

### TIER 4 — Preventing Bad Data Before It Enters the Ledger

**F16. Duplicate Expense Guard**
- *Why it wins:* A very common real failure mode the PRD's edge cases don't name: two
  different participants both log the same cab or dinner bill because neither knew the
  other already had. This is silent, invisible corruption that F6's anomaly detection would
  only catch *after* it has already skewed balances. Catching it *before* commit is strictly
  more valuable.
- *User story:* As a Participant logging an expense, if a similar expense (same/near amount,
  same or overlapping participant scope, close timestamp, same vendor if known) already
  exists, I'm shown it and asked to confirm this is genuinely a separate cost before it commits.
- *New event:* none for the check itself; if the user proceeds anyway, the normal
  `EXPENSE_LOGGED` event fires, optionally tagged `possible_duplicate_acknowledged: true` in
  its payload for later audit visibility.
- *Functional req:* Fuzzy-match must run synchronously pre-commit (not async/post-hoc like
  F6), using a simple similarity heuristic (amount within a small tolerance, ≥1 shared
  participant, timestamp within a configurable window) — no ML model needed, keep it a
  transparent, explainable rule.
- *Execution:* A pre-commit check in the Application/Command Layer (TRD §1.1), run before
  the event is appended — this is the one place in the whole system where a check should
  block rather than merely flag, and that distinction is worth stating explicitly to judges
  as a deliberate design choice.
- *Effort:* S

**F17. Split-Method Advisor**
- *Why it wins:* The brief requires five split methods, and Doc 04/TRD already implement
  all five — but choosing the *right* one per situation is still left entirely to the
  organizer's judgment. A lightweight recommender turns "five methods exist" into "the
  system understands when each one applies," which is a stronger, more finished-feeling
  answer to the brief than just offering a segmented control.
- *User story:* As an Organizer creating an expense, if the linked booking is a Room-Tier
  situation (uneven room occupancy) or has a partial participant scope (activity-based), the
  Split Method Selector (UI/UX spec §4.2) pre-highlights the most likely-correct method
  instead of defaulting to Equal.
- *New event:* none — pure recommendation over already-known booking/participant data, no
  ledger effect.
- *Functional req:* Recommendation logic must be a small, inspectable rule set (e.g., "if
  booking.category == lodging and rooms have uneven occupancy → suggest Room-Tier"; "if
  booking.participant_scope != trip.full_roster → suggest Activity-based framing of Equal"),
  never an opaque model call — this is a case where a rules engine is strictly better than
  an LLM because the "why" needs to be statable in one sentence to the user.
- *Execution:* Runs client-side or as a cheap server call at Split Drawer open time; purely
  additive to existing UI, no new state.
- *Effort:* S

---

### TIER 4 — Real-World Structural Gaps

**F18. Debt Reassignment (IOU Transfer)**
- *Why it wins:* A genuinely common group-travel scenario that none of the existing edge
  cases (PRD §7, Doc 04's F3/F4) cover: "I'll just cover Raj's share, he can pay me back
  instead of the group." This is a peer-to-peer transfer of an *obligation*, not a payment —
  a meaningfully different operation from `PAYMENT_RECORDED`, and one that a naive balances
  table cannot represent cleanly but an event-sourced ledger can.
- *User story:* As a Participant who is owed money by another participant on a specific
  expense, I can propose reassigning that specific debt to a third participant (with their
  consent), so the group ledger reflects who actually needs to settle with whom going forward.
- *New event:* `DEBT_REASSIGNED` — references the original `ExpenseAllocation`, the original
  debtor, the new debtor, and requires an acceptance sub-event (`DEBT_REASSIGNMENT_ACCEPTED`)
  from the new debtor before it takes effect, mirroring the two-sided trust pattern already
  established by Doc 04's F3.
- *Functional req:* Until accepted, the reassignment is `proposed` and has no balance effect
  (consistent with NFR-5 — no silent rewrites); once accepted, it is a compensating event
  pair (debit removed from original debtor, added to new debtor), never an overwrite.
- *Execution:* Extends the same event-sourced fold (TRD §2.3) with two new terms; the
  Settlement Visualizer (UI/UX §4.3) simply reflects the updated edges once folded — no
  special-case rendering needed.
- *Effort:* M

**F19. Offline-First Command Queue**
- *Why it wins:* Group trips very often happen exactly where connectivity is worst —
  trekking routes, rural homestays, international roaming gaps — which is a realistic
  condition that none of the current docs address, despite NFR-4 already discussing
  concurrency. A demo moment of "I logged this expense with no signal, and it synced
  correctly the moment I got back online, in the right order relative to my teammate's
  edits" is a strong, concrete answer to real-world usability that most competing teams
  won't have even considered.
- *User story:* As a Participant with no connectivity, I can still log an expense or record
  a payment; it queues locally and syncs automatically once online, ordered correctly
  alongside events from other participants.
- *New event:* none new — this is a **delivery mechanism** for existing events, not a new
  event type. The key addition is a client-side outbox queue and a `client_generated_id` +
  `client_timestamp` carried on each queued command so the server can assign the authoritative
  monotonic sequence number (TRD §7) on arrival, exactly as already specified for near-simultaneous edits.
- *Functional req:* Queued commands must replay in the order they were created locally where
  possible, but the server's monotonic sequence assignment (not client clock) remains the
  final authority on ordering, per the existing concurrency strategy in TRD §7 — this feature
  is explicitly a client-side capability layered on an already-correct server design, not a
  change to the consistency model.
- *Execution:* Local outbox (IndexedDB/localStorage-equivalent) + a sync worker that flushes
  on reconnect; UI shows a small "pending sync" badge on unsent items, consistent with the
  UI/UX spec's principle that state is never silently ambiguous (§2.1 contrast rule extended
  to sync state).
- *Effort:* M–L

**F20. Nudge & Reminder Engine**
- *Why it wins:* Every ledger in this space eventually has the same real failure: correct
  math, but nobody actually settles up, because there's no gentle social pressure mechanism.
  This is a low-effort, high real-world-value feature that no other doc currently covers.
- *User story:* As an Organizer, I can enable reminders for participants with outstanding
  balances or unconfirmed payments (extends F3 from Doc 04), on a configurable cadence and
  tone (neutral / friendly), sent as in-app notices (and, if time allows, a shareable
  digest message formatted for pasting into the group's existing chat — tying back to F14's
  chat-native philosophy).
- *New event:* `REMINDER_SENT` (advisory/log-only, no balance effect) — logged purely for
  audit and to prevent duplicate nudges within a cooldown window.
- *Functional req:* Nudges are always organizer-configured opt-in, never automatic
  organizer-to-participant pressure without consent — consistent with the "flags, never
  blocks" advisory principle already established for the Variance Engine (TRD §4).
- *Execution:* Simple scheduled check against outstanding balances/unconfirmed payments
  (from F3); message templating; no new balance logic at all.
- *Effort:* S

**F21. Cross-Trip Squad Netting**
- *Why it wins:* Extends Doc 04's F11 (Travel Squad Profiles) from a *convenience* feature
  (faster setup) into a genuine *product* feature: if the same friend group takes multiple
  trips, or even runs two trips that overlap in time, their balances across those trips can
  be netted together rather than settled trip-by-trip — directly reinforcing the NFR-7
  "multi-trip platform" scalability story with a concrete, demoable payoff rather than just
  an architectural claim.
- *User story:* As a Participant who is part of a Squad with shared trip history, when I
  open Settlement, I can toggle "Net across all trips with this squad" and see a single,
  further-simplified settlement plan spanning multiple trips instead of one per trip.
- *New event:* none new at the event level — this is a **read-model composition**: the Debt
  Simplification Engine (TRD §5) is simply run over the union of balances from multiple
  trips' event logs for the same squad, rather than one trip's log alone.
- *Functional req:* Must remain fully optional and explicit (a toggle, never a default) —
  netting across trips changes who a person expects to pay, so it must never happen silently.
- *Execution:* Reuses the exact same greedy algorithm from TRD §5.2 unchanged; the only new
  work is the input aggregation step across multiple trip event logs scoped to the same
  Squad identity (F11).
- *Effort:* M (mostly a composition/aggregation layer, not new algorithmic work)

**F22. Itinerary Feasibility Checker (Logistics, Not Money)**
- *Why it wins:* Doc 04's F6 (Anomaly Detection) is explicitly scoped to financial/roster
  anomalies. This feature covers a distinct, non-financial category the brief also gestures
  at ("identify inconsistent bookings") but that F6 doesn't fully own: **logistical**
  feasibility — a participant booked on two overlapping transport legs, a checkout time
  after the next booking's start time, an activity scheduled outside a vendor's stated
  operating hours if known. This is a different rule family from financial anomalies and
  deserves its own small engine so the two don't get conflated in the code or the demo.
- *User story:* As an Organizer, I see a distinct "Itinerary Health" flag (separate from
  the financial reconciliation badge, F1) when the schedule itself is inconsistent, even if
  every number balances perfectly.
- *New event:* `ITINERARY_CONFLICT_FLAGGED`, `ITINERARY_CONFLICT_DISMISSED` — mirrors the
  `ANOMALY_FLAGGED`/`ANOMALY_DISMISSED` pattern from Doc 04's F6 but scoped to the Itinerary
  Graph (UI/UX §4.1) rather than the ledger.
- *Functional req:* Rules run over Booking start/end times and participant scopes only —
  never touches expense/payment data, keeping this cleanly separated from F6's financial
  rule set both in code and in the demo narrative ("here are two different kinds of
  correctness we check, not one blurred check").
- *Execution:* Same predicate-function pattern as F6 (Doc 04), in its own file, rendered as
  small warning badges directly on the affected nodes in the Master Itinerary Graph (UI/UX §4.1).
- *Effort:* S–M

**F23. Structured Accounting Export Adapter**
- *Why it wins:* Doc 04's F12 (Shareable Settlement Report) is a human-readable PDF/link.
  The PRD's Corporate Team persona (§3) has a distinct, unaddressed need: getting trip costs
  *into* an expense/reimbursement system, not just displaying them nicely. A structured
  export (CSV with standard columns, or a QuickBooks/Tally-style format) is cheap to build
  once the data model exists and directly answers a persona the rest of the docs mostly
  gesture at rather than serve.
- *User story:* As an Organizer running a corporate offsite, I can export a per-participant,
  per-category cost breakdown in a structured format suitable for handing to a finance/
  reimbursement team, not just a pretty summary.
- *New event:* none — pure export over existing projections (Participant balances × Booking
  category), no ledger effect.
- *Functional req:* Export must be a straightforward tabular projection of already-computed,
  already-correct data — this feature should require zero new business logic, only formatting.
- *Execution:* Extends F12's existing report-generation path with a second output format
  (CSV/structured) alongside the PDF; reuses the same underlying projection query.
- *Effort:* S

---

## 3. New Events — Additions to TRD §2.1 / Doc 04 §3 Tables

| Event | Triggered By | Effect on Read Model |
|---|---|---|
| `DEBT_REASSIGNED` | Creditor proposes transferring a specific owed debt to a new debtor | Marks the reassignment `proposed`; no balance effect until accepted |
| `DEBT_REASSIGNMENT_ACCEPTED` | New debtor accepts | Compensating event pair: removes debt from original debtor, adds to new debtor |
| `REMINDER_SENT` | Nudge engine, on organizer-enabled cadence | Log-only; used to enforce cooldown and for audit visibility |
| `ITINERARY_CONFLICT_FLAGGED` | Feasibility rules engine, post booking mutation | Adds entry to Itinerary Health feed; no financial effect |
| `ITINERARY_CONFLICT_DISMISSED` | Organizer dismisses a logistics flag | Removes from active feed; retained in log |

All new events follow the existing NFR-5 rule: **compensating events only, never
overwrites** — consistent with every prior event added in TRD §2.1 and Doc 04 §3.
`F14`–`F17`, `F20`, and `F23` intentionally introduce **no new events at all**, because they
are either pre-commit UX layers around the existing `EXPENSE_LOGGED` event, or read-only
compositions over projections that already exist — worth stating explicitly, since it means
this entire batch adds real product depth without expanding the core state machine's surface
area, which keeps NFR-1 (deterministic replay) easy to preserve.

---

## 4. Where This Fits in the Build Order (Extends Doc 04 §4)

Doc 04's Phase 1–6 plan remains the backbone. This batch slots in as follows, **only after**
Doc 04's Tier 1.5 (F1–F4) is demo-ready — none of these features are worth building on top
of a ledger core that isn't yet provably correct:

- **Alongside Doc 04 Phase 4 (Tier 2 + 2.5):** F16 (Duplicate Guard) and F17 (Split-Method
  Advisor) — both are small, self-contained, and raise the perceived polish of the exact
  same Split Drawer flow Doc 04 already prioritizes.
- **Alongside Doc 04 Phase 5 (Demo insurance / F7):** F22 (Itinerary Feasibility Checker) —
  cheap, and gives the Chaos Demo Mode a second, visually distinct kind of "the system caught
  something" moment beyond the financial reconciliation badge.
- **After Doc 04 Phase 6, if time remains, in this order:** F18 (Debt Reassignment) → F14
  (Chat-Native Capture) → F20 (Nudge Engine) → F23 (Accounting Export) → F21 (Cross-Trip
  Netting) → F15 (Voice/Photo Capture) → F19 (Offline-First Queue), ascending roughly by
  effort-to-marginal-wow ratio.
- **F19 (Offline-First) is the one exception worth flagging separately:** if the team's demo
  environment or judging format allows narrating "this also works with no signal, which
  matters because that's exactly when real trips need it," it punches well above its
  effort cost as a differentiator — but it is also the single most technically involved
  item in this batch, so it should only be attempted with real time margin remaining.

---

## 5. Updated Priority Matrix (This Batch Only — Extends Doc 04 §6)

| Feature | Effort | Demo Impact | Rubric Tie |
|---|---|---|---|
| F16 Duplicate Expense Guard | S | Medium | Correctness/robustness |
| F17 Split-Method Advisor | S | Medium | Innovation |
| F22 Itinerary Feasibility Checker | S–M | High | Completeness vs. brief |
| F20 Nudge & Reminder Engine | S | Medium | Usability/design |
| F23 Structured Accounting Export | S | Medium | Completeness vs. brief (corporate persona) |
| F18 Debt Reassignment (IOU Transfer) | M | High | Real-world domain modeling |
| F14 Chat-Native Expense Capture | M | Very High | Innovation / problem understanding |
| F21 Cross-Trip Squad Netting | M | High | Scalability story (NFR-7) |
| F15 Voice & Photo Receipt Capture | M–L | High | Innovation |
| F19 Offline-First Command Queue | M–L | High (if narrated well) | State mgmt maturity / real-world robustness |

---

## 6. Open Questions (Same Shape as Doc 04 §5)

1. **Capture channel priority** — between F14 (chat-native) and F15 (voice/photo), which
   matches the team's actual demo scenario better? They can be built independently, but
   picking one to polish fully beats building both halfway.
2. **Offline scope** — is F19 worth pursuing given the demo will very likely happen on
   venue Wi-Fi (i.e., the *scenario* being solved may never actually be shown live)? If the
   plan is to narrate it rather than demo it live, effort could be better spent elsewhere.
3. **Squad feature dependency** — F21 assumes Doc 04's F11 (Squad Profiles) is already
   built; confirm F11's status before scheduling F21.
4. **Corporate persona emphasis** — is the team leaning into the Corporate Team persona
   (PRD §3) as a demo narrative at all? If not, F23's value drops significantly and it can
   be deprioritized or cut.
