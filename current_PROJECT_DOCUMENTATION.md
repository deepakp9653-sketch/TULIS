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
10. [Human Safety & Emergency SOS System](#10-human-safety--emergency-sos-system)
11. [Corporate Enterprise Travel Portal](#11-corporate-enterprise-travel-portal)
12. [Authentication, Security & Scoping](#12-authentication-security--scoping)
13. [API Reference & Route Specifications](#13-api-reference--route-specifications)
14. [Frontend Component Catalog](#14-frontend-component-catalog)
15. [Design System, Typography & Branding](#15-design-system-typography--branding)
16. [Deployment, Environment & Operations](#16-deployment-environment--operations)

---

## 1. Executive Summary & Product Vision

### 1.1 Product Purpose
**Tulis** is an event-sourced, double-entry financial ledger and travel management engine designed specifically for group trips, vacations, and corporate travel delegations. Standard group-splitting apps (Splitwise, Tricount, spreadsheets) fail because they treat expenses as disconnected math problems, causing floating-point rounding leaks, ambiguous multi-payer tracking, unhandled booking cancellations, and tangled debt webs.

Tulis replaces these failure modes with:
1. **Mathematical Determinism**: A strict double-entry accounting engine where $\sum \text{NetBalances} \equiv 0.00$ at all times.
2. **Deterministic Rounding Redistribution**: Cents and paise remainders are assigned by deterministic index rather than lost to floating-point truncation.
3. **Greedy Graph Debt Compression ($O(N \log N)$)**: Reduces an $N$-person debt web down to at most $N-1$ settlement paths.
4. **Direct Indian UPI Rails**: Instant peer-to-peer payment execution via dynamic QR generation and `upi://pay` deep links.
5. **Speculative "What-If" Scenario Engine**: Zero-disk dry-run simulations for traveler drops, booking cancellations, expense revisions, and budget shifts.
6. **Multimodal AI Operations**: OpenCV + Tesseract.js + Groq Vision bill receipt OCR, Whisper voice logging, Gogo conversational itinerary planner, and Trip Chat.
7. **Corporate Governance Isolation**: Enterprise portal with cost centers, travel director approval queues, and policy compliance limits.
8. **Human Safety & Emergency SOS**: One-tap emergency beacon with live GPS tracking, nearest police station lookup, emergency contacts, and public live tracking page.

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
| Styling | `tailwindcss` | 3.4.19 | Utility CSS with neumorphic design tokens and dark/light modes |
| Class Utilities | `clsx` & `tailwind-merge` | 2.1.1 / 3.6.0 | Conditional class handling and conflicting Tailwind rule merging |
| Iconography | `lucide-react` | 1.37.0 | Clean SVG icon system |
| UI Motion | `motion` (Framer Motion) | 13.1.1 | Spring physics, tab crossfades, modal presence, sliding pills |
| Complex Motion | `animejs` | 4.5.0 | Staggered timeline animations and card entrances |
| 3D Globe | `cobe` | 2.0.1 | 5KB WebGL interactive 3D globe for landing page hero |
| 3D Engine | `three` | 0.185.1 | WebGL background shaders and canvas rendering |
| 3D Types | `@types/three` | 0.185.4 | TypeScript definitions for Three.js |
| OCR Engine | `tesseract.js` | 7.0.0 | Browser-side deterministic OCR for receipt text extraction |

### 2.4 AI & Multimodal Services
| Service | Model / Provider | Purpose |
|---|---|---|
| **Vision OCR** | Groq Cloud (Llama 3.3 70B Vision) + OpenCV + Tesseract.js | Multimodal receipt scan: item extraction, tax parsing, amount total |
| **Natural Language** | Groq Cloud (Llama 3.3 70B Versatile / Qwen 3.8-27B) | Chat-based free-text expense parsing (*"Kabir paid 1200 for drinks"*) |
| **Voice Logging** | Whisper Audio API | AudioShield hands-free voice transcription |
| **AI Planner** | Gogo Agentic Interviewer (Groq / OpenAI) | Interactive conversational trip itinerary generator with geo-anchored venues |
| **AI Assistant** | Trip Chat & AI Panel | Real-time squad companion for itinerary Q&A and spend advice |
| **Chat Summarizer** | Groq Cloud (Qwen / GPT-OSS / Llama) | AI-powered group chat summary with action item extraction |
| **Venue Enrichment** | Google Maps & Places API | Real-time phone numbers, websites, ratings, Google Maps URLs for venues |

---

## 3. System Architecture & Data Flow

```
+---------------------------------------------------------------------------------------------+
|                                      CLIENT APPLICATION                                     |
|                                                                                             |
|  +--------------------+   +----------------------+   +--------------------------------+    |
|  |    Landing Page    |   |  Authentication Hub  |   |      Trip Dashboard Shell      |    |
|  | - 3D WebGL Globe   |   | - 6-Digit Email OTP  |   | - Left Command Rail            |    |
|  | - Interactive Hero  |   | - Google One-Tap/SSO |   | - Workspace Views (4 tabs)     |    |
|  | - Corporate Portal |   | - Corporate Auth     |   | - Floating AI Supertools       |    |
|  | - Safety Shield    |   | - Profile Completion |   | - Safety Dock & SOS Beacon     |    |
|  +--------------------+   +----------------------+   +--------------------------------+    |
|            |                         |                              |                       |
|            +-------------------------+------------------------------+                       |
|                                      |                                                      |
|                                      v                                                      |
|                    +-----------------------------------+                                    |
|                    |     Central State Orchestrator    |                                    |
|                    |             (page.tsx)            |                                    |
|                    |  - React 19 State Management      |                                    |
|                    |  - Offline Outbox & Sync Queue    |                                    |
|                    +-----------------------------------+                                    |
|                                      |                                                      |
|            +------------------------++--------------------------+                           |
|            |                        |                           |                           |
|            v                        v                           v                           |
| +---------------------------+ +---------------------------+ +---------------------------+   |
| | Core Ledger Engine (Math) | |  AI & Perception Services | | Safety & Emergency Layer  |   |
| | - calculateSplits (6)     | | - Groq Vision Receipt OCR | | - SOS Beacon Trigger      |   |
| | - computeNetBalances      | | - OpenCV + Tesseract OCR  | | - Live GPS Tracking       |   |
| | - simplifyDebts (Greedy)  | | - Whisper Audio Shield    | | - Nearest Police Lookup   |   |
| | - simulateDryRun          | | - Gogo Trip Planner       | | - Emergency Contacts      |   |
| | - detectAnomalies (5)     | | - NLP Expense Parser      | | - Safety Ratings          |   |
| | - checkItineraryFeasibil. | | - Trip Chat & Summarizer  | | - SafetyDock UI           |   |
| | - optimizeRoomAllocations | | - Destination Scraper     | +---------------------------+   |
| | - parseNaturalChatExpense | | - Google Maps Enrichment  |                                 |
| | - netCrossTripSquadBal.   | +---------------------------+                                 |
| +---------------------------+                                                               |
+---------------------------------------------------------------------------------------------+
                                       |
                                       | HTTPS / JSON API
                                       v
+---------------------------------------------------------------------------------------------+
|                               SERVERLESS BACKEND LAYER                                      |
|                                                                                             |
| +------------------+ +------------------+ +---------------+ +--------------+ +------------+ |
| |  /api/auth/*     | |  /api/trips/*    | |  /api/ai/*    | | /api/chat/*  | | /api/gogo  | |
| | - register       | | - CRUD Ops       | | - parse NLP   | | - send msg   | | - interview| |
| | - login / OTP    | | - join via code  | | - explain bal | | - fetch msgs | | - generate | |
| | - Google OAuth   | | - expenses       | +---------------+ | - summarize  | | - convert  | |
| | - corporate SSO  | | - payments       |                   +--------------+ | - swap-spot| |
| | - profile compl. | | - bookings       |                                    +------------+ |
| | - switch / logout| +------------------+                                                   |
| +------------------+                                                                        |
| +------------------+ +------------------+ +---------------+ +--------------+                |
| | /api/expenses    | |  /api/events     | | /api/receipts | | /api/safety  |                |
| | - GET/POST CRUD  | | - event log GET  | | - OCR process | | - SOS trigger|                |
| +------------------+ | - append POST    | +---------------+ | - contacts   |                |
|                      +------------------+                    | - police     |                |
| +------------------+ +------------------+                    | - ratings    |                |
| | /api/org         | | /api/approvals   |                    +--------------+                |
| | - create org     | | - evaluate       |                                                   |
| | - join org       | | - decide         |                                                   |
| | - link trip      | +------------------+                                                   |
| | - update policy  |                                                                        |
| +------------------+                                                                        |
+---------------------------------------------------------------------------------------------+
                                       |
       +-------------------------------+-------------------------------+
       |                               |                               |
       v                               v                               v
+----------------------+     +--------------------+          +--------------------+
|  Neon Serverless DB  |     |   Resend API       |          |  Groq / OpenAI /   |
|  (PostgreSQL 16)     |     |   (Email Engine)   |          |  Google Cloud      |
|  - Phase 1 Tables    |     |   - OTP Delivery   |          |  - Llama 3.3 70B   |
|  - Phase 2 Tables    |     |   - Trip Invites   |          |  - OpenCV + Tess.  |
|  - JSONB Allocations |     |   - Audit Reports  |          |  - Google Maps API |
+----------------------+     +--------------------+          +--------------------+
```

---

## 4. Directory & File Organization

```
TULIS-main/
├── .env.example                       # Reference environment configuration
├── .env.local                         # Local secret variables (git-ignored)
├── .gitignore                         # Git ignore rules
├── next.config.js                     # Next.js 16 bundler settings
├── next-env.d.ts                      # Next.js TypeScript environment declarations
├── package.json                       # Dependencies & build scripts
├── postcss.config.js                  # PostCSS configuration for Tailwind
├── tailwind.config.js                 # Design tokens, neumorphic color system, font pairings
├── tsconfig.json                      # Strict TypeScript compiler configuration
├── walkthrough.md                     # User walkthrough guide
├── SYSTEM_KNOWLEDGE_BASE.md           # Comprehensive system knowledge base
├── PROJECT_DOCUMENTATION.md           # Alternate architecture document
├── current_PROJECT_DOCUMENTATION.md   # This comprehensive architecture document
├── TULIS_PHASE2_IMPLEMENTATION_PLAN.md# Phase 2 implementation roadmap
│
├── public/                            # Static public assets
│   ├── tulis-logo.png.jpeg            # Official Tulis emblem & wordmark logo
│   ├── tulis-logo.png                 # Logo alias
│   ├── tulis-full.png                 # Full brand image
│   ├── tulis-icon.png                 # Square icon asset
│   ├── tulis-icon-transparent.png     # Transparent icon variant
│   ├── fareshare-full.png             # Legacy FareShare branding (pre-rename)
│   ├── fareshare-icon.png             # Legacy icon
│   ├── fareshare-icon-transparent.png # Legacy transparent icon
│   ├── fareshare-logo.png             # Legacy logo
│   ├── logo.png                       # Primary logo alias
│   └── images/                        # Illustrations & UI graphics
│       ├── goa_bg.jpg                 # Goa background hero image
│       └── travel_hero_sky.png        # Travel hero sky illustration
│
├── db/
│   ├── schema.sql                     # Phase 1 PostgreSQL DDL (core tables, indexes, foreign keys)
│   └── schema_phase2.sql              # Phase 2 DDL (safety, gogo, chat, corporate, receipts)
│
├── docs/                              # Product specification documents
│   ├── 01-GroupTrip-Ledger-UIUX-Theme-Spec.md
│   ├── 02-GroupTrip-Ledger-PRD.md
│   ├── 03-GroupTrip-Ledger-TRD.md
│   ├── 04-GroupTrip-Ledger-Feature-Extensions.md
│   ├── 05-GroupTrip-Ledger-Feature-Extensions-Vol2.md
│   └── GroupTrip_Ledger_PS_Deep_Analysis.docx
│
└── src/
    ├── app/
    │   ├── layout.tsx                 # Root layout, metadata, GoogleAuthProvider wrapper
    │   ├── page.tsx                   # Master client orchestrator (107KB — state, tabs, modals)
    │   ├── globals.css                # Neumorphic design system, CSS tokens, fonts
    │   ├── live/
    │   │   └── [sosEventId]/
    │   │       └── page.tsx           # Public live SOS emergency tracking page
    │   └── api/                       # Next.js serverless route handlers (11 groups)
    │       ├── auth/                  # Email OTP, Google OAuth, Corporate, Profile completion
    │       │   └── google/            # Google OAuth token validation
    │       ├── trips/                 # Trip CRUD, invite-code join, bookings, payments
    │       │   └── join/              # Invite code join endpoint
    │       ├── expenses/              # Standalone expense CRUD endpoint
    │       ├── events/                # Immutable ledger event stream
    │       ├── ai/                    # Groq NLP & balance explanation
    │       │   ├── parse-expense/     # NLP free-text → structured expense
    │       │   └── explain-balance/   # AI balance narrative generator
    │       ├── chat/                  # Trip group chat & AI summarization
    │       ├── gogo/                  # Gogo AI planner (interview, generate, convert, swap)
    │       ├── receipts/              # OpenCV + Tesseract OCR receipt processing
    │       ├── approvals/             # Corporate expense approval evaluation & decision
    │       ├── org/                   # Organization CRUD, member management, policies
    │       └── safety/                # Emergency contacts, SOS beacon, police, ratings
    │
    ├── components/                    # 67 Production React Components
    │   ├── ui/                        # Shared UI primitives
    │   │   └── globe.tsx              # Extracted WebGL globe widget
    │   │
    │   ├── # Core Layout & Workspace Views (8)
    │   ├── LiquidLogo.tsx             # Theme-adaptive ambient logo badge
    │   ├── LandingPage.tsx            # Interactive landing hero with 3D COBE globe
    │   ├── DashboardShell.tsx         # Responsive left command rail and top navigation
    │   ├── PlanAndLedgerView.tsx      # Consolidated Timeline + Ledger Table hub
    │   ├── SquadAndSettlementsView.tsx # Squad roster + compressed debt graph
    │   ├── OverviewSection.tsx        # Financial health, KPIs, and category spend dashboard
    │   ├── ActivityLogSection.tsx     # Audit trail with CSV/PDF export
    │   ├── ExpensesSection.tsx        # Standalone expenses list/management view
    │   │
    │   ├── # Charts & Visualizations (5)
    │   ├── SpendDonutChart.tsx        # Interactive category spend donut chart
    │   ├── ParticipantBarChart.tsx    # Member contribution bar chart
    │   ├── ItineraryGraph.tsx         # Visual itinerary timeline/dependency graph
    │   ├── SettlementVisualizer.tsx   # Visual settlement debt flow chart
    │   ├── TripVibeGauge.tsx          # Trip mood/vibe gauge widget
    │   │
    │   ├── # Participant & Squad Management (4)
    │   ├── ParticipantsSection.tsx    # Participants management section
    │   ├── SquadManagerModal.tsx      # Squad (friend group) CRUD manager
    │   ├── UserAvatar.tsx             # User avatar display/upload component
    │   ├── CountUpMoney.tsx           # Animated money count-up widget
    │   │
    │   ├── # Trip Lifecycle Modals (7)
    │   ├── CreateTripModal.tsx        # Multi-step trip creation wizard
    │   ├── JoinTripModal.tsx          # 6-character invite code entry dialog
    │   ├── ShareTripModal.tsx         # Trip invite sharing + QR code modal
    │   ├── MyTripsModal.tsx           # Multi-trip overview/selection
    │   ├── TripSwitcherModal.tsx      # Switch between active trips
    │   ├── TripSelectionGatewayModal.tsx # Trip selection entry gateway
    │   ├── TripAccessGateModal.tsx    # Trip access verification gate
    │   │
    │   ├── # Expense & Split Modals (6)
    │   ├── DynamicSplitDrawer.tsx     # 6-strategy expense split drawer
    │   ├── ChatExpenseModal.tsx       # NLP chat-based expense entry
    │   ├── DuplicateExpenseWarningModal.tsx # Duplicate expense detection warning
    │   ├── ReconciliationAuditCard.tsx # Zero-sum reconciliation verification card
    │   ├── AnomalyFeedBanner.tsx      # In-dashboard anomaly alert banner
    │   ├── VendorSummaryModal.tsx     # Vendor-level spend analysis
    │   │
    │   ├── # Booking & Itinerary Modals (3)
    │   ├── AddBookingModal.tsx        # Manual booking creation form
    │   ├── EditBookingModal.tsx       # Booking edit/update form
    │   ├── CancelBookingModal.tsx     # Booking cancellation with refund policy
    │   │
    │   ├── # Settlement & Payment Modals (5)
    │   ├── UpiQrModal.tsx             # Real-time dynamic UPI QR generator
    │   ├── UpiSetupModal.tsx          # UPI VPA setup/configuration
    │   ├── DebtReassignmentModal.tsx  # Legal peer debt transfer workflow
    │   ├── SettlementReportModal.tsx  # Printable audit sheet certificate
    │   ├── NudgeReminderModal.tsx     # Payment nudge/reminder notifications
    │   │
    │   ├── # AI & Perception Supertools (8)
    │   ├── GogoFAB.tsx                # Floating action button for Gogo AI planner
    │   ├── GogoInterviewModal.tsx     # 4-step conversational AI itinerary generator
    │   ├── GogoPlanPreviewModal.tsx   # Preview generated Gogo plan before converting
    │   ├── TripChatFAB.tsx            # Floating action button for Trip Chat
    │   ├── TripChatPanel.tsx          # Real-time chat & AI assistant panel
    │   ├── ChatSummaryCard.tsx        # AI-generated chat summary display
    │   ├── ReceiptExtractionReviewModal.tsx # OCR receipt review and confirmation
    │   ├── AudioShieldModal.tsx       # Whisper voice expense recorder
    │   │
    │   ├── # What-If & Scenario Modals (2)
    │   ├── WhatIfSimulatorModal.tsx   # Speculative dry-run scenario engine
    │   ├── RoomOptimizerModal.tsx     # Room tier optimizer/recommender
    │   │
    │   ├── # Safety & Emergency (3)
    │   ├── SafetyDock.tsx             # Emergency SOS dock + safety panel
    │   ├── SafetyModeOnboardingScreen.tsx # Safety mode setup & onboarding
    │   ├── NearestPoliceModal.tsx     # Nearest police station lookup
    │   │
    │   ├── # Corporate Enterprise (4)
    │   ├── CorporateDashboardShell.tsx# Enterprise travel governance workspace
    │   ├── CorporateAuthModal.tsx     # Corporate work email authentication
    │   ├── ApprovalQueueSection.tsx   # Corporate approval queue UI
    │   ├── OrgDashboardModal.tsx      # Organization dashboard drill-down modal
    │   │
    │   ├── # Auth & Profile Modals (4)
    │   ├── AuthModal.tsx              # Main authentication modal (login/register/OTP)
    │   ├── GoogleAuthProvider.tsx     # Google Identity Services OAuth wrapper
    │   ├── ProfileCompletionModal.tsx # Post-signup profile completion flow
    │   ├── AccountSwitcherModal.tsx   # Demo sandbox account switching
    │   │
    │   ├── # Dashboard & Access Modals (2)
    │   ├── DashboardAccessModal.tsx   # Dashboard access control gate
    │   ├── ExplainBalanceModal.tsx    # AI-powered balance explanation modal
    │   │
    │   ├── # Visual & Design Components (5)
    │   ├── LiquidGlassButton.tsx      # Glassmorphism-style reusable button
    │   ├── LiquidShaderGradient.tsx   # WebGL shader gradient background
    │   ├── SpotlightCard.tsx          # Animated spotlight card UI element
    │   ├── ReceiptUploadDropzone.tsx  # Drag-and-drop receipt upload zone
    │   ├── OfflineQueueIndicator.tsx  # Offline sync status indicator
    │   │
    │   └── # Demo & Testing (1)
    │       └── ChaosDemoModal.tsx     # Demo/showcase chaos testing modal
    │
    └── lib/                           # Business logic and shared utilities (11 modules)
        ├── types.ts                   # Full domain TypeScript type definitions (18+ interfaces)
        ├── ledger-engine.ts           # Math brain (17 functions — splits, balances, debts, dry-runs, anomalies, NLP, CSV)
        ├── db.ts                      # Neon PostgreSQL serverless client + helper functions
        ├── auth-service.ts            # JWT verification, OTP generation, session management
        ├── email-service.ts           # Resend email templates and OTP sender
        ├── user-store.ts              # Demo user accounts store & authentication helpers
        ├── mock-data.ts               # Seed data for demo trips, bookings, and squad members
        ├── motion.ts                  # Framer Motion animation tokens & variants
        ├── destination-scraper.ts     # Real-world destination data scraper (curated venue registry)
        ├── google-maps-service.ts     # Google Maps/Places API enrichment (phone, website, ratings)
        └── opencv-ocr-engine.ts       # OpenCV + Tesseract.js deterministic OCR engine
```

---

## 5. Database Schema & Data Model

Tulis utilizes a normalized PostgreSQL relational schema in **Neon Serverless PostgreSQL**, split across two DDL files: Phase 1 (core ledger) and Phase 2 (safety, AI, corporate).

### 5.1 Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ EMERGENCY_CONTACTS : "has contacts"
    USERS ||--o{ SOS_EVENTS : "triggers SOS"
    USERS ||--o{ GOGO_SESSIONS : "creates plans"
    USERS ||--o{ ORGANIZATION_MEMBERS : "belongs to"
    TRIPS ||--o{ PARTICIPANTS : "contains members"
    TRIPS ||--o{ BOOKINGS : "schedules activities"
    TRIPS ||--o{ EXPENSES : "records outlays"
    TRIPS ||--o{ PAYMENTS : "tracks settlements"
    TRIPS ||--o{ EVENTS : "emits audit trail"
    TRIPS ||--o{ TRIP_MESSAGES : "has chat"
    TRIPS ||--o{ TRIP_CHAT_SUMMARIES : "has summaries"
    TRIPS ||--o{ RECEIPT_EXTRACTIONS : "has receipts"
    BOOKINGS ||--o{ BOOKING_PARTICIPANTS : "assigns travelers"
    PARTICIPANTS ||--o{ BOOKING_PARTICIPANTS : "assigned to"
    EXPENSES ||--o{ EXPENSE_ALLOCATIONS : "debits shares"
    PARTICIPANTS ||--o{ EXPENSE_ALLOCATIONS : "owes share"
    PARTICIPANTS ||--o{ EXPENSES : "fronts payment"
    PARTICIPANTS ||--o{ PAYMENTS : "payer/payee"
    ORGANIZATIONS ||--o{ ORGANIZATION_MEMBERS : "has members"
    ORGANIZATIONS ||--o{ EXPENSE_POLICIES : "defines policies"
    ORGANIZATIONS ||--o{ APPROVALS : "manages approvals"
    EXPENSES ||--o{ APPROVALS : "requires approval"
    SOS_EVENTS ||--o{ SOS_LOCATION_PINGS : "tracks location"
```

### 5.2 Phase 1 Table Schemas (Core Ledger)

#### 1. `trips`
- `id` (VARCHAR 64, PK): Unique trip identifier.
- `title` (VARCHAR 255): Descriptive title.
- `destination` (VARCHAR 255): Target destination.
- `base_currency` (VARCHAR 10): Default `'USD'`.
- `start_date` / `end_date` (DATE): Vacation duration.
- `budget_ceiling` (NUMERIC 12,2): Optional spending limit.
- `invite_code` (VARCHAR 10, UNIQUE): 6-character uppercase alphanumeric join code.
- `organizer_id` (VARCHAR 64): Participant ID of trip chief.
- `organization_id` (VARCHAR 64, FK → organizations): Corporate org link (Phase 2).
- `created_at` (TIMESTAMPTZ): Trip initialization timestamp.

#### 2. `participants`
- `id` (VARCHAR 64, PK): Unique member identifier.
- `trip_id` (VARCHAR 64, FK → trips): Associated trip workspace.
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
- `trip_id` (VARCHAR 64, FK → trips): Parent trip.
- `title` (VARCHAR 255): Booking name (e.g., "Taj Villa Vagator").
- `category` (VARCHAR 32): `'lodging'`, `'transport'`, `'food'`, `'activity'`, `'other'`.
- `vendor` (VARCHAR 255): Service provider.
- `start_time` / `end_time` (TIMESTAMPTZ): Scheduled timeline window.
- `estimated_cost` (NUMERIC 12,2): Planned budget.
- `actual_cost` (NUMERIC 12,2): Final billed expense.
- `status` (VARCHAR 32): `'confirmed'`, `'pending'`, `'cancelled'`.
- `room_capacity` (INTEGER): Maximum headcount for lodging units.

#### 4. `booking_participants`
- `booking_id` (VARCHAR 64, FK → bookings): Assigned booking.
- `participant_id` (VARCHAR 64, FK → participants): Assigned traveler.
- Composite PK: `(booking_id, participant_id)`.

#### 5. `expenses`
- `id` (VARCHAR 64, PK): Expense identifier.
- `trip_id` (VARCHAR 64, FK → trips): Parent trip.
- `booking_id` (VARCHAR 64, Nullable): Linked booking if created from itinerary.
- `title` (VARCHAR 255): Expense description.
- `total_amount` (NUMERIC 12,2): Total invoice outlay.
- `currency` (VARCHAR 10): Default `'USD'`.
- `split_method` (VARCHAR 32): Split strategy used.
- `paid_by_id` (VARCHAR 64, FK → participants): Primary payer.
- `paid_by_splits` (JSONB): Multi-payer splits `[{participantId, amount}]`.
- `category` (VARCHAR 32): Expense classification.
- `receipt_url` (TEXT): Verified invoice proof image.
- `subsidy_amount` (NUMERIC 12,2): Organizer absorption amount.
- `cost_center` (VARCHAR 128): Corporate cost center (Phase 2).
- `approval_status` (VARCHAR 32): `'approved'`, `'pending'`, `'rejected'` (Phase 2).

#### 6. `expense_allocations`
- `id` (VARCHAR 64, PK): Allocation identifier.
- `expense_id` (VARCHAR 64, FK → expenses): Parent bill.
- `participant_id` (VARCHAR 64, FK → participants): Debited traveler.
- `amount_owed` (NUMERIC 12,2): Exact allocated share.
- `notes` (TEXT): Allocation notes.

#### 7. `payments`
- `id` (VARCHAR 64, PK): Settlement transaction identifier.
- `trip_id` (VARCHAR 64, FK → trips): Parent trip.
- `payer_id` (VARCHAR 64): Traveler sending money.
- `payee_id` (VARCHAR 64): Traveler receiving money.
- `amount` (NUMERIC 12,2): Payment value.
- `status` (VARCHAR 32): `'completed'`, `'pending'`, `'disputed'`.
- `note` (TEXT): UPI reference or transaction memo.

#### 8. `events` (Immutable Event Sourcing Log)
- `id` (VARCHAR 64, PK): Event identifier.
- `trip_id` (VARCHAR 64, FK → trips): Associated trip.
- `event_type` (VARCHAR 64): One of 33+ audit event enums.
- `payload_json` (JSONB): Complete payload snapshot.
- `actor_id` (VARCHAR 64): User who triggered mutation.
- `sequence_num` (BIGSERIAL): Monotonically increasing sequence order.
- `created_at` (TIMESTAMPTZ): Timestamp.

### 5.3 Phase 2 Table Schemas (Safety, AI, Corporate)

#### 9. `emergency_contacts`
- `id` (VARCHAR 64, PK): Contact identifier.
- `user_id` (VARCHAR 64, FK → users): Owning user.
- `name` (VARCHAR 255): Contact name.
- `phone` (VARCHAR 32): Phone number.
- `relationship` (VARCHAR 64): Relationship (default `'Friend'`).
- `is_primary` (BOOLEAN): Primary emergency contact flag.

#### 10. `sos_events`
- `id` (VARCHAR 64, PK): SOS event identifier.
- `user_id` (VARCHAR 64, FK → users): User who triggered SOS.
- `trip_id` (VARCHAR 64, FK → trips): Associated trip.
- `status` (VARCHAR 32): `'active'` or `'resolved'`.
- `initial_latitude` / `initial_longitude` (NUMERIC 10,7): GPS coordinates at trigger.
- `triggered_at` / `resolved_at` (TIMESTAMPTZ): Event lifecycle timestamps.

#### 11. `sos_location_pings`
- `id` (VARCHAR 64, PK): Ping identifier.
- `sos_event_id` (VARCHAR 64, FK → sos_events): Parent SOS event.
- `latitude` / `longitude` (NUMERIC 10,7): GPS coordinates.
- `accuracy_meters` (NUMERIC 8,2): GPS accuracy.
- `recorded_at` (TIMESTAMPTZ): Ping timestamp.

#### 12. `safety_ratings`
- `id` (VARCHAR 64, PK): Rating identifier.
- `place_id` (VARCHAR 255): External place identifier.
- `place_name` (VARCHAR 255): Human-readable name.
- `rating` (INT): 1–5 star rating.
- `comment` (TEXT): Review text.
- `submitted_by` (VARCHAR 64, FK → users): Reviewer.

#### 13. `gogo_sessions`
- `id` (VARCHAR 64, PK): Session identifier.
- `user_id` (VARCHAR 64, FK → users): Planner user.
- `trip_id` (VARCHAR 64, FK → trips): Linked trip (after conversion).
- `interview_answers` (JSONB): 4-step interview responses.
- `generated_plan` (JSONB): Full AI-generated itinerary.
- `status` (VARCHAR 32): `'in_progress'`, `'completed'`, `'converted'`.

#### 14. `receipt_extractions`
- `id` (VARCHAR 64, PK): Extraction identifier.
- `trip_id` (VARCHAR 64, FK → trips): Associated trip.
- `expense_id` (VARCHAR 64, FK → expenses): Linked expense.
- `image_url` (TEXT): Receipt image URL/base64.
- `extracted_vendor` / `extracted_amount` / `extracted_date` / `extracted_category`: Parsed fields.
- `confidence_score` (NUMERIC 4,2): OCR confidence.
- `raw_model_response` (JSONB): Full AI model response.
- `status` (VARCHAR 32): `'pending_review'`, `'confirmed'`, `'discarded'`.

#### 15. `trip_messages`
- `id` (VARCHAR 64, PK): Message identifier.
- `trip_id` (VARCHAR 64, FK → trips): Chat room.
- `sender_id` / `sender_name` / `sender_avatar`: Sender details.
- `content` (TEXT): Message body.
- `sequence_num` (BIGSERIAL): Ordering sequence.

#### 16. `trip_chat_summaries`
- `id` (VARCHAR 64, PK): Summary identifier.
- `trip_id` (VARCHAR 64, FK → trips): Associated trip.
- `summary_text` (TEXT): AI-generated summary.
- `action_items` (JSONB): Extracted to-do items.
- `covers_up_to_sequence` (BIGINT): Sequence coverage watermark.

#### 17. `organizations`
- `id` (VARCHAR 64, PK): Org identifier.
- `name` (VARCHAR 255): Company name.
- `email_domain` (VARCHAR 255): Corporate email domain.
- `billing_tier` (VARCHAR 32): Default `'growth'`.

#### 18. `organization_members`
- `id` (VARCHAR 64, PK): Membership identifier.
- `organization_id` (VARCHAR 64, FK → organizations): Parent org.
- `user_id` (VARCHAR 64, FK → users): Member user.
- `role` (VARCHAR 32): `'org_admin'`, `'manager'`, `'employee'`.
- `cost_center` (VARCHAR 128): Department attribution (default `'General'`).
- `monthly_spend_cap` (NUMERIC 12,2): Default ₹50,000.

#### 19. `expense_policies`
- `id` (VARCHAR 64, PK): Policy identifier.
- `organization_id` (VARCHAR 64, FK → organizations): Parent org.
- `category` (VARCHAR 64): Expense category.
- `max_amount` / `requires_approval_above` (NUMERIC 12,2): Policy thresholds.
- `daily_cap` (NUMERIC 12,2): Daily spending cap.
- `requires_receipt` (BOOLEAN): Receipt mandate flag.
- `auto_approval_threshold` (NUMERIC 12,2): Auto-approve ceiling.

#### 20. `approvals`
- `id` (VARCHAR 64, PK): Approval identifier.
- `expense_id` (VARCHAR 64, FK → expenses): Flagged expense.
- `organization_id` (VARCHAR 64, FK → organizations): Governing org.
- `requested_by` / `approver_id` (VARCHAR 64, FK → users): Requester & approver.
- `status` (VARCHAR 32): `'pending'`, `'approved'`, `'rejected'`.
- `policy_violation_reason` (TEXT): Why flagged.
- `decided_at` (TIMESTAMPTZ): Decision timestamp.

---

## 6. Core Ledger Engine — Mathematical Rigor

All financial computations are implemented as side-effect-free pure functions in `src/lib/ledger-engine.ts` (1,421 lines, 17 exported functions).

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
- $\text{TotalPaid}_p$: Direct expense outlays + multi-payer split contributions ($\text{paidBySplits}$) + vendor refund credits − peer settlements received.
- $\text{TotalOwed}_p$: Sum of all itemized expense allocations.

$$\sum_{p \in P} \text{NetBalance}_p \equiv 0.00 \quad (\text{Strict Double-Entry Invariant})$$

`computeReconciliationAudit()` validates this equation on every mutation. If $\Delta > 0.02$, the trip is flagged as unreconciled.

---

### 6.3 Greedy Pairwise Debt Simplification Algorithm ($O(N \log N)$)

`simplifyDebts()` executes a greedy debt compression algorithm:
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
- **Participant Drop (`REMOVE_PARTICIPANT`)**:
  - Sets target participant status to `'removed'`.
  - **Preserves all historical activity shares and expense allocations at their respective amounts**, ensuring past activities are not erased.
  - Automatically redistributes unexpensed itinerary bookings across remaining active travelers.
  - Maintains strict double-entry zero-sum reconciliation ($\Delta = ₹0.00$).
- **Booking Cancellation (`CANCEL_BOOKING`)**:
  - Tests Full ($100\%$), Partial ($10\% - 90\%$), or Non-Refundable vendor policies.
  - Automatically computes payer refund credits and group debt relief.
- **Hypothetical Cost Addition (`ADD_EXPENSE`)**:
  - Simulates adding a high-ticket item with live delta tables showing exact before-and-after net positions.
- **Expense Revision (`REVISE_EXPENSE`)**:
  - Tests impact of changing an existing expense amount.

---

### 6.5 Complete Ledger Engine Function Reference

| # | Function | Line | Purpose |
|---|---|---|---|
| 1 | `calculateSplits` | L28 | 6-strategy expense allocation calculator |
| 2 | `recalculateExpenseAllocations` | L175 | Recalculates allocations after participant roster changes |
| 3 | `computeNetBalances` | L215 | Zero-sum net balance computation from expenses, payments, refunds |
| 4 | `computeReconciliationAudit` | L339 | Real-time reconciliation audit with discrepancy detection |
| 5 | `processBookingCancellation` | L375 | Booking cancellation with refund event generation |
| 6 | `simplifyDebts` | L423 | $O(N \log N)$ greedy debt compression |
| 7 | `calculateVariance` | L474 | Budget vs actual variance per category |
| 8 | `simulateDryRun` | L509 | Speculative What-If scenario engine |
| 9 | `detectAnomalies` | L628 | 5-check anomaly detection (schedule conflict, room overcapacity, budget variance, roster mismatch, penny mismatch) |
| 10 | `explainParticipantBalance` | L799 | Event-grounded natural language balance explanation |
| 11 | `optimizeRoomAllocations` | L941 | Smart room tier assignment optimizer (2-pass: preferred tier → fill remaining) |
| 12 | `checkDuplicateExpense` | L999 | Pre-commit duplicate expense detection by amount, title, and booking link |
| 13 | `suggestSplitMethod` | L1043 | Contextual split method recommendation based on category and participants |
| 14 | `checkItineraryFeasibility` | L1100 | Schedule conflict detection (transit overlap, checkout-departure mismatch) |
| 15 | `parseNaturalChatExpense` | L1191 | NLP free-text → structured expense parser (amount, category, payer, participants) |
| 16 | `netCrossTripSquadBalances` | L1270 | Multi-trip balance consolidation for recurring friend groups |
| 17 | `generateAccountingExportCSV` | L1357 | RFC 4180 CSV generation for corporate accounting export |

---

## 7. Workspace Views & Navigation Architecture

The user dashboard utilizes a streamlined, consolidated 4-view rail navigation:

### 1. Overview (`overview`)
- **Trip Financial Health**: Logged spend vs. budget ceiling, surplus/deficit indicators, total receipts verified.
- **Visual Analytics**: Interactive Category Spend Donut Chart (`SpendDonutChart.tsx`) and Member Contribution Bar Chart (`ParticipantBarChart.tsx`).
- **Reconciliation Audit Card**: Real-time zero-sum verification display (`ReconciliationAuditCard.tsx`).
- **Anomaly Feed Banner**: Proactive anomaly alerts (`AnomalyFeedBanner.tsx`).
- **Trip Vibe Gauge**: Squad mood/energy gauge (`TripVibeGauge.tsx`).
- **Action Trays**: Quick buttons for adding expenses, bookings, sharing trips, and viewing anomalies.

### 2. Plan & Live Ledger (`plan-ledger`)
Consolidates itinerary planning and financial accounting into two focused sub-views:
- **Timeline View**: Chronological day-by-day stream of bookings with itinerary graph (`ItineraryGraph.tsx`), flight pickups, hotel check-ins, room tier tags, vendor names, and proof verification badges.
- **Ledger Table View**: High-density accounting table with live text search, category filtering (lodging, transport, activity, food), verified receipt preview modals, room-tier indicators, and allocation dispute workflows.

### 3. Squad & Settlements (`squad-settlements`)
- **Squad Roster**: Individual participant cards displaying real-time net position (`Gets back ₹X` vs `Owes squad ₹Y`), assigned room tier, custom weight, and pause/active toggle.
- **Settlement Resolution Graph**: The compressed list of $N-1$ debt paths via `SettlementVisualizer.tsx`. Each path features:
  - Payee avatar and UPI ID.
  - **1-Click UPI QR Code**: Opens dynamic high-resolution QR modal (`UpiQrModal.tsx`) for mobile scanning.
  - **Mobile Deep Link**: One-tap launch into Google Pay, PhonePe, or Paytm with pre-filled amounts.
  - **Debt Reassignment**: Allows members to transfer debt obligations (`DebtReassignmentModal.tsx`).
  - **Nudge Reminders**: Send payment reminders to debtors (`NudgeReminderModal.tsx`).
- **Cross-Trip Squad Netting**: Combines debts across multiple trips for recurring friend groups.

### 4. Audit Trail (`activity`)
- Chronological, tamper-evident log of all 33+ event types.
- Displays sequence numbers, actor attribution badges, and before/after mutation payloads.
- **RFC 4180 CSV Export**: One-click download of the complete expense and settlement ledger via `generateAccountingExportCSV()`.
- **Printable Audit Certificate**: Official PDF print sheet with zero-sum cryptographic reconciliation seal (`SettlementReportModal.tsx`).

---

## 8. Features & Capabilities Inventory

### 8.1 Summary Matrix
| Feature | Module / File | Description |
|---|---|---|
| **6-Digit Email OTP** | `AuthModal.tsx` / `email-service.ts` | Passwordless or password-protected authentication via Resend |
| **Google One-Tap / OAuth** | `GoogleAuthProvider.tsx` | One-click credential sign-in via Google Identity Services |
| **Profile Completion** | `ProfileCompletionModal.tsx` | Post-signup name, gender, mobile number collection |
| **Account Switcher** | `AccountSwitcherModal.tsx` | Demo sandbox multi-user account switching |
| **Dynamic Split Drawer** | `DynamicSplitDrawer.tsx` | Full-screen drawer for 6-strategy expense configuration |
| **Multi-Payer Support** | `DynamicSplitDrawer.tsx` | Split a single bill across multiple upfront payers |
| **Chat-Native Expense Entry** | `ChatExpenseModal.tsx` | NLP free-text expense creation from natural language |
| **Duplicate Expense Guard** | `DuplicateExpenseWarningModal.tsx` | Pre-commit similarity check preventing double billing |
| **UPI QR & Deep Links** | `UpiQrModal.tsx` / `UpiSetupModal.tsx` | NPCI-compliant `upi://pay` generation and dynamic QR codes |
| **Debt Reassignment** | `DebtReassignmentModal.tsx` | Transfer debt obligations between squad members |
| **Nudge Reminders** | `NudgeReminderModal.tsx` | Payment reminder notifications to debtors |
| **What-If Simulator** | `WhatIfSimulatorModal.tsx` | Speculative dry-run engine for drops, cancellations, and additions |
| **Room Optimizer** | `RoomOptimizerModal.tsx` | Smart room tier assignment recommender |
| **Groq Vision Receipt OCR** | `ReceiptExtractionReviewModal.tsx` | Multimodal AI + Tesseract OCR receipt extraction |
| **Receipt Upload Dropzone** | `ReceiptUploadDropzone.tsx` | Drag-and-drop receipt image upload |
| **Whisper AudioShield** | `AudioShieldModal.tsx` | Voice-activated expense recorder with speech-to-text |
| **Gogo AI Trip Planner** | `GogoInterviewModal.tsx` / `GogoPlanPreviewModal.tsx` | 4-step conversational itinerary generator with plan preview |
| **Trip Chat & AI** | `TripChatPanel.tsx` / `TripChatFAB.tsx` / `ChatSummaryCard.tsx` | Floating assistant with AI chat summarization |
| **Offline Mode** | `page.tsx` / `OfflineQueueIndicator.tsx` | Local outbox queue with automatic server sync + visual indicator |
| **Cross-Trip Netting** | `SquadAndSettlementsView.tsx` / `SquadManagerModal.tsx` | Multi-trip debt consolidation for recurring travel groups |
| **CSV & PDF Audit Export** | `ActivityLogSection.tsx` / `SettlementReportModal.tsx` | Downloadable CSV and printable PDF audit certificate |
| **Corporate Portal** | `CorporateDashboardShell.tsx` / `ApprovalQueueSection.tsx` | Enterprise travel workspace with approval queues |
| **Safety & SOS System** | `SafetyDock.tsx` / `NearestPoliceModal.tsx` | Emergency beacon, live tracking, police lookup |
| **Vendor Intelligence** | `VendorSummaryModal.tsx` | Vendor-level spend analysis and summary |
| **Booking Management** | `AddBookingModal.tsx` / `EditBookingModal.tsx` / `CancelBookingModal.tsx` | Full booking lifecycle CRUD |
| **Trip Lifecycle** | `CreateTripModal.tsx` / `JoinTripModal.tsx` / `ShareTripModal.tsx` | Trip creation, invite, and sharing |
| **Multi-Trip Management** | `MyTripsModal.tsx` / `TripSwitcherModal.tsx` / `TripSelectionGatewayModal.tsx` | Trip switching and multi-trip overview |
| **Balance Explanation** | `ExplainBalanceModal.tsx` | AI-powered natural language balance narrative |
| **Anomaly Detection** | `AnomalyFeedBanner.tsx` / `ReconciliationAuditCard.tsx` | 5-check anomaly detection and audit display |
| **Itinerary Feasibility** | `ItineraryGraph.tsx` | Visual timeline with conflict detection |
| **Chaos Demo** | `ChaosDemoModal.tsx` | Showcase/demo testing modal |

---

## 9. AI & Perception Supertools

### 9.1 Receipt Scanner Pipeline (`ReceiptExtractionReviewModal.tsx`)
A multi-engine OCR pipeline with cascading fallback:

1. **OpenCV + Tesseract.js Deterministic Engine** (`opencv-ocr-engine.ts`):
   - Browser-side text extraction using Tesseract.js 7.0.
   - Deterministic regex-based parser (`parseReceiptDeterministic`) extracts vendor, date, line items, subtotal, GST/VAT, total.
   - No network dependency — works fully offline.

2. **AI Refinement Cascade** (when `useAiRefinement=true`):
   - **OpenAI GPT-4o-mini** → first attempt to structure extracted text.
   - **Groq Cloud** (Qwen 3.8-27B / GPT-OSS-120B / Llama 3.3 70B) → fallback models.
   - Parses OCR raw text into structured `ExtractedReceiptData` with confidence scoring.

3. **Receipt Upload**: Drag-and-drop via `ReceiptUploadDropzone.tsx`.
4. **Review & Confirm**: `ReceiptExtractionReviewModal.tsx` allows manual correction before expense creation.
5. **Persistence**: Results stored in `receipt_extractions` table with confidence scores and raw model responses.

### 9.2 Whisper AudioShield Voice Logging (`AudioShieldModal.tsx`)
- Captures microphone audio in standard WebM/WAV formats.
- Transcribes natural spoken phrases: *"Paid 3,600 rupees for scuba diving in Vagator split equally"*.
- Feeds transcribed text directly into `parseNaturalChatExpense()` to extract payer, amount, title, and split rule.

### 9.3 Gogo AI Conversational Trip Planner

Accessible via the bottom-left floating pill button (`GogoFAB.tsx`), Gogo conducts a **4-step interactive interview**:

| Step | Key | Question | Presets |
|---|---|---|---|
| 1 | `destination` | Where do you want to explore? | Goa & Gokarna, Himachal, Rajasthan, Kerala |
| 2 | `duration` | How long is your journey? | 3/5/7/10+ days |
| 3 | `travelers` | Who is in the squad? | Solo/Couple/Friends(4)/Tribe(6-8) |
| 4 | `budget` | What is your budget ceiling? | ₹25K/₹50K/₹1L/₹2L+ |

**Post-Interview Pipeline:**
1. **Destination Scraper** (`destination-scraper.ts`): Fetches ground-truth venues from curated regional registry (1,109 lines of verified hotels, restaurants, activities across India).
2. **AI Generation**: Groq Cloud or OpenAI generates structured itinerary with day-by-day bookings.
3. **Geographic Filter**: Strict boundary enforcement ensures no cross-state venue hallucination.
4. **Google Maps Enrichment** (`google-maps-service.ts`): Attaches real phone numbers, official websites, Google Maps URLs, and live ratings to every venue.
5. **Plan Preview**: `GogoPlanPreviewModal.tsx` displays the complete generated itinerary for review.
6. **Swap Spot**: Users can swap individual venue recommendations with AI-powered alternatives.
7. **Convert to Trip**: One-click materialization of the plan into a real Neon DB trip with bookings and participant.

### 9.4 Trip Chat & AI Assistant (`TripChatFAB.tsx` & `TripChatPanel.tsx`)
- Accessible via the bottom-right floating action button.
- Combines squad peer messaging with an in-context AI assistant grounded in the trip's live ledger data.
- **AI Chat Summarization** (via `/api/chat` → Groq): Generates concise group chat summaries with extracted action items (`ChatSummaryCard.tsx`).
- Answers questions like *"Who owes the most right now?"*, *"What time is our airport pickup?"*, and *"Can we afford dinner at Thalassa?"*.
- Messages stored in `trip_messages` table; summaries in `trip_chat_summaries`.

### 9.5 Natural Language Expense Parser (`parseNaturalChatExpense`)
Client-side NLP engine (no API call required):
- **Amount extraction**: Handles `₹1200`, `1200rs`, `12k`, `12.5k`, comma-formatted numbers.
- **Category inference**: Detects transport, food, lodging, activity keywords.
- **Participant matching**: Maps first names from chat text to squad roster.
- **Title formulation**: Cleans and capitalizes extracted expense description.
- Returns `ParsedChatExpense` with confidence scoring.

### 9.6 AI Balance Explanation (`ExplainBalanceModal.tsx`)
- Calls `/api/ai/explain-balance` to generate a natural language narrative explaining a member's net position.
- Also uses client-side `explainParticipantBalance()` for event-grounded deterministic audit trail.

---

## 10. Human Safety & Emergency SOS System

A complete safety infrastructure built for traveler protection:

### 10.1 Safety Dock (`SafetyDock.tsx`)
- Persistent floating safety panel accessible from the dashboard.
- Quick-access emergency contacts, SOS trigger button, and safety mode toggle.
- Links to nearest police station lookup and safety ratings.

### 10.2 Safety Mode Onboarding (`SafetyModeOnboardingScreen.tsx`)
- First-time setup wizard for safety features.
- Emergency contact registration, GPS permission request, and feature overview.
- Trip-level toggle via `safetyModeEnabled` field.

### 10.3 Emergency SOS Beacon
**Trigger Flow:**
1. User taps SOS button in `SafetyDock.tsx`.
2. `POST /api/safety` (`action=sos-trigger`) creates `sos_events` record with initial GPS coordinates.
3. Initial location ping stored in `sos_location_pings`.
4. Returns a **Live Tracking URL** (`/live/[sosEventId]`).

**Live GPS Tracking:**
- Location pings sent every ~15 seconds via `POST /api/safety` (`action=sos-update`).
- Pings stored with accuracy metrics in `sos_location_pings` table.

**Resolution:**
- `POST /api/safety` (`action=sos-resolve`) marks event as resolved with timestamp.

### 10.4 Live SOS Tracking Page (`/live/[sosEventId]`)
- **Public, shareable page** — no authentication required.
- Real-time display of SOS event status, user info, location trail, and latest coordinates.
- Auto-refreshes location data periodically.
- Shows emergency contact information, time elapsed, and share button.

### 10.5 Nearest Police Station Lookup (`NearestPoliceModal.tsx`)
- `GET /api/safety` (`action=nearby-police`) fetches nearby police stations.
- **Google Places API** integration when API key is available.
- **Verified regional registry** fallback with calibrated stations for live demo.
- Displays distance, phone numbers, operating hours, and badges (Women Help Desk, Quick Response Team).

### 10.6 Place Safety Ratings
- Crowd-sourced safety scores via `POST /api/safety` (`action=safety-rating`).
- Query safety scores via `GET /api/safety` (`action=safety-score`).
- Stored in `safety_ratings` table with 1-5 star ratings and comments.

---

## 11. Corporate Enterprise Travel Portal

Accessible exclusively from the homepage Corporate Portal, `CorporateDashboardShell.tsx` isolates corporate business trips from normal personal vacations:

### 11.1 Corporate Directory Authentication
- **Corporate Auth Modal** (`CorporateAuthModal.tsx`): SSO and corporate work email verification.
- `POST /api/auth` (`action=corporate-login`): Dedicated enterprise authentication with automatic org domain matching.

### 11.2 Organization Management (`/api/org`)
- **Create Organization** (`action=create-org`): Sets up corporate workspace with email domain, cost centers, and default expense policies.
- **Join Organization** (`action=join-org`): Employee enrollment with cost center assignment.
- **Link Trip** (`action=link-trip`): Associates trips with corporate org via `trips.organization_id`.
- **Update Policy** (`action=update-policy`): Modify expense compliance thresholds.
- **Org Dashboard** (`OrgDashboardModal.tsx`): Deep-dive organizational analytics.

### 11.3 Expense Policies & Compliance
Default seeded policies per org:
| Category | Daily Cap | Auto-Approve Threshold | Receipt Required |
|---|---|---|---|
| Food & Dining | ₹3,500 | ₹1,500 | Yes |
| Accommodation | ₹8,000 | ₹5,000 | Yes |
| Transportation | ₹2,500 | ₹1,000 | Yes |
| General | ₹2,000 | ₹500 | Yes |

### 11.4 Approval Queue (`/api/approvals`)
- **Evaluate Expense** (`action=evaluate-expense`): Checks expense against org policies, auto-approves or flags for review.
- **Decide** (`action=decide`): Manager approve/reject with comments.
- **Approval Queue UI** (`ApprovalQueueSection.tsx`): Manager sign-off workflow dashboard.
- Flagging triggers: daily cap exceeded, auto-approval threshold breached, missing receipt.

---

## 12. Authentication, Security & Scoping

### 12.1 Authentication Workflow
1. **User Registration / Login**: User enters email and password, or signs in via Google OAuth.
2. **OTP Dispatch**: A 6-digit numeric code is generated and delivered to the user's inbox via Resend.
3. **JWT Session Issuance**: Upon OTP verification, a signed HS256 JWT cookie (`tulis_session`) is set with a 30-day lifetime (`HttpOnly`, `Secure`, `SameSite=Lax`).
4. **Session Hydration**: On application load, `page.tsx` queries `/api/auth?action=me` to restore user identity and sync accessible trips.
5. **Profile Completion**: After first login, `ProfileCompletionModal.tsx` collects name, gender, and mobile number.

### 12.2 Auth Actions (10 total)
| Action | Method | Purpose |
|---|---|---|
| `me` | GET | Returns authenticated user session and accessible trips |
| `register` | POST | Creates user account, sends verification OTP |
| `login` | POST | Verifies credentials, sends verification OTP |
| `verify-otp` | POST | Validates 6-digit code, sets signed session cookie |
| `send-otp` / `login-otp` | POST | Passwordless sign-in OTP flow |
| `resend-otp` | POST | Resends OTP code to user's email |
| `corporate-login` | POST | Enterprise authentication with org domain matching |
| `complete-profile` | POST | Post-signup profile (name, gender, phone) |
| `switch` | POST | Demo sandbox account switcher |
| `logout` | POST | Clears session cookie and resets client state |

### 12.3 Trip-Level Scoping
Users only see trips they have legitimate access to, enforced in `auth-service.ts`:
1. The user created the trip (`trips.organizer_id = userId`).
2. The user was linked as a trip member (`trip_members.user_id = userId`).
3. The user's authenticated email matches a participant profile (`participants.email = userEmail`).

---

## 13. API Reference & Route Specifications

### 13.1 Authentication Routes (`/api/auth`)
- `GET /api/auth?action=me`: Returns authenticated user session and accessible trips.
- `POST /api/auth` (`action=register`): Creates user account, sends verification OTP.
- `POST /api/auth` (`action=login`): Verifies credentials, sends verification OTP.
- `POST /api/auth` (`action=verify-otp`): Validates 6-digit code, sets signed session cookie.
- `POST /api/auth` (`action=send-otp`): Passwordless OTP sign-in flow.
- `POST /api/auth` (`action=resend-otp`): Resends OTP to user's email.
- `POST /api/auth` (`action=corporate-login`): Authenticates corporate user with cost center scope.
- `POST /api/auth` (`action=complete-profile`): Saves name, gender, phone to user profile.
- `POST /api/auth` (`action=switch`): Demo sandbox account switcher.
- `POST /api/auth` (`action=logout`): Clears session cookie and resets client state.
- `POST /api/auth/google`: Validates Google ID token and issues session cookie.

### 13.2 Trip Routes (`/api/trips`)
- `GET /api/trips`: Fetches all trips accessible to the authenticated user.
- `POST /api/trips` (`action=create`): Initializes new trip, creator participant, and initial bookings.
- `POST /api/trips` (`action=save-expense`): Persists expense, multi-payer splits, and allocations.
- `POST /api/trips` (`action=save-booking`): Persists itinerary booking and assigned traveler IDs.
- `POST /api/trips` (`action=update-booking`): Updates booking status (e.g., cancellation + refund).
- `POST /api/trips` (`action=record-payment`): Persists peer-to-peer settlement payment.
- `POST /api/trips` (`action=log-event`): Appends immutable audit event to `events` table.
- `POST /api/trips/join`: Joins a trip via 6-character invite code.

### 13.3 Expense Routes (`/api/expenses`)
- `GET /api/expenses?tripId=...`: Fetches all expenses with joined allocations for a trip.
- `POST /api/expenses`: Persists a new expense with allocations to Neon DB.

### 13.4 Event Routes (`/api/events`)
- `GET /api/events`: Fetches the latest 100 events across all trips.
- `POST /api/events`: Appends a new immutable event to the events table.

### 13.5 AI Routes (`/api/ai/*`)
- `POST /api/ai/parse-expense`: NLP endpoint converting free-text messages to structured expense objects.
- `POST /api/ai/explain-balance`: Generates natural language narrative explaining a member's net position.

### 13.6 Chat Routes (`/api/chat`)
- `GET /api/chat?tripId=...&since=...`: Fetches trip chat messages (with optional `since` filter for polling).
- `POST /api/chat` (`action=send`): Sends a new chat message to the trip group.
- `POST /api/chat` (`action=summarize`): AI-powered chat summarization with action item extraction (Groq Cloud).

### 13.7 Gogo AI Planner Routes (`/api/gogo`)
- `POST /api/gogo` (`action=start-interview`): Initializes a new Gogo planning session.
- `POST /api/gogo` (`action=answer`): Submits an interview answer and advances to next question or triggers plan generation.
- `POST /api/gogo` (`action=convert-to-trip`): Materializes a generated plan into a real Neon DB trip with bookings.
- `POST /api/gogo` (`action=swap-spot`): Swaps a venue recommendation with an AI-powered alternative.

### 13.8 Receipt OCR Routes (`/api/receipts`)
- `POST /api/receipts`: Processes a receipt image through the OpenCV + Tesseract + AI cascade and returns extracted data.

### 13.9 Approval Routes (`/api/approvals`)
- `GET /api/approvals?orgId=...`: Fetches all approval requests for an organization.
- `POST /api/approvals` (`action=evaluate-expense`): Evaluates an expense against org policies.
- `POST /api/approvals` (`action=decide`): Manager approve/reject decision with comments.

### 13.10 Organization Routes (`/api/org`)
- `GET /api/org?orgId=...` or `GET /api/org?email=...`: Fetches organization details, members, and policies.
- `POST /api/org` (`action=create-org`): Creates a new corporate workspace with default policies.
- `POST /api/org` (`action=join-org`): Joins an existing organization.
- `POST /api/org` (`action=link-trip`): Links a trip to a corporate workspace.
- `POST /api/org` (`action=update-policy`): Updates expense compliance policy thresholds.

### 13.11 Safety Routes (`/api/safety`)
- `GET /api/safety?action=emergency-contacts`: Fetches user's emergency contacts.
- `GET /api/safety?action=sos-status&sosEventId=...`: Fetches SOS event status and location trail.
- `GET /api/safety?action=nearby-police&lat=...&lng=...`: Nearby police station lookup.
- `GET /api/safety?action=safety-score&placeId=...`: Place safety score.
- `POST /api/safety` (`action=add-emergency-contact`): Adds emergency contact.
- `POST /api/safety` (`action=delete-emergency-contact`): Removes emergency contact.
- `POST /api/safety` (`action=sos-trigger`): Triggers emergency SOS beacon with GPS.
- `POST /api/safety` (`action=sos-update`): Updates SOS location ping (~15s interval).
- `POST /api/safety` (`action=sos-resolve`): Resolves SOS beacon safely.
- `POST /api/safety` (`action=safety-rating`): Submits place safety rating.

---

## 14. Frontend Component Catalog

### Core Layout & Workspace Views (8)
| Component | File | Responsibility |
|---|---|---|
| `LiquidLogo` | `src/components/LiquidLogo.tsx` | Official brand badge with ambient glow and scale emblem |
| `LandingPage` | `src/components/LandingPage.tsx` | Marketing landing page with interactive 3D WebGL globe |
| `DashboardShell` | `src/components/DashboardShell.tsx` | Left command rail, workspace views, theme toggle, logout |
| `PlanAndLedgerView` | `src/components/PlanAndLedgerView.tsx` | Synchronized hub for Timeline and Ledger Table |
| `SquadAndSettlementsView` | `src/components/SquadAndSettlementsView.tsx` | Squad roster, room tiers, weights, and settlement graph |
| `OverviewSection` | `src/components/OverviewSection.tsx` | Spend KPIs, budget progress, donut/bar charts, vibe gauge |
| `ActivityLogSection` | `src/components/ActivityLogSection.tsx` | Event log audit trail with CSV download & PDF certificate |
| `ExpensesSection` | `src/components/ExpensesSection.tsx` | Standalone expenses list/management section |

### Charts & Visualizations (5)
| Component | File | Responsibility |
|---|---|---|
| `SpendDonutChart` | `src/components/SpendDonutChart.tsx` | Interactive category spend donut chart |
| `ParticipantBarChart` | `src/components/ParticipantBarChart.tsx` | Member contribution horizontal bar chart |
| `ItineraryGraph` | `src/components/ItineraryGraph.tsx` | Visual itinerary timeline/dependency graph |
| `SettlementVisualizer` | `src/components/SettlementVisualizer.tsx` | Visual settlement debt flow chart |
| `TripVibeGauge` | `src/components/TripVibeGauge.tsx` | Trip mood/vibe gauge widget |

### Modals & Supertools (48)
| Component | File | Responsibility |
|---|---|---|
| `AuthModal` | `src/components/AuthModal.tsx` | Main authentication modal (login/register/OTP) |
| `GoogleAuthProvider` | `src/components/GoogleAuthProvider.tsx` | Google Identity Services OAuth wrapper |
| `ProfileCompletionModal` | `src/components/ProfileCompletionModal.tsx` | Post-signup profile completion flow |
| `AccountSwitcherModal` | `src/components/AccountSwitcherModal.tsx` | Demo sandbox account switching |
| `CreateTripModal` | `src/components/CreateTripModal.tsx` | Multi-step trip creation wizard |
| `JoinTripModal` | `src/components/JoinTripModal.tsx` | 6-character invite code entry dialog |
| `ShareTripModal` | `src/components/ShareTripModal.tsx` | Trip invite sharing + QR code |
| `MyTripsModal` | `src/components/MyTripsModal.tsx` | Multi-trip overview/selection |
| `TripSwitcherModal` | `src/components/TripSwitcherModal.tsx` | Switch between active trips |
| `TripSelectionGatewayModal` | `src/components/TripSelectionGatewayModal.tsx` | Trip selection entry gateway |
| `TripAccessGateModal` | `src/components/TripAccessGateModal.tsx` | Trip access verification gate |
| `DashboardAccessModal` | `src/components/DashboardAccessModal.tsx` | Dashboard access control gate |
| `DynamicSplitDrawer` | `src/components/DynamicSplitDrawer.tsx` | 6-split strategy expense configurator |
| `ChatExpenseModal` | `src/components/ChatExpenseModal.tsx` | NLP chat-based expense entry |
| `DuplicateExpenseWarningModal` | `src/components/DuplicateExpenseWarningModal.tsx` | Duplicate expense detection warning |
| `VendorSummaryModal` | `src/components/VendorSummaryModal.tsx` | Vendor-level spend analysis |
| `AddBookingModal` | `src/components/AddBookingModal.tsx` | Manual booking creation form |
| `EditBookingModal` | `src/components/EditBookingModal.tsx` | Booking edit/update form |
| `CancelBookingModal` | `src/components/CancelBookingModal.tsx` | Booking cancellation with refund policy |
| `UpiQrModal` | `src/components/UpiQrModal.tsx` | Dynamic high-resolution UPI QR code generator |
| `UpiSetupModal` | `src/components/UpiSetupModal.tsx` | UPI VPA setup/configuration |
| `DebtReassignmentModal` | `src/components/DebtReassignmentModal.tsx` | Legal peer debt transfer workflow |
| `SettlementReportModal` | `src/components/SettlementReportModal.tsx` | Printable final audit report certificate |
| `NudgeReminderModal` | `src/components/NudgeReminderModal.tsx` | Payment nudge/reminder notifications |
| `WhatIfSimulatorModal` | `src/components/WhatIfSimulatorModal.tsx` | Speculative dry-run scenario engine |
| `RoomOptimizerModal` | `src/components/RoomOptimizerModal.tsx` | Room tier optimizer/recommender |
| `GogoFAB` | `src/components/GogoFAB.tsx` | Floating trigger for Gogo AI planner |
| `GogoInterviewModal` | `src/components/GogoInterviewModal.tsx` | 4-step conversational itinerary generator |
| `GogoPlanPreviewModal` | `src/components/GogoPlanPreviewModal.tsx` | Preview generated plan before converting |
| `TripChatFAB` | `src/components/TripChatFAB.tsx` | Floating trigger for Trip Chat |
| `TripChatPanel` | `src/components/TripChatPanel.tsx` | Real-time chat & AI assistant panel |
| `ChatSummaryCard` | `src/components/ChatSummaryCard.tsx` | AI-generated chat summary display |
| `ReceiptExtractionReviewModal` | `src/components/ReceiptExtractionReviewModal.tsx` | OCR receipt review and confirmation |
| `ReceiptUploadDropzone` | `src/components/ReceiptUploadDropzone.tsx` | Drag-and-drop receipt upload zone |
| `AudioShieldModal` | `src/components/AudioShieldModal.tsx` | Whisper speech-to-text hands-free expense entry |
| `ExplainBalanceModal` | `src/components/ExplainBalanceModal.tsx` | AI-powered balance explanation modal |
| `ReconciliationAuditCard` | `src/components/ReconciliationAuditCard.tsx` | Zero-sum reconciliation verification card |
| `AnomalyFeedBanner` | `src/components/AnomalyFeedBanner.tsx` | In-dashboard anomaly alert banner |
| `SafetyDock` | `src/components/SafetyDock.tsx` | Emergency SOS dock + safety panel |
| `SafetyModeOnboardingScreen` | `src/components/SafetyModeOnboardingScreen.tsx` | Safety mode setup & onboarding |
| `NearestPoliceModal` | `src/components/NearestPoliceModal.tsx` | Nearest police station lookup |
| `CorporateDashboardShell` | `src/components/CorporateDashboardShell.tsx` | Enterprise business travel portal |
| `CorporateAuthModal` | `src/components/CorporateAuthModal.tsx` | Corporate work email authentication |
| `ApprovalQueueSection` | `src/components/ApprovalQueueSection.tsx` | Corporate approval queue UI |
| `OrgDashboardModal` | `src/components/OrgDashboardModal.tsx` | Organization dashboard drill-down |
| `SquadManagerModal` | `src/components/SquadManagerModal.tsx` | Squad (friend group) CRUD manager |
| `ChaosDemoModal` | `src/components/ChaosDemoModal.tsx` | Demo/showcase chaos testing modal |

### Shared UI & Visual Components (6)
| Component | File | Responsibility |
|---|---|---|
| `LiquidGlassButton` | `src/components/LiquidGlassButton.tsx` | Glassmorphism-style reusable button |
| `LiquidShaderGradient` | `src/components/LiquidShaderGradient.tsx` | WebGL shader gradient background |
| `SpotlightCard` | `src/components/SpotlightCard.tsx` | Animated spotlight card UI element |
| `UserAvatar` | `src/components/UserAvatar.tsx` | User avatar display/upload component |
| `CountUpMoney` | `src/components/CountUpMoney.tsx` | Animated money count-up widget |
| `OfflineQueueIndicator` | `src/components/OfflineQueueIndicator.tsx` | Offline sync status indicator |
| `ParticipantsSection` | `src/components/ParticipantsSection.tsx` | Standalone participants management |
| `ui/globe` | `src/components/ui/globe.tsx` | Extracted WebGL globe widget |

---

## 15. Design System, Typography & Branding

### 15.1 Brand Identity
The official brand identity of Tulis is defined by the **Balance-Scale Emblem and Wordmark** (`public/tulis-logo.png.jpeg`):
- **Symbolism**: The balance scale sits symmetrically over the letters **"U"** and **"I"**, representing mathematical equity, fair distribution, and zero-sum balance between squad members.
- **Implementation**: Handled through `LiquidLogo.tsx` with a high-contrast container that renders crisply across both dark and light modes.
- **Legacy**: Previous branding as "FareShare" is preserved in `public/fareshare-*.png` assets.

### 15.2 Typography
- **Sans Primary**: *Inter* (weights 300–800) for clean, legible interface text, headings, and control labels.
- **Numeric & Mono**: *JetBrains Mono* (weights 400–700) for currency amounts, invite codes, mathematical deltas, and code displays.
- Loaded via Google Fonts CDN import in `globals.css`.

### 15.3 Neumorphic Design System
The UI implements a comprehensive **Neumorphism** (soft UI) design language with dual-shadow rendering:

#### Light Mode Tokens
```css
:root {
  --color-page: #EBF1F6;
  --color-surface-base: #EBF1F6;
  --color-surface-raised: #F6FAFE;
  --color-surface-overlay: #FFFFFF;
  --color-surface-inset: #DEE6EF;
  --color-surface-hairline: rgba(100, 116, 139, 0.16);
  --color-text-primary: #0F172A;
  --color-text-secondary: #334155;
  --color-text-muted: #64748B;
  --color-brand-primary: #059669;
  --color-brand-primary-dim: #047857;
  --color-ledger-surplus: #059669;
  --color-ledger-deficit: #E11D48;

  /* Neumorphic Dual Shadows */
  --neu-flat: 6px 6px 14px #C4CEDB, -6px -6px 14px #FFFFFF;
  --neu-pressed: inset 3px 3px 6px #C4CEDB, inset -3px -3px 6px #FFFFFF;
  --neu-glow: 0 0 15px rgba(16, 185, 129, 0.25);
}
```

#### Dark Mode Tokens
```css
.dark {
  --color-page: #121620;
  --color-surface-base: #121620;
  --color-surface-raised: #1A202C;
  --color-surface-overlay: #222938;
  --color-surface-inset: #0D1018;
  --color-surface-hairline: rgba(255, 255, 255, 0.08);
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #94A3B8;
  --color-text-muted: #64748B;
  --color-brand-primary: #10B981;
  --color-brand-primary-dim: #059669;
  --color-ledger-surplus: #10B981;
  --color-ledger-deficit: #F43F5E;

  /* Neumorphic Dual Shadows */
  --neu-flat: 6px 6px 16px #080B10, -6px -6px 16px #1E2636;
  --neu-pressed: inset 3px 3px 6px #080B10, inset -3px -3px 6px #1E2636;
  --neu-glow: 0 0 20px rgba(16, 185, 129, 0.3);
}
```

#### Neumorphic CSS Utilities
| Class | Purpose |
|---|---|
| `.neu-card` | Raised card surface with flat shadows, `border-radius: 1.5rem` |
| `.neu-card-sm` | Smaller raised card, `border-radius: 1rem` |
| `.neu-inset` | Pressed/inset surface for inputs and wells |
| `.neu-input` | Form input with inset shadow and focus glow |
| `.neu-btn` | Interactive button with hover lift and active press |
| `.neu-btn-primary` | Primary gradient button (emerald gradient) |

### 15.4 Tailwind Extended Tokens
Custom Tailwind config extends with semantic color scales, ledger-specific tokens, and shadow utilities:
- **Surface colors**: `surface-base`, `surface-raised`, `surface-overlay`, `surface-inset`, `surface-hairline`
- **Ink colors**: `ink-primary`, `ink-secondary`, `ink-muted`
- **Brand colors**: `brand-emerald`, `brand-emeraldDim`, `brand-coral`, `brand-mint`
- **Ledger colors**: `ledger-surplus`, `ledger-deficit`, `ledger-neutral`
- **Box shadows**: `shadow-paper`, `shadow-mint`, `shadow-subtle`, `shadow-glass`, `shadow-card`

---

## 16. Deployment, Environment & Operations

### 16.1 Environment Variables (`.env.local`)
```env
# Database (Neon Serverless PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Session Secret for JWT Cookies
SESSION_SECRET="tulis_super_secret_session_key_production_2026_jwt"

# Transactional Email (Resend)
RESEND_API_KEY="re_your_resend_api_key_here"

# Google OAuth Credentials
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Multimodal AI & OCR (Groq Cloud API)
GROQ_API_KEY="gsk_your_groq_api_key"

# App Public URL
NEXT_PUBLIC_APP_URL="https://tulis.vercel.app"

# Google Maps & Places API (For venue phone numbers, websites, live ratings)
GOOGLE_MAPS_API_KEY="your_google_maps_api_key_here"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key_here"

# OpenAI API Key (Optional — Gogo planner fallback)
OPENAI_API_KEY="sk_your_openai_api_key"
```

### 16.2 Local Execution
```bash
# Install dependencies
npm install

# Run TypeScript compilation check
npx tsc --noEmit

# Start development server
npm run dev
```

### 16.3 Production Build & Verification
```bash
# Production bundle build
npm run build

# Start production server
npm start
```

### 16.4 Domain Type Reference

All domain types are defined in `src/lib/types.ts` (316 lines, 18+ exported interfaces):

| Type | Purpose |
|---|---|
| `SplitMethod` | 6 split strategy union type |
| `BookingCategory` | Expense/booking category enum |
| `TabType` | Dashboard navigation tab enum (9 tabs) |
| `EventType` | 33 immutable event type union |
| `Trip` | Trip entity with budget, invite code, safety mode |
| `Participant` | Squad member with UPI, weight, room tier |
| `Vendor` | Vendor entity with contact, rating, spend |
| `RefundPolicy` / `RefundEvent` | Refund transaction model |
| `Booking` | Itinerary booking with capacity, refund policy |
| `Expense` | Expense with multi-payer, allocations, OCR metadata |
| `ExpenseAllocation` | Per-participant allocation with dispute tracking |
| `Payment` | Peer-to-peer settlement transaction |
| `LedgerEvent` | Immutable audit event record |
| `SimplifiedDebt` | Compressed settlement path |
| `ParticipantNetBalance` | Real-time net position calculation |
| `ReconciliationAudit` | Zero-sum audit metrics |
| `Anomaly` | 5-type anomaly detection model |
| `Squad` / `SquadMember` | Friend group management |
| `DryRunDelta` / `DryRunResult` | What-If simulation results |
| `DebtReassignment` | Debt transfer workflow |
| `ItineraryConflict` | Schedule conflict detection |
| `OfflineCommand` | Offline queue command model |
| `ParsedChatExpense` | NLP-parsed expense from free text |

---

## 17. Antigravity Specification Deliverables (Phases 1–6)

### 17.1 The Moonshot Program Architecture

| Feature | Code Surface | Key Capabilities |
|---|---|---|
| **F-M1: Unified AI Companion ("Gogo, Everywhere")** | `src/components/UnifiedAssistantFAB.tsx`<br/>`src/components/UnifiedAssistantPanel.tsx`<br/>`src/lib/assistant-router.ts` | Single persistent assistant thread replacing fractured floating buttons. Dynamic heuristic intent router classifies queries (`PLANNING`, `EXPENSE`, `EXPLAIN`, `SAFETY`) with actionable UI cards. |
| **F-M2: Pool Contribution Mode (Common Kitty / Pot)** | `src/components/PoolContributionModal.tsx`<br/>`src/lib/ledger-engine.ts` (`computePoolState`)<br/>`db/schema_phase3.sql` (`pool_contributions`) | Shared upfront kitty. Expenses draw down against the shared pot first (`paidById: 'pool'`), preserving zero-sum balance invariants without bilateral debt webs. Leftover funds distributed proportionally at trip closure. |
| **F-M3: Headless Travel Ledger API** | `src/app/api/v1/ledger/route.ts`<br/>`src/components/HeadlessApiDocsModal.tsx` | Versioned, authenticated REST API (`/api/v1/ledger`) exposing core deterministic financial operations: `calculate-splits`, `simplify-debts`, `reconciliation-audit`, `export-rfc4180`, and `pool-state`. Live interactive developer sandbox in Corporate ERP dashboard. |
| **F-M4: Universal Itinerary DNA Importer** | `src/components/UniversalItineraryImporterModal.tsx`<br/>`src/lib/itinerary-dna-mapper.ts`<br/>`db/schema_phase3.sql` (`trip_templates`) | Ingests TripIt JSON, Wanderlog JSON, AI markdown plans, and curated adventure skeletons (Spiti Valley, Goa, Coorg) directly into standard TULIS `Booking[]` schema with 1-click ledger commitment. |
| **F-M5: TULIS Verified Trust Badge** | `src/app/verified/[tripId]/page.tsx`<br/>`src/components/VerifiedBadgeCard.tsx` | Publicly shareable, tamper-evident cryptographic trust badge. Generates deterministic proof hash (`0x...b3e8`) verified against the zero-sum ledger invariant ($\sum \text{NetBalances} \equiv 0.00$). Embedded iframe and social sharing links. |

### 17.2 Additive Database Migration Architecture (`db/schema_phase3.sql`)
1. `gogo_plan_votes` — F1.3 Group consensus voting
2. `vendor_reliability_signals` — F3.1 Real vendor variance history
3. `participant_attendance` — F3.2 Day-by-day partial trip attendance matrix
4. `participant_capabilities` — F2.3 Granular role-based capability delegation
5. `checkin_schedules` & `checkin_responses` — F5.3 Automated check-in heartbeat
6. `travel_documents` — FC.7 Corporate passport/visa compliance locker
7. `booking_extractions` — F3.3 Email booking parsing queue
8. `trip_location_shares` & `trip_location_pings` — F3.4 Opt-in logistics & rendezvous tracking
9. `pool_contributions` — F-M2 Common kitty ledger events
10. `trip_templates` — F-M4 Forkable itinerary marketplace

### 17.3 Automated Mathematical Invariant Test Suite
Registered under `npm run test:ledger` via `scripts/verify-ledger.mjs`:
- **Test 1**: Penny Rounding Absorption Invariant (Zero-drift distribution)
- **Test 2**: Minimal Bilateral Debt Reduction (Greedy $N-1$ graph optimization)
- **Test 3**: Pool Contribution Kitty & Proportional Leftover Refund distribution
- **Test 4**: Intent Router Heuristic Classification
- **Test 5**: Cryptographic Proof Hash Determinism
- **Test 6**: Statutory Tax Breakdown Journal (FC.9) Disclaimer verification
- **Test 7**: Multi-Payer Split Math & Zero-Sum Conservation Invariant Fuzzing

---

<div align="center">
  <strong>Tulis — One Trip. One Ledger. Zero Confusion.</strong><br />
  <sub>Built with mathematical precision, operational excellence, and architectural integrity.</sub>
</div>
