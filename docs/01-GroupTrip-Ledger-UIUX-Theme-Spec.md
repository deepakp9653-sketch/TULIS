# GroupTrip Ledger — UI/UX Theme & Design System Specification

**Document Type:** Design System / Theme Spec
**Persona:** Warm Travel-Brand Hybrid (Fintech Precision × Travel Warmth)
**Status:** Phase 2 of 3 — Hackathon Documentation Suite
**Version:** 1.0

---

## 1. Design Philosophy

GroupTrip Ledger sits at the intersection of two emotional registers that are usually kept separate:

- **The Ledger** — money, debt, settlement. This demands trust, legibility, and unambiguous state (owed / paid / surplus / deficit). Users should feel the same confidence they'd feel in a banking app.
- **The Trip** — friends, excitement, shared memory. This demands warmth, texture, and a sense of occasion. It should not feel like a spreadsheet.

The design system resolves this by using a **deep, quiet "ink" surface system** (fintech precision) as the neutral base, and reserving a **warm, saturated accent pair** (coral + gold) exclusively for meaning — money owed, money settled, and moments of celebration (like a debt graph collapsing to zero). Everything structural is calm and dark; everything financial is vivid and intentional.

**Guiding principle:** *If a color appears, it means something.* No decorative color. Every hue on screen maps to a state in the ledger's event-sourced model.

---

## 2. Design Tokens

### 2.1 Color Palette

#### Dark Mode (Primary / Default)

| Token | Hex | Usage |
|---|---|---|
| `color.surface.base` | `#0E1116` | App background, deepest layer |
| `color.surface.raised` | `#161B22` | Cards, panels, itinerary blocks |
| `color.surface.overlay` | `#1F2530` | Modals, drawers, popovers |
| `color.surface.hairline` | `#2A313D` | Dividers, borders, table gridlines |
| `color.text.primary` | `#F3EFE9` | Headlines, primary content (warm off-white, not pure white) |
| `color.text.secondary` | `#A7ADB8` | Metadata, timestamps, helper text |
| `color.text.muted` | `#6B717C` | Disabled, placeholder |
| `color.brand.coral` | `#FF6B4A` | Primary accent — CTAs, active nav, brand mark |
| `color.brand.coral.dim` | `#B84A34` | Hover/pressed states on coral |
| `color.brand.gold` | `#E8B84B` | Secondary accent — highlights, badges, "organizer" tags |
| `color.ledger.surplus` | `#3DD68C` | Positive balance, "you are owed," settled state |
| `color.ledger.surplus.bg` | `#123326` | Background wash for surplus rows/cards |
| `color.ledger.deficit` | `#FF5C5C` | Negative balance, "you owe," overdue state |
| `color.ledger.deficit.bg` | `#331616` | Background wash for deficit rows/cards |
| `color.ledger.neutral` | `#7A8699` | Zero-balance, fully settled participant |
| `color.data.variance.over` | `#F2994A` | Actual cost exceeds estimate |
| `color.data.variance.under` | `#5FB0D6` | Actual cost under estimate |

#### Light Mode (Secondary)

| Token | Hex | Usage |
|---|---|---|
| `color.surface.base` | `#FBF8F3` | App background (warm paper white) |
| `color.surface.raised` | `#FFFFFF` | Cards |
| `color.surface.hairline` | `#E7E1D6` | Dividers |
| `color.text.primary` | `#1C1B18` | Primary text |
| `color.text.secondary` | `#5C594F` | Secondary text |
| `color.brand.coral` | `#E8552F` | Adjusted for AA contrast on light bg |
| `color.ledger.surplus` | `#1F9D5C` | Adjusted for light bg contrast |
| `color.ledger.deficit` | `#D8393B` | Adjusted for light bg contrast |

**Contrast rule:** All ledger state colors (`surplus`, `deficit`, `variance`) must independently pass WCAG AA against their paired background token. State is never conveyed by color alone — always paired with an icon (▲/▼/●) and text label, for accessibility and at-a-glance scanning.

### 2.2 Typography Scale

Two-family system: a geometric grotesk for structural UI, and a humanist serif accent reserved for trip identity (trip names, destination headers) to inject the "travel" warmth without compromising data legibility.

| Token | Family | Weight | Size / Line-height | Usage |
|---|---|---|---|---|
| `font.display` | Fraktion Serif *(or Tiempos, GT Sectra)* | 600 | 32px / 40px | Trip name headers, hero moments |
| `font.h1` | Inter / General Sans | 700 | 28px / 36px | Screen titles |
| `font.h2` | Inter / General Sans | 600 | 20px / 28px | Section headers |
| `font.h3` | Inter / General Sans | 600 | 16px / 24px | Card titles, drawer headers |
| `font.body` | Inter / General Sans | 400 | 15px / 22px | Primary body text |
| `font.body.medium` | Inter / General Sans | 500 | 15px / 22px | Emphasized inline text |
| `font.caption` | Inter / General Sans | 400 | 13px / 18px | Metadata, timestamps |
| `font.numeric` | JetBrains Mono / IBM Plex Mono | 500 | varies | **All currency figures, balances, and ledger numbers** — tabular-nums, monospaced for scannable columnar alignment |

**Rule:** Any number representing money is always rendered in `font.numeric`. This is non-negotiable — it's what makes a settlement table feel like a real ledger rather than a chat log.

### 2.3 Spacing & Grid System

- **Base unit:** 4px
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
- **Grid:** 12-column responsive grid, 24px gutters (desktop), 16px gutters (mobile)
- **Container max-width:** 1200px (desktop dashboard), fluid below 768px
- **Card padding:** 20px standard, 16px compact (mobile), 28px for hero/summary cards
- **Corner radius scale:** `radius.sm` 6px (chips, tags) · `radius.md` 12px (cards, inputs) · `radius.lg` 20px (modals, drawers) · `radius.full` (avatars, status dots)

---

## 3. Information Architecture

### 3.1 Navigation Hierarchy

```
Trip Switcher (top-level)
└── Trip Workspace
    ├── Overview           → Group-level financial + itinerary snapshot
    ├── Itinerary          → Master Itinerary Graph (bookings, activities, timeline)
    ├── Participants        → Roster, join/leave history, per-person share config
    ├── Expenses & Splits    → Expense log, Dynamic Split Drawer entry point
    ├── Settlement          → Ledger Settlement Visualizer, debt graph, "Settle Up"
    └── Activity Log        → Immutable event stream (audit trail, human-readable)
```

- **Primary nav:** Left rail (desktop) / bottom tab bar (mobile) — 6 items max, icon + label.
- **Secondary nav:** Contextual top bar within each section (e.g., filter by vendor, by date range, by participant).
- **Persistent element:** A "Balance Pill" lives in the global header at all times — shows the *current logged-in user's* net position (surplus green / deficit red / settled neutral). This is the emotional anchor of the whole app; it must always be visible.

### 3.2 Screen Layout Map

| Screen | Primary Layout | Key Modules |
|---|---|---|
| **Overview** | Two-column: 65% itinerary timeline preview + 35% financial summary rail | Balance Pill (expanded), Upcoming Payments card, Trip Health Score |
| **Itinerary** | Full-width horizontal timeline (Master Itinerary Graph) with vertical day-grouping | Booking nodes, participant-avatar stacks per node, add-booking FAB |
| **Participants** | Roster table + right-side detail drawer | Participant cards with mini balance chip, join/leave timestamps |
| **Expenses & Splits** | Reverse-chronological expense feed, left-filtered by vendor/category | Expense Variance Cards, "+ Add Expense" opens Dynamic Split Drawer |
| **Settlement** | Centered Ledger Settlement Visualizer (graph/sankey) with settlement action list below | "Simplify Debts" button, per-pair settle actions |
| **Activity Log** | Vertical event timeline, plain-language event descriptions | Filter by event type, expandable event detail |

### 3.3 Modal & Drawer Flows

- **Drawers** (slide from right, 480px desktop / full-screen mobile): used for *creation and configuration* tasks that need focus without full navigation loss — Dynamic Split Drawer, Add Participant, Add Booking.
- **Modals** (centered, max 560px): used for *confirmation and irreversible actions* — confirming a participant removal, confirming a settlement payment, confirming a cancellation/refund.
- **Toasts** (bottom-center, auto-dismiss 4s): used for *event confirmations* — "Expense logged," "Balances recalculated," "Settlement recorded."
- **Inline expansion** (accordion, no drawer): used for *inspection* — expanding an expense card to see its split breakdown without leaving the feed.

**Flow rule:** Any action that would rewrite historical financial state (removing a participant retroactively, editing a past expense) must route through a confirmation modal that explicitly previews the resulting balance changes *before* commit — never a silent recalculation.

---

## 4. Component Design Specs

### 4.1 Master Itinerary Graph

A horizontal, day-segmented timeline representing the entire trip as connected nodes.

- **Structure:** Each day is a vertical "swimlane" column; bookings (transport, lodging, activity) are horizontal node-cards placed within their day column, connected by a thin directional line indicating trip flow.
- **Node anatomy:** Icon (vendor/category type) → Title → Time range → Cost chip (`font.numeric`) → Participant avatar stack (overlapping circles, max 5 shown + "+N" overflow) → Status indicator (confirmed / pending / cancelled, shown as a colored left-border on the card).
- **Participation encoding:** Nodes visually "dim" (60% opacity) any avatar not participating in that specific booking, so partial participation is scannable at a glance without opening the node.
- **Interaction:** Click/tap expands the node in-place into a detail card (inline expansion, not a full drawer) showing the split breakdown and linked expenses for that booking.
- **Variant states:** Cancelled bookings render with a strikethrough title and desaturated card; modified bookings show a small "edited" badge with a hover/tap tooltip listing the change history (pulled from the event log).

### 4.2 Dynamic Split Drawer

The configuration surface for the Dynamic Split Primitive Engine — where an organizer chooses *how* a cost is divided.

- **Structure (top to bottom):**
  1. Expense header: amount input (`font.numeric`, large), vendor, category tag, linked booking (optional).
  2. **Split Method Selector** — horizontal segmented control with 5 modes: `Equal` · `Weighted / Per-Night` · `Line-Item` · `Room-Tier` · `Organizer-Paid`.
  3. **Live Allocation Table** — participant rows with avatar, name, and an editable share cell that adapts per mode (a percentage input for Weighted, a checkbox for Equal inclusion/exclusion, a nested sub-table for Line-Item).
  4. **Real-Time Reconciliation Bar** — a thin horizontal bar pinned above the confirm button showing "Allocated: $X / $Total" with a color shift (neutral → coral warning if not fully allocated → surplus green when balanced).
- **Behavior:** Every edit to a share recalculates the Reconciliation Bar instantly (optimistic UI, no save button needed until final confirm). The engine prevents confirmation until 100% of the expense is allocated.
- **Room-Tier mode specific:** Renders participants grouped into room cards; cost auto-weights by room occupancy and a selectable tier multiplier (e.g., suite = 1.4×, standard = 1.0×).

### 4.3 Ledger Settlement Visualizer

The centerpiece "wow" component — a force-directed or Sankey-style graph showing who owes whom.

- **Pre-simplification state:** Nodes = participants (sized by total transaction volume), edges = individual debts (directional arrows, edge thickness = amount, edge color = `deficit`/`surplus` gradient). In a real trip this is visually tangled — intentionally, to dramatize the problem.
- **"Simplify Debts" action:** A prominent coral button triggers the Graph-Based Debt Simplification algorithm. On trigger, the graph animates (see Section 5.2) from tangled multi-edge state to a minimal edge set (typically N-1 transactions for N participants with debt).
- **Post-simplification state:** Clean, minimal arrows only, each labeled with `font.numeric` amount and a "Mark as Settled" micro-CTA on hover/tap.
- **Personal view toggle:** A per-user filter that dims all nodes/edges not touching the logged-in participant, isolating "what do I actually need to pay/collect."
- **Empty/settled state:** When all debts are zero, the graph collapses to isolated neutral-colored dots with a celebratory micro-state (see Section 5.4).

### 4.4 Expense Variance Cards

Small, dense cards used in the Expenses feed and Overview summary to show estimate-vs-actual deltas (feeding the Target-Budget Reverse Itinerary engine).

- **Anatomy:** Category icon → Expense title → Estimated cost (secondary text, strikethrough-style muted) → Actual cost (`font.numeric`, primary) → Delta chip (`+$42` in `variance.over` orange or `−$18` in `variance.under` blue) → Mini sparkline (optional, showing cumulative category spend trend).
- **Aggregation variant:** A larger "Trip Variance Summary" card on Overview rolls up all categories into a single stacked bar (budgeted vs. actual, segmented by category color).
- **Alert state:** If cumulative variance exceeds a configurable threshold (e.g., 15% over budget), the card border pulses subtly once (not looping) and surfaces a dismissible banner suggesting cost-saving reallocation.

---

## 5. Motion & Interaction Behaviors

Motion in GroupTrip Ledger has one job: **make financial recalculation feel trustworthy, not magical.** Every number that changes should visibly *travel* from its old value to its new one — never jump-cut — so users always believe the math.

### 5.1 Core Motion Principles

- **Spring, not ease-curves**, for anything representing a physical/spatial change (drawer slides, node repositioning, avatar removal). Target spec: stiffness ~260, damping ~24, mass 1 (soft, slightly bouncy but not cartoonish).
- **Linear/ease-out timing curves** for anything representing a value change (numeric counters, progress bars) — precision over playfulness.
- **Duration bands:** Micro (120–160ms) for hovers/toggles · Standard (200–300ms) for drawers/modals · Complex (400–700ms) for graph re-layouts and multi-element recalculation sequences.

### 5.2 Signature Interaction: "Recalculation Cascade"

Triggered whenever a mid-trip event changes balances (participant removed, expense edited, cancellation processed). This is the demo's hero moment.

1. **Trigger flash (100ms):** The source of change (e.g., the removed participant's avatar) briefly outlines in coral, then fades to muted/greyscale and animates out of affected node avatar-stacks (spring, ~250ms).
2. **Propagation wave (staggered, 40ms delay per element):** Every affected Split Drawer allocation, Expense card, and Balance Pill updates in sequence, left-to-right / top-to-bottom, each number performing a **counting animation** (odometer-style digit roll, 300–500ms ease-out) from old value to new value.
3. **Settlement graph re-layout (400–700ms):** Edges affected by the change animate their thickness and direction via spring physics; unaffected edges stay static to visually isolate what changed.
4. **Resolution confirmation (toast, 200ms slide-up):** "Balances updated — 4 participants affected" with a "View changes" link to the Activity Log entry.

This sequence should never take longer than ~1.5s total, and should feel like watching a single coherent chain reaction, not four separate UI updates.

### 5.3 Standard Micro-Interactions

| Interaction | Behavior |
|---|---|
| Drawer open/close | Slide + fade, spring physics, 280ms |
| Card hover (desktop) | Elevate shadow + 2px lift, 150ms ease-out |
| Button press | Scale to 0.97, 100ms, spring return |
| Split allocation edit | Reconciliation bar color/width animates continuously as user types (debounced 80ms) |
| Avatar stack overflow expand | Radial fan-out of hidden avatars on tap, spring, 220ms |
| Tab switch (nav) | Underline indicator slides to new position, 200ms ease-in-out |

### 5.4 Celebratory Micro-State: "Trip Settled"

When the settlement graph reaches full zero-balance across all participants:
- All nodes pulse once in `color.ledger.surplus` (scale 1 → 1.08 → 1, 400ms spring), then settle to neutral.
- A single confetti-free, restrained particle emission (small upward-drifting dots in coral/gold, 1.2s, low density) plays once behind the graph — celebratory but not childish, consistent with the fintech-precision half of the brand.
- Header displays a persistent "Trip Settled ✓" badge replacing the Balance Pill for that trip.

---

## 6. Accessibility & Responsive Notes

- All ledger states (surplus/deficit/variance) are conveyed via **color + icon + text**, never color alone.
- Numeric counting animations respect `prefers-reduced-motion`: fall back to instant value updates with a single opacity crossfade.
- Minimum tap target: 44×44px on all interactive elements in mobile layouts.
- Master Itinerary Graph collapses from horizontal swimlanes to a vertical stacked list below 768px width, preserving all node information but sacrificing the timeline-flow visual metaphor.
- Settlement Visualizer on mobile defaults to the "Personal view" filter (Section 4.3) rather than the full tangled graph, to avoid an unreadable dense node-graph on small screens.

---

*End of Phase 2 deliverable. Proceeding to Phase 3: PRD, TRD, and Hackathon Pitch & Demo Blueprint.*
