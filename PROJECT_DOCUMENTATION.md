# TULIS — Complete Project Documentation

> **One Trip. One Ledger. Zero Confusion.**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Vision & Philosophy](#2-vision--philosophy)
3. [Technology Stack](#3-technology-stack)
4. [Project Architecture](#4-project-architecture)
5. [Directory Structure](#5-directory-structure)
6. [Database Schema & Data Model](#6-database-schema--data-model)
7. [Authentication & Security](#7-authentication--security)
8. [Core Ledger Engine — The Math Brain](#8-core-ledger-engine--the-math-brain)
9. [Features — Built & Functional](#9-features--built--functional)
10. [API Reference](#10-api-reference)
11. [Frontend Component Inventory](#11-frontend-component-inventory)
12. [Design System](#12-design-system)
13. [Email & Notification System](#13-email--notification-system)
14. [Workflow & User Journey](#14-workflow--user-journey)
15. [State Management](#15-state-management)
16. [Environment Configuration](#16-environment-configuration)
17. [Deployment & Build](#17-deployment--build)
18. [Future Roadmap](#18-future-roadmap)

---

## 1. Project Overview

**Tulis** is a high-precision, deterministic **Group Travel Finance Ledger** — a full-stack web application that brings FinTech-grade accuracy to group trip expense management. It replaces chaotic spreadsheets and Splitwise-style apps with a mathematically rigorous, event-sourced settlement platform.

| Attribute | Detail |
|---|---|
| **Name** | Tulis |
| **Tagline** | One Trip. One Ledger. Zero Confusion. |
| **Category** | FinTech x Group Travel |
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 7.0 |
| **Database** | Neon Serverless PostgreSQL |
| **Hosting** | Vercel (Edge-optimized) |
| **Repo** | [github.com/deepakp9653-sketch/TULIS](https://github.com/deepakp9653-sketch/TULIS) |

### What Makes Tulis Different

- **Zero-Sum Guarantee**: Every expense is split so that the sum of allocations equals the total amount — no rounding leaks, ever.
- **Deterministic Rounding**: Remainder cents are distributed to the first N participants (index-based), not lost.
- **Event-Sourced Ledger**: Every financial action is an immutable event (TRIP_CREATED, EXPENSE_LOGGED, SETTLEMENT_SIMPLIFIED, etc.).
- **6 Split Methods**: Equal, Weighted, Line-Item, Room-Tier, Organizer-Subsidy, Manual.
- **Real UPI Settlement**: QR codes and deep links for instant Indian UPI peer payments.

---

## 2. Vision & Philosophy

Tulis was built on three core principles:

### 2.1 Financial Determinism
Every calculation in Tulis produces the same output for the same input, every time. There are no floating-point surprises. Remainder cents from rounding are allocated deterministically using index-based assignment — the first participant absorbs the extra paisa, not random distribution.

### 2.2 Event Sourcing as Audit Trail
Every mutation (expense logged, booking cancelled, payment recorded) generates an immutable `LedgerEvent` written to the `events` table. The complete financial history of a trip can be replayed from these events. This provides:
- Full audit trail for disputes
- Timeline reconstruction
- Actor attribution (who did what, when)

### 2.3 Group Fairness
Split methods go beyond naive "divide by N". Room-tier splits charge suite guests 1.4x and economy guests 0.8x. Organizer subsidies let the organizer absorb a fixed portion before splitting the remainder equally. Weighted splits respect custom contribution ratios.

---

## 3. Technology Stack

### 3.1 Core Framework
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Runtime | Next.js | 16.3.3 | App Router, API Routes, SSR, Turbopack |
| Language | TypeScript | 7.0.2 | Type-safe full-stack development |
| React | React | 19.2.8 | UI component library |
| Bundler | Turbopack | Built-in | Next.js 16 native bundler |

### 3.2 Database & Backend
| Component | Technology | Purpose |
|---|---|---|
| Database | Neon Serverless PostgreSQL | Primary data store (trips, expenses, events, users) |
| DB Driver | `@neondatabase/serverless` v1.1.0 | HTTP-based serverless Postgres client |
| Auth JWT | `jose` v6.2.12 | HS256-signed JWT session tokens |
| Password | `bcryptjs` v3.0.3 | Bcrypt password hashing (10 rounds) |
| Email | `resend` v6.28.1 | Transactional email (OTP verification, trip invites) |

### 3.3 Frontend Libraries
| Library | Version | Purpose |
|---|---|---|
| Tailwind CSS | 3.4.19 | Utility-first CSS framework |
| Lucide React | 1.37.0 | 1000+ SVG icon library |
| Motion (Framer) | 13.1.1 | Page transitions and micro-animations |
| Anime.js | 4.5.0 | Complex animation sequences |
| COBE | 2.0.1 | Interactive 3D globe on landing page |
| Three.js | 0.185.1 | WebGL 3D rendering engine |
| clsx | 2.1.1 | Conditional className utility |
| tailwind-merge | 3.6.0 | Smart Tailwind class merging |

### 3.4 Google OAuth
| Library | Purpose |
|---|---|
| `@react-oauth/google` v0.13.5 | Google Sign-In button and credential response |

---

## 4. Project Architecture

```
+-------------------------------------------------------------+
|                     CLIENT (Browser)                        |
|  +-------------+  +--------------+  +------------------+   |
|  | LandingPage |  |  AuthModal   |  |  DashboardShell  |   |
|  |  (3D Globe) |  | (Login/OTP)  |  |  (Tab Router)    |   |
|  +-------------+  +--------------+  +------------------+   |
|          |                 |                  |              |
|          v                 v                  v              |
|  +------------------------------------------------------+  |
|  |              page.tsx - Central Orchestrator           |  |
|  |  State: trips, participants, expenses, payments,      |  |
|  |         events, bookings, vendors, refunds            |  |
|  |  Engine: ledger-engine.ts (pure math functions)       |  |
|  +------------------------------------------------------+  |
|                            |                                |
+----------------------------+---------------------------------+
|                     SERVER (Next.js API Routes)             |
|  +---------+  +----------+  +----------+  +-------------+  |
|  |/api/auth|  |/api/trips|  |/api/     |  |/api/ai/     |  |
|  | login   |  | CRUD     |  |expenses  |  |parse-expense|  |
|  | register|  | join     |  |          |  |explain-     |  |
|  | verify  |  |          |  |          |  |balance      |  |
|  | google  |  |          |  |          |  |             |  |
|  | logout  |  |          |  |          |  |             |  |
|  +---------+  +----------+  +----------+  +-------------+  |
|                            |                                |
+----------------------------+---------------------------------+
|                     INFRASTRUCTURE                          |
|  +--------------+  +--------------+  +------------------+   |
|  | Neon Postgres|  |  Resend API  |  |  Google OAuth    |   |
|  | (us-east-2)  |  |  (Email)     |  |  (Identity)      |  |
|  +--------------+  +--------------+  +------------------+   |
+-------------------------------------------------------------+
```

### Architecture Highlights
- **Monolith with API Routes**: Single Next.js deployment serves both frontend and backend.
- **Serverless DB**: Neon PostgreSQL uses HTTP-based connections — no persistent connection pool needed.
- **Edge-Compatible**: All API routes are compatible with Vercel Edge Functions.
- **Client-Heavy State**: `page.tsx` (2,355 lines) is the central orchestrator holding all domain state in React `useState` hooks, with `useEffect` for syncing to/from the database.

---

## 5. Directory Structure

```
hackcelestial/
|-- .env.local                    # Environment variables (secrets)
|-- .env.example                  # Template for env setup
|-- package.json                  # Dependencies & scripts
|-- tailwind.config.js            # Tailwind CSS theme extension
|-- postcss.config.js             # PostCSS plugins
|-- tsconfig.json                 # TypeScript configuration
|-- next.config.js                # Next.js configuration
|-- SYSTEM_KNOWLEDGE_BASE.md      # Internal system reference
|-- PROJECT_DOCUMENTATION.md      # This file
|
|-- db/
|   +-- schema.sql                # PostgreSQL DDL (tables, indexes)
|
|-- public/
|   |-- tulis-icon.png            # App favicon & email logo
|   |-- tulis-logo.png            # Full wordmark logo
|   |-- tulis-full.png            # Complete brand mark
|   |-- tulis-icon-transparent.png# Transparent icon variant
|   +-- images/                   # Additional static assets
|
+-- src/
    |-- app/
    |   |-- layout.tsx            # Root HTML layout, metadata, fonts
    |   |-- page.tsx              # Main app orchestrator (2,355 lines)
    |   |-- globals.css           # Design system tokens & base styles
    |   +-- api/
    |       |-- auth/
    |       |   |-- route.ts      # Email login, register, OTP verify, logout
    |       |   +-- google/
    |       |       +-- route.ts  # Google OAuth callback handler
    |       |-- trips/
    |       |   |-- route.ts      # Trip CRUD (create, list, update)
    |       |   +-- join/
    |       |       +-- route.ts  # Join trip via invite code
    |       |-- expenses/
    |       |   +-- route.ts      # Expense persistence
    |       |-- events/
    |       |   +-- route.ts      # Event log queries
    |       +-- ai/
    |           |-- parse-expense/
    |           |   +-- route.ts  # NL to structured expense parsing
    |           +-- explain-balance/
    |               +-- route.ts  # AI balance explanation
    |
    |-- components/               # 47 React components
    |   |-- AuthModal.tsx         # Login / Register / OTP verification
    |   |-- LandingPage.tsx       # Hero with 3D globe & features
    |   |-- DashboardShell.tsx    # Tab navigation shell
    |   |-- OverviewSection.tsx   # Financial overview dashboard
    |   |-- ExpensesSection.tsx   # Expense list & management
    |   |-- ParticipantsSection.tsx  # Member roster
    |   |-- ItineraryGraph.tsx    # Timeline/Gantt visualization
    |   |-- SettlementVisualizer.tsx # Debt graph & settlements
    |   |-- ActivityLogSection.tsx   # Event timeline
    |   |-- DynamicSplitDrawer.tsx   # Expense split configurator
    |   |-- CreateTripModal.tsx      # New trip creation form
    |   |-- JoinTripModal.tsx        # Join via invite code
    |   |-- ShareTripModal.tsx       # Share invite code/link
    |   |-- ChatExpenseModal.tsx     # Natural language expense entry
    |   |-- WhatIfSimulatorModal.tsx # Dry-run financial scenarios
    |   |-- ... (and 32 more)
    |   +-- ui/                   # Primitive UI components
    |
    +-- lib/
        |-- types.ts              # 300 lines of TypeScript interfaces
        |-- db.ts                 # Neon PostgreSQL client & query helpers
        |-- auth-service.ts       # JWT, bcrypt, OTP, Google token verification
        |-- email-service.ts      # Resend email templates (OTP + Trip Invite)
        |-- ledger-engine.ts      # 1,391 lines - the math brain
        |-- mock-data.ts          # Demo trip seed data
        |-- user-store.ts         # User authentication & demo accounts
        +-- motion.ts             # Framer Motion animation presets
```

---

## 6. Database Schema & Data Model

Tulis uses **Neon Serverless PostgreSQL** as the single source of truth. The schema follows a normalized relational design with foreign key constraints and cascade deletions.

### 6.1 Entity-Relationship Diagram

```mermaid
erDiagram
    TRIPS ||--o{ PARTICIPANTS : has
    TRIPS ||--o{ BOOKINGS : contains
    TRIPS ||--o{ EXPENSES : tracks
    TRIPS ||--o{ PAYMENTS : records
    TRIPS ||--o{ EVENTS : logs
    BOOKINGS ||--o{ BOOKING_PARTICIPANTS : includes
    PARTICIPANTS ||--o{ BOOKING_PARTICIPANTS : joins
    EXPENSES ||--o{ EXPENSE_ALLOCATIONS : splits_into
    PARTICIPANTS ||--o{ EXPENSE_ALLOCATIONS : owes
    PARTICIPANTS ||--o{ EXPENSES : pays
    PARTICIPANTS ||--o{ PAYMENTS : sends
    PARTICIPANTS ||--o{ PAYMENTS : receives
```

### 6.2 Table Definitions

#### `trips` — The Trip Entity
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PK | Unique trip identifier (e.g., `trip-1`) |
| `title` | VARCHAR(255) | NOT NULL | Trip name (e.g., "Goa Squad Trip 2026") |
| `destination` | VARCHAR(255) | NOT NULL | Destination city/country |
| `base_currency` | VARCHAR(10) | DEFAULT 'USD' | Default currency for the trip |
| `start_date` | DATE | NOT NULL | Trip start date |
| `end_date` | DATE | NOT NULL | Trip end date |
| `budget_ceiling` | NUMERIC(12,2) | DEFAULT 0.00 | Maximum budget limit |
| `invite_code` | VARCHAR(10) | UNIQUE | 6-character uppercase join code |
| `organizer_id` | VARCHAR(64) | FK to participants | Creator's participant ID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

#### `participants` — Trip Members
| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR(64) PK | Unique participant ID |
| `trip_id` | VARCHAR(64) FK to trips | Associated trip |
| `name` | VARCHAR(255) | Display name |
| `email` | VARCHAR(255) | Email address (used for trip scoping) |
| `avatar_url` | TEXT | Profile picture URL |
| `is_organizer` | BOOLEAN | Whether this participant created the trip |
| `status` | VARCHAR(32) | `active` or `removed` |
| `upi_id` | VARCHAR(255) | UPI VPA for settlements |
| `weight` | NUMERIC | Custom weight for weighted splits |
| `room_tier` | VARCHAR(32) | `suite`, `standard`, or `economy` |

#### `bookings` — Itinerary Items
| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR(64) PK | Booking identifier |
| `trip_id` | VARCHAR(64) FK to trips | Parent trip |
| `category` | VARCHAR(32) | `transport`, `lodging`, `activity`, `food`, `other` |
| `title` | VARCHAR(255) | Booking name |
| `vendor` | VARCHAR(255) | Vendor/provider name |
| `start_time` | TIMESTAMPTZ | Check-in / departure time |
| `end_time` | TIMESTAMPTZ | Check-out / arrival time |
| `estimated_cost` | NUMERIC(12,2) | Pre-trip estimate |
| `actual_cost` | NUMERIC(12,2) | Post-trip actual cost |
| `status` | VARCHAR(32) | `confirmed`, `pending`, `cancelled` |

#### `expenses` — Financial Line Items
| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR(64) PK | Expense identifier |
| `trip_id` | VARCHAR(64) FK to trips | Parent trip |
| `booking_id` | VARCHAR(64) FK to bookings | Linked booking (nullable) |
| `title` | VARCHAR(255) | Expense description |
| `total_amount` | NUMERIC(12,2) | Total amount |
| `currency` | VARCHAR(10) | Currency code |
| `split_method` | VARCHAR(32) | `equal`, `weighted`, `line_item`, `room_tier`, `organizer_subsidy`, `manual` |
| `paid_by_id` | VARCHAR(64) FK to participants | Who paid |
| `category` | VARCHAR(32) | Expense category |
| `receipt_url` | TEXT | Uploaded receipt image URL |
| `subsidy_amount` | NUMERIC(12,2) | Organizer subsidy (if applicable) |
| `paid_by_splits` | JSONB | Multi-payer splits (JSON) |

#### `expense_allocations` — Per-Participant Splits
| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR(64) PK | Allocation ID |
| `expense_id` | VARCHAR(64) FK to expenses | Parent expense |
| `participant_id` | VARCHAR(64) FK to participants | Who owes |
| `amount_owed` | NUMERIC(12,2) | Exact amount owed |
| `notes` | TEXT | Optional note |

#### `payments` — Settlements Between Participants
| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR(64) PK | Payment identifier |
| `trip_id` | VARCHAR(64) FK to trips | Parent trip |
| `payer_id` | VARCHAR(64) FK to participants | Who sent money |
| `payee_id` | VARCHAR(64) FK to participants | Who received money |
| `amount` | NUMERIC(12,2) | Settlement amount |
| `note` | TEXT | Payment note |

#### `events` — Immutable Audit Log
| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR(64) PK | Event identifier |
| `trip_id` | VARCHAR(64) FK to trips | Parent trip |
| `event_type` | VARCHAR(64) | Event enum (see below) |
| `payload_json` | JSONB | Structured event payload |
| `actor_id` | VARCHAR(64) | Who triggered the event |
| `sequence_num` | BIGSERIAL | Monotonically increasing sequence |

### 6.3 Event Types (33 Total)
| Event Type | Trigger |
|---|---|
| `TRIP_CREATED` | New trip created |
| `PARTICIPANT_ADDED` | Member joins the trip |
| `PARTICIPANT_REMOVED` | Member removed from trip |
| `BOOKING_CREATED` | New booking added |
| `BOOKING_MODIFIED` | Booking details updated |
| `BOOKING_CANCELLED` | Booking cancelled (triggers refund) |
| `EXPENSE_LOGGED` | New expense recorded |
| `EXPENSE_CORRECTED` | Expense amount or split amended |
| `REFUND_CREDITED` | Refund processed from cancellation |
| `PAYMENT_RECORDED` | Settlement payment logged |
| `PAYMENT_CONFIRMED` | Payment verified |
| `PAYMENT_DISPUTED` | Payment disputed by recipient |
| `ALLOCATION_DISPUTED` | Participant disputes their share |
| `ALLOCATION_DISPUTE_RESOLVED` | Dispute marked as resolved |
| `ANOMALY_FLAGGED` | System detects a financial anomaly |
| `ANOMALY_DISMISSED` | User dismisses an anomaly |
| `BUDGET_CEILING_SET` | Trip budget ceiling updated |
| `VARIANCE_THRESHOLD_BREACHED` | Actual cost deviates significantly from estimate |
| `SETTLEMENT_SIMPLIFIED` | Debt simplification recalculated |
| `SETTLEMENT_CONFIRMED` | Final settlement marked done |
| `USER_LOGGED_IN` | User authentication event |
| `UPI_SETUP_UPDATED` | UPI ID or QR code updated |
| `TRIP_JOINED_VIA_CODE` | User joined via 6-char invite code |
| `SQUAD_CREATED` | Squad (reusable group) created |
| `SQUAD_MEMBER_LINKED` | Squad member linked to trip |
| `DEBT_REASSIGNED` | Debt transferred to another participant |
| `DEBT_REASSIGNMENT_ACCEPTED` | Reassignment accepted |
| `DEBT_REASSIGNMENT_REJECTED` | Reassignment rejected |
| `REMINDER_SENT` | Payment nudge/reminder sent |
| `ITINERARY_CONFLICT_FLAGGED` | Schedule conflict detected |
| `ITINERARY_CONFLICT_DISMISSED` | Conflict dismissed by user |
| `OFFLINE_COMMAND_SYNCED` | Offline-queued action synced to server |

### 6.4 Indexes
```sql
CREATE INDEX idx_events_trip_seq    ON events(trip_id, sequence_num);
CREATE INDEX idx_expenses_trip      ON expenses(trip_id);
CREATE INDEX idx_participants_trip   ON participants(trip_id);
```

---

## 7. Authentication & Security

Tulis implements a multi-layer authentication system with JWT sessions, email-based OTP verification, and Google OAuth.

### 7.1 Authentication Flow

```mermaid
graph TD
    A["User visits Tulis"] --> B{"Has Session Cookie?"}
    B -->|Yes| C["Verify JWT via jose"]
    C -->|Valid| D["Load Dashboard"]
    C -->|Expired/Invalid| E["Show Auth Modal"]
    B -->|No| E

    E --> F{"Auth Method?"}
    F -->|Email/Password| G["POST /api/auth action=login"]
    F -->|Register| H["POST /api/auth action=register"]
    F -->|Google| I["POST /api/auth/google"]

    G --> J{"Credentials Valid?"}
    J -->|Yes| K["Send OTP Email via Resend"]
    K --> L["User enters 6-digit OTP"]
    L --> M["POST /api/auth action=verify-otp"]
    M --> N["Set tulis_session Cookie"]
    N --> D

    H --> O["Hash Password with bcrypt"]
    O --> P["Insert into users table"]
    P --> K

    I --> Q["Verify Google ID Token"]
    Q --> R["Upsert User in DB"]
    R --> N
```

### 7.2 Session Management
| Detail | Implementation |
|---|---|
| **Token Format** | JWT (HS256) signed with `SESSION_SECRET` |
| **Token Library** | `jose` v6.2.12 |
| **Token Lifetime** | 30 days |
| **Cookie Name** | `tulis_session` |
| **Cookie Flags** | HttpOnly, Secure, SameSite=Lax, Path=/ |
| **Payload Fields** | `id`, `name`, `email`, `avatar`, `role`, `upiId`, `emailVerified` |

### 7.3 Password Security
- **Hashing**: bcrypt with 10 salt rounds
- **Library**: `bcryptjs` v3.0.3
- **Comparison**: `bcrypt.compare()` for secure timing-safe comparison

### 7.4 OTP Verification
- **Format**: 6-digit numeric code (100000-999999)
- **Generation**: `Math.floor(100000 + Math.random() * 900000)`
- **Delivery**: Resend transactional email with branded Tulis template
- **Expiration**: 15 minutes (server-side expiry check)
- **Storage**: Server-side `pendingOtpStore` Map keyed by email

### 7.5 Google OAuth
- **Library**: `@react-oauth/google` (frontend) + custom `verifyGoogleToken()` (backend)
- **Verification**: Google `oauth2.googleapis.com/tokeninfo` endpoint
- **User Upsert**: On first Google sign-in, creates user record in `users` table
- **Session**: Same JWT cookie flow as email login (no separate OTP required for Google)

### 7.6 Trip-Level Access Control
After authentication, trips are scoped to the user via:
1. **Organizer Match**: `trips.organizer_id = userId`
2. **Trip Member Match**: `trip_members.user_id = userId`
3. **Participant Email Match**: `participants.email = userEmail`

The `getUserAccessibleTrips()` function in `auth-service.ts` enforces this scoping with a `DISTINCT` SQL query across all three join paths.

---

## 8. Core Ledger Engine — The Math Brain

The heart of Tulis is `ledger-engine.ts` — a **1,391-line pure-function financial computation module** with zero side effects. It contains 17 exported functions:

### 8.1 Function Reference

| Function | Lines | Purpose |
|---|---|---|
| `calculateSplits()` | 28-170 | Computes per-participant allocations using the chosen split method |
| `recalculateExpenseAllocations()` | 175-213 | Re-derives all allocations when roster changes |
| `computeNetBalances()` | 215-337 | Calculates `totalPaid - totalOwed` for each participant |
| `computeReconciliationAudit()` | 339-373 | Verifies the zero-sum invariant across the entire trip |
| `processBookingCancellation()` | 375-421 | Handles booking cancellation with refund policy logic |
| `simplifyDebts()` | 423-472 | Minimizes the number of settlements using a greedy algorithm |
| `calculateVariance()` | 474-507 | Computes estimated vs. actual cost variance per booking |
| `simulateDryRun()` | 509-623 | "What-if" simulation — preview financial impact before committing |
| `detectAnomalies()` | 625-780 | Flags schedule conflicts, budget variance, roster mismatches |
| `explainParticipantBalance()` | 782-922 | Generates a human-readable breakdown of any participant's balance |
| `optimizeRoomAllocations()` | 924-980 | Suggests optimal room assignments to minimize cost |
| `checkDuplicateExpense()` | 982-1024 | Detects near-duplicate expenses (amount + time proximity) |
| `suggestSplitMethod()` | 1026-1081 | Recommends the optimal split method based on expense characteristics |
| `checkItineraryFeasibility()` | 1083-1159 | Validates itinerary for transit overlaps and schedule conflicts |
| `parseNaturalChatExpense()` | 1161-1238 | Parses free-text chat messages into structured expense objects |
| `netCrossTripSquadBalances()` | 1240-1325 | Nets balances across multiple trips for recurring squads |
| `generateAccountingExportCSV()` | 1327-1391 | Exports trip financials as a CSV string |

### 8.2 Split Method Details

#### Equal Split
```
share = floor((total / N) * 100) / 100
remainder_cents = round((total - share * N) * 100)
// First `remainder_cents` participants get +0.01
```

#### Weighted Split
```
weight_i = custom_weight or participant.weight or 1
share_i = total * (weight_i / sum_of_all_weights)
// Last participant absorbs rounding residual
```

#### Line-Item Split
Participants specify their exact per-item amounts. If the sum doesn't match the total, shares are scaled proportionally.

#### Room-Tier Split
| Tier | Multiplier |
|---|---|
| Suite | 1.4x |
| Standard | 1.0x |
| Economy | 0.8x |

#### Organizer Subsidy
```
allocatable = max(0, total - subsidyAmount)
// Split `allocatable` equally among all participants
// Organizer absorbs `subsidyAmount` upfront
```

#### Manual Split
Direct per-participant amount entry. Falls back to equal if no values provided.

### 8.3 Debt Simplification Algorithm
The `simplifyDebts()` function uses a **greedy min-max matching** algorithm:
1. Separate participants into **creditors** (net positive) and **debtors** (net negative).
2. Sort creditors descending, debtors ascending by absolute balance.
3. Match the largest debtor with the largest creditor.
4. The transfer amount is `min(|debtor.balance|, creditor.balance)`.
5. Update balances and repeat until all settled.
6. This minimizes the total number of transactions (optimal for small groups).

### 8.4 Reconciliation Audit
The `computeReconciliationAudit()` function validates the **zero-sum invariant**:
```
netIncurred = totalExpenses - totalRefunds - totalSubsidies
discrepancy = |sum of all netBalances|
isReconciled = discrepancy < 0.01
```

### 8.5 Anomaly Detection Engine
The `detectAnomalies()` function scans for 5 anomaly types:
| Type | Severity | Detection Logic |
|---|---|---|
| `SCHEDULE_CONFLICT` | High | Overlapping booking time ranges for same participants |
| `ROOM_OVERCAPACITY` | Medium | More participants assigned to a room than `roomCapacity` |
| `BUDGET_VARIANCE` | Medium/High | Actual-to-estimated cost deviation exceeds 20% |
| `ROSTER_MISMATCH` | Medium | Expense allocated to removed/inactive participants |
| `ALLOCATION_MISMATCH` | High | Sum of allocations does not equal expense total amount |

---

## 9. Features — Built & Functional

### 9.1 Authentication & Identity
| Feature | Description | Status |
|---|---|---|
| Email + Password Registration | Create account with name, email, password | Built |
| Email OTP Verification | 6-digit code sent via Resend branded email | Built |
| Google OAuth Sign-In | One-click Google login with token verification | Built |
| JWT Session Cookies | 30-day HttpOnly cookies with HS256 signing | Built |
| Session Persistence | Auto-restore session on page reload via `/api/auth?action=me` | Built |
| Logout | Cookie deletion + state reset | Built |

### 9.2 Trip Management
| Feature | Description | Status |
|---|---|---|
| Create Trip | Set title, destination, dates, budget, currency | Built |
| 6-Char Invite Code | Auto-generated uppercase code (e.g., `GOA2K6`) | Built |
| Join via Code | Enter invite code to join existing trip | Built |
| Trip Switching | Switch between multiple trips in a session | Built |
| Trip Scoping | Dashboard only shows trips associated with your email | Built |
| Empty State UX | Beautiful "no trips" view with CTA to create or join | Built |
| Share Trip | Copy invite code/link, send email invitations | Built |

### 9.3 Expense Management
| Feature | Description | Status |
|---|---|---|
| Log Expense | Title, amount, category, payer, split method | Built |
| 6 Split Methods | Equal, Weighted, Line-Item, Room-Tier, Subsidy, Manual | Built |
| Dynamic Split Drawer | Full-screen split configuration with live preview | Built |
| Multi-Payer Support | Split the payment itself across multiple people | Built |
| Receipt Upload | Attach receipt images to expenses | Built |
| Category Tagging | transport, lodging, activity, food, general, other | Built |
| Duplicate Detection | Flags similar amount + timeframe expenses | Built |
| Chat-Based Entry | Natural language to structured expense parsing | Built |
| Expense Correction | Edit amount/split after creation | Built |

### 9.4 Financial Settlement
| Feature | Description | Status |
|---|---|---|
| Net Balance Computation | Per-participant `paid - owed` with surplus/deficit status | Built |
| Debt Simplification | Greedy min-max algorithm to minimize transactions | Built |
| Zero-Sum Reconciliation | Mathematical proof that all balances sum to zero | Built |
| Settlement Visualization | Interactive debt graph with directional arrows | Built |
| UPI QR Code Payments | Generate and scan QR codes for instant UPI settlement | Built |
| UPI Deep Links | `upi://pay?` deep links for mobile payment apps | Built |
| Payment Recording | Log settlements with payer/payee/amount | Built |
| Payment Disputes | Dispute a recorded payment | Built |
| Allocation Disputes | Dispute your share of an expense | Built |

### 9.5 Booking & Itinerary
| Feature | Description | Status |
|---|---|---|
| Add Booking | Transport, lodging, activity, food with time ranges | Built |
| Booking Edit | Modify booking details after creation | Built |
| Booking Cancellation | Cancel with refund policy (full/partial/per-head/non-refundable) | Built |
| Refund Processing | Auto-generates refund event and credit back to payer | Built |
| Itinerary Timeline | Visual timeline/Gantt chart of all bookings | Built |
| Schedule Conflict Detection | Flags overlapping bookings for same participants | Built |
| Vendor Management | Track vendors with contact info and spend totals | Built |
| Variance Tracking | Estimated vs. actual cost comparison | Built |

### 9.6 Participants & Squads
| Feature | Description | Status |
|---|---|---|
| Add/Remove Participants | Dynamic roster management | Built |
| Room Tier Assignment | Suite (1.4x), Standard (1.0x), Economy (0.8x) | Built |
| Custom Weights | Per-participant weight for weighted splits | Built |
| UPI Setup | Per-participant UPI VPA + custom QR code upload | Built |
| Squad Templates | Reusable groups for recurring trips | Built |
| Cross-Trip Netting | Net balances across multiple trips for same squad | Built |
| Debt Reassignment | Transfer debt from one participant to another | Built |

### 9.7 Intelligence & Automation
| Feature | Description | Status |
|---|---|---|
| Anomaly Detection | 5-type anomaly scanner (schedule, budget, roster, allocation) | Built |
| What-If Simulator | Dry-run financial scenarios before committing | Built |
| Split Method Suggestion | AI recommends optimal split based on expense type | Built |
| Balance Explainer | AI-generated narrative of why a participant owes/is owed | Built |
| Room Optimizer | Suggests optimal room assignments to minimize cost | Built |
| Chat Expense Parser | NLP parsing of "Aman paid 500 for dinner" to structured expense | Built |
| Budget Alert System | Alerts when spending approaches or exceeds budget ceiling | Built |

### 9.8 Activity & Audit
| Feature | Description | Status |
|---|---|---|
| Event-Sourced Timeline | Every action logged as an immutable event | Built |
| Actor Attribution | Every event records who triggered it | Built |
| Sequence Numbers | Monotonic ordering of events per trip | Built |
| Settlement Report | Exportable final settlement summary | Built |
| Accounting CSV Export | Full expense breakdown as downloadable CSV | Built |

### 9.9 UX & Design
| Feature | Description | Status |
|---|---|---|
| Landing Page | 3D globe (COBE/Three.js) with feature showcase | Built |
| Dark Mode | Full dark theme with emerald/sage green accents | Built |
| Light Mode | Neumorphic light theme with dual shadows | Built |
| Responsive Design | Mobile-first responsive layout | Built |
| Micro-Animations | Framer Motion page transitions and hover effects | Built |
| Glassmorphism | Frosted glass effects on modals and cards | Built |
| Tab Navigation | Overview, Expenses, Itinerary, Participants, Settlement, Activity | Built |
| Count-Up Animations | Animated currency amounts on dashboard load | Built |
| Offline Queue | Log expenses offline, auto-sync when reconnected | Built |

---

## 10. API Reference

### 10.1 Authentication Routes (`/api/auth`)

| Method | Action | Parameters | Response |
|---|---|---|---|
| `GET` | `?action=me` | — | Current session user + accessible trips |
| `POST` | `action=register` | `name`, `email`, `password` | Creates user, sends OTP email |
| `POST` | `action=login` | `email`, `password` | Validates credentials, sends OTP email |
| `POST` | `action=verify-otp` | `email`, `otp` | Verifies OTP, sets session cookie |
| `POST` | `action=logout` | — | Deletes session cookie |
| `POST` | `action=resend-otp` | `email` | Re-sends OTP email |

### 10.2 Google OAuth (`/api/auth/google`)

| Method | Parameters | Response |
|---|---|---|
| `POST` | `credential` (Google ID Token) | Upserts user, sets session cookie |

### 10.3 Trip Routes (`/api/trips`)

| Method | Action | Parameters | Response |
|---|---|---|---|
| `GET` | — | — | All trips accessible to authenticated user |
| `POST` | `action=create` | Trip object + participants | Creates trip + participants in Neon |
| `POST` | `action=save-expense` | Expense object | Persists expense with allocations |
| `POST` | `action=save-booking` | Booking object | Persists booking to Neon |
| `POST` | `action=update-booking` | `bookingId`, `status`, refund details | Updates booking status |
| `POST` | `action=save-refund` | Refund object | Records refund event |
| `POST` | `action=add-participant` | `tripId`, participant data | Adds participant to existing trip |
| `POST` | `action=record-payment` | Payment object | Records settlement payment |
| `POST` | `action=log-event` | Event data | Logs event to audit trail |

### 10.4 Join Trip (`/api/trips/join`)

| Method | Parameters | Response |
|---|---|---|
| `POST` | `inviteCode`, `userId`, `userName`, `userEmail` | Finds trip by code, adds user as participant |

### 10.5 Expenses (`/api/expenses`)

| Method | Parameters | Response |
|---|---|---|
| `GET` | `?tripId=xxx` | All expenses with allocations for the trip |

### 10.6 Events (`/api/events`)

| Method | Parameters | Response |
|---|---|---|
| `GET` | `?tripId=xxx` | Event log ordered by sequence number |

### 10.7 AI Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/ai/parse-expense` | `POST` | Natural language to structured `ParsedChatExpense` |
| `/api/ai/explain-balance` | `POST` | Generate human-readable balance explanation |

---

## 11. Frontend Component Inventory

Tulis contains **47 React components** + primitive UI elements. Here is the complete inventory:

### 11.1 Core Application Components
| Component | Size | Responsibility |
|---|---|---|
| `LandingPage.tsx` | ~42KB | Hero section with 3D globe, feature cards, CTA |
| `DashboardShell.tsx` | ~31KB | Tab navigation, header bar, sidebar, trip context |
| `OverviewSection.tsx` | ~44KB | Financial KPIs, spend charts, budget progress |
| `ExpensesSection.tsx` | ~16KB | Expense list, filters, sort, category badges |
| `ParticipantsSection.tsx` | ~13KB | Participant roster, weight/tier config, UPI setup |
| `ItineraryGraph.tsx` | ~17KB | Timeline/Gantt chart of bookings |
| `SettlementVisualizer.tsx` | ~22KB | Debt graph, simplified settlements, UPI payments |
| `ActivityLogSection.tsx` | ~14KB | Chronological event timeline with filters |

### 11.2 Modal Components
| Component | Purpose |
|---|---|
| `AuthModal.tsx` | Login, Register, OTP entry (25KB) |
| `CreateTripModal.tsx` | New trip form with destination/dates/currency |
| `JoinTripModal.tsx` | Enter 6-char invite code to join |
| `ShareTripModal.tsx` | Copy invite code, email invitation |
| `AddBookingModal.tsx` | Create new booking/itinerary item |
| `EditBookingModal.tsx` | Modify existing booking |
| `CancelBookingModal.tsx` | Cancel booking with refund policy selection |
| `ChatExpenseModal.tsx` | Natural language expense entry (22KB) |
| `WhatIfSimulatorModal.tsx` | Dry-run financial scenarios (18KB) |
| `DynamicSplitDrawer.tsx` | Full-screen split configurator (33KB) |
| `ExplainBalanceModal.tsx` | AI balance explanation viewer |
| `SettlementReportModal.tsx` | Final settlement summary export |
| `RoomOptimizerModal.tsx` | Room assignment optimization |
| `SquadManagerModal.tsx` | Squad create/manage |
| `DebtReassignmentModal.tsx` | Transfer debt between participants |
| `NudgeReminderModal.tsx` | Send payment nudge/reminder |
| `DuplicateExpenseWarningModal.tsx` | Duplicate expense confirmation |
| `DashboardAccessModal.tsx` | Trip access control |
| `TripSwitcherModal.tsx` | Switch between trips |
| `TripAccessGateModal.tsx` | Trip-level auth gate |
| `ChaosDemoModal.tsx` | Demo mode stress-test |
| `AccountSwitcherModal.tsx` | Multi-account switching |
| `MyTripsModal.tsx` | User's trip list |
| `UpiSetupModal.tsx` | UPI VPA and QR code setup |
| `UpiQrModal.tsx` | Display UPI QR code for scanning |
| `VendorSummaryModal.tsx` | Vendor spend analysis |

### 11.3 Visualization Components
| Component | Purpose |
|---|---|
| `SpendDonutChart.tsx` | Category-based spend distribution donut chart |
| `ParticipantBarChart.tsx` | Per-participant spend comparison bar chart |
| `TripVibeGauge.tsx` | Trip "health" indicator gauge |
| `CountUpMoney.tsx` | Animated currency counter |
| `ReconciliationAuditCard.tsx` | Zero-sum verification card |
| `AnomalyFeedBanner.tsx` | Anomaly alert banner |
| `SpotlightCard.tsx` | Highlighted stat card |

### 11.4 Visual & Branding Components
| Component | Purpose |
|---|---|
| `LiquidShaderGradient.tsx` | WebGL animated gradient background |
| `LiquidLogo.tsx` | Animated liquid-morph Tulis logo |
| `LiquidGlassButton.tsx` | Glassmorphism CTA button |
| `UserAvatar.tsx` | Profile avatar with fallback initials |
| `GoogleAuthProvider.tsx` | Google OAuth context wrapper |
| `OfflineQueueIndicator.tsx` | Offline sync status indicator |

---

## 12. Design System

### 12.1 Color Tokens

#### Dark Mode (Default)
| Token | Value | Usage |
|---|---|---|
| `--color-page` | `#121620` | Page background |
| `--color-surface-base` | `#121620` | Base surface |
| `--color-surface-raised` | `#1A202C` | Elevated cards |
| `--color-surface-overlay` | `#222938` | Modal backgrounds |
| `--color-surface-inset` | `#0D1018` | Recessed areas |
| `--color-brand-primary` | `#10B981` | Emerald accent |
| `--color-brand-primary-dim` | `#059669` | Dimmed emerald |
| `--color-ledger-surplus` | `#10B981` | Positive balance (green) |
| `--color-ledger-deficit` | `#F43F5E` | Negative balance (red) |

#### Light Mode (Neumorphic)
| Token | Value | Usage |
|---|---|---|
| `--color-page` | `#EBF1F6` | Soft gray page |
| `--color-surface-raised` | `#F6FAFE` | Near-white cards |
| `--neu-flat` | Dual shadow | Neumorphic elevation |
| `--neu-pressed` | Inset dual shadow | Pressed/active state |

### 12.2 Typography
| Family | Weight Range | Usage |
|---|---|---|
| **Inter** | 300-800 | All UI text, headings, body |
| **JetBrains Mono** | 400-700 | Currency amounts, codes, OTP inputs |

### 12.3 Tailwind Extensions
Custom Tailwind utilities defined in `tailwind.config.js`:
- **Colors**: `surface-*`, `ink-*`, `brand-*`, `ledger-*`, `accent-*`
- **Shadows**: `shadow-paper`, `shadow-mint`, `shadow-subtle`, `shadow-glass`, `shadow-card`
- **Fonts**: `font-sans` (Inter), `font-numeric` (JetBrains Mono)

### 12.4 Email Template Design
Both email templates (OTP verification and trip invite) follow the Tulis brand:
- Dark background (`#0A0D08`)
- Emerald gradient bar at top (`#2D6A4F` to `#5FA97D` to `#84CC16`)
- Official Tulis icon from GitHub CDN
- Monospace OTP code display
- Feature highlight cards
- Consistent footer with copyright

---

## 13. Email & Notification System

### 13.1 Provider
| Detail | Value |
|---|---|
| **Provider** | Resend (resend.com) |
| **Library** | `resend` v6.28.1 |
| **From Address** | `Tulis <onboarding@resend.dev>` |
| **Logo CDN** | GitHub raw content (public/tulis-icon.png) |

### 13.2 Email Templates

#### Verification OTP Email
- **Subject**: `{OTP} is your Tulis verification code`
- **Content**: 6-digit code in monospace, 15-minute expiry, security features list
- **Design**: Dark mode, emerald gradient, Tulis logo, professional layout

#### Trip Invitation Email
- **Subject**: `{Inviter} invited you to join "{Trip}" on Tulis`
- **Content**: Invite code, CTA button to join, trip details
- **Design**: Same branded dark-mode template with "Join Trip and View Ledger" CTA

---

## 14. Workflow & User Journey

### 14.1 New User Journey

```mermaid
graph LR
    A["Visit Tulis"] --> B["Landing Page"]
    B --> C["Click Get Started"]
    C --> D["Auth Modal"]
    D --> E["Register with Email"]
    E --> F["Receive OTP Email"]
    F --> G["Enter OTP Code"]
    G --> H["Dashboard - Empty State"]
    H --> I{"Create or Join?"}
    I -->|Create| J["Create Trip Form"]
    I -->|Join| K["Enter Invite Code"]
    J --> L["Dashboard with Trip"]
    K --> L
```

### 14.2 Expense Logging Flow

```mermaid
graph TD
    A["Click + Add Expense"] --> B["Enter Title and Amount"]
    B --> C["Select Category"]
    C --> D["Choose Payer"]
    D --> E["Select Split Method"]
    E --> F{"Method?"}
    F -->|Equal| G["Auto-calculate equal shares"]
    F -->|Weighted| H["Set per-person weights"]
    F -->|Line-Item| I["Enter per-person amounts"]
    F -->|Room-Tier| J["Apply tier multipliers"]
    F -->|Subsidy| K["Set organizer subsidy amount"]
    F -->|Manual| L["Direct amount entry"]
    G --> M["Review Allocations"]
    H --> M
    I --> M
    J --> M
    K --> M
    L --> M
    M --> N["Confirm and Log"]
    N --> O["Expense saved to Neon"]
    N --> P["Event logged to audit trail"]
    N --> Q["Balances recalculated"]
    N --> R["Anomaly scan triggered"]
```

### 14.3 Settlement Flow

```mermaid
graph TD
    A["Open Settlement Tab"] --> B["View Net Balances"]
    B --> C["Simplified Debt Graph"]
    C --> D["Click Pay on a debt"]
    D --> E{"Payment Method"}
    E -->|UPI QR| F["Show QR Code"]
    E -->|UPI Link| G["Open upi://pay deep link"]
    E -->|Manual| H["Enter payment details"]
    F --> I["Record Payment"]
    G --> I
    H --> I
    I --> J["Payment logged to Neon"]
    I --> K["Debts recalculated"]
```

---

## 15. State Management

Tulis uses **React `useState` / `useEffect` hooks** in the central `page.tsx` orchestrator. There is no external state library (Redux, Zustand, etc.).

### 15.1 Primary State Variables
| State | Type | Description |
|---|---|---|
| `trip` | `Trip` | Currently active trip |
| `participants` | `Participant[]` | Trip members |
| `bookings` | `Booking[]` | Itinerary items |
| `expenses` | `Expense[]` | All expenses with allocations |
| `payments` | `Payment[]` | Settlement payments |
| `events` | `LedgerEvent[]` | Audit event log |
| `vendors` | `Vendor[]` | Vendor registry |
| `refunds` | `RefundEvent[]` | Refund records |
| `anomalies` | `Anomaly[]` | Detected anomalies |
| `squads` | `Squad[]` | Reusable group templates |
| `offlineQueue` | `OfflineCommand[]` | Pending offline actions |

### 15.2 Derived State (Computed)
These are recomputed on every render using the ledger engine:
| Computed Value | Source Function |
|---|---|
| Net Balances | `computeNetBalances(participants, expenses, payments, refunds)` |
| Simplified Debts | `simplifyDebts(netBalances)` |
| Reconciliation Audit | `computeReconciliationAudit(...)` |
| Anomalies | `detectAnomalies(trip, bookings, expenses, participants)` |

### 15.3 Persistence Strategy
| Trigger | Action |
|---|---|
| Expense logged | POST to `/api/trips` (save-expense) then persist to Neon |
| Booking created | POST to `/api/trips` (save-booking) then persist to Neon |
| Payment recorded | POST to `/api/trips` (record-payment) then persist to Neon |
| Trip created | POST to `/api/trips` (create) then persist to Neon |
| Event generated | POST to `/api/trips` (log-event) then persist to Neon |
| Page load | GET `/api/auth?action=me` then GET `/api/trips` then hydrate state |

---

## 16. Environment Configuration

### Required Environment Variables

```env
# Neon PostgreSQL Database Connection URL
DATABASE_URL="postgresql://user:password@ep-pooler.region.aws.neon.tech/neondb?sslmode=require"

# Resend Transactional Email API Key
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxx"

# Session Secret for JWT Cookies (min 32 chars)
SESSION_SECRET="tulis_super_secret_session_key_production_2026_jwt"

# Google OAuth 2.0 Credentials
NEXT_PUBLIC_GOOGLE_CLIENT_ID="xxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxx"

# App Public URL
NEXT_PUBLIC_APP_URL="https://tulis.vercel.app"

# (Optional) Groq AI LPU for NL parsing
GROQ_API_KEY="gsk_xxxx"
```

---

## 17. Deployment & Build

### 17.1 Local Development
```bash
# Install dependencies
npm install

# Start development server (Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### 17.2 Database Setup
1. Create a Neon project at [neon.tech](https://neon.tech)
2. Run `db/schema.sql` against the Neon database
3. Set `DATABASE_URL` in `.env.local`

### 17.3 Vercel Deployment
1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy — Next.js auto-detects and builds

### 17.4 External Service Setup
| Service | Setup Required |
|---|---|
| **Neon** | Create project, get connection string |
| **Resend** | Create account, get API key, verify sending domain for production |
| **Google OAuth** | Create OAuth 2.0 credentials in Google Cloud Console |
| **Groq** (optional) | Get API key for AI-powered expense parsing |

---

## 18. Future Roadmap

| Feature | Priority | Description |
|---|---|---|
| Multi-Currency Support | High | Real-time exchange rates for international trips |
| Push Notifications | High | Browser push for payment reminders and trip updates |
| Mobile PWA | Medium | Progressive Web App with offline-first experience |
| Receipt OCR | Medium | Auto-extract amount and vendor from receipt photos |
| Bank Integration | Low | Direct bank feed for automatic expense detection |
| Trip Templates | Low | Pre-built itineraries for popular destinations |
| Social Sharing | Low | Share trip summaries on social media |

---

> **Tulis** — Built with mathematical precision and design excellence.
> *One Trip. One Ledger. Zero Confusion.*
