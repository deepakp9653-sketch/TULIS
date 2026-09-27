# Tulis — Smart Group Travel Finance & Settlement Ledger

<div align="center">
  <img src="public/tulis-logo.png.jpeg" alt="Tulis — Smart Expense Engine" width="380" />
  <p><strong>One Trip. One Ledger. Zero Confusion.</strong></p>
  <p><em>FinTech-Grade Mathematical Precision × Frictionless Group Travel Settlement</em></p>

  [![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black?logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2.8-blue?logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Neon PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-green?logo=postgresql)](https://neon.tech/)
  [![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.19-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  [![UPI](https://img.shields.io/badge/Settlement-UPI%20%E2%82%B9%20INR-orange)](https://www.npci.org.in/)
  [![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
</div>

---

## 🌟 Executive Summary

**Tulis** is an event-sourced, double-entry financial ledger and travel operations engine designed specifically for group trips, squad vacations, and corporate business travel. Unlike standard split-sheet apps that suffer from floating-point drift, opaque multi-currency conversions, and awkward debt webs, Tulis provides:

1. **Provable Financial Determinism**: Zero-sum double-entry ledger where $\sum (\text{Net Balances}) \equiv 0.00$ at all times.
2. **Deterministic Rounding Redistribution**: Cents and paise remainders are assigned by deterministic index rather than lost to floating-point truncation.
3. **Greedy Graph Debt Compression ($O(N \log N)$)**: Collapses complex $N$-party peer obligations into at most $N-1$ optimal settlement transactions.
4. **Instant Indian UPI Settlement Rails**: 1-click dynamic UPI QR code generator and `upi://pay` mobile deep links for instant real-world settling.
5. **Speculative "What-If" Scenario Simulator**: Dry-run engine that previews exact financial ripple effects (drops, cancellations, new expenses) without committing to disk.
6. **AI-Powered Travel Operations**: Groq Vision bill receipt OCR, Whisper voice expense logging, Gogo conversational AI planner, and interactive Trip Chat.
7. **Enterprise Corporate Governance**: Isolated corporate portal with manager approval queues, cost centers, and departmental policy enforcement.

---

## 🏗️ Architecture & System Topology

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

## 🛠️ Technology Stack Breakdown

| Layer | Technology | Details / Purpose |
|---|---|---|
| **Framework** | **Next.js 16.3.3** | React 19 App Router, Turbopack, Edge-ready Route Handlers |
| **Language** | **TypeScript 7.0.2** | Strict end-to-end type safety across backend and UI |
| **Database** | **Neon PostgreSQL** | Serverless PostgreSQL via `@neondatabase/serverless` HTTP connection pool |
| **Styling** | **Tailwind CSS 3.4.19** | Curated CSS custom property tokens, glassmorphism, responsive grid |
| **Animations** | **Motion 13.1.1 & Anime.js** | Micro-interactions, spring transitions, sliding pills, and timeline staggers |
| **3D Rendering** | **COBE 2.0.1 & Three.js** | Interactive 3D WebGL globe on landing page with auto-rotation |
| **Authentication** | **JWT (`jose`) & Bcrypt** | HS256 JWT cookies, 10-round bcrypt hashing, session persistence |
| **Social Login** | **Google Identity Services** | `@react-oauth/google` one-tap and popup credential verification |
| **Transactional Email**| **Resend v6.28.1** | Transactional emails for 6-digit OTP codes and HTML trip invitations |
| **Vision & AI** | **Groq Cloud API** | Llama 3.3 70B multimodal vision for receipt OCR and natural language processing |
| **Speech-to-Text** | **Whisper AI** | Real-time audio recording and transcription for hands-free expense entry |
| **Settlement Rails** | **NPCI UPI Protocol** | QR code generation (`qrcode`), `upi://pay` deep links for GPay, PhonePe, Paytm |

---

## 📊 Core Ledger Engine — Mathematical Rigor

The foundation of Tulis is [`src/lib/ledger-engine.ts`](file:///c:/Users/heena/Downloads/hackcelestial/src/lib/ledger-engine.ts), a deterministic financial calculator.

### 1. The 6 Split Strategies

```typescript
type SplitMethod = 'equal' | 'weighted' | 'line_item' | 'room_tier' | 'organizer_subsidy' | 'manual';
```

1. **Equal Split (`equal`)**:
   $$\text{Share} = \lfloor \frac{\text{Amount}}{N} \times 100 \rfloor \div 100$$
   $$\text{Remainder} = \text{Amount} - (\text{Share} \times N)$$
   $\text{Remainder}$ cents are awarded one-by-one to participants $0 \dots \text{Remainder}-1$. Zero cents lost.

2. **Weighted Split (`weighted`)**:
   Calculated based on explicit ratios or participant weights ($w_i$). The final participant absorbs the floating-point rounding difference so $\sum \text{Allocations} \equiv \text{Total}$.

3. **Room-Tier Split (`room_tier`)**:
   Fair lodging distribution matching luxury consumption:
   - **Suite**: $1.4\times$ base weight
   - **Standard**: $1.0\times$ base weight
   - **Economy**: $0.8\times$ base weight

4. **Organizer Subsidy Split (`organizer_subsidy`)**:
   The organizer provides an upfront contribution $S$. The group splits only the net balance:
   $$\text{Billed Share} = \frac{\text{Total} - S}{N}$$

5. **Line-Item Split (`line_item`)**:
   Direct itemized consumable attribution with proportional scaling if item totals differ from invoice tax/service totals.

6. **Manual Split (`manual`)**:
   Custom arbitrary per-head allocation with hard validation against the invoice total.

---

### 2. Double-Entry Net Balance Computation

For each participant $p$:
$$\text{NetBalance}_p = \text{TotalPaid}_p - \text{TotalOwed}_p$$
Where:
- $\text{TotalPaid}_p$: Direct expense outlays + multi-payer split shares ($\text{paidBySplits}$) + vendor refund credits.
- $\text{TotalOwed}_p$: Sum of all itemized allocations + peer payment obligations.

$$\sum_{p \in P} \text{NetBalance}_p = 0.00 \quad (\text{Strict Invariant})$$

---

### 3. Greedy Pairwise Debt Simplification ($O(N \log N)$)

Instead of a chaotic web where 6 members owe each other across 15 separate transactions, Tulis executes a greedy debt compression algorithm:
1. Filters participants into **Creditors** ($+ \text{Net}$) and **Debtors** ($-\text{Net}$).
2. Sorts both sets by absolute balance descending.
3. Greedily pairs the largest debtor with the largest creditor.
4. Generates an optimal transaction $\min(|\text{Debtor}|, \text{Creditor}|)$.
5. **Guaranteed outcome**: At most $N - 1$ transactions to fully clear all balances.

---

### 4. Algorithmic Anomaly Detection

Five deterministic security rules run automatically against the active trip state:
1. **Itinerary Conflict**: Flags overlapping confirmed bookings for the same traveler.
2. **Room Overcapacity**: Checks if assigned room headcount exceeds the lodging unit's stated capacity.
3. **Budget Variance Breach**: Triggers a severity alert if actual spend exceeds estimate by $>15\%$.
4. **Roster Mismatch**: Detects if removed travelers are still assigned to active booking schedules.
5. **Allocation Mismatch**: Validates that all allocated expense shares exactly sum to total invoice outlay.

---

## 🖥️ Feature Walkthrough & Workspace Views

### 1. Unified Plan & Live Ledger (`PlanAndLedgerView.tsx`)
Consolidates itinerary bookings, daily activities, live bill tracking, and verified receipts into two dedicated sub-views:
- **Timeline View**: Chronological day-by-day activity stream with booking badges, room allocations, vendor tags, and direct booking actions.
- **Ledger Table View**: High-density tabular accounting view with live search, category filters (lodging, transport, food, activity), proof verification status, and one-click allocation dispute triggers.

### 2. Squad Roster & Settlement Graph (`SquadAndSettlementsView.tsx`)
- **Squad Roster**: Real-time position card per member (`Gets back` vs `Owes squad`), room tier selector, custom weight slider, Big Banker trophy (top payer upfront), and pause/activate status.
- **Settlement Resolution Graph**: Visual list of compressed debt paths. Each path includes:
  - Payee UPI ID and avatar.
  - **1-Click UPI QR Code**: Opens dynamic UPI QR modal.
  - **Mobile Deep Link**: Auto-launches Google Pay, PhonePe, or Paytm with pre-filled amount and note.
  - **Debt Reassignment**: Allows a member to transfer their debt obligation to another member with consent tracking.
- **Cross-Trip Squad Netting**: Allows the same friend group to net debts across multiple trips (e.g., Goa 2026 + Gokarna 2026) into one combined balance.

### 3. What-If Scenario Simulator (`WhatIfSimulatorModal.tsx`)
A financial sandbox for dry-run analysis before committing state changes:
- **Drop Participant**: Speculatively removes a traveler. **Historical activities and expenses are preserved at their respective amounts**, while unexpensed itinerary bookings redistribute across remaining active members without creating ledger discrepancies.
- **Cancel Itinerary Booking**: Tests full ($100\%$), partial ($10\% - 90\%$), or non-refundable vendor policies, showing exact refund credits returned to payers and debt relief to squad members.
- **Add Hypothetical Cost**: Injects a speculative cost (e.g., ₹15,000 Luxury Yacht) with equal, weighted, or room-tier splits to preview balance shifts before booking.

### 4. Event-Sourced Audit Trail & Export (`ActivityLogSection.tsx`)
- Monotonically numbered immutable event log tracking all 33 event types.
- **CSV Export**: Downloads RFC 4180-compliant `.csv` formatted for accounting handoff and corporate expense reimbursement.
- **PDF / Print Certificate**: Generates a printable audit certificate with provably reconciled zero-sum cryptographic status ($\Delta = ₹0.00$).

### 5. Intelligent AI Supertools
- **Trip Chat & AI Assistant (`TripChatFAB.tsx` & `TripChatPanel.tsx`)**: Bottom-right floating action button providing instant AI assistance, itinerary Q&A, and expense lookups.
- **Gogo AI Trip Planner (`GogoFAB.tsx` & `GogoInterviewModal.tsx`)**: Bottom-left interactive conversational agent that generates structured travel itineraries based on budget, squad size, and destination vibe.
- **Groq Vision Receipt Scanner (`ReceiptExtractionReviewModal.tsx`)**: Multimodal OCR that scans camera snapshots or bill PDFs, extracts line items and taxes, and auto-populates split drawers.
- **AudioShield Voice Logging (`AudioShieldModal.tsx`)**: Hands-free voice logger that uses Whisper to convert spoken phrases (*"Paid 2,400 for dinner at Fisherman's Wharf split equally"*) into structured expense drafts.

### 6. Corporate Enterprise Governance (`CorporateDashboardShell.tsx`)
- Dedicated corporate workspace accessible via the homepage Corporate Portal.
- Corporate SSO and directory authentication via work email.
- Departmental cost centers, travel director approval queues, travel policy compliance rails, and manager sign-offs.

---

## 📁 Repository Directory Structure

```
hackcelestial/
├── .env.example                       # Environment variable specifications
├── .env.local                         # Local secret keys (ignored by git)
├── next.config.js                     # Next.js 16 bundler configuration
├── package.json                       # Dependencies and project metadata
├── tailwind.config.js                 # Theme tokens, font pairings, and surface colors
├── tsconfig.json                      # Strict TypeScript compiler options
├── README.md                          # Primary project documentation (this file)
├── PROJECT_DOCUMENTATION.md           # Exhaustive architectural specification
│
├── public/                            # Static assets
│   ├── tulis-logo.png.jpeg            # Official new Tulis emblem & wordmark logo
│   ├── tulis-logo.png                 # Mirrored logo asset
│   ├── tulis-icon.png                 # Fallback icon asset
│   ├── logo.png                       # Primary logo alias
│   └── images/                        # UI illustrations and mockups
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
    │       ├── trips/                 # Trip CRUD and invite-code lookup
    │       ├── expenses/              # Expense recording and allocation persistence
    │       ├── events/                # Immutable ledger event stream
    │       └── ai/                    # Groq NLP, Vision OCR, and Gemini explanation
    │
    ├── components/                    # Component inventory (48 components)
    │   ├── LiquidLogo.tsx             # Theme-adaptive ambient logo badge
    │   ├── LandingPage.tsx            # Interactive landing hero with 3D COBE globe
    │   ├── DashboardShell.tsx         # Responsive left command rail and top navigation
    │   ├── PlanAndLedgerView.tsx      # Unified Timeline + Ledger Table hub
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

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or later (v20+ recommended)
- **Package Manager**: `npm` (v9+) or `pnpm`
- **PostgreSQL Database**: Free tier at [neon.tech](https://neon.tech)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/deepakp9653-sketch/TULIS.git
cd TULIS
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env.local` file in the root directory:
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

### Step 4: Initialize Database Schema
Run the SQL DDL in [`db/schema.sql`](file:///c:/Users/heena/Downloads/hackcelestial/db/schema.sql) using the Neon SQL Console or `psql`:
```bash
psql $DATABASE_URL -f db/schema.sql
```

### Step 5: Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Data Integrity Guarantees

1. **Double-Entry Invariant**: Every rupee fronted by a payer is debited to participant debt shares. The algebraic sum of all net positions across the squad is rigorously zero.
2. **Immutable Event Sourcing**: Edits and cancellations append new compensating events (`EXPENSE_CORRECTED`, `REFUND_CREDITED`) rather than destructively mutating past rows.
3. **Session Authentication**: Signed HTTP-only HS256 JWT cookies prevent client-side token tampering or cross-site scripting (XSS) extraction.
4. **Offline Resilience**: When internet connectivity drops, transactions queue locally in an encrypted outbox and automatically flush to the server upon reconnection.

---

<div align="center">
  <strong>Tulis — One Trip. One Ledger. Zero Confusion.</strong><br />
  <sub>Built with mathematical precision, operational excellence, and architectural integrity.</sub>
</div>
