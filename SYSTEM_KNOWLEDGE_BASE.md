# Tulis — Complete System Knowledge Base & Architectural Blueprint

> **System Version:** 2.5.0-production-candidate  
> **Status:** Active / Production-Ready Prototype  
> **Author:** Antigravity Pair-Programming Assistant & Tulis Engineering Team  
> **Repository:** `https://github.com/deepakp9653-sketch/TULIS.git`  
> **Primary Deployment URL:** `https://tulis.vercel.app/`  
> **Local Runtime:** `http://localhost:3000` (Next.js 16 + Turbopack + Node 20+)  
> **Database Engine:** Neon PostgreSQL Serverless (AWS us-east-2)  

---

## Table of Contents

1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [Mathematical Ledger Foundations & Invariants](#2-mathematical-ledger-foundations--invariants)
   - [2.1 The Deterministic Double-Entry Zero-Sum Invariant](#21-the-deterministic-double-entry-zero-sum-invariant)
   - [2.2 Net Balance Formulation & Credit Outlays](#22-net-balance-formulation--credit-outlays)
   - [2.3 Remainder Cent Preservation Algorithms](#23-remainder-cent-preservation-algorithms)
   - [2.4 Greedy Graph-Based Debt Simplification Algorithm](#24-greedy-graph-based-debt-simplification-algorithm)
   - [2.5 Dynamic Split Calculation Engines](#25-dynamic-split-calculation-engines)
   - [2.6 Booking Cancellation & Partial Refund Cascades](#26-booking-cancellation--partial-refund-cascades)
3. [System Architecture & Technology Stack](#3-system-architecture--technology-stack)
   - [3.1 High-Level Architecture Topology](#31-high-level-architecture-topology)
   - [3.2 Runtime Stack Specifications](#32-runtime-stack-specifications)
   - [3.3 Authentication & Session Security Subsystem](#33-authentication--session-security-subsystem)
   - [3.4 Transactional Email Infrastructure (Resend)](#34-transactional-email-infrastructure-resend)
   - [3.5 Natural Language AI Engine (Groq LLM)](#35-natural-language-ai-engine-groq-llm)
   - [3.6 Offline-First Command Queue & Reconnection State Machine](#36-offline-first-command-queue--reconnection-state-machine)
4. [Database Schemas, DDL & Entity Relationships](#4-database-schemas-ddl--entity-relationships)
   - [4.1 PostgreSQL Schema DDL](#41-postgresql-schema-ddl)
   - [4.2 Entity Relationship Map](#42-entity-relationship-map)
   - [4.3 Data Migration & Seed Pipeline](#43-data-migration--seed-pipeline)
5. [Complete API Endpoints & Contract Specifications](#5-complete-api-endpoints--contract-specifications)
   - [5.1 Auth API (`/api/auth`)](#51-auth-api-apiauth)
   - [5.2 Google OAuth Verification (`/api/auth/google`)](#52-google-oauth-verification-apiauthgoogle)
   - [5.3 Trips Collection & Management (`/api/trips`)](#53-trips-collection--management-apitrips)
   - [5.4 Invite Code Join Engine (`/api/trips/join`)](#54-invite-code-join-engine-apitripsjoin)
   - [5.5 AI Natural Expense Parsing (`/api/ai/parse-expense`)](#55-ai-natural-expense-parsing-apiaiparse-expense)
   - [5.6 AI Balance Explanation (`/api/ai/explain-balance`)](#56-ai-balance-explanation-apiaiexplain-balance)
6. [Comprehensive Feature Catalog (F1 – F23)](#6-comprehensive-feature-catalog-f1--f23)
7. [Frontend Architecture & Design System Tokens](#7-frontend-architecture--design-system-tokens)
   - [7.1 Color Tokens & Theming](#71-color-tokens--theming)
   - [7.2 Typography & Glassmorphism Utilities](#72-typography--glassmorphism-utilities)
   - [7.3 Component Inventory & Hierarchy](#73-component-inventory--hierarchy)
8. [Production Deployment & Operational Guide](#8-production-deployment--operational-guide)
   - [8.1 Environment Variables Dictionary](#81-environment-variables-dictionary)
   - [8.2 Vercel Deployment Checklist](#82-vercel-deployment-checklist)
   - [8.3 Google Cloud Console OAuth Configuration](#83-google-cloud-console-oauth-configuration)
   - [8.4 Verification & Stress Testing Protocol](#84-verification--stress-testing-protocol)

---

## 1. Executive Summary & Problem Statement

Group travel planning and post-trip expense reconciliation is notoriously fraught with friction, social anxiety, and mathematical errors. Existing consumer tools (such as Splitwise, Tricount, or Google Sheets) fail in multi-variable vacation environments due to six core architectural deficiencies:

1. **Failure to Handle Multi-Payer Large Bookings:** High-ticket vacation items (villas, private yachts, rental vans) are frequently co-funded or booked with organizer subsidies that cannot be captured by simple equal-split tools.
2. **Ignorance of Dynamic Room & Quality Tiers:** Room selection on vacation is rarely equal. One couple takes the Master Oceanfront Suite, while solo travelers take standard or economy bunks. Static splitting forces unfair subsidies onto travelers with smaller rooms.
3. **The Partial Cancellation Nightmare:** When an airline flight is cancelled with a 75% refund, or a passenger drops out last minute, conventional tools force organizers to manually recalculate every preceding line item, introducing rounding errors and disputed debts.
4. **Logistical Blindness:** Financial ledgers are traditionally isolated from the travel itinerary. They do not know that two scheduled activities overlap in time, or that a checkout time precedes a flight departure, causing missed tours and costly forfeiture.
5. **Debt Matrix Explosion:** Without automated min-cash-flow compression, an 8-person trip creates up to 28 confusing pairwise payment transactions.
6. **Network Fragility:** Travelers in remote locations (beaches, mountain trails, international flights) lose cellular connectivity. Traditional apps either crash or create merge conflicts when internet resumes.

**Tulis** solves this comprehensively by combining an **immutable event-sourced zero-sum double-entry ledger** with an **$O(N \log N)$ greedy debt simplifier**, **Groq AI neural natural-language parsing**, **real-time deterministic anomaly detection**, **offline-first queue reconciliation**, and **native Indian UPI deep-linking**.

---

## 2. Mathematical Ledger Foundations & Invariants

### 2.1 The Deterministic Double-Entry Zero-Sum Invariant

Every transaction, booking outlay, organizer subsidy, vendor refund, and peer-to-peer reimbursement recorded in Tulis must satisfy the **Universal Zero-Sum Invariant**:

$$\sum_{i=1}^N \text{NetBalance}_i \equiv 0.00$$

Where:
- $N$ is the number of active participants in the trip.
- $\text{NetBalance}_i > 0$ represents a **Surplus** (the participant is owed money by the group).
- $\text{NetBalance}_i < 0$ represents a **Deficit** (the participant owes money to the group).
- $\text{NetBalance}_i = 0$ represents a **Settled** state.

#### Floating-Point Tolerance Boundary
Due to IEEE 754 64-bit floating-point arithmetic in web runtimes, division across odd participant counts (e.g., dividing ₹100.00 among 3 participants) yields repeating fractions ($33.3333...$). Tulis guarantees mathematical integrity by:
1. Enforcing discrete penny rounding (`toFixed(2)` and cent scaling `Math.round(x * 100)`).
2. Maintaining a strict reconciliation threshold:
   $$\Delta = \left| \sum_{i=1}^N \text{NetBalance}_i \right| \le 0.02$$
   If $\Delta > 0.02$, the system flags a high-severity `ALLOCATION_MISMATCH` anomaly and isolates the offending entry from final settlement generation.

---

### 2.2 Net Balance Formulation & Credit Outlays

For any given participant $p$, their balance is derived by folding the event stream:

$$\text{NetBalance}_p = \text{TotalPaid}_p - \text{TotalOwed}_p$$

#### Component 1: Outlay Credit ($\text{TotalPaid}_p$)
1. **Direct Single-Payer Expense:**
   $$\text{Credit} = \max(0, \text{TotalAmount} - \text{SubsidyAmount})$$
   *Note:* If the trip organizer covered a ₹5,000 voluntary subsidy on a ₹20,000 villa booking, the claimable outlay for reimbursement is ₹15,000.
2. **Multi-Payer Contributory Expense:**
   $$\text{Credit} = \sum \text{SplitAmount}_{p,k}$$
   For each split $k$ where participant $p$ contributed to the vendor bill.
3. **Peer-to-Peer Payments Sent:**
   When participant $p$ executes a UPI transfer to payee $q$, $p$'s $\text{TotalPaid}$ increases by the payment amount.
4. **Vendor Refunds Received:**
   When a vendor refunds money to the original booking payer $p$, $p$'s $\text{TotalPaid}$ is reduced by the refund amount:
   $$\text{TotalPaid}_p \leftarrow \text{TotalPaid}_p - \text{ClaimableRefund}$$

#### Component 2: Obligation Debit ($\text{TotalOwed}_p$)
1. **Allocated Expense Shares:**
   $$\text{TotalOwed}_p = \sum_{e \in \text{Expenses}} \text{Allocation}(e, p)$$
2. **Peer-to-Peer Payments Received:**
   When participant $p$ receives a UPI payment from debtor $q$, $p$'s $\text{TotalPaid}$ is decreased (or $\text{TotalOwed}$ increased) by the received sum.
3. **Cancellation Debt Relief:**
   When a booking is cancelled and refunded, debt relief is distributed across participants proportionally, directly reducing their $\text{TotalOwed}$.

#### Dispute Isolation Clause
Any peer-to-peer payment marked with `status === 'disputed'` is **quarantined in escrow** and excluded from the net balance calculation until resolved:
```typescript
payments.forEach((pay) => {
  if (pay.status === 'disputed') return; // Isolated from balance fold
  map[pay.payerId].totalPaid += pay.amount;
  map[pay.payeeId].totalPaid -= pay.amount;
});
```

---

### 2.3 Remainder Cent Preservation Algorithms

To avoid losing single pennies during division, Tulis implements deterministic cent-remainder preservation across all split routines.

#### Algorithm: Equal Split with Remainder Distribution
Given total allocatable amount $A$ and participant count $K$:
1. Base share:
   $$S_{\text{base}} = \frac{\lfloor (A / K) \times 100 \rfloor}{100}$$
2. Remainder cents:
   $$R = \text{round}\left((A - S_{\text{base}} \times K) \times 100\right)$$
3. Allocation for participant $i \in \{0, 1, ..., K-1\}$:
   $$\text{Share}_i = \begin{cases} S_{\text{base}} + 0.01 & \text{if } i < R \\ S_{\text{base}} & \text{if } i \ge R \end{cases}$$

This guarantees that:
$$\sum_{i=0}^{K-1} \text{Share}_i \equiv A$$

---

### 2.4 Greedy Graph-Based Debt Simplification Algorithm

Without optimization, an $N$-person group can generate up to $\frac{N(N-1)}{2}$ directed debt edges. Tulis employs an $O(N \log N)$ greedy min-cash-flow reduction algorithm that reduces the network to at most $N - 1$ transactions.

```mermaid
graph LR
    subgraph "Before Simplification (O(N^2) Chaos)"
        A((Alice)) -->|₹1,200| B((Bob))
        B -->|₹800| C((Charlie))
        C -->|₹1,500| A
        D((David)) -->|₹600| B
        D -->|₹400| C
        A -->|₹300| D
    end
    subgraph "After Min-Cash-Flow Simplification (O(N-1) Clean)"
        D2((David)) -->|₹700| A2((Alice))
        C2((Charlie)) -->|₹300| A2
        B2((Bob)) -->|₹200| C2
    end
```

#### Step-by-Step Mathematical Procedure
1. **Partition Step:** Filter out all participants with $|\text{NetBalance}| < 0.01$. Partition remaining into two disjoint sets:
   - **Creditors ($C$):** $\{ p \mid \text{NetBalance}_p > 0 \}$, sorted descending by balance.
   - **Debtors ($D$):** $\{ p \mid \text{NetBalance}_p < 0 \}$, sorted descending by absolute balance ($|\text{NetBalance}_p|$).
2. **Greedy Matching Step:** Initialize pointers $i = 0$ (for $D$) and $j = 0$ (for $C$).
3. **Transfer Calculation:**
   $$T = \min(D[i].\text{balance}, C[j].\text{balance})$$
   Record settlement edge:
   $$\text{Edge} = \{ \text{from}: D[i].\text{id}, \text{to}: C[j].\text{id}, \text{amount}: T \}$$
4. **Balance Decrement:**
   $$D[i].\text{balance} \leftarrow D[i].\text{balance} - T$$
   $$C[j].\text{balance} \leftarrow C[j].\text{balance} - T$$
5. **Pointer Advance:**
   - If $D[i].\text{balance} \le 0.009$, advance $i \leftarrow i + 1$.
   - If $C[j].\text{balance} \le 0.009$, advance $j \leftarrow j + 1$.
6. Repeat until all balances are zeroed ($i = |D|$ and $j = |C|$).

---

### 2.5 Dynamic Split Calculation Engines

Tulis supports 6 distinct split strategies in [`src/lib/ledger-engine.ts`](file:///c:/Users/heena/Downloads/hackcelestial/src/lib/ledger-engine.ts):

| Split Method | Mathematical Formula / Rules | Ideal Use Case |
|---|---|---|
| `equal` | $\text{Share}_i = \frac{A}{K}$ with remainder cent distribution | Cabs, groceries, entry tickets, tour guides |
| `weighted` | $\text{Share}_i = \frac{w_i}{\sum w} \times A$. Last participant absorbs rounding delta. | Differential stays (e.g. 3 nights vs 5 nights) |
| `room_tier` | Multipliers: Suite = $1.4\times$, Standard = $1.0\times$, Economy = $0.8\times$. Weights: $w_i = \text{tierMultipliers}[\text{tier}_i]$. | Resort villas, luxury hotels, cabin rentals |
| `line_item` | Explicit amounts $\sum a_i$. If $\sum a_i \neq A$, scales proportionally: $a_i' = a_i \times \frac{A}{\sum a}$. | Restaurant receipts with individual meals & alcohol |
| `organizer_subsidy` | $A_{\text{net}} = \max(0, A - \text{Subsidy})$. Group splits $A_{\text{net}}$ equally. Organizer covers subsidy. | Team offsites, birthday parties, sponsored trips |
| `manual` | Fully custom fixed amounts per user. Verified against total. | Ad-hoc lump sums, custom agreements |

---

### 2.6 Booking Cancellation & Partial Refund Cascades

When a vendor booking is cancelled, funds are returned under one of four distinct policies:
- `full`: 100% refund of actual cost.
- `partial`: Custom percentage refund (e.g., 70% refund with 30% airline penalty).
- `per_head`: Refund scaled by the number of active attendees.
- `non_refundable`: 0% refund; the expense remains on the ledger.

#### Cascade Propagation Formula
When refund amount $R$ is confirmed:
1. **Payer Outlay Reduction:**
   $$\text{ClaimableRefund} = R \times \frac{\text{ClaimablePaid}}{\text{TotalAmount}}$$
   The participant who originally fronted the payment receives a credit adjustment:
   $$\text{TotalPaid}_{\text{payer}} \leftarrow \text{TotalPaid}_{\text{payer}} - \text{ClaimableRefund}$$
2. **Proportional Debt Relief:**
   For each participant $j \in \{1, 2, ..., M\}$ who was allocated a share of the original expense:
   $$\text{Relief}_j = \begin{cases} \text{round}\left( \text{Alloc}_j \times \frac{R}{\text{TotalAmount}} \right) & \text{for } j < M \\ \text{ClaimableRefund} - \sum_{k=1}^{M-1} \text{Relief}_k & \text{for } j = M \end{cases}$$
   $$\text{TotalOwed}_j \leftarrow \text{TotalOwed}_j - \text{Relief}_j$$

*This exact penny balancing on terminal participant $M$ prevents orphan cents from accumulating across multi-tier cancellations.*

---

## 3. System Architecture & Technology Stack

### 3.1 High-Level Architecture Topology

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  Next.js 16 Client Components (React 19) • Tailwind CSS • Glassmorphic Dark UI   |
|  Local Offline Command Queue (IndexedDB/LocalStorage) • jsPDF Client Engine       |
+-----------------------------------------+-----------------------------------------+
                                          | HTTPS / REST / WebSockets
                                          v
+-----------------------------------------------------------------------------------+
|                             NEXT.JS 16 SERVER LAYER                               |
|  App Router Route Handlers (/api/*) • Edge & Node Runtimes • Turbopack Engine     |
|  jose JWT Cookie Session Validator • bcrypt Credential Engine                     |
+------------+----------------------------+----------------------------+------------+
             |                            |                            |
             v                            v                            v
+------------------------+  +------------------------+  +------------------------+
|    NEON POSTGRES DB    |  |       RESEND API       |  |        GROQ AI         |
| Serverless HTTP Pool   |  | Transactional Email    |  | LLM Neural Inference   |
| Relational Schema      |  | 6-Digit OTP Delivery   |  | Llama 3.3 / GPT-OSS    |
| Event-Sourced Ledger   |  | HTML Email Templates   |  | Natural Chat Parsing   |
+------------------------+  +------------------------+  +------------------------+
```

---

### 3.2 Runtime Stack Specifications

- **Framework:** Next.js 16.1.6 (React 19.2.3, React DOM 19.2.3) with Turbopack bundler.
- **Language:** TypeScript 5.8+ (Strict type-checking enabled).
- **Database Driver:** `@neondatabase/serverless` (HTTP pooled queries, zero connection exhaustion).
- **Styling Architecture:** Vanilla CSS design system + Tailwind CSS 3.4.17 with custom utility classes.
- **Cryptography & Tokens:**
  - `bcryptjs` (v2.4.3): 10 salt rounds for password security.
  - `jose` (v5.9.6): Stateless HMAC-SHA256 signed JWT cookies (`HS256`, 30-day TTL).
- **Authentication Providers:**
  - `@react-oauth/google` (v0.12.1): Google One-Tap & Identity Services.
  - Server Tokeninfo Verification: `https://oauth2.googleapis.com/tokeninfo`.
  - Resend Email Service: `resend` (v4.1.2) for passwordless OTP dispatch.
- **AI / LLM Integration:** Groq SDK (`groq-sdk` v0.15.0) targeting `openai/gpt-oss-20b` and `llama-3.3-70b-versatile`.
- **Client-Side Document Export:** `jspdf` (v3.0.0) with embedded verification hash stamps.
- **Motion & Micro-interactions:** `framer-motion` (v12.4.7) driven by unified timing and easing tokens (`MOTION_TOKENS` in `src/lib/motion.ts`).
- **Financial Counters:** `CountUpMoney` component with smooth 60fps numeral transitions.
- **Icons & Visuals:** `lucide-react` (v0.475.0) and custom SVG liquid glass badges.

---

### 3.3 Authentication & Session Security Subsystem

Tulis features a production-grade multi-modal authentication and access control architecture:
1. **Passwordless Email OTP Verification (Default Flow):**
   - Users enter their email address on Landing Page or DashboardShell to request a real 6-digit numeric OTP (`POST /api/auth` with `{ action: 'send-otp' }`).
   - Dispatched in real time via the Resend API (`src/lib/email-service.ts`) with a 15-minute expiration timestamp.
   - User inputs the 6-digit code which auto-submits upon completion (`POST /api/auth` with `{ action: 'verify-otp' }`).
   - On verification, `email_verified` is flagged `TRUE` in Neon DB, an HTTP-only signed JWT session cookie (`tulis_session`) is provisioned, and the user gains immediate workspace access.
2. **Google OAuth 2.0:** One-tap sign-in. Wrapped at the root layout with `<GoogleAuthProvider>` (`@react-oauth/google`). The client obtains a credential JWT, posts it to `/api/auth/google`, and the server validates the signature and audience against Google’s official OAuth2 tokeninfo service (`https://oauth2.googleapis.com/tokeninfo`).
3. **Password & One-Click Demo Personas:** Users can alternatively authenticate via salted bcrypt password hash or switch between demo personas with 1 click for instant evaluator testing.
4. **Stateless JWT Session Management:**
   - Auth state is encapsulated in an HTTP-only, secure, same-site cookie named `tulis_session`.
   - Signed using `jose` with `HS256` and the server secret `SESSION_SECRET` (fallback `JWT_SECRET`).
   - Contains payload: `{ id, name, email, avatar, role, upiId, emailVerified }`.
   - Validated on client hydration via `GET /api/auth?action=me`.
   - Explicitly invalidated on logout via `POST /api/auth` with `{ action: 'logout' }`.
5. **My Cloud Trips Dashboard (`MyTripsModal.tsx`):**
   - Authenticated users can access their cloud-persisted trips (`GET /api/trips?myTrips=true`), seamlessly switch between active workspaces, create new trips, or join squad trips.
6. **Private Trip Access Gating (`TripAccessGateModal.tsx`):**
   - Protects private trip ledgers from unauthorized viewing unless the user is an authenticated roster participant or enters the trip's 6-character invite code.

---

### 3.4 Transactional Email Infrastructure (Resend)

Built in [`src/lib/email-service.ts`](file:///c:/Users/heena/Downloads/hackcelestial/src/lib/email-service.ts):
- **Provider:** Resend API (`api.resend.com`) using active production key.
- **Verified Sender:** `Tulis <onboarding@resend.dev>`.
- **Supported Email Triggers:**
  - 6-Digit Email OTP Verification (`sendVerificationOtpEmail`)
  - Squad Trip Invitations with deep links (`sendTripInviteEmail`)
- **Template Design:** Responsive, dark-themed HTML email adhering to the Tulis design system (`#12160F` background, `#5FA97D` mint accents, `#1B2119` cards, dashed code box with `JetBrains Mono` font).
- **Graceful Fallback:** If the Resend API rate limits or returns an error on unverified test domains, the service safely enters **simulated delivery mode**, logging the generated OTP and surfacing a 1-click Auto-fill sandbox button in the UI so registration and login never block or crash.

---

### 3.5 Natural Language AI Engine (Groq LLM)

Built in [`src/app/api/ai/parse-expense/route.ts`](file:///c:/Users/heena/Downloads/hackcelestial/src/app/api/ai/parse-expense/route.ts) and [`src/app/api/ai/explain-balance/route.ts`](file:///c:/Users/heena/Downloads/hackcelestial/src/app/api/ai/explain-balance/route.ts):
- **Model:** `llama-3.3-70b-versatile` / `openai/gpt-oss-20b` via Groq Cloud API (Latency: < 400ms).
- **Deterministic Regex Fallback:** If the AI API is unreachable or times out, the local rule-based parser in [`src/lib/ledger-engine.ts`](file:///c:/Users/heena/Downloads/hackcelestial/src/lib/ledger-engine.ts) (`parseNaturalChatExpense`) takes over instantly:
  - Regex pattern matching for amounts (e.g., `₹1200`, `12k`, `12.5k`, `1200rs`).
  - Fuzzy keyword detection for category classification (`cab`, `taxi`, `uber` $\to$ `transport`; `dinner`, `drinks` $\to$ `food`; `hotel`, `villa` $\to$ `lodging`).
  - Levenshtein-based first-name token matching against active trip participants.

---

### 3.6 Offline-First Command Queue & Client Storage Hierarchy

To ensure complete resilience during remote travel:
1. When offline (`navigator.onLine === false`), ledger actions (logging expenses, recording payments) are intercepted.
2. An `OfflineCommand` record is written to `localStorage` under `tulis_offline_queue`:
   ```typescript
   interface OfflineCommand {
     id: string;
     tripId: string;
     type: 'LOG_EXPENSE' | 'RECORD_PAYMENT';
     payload: any;
     clientTimestamp: string;
     status: 'queued' | 'syncing' | 'synced';
   }
   ```
3. An active listener on `window.addEventListener('online')` triggers the sync queue.
4. Commands are drained sequentially to the server using optimistic execution. The UI renders an emerald badge showing queue synchronization progress.
5. **Client LocalStorage Key Dictionary:**
   - `tulis_theme`: Active visual theme (`'dark'` or `'light'`).
   - `tulis_view_mode`: Top-level view router (`'landing'` or `'app'`).
   - `tulis_active_trip_id`: Currently selected active trip workspace ID.
   - `group_ledger_session_v4`: Offline snapshot cache of all trips, participants, bookings, expenses, payments, and events.
   - `tulis_offline_queue`: Outbox queue of pending operations captured while offline.

---

## 4. Database Schemas, DDL & Entity Relationships

### 4.1 PostgreSQL Schema DDL

The database runs on Neon PostgreSQL. Below is the complete SQL schema:

```sql
-- 1. Users Table (Authentication & Identity)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  google_id VARCHAR(255) UNIQUE,
  upi_id VARCHAR(100),
  email_verified BOOLEAN DEFAULT FALSE,
  verification_otp VARCHAR(10),
  otp_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Trips Table
CREATE TABLE IF NOT EXISTS trips (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  base_currency VARCHAR(10) DEFAULT 'INR',
  start_date DATE,
  end_date DATE,
  budget_ceiling NUMERIC(12, 2) DEFAULT 0.00,
  invite_code VARCHAR(16) UNIQUE,
  organizer_id VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Trip Members Junction Table (Access Control & Roles)
CREATE TABLE IF NOT EXISTS trip_members (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- 'organizer' | 'member' | 'viewer'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_trip_user UNIQUE(trip_id, user_id)
);

-- 4. Participants Table (In-Trip Persona & Ledger Accounts)
CREATE TABLE IF NOT EXISTS participants (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  avatar_url TEXT,
  is_organizer BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active', -- 'active' | 'removed'
  upi_id VARCHAR(100),
  qr_code_url TEXT,
  weight NUMERIC(5, 2) DEFAULT 1.0,
  room_tier VARCHAR(20) DEFAULT 'standard' -- 'suite' | 'standard' | 'economy'
);

-- 5. Bookings Table (Itinerary Activities & Stays)
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- 'transport' | 'lodging' | 'activity' | 'food' | 'other'
  title VARCHAR(255) NOT NULL,
  vendor VARCHAR(255),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  estimated_cost NUMERIC(12, 2) DEFAULT 0.00,
  actual_cost NUMERIC(12, 2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'confirmed', -- 'confirmed' | 'pending' | 'cancelled'
  refund_policy VARCHAR(20) DEFAULT 'full',
  room_capacity INT DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  split_method VARCHAR(30) DEFAULT 'equal',
  paid_by_id VARCHAR(64) REFERENCES participants(id) ON DELETE RESTRICT,
  category VARCHAR(50) DEFAULT 'general',
  subsidy_amount NUMERIC(12, 2) DEFAULT 0.00,
  paid_by_splits JSONB, -- For multi-payer contributory bills
  receipt_url TEXT,
  receipt_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Expense Allocations Table (Itemized Debits)
CREATE TABLE IF NOT EXISTS expense_allocations (
  id VARCHAR(64) PRIMARY KEY,
  expense_id VARCHAR(64) REFERENCES expenses(id) ON DELETE CASCADE,
  participant_id VARCHAR(64) REFERENCES participants(id) ON DELETE CASCADE,
  amount_owed NUMERIC(12, 2) NOT NULL,
  notes TEXT,
  dispute_status VARCHAR(20) DEFAULT 'none', -- 'none' | 'active' | 'resolved'
  dispute_reason TEXT
);

-- 8. Payments Table (Peer-to-Peer Settlements)
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  payer_id VARCHAR(64) REFERENCES participants(id) ON DELETE RESTRICT,
  payee_id VARCHAR(64) REFERENCES participants(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed', -- 'pending' | 'confirmed' | 'disputed'
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Refunds Table (Vendor Cancellation Credits)
CREATE TABLE IF NOT EXISTS refunds (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE SET NULL,
  expense_id VARCHAR(64) REFERENCES expenses(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  refunded_to_payer_id VARCHAR(64) REFERENCES participants(id) ON DELETE RESTRICT,
  policy VARCHAR(30) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Events Table (Immutable Event-Sourcing Ledger)
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  actor_id VARCHAR(64),
  payload_json JSONB,
  sequence_num BIGSERIAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for High Performance Querying
CREATE INDEX IF NOT EXISTS idx_trips_invite_code ON trips(UPPER(invite_code));
CREATE INDEX IF NOT EXISTS idx_participants_trip ON participants(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expense_alloc_exp ON expense_allocations(expense_id);
CREATE INDEX IF NOT EXISTS idx_payments_trip ON payments(trip_id);
CREATE INDEX IF NOT EXISTS idx_events_trip_seq ON events(trip_id, sequence_num);
CREATE INDEX IF NOT EXISTS idx_trip_members_user ON trip_members(user_id);
```

---

### 4.2 Entity Relationship Map

```
  +---------------+             1:N             +--------------------+
  |     USERS     |----------------------------<|    TRIP_MEMBERS    |
  +---------------+                             +--------------------+
          |                                               |
          | 1:N (Owned Trips)                             | N:1
          v                                               v
  +---------------+             1:N             +--------------------+
  |     TRIPS     |----------------------------<|    PARTICIPANTS    |
  +---------------+                             +--------------------+
     |    |    |                                   |         |
 1:N |    |    | 1:N                               | 1:N     | 1:N
     |    |    +------------------+                | (Payer) | (Debtor)
     |    |                       |                |         |
     |    v                       v                v         v
     | +--------------+        +------------+   +--------------------+
     | |   BOOKINGS   |        |   EVENTS   |   |      PAYMENTS      |
     | +--------------+        +------------+   +--------------------+
     |    |        |                               |         |
 1:N |    | 1:N    | 1:N                           |         |
     v    v        v                               |         |
  +------------+ +------------+                    |         |
  |  EXPENSES  | |  REFUNDS   |                    |         |
  +------------+ +------------+                    |         |
        |                                          |         |
    1:N |                                          |         |
        v                                          |         |
  +------------------------+                       |         |
  |  EXPENSE_ALLOCATIONS   |<----------------------+---------+
  +------------------------+
```

---

## 5. Complete API Endpoints & Contract Specifications

### 5.1 Auth API (`/api/auth`)
*Handles email/password credential registration, login, OTP dispatch, session verification, and logout.*

- **Endpoint:** `POST /api/auth`
- **Supported Actions (`req.body.action`):**
  1. `register`: Accepts `{ email, password, name, upiId }`. Hashes password with bcrypt, stores user, generates 6-digit OTP, dispatches email via Resend, issues JWT cookie.
  2. `login`: Accepts `{ email, password }`. Verifies bcrypt hash, writes 30-day session cookie.
  3. `send-otp`: Accepts `{ email }`. Generates numeric OTP with 15-minute expiration, sends email via Resend.
  4. `verify-otp`: Accepts `{ email, otp }`. Checks OTP match and expiration, marks user as `email_verified: true`, updates cookie.
  5. `me`: Returns `{ user: AuthSessionUser | null }` based on current request cookie.
  6. `logout`: Clears `Tulis_session` cookie immediately.
  7. `update-upi`: Updates user's default UPI VPA ID in Neon.

---

### 5.2 Google OAuth Verification (`/api/auth/google`)
*Server-side token exchange and identity verification.*

- **Endpoint:** `POST /api/auth/google`
- **Request Body:**
  ```json
  {
    "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI..."
  }
  ```
- **Server Execution Flow:**
  1. Calls `https://oauth2.googleapis.com/tokeninfo?id_token={credential}`.
  2. Confirms Google user ID (`sub`), email, verified status, name, and avatar picture.
  3. Upserts record into `users` table:
     ```sql
     INSERT INTO users (id, email, name, avatar_url, google_id, email_verified)
     VALUES (...) ON CONFLICT (email) DO UPDATE ...
     ```
  4. Generates signed JWT session token and returns standard cookie.
- **Response:**
  ```json
  {
    "success": true,
    "user": {
      "id": "usr-google-110293847291",
      "email": "traveler@gmail.com",
      "name": "Jane Doe",
      "avatar": "https://lh3.googleusercontent.com/a/...",
      "role": "member",
      "emailVerified": true
    }
  }
  ```

---

### 5.3 Trips Collection & Management (`/api/trips`)
*Retrieves all accessible trips for the authenticated user and handles creation of new trips.*

- **GET `/api/trips`:**
  - Extracts user ID from session.
  - Returns array of accessible trips (owned as organizer or joined in `trip_members`).
- **POST `/api/trips`:**
  - Creates a new trip record in Neon with unique 6-character uppercase invite code (e.g., `GOA2026`).
  - Automatically provisions creator as primary Organizer in `participants` and `trip_members`.
  - Emits `TRIP_CREATED` event to immutable ledger.

---

### 5.4 Invite Code Join Engine (`/api/trips/join`)
*Allows squad members to join a trip using a shared 6-character code.*

- **Endpoint:** `POST /api/trips/join`
- **Request Body:**
  ```json
  {
    "inviteCode": "GOA2026",
    "name": "Alex Smith",
    "email": "alex@example.com",
    "upiId": "alex@okhdfcbank"
  }
  ```
- **Execution:**
  1. Queries Neon `trips` table matching `UPPER(invite_code)`.
  2. Verifies trip existence; returns 404 if not found.
  3. Inserts participant into `participants` and records membership in `trip_members`.
  4. Emits `TRIP_JOINED_VIA_CODE` and `PARTICIPANT_ADDED` events.
  5. Returns full hydrated trip state.

---

### 5.5 AI Natural Expense Parsing (`/api/ai/parse-expense`)
*Neural extraction of unstructured natural language text or voice transcripts into structured expense line items.*

- **Endpoint:** `POST /api/ai/parse-expense`
- **Request Body:**
  ```json
  {
    "text": "Paid 3500 for seafood dinner with John and Priya yesterday at Fisherman's Cove",
    "participants": [
      { "id": "p1", "name": "Jane Doe" },
      { "id": "p2", "name": "John Smith" },
      { "id": "p3", "name": "Priya Sharma" }
    ]
  }
  ```
- **Groq LLM Prompt:**
  ```text
  Extract expense details as valid JSON with keys { "title": string, "totalAmount": number, "category": "transport"|"lodging"|"activity"|"food"|"other", "payerName": string, "splitWith": string[] } from text:
  "Paid 3500 for seafood dinner with John and Priya yesterday at Fisherman's Cove"
  Available members: Jane Doe (id: p1), John Smith (id: p2), Priya Sharma (id: p3)
  ```
- **Response:**
  ```json
  {
    "success": true,
    "expense": {
      "title": "Seafood Dinner at Fisherman's Cove",
      "totalAmount": 3500,
      "category": "food",
      "payerId": "p1",
      "detectedParticipantIds": ["p2", "p3"],
      "suggestedSplitMethod": "equal",
      "confidence": 0.95
    },
    "model": "Groq Llama 3.3 / OSS"
  }
  ```

---

### 5.6 AI Balance Explanation (`/api/ai/explain-balance`)
*Generates an empathetic, human-friendly conversational audit of why a participant owes or is owed money.*

- **Endpoint:** `POST /api/ai/explain-balance`
- **Request Body:** `{ userName, netBalance, debts, tripTitle }`
- **Response:**
  ```json
  {
    "success": true,
    "explanation": "You're owed ₹4,250 because you covered the entire Beach Villa deposit upfront. John and Priya will reimburse you ₹2,125 each via UPI to square things up completely."
  }
  ```

---

## 6. Comprehensive Feature Catalog (F1 – F23)

### F1: Multi-Currency & Real-Time Conversion Ledger
- Supports base trip currency (`INR` by default, with automatic support for `USD`, `EUR`, `GBP`, `AED`, `THB`).
- Tabular numeric alignment with `font-numeric` (`JetBrains Mono`) for financial figures.

### F2: Dynamic Split Engine
- Supports 6 distinct algorithms: `equal`, `weighted`, `line_item`, `room_tier`, `organizer_subsidy`, `manual`.
- Dynamically redistributes allocations when participants join, leave, or adjust tier weights.

### F3: Greedy Min-Cash-Flow Debt Simplifier
- Compresses $O(N^2)$ pairwise debts into $\le N-1$ transactions.
- Provides immediate settlement targets with recipient UPI VPAs and QR codes.

### F4: Booking Cancellation & Partial Refund Cascades
- Implements 4 refund policies: `full`, `partial`, `per_head`, and `non_refundable`.
- Proportional debt relief across all allocated members with exact cent preservation.

### F5: Natural Language AI Expense Parser
- High-speed Groq neural chat completions (< 400ms) with deterministic regex fallback.
- Auto-extracts amount, title, vendor, category, payer, and involved participants.

### F6: Deterministic Anomaly & Conflict Detection Engine
- Runs strict mathematical checks on every state change:
  - `SCHEDULE_CONFLICT`: Overlapping timestamps for identical participants across bookings.
  - `ROOM_OVERCAPACITY`: Bookings where participant count exceeds room capacity.
  - `BUDGET_VARIANCE`: Bookings where actual cost exceeds estimate by $> 15\%$.
  - `ROSTER_MISMATCH`: Removed travelers remaining on active booking rosters.
  - `ALLOCATION_MISMATCH`: Penny discrepancies between allocated shares and net bill.

### F7: What-If Speculative Simulation Sandbox (Dry-Run Engine)
- Simulates hypothetical actions without committing to the event log:
  - *What happens to everyone's balance if Bob drops out of the trip?*
  - *What happens if the Scuba diving tour is cancelled with a 50% refund?*
  - *What happens if the Villa cost increases by ₹10,000?*
- Computes baseline vs. projected deltas for every traveler in real-time.

### F8: Event-Grounded "Explain My Balance" Explainer
- Itemizes a traveler's financial story:
  - Group expenses fronted (+ credit)
  - Activity shares consumed (- debit)
  - Peer-to-peer transfers sent (+ credit)
  - Peer-to-peer transfers collected (- debit)
  - Vendor refunds received (- credit adjustment)
- Powered by deterministic ledger reconciliation + Groq conversational summary.

### F9: Lodging & Room Allocation Optimizer (Bin-Packing)
- Algorithmic bin-packing heuristic matching travelers to available villa/hotel rooms based on preferred tiers (`suite`, `standard`, `economy`) and room capacities.
- Computes capacity utilization efficiency scores.

### F10: Dispute Management & Balance Escrow Isolation
- Travelers can flag disputed expense allocations or peer payments.
- Disputed entries are quarantined, preventing unconfirmed payments from clearing debt balances.

### F11: Dynamic UPI VPA Deep-links & QR Code Generator
- Generates native UPI intent deep-links:
  `upi://pay?pa={upiId}&pn={payeeName}&am={amount}&cu=INR&tn=Tulis%20Settlement`
- Compatible with Google Pay, PhonePe, Paytm, and BHIM UPI.
- Renders dynamic high-contrast QR codes for direct scan-to-pay.

### F12: Settlement Audit PDF Generator
- Client-side vector PDF generation via `jspdf`.
- Generates official travel settlement reports complete with cryptographic SHA-256 verification hash, trip itinerary, itemized expense breakdowns, and final peer transfer tables.

### F13: Chaos Engineering & Stress Testing Suite
- Built-in simulation tool capable of firing **100+ concurrent out-of-order financial events**.
- Injects edge cases: negative amounts, 0-participant splits, 3-way cyclic debts, sudden cancellations.
- Audits zero-sum invariant across all iterations to prove mathematical resilience.

### F14: Squad / Participant Manager & Role Configuration
- Configures traveler profiles, default UPI IDs, dietary restrictions, room tiers, and weight factors.
- Role-based permissions: Organizer (can edit bookings and approve settlements) vs. Member (can log expenses).

### F15: Interactive Timeline & Geospatial Itinerary Map
- Visual chronos-strip of all trip activities with category-based iconography.
- Direct links between bookings and associated financial ledger outlays.

### F16: Pre-Commit Duplicate Expense Guard
- Synchronous similarity check prior to committing expenses.
- Flags existing items with matching titles, identical vendors, or amounts within 3% tolerance.

### F17: Contextual Split Method Recommendation Advisor
- Analyzes expense category and participant metadata to suggest the fairest split method (e.g., suggests `room_tier` for lodging, `line_item` for dining).

### F18: Budget vs Actuals Category Variance Engine
- Visual progress bars and breakdown metrics tracking spend across categories (`transport`, `lodging`, `activity`, `food`, `other`).
- Alerts organizers when budget ceilings are approached or breached.

### F19: Multi-Trip Workspace Switcher & Trip Cloning
- Seamless switching between multiple trips stored in Neon.
- Ability to duplicate or clone trip templates (itinerary structure and booking categories).

### F20: Passcode & Private Trip Access Gating
- Organizers can lock trips with private passcodes or restrict visibility to specific email whitelists.
- Modal gating prevents unauthorized access.

### F21: Cross-Trip Squad Netting Engine
- Consolidates balances across multiple vacations for recurring friend groups (e.g., Goa 2025 + Manali 2026) into a single unified settlement matrix.

### F22: Itinerary Feasibility & Logistical Conflict Checker
- Checks non-financial logistics:
  - `TRANSIT_OVERLAP`: Overlapping travel tickets.
  - `CHECKOUT_START_MISMATCH`: Activity departures scheduled prior to hotel checkout.

### F23: Structured RFC 4180 Accounting Export Adapter (CSV)
- One-click export of the entire trip ledger into RFC 4180 compliant CSV format suitable for Excel, Google Sheets, or corporate expense reporting.

---

## 7. Frontend Architecture & Design System Tokens

### 7.1 Color Tokens & Theming

Tulis uses a bespoke **Forest Dark Glassmorphism** design system engineered for visual luxury and high contrast:

```css
:root {
  /* Surfaces */
  --color-surface-base: #12160F;       /* Deep volcanic forest base */
  --color-surface-raised: #1B2119;     /* Elevated card background */
  --color-surface-overlay: #1B2119;    /* Modal & drawer surface */
  --color-surface-hairline: #2A322A;   /* Crisp 1px subtle borders */

  /* Text & Inks */
  --color-text-primary: #F4F2E6;       /* Warm alabaster cream */
  --color-text-secondary: #8B9A8C;     /* Sage muted gray */
  --color-text-muted: #8B9A8C;

  /* Brand Accents */
  --color-brand-primary: #5FA97D;      /* Luminous mint green */
  --color-brand-primary-dim: #3E7D5A;  /* Deep pine emerald */

  /* Financial Status Accents */
  --color-ledger-surplus: #4E9A6E;     /* Positive balance / creditor green */
  --color-ledger-surplus-bg: rgba(78, 154, 110, 0.12);
  --color-ledger-deficit: #B5484C;     /* Negative balance / debtor crimson */
  --color-ledger-deficit-bg: rgba(181, 72, 76, 0.12);
}

/* Dual Theme Semantic Tokens */
.dark {
  --color-surface-base: #0F120E;
  --color-surface-raised: #161B14;
  --color-surface-inset: #111510;
  --color-surface-overlay: #1B2219;
  --color-surface-hairline: rgba(255, 255, 255, 0.08);
  --color-ink-primary: #F4F2E6;
  --color-ink-secondary: #BAC7B8;
  --color-ink-muted: #849182;
  --color-brand-emerald: #10B981;
}

.light {
  --color-surface-base: #F7F8F5;
  --color-surface-raised: #FFFFFF;
  --color-surface-inset: #EEF1EB;
  --color-surface-overlay: #FFFFFF;
  --color-surface-hairline: rgba(0, 0, 0, 0.08);
  --color-ink-primary: #171E15;
  --color-ink-secondary: #4B5A49;
  --color-ink-muted: #6B7B68;
  --color-brand-emerald: #059669;
}
```

---

### 7.2 Typography, Motion Tokens & Micro-Interactions

- **Primary Sans:** `'Inter', -apple-system, sans-serif` — Used for body copy, buttons, and navigation.
- **Tabular Monospace:** `'JetBrains Mono', monospace` — Enforces tabular lining figures (`font-variant-numeric: tabular-nums`) so accounting columns align perfectly.
- **Unified Framer Motion Tokens (`src/lib/motion.ts`):**
  ```typescript
  export const MOTION_TOKENS = {
    spring: { type: 'spring', damping: 25, stiffness: 300 },
    easing: {
      easeInOut: [0.4, 0, 0.2, 1],
      easeOut: [0.16, 1, 0.3, 1],
    },
    duration: {
      fast: 0.15,
      base: 0.25,
      slow: 0.4,
    },
  };
  ```
- **Animated Numerical Currency (`src/components/CountUpMoney.tsx`):**
  Calculates continuous easeOut frame interpolation for currency numbers (`prefix="₹"`), preventing jarring layout jumps when balances recalculate.
- **Glass Panel Utility:**
  ```css
  .glass-panel {
    background-color: rgba(27, 33, 25, 0.75);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid #2A322A;
  }
  ```
- **Primary Action Gradient:**
  ```css
  .cta-gradient-btn {
    background: linear-gradient(135deg, #3E7D5A 0%, #5FA97D 100%);
    color: #F4F2E6;
    font-weight: 600;
    box-shadow: 0 4px 14px rgba(62, 125, 90, 0.25);
  }
  ```

---

### 7.3 Component Inventory & Hierarchy

The application frontend is structured into modular, specialized React components in [`src/components/`](file:///c:/Users/heena/Downloads/hackcelestial/src/components/):

```
src/components/
├── AccountSwitcherModal.tsx        # Profile & credential management
├── ActivityLogSection.tsx          # Event-sourced chronological history feed
├── AddBookingModal.tsx             # New itinerary item creator
├── AnomalyFeedBanner.tsx           # High-visibility conflict & discrepancy alerts
├── AuthModal.tsx                   # Google OAuth + Email OTP + password login modal
├── CancelBookingModal.tsx          # Refund policy selector & cascade preview
├── ChaosDemoModal.tsx              # 100+ concurrent event stress testing suite
├── ChatExpenseModal.tsx            # AI natural language chat parser interface
├── CountUpMoney.tsx                # Eased 60fps financial currency counter
├── CreateTripModal.tsx             # New trip setup wizard (invite code generator)
├── DashboardAccessModal.tsx        # Passcode barrier for locked trips
├── DashboardShell.tsx              # Framed workspace container & command rail
├── DebtReassignmentModal.tsx       # Transfer debt liability between travelers
├── DuplicateExpenseWarningModal.tsx# Pre-commit similarity check dialog
├── DynamicSplitDrawer.tsx          # 6-way split calculator & weight adjuster
├── EditBookingModal.tsx            # Booking time & cost modifier
├── ExpensesSection.tsx             # Expense list, category filters, and search
├── ExplainBalanceModal.tsx         # AI-powered balance breakdown modal
├── FloatingDock.tsx                # Quick-action persistent mobile bottom dock
├── GoogleAuthProvider.tsx          # Google Identity Services SDK context provider
├── Header.tsx                      # Top navigation, trip metadata, & user status
├── ItineraryGraph.tsx              # Chronological activity timeline & schedule map
├── JoinTripModal.tsx               # 6-character invite code entry dialog
├── LandingPage.tsx                 # Marketing showcase, live demo, & feature matrix
├── LiquidGlassButton.tsx           # High-polish interactive glass button
├── LiquidLogo.tsx                  # Animated brand SVG mark & emblem
├── LiquidShaderGradient.tsx        # WebGL ambient backdrop canvas
├── MyTripsModal.tsx                # Cloud personal trip library & switcher
├── Navigation.tsx                  # Primary tab bar (Overview, Expenses, Itinerary, etc.)
├── NudgeReminderModal.tsx          # WhatsApp & email debt notification generator
├── OfflineQueueIndicator.tsx       # Real-time offline status & sync counter
├── OverviewSection.tsx             # Balance cards, settlements, charts, & audit
├── ParticipantBarChart.tsx         # Outlays vs consumed shares comparison chart
├── ParticipantsSection.tsx         # Squad roster, UPI setup, and weightings
├── ReconciliationAuditCard.tsx     # Deterministic zero-sum math verification badge
├── RoomOptimizerModal.tsx          # Bin-packing lodging allocation solver
├── SettlementReportModal.tsx       # Audit PDF preview & download trigger
├── SettlementVisualizer.tsx        # Graph visualizer for simplified debt flows
├── ShareTripModal.tsx              # Invite link, QR code, and WhatsApp share
├── SpendDonutChart.tsx             # Category spend distribution donut
├── SpotlightCard.tsx               # Interactive hover-illuminated surface
├── SquadManagerModal.tsx           # Reusable travel friend group manager
├── TripAccessGateModal.tsx         # Security gate for private/unjoined trips
├── TripSwitcherModal.tsx           # Global multi-trip workspace navigator
├── TripVibeGauge.tsx               # Algorithmic squad health & settlement score
├── UpiQrModal.tsx                  # Native UPI QR code & payment deep-link
├── UpiSetupModal.tsx               # Personal UPI VPA & QR image uploader
├── UserAvatar.tsx                  # Initials avatar with status badge
├── VendorSummaryModal.tsx          # Vendor spend aggregation & contact list
└── WhatIfSimulatorModal.tsx        # Speculative scenario sandbox
```

---

## 8. Production Deployment & Operational Guide

### 8.1 Environment Variables Dictionary

To run Tulis in local or production environments, create `.env.local` containing:

```ini
# 1. Database Connection (Neon Serverless PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:npg_Xhx1ykgHS0cT@ep-tiny-mouse-a52mp86j-pooler.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"

# 2. Transactional Email Service (Resend)
RESEND_API_KEY="re_4WhyF6Sm_LojTVZmtCjn2fa9DbsWhWAv8"
RESEND_FROM_EMAIL="Tulis <onboarding@resend.dev>"

# 3. Google OAuth 2.0 Credentials
NEXT_PUBLIC_GOOGLE_CLIENT_ID="510179913493-prnuldb8fundps402c431u7eo7tea8mb.apps.googleusercontent.com"
GOOGLE_CLIENT_ID="510179913493-prnuldb8fundps402c431u7eo7tea8mb.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"

# 4. Session Security (Cryptographic HMAC-SHA256 Key)
SESSION_SECRET="tulis_super_secret_session_key_production_2026_jwt"

# 5. Natural Language AI Engine (Groq Cloud SDK)
GROQ_API_KEY="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"
```

---

### 8.2 Vercel Deployment Checklist

When deploying to Vercel:
1. **Repository Link:** Connect `https://github.com/deepakp9653-sketch/TULIS.git`.
2. **Framework Preset:** Next.js.
3. **Build Command:** `npm run build` (Next.js App Router compilation).
4. **Environment Variables:**
   - Add every variable listed in Section 8.1 into the **Vercel Project Settings $\to$ Environment Variables** dashboard for `Production`, `Preview`, and `Development`.
5. **Security Notice:**
   - *Never commit production secrets to public git repos.* If `.env.local` is rotated, update the Resend and Google API keys in both local and hosting provider dashboards.

---

### 8.3 Google Cloud Console OAuth Configuration

In Google Cloud Console (**APIs & Services $\to$ Credentials**):
1. **Client ID:** `510179913493-prnuldb8fundps402c431u7eo7tea8mb.apps.googleusercontent.com`
2. **Authorized JavaScript Origins:**
   - `http://localhost:3000` (Local testing)
   - `https://tulis.vercel.app` (Production deployment)
3. **Authorized Redirect URIs:**
   - `http://localhost:3000`
   - `https://tulis.vercel.app`
   - `https://tulis.vercel.app/api/auth/callback/google`

---

### 8.4 Verification & Stress Testing Protocol

To verify complete prototype integrity:
1. **Local Health Check:**
   ```bash
   curl -I http://localhost:3000
   # Expected: HTTP/1.1 200 OK
   ```
2. **Database Schema Verification:**
   Verify all 10 tables exist in Neon console or via query:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   ```
3. **Mathematical Stress Test:**
   - Open app $\to$ Click **Chaos Demo** in the navigation bar.
   - Click **"Execute 100 Concurrent Events"**.
   - Observe the **Reconciliation Audit Card**. Discrepancy must remain $\le 0.02$ at all times.
4. **Offline Resilience Test:**
   - Open Chrome DevTools $\to$ Network tab $\to$ Set to **Offline**.
   - Add an expense (e.g., ₹1,500 for Snacks). Observe the green offline badge appear.
   - Switch back to **Online**. Verify the badge transitions to "Synced" and the expense appears in Neon.

---

*End of Tulis Master Knowledge Base & Architecture Blueprint.*
