# TULIS — Complete Architectural & Feature Documentation

> **One Trip. One Ledger. Zero Confusion.**  
> *FinTech-Grade Mathematical Precision × Frictionless Group Travel Settlement*

---

## Table of Contents

1. [Executive Summary & Product Vision](#1-executive-summary--product-vision)
2. [Technology Stack & Dependency Matrix](#2-technology-stack--dependency-matrix)
3. [System Architecture & Data Flow](#3-system-architecture--data-flow)
4. [Directory & File Organization](#4-directory--file-organization)
5. [Database Schema & Data Model](#5-database-schema--data-model)
6. [Core Ledger Engine — Mathematical Rigor](#6-core-ledger-engine--mathematical-rigor)
7. [Workspace Views & Navigation Architecture](#7-workspace-views--navigation-architecture)
8. [Features & Capabilities Inventory](#8-features--capabilities-inventory)
9. [AI & Perception Supertools](#9-ai--perception-supertools)
10. [Corporate Enterprise Travel Portal](#10-corporate-enterprise-travel-portal)
11. [Authentication, Security & Scoping](#11-authentication-security--scoping)
12. [API Reference & Route Specifications](#12-api-reference--route-specifications)
13. [Frontend Component Catalog](#13-frontend-component-catalog)
14. [Design System, Typography & Branding](#14-design-system-typography--branding)
15. [Deployment, Environment & Operations](#15-deployment-environment--operations)

---

## 1. Executive Summary & Product Vision

### 1.1 Product Purpose
**Tulis** is an event-sourced, double-entry financial ledger and travel management engine designed specifically for group trips, vacations, and corporate travel delegations. Standard group-splitting apps (Splitwise, Tricount, spreadsheets) fail because they treat expenses as disconnected math problems, causing floating-point rounding leaks, ambiguous multi-payer tracking, unhandled booking cancellations, and tangled debt webs.

Tulis replaces these failure modes with:
1. **Mathematical Determinism**: A strict double-entry accounting engine where $\sum \text{NetBalances} \equiv 0.00$ at all times.
2. **Deterministic Rounding Redistribution**: Cents and paise remainders are assigned by deterministic index rather than lost to floating-point truncation.
3. **Greedy Graph Debt Compression ($O(N \log N)$)**: Reduces an $N$-person debt web down to at most $N-1$ settlement paths.
4. **Direct Indian UPI Rails**: Instant peer-to-peer payment execution via dynamic QR generation and `upi://pay` deep links.
5. **Speculative "What-If" Scenario Engine**: Zero-disk dry-run simulations for traveler drops, booking cancellations, and budget shifts.
6. **Multimodal AI Operations**: Groq Vision bill receipt OCR, Whisper voice logging, Gogo conversational itinerary planner, and Trip Chat.
7. **Corporate Governance Isolation**: Enterprise portal with cost centers, travel director approval queues, and policy compliance limits.

### 1.2 Key System Attributes
| Attribute | Detail |
|---|---|
| **Product Name** | Tulis |
| **Tagline** | One Trip. One Ledger. Zero Confusion. |
| **Domain** | FinTech × Group Travel & Enterprise Delegations |
| **Framework** | Next.js 16.3.3 (React 19.2.8, App Router, Turbopack) |
| **Language** | TypeScript 7.0.2 (Strict Mode) |
| **Primary Database** | Neon Serverless PostgreSQL (Edge HTTP Driver) |
| **Repository** | [github.com/deepakp9653-sketch/TULIS](https://github.com/deepakp9653-sketch/TULIS) |

---

## 2. Technology Stack & Dependency Matrix

### 2.1 Framework & Core Runtime
| Component | Package / Technology | Version | Purpose |
|---|---|---|---|
| Runtime | **Node.js** | v20+ LTS | JavaScript server runtime |
| Framework | **Next.js** | 16.3.3 | App Router, Server Actions, Route Handlers, Turbopack |
| UI Library | **React** | 19.2.8 | React Server Components & Client Hooks |
| Language | **TypeScript** | 7.0.2 | End-to-end typed contracts across DB, engine, and UI |

### 2.2 Database & Authentication
| Component | Package | Version | Purpose |
|---|---|---|---|
| Database | **Neon PostgreSQL** | v16 Serverless | Cloud PostgreSQL with instant branching and HTTP driver |
| DB Driver | `@neondatabase/serverless` | 1.1.0 | Connectionless HTTP SQL queries optimized for serverless |
| JWT Engine | `jose` | 6.2.12 | Signed HS256 JWT cookie generation and verification |
| Hashing | `bcryptjs` | 3.0.3 | 10-round salted password hashing |
| Google OAuth | `@react-oauth/google` | 0.13.5 | Google Identity Services one-tap & popup authentication |
| Email Service | `resend` | 6.28.1 | Transactional email delivery for 6-digit OTPs and invites |

### 2.3 Styling, Motion & 3D Visualization
| Component | Package | Version | Purpose |
|---|---|---|---|
| Styling | `tailwindcss` | 3.4.19 | Utility CSS with curated HSL color tokens and dark/light modes |
| Class Utilities | `clsx` & `tailwind-merge` | 2.1.1 / 3.6.0 | Conditional class handling and conflicting Tailwind rule merging |
| Iconography | `lucide-react` | 1.37.0 | Clean SVG icon system |
| UI Motion | `framer-motion` (Motion) | 13.1.1 | Spring physics, tab crossfades, modal presence, sliding pills |
| Complex Motion | `animejs` | 4.5.0 | Staggered timeline animations and card entrances |
| 3D Globe | `cobe` | 2.0.1 | 5KB WebGL interactive 3D globe for landing page hero |
| 3D Engine | `three` | 0.185.1 | WebGL background shaders and canvas rendering |
| QR Code | `qrcode` | 1.5.4 | Dynamic canvas and data-URL generation for UPI payments |
| Celebration | `canvas-confetti` | 1.9.4 | Physics-based confetti explosion on full debt settlement |

### 2.4 AI & Multimodal Services
| Service | Model / Provider | Purpose |
|---|---|---|
| **Vision OCR** | Groq Cloud (Llama 3.3 70B Vision) | Multimodal receipt scan: item extraction, tax parsing, amount total |
| **Natural Language** | Groq Cloud (Llama 3.3 70B Versatile) | Chat-based free-text expense parsing (*"Kabir paid 1200 for drinks"*) |
| **Voice Logging** | Whisper Audio API | AudioShield hands-free voice transcription |
| **AI Planner** | Gogo Agentic Interviewer | Interactive conversational trip itinerary generator |
| **AI Assistant** | Trip Chat & AI Panel | Real-time squad companion for itinerary Q&A and spend advice |

---

## 3. System Architecture & Data Flow

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT APPLICATION                                 |
|                                                                                       |
|  +--------------------+   +----------------------+   +-----------------------------+  |
|  |    Landing Page    |   |  Authentication Hub  |   |    Trip Dashboard Shell     |  |
|  | - 3D WebGL Globe   |   | - 6-Digit Email OTP  |   | - Left Command Rail         |  |
|  | - Interactive Hero |   | - Google One-Tap/SSO |   | - Workspace Views           |  |
|  | - Corporate Portal |   | - Corporate Auth     |   | - Floating AI Supertools    |  |
|  +--------------------+   +----------------------+   +-----------------------------+  |
|            |                         |                              |                 |
|            +-------------------------+------------------------------+                 |
|                                      |                                                |
|                                      v                                                |
|                    +-----------------------------------+                              |
|                    |     Central State Orchestrator    |                              |
|                    |             (page.tsx)            |                              |
|                    |  - React 19 State Management      |                              |
|                    |  - Offline Outbox & Sync Queue    |                              |
|                    +-----------------------------------+                              |
|                                      |                                                |
|                 +--------------------+--------------------+                           |
|                 |                                         |                           |
|                 v                                         v                           |
|  +------------------------------+       +------------------------------------+        |
|  |   Core Ledger Engine (Math)  |       |       AI & Perception Services     |        |
|  | - calculateSplits (6 rules)  |       | - Groq Vision Receipt OCR Engine   |        |
|  | - computeNetBalances         |       | - Whisper Audio Voice Shield       |        |
|  | - simplifyDebts (Greedy)     |       | - Gogo Conversational Trip Planner |        |
|  | - simulateDryRun (Scenarios) |       | - Natural Language Expense Parser  |        |
|  | - detectAnomalies (5 checks) |       | - Trip Chat & AI Assistant         |        |
|  +------------------------------+       +------------------------------------+        |
+---------------------------------------------------------------------------------------+
                                       |
                                       | HTTPS / JSON API
                                       v
+---------------------------------------------------------------------------------------+
|                              SERVERLESS BACKEND LAYER                                 |
|                                                                                       |
|  +--------------------+   +---------------------+   +-------------------------------+ |
|  |   /api/auth/*      |   |    /api/trips/*     |   |         /api/ai/*             | |
|  | - Email OTP Verify |   | - CRUD Operations   |   | - parse-expense (NLP)         | |
|  | - Google OAuth     |   | - Invite Code Join  |   | - explain-balance (Gemini)    | |
|  | - Corporate SSO    |   | - Workspace Scope   |   | - transcribe-audio (Whisper)  | |
|  +--------------------+   +---------------------+   +-------------------------------+ |
+---------------------------------------------------------------------------------------+
                                       |
       +-------------------------------+-------------------------------+
       |                               |                               |
       v                               v                               v
+----------------------+     +--------------------+          +--------------------+
|  Neon Serverless DB  |     |   Resend API       |          |  Google Cloud /    |
|  (PostgreSQL 16)     |     |   (Email Engine)   |          |  Groq AI Engine    |
|  - Events (Source)   |     |   - OTP Delivery   |          |  - Llama 3.3 70B   |
|  - Normalized Roster |     |   - Trip Invites   |          |  - Vision OCR      |
|  - JSONB Allocations |     |   - Audit Reports  |          |  - OAuth Provider  |
+----------------------+     +--------------------+          +--------------------+
```

---

## 4. Directory & File Organization

```
hackcelestial/
├── .env.example                       # Reference environment configuration
├── .env.local                         # Local secret variables (git-ignored)
├── next.config.js                     # Next.js 16 bundler settings
├── package.json                       # Dependencies & build scripts
├── tailwind.config.js                 # Design tokens, color system, font pairings
├── tsconfig.json                      # Strict TypeScript compiler configuration
├── README.md                          # Repository primary guide & overview
├── PROJECT_DOCUMENTATION.md           # This comprehensive architecture document
│
├── public/                            # Static public assets
│   ├── tulis-logo.png.jpeg            # Official new Tulis emblem & wordmark logo
│   ├── tulis-logo.png                 # Mirrored logo asset
│   ├── tulis-icon.png                 # Fallback icon asset
│   ├── logo.png                       # Primary logo alias
│   └── images/                        # Illustrations & UI graphics
│
├── db/
│   └── schema.sql                     # Complete PostgreSQL DDL (tables, indexes, foreign keys)
│
└── src/
    ├── app/
    │   ├── layout.tsx                 # Root layout, favicon definitions, metadata
    │   ├── page.tsx                   # Master client orchestrator (state, tabs, modals)
    │   ├── globals.css                # CSS custom properties, ambient themes, fonts
    │   └── api/                       # Next.js serverless route handlers
    │       ├── auth/                  # Email OTP, Google OAuth, Corporate login
    │       ├── trips/                 # Trip CRUD, invite-code lookup, and bookings
    │       ├── expenses/              # Expense recording and allocation persistence
    │       ├── events/                # Immutable ledger event stream
    │       └── ai/                    # Groq NLP, Vision OCR, and Gemini explanation
    │
    ├── components/                    # 48 Production React Components
    │   ├── LiquidLogo.tsx             # Theme-adaptive ambient logo badge
    │   ├── LandingPage.tsx            # Interactive landing hero with 3D COBE globe
    │   ├── DashboardShell.tsx         # Responsive left command rail and top navigation
    │   ├── PlanAndLedgerView.tsx      # Consolidated Timeline + Ledger Table hub
    │   ├── SquadAndSettlementsView.tsx# Squad roster + compressed debt graph
    │   ├── OverviewSection.tsx        # Financial health and category spend dashboard
    │   ├── ActivityLogSection.tsx     # Audit trail with CSV/PDF export
    │   ├── WhatIfSimulatorModal.tsx   # Speculative scenario dry-run engine
    │   ├── TripChatFAB.tsx            # Floating action button for Trip Chat
    │   ├── TripChatPanel.tsx          # Real-time chat & AI assistant panel
    │   ├── GogoFAB.tsx                # Floating action button for Gogo AI planner
    │   ├── GogoInterviewModal.tsx     # Conversational AI itinerary generator
    │   ├── CorporateDashboardShell.tsx# Enterprise travel governance workspace
    │   ├── CorporateAuthModal.tsx     # Corporate work email authentication
    │   ├── DynamicSplitDrawer.tsx     # 6-strategy expense split drawer
    │   ├── UpiQrModal.tsx             # Real-time dynamic UPI QR generator
    │   ├── SettlementReportModal.tsx  # Printable audit sheet certificate
    │   ├── ReceiptExtractionReviewModal.tsx # Groq Vision OCR review modal
    │   └── AudioShieldModal.tsx       # Whisper voice expense recorder
    │
    └── lib/                           # Business logic and shared utilities
        ├── types.ts                   # Full domain TypeScript type definitions
        ├── ledger-engine.ts           # Math brain (splits, balances, debts, dry-runs)
        ├── db.ts                      # Neon PostgreSQL serverless client
        ├── auth-service.ts            # JWT verification and user store
        ├── email-service.ts           # Resend email templates and OTP sender
        ├── mock-data.ts               # Seed data for demo trips and squad members
        └── motion.ts                  # Framer Motion animation tokens
```

---

## 5. Database Schema & Data Model

Tulis utilizes a normalized PostgreSQL relational schema in **Neon Serverless PostgreSQL**.

### 5.1 Entity Relationship Diagram

```mermaid
erDiagram
    TRIPS ||--o{ PARTICIPANTS : "contains members"
    TRIPS ||--o{ BOOKINGS : "schedules activities"
    TRIPS ||--o{ EXPENSES : "records outlays"
    TRIPS ||--o{ PAYMENTS : "tracks settlements"
    TRIPS ||--o{ EVENTS : "emits audit trail"
    TRIPS ||--o{ REFUND_EVENTS : "logs vendor returns"
    BOOKINGS ||--o{ BOOKING_PARTICIPANTS : "assigns travelers"
    PARTICIPANTS ||--o{ BOOKING_PARTICIPANTS : "assigned to"
    EXPENSES ||--o{ EXPENSE_ALLOCATIONS : "debits shares"
    PARTICIPANTS ||--o{ EXPENSE_ALLOCATIONS : "owes share"
    PARTICIPANTS ||--o{ EXPENSES : "fronts payment"
    PARTICIPANTS ||--o{ PAYMENTS : "payer/payee"
```

### 5.2 Table Schemas

#### 1. `trips`
- `id` (VARCHAR 64, PK): Unique trip identifier (e.g., `trip-goa-2026`).
- `title` (VARCHAR 255): Descriptive title.
- `destination` (VARCHAR 255): Target destination.
- `base_currency` (VARCHAR 10): Default `'INR'`.
- `start_date` / `end_date` (DATE): Vacation duration.
- `budget_ceiling` (NUMERIC 12,2): Optional spending limit.
- `invite_code` (VARCHAR 10, UNIQUE): 6-character uppercase alphanumeric join code.
- `organizer_id` (VARCHAR 64): Participant ID of trip chief.
- `created_at` (TIMESTAMPTZ): Trip initialization timestamp.

#### 2. `participants`
- `id` (VARCHAR 64, PK): Unique member identifier.
- `trip_id` (VARCHAR 64, FK -> trips): Associated trip workspace.
- `name` (VARCHAR 255): Display name.
- `email` (VARCHAR 255): Email address used for workspace scoping.
- `avatar_url` (TEXT): Profile picture.
- `is_organizer` (BOOLEAN): Administrator privileges.
- `status` (VARCHAR 32): `'active'` or `'removed'`.
- `upi_id` (VARCHAR 255): Indian UPI VPA (`username@bank`) for peer payments.
- `qr_code_url` (TEXT): Custom uploaded QR code image.
- `weight` (NUMERIC): Weight coefficient for proportional splits (default 1.0).
- `room_tier` (VARCHAR 32): Assigned lodging tier (`'suite'`, `'standard'`, `'economy'`).

#### 3. `bookings`
- `id` (VARCHAR 64, PK): Activity or booking identifier.
- `trip_id` (VARCHAR 64, FK -> trips): Parent trip.
- `title` (VARCHAR 255): Booking name (e.g., "Taj Villa Vagator").
- `category` (VARCHAR 32): `'lodging'`, `'transport'`, `'food'`, `'activity'`, `'other'`.
- `vendor` (VARCHAR 255): Service provider.
- `start_time` / `end_time` (TIMESTAMPTZ): Scheduled timeline window.
- `estimated_cost` (NUMERIC 12,2): Planned budget.
- `actual_cost` (NUMERIC 12,2): Final billed expense.
- `status` (VARCHAR 32): `'confirmed'`, `'pending'`, `'cancelled'`.
- `room_capacity` (INTEGER): Maximum headcount for lodging units.

#### 4. `expenses`
- `id` (VARCHAR 64, PK): Expense identifier.
- `trip_id` (VARCHAR 64, FK -> trips): Parent trip.
- `booking_id` (VARCHAR 64, Nullable): Linked booking if created from itinerary.
- `title` (VARCHAR 255): Expense description.
- `total_amount` (NUMERIC 12,2): Total invoice outlay.
- `currency` (VARCHAR 10): Default `'INR'`.
- `split_method` (VARCHAR 32): Split strategy used.
- `paid_by_id` (VARCHAR 64, FK -> participants): Primary payer.
- `paid_by_splits` (JSONB): Multi-payer splits `[{participantId, amount}]`.
- `category` (VARCHAR 32): Expense classification.
- `receipt_url` (TEXT): Verified invoice proof image.
- `subsidy_amount` (NUMERIC 12,2): Organizer absorption amount.

#### 5. `expense_allocations`
- `id` (VARCHAR 64, PK): Allocation identifier.
- `expense_id` (VARCHAR 64, FK -> expenses): Parent bill.
- `participant_id` (VARCHAR 64, FK -> participants): Debited traveler.
- `amount_owed` (NUMERIC 12,2): Exact allocated share.

#### 6. `payments`
- `id` (VARCHAR 64, PK): Settlement transaction identifier.
- `trip_id` (VARCHAR 64, FK -> trips): Parent trip.
- `payer_id` (VARCHAR 64): Traveler sending money.
- `payee_id` (VARCHAR 64): Traveler receiving money.
- `amount` (NUMERIC 12,2): Payment value.
- `status` (VARCHAR 32): `'completed'`, `'pending'`, `'disputed'`.
- `note` (TEXT): UPI reference or transaction memo.

#### 7. `events` (Immutable Event Sourcing Log)
- `id` (VARCHAR 64, PK): Event identifier.
- `trip_id` (VARCHAR 64, FK -> trips): Associated trip.
- `event_type` (VARCHAR 64): One of 33 audit event enums.
- `payload_json` (JSONB): Complete payload snapshot.
- `actor_id` (VARCHAR 64): User who triggered mutation.
- `sequence_num` (BIGSERIAL): Monotonically increasing sequence order.
- `created_at` (TIMESTAMPTZ): Timestamp.

---

## 6. Core Ledger Engine — Mathematical Rigor

All financial computations are implemented as side-effect-free pure functions in [`src/lib/ledger-engine.ts`](file:///c:/Users/heena/Downloads/hackcelestial/src/lib/ledger-engine.ts).

### 6.1 The 6 Split Strategies (`calculateSplits`)

```typescript
type SplitMethod = 'equal' | 'weighted' | 'line_item' | 'room_tier' | 'organizer_subsidy' | 'manual';
```

1. **Equal Split (`equal`)**:
   $$\text{BaseShare} = \left\lfloor \frac{\text{Amount}}{N} \times 100 \right\rfloor \div 100$$
   $$\text{Remainder} = \text{Amount} - (\text{BaseShare} \times N)$$
   $\text{Remainder} \times 100$ cents are deterministically distributed to the first $k$ participants. No paise is discarded.

2. **Weighted Split (`weighted`)**:
   Calculated from participant weight factors $w_i$:
   $$\text{Share}_i = \frac{\text{Amount} \times w_i}{\sum_{j=1}^N w_j}$$
   The final participant in the iteration absorbs the rounding residual to guarantee $\sum \text{Allocations} \equiv \text{Amount}$.

3. **Room-Tier Split (`room_tier`)**:
   Accommodates lodging equity:
   - **Suite**: $1.4\times$ multiplier
   - **Standard**: $1.0\times$ multiplier
   - **Economy**: $0.8\times$ multiplier
   $$\text{Share}_i = \frac{\text{Amount} \times \text{Multiplier}_i}{\sum \text{Multipliers}}$$

4. **Organizer Subsidy Split (`organizer_subsidy`)**:
   Organizer absorbs amount $S$. Group share is calculated strictly over the net:
   $$\text{NetGroupAmount} = \max(0, \text{TotalAmount} - S)$$
   $$\text{Share}_i = \frac{\text{NetGroupAmount}}{N}$$

5. **Line-Item Split (`line_item`)**:
   Itemized consumable mapping. If line item totals deviate from invoice totals due to taxes/service fees, shares are scaled proportionally:
   $$\text{ScaleRatio} = \frac{\text{TotalAmount}}{\sum \text{Items}}$$
   $$\text{Share}_i = \text{Item}_i \times \text{ScaleRatio}$$

6. **Manual Split (`manual`)**:
   Explicit per-participant amounts with strict validation against invoice totals.

---

### 6.2 Zero-Sum Net Balance & Double-Entry Invariant

$$\text{NetBalance}_p = \text{TotalPaid}_p - \text{TotalOwed}_p$$

Where:
- $\text{TotalPaid}_p$: Direct expense outlays + multi-payer split contributions ($\text{paidBySplits}$) + vendor refund credits.
- $\text{TotalOwed}_p$: Sum of all itemized expense allocations + peer settlements.

$$\sum_{p \in P} \text{NetBalance}_p \equiv 0.00 \quad (\text{Strict Double-Entry Invariant})$$

`computeReconciliationAudit()` validates this equation on every mutation. If $\Delta > 0.02$, an anomaly is raised.

---

### 6.3 Greedy Pairwise Debt Simplification Algorithm ($O(N \log N)$)

Instead of a tangle of pairwise IOUs, `simplifyDebts()` executes a greedy debt compression algorithm:
1. Filters participants into **Creditors** ($+ \text{Net}$) and **Debtors** ($-\text{Net}$).
2. Sorts both sets in descending order of absolute magnitude.
3. Iteratively pairs the largest debtor with the largest creditor.
4. Generates an optimal settlement payment:
   $$T = \min(|\text{DebtorBalance}|, \text{CreditorBalance})$$
5. Decrements balances by $T$ and advances pointers.
6. **Guarantee**: Compresses $N$-party peer debt webs into at most $N-1$ optimal settlement transactions.

---

### 6.4 What-If Scenario Simulator (`simulateDryRun`)

Allows squads to preview financial outcomes before committing changes:
- **Participant Drop**:
  - Sets target participant status to `'removed'`.
  - **Preserves all historical activity shares and expense allocations at their respective amounts**, ensuring past activities are not erased and expense shares do not go directly to zero.
  - Automatically redistributes unexpensed itinerary bookings across remaining active travelers.
  - Maintains strict double-entry zero-sum reconciliation ($\Delta = ₹0.00$).
- **Booking Cancellation**:
  - Tests Full ($100\%$), Partial ($10\% - 90\%$), or Non-Refundable vendor policies.
  - Automatically computes payer refund credits and group debt relief.
- **Hypothetical Cost Addition**:
  - Simulates adding a high-ticket item (e.g., ₹25,000 Yacht Charter) with live delta tables showing exact before-and-after net positions.

---

## 7. Workspace Views & Navigation Architecture

The user dashboard utilizes a streamlined, consolidated 4-view rail navigation:

### 1. Overview (`overview`)
- **Trip Financial Health**: Logged spend vs. budget ceiling, surplus/deficit indicators, total receipts verified.
- **Visual Analytics**: Interactive Category Spend Donut Chart and Member Contribution Bar Chart.
- **Action Trays**: Quick buttons for adding expenses, bookings, sharing trips, and viewing anomalies.

### 2. Plan & Live Ledger (`plan-ledger`)
Consolidates itinerary planning and financial accounting into two focused sub-views:
- **Timeline View**: Chronological day-by-day stream of bookings, flight pickups, hotel check-ins, room tier tags, vendor names, and proof verification badges.
- **Ledger Table View**: High-density accounting table with live text search, category filtering (lodging, transport, activity, food), verified receipt preview modals, room-tier indicators, and allocation dispute workflows.

### 3. Squad & Settlements (`squad-settlements`)
- **Squad Roster**: Individual participant cards displaying real-time net position (`Gets back ₹X` vs `Owes squad ₹Y`), assigned room tier, custom weight, and pause/active toggle.
- **Settlement Resolution Graph**: The compressed list of $N-1$ debt paths. Each path features:
  - Payee avatar and UPI ID.
  - **1-Click UPI QR Code**: Opens dynamic high-resolution QR modal for mobile scanning.
  - **Mobile Deep Link**: One-tap launch into Google Pay, PhonePe, or Paytm with pre-filled amounts.
  - **Debt Reassignment**: Allows members to legally transfer debt obligations to other consenting squad members.
- **Cross-Trip Squad Netting**: Combines debts across multiple trips for recurring friend groups.

### 4. Audit Trail (`activity`)
- Chronological, tamper-evident log of all 33 event types.
- Displays sequence numbers, actor attribution badges, and before/after mutation payloads.
- **RFC 4180 CSV Export**: One-click download of the complete expense and settlement ledger for corporate accounting and tax filing.
- **Printable Audit Certificate**: Official PDF print sheet with zero-sum cryptographic reconciliation seal.

---

## 8. Features & Capabilities Inventory

### 8.1 Summary Matrix
| Feature | Module / File | Description |
|---|---|---|
| **6-Digit Email OTP** | `AuthModal.tsx` / `email-service.ts` | Passwordless or password-protected authentication via Resend |
| **Google One-Tap / OAuth** | `GoogleAuthProvider.tsx` | One-click credential sign-in via Google Identity Services |
| **Dynamic Split Drawer** | `DynamicSplitDrawer.tsx` | Full-screen drawer for configuring equal, weighted, room-tier, or subsidy splits |
| **Multi-Payer Support** | `DynamicSplitDrawer.tsx` | Split a single bill across multiple upfront payers |
| **UPI QR & Deep Links** | `UpiQrModal.tsx` | NPCI-compliant `upi://pay` generation and dynamic QR codes |
| **Debt Reassignment** | `DebtReassignmentModal.tsx` | Transfer debt obligations between squad members |
| **What-If Simulator** | `WhatIfSimulatorModal.tsx` | Speculative dry-run engine for participant drops and cancellations |
| **Groq Vision Receipt OCR** | `ReceiptExtractionReviewModal.tsx` | Multimodal AI OCR that extracts items and totals from bill photos |
| **Whisper AudioShield** | `AudioShieldModal.tsx` | Voice-activated expense recorder with speech-to-text |
| **Gogo AI Trip Planner** | `GogoInterviewModal.tsx` | Conversational agent that creates full travel itineraries |
| **Trip Chat & AI** | `TripChatPanel.tsx` / `TripChatFAB.tsx` | Floating assistant for itinerary questions and spend insights |
| **Offline Mode** | `page.tsx` | Local outbox queue with automatic server sync upon reconnect |
| **Cross-Trip Netting** | `SquadAndSettlementsView.tsx` | Multi-trip debt consolidation for recurring travel groups |
| **CSV & PDF Audit Export** | `ActivityLogSection.tsx` | Downloadable CSV and printable PDF audit certificate |
| **Corporate Portal** | `CorporateDashboardShell.tsx` | Enterprise travel workspace with manager sign-offs and cost centers |

---

## 9. AI & Perception Supertools

### 9.1 Groq Vision Receipt Scanner (`ReceiptExtractionReviewModal.tsx`)
- Powered by Llama 3.3 70B Vision via Groq Cloud.
- Extracts merchant name, invoice date, itemized line items, subtotal, GST/VAT taxes, and total amount.
- Pre-populates the Tulis expense split drawer with high accuracy, eliminating manual typing.

### 9.2 Whisper AudioShield Voice Logging (`AudioShieldModal.tsx`)
- Captures microphone audio in standard WebM/WAV formats.
- Transcribes natural spoken phrases: *"Paid 3,600 rupees for scuba diving in Vagator split equally"*.
- Feeds transcribed text directly into `parseNaturalChatExpense()` to extract payer, amount, title, and split rule.

### 9.3 Gogo AI Conversational Trip Planner (`GogoInterviewModal.tsx`)
- Accessible via the bottom-left floating pill button (`GogoFAB.tsx`).
- Conducts an interactive 3-step interview: destination & squad vibe, budget constraints, and pacing.
- Generates structured day-by-day bookings (lodging, transport, food, activities) that inject directly into the active trip ledger.

### 9.4 Trip Chat & AI Assistant (`TripChatFAB.tsx` & `TripChatPanel.tsx`)
- Accessible via the bottom-right floating action button.
- Combines squad peer messaging with an in-context AI assistant grounded in the trip's live ledger data.
- Answers questions like *"Who owes the most right now?"*, *"What time is our airport pickup?"*, and *"Can we afford dinner at Thalassa?"*.

---

## 10. Corporate Enterprise Travel Portal

Accessible exclusively from the homepage Corporate Portal, `CorporateDashboardShell.tsx` isolates corporate business trips from normal personal vacations:
- **Corporate Directory Authentication**: SSO and corporate work email verification (`CorporateAuthModal.tsx`).
- **Cost Center Attribution**: Associates trips with specific departments, accounting cost centers, and budget codes.
- **Travel Director Approval Queue**: Manager sign-off workflow for travel bookings and expenses exceeding company policy caps.
- **Policy Compliance Rails**: Flags expenses that breach daily meal allowances, flight class rules, or hotel price ceilings.

---

## 11. Authentication, Security & Scoping

### 11.1 Authentication Workflow
1. **User Registration / Login**: User enters email and password, or signs in via Google OAuth.
2. **OTP Dispatch**: A 6-digit numeric code is generated and delivered to the user's inbox via Resend.
3. **JWT Session Issuance**: Upon OTP verification, a signed HS256 JWT cookie (`tulis_session`) is set with a 30-day lifetime (`HttpOnly`, `Secure`, `SameSite=Lax`).
4. **Session Hydration**: On application load, `page.tsx` queries `/api/auth?action=me` to restore user identity and sync accessible trips.

### 11.2 Trip-Level Scoping
Users only see trips they have legitimate access to, enforced in `auth-service.ts`:
1. The user created the trip (`trips.organizer_id = userId`).
2. The user was linked as a trip member (`trip_members.user_id = userId`).
3. The user's authenticated email matches a participant profile (`participants.email = userEmail`).

---

## 12. API Reference & Route Specifications

### 12.1 Authentication Routes (`/api/auth`)
- `GET /api/auth?action=me`: Returns authenticated user session and accessible trips.
- `POST /api/auth` (`action=register`): Creates user account, sends verification OTP.
- `POST /api/auth` (`action=login`): Verifies credentials, sends verification OTP.
- `POST /api/auth` (`action=verify-otp`): Validates 6-digit code, sets signed session cookie.
- `POST /api/auth` (`action=corporate-login`): Authenticates corporate user with cost center scope.
- `POST /api/auth` (`action=logout`): Clears session cookie and resets client state.
- `POST /api/auth/google`: Validates Google ID token and issues session cookie.

### 12.2 Trip Routes (`/api/trips`)
- `GET /api/trips`: Fetches all trips accessible to the authenticated user.
- `POST /api/trips` (`action=create`): Initializes new trip, creator participant, and initial bookings.
- `POST /api/trips` (`action=save-expense`): Persists expense, multi-payer splits, and allocations.
- `POST /api/trips` (`action=save-booking`): Persists itinerary booking and assigned traveler IDs.
- `POST /api/trips` (`action=update-booking`): Updates booking status (e.g., cancellation + refund).
- `POST /api/trips` (`action=record-payment`): Persists peer-to-peer settlement payment.
- `POST /api/trips` (`action=log-event`): Appends immutable audit event to `events` table.
- `POST /api/trips/join`: Joins a trip via 6-character invite code.

### 12.3 AI Routes (`/api/ai/*`)
- `POST /api/ai/parse-expense`: NLP endpoint converting free-text messages to structured expense objects.
- `POST /api/ai/explain-balance`: Generates natural language narrative explaining a member's net position.

---

## 13. Frontend Component Catalog

### Core Layout & Workspace Views
| Component | File Path | Responsibility |
|---|---|---|
| `LiquidLogo` | `src/components/LiquidLogo.tsx` | Official brand badge with ambient glow and scale emblem |
| `LandingPage` | `src/components/LandingPage.tsx` | Marketing landing page with interactive 3D WebGL globe |
| `DashboardShell` | `src/components/DashboardShell.tsx` | Left command rail, workspace views, theme toggle, logout |
| `PlanAndLedgerView` | `src/components/PlanAndLedgerView.tsx` | Synchronized hub for Timeline and Ledger Table |
| `SquadAndSettlementsView` | `src/components/SquadAndSettlementsView.tsx` | Squad roster, room tiers, weights, and settlement graph |
| `OverviewSection` | `src/components/OverviewSection.tsx` | Spend KPIs, budget progress, and donut/bar charts |
| `ActivityLogSection` | `src/components/ActivityLogSection.tsx` | Event log audit trail with CSV download & PDF certificate |
| `CorporateDashboardShell` | `src/components/CorporateDashboardShell.tsx` | Enterprise business travel portal and approval queue |

### Modals & Supertools
| Component | File Path | Responsibility |
|---|---|---|
| `WhatIfSimulatorModal` | `src/components/WhatIfSimulatorModal.tsx` | Speculative dry-run scenario engine |
| `DynamicSplitDrawer` | `src/components/DynamicSplitDrawer.tsx` | 6-split strategy expense configurator |
| `TripChatFAB` / `Panel` | `src/components/TripChatFAB.tsx` | Floating trigger and interactive chat & AI assistant |
| `GogoFAB` / `Modal` | `src/components/GogoFAB.tsx` | Floating trigger and conversational itinerary generator |
| `ReceiptExtractionReviewModal` | `src/components/ReceiptExtractionReviewModal.tsx` | Groq Vision receipt OCR review and confirmation |
| `AudioShieldModal` | `src/components/AudioShieldModal.tsx` | Whisper speech-to-text hands-free expense entry |
| `UpiQrModal` | `src/components/UpiQrModal.tsx` | Dynamic high-resolution UPI QR code generator |
| `SettlementReportModal` | `src/components/SettlementReportModal.tsx` | Printable final audit report certificate |
| `CreateTripModal` | `src/components/CreateTripModal.tsx` | Multi-step trip creation wizard |
| `JoinTripModal` | `src/components/JoinTripModal.tsx` | 6-character invite code entry dialog |
| `DebtReassignmentModal`| `src/components/DebtReassignmentModal.tsx` | Legal peer debt transfer workflow |

---

## 14. Design System, Typography & Branding

### 14.1 Brand Identity
The official brand identity of Tulis is defined by the **Balance-Scale Emblem and Wordmark** ([`public/tulis-logo.png.jpeg`](file:///c:/Users/heena/Downloads/hackcelestial/public/tulis-logo.png.jpeg)):
- **Symbolism**: The balance scale sits symmetrically over the letters **"U"** and **"I"**, representing mathematical equity, fair distribution, and zero-sum balance between squad members.
- **Implementation**: Handled through `LiquidLogo.tsx` with a high-contrast container (`rounded-xl bg-white/95 px-2 py-0.5 border border-white/20 shadow-subtle`) that renders crisply across both dark and light modes.

### 14.2 Typography
- **Serif Display**: *Playfair Display / Cinzel* for headings, trip titles, and audit certificates.
- **Sans Body**: *Inter / Geist Sans* for clean, legible interface text and control labels.
- **Numeric & Mono**: *JetBrains Mono / Space Mono* for currency amounts, invite codes, and mathematical deltas.

### 14.3 Color System Tokens
```css
:root {
  --color-brand-emerald: #10B981;
  --color-brand-teal: #14B8A6;
  --color-brand-gold: #F59E0B;
  --color-surface-base: #0F1712;
  --color-surface-raised: #16221A;
  --color-surface-inset: #0B110D;
  --color-surface-hairline: rgba(255, 255, 255, 0.08);
  --color-ink-primary: #F9FAFB;
  --color-ink-secondary: #9CA3AF;
  --color-ink-muted: #6B7280;
}
```

---

## 15. Deployment, Environment & Operations

### 15.1 Environment Variables (`.env.local`)
```env
# Database (Neon Serverless PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-cool-project.us-east-2.aws.neon.tech/neondb?sslmode=require"

# JWT Authentication Secret
JWT_SECRET="your-super-secure-jwt-secret-key-at-least-32-chars"

# Transactional Email (Resend)
RESEND_API_KEY="re_your_resend_api_key"
RESEND_FROM_EMAIL="Tulis <onboarding@resend.dev>"

# Google OAuth Credentials
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Multimodal AI & OCR (Groq Cloud API)
GROQ_API_KEY="gsk_your_groq_api_key"
```

### 15.2 Local Execution
```bash
# Install dependencies
npm install

# Run TypeScript compilation check
npx tsc --noEmit

# Start development server
npm run dev
```

### 15.3 Production Build & Verification
```bash
# Production bundle build
npm run build

# Start production server
npm start
```

---

<div align="center">
  <strong>Tulis — One Trip. One Ledger. Zero Confusion.</strong><br />
  <sub>Built with mathematical precision, operational excellence, and architectural integrity.</sub>
</div>
