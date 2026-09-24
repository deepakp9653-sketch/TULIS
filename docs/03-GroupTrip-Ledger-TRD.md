# GroupTrip Ledger — Technical Requirements Document (TRD)

**Document Type:** TRD (Conceptual Granularity — architecture & state machines, no schema-level DDL)
**Status:** Phase 3 of 3 — Hackathon Documentation Suite
**Version:** 1.0

---

## 1. Architectural Overview

GroupTrip Ledger is built around a single core idea: **the trip's financial truth is a sequence of events, not a set of mutable rows.** Every other part of the system — itineraries, balances, settlement recommendations — is a *view* derived from that event sequence, and can always be rebuilt from it.

### 1.1 High-Level System Layers

```
┌─────────────────────────────────────────────────────┐
│  Presentation Layer                                   │
│  (Itinerary views, Split Drawer, Settlement Visualizer)│
└───────────────────────┬───────────────────────────────┘
                         │  reads projections / dispatches commands
┌───────────────────────▼───────────────────────────────┐
│  Application / Command Layer                           │
│  Validates intent → translates to Events                │
│  (e.g. "remove participant" → PARTICIPANT_REMOVED)     │
└───────────────────────┬───────────────────────────────┘
                         │  appends
┌───────────────────────▼───────────────────────────────┐
│  Event Store (Immutable Append-Only Log)                │
│  EXPENSE_LOGGED · PARTICIPANT_ADDED · PARTICIPANT_REMOVED│
│  BOOKING_MODIFIED · REFUND_CREDITED · PAYMENT_RECORDED   │
└───────────────────────┬───────────────────────────────┘
                         │  replayed / streamed
┌───────────────────────▼───────────────────────────────┐
│  Projection / Read-Model Layer                          │
│  Current Balances · Itinerary State · Debt Graph         │
│  (rebuildable at any time by replaying the event log)   │
└───────────────────────┬───────────────────────────────┘
                         │
┌───────────────────────▼───────────────────────────────┐
│  Derived Services                                        │
│  Split Calculation Engine · Debt Simplification Engine   │
│  Variance Engine · (Stretch) AI Suggestion Engine         │
└─────────────────────────────────────────────────────────┘
```

This is a **CQRS-style separation**: commands (user intents) are validated and converted into events; events are the only source of truth; balances and itinerary views are *read-model projections* built by folding over the event log. This is what makes "why is my balance what it is" always answerable — you can point to the exact events.

### 1.2 Why Event Sourcing (and not just recalculating a balances table)

- **Auditability:** A traditional mutable balances table can only ever answer "what is the current balance." It cannot answer "what sequence of changes produced it," which is exactly the trust problem this product exists to solve.
- **Correctness under change:** Mid-trip participant/activity changes are the norm, not the exception, for this domain. Event sourcing makes "replay forward from any point" a first-class operation rather than a special case.
- **Reversibility without destruction:** Corrections (e.g., an expense was logged wrong) are handled as new compensating events (`EXPENSE_CORRECTED`), never as silent overwrites — preserving NFR-5 from the PRD.

---

## 2. Event-Sourced Ledger: State Machine Design

### 2.1 Core Event Types

| Event | Triggered By | Effect on Read Model |
|---|---|---|
| `TRIP_CREATED` | Organizer creates trip | Initializes trip aggregate |
| `PARTICIPANT_ADDED` | Organizer adds traveler | Adds participant to roster; optionally back-applies to existing splits if flagged |
| `PARTICIPANT_REMOVED` | Organizer/participant exits | Removes from future splits; preserves historical balance as a closed-but-visible ledger line |
| `BOOKING_CREATED` | Organizer adds itinerary item | Adds node to itinerary graph |
| `BOOKING_MODIFIED` | Organizer edits booking (cost, date, participants) | Triggers recalculation of all linked expense allocations |
| `BOOKING_CANCELLED` | Organizer cancels booking (full or partial) | Redistributes/removes associated costs per split rule |
| `EXPENSE_LOGGED` | Organizer/participant logs a cost | Creates new allocation entries per chosen split method |
| `EXPENSE_CORRECTED` | Correction to a prior expense | Emits compensating delta events, never mutates original |
| `REFUND_CREDITED` | Vendor refund processed | Distributes credit proportional to original payers |
| `PAYMENT_RECORDED` | Participant pays another participant/vendor | Reduces the payer's outstanding debt to the payee |
| `SETTLEMENT_SIMPLIFIED` | Debt Simplification Engine runs | Emits a proposed minimal transaction set (advisory, non-mutating until confirmed) |
| `SETTLEMENT_CONFIRMED` | Participant marks a simplified debt as paid | Emits `PAYMENT_RECORDED` equivalent tied to the simplification proposal |

### 2.2 Trip/Ledger State Machine (Conceptual)

```
        TRIP_CREATED
              │
              ▼
        ┌──────────┐   PARTICIPANT_ADDED / REMOVED
        │ PLANNING │◄──────────────────────────────┐
        └────┬─────┘   BOOKING_CREATED/MODIFIED      │
             │                                       │
             ▼                                       │
        ┌──────────┐   EXPENSE_LOGGED / CORRECTED    │
        │  ACTIVE  │──────────────────────────────────┘
        └────┬─────┘   BOOKING_CANCELLED / REFUND_CREDITED
             │
             ▼
      ┌───────────────┐   SETTLEMENT_SIMPLIFIED
      │ RECONCILING    │──────────────┐
      └───────┬────────┘              │
              │                       ▼
              │              PAYMENT_RECORDED /
              │              SETTLEMENT_CONFIRMED (repeat until net-zero)
              ▼                       │
        ┌──────────┐ ◄────────────────┘
        │ SETTLED  │
        └──────────┘
```

Trips are **not strictly linear** through this machine — `ACTIVE` and `RECONCILING` can interleave (a trip can log a new expense after partial settlement has begun), which is why balances are always computed as *event log replay*, not as a single forward-only state transition.

### 2.3 Balance Projection Logic (Conceptual Fold)

For any participant `P`, their current balance is conceptually:

```
balance(P) = Σ(shares owed by P across all non-voided EXPENSE_LOGGED events)
           − Σ(payments made by P, from PAYMENT_RECORDED events)
           + Σ(refund credits owed to P, from REFUND_CREDITED events)
           − Σ(shares removed due to PARTICIPANT_REMOVED / BOOKING_CANCELLED affecting P)
```

This is recomputed by folding the event stream, not stored as a mutable field — which is what allows point-in-time "what did the balance look like before the cancellation" views for the Activity Log.

---

## 3. Dynamic Split Primitive Engine (Conceptual Logic)

Each `EXPENSE_LOGGED` event carries a `split_method` and a `participant_scope`. The engine resolves an allocation map (`participant_id → amount_owed`) using one of five strategies:

| Split Method | Logic |
|---|---|
| **Equal** | `amount / count(scoped_participants)`, remainder cents distributed deterministically (e.g., to first N participants by ID sort, to keep totals exact) |
| **Weighted / Per-Night** | Each participant has a weight (e.g., nights stayed); `amount × (participant_weight / Σ weights)` |
| **Line-Item** | Expense is decomposed into sub-items, each independently scoped to a subset of participants; final allocation is the sum of a participant's line-item shares |
| **Room-Tier** | Participants are grouped into room units; each room has an occupancy count and a tier multiplier; room cost is split first by tier-weighted room shares, then equally within the room |
| **Organizer-Paid Subsidy** | A flat amount or percentage is pre-subtracted as organizer-covered before the remainder is split among participants by any of the above methods |

**Invariant enforced at commit time:** `Σ allocation_map.values() == expense.total_amount` (to the cent). The Split Drawer UI's Reconciliation Bar (see UI/UX spec §4.2) exists specifically to make this invariant visible and enforceable before a human can submit.

---

## 4. Target-Budget Reverse Itinerary & Variance Engine (Conceptual)

- Each booking may optionally carry an `estimated_cost` (set during itinerary planning, possibly against a group budget ceiling) distinct from its `actual_cost` (set when a real expense/receipt is logged against it).
- **Variance** = `actual_cost − estimated_cost`, tracked per booking and rolled up per category and per trip.
- **Reverse itinerary construction (conceptual):** Given a total group budget ceiling and a set of desired categories (lodging, transport, activities), the engine allocates target sub-budgets per category (configurable ratios, e.g., 40% lodging / 25% transport / 35% activities as a default heuristic), which organizers use as soft ceilings while building the itinerary. This is advisory, not enforced — the system flags, never blocks.
- **Threshold alerting:** A configurable variance threshold (e.g., ±15%) triggers a UI flag (Expense Variance Card pulse, per UI/UX spec §4.4) and an Activity Log entry, but never an automatic action.

---

## 5. Graph-Based Debt Simplification Engine

### 5.1 Problem Framing

After folding all events, the system has a directed weighted graph `G`:
- **Nodes** = participants with non-zero net balance.
- **Edges** = raw pairwise debts (who paid for whom, accumulated from expense allocations minus payments).

Raw `G` is typically dense and redundant (A owes B, B owes C, C owes A — cyclically wasteful). The goal is to produce a minimal-edge settlement graph `G'` with the same *net* balances but the fewest possible transactions.

### 5.2 Algorithm (Conceptual Pseudocode)

This is a classic **debt-netting / min-cash-flow** problem, solved greedily (a common, provably-good approach for this problem class, though not always globally minimal — acceptable for this product's scale):

```
function simplifyDebts(participants):
    # Step 1 — Net every participant to a single signed balance
    netBalance = {}
    for p in participants:
        netBalance[p] = totalCredits(p) − totalDebits(p)
        # positive = is owed money, negative = owes money

    # Step 2 — Partition into creditors and debtors
    creditors = sorted([p for p in participants if netBalance[p] > 0],
                        by netBalance descending)
    debtors   = sorted([p for p in participants if netBalance[p] < 0],
                        by netBalance ascending)  # most negative first

    settlements = []

    # Step 3 — Greedily match largest debtor to largest creditor
    i, j = 0, 0
    while i < len(debtors) and j < len(creditors):
        debtor, creditor = debtors[i], creditors[j]
        amount = min(-netBalance[debtor], netBalance[creditor])

        settlements.append({from: debtor, to: creditor, amount: amount})

        netBalance[debtor]   += amount
        netBalance[creditor] -= amount

        if netBalance[debtor]   == 0: i += 1
        if netBalance[creditor] == 0: j += 1

    return settlements   # length ≤ (participants_with_nonzero_balance − 1)
```

**Guaranteed property:** This greedy approach always produces at most `N − 1` transactions for `N` participants with non-zero balances (since each iteration fully zeroes out at least one participant), which is the theoretical minimum bound for fully netting a group — satisfying the PRD's "settlement compression" success metric.

**Complexity:** `O(N log N)` for the sort, `O(N)` for the matching pass — trivially fast even for very large groups, well within the NFR-3 responsiveness target.

### 5.3 Handling Partial Settlement

Because `SETTLEMENT_SIMPLIFIED` is advisory (an emitted event, not a mutation), a group can confirm some suggested settlements and not others. On the next simplification run, the engine simply re-nets from the *current* balances (post any confirmed `PAYMENT_RECORDED` events), so partially-settled groups always get a correctly reduced next proposal — no special-casing needed, which is a direct benefit of the event-sourced design.

---

## 6. Data Model — Conceptual Entity Relationships

*(Described conceptually per engagement scope — no DDL/schema syntax.)*

- **Trip** — has many Participants, has many Bookings, has many Events (the full log), has one derived SettlementState.
- **Participant** — belongs to one Trip; has a lifecycle (`active`, `removed`); has many ExpenseAllocations (derived); has many Payments (made and received).
- **Booking** — belongs to one Trip; has a category (transport/lodging/activity/other); has a scoped subset of Participants; has estimated_cost and actual_cost; has many linked Expenses.
- **Expense** — belongs to one Booking (optionally, or trip-level "other" cost); has a split_method; has many ExpenseAllocation records (one per scoped participant) as its derived split result.
- **ExpenseAllocation** *(derived/read-model, not raw event)* — links one Participant to one Expense with a computed owed amount.
- **Event** — the append-only record: type, payload, timestamp, actor, and a monotonic sequence number for deterministic replay ordering.
- **SettlementProposal** *(derived)* — a point-in-time output of the Debt Simplification Engine: a list of (from, to, amount) tuples, with a status (`proposed`, `partially_confirmed`, `fully_confirmed`).

**Relationship notes:**
- Trip 1—* Participant, Trip 1—* Booking, Trip 1—* Event (append-only, never updated/deleted).
- Booking *—* Participant (many-to-many, via scope — a participant can be in many bookings, a booking has many participants).
- Expense 1—* ExpenseAllocation (one allocation row per scoped participant per expense).
- Event log is the **single source of truth**; every other entity above is conceptually a materialized projection that could be deleted and rebuilt from the Event table alone.

---

## 7. Concurrency & Consistency Strategy (Conceptual)

- Events are appended with a **monotonic per-trip sequence number**; two near-simultaneous commands are ordered by arrival at the command layer, not by client clock, avoiding clock-skew bugs.
- Projections (balances, itinerary state) are treated as **eventually consistent but always convergent** — given the same event log, any replay produces the same result, so temporary read staleness is acceptable but permanent divergence is not.
- Conflicting concurrent edits (e.g., two organizers modifying the same booking) are **not merged automatically**; the later-sequenced event wins and supersedes, with both actors notified — a deliberate simplicity trade-off appropriate for small-group trip sizes (this is explicitly flagged as a scaling consideration, not hidden).

## 8. Notable Architectural Trade-offs (Explicitly Acknowledged)

| Decision | Trade-off Accepted |
|---|---|
| Greedy debt simplification vs. globally-optimal min-cost-flow | Greedy is simpler, fast, and good-enough (≤ N−1 transactions guaranteed); not guaranteed to find the single global optimum in every edge case, which is an acceptable trade for hackathon scope. |
| Full event replay for projections vs. persisted snapshot + delta | Chosen for auditability and simplicity of the demo; a production system would add periodic snapshotting to avoid replaying very long logs from scratch. |
| Last-write-wins on concurrent booking edits | Simpler than operational-transform/CRDT-style merging; acceptable at small-group trip scale, flagged as a v2 concern at larger scale. |
| Advisory (non-mutating) settlement proposals | Slightly more steps for the user (confirm each settlement) but preserves the "no silent money movement" trust principle central to the product. |
