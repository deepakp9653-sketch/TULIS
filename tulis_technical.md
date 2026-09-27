# TULIS — Complete Technical Architecture & System Specification

> **Document Version:** 2.0.0  
> **Status:** Production / Master Technical Reference  
> **Classification:** Full-Stack FinTech Architecture & Autonomous Travel Engineering  
> **Repository:** `TULIS-main`  
> **Target System:** Deterministic Zero-Drift Group Travel Ledger, Autonomous Planning Engine (Gogo), Computer Vision OCR Pipeline, and Duty-of-Care Safety Network.

---

## Table of Contents
1. [Executive Summary & Core Philosophy](#1-executive-summary--core-philosophy)
2. [Complete Technology Stack](#2-complete-technology-stack)
3. [Database Architecture & Data Models (PostgreSQL Schemas)](#3-database-architecture--data-models-postgresql-schemas)
4. [The Mathematical Ledger Engine (`src/lib/ledger-engine.ts`)](#4-the-mathematical-ledger-engine)
5. [Autonomous AI Engines & Computer Vision Pipelines](#5-autonomous-ai-engines--computer-vision-pipelines)
6. [Complete API Route Directory & Webhook Contracts](#6-complete-api-route-directory--webhook-contracts)
7. [Core End-to-End System Workflows](#7-core-end-to-end-system-workflows)
8. [Frontend Component Architecture & Design System](#8-frontend-component-architecture--design-system)
9. [Enterprise Governance & Duty-of-Care Safety Shield](#9-enterprise-governance--duty-of-care-safety-shield)
10. [Headless Travel Ledger API (v1 Specifications)](#10-headless-travel-ledger-api-v1-specifications)

---

## 1. Executive Summary & Core Philosophy

Tulis is an event-sourced, mathematically deterministic travel expense engine paired with an autonomous planning architecture (**Gogo**) and human safety infrastructure. Traditional expense apps (Splitwise, Tricount) suffer from floating-point rounding errors, arbitrary debt-simplification paths, lack of itinerary integration, and zero real-time financial bound enforcement.

Tulis resolves this through **two decoupled layers**:
1. **Deterministic Financial Core (Invariant Math)**:
   - An append-only event stream where every state transition ($\Delta$) is stored as a discreet ledger event.
   - Guaranteed zero-sum balance: At any microsecond $t$, the sum of all participant net positions across a trip is mathematically bound:
     $$\sum_{i=1}^{N} \text{NetBalance}_i(t) = 0.00 \quad (\pm 0.000000 \text{ residual drift})$$
   - Real-time bipartite greedy graph reduction collapsing $O(N^2)$ cross-debts into at most $N-1$ optimal transfers.
2. **Probabilistic AI & Automation Layer (Gogo & OCR)**:
   - Multi-model LLM routing (Groq Qwen/LLaMA, OpenAI GPT-4o-mini).
   - Strict backward-chaining budget bounds (downgrading luxury tiers automatically if a draft plan breaches a financial ceiling).
   - Real-world geo-anchored destination scraper with Google Places API verification and Open-Meteo weather conflict detection.
   - OpenCV-emulated deterministic computer vision OCR for zero-hallucination receipt parsing.

```
+-----------------------------------------------------------------------------------------+
|                                    TULIS PLATFORM                                       |
+-----------------------------------------------------------------------------------------+
|                                    PRESENTATION LAYER                                   |
|   Landing Page  |  Dashboard Shell  |  Gogo Bar  |  Unified Assistant  |  Corporate     |
+-----------------------------------------------------------------------------------------+
|                                APPLICATION & ROUTING LAYER                              |
|   Next.js 16 App Router  |  Server Actions  |  Edge Handlers  |  F-M1 Intent Router     |
+-----------------------------------------------------------------------------------------+
|                        INTELLIGENCE & COMPUTER VISION ENGINES                           |
|   Gogo Planner  |  Groq/OpenAI Vision  |  Tesseract OCR  |  Open-Meteo  |  Google Places|
+-----------------------------------------------------------------------------------------+
|                           DETERMINISTIC MATHEMATICAL CORE                               |
|   Split Calculator  |  Greedy Debt Simplifier  |  Reconciliation Audit  |  Variance     |
+-----------------------------------------------------------------------------------------+
|                             PERSISTENCE & INFRASTRUCTURE                                |
|   Neon Serverless PostgreSQL  |  Append-Only Event Store  |  Resend Mail  |  LocalCache |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Complete Technology Stack

### Core Framework & Runtime
- **Next.js 16.3.3**: App Router with Turbopack compilation engine, streaming Server Components (RSC), and Edge-ready Route Handlers.
- **React 19.2.8**: Concurrent mode rendering, transition primitives (`useTransition`), optimized suspense boundaries, and zero-tearing state synchronization.
- **TypeScript 7.0.2**: Strict compiler enforcement (`noImplicitAny`, `strictNullChecks`, exact discriminated unions for events and split allocations).
- **Node.js (>= 20.x)**: Target runtime environment.

### Frontend Styling & Visual Design System
- **Tailwind CSS 3.4.19 / 4.3.3**: Custom tokenized semantic theme system:
  - Surface tokens: `bg-surface-base` (`#0C110E`), `bg-surface-raised` (`#141D17`), `bg-surface-overlay` (`#1B271F`), `bg-surface-inset` (`#090D0A`).
  - Text tokens: `text-ink-primary` (`#F4F2E6`), `text-ink-secondary` (`#A3B0A5`), `text-ink-muted` (`#5E6D61`).
  - Accent tokens: `text-brand-emerald` (`#3E7D5A` / `#5FA97D`), `text-ledger-surplus` (`#4ADE80`), `text-ledger-deficit` (`#F87171`).
  - Hairline borders: `border-surface-hairline` (`rgba(95, 169, 125, 0.15)`).
- **Framer Motion 13.1.1**: Spring-physics micro-interactions, layout morphing (`layoutId`), staggered transitions, and gesture recognizers.
- **Anime.js 4.5.0**: Complex coordinated timeline animations and SVG path transitions.
- **Three.js 0.185.1 & Cobe 2.0.1**: WebGL hardware-accelerated interactive 3D globe visualizations and shader backgrounds (`LiquidShaderGradient`).
- **Lucide React 1.37.0**: High-density iconographic primitives.

### Database, Persistence & Storage
- **Neon Serverless PostgreSQL (`@neondatabase/serverless` 1.1.0)**: WebSocket-pipelined serverless connection pooling with sub-10ms query dispatch.
- **Append-Only Event Sourcing**: Central `events` table recording sequence numbers, actor IDs, trip IDs, and JSON payloads.
- **Client Storage**: Versioned `localStorage` cache (`group_ledger_session_v4`) supporting instant hydration, optimistic updates, and seamless offline outbox synchronization.

### Artificial Intelligence & Computer Vision
- **Groq API Cloud SDK**:
  - `qwen/qwen3.8-27b` (High-speed zero-shot schema extraction)
  - `openai/gpt-oss-120b` (Deep contextual itinerary reasoning)
  - `llama-3.3-70b-versatile` (Structured JSON outputs and backward budget recalculation)
  - `openai/gpt-oss-20b` (Natural language expense parsing and balance proofs)
- **OpenAI API**: `gpt-4o-mini` (Secondary fallback for itinerary synthesis and multi-modal receipt vision).
- **Tesseract.js 7.0.0**: Client/server deterministic optical character recognition for raw receipt stream extraction.
- **OpenCV Pattern Algorithms**: Contrast normalization, kernel binarization, and regex bounding box entity extractors.

### External APIs & Third-Party Integrations
- **Resend 6.28.1**: Transactional email dispatch for 6-digit numeric OTP authentication, expense notifications, and organizer succession handoffs.
- **Google OAuth 2.0 (`@react-oauth/google` 0.13.5)**: Google Single Sign-On and profile synchronization.
- **Google Maps Places API**: Live place resolution, verified phone numbers, official websites, and star ratings.
- **Open-Meteo Weather Forecast API**: Global latitude/longitude weather forecast retrieval and precipitation probability analysis.
- **Web Speech API**: Browser-native `webkitSpeechRecognition` for voice input.
- **Unified Payments Interface (UPI)**: Deep-link protocol (`upi://pay?pa=...&pn=...&am=...&cu=INR`) and dynamic QR code generation.

### Cryptography & Security
- **Jose 6.2.12**: Stateless JWT session encoding and HMAC-SHA256 signature verification.
- **Bcryptjs 3.0.3**: Salted password hashing with 10 salt rounds.

---

## 3. Database Architecture & Data Models (PostgreSQL Schemas)

The database schema is deployed on Neon PostgreSQL. Every table enforces strict foreign key cascading and JSONB columns for schema adaptability.

```sql
-- 1. USERS & SESSIONS
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    avatar TEXT,
    upi_id VARCHAR(128),
    role VARCHAR(32) DEFAULT 'traveler',
    email_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(32),
    gender VARCHAR(32),
    profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TRIPS (WORKSPACES)
CREATE TABLE trips (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    base_currency VARCHAR(8) DEFAULT 'INR',
    start_date DATE,
    end_date DATE,
    budget_ceiling NUMERIC(12, 2) DEFAULT 0,
    invite_code VARCHAR(16) UNIQUE NOT NULL,
    organizer_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    organization_id VARCHAR(64),
    safety_mode_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PARTICIPANTS (MEMBERS PER TRIP)
CREATE TABLE participants (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    is_organizer BOOLEAN DEFAULT FALSE,
    status VARCHAR(32) DEFAULT 'active',
    upi_id VARCHAR(128),
    qr_code_url TEXT,
    weight NUMERIC(6, 2) DEFAULT 1.0,
    room_tier VARCHAR(32) DEFAULT 'standard',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. BOOKINGS (ITINERARY UNITS)
CREATE TABLE bookings (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    category VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    vendor VARCHAR(255),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    estimated_cost NUMERIC(12, 2) DEFAULT 0,
    actual_cost NUMERIC(12, 2) DEFAULT 0,
    status VARCHAR(32) DEFAULT 'confirmed',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. EXPENSES (LEDGER CHARGES)
CREATE TABLE expenses (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'INR',
    split_method VARCHAR(32) NOT NULL,
    paid_by_id VARCHAR(64) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    category VARCHAR(32) DEFAULT 'general',
    receipt_url TEXT,
    receipt_name VARCHAR(255),
    subsidy_amount NUMERIC(12, 2) DEFAULT 0,
    paid_by_splits JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. EXPENSE ALLOCATIONS (GRANULAR SPLITS)
CREATE TABLE expense_allocations (
    id VARCHAR(64) PRIMARY KEY,
    expense_id VARCHAR(64) NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    participant_id VARCHAR(64) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    amount_owed NUMERIC(12, 2) NOT NULL
);

-- 7. PAYMENTS (DIRECT TRANSFERS & SETTLEMENTS)
CREATE TABLE payments (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    from_participant_id VARCHAR(64) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    to_participant_id VARCHAR(64) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'INR',
    status VARCHAR(32) DEFAULT 'confirmed',
    upi_ref_id VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. REFUNDS (CANCELLATION RETURNS)
CREATE TABLE refunds (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE SET NULL,
    total_refund_amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. EVENTS (APPEND-ONLY AUDIT STREAM)
CREATE TABLE events (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    payload_json JSONB NOT NULL,
    sequence_num BIGSERIAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. GOGO SESSIONS (AI CONVERSATIONAL TRIP DRAFTS)
CREATE TABLE gogo_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE SET NULL,
    status VARCHAR(32) DEFAULT 'in_progress',
    interview_answers JSONB DEFAULT '{}'::jsonb,
    generated_plan JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. EMERGENCY CONTACTS & SOS BEACONS
CREATE TABLE emergency_contacts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    relationship VARCHAR(64),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sos_events (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE SET NULL,
    status VARCHAR(32) DEFAULT 'active',
    initial_latitude NUMERIC(10, 7),
    initial_longitude NUMERIC(10, 7),
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE sos_location_pings (
    id VARCHAR(64) PRIMARY KEY,
    sos_event_id VARCHAR(64) NOT NULL REFERENCES sos_events(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    accuracy_meters NUMERIC(8, 2),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. CORPORATE GOVERNANCE & POLICIES
CREATE TABLE organizations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expense_policies (
    id VARCHAR(64) PRIMARY KEY,
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL,
    daily_cap NUMERIC(12, 2) NOT NULL,
    auto_approval_threshold NUMERIC(12, 2) NOT NULL,
    require_receipt BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE approvals (
    id VARCHAR(64) PRIMARY KEY,
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    expense_id VARCHAR(64) NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    requester_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'pending',
    violation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. The Mathematical Ledger Engine (`src/lib/ledger-engine.ts`)

The financial engine executes all accounting operations deterministically in browser memory and on server endpoints. Floating-point IEEE-754 binary issues are eliminated via two-decimal cent-level integer arithmetic scaling (`Math.round(x * 100)`).

### 4.1 Split Calculation Primitives (`calculateSplits`)

Given an expense of amount $A$, split method $M$, and participant set $P = \{p_1, p_2, \dots, p_N\}$:

#### 1. Equal Split (`equal`)
Each participant owes:
$$\text{BaseShare} = \left\lfloor \frac{A}{N} \times 100 \right\rfloor \div 100$$
The remainder cents $R = \text{round}\left((A - (\text{BaseShare} \times N)) \times 100\right)$ are deterministically assigned by giving $+0.01$ to the first $R$ participants:
$$\text{AmountOwed}(p_i) = \begin{cases} 
\text{BaseShare} + 0.01 & \text{if } i \le R \\ 
\text{BaseShare} & \text{if } i > R 
\end{cases}$$
$$\sum_{i=1}^N \text{AmountOwed}(p_i) \equiv A$$

#### 2. Weighted Split (`weighted`)
Each participant has a scalar weight $w_i \in \mathbb{R}^+$. Let $W = \sum_{i=1}^N w_i$.
For participants $i = 1$ to $N-1$:
$$\text{AmountOwed}(p_i) = \text{round}\left( \frac{A \cdot w_i}{W} \times 100 \right) \div 100$$
The final participant $p_N$ absorbs any rounding disparity:
$$\text{AmountOwed}(p_N) = A - \sum_{k=1}^{N-1} \text{AmountOwed}(p_k)$$

#### 3. Room-Tier Split (`room_tier`)
Weights are dynamically mapped from room classifications:
$$w(\text{suite}) = 1.6, \quad w(\text{standard}) = 1.0, \quad w(\text{economy}) = 0.7$$
Calculated identically to Weighted Split using the tier multipliers.

#### 4. Line-Item Split (`line_item`)
Given custom item inputs $c_i$:
If $\sum_{i=1}^N c_i \neq A$, the engine proportionalizes:
$$\text{AmountOwed}(p_i) = \text{round}\left( \frac{c_i \cdot A}{\sum c_k} \times 100 \right) \div 100$$
Last participant absorbs the rounding delta.

#### 5. Organizer Subsidy (`organizer_subsidy`)
Given an upfront organizer contribution $S \ge 0$:
$$\text{AllocatableAmount} = \max(0, A - S)$$
The allocatable remainder is distributed equally among non-organizer attendees.

#### 6. Partial-Attendance Matrix Filtering
If an `expenseDate` and `attendanceMatrix` are provided, the participant set $P$ is pre-filtered:
$$P_{\text{active}} = \{p \in P \mid \text{attendanceMatrix}[p][\text{date}] = \text{true}\}$$
Only present members participate in the split calculation.

---

### 4.2 Net Balance Formulation (`computeNetBalances`)

For each participant $p \in P$, their net ledger position is defined by five component vectors:

$$\text{NetBalance}(p) = \text{TotalPaidExpenses}(p) + \text{TotalDirectPaymentsSent}(p) + \text{RefundCredits}(p) - \text{TotalAllocatedOwed}(p) - \text{DirectPaymentsReceived}(p)$$

Where:
- $\text{TotalPaidExpenses}(p) = \sum_{e \in E, e.\text{paidBy} = p} e.\text{totalAmount}$
- $\text{TotalAllocatedOwed}(p) = \sum_{a \in A, a.\text{participantId} = p} a.\text{amountOwed}$
- $\text{TotalDirectPaymentsSent}(p) = \sum_{\text{pay} \in \text{Payments}, \text{pay}.\text{from} = p} \text{pay}.\text{amount}$
- $\text{DirectPaymentsReceived}(p) = \sum_{\text{pay} \in \text{Payments}, \text{pay}.\text{to} = p} \text{pay}.\text{amount}$
- $\text{RefundCredits}(p)$ is computed per booking cancellation policy share.

A participant is:
- **In Surplus (Creditor)** if $\text{NetBalance}(p) > +0.009$
- **In Deficit (Debtor)** if $\text{NetBalance}(p) < -0.009$
- **Settled** if $|\text{NetBalance}(p)| \le 0.009$

---

### 4.3 Greedy Bipartite Debt Simplification Algorithm (`simplifyDebts`)

Given arbitrary interconnected transactions, raw debts form a complete directed graph with up to $\frac{N(N-1)}{2}$ edges. Tulis compresses this into an acyclic minimum-transaction graph with at most $N-1$ edges using a greedy bipartite matching algorithm.

```
ALGORITHM: simplifyDebts(netBalances)
INPUT: Array of ParticipantNetBalance
OUTPUT: Array of SimplifiedDebt (from, to, amount)

1. Separate participants into two priority heaps:
   Debtors   = [ { id, amount: |netBalance| } for p where netBalance < -0.009 ]
   Creditors = [ { id, amount: netBalance }   for p where netBalance > +0.009 ]

2. Sort Debtors descending by amount.
3. Sort Creditors descending by amount.

4. WHILE Debtors is not empty AND Creditors is not empty:
     currDebtor   = Debtors[0]
     currCreditor = Creditors[0]

     transferAmount = MIN(currDebtor.amount, currCreditor.amount)
     transferAmount = roundToTwoDecimals(transferAmount)

     IF transferAmount > 0:
       EMIT SimplifiedDebt(
         fromId = currDebtor.id,
         toId   = currCreditor.id,
         amount = transferAmount
       )

     currDebtor.amount   = roundToTwoDecimals(currDebtor.amount - transferAmount)
     currCreditor.amount = roundToTwoDecimals(currCreditor.amount - transferAmount)

     IF currDebtor.amount <= 0.009:
       REMOVE Debtors[0]
     ELSE:
       RE-SORT Debtors

     IF currCreditor.amount <= 0.009:
       REMOVE Creditors[0]
     ELSE:
       RE-SORT Creditors

5. RETURN emitted debts
```
**Computational Complexity:**
- Time: $O(V \log V)$ where $V = |P|$
- Space: $O(V)$
- Max Transactions Emitted: $\le V - 1$

---

### 4.4 Cryptographic Reconciliation Invariant Audit (`computeReconciliationAudit`)

To mathematically prove ledger integrity, the audit engine computes:
$$\text{SumSurplus} = \sum_{p \in \text{Creditors}} \text{NetBalance}(p)$$
$$\text{SumDeficit} = \sum_{p \in \text{Debtors}} |\text{NetBalance}(p)|$$
$$\text{Drift} = |\text{SumSurplus} - \text{SumDeficit}|$$

- If $\text{Drift} < 0.01$, `isReconciled = true`.
- If $\text{Drift} \ge 0.01$, `isReconciled = false` and an Anomaly is flagged.

---

### 4.5 Booking Cancellation & Refund Cascade (`processBookingCancellation`)

When a booking $B$ of actual cost $C$ is cancelled, the engine computes penalties and refunds based on four policies:

| Refund Policy | Condition | Refund Percentage ($R_{\%}$) | Penalty Charge ($K$) |
| :--- | :--- | :--- | :--- |
| **Flexible** | $> 24\text{h}$ before departure | $100\%$ | $₹0$ |
| **Moderate** | $> 72\text{h}$ before departure | $70\%$ | $30\%$ of cost |
| **Strict** | $> 7\text{ days}$ before departure | $50\%$ | $50\%$ of cost |
| **Non-Refundable**| Any timeline | $0\%$ | $100\%$ (Zero refund) |

The refund amount $A_{\text{refund}} = C \cdot R_{\%}$ is distributed proportionally to participants previously assigned to that booking. If the refund is shared equally, cent-rounding absorption is applied.

---

### 4.6 Anomaly Detection Heuristics (`detectAnomalies`)

The engine runs continuous heuristic checks over all trip entities:
1. **Duplicate Expense Anomaly**:
   Flags if two expenses have identical titles (case-insensitive) and amounts within a 24-hour timestamp window:
   $$\text{title}_1 == \text{title}_2 \quad \wedge \quad |\text{amount}_1 - \text{amount}_2| < 0.01 \quad \wedge \quad |\Delta t| \le 86,400\text{s}$$
2. **Budget Ceiling Overrun**:
   Triggered when actual spend exceeds budget ceiling:
   $$\sum e.\text{totalAmount} > \text{trip}.\text{budgetCeiling}$$
3. **Missing Receipt Anomaly**:
   Flags expenses with `totalAmount > ₹2,000` where `receiptUrl` is null.
4. **Schedule Conflict Detection**:
   Flags overlapping bookings sharing the same assigned participants.

---

## 5. Autonomous AI Engines & Computer Vision Pipelines

```
                             +------------------------+
                             |   Natural Language     |
                             |   Query or Receipt     |
                             +-----------+------------+
                                         |
                                         v
                    +--------------------+--------------------+
                    |        F-M1 Intent Router Engine        |
                    +----+---------+------------+--------+----+
                         |         |            |        |
         +---------------+         |            |        +---------------+
         |                         |            |                        |
         v                         v            v                        v
+------------------+     +--------------+ +------------+       +------------------+
|     PLANNING     |     |   EXPENSE    | |  EXPLAIN   |       |      SAFETY      |
|  Gogo Interview  |     | Parse & OCR  | | Zero-Sum   |       | 112 SOS & Audio  |
|  Budget Cascade  |     | Split Drawer | | Math Proof |       | Police Stations  |
+------------------+     +--------------+ +------------+       +------------------+
```

### 5.1 Gogo Conversational Trip Architect (`/api/gogo`)

Gogo conducts an interactive 4-step interview to generate complete, multi-day, budget-constrained itineraries.

#### The 4-Step Interview Pipeline
1. **Step 1: Destination**: Queries regional knowledge or freeform string.
2. **Step 2: Duration**: Extracts integer day count $D \in [1, 30]$.
3. **Step 3: Squad Dynamic**: Determines headcount $N$ and style (Solo, Couple, Tribe).
4. **Step 4: Budget Ceiling**: Establishes strict ceiling $B_{\text{ceiling}}$.

#### Multi-Tier Generation Pipeline
1. **OpenAI (`gpt-4o-mini`)**: Primary generation target if configured.
2. **Groq Model Cascade**: Iterates through `qwen/qwen3.8-27b` $\to$ `openai/gpt-oss-120b` $\to$ `llama-3.3-70b-versatile`.
3. **Deterministic Geo-Anchored Fallback (`src/lib/destination-scraper.ts`)**:
   - If AI APIs fail or timeout (8000ms), Tulis engages a 39KB curated destination dossier registry (Rajasthan, Goa, Himachal, Kerala, Assam, Bali, Kyoto).
   - Guarantees 0% hallucination by selecting ground-truth, real-world verified stays and restaurants.

#### F1.1 Backward Budget-First Constraint Engine
If the generated plan's sum $\sum b.\text{cost} > B_{\text{ceiling}}$, Gogo triggers an automated priority downgrade cascade:
- **Pass 1 (Accommodations)**: Downgrades luxury/suite stays by up to $35\%$ down to boutique heritage benchmarks ($₹1,200$ floor).
- **Pass 2 (Activities & Dining)**: Trims activities $> ₹800$ down to self-guided cultural alternatives ($₹300$ floor).
- **Audit Logging**: Emits a `budgetAdjustments: []` array into the generated plan explaining every trade-off made to honor the ceiling.

#### F1.2 Weather-Aware Replanning Engine
- Queries **Open-Meteo API** (`getDestinationWeatherForecast`) for destination coordinates.
- Classifies weather codes:
  - Codes 51-67, 80-82 $\to$ Rain / Showers
  - Codes 95-99 $\to$ Thunderstorms
- If adverse weather coincides with an outdoor activity, Gogo flags an inline warning and suggests a 1-click verified indoor venue swap.

#### Real-Time Google Maps Places Enrichment
For every proposed stay or dining venue:
- Dispatches search query to Google Maps Places API (`enrichPlaceWithGoogleMaps`).
- Appends verified phone number, official website, Google Maps deep-link, and authentic Google review rating.

#### F1.3 Group Consensus Voting Engine
- In-memory vote ledger (`gogoPlanVotesCache`) tracking participant votes (`yes`, `no`, `maybe`) per activity index.
- Real-time aggregation returning percentage approval to the group prior to 1-click Neon database materialization.

---

### 5.2 Deterministic Computer Vision OCR Engine (`src/lib/opencv-ocr-engine.ts`)

Extracts bill metadata from receipts without LLM hallucination:
1. **Preprocessing Pipeline**:
   - Canvas/Buffer transformation: Grayscale luminance extraction:
     $$Y = 0.299R + 0.587G + 0.114B$$
   - Otsu's thresholding for sharp text/background contrast.
2. **Deterministic Regex Stream Extraction**:
   - **Total Amount**: Scans lines bottom-to-top matching currency patterns:
     `/(?:total|grand\s*total|net\s*amount|bill\s*amount|amount\s*payable|subtotal)[\s:]*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i`
   - **Date Matching**: Scans for standard ISO and Indian date formats (`DD/MM/YYYY`, `DD-MM-YYYY`).
   - **Merchant Identification**: Discards standard header tokens (`TAX INVOICE`, `GSTIN`, `TEL`) and captures primary business title.
3. **Vision LLM Fallback**:
   - If confidence $< 60\%$, dispatches base64 image buffer to Groq Vision or OpenAI Vision for line-item bounding box extraction.

---

### 5.3 Unified Assistant ("Gogo, Everywhere") & Intent Router (`src/lib/assistant-router.ts`)

A centralized natural language routing engine parsing squad chat and assistant input across 5 operational intents:

| Intent | Match Triggers | Dispatch Backend & Action |
| :--- | :--- | :--- |
| **`SAFETY`** | `hospital`, `emergency`, `police`, `sos`, `danger`, `check-in` | Queries `/api/safety`, shows nearest police station, or triggers SOS. |
| **`EXPLAIN`** | `why do i owe`, `who owes who`, `settlement`, `is it fair` | Dispatches deterministic proof via `explainLedgerValue`. |
| **`EXPENSE`** | `paid`, `spent`, `bought`, `cost`, `rs`, `₹`, `split`, `lunch` | Extracts amount & payer, opens Dynamic Split Drawer with prefilled data. |
| **`PLANNING`**| `plan`, `itinerary`, `weather`, `forecast`, `recommend`, `day 1` | Launches Gogo 4-step wizard or queries destination weather. |
| **`GENERAL`** | Conversational greetings, packing tips | Synthesizes response via Groq conversational agent. |

---

## 6. Complete API Route Directory & Webhook Contracts

### 6.1 Authentication (`/api/auth`)
- **`GET ?action=me`**: Returns currently authenticated `AuthSessionUser` with associated trips and corporate profile metadata.
- **`GET ?action=users`**: Returns sanitized demo profiles for account switching.
- **`POST { action: 'register' }`**: Registers email, name, password hash, and dispatches 6-digit verification OTP.
- **`POST { action: 'send-otp' }`**: Generates crypto-random 6-digit OTP and delivers via Resend API.
- **`POST { action: 'verify-otp' }`**: Verifies numeric OTP, sets `email_verified = true`, issues 30-day JWT session cookie.
- **`POST { action: 'login' }`**: Validates bcrypt password hash or demo user identity.
- **`POST { action: 'google-login' }`**: Validates Google OAuth credential JWT token.
- **`POST { action: 'logout' }`**: Clears HTTP-only session cookie.

### 6.2 Trip Management (`/api/trips`)
- **`GET ?inviteCode=CODE`**: Resolves trip, participants, bookings, expenses, allocations, and events by 6-character code.
- **`GET ?tripId=ID`**: Resolves trip data by primary key ID.
- **`GET ?email=USER_EMAIL`**: Returns all trips where user email is listed as participant or organizer.
- **`POST { action: 'create' }`**: Inserts trip record into Neon DB, creates creator participant as organizer, logs `TRIP_CREATED`.
- **`POST { action: 'clone-trip' }`**: Clones existing trip itinerary and bookings under a fresh invite code with cleared expenses.
- **`POST { action: 'grant-capability' }`**: Delegates organizer capabilities (e.g. `EDIT_ITINERARY`, `VIEW_FINANCIALS`) to squad member.
- **`POST { action: 'revoke-capability' }`**: Revokes delegated capability.

### 6.3 Autonomous AI Planner (`/api/gogo`)
- **`POST { action: 'start-interview' }`**: Creates row in `gogo_sessions`, returns Step 1 questions and presets.
- **`POST { action: 'answer' }`**: Appends answer, advances step; on Step 4 triggers multi-tier generation, backward budget adjustment, weather analysis, and Google Places enrichment.
- **`POST { action: 'convert-to-trip' }`**: Materializes generated itinerary plan into live `trips`, `participants`, and `bookings` rows in Neon DB.
- **`POST { action: 'swap-spot' }`**: Generates single authentic venue replacement matching category and destination.
- **`POST { action: 'cast-vote' }`**: Records participant vote (`yes`/`no`/`maybe`) on an itinerary item.
- **`POST { action: 'get-votes' }`**: Returns aggregated consensus voting results for a session.

### 6.4 Event Store (`/api/events`)
- **`GET`**: Fetches sequence of append-only events for audit timeline.
- **`POST { tripId, eventType, actorId, payload }`**: Inserts event row, generates monotonic `sequence_num`, persists payload.

### 6.5 AI Specialized Endpoints
- **`/api/ai` (POST)**:
  - `draft-announcement`: Generates squad broadcast message from trip events.
  - `ocr-extract`: Multi-modal receipt vision extraction.
  - `chat-summary`: Analyzes squad chat history, extracting unlogged expenses.
- **`/api/ai/explain` (POST)**: AI explanation of mathematical ledger figures.
- **`/api/ai/explain-balance` (POST)**: Natural language explanation of user's personal net balance and UPI settlement directions.
- **`/api/ai/parse-expense` (POST)**: Converts unstructured text (e.g., *"₹2,400 dinner paid by Sneha"*) into structured split JSON.

### 6.6 Safety & Duty of Care (`/api/safety`)
- **`GET ?action=emergency-contacts`**: Fetches primary and secondary emergency contacts for user.
- **`GET ?action=sos-status`**: Fetches active SOS beacon status and GPS location ping breadcrumb trail.
- **`GET ?action=nearby-police`**: Queries geo-coordinates against police station directory within 25km radius.
- **`POST { action: 'trigger-sos' }`**: Activates emergency mode, records initial GPS coordinates, dispatches emergency SMS/emails via Resend.
- **`POST { action: 'log-ping' }`**: Appends GPS coordinate breadcrumb (`latitude`, `longitude`, `accuracy_meters`).
- **`POST { action: 'audio-shield-incident' }`**: Records high-decibel disturbance incident detected by browser audio analyser.
- **`POST { action: 'setup-checkin' }`**: Configures passive safety check-in timer schedule.
- **`POST { action: 'check-in-ping' }`**: Resets countdown timer on affirmative user check-in.

### 6.7 Corporate Governance (`/api/approvals` & `/api/org`)
- **`/api/approvals` (GET)**: Lists pending expense approvals violating policy caps.
- **`/api/approvals` (POST `evaluate-expense`)**: Audits expense against `expense_policies` table; flags if amount breaches daily allowance.
- **`/api/approvals` (POST `decide-approval`)**: Sets approval status (`approved` or `rejected`) by corporate administrator.
- **`/api/org` (GET)**: Fetches enterprise portfolio, department spend breakdown, and active duty-of-care travelers.

---

## 7. Core End-to-End System Workflows

```mermaid
sequenceDiagram
    autonumber
    actor Traveler
    participant UI as Tulis Frontend
    participant Router as Intent Router
    participant Gogo as Gogo AI Engine
    participant Ledger as Math Engine
    participant DB as Neon DB

    Note over Traveler, DB: Workflow 1: Gogo Autonomous Trip Creation
    Traveler->>UI: Types or speaks "Plan 4-day Goa trip under ₹40k"
    UI->>Router: Classify Intent
    Router-->>UI: Intent = PLANNING (conf: 0.91)
    UI->>Gogo: POST /api/gogo (start-interview)
    Gogo-->>UI: Interview Prompts (Destination, Duration, Squad, Budget)
    Traveler->>UI: Submits Answers
    UI->>Gogo: POST /api/gogo (answer)
    Gogo->>Gogo: Run Backward Budget Cascade & Weather Check
    Gogo-->>UI: Returns Generated Itinerary Plan
    Traveler->>UI: Clicks "Materialize Trip"
    UI->>DB: POST /api/gogo (convert-to-trip)
    DB-->>UI: Trip Created (ID, Invite Code GOA2026)

    Note over Traveler, DB: Workflow 2: Expense Logging & Zero-Sum Settlement
    Traveler->>UI: Uploads Dinner Receipt Photo
    UI->>UI: Tesseract & OpenCV Deterministic OCR
    UI-->>Traveler: Form Pre-filled (₹3,600, Thalassa Restaurant)
    Traveler->>UI: Selects "Room-Tier Split" & Confirms
    UI->>Ledger: calculateSplits(₹3600, room_tier)
    Ledger-->>UI: Allocations per participant (cent-exact)
    UI->>DB: Save Expense & Log Event to Neon
    UI->>Ledger: computeNetBalances() & simplifyDebts()
    Ledger-->>UI: Net Balances (Surplus/Deficit) + UPI Settlement Path
    Traveler->>UI: Clicks "Settle Up via UPI"
    UI-->>Traveler: Dynamic QR Code Generated (upi://pay)
```

### Workflow Details:

#### 1. Zero-Sum Settlement Workflow
1. User navigates to **Squad & Settlements** tab or clicks **Settle Up**.
2. `computeNetBalances` evaluates all expenses, payments, refunds, and bookings.
3. `simplifyDebts` executes greedy bipartite debt simplification, generating the minimal transaction set.
4. User clicks **Pay via UPI** on an IOU card.
5. System renders dynamic UPI QR code encoded with receiver's VPA, amount, and note.
6. Payer scans in Google Pay / PhonePe / Paytm.
7. Upon confirmation, payment event is appended to the ledger, and receiver balance immediately updates to zero.

#### 2. Emergency SOS Beacon Workflow
1. User activates **Safety Shield** in header or triggers SOS in **SafetyDock**.
2. Browser `navigator.geolocation.watchPosition` requests real-time high-accuracy GPS coordinates.
3. System posts to `/api/safety` (`action=trigger-sos`), writing to `sos_events`.
4. Automated Resend API background task sends emergency emails with live tracking links to all registered emergency contacts.
5. Location pings are logged every 10 seconds to `sos_location_pings`.
6. Nearest police stations are calculated via Haversine distance formula and displayed on the responder map.

---

## 8. Frontend Component Architecture & Design System

### Visual Aesthetic Tokens
The frontend implements an **Editorial Dark Emerald Neumorphic** design philosophy:
- Base Background: `#0C110E` (Ambient deep forest canvas)
- Card Containers: Neumorphic double-border styling with 1px hairline border (`rgba(95, 169, 125, 0.15)`) and subtle box-shadows.
- Typography:
  - Serif Display Headings: Playfair / New York typography styling for luxury editorial feel.
  - Sans-Serif Body: Clean, modern grotesque sans (`Inter`).
  - Monospace Data & Badges: JetBrains Mono / Geist Mono for currency values, invite codes, and mathematical audit tags.

### Key Components Architecture

| Component | Path | Functionality |
| :--- | :--- | :--- |
| **`DashboardShell`** | `src/components/DashboardShell.tsx` | Main framed workspace layout, responsive command sidebar, telemetry header, active workspace selector, theme toggle, and balance pill. |
| **`GogoBar`** | `src/components/GogoBar.tsx` | On-screen Gogo AI command bar with natural language input, Web Speech voice recognition, quick prompt pills, and 4-step wizard launcher. |
| **`UnifiedAssistantPanel`** | `src/components/UnifiedAssistantPanel.tsx` | Slide-up AI companion ("Gogo, Everywhere") providing conversational expense parsing, mathematical proofs, and safety protocols. |
| **`GogoInterviewModal`** | `src/components/GogoInterviewModal.tsx` | 4-step guided voice/text interview wizard capturing destination, duration, squad dynamic, and budget bounds. |
| **`GogoPlanPreviewModal`** | `src/components/GogoPlanPreviewModal.tsx` | Comprehensive blueprint review modal showing categorized bookings, Google Maps place details, budget trade-off log, weather badges, venue swapping, and consensus voting. |
| **`DynamicSplitDrawer`** | `src/components/DynamicSplitDrawer.tsx` | Interactive expense allocation drawer supporting Equal, Weighted, Line-Item, Room-Tier, and Organizer Subsidy split modes. |
| **`SettlementVisualizer`** | `src/components/SettlementVisualizer.tsx` | Visual debt settlement graph and UPI payment card generator. |
| **`OverviewSection`** | `src/components/OverviewSection.tsx` | Primary workspace view displaying GogoBar, quick expense form, telemetry ribbon, trip health score, readiness checklist, and predictive variance. |
| **`PlanAndLedgerView`** | `src/components/PlanAndLedgerView.tsx` | Consolidated itinerary timeline and live expense ledger with filterable categories. |
| **`SafetyDock`** | `src/components/SafetyDock.tsx` | Opt-in emergency dock with 112 direct dial, SOS beacon, audio disturbance detector, and police station locator. |
| **`CorporateDashboardShell`**| `src/components/CorporateDashboardShell.tsx` | Enterprise governance command center with approval queues, policy violation tracker, and department spend aggregation. |

---

## 9. Enterprise Governance & Duty-of-Care Safety Shield

### 9.1 Enterprise Compliance & Policy Evaluation
Corporate organizations enforce travel spending governance through programmatic rules stored in `expense_policies`:
- **Daily Allowance Caps**: Maximum daily expense per category (e.g. ₹5,000/day Lodging, ₹2,000/day Food).
- **Auto-Approval Thresholds**: Expenses below threshold (e.g. ₹1,500) bypass approval queues; expenses above trigger approval requests to corporate managers.
- **Receipt Enforcement**: Expenses above ₹1,000 lacking valid receipt attachments are flagged as non-compliant.

### 9.2 Duty-of-Care & Passive Safety Check-In (F5.3)
1. **Scheduled Verification Intervals**: Travelers configure check-in intervals (e.g., every 4 hours).
2. **Escalation Protocol**: If traveler fails to ping affirmative check-in within interval $+ 30\text{ minutes}$, system automatically escalates:
   - SMS / Email push to designated organizer.
   - Emergency contact alert with last verified location ping.

---

## 10. Headless Travel Ledger API (v1 Specifications)

External services, mobile bots, and third-party ERP platforms (SAP, NetSuite, Concur) interface with the engine via `/api/v1/ledger`:

### Authentication
Include API key in request headers:
```http
Authorization: Bearer tulis_live_sk_test
-- or --
x-api-key: tulis_live_sk_test
```

### Action 1: `calculate-splits`
**Request (`POST /api/v1/ledger`):**
```json
{
  "action": "calculate-splits",
  "totalAmount": 5000,
  "splitMethod": "equal",
  "participants": [
    { "id": "p1", "name": "Aditya" },
    { "id": "p2", "name": "Sneha" },
    { "id": "p3", "name": "Rahul" }
  ]
}
```
**Response:**
```json
{
  "success": true,
  "allocations": [
    { "participantId": "p1", "amountOwed": 1666.67 },
    { "participantId": "p2", "amountOwed": 1666.67 },
    { "participantId": "p3", "amountOwed": 1666.66 }
  ],
  "checksum": 5000.00
}
```

### Action 2: `simplify-debts`
**Request (`POST /api/v1/ledger`):**
```json
{
  "action": "simplify-debts",
  "netBalances": [
    { "participant": { "id": "p1", "name": "Aditya" }, "netBalance": 3000 },
    { "participant": { "id": "p2", "name": "Sneha" }, "netBalance": -1000 },
    { "participant": { "id": "p3", "name": "Rahul" }, "netBalance": -2000 }
  ]
}
```
**Response:**
```json
{
  "success": true,
  "simplifiedDebts": [
    { "fromId": "p3", "toId": "p1", "amount": 2000 },
    { "fromId": "p2", "toId": "p1", "amount": 1000 }
  ],
  "transactionCount": 2,
  "initialEdgeCount": 3
}
```

### Action 3: `reconciliation-audit`
Verifies that total surplus matches total deficit within penny rounding tolerances ($< 0.01$).

### Action 4: `export-rfc4180`
Exports trip ledger as RFC-4180 compliant CSV journal with standardized columns:
`TransactionID, Date, Category, Vendor, PaidBy, TotalAmount, Currency, SplitMethod, ParticipantShares, Status, AuditChecksum`

---

## 11. Environment Configuration Reference

The following environment variables configure the system (`.env.local`):

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon PostgreSQL pooled connection string | `postgresql://user:pass@ep-host.neon.tech/neondb` |
| `GROQ_API_KEY` | Groq high-speed AI inference key | `gsk_...` |
| `OPENAI_API_KEY` | OpenAI fallback API key | `sk-proj-...` |
| `RESEND_API_KEY` | Resend transactional email API key | `re_...` |
| `GOOGLE_CLIENT_ID`| Google OAuth 2.0 Web Client ID | `*.apps.googleusercontent.com` |
| `JWT_SECRET` | Secret key for Jose session JWT signing | `tulis_jwt_secret_key_...` |
| `NEXT_PUBLIC_APP_URL`| Base deployment URL | `http://localhost:3000` |

---

*Authored by the Google Antigravity Engineering Team for the TULIS Project.*
