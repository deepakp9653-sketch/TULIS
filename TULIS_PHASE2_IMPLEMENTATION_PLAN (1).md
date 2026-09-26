# TULIS — Phase 2 Implementation Plan
### Financial · Planning · Safety · AI

> Companion document to `PROJECT_DOCUMENTATION.md`. That file describes what is **already built** (Next.js 16, TypeScript, Neon Postgres, event-sourced ledger, 47 components, Groq-powered expense parsing). This file specifies what to **add** on top of it for the hackathon submission. Do not re-architect anything described there — extend it.

---

## 0. How To Use This Document

- Section numbers below are self-contained; cross-references to the existing app use the section numbers from `PROJECT_DOCUMENTATION.md` (e.g. "existing §8" = Core Ledger Engine).
- Every new table follows the existing conventions: `VARCHAR(64)` string PKs, `trip_id` scoping, and an `events` row for every mutation (existing event-sourcing philosophy — see §3.2 for new event types).
- Every new feature reuses the existing `GROQ_API_KEY` where AI is needed. Do not introduce a second LLM provider.

---

## 1. The Four Pillars

| Pillar | What exists today | What Phase 2 adds |
|---|---|---|
| **Financial** | 6 split methods, event-sourced ledger, UPI settlement, CSV export | Receipt OCR pre-fill, corporate cost centers, spend policies, approvals, org-level export |
| **Planning** | Manual booking/itinerary entry, conflict detection | Gogo AI trip-planning agent, itinerary auto-draft |
| **Safety** | None | Women's Safety Mode: safety-aware suggestions, SOS, live location, helplines |
| **AI** | Parse-expense, explain-balance, anomaly detection | Gogo (conversational agent), receipt OCR, chat summarization |

**Positioning line for Safety Mode:** on activation, show a full-screen moment with the line **"The world is big, go make it yours."** — this is a copy/UX decision, not a technical one. The mode should read as *safety-aware*, never *restrictive*: it surfaces information (crowd-favoring suggestions, one-tap help), it never blocks a destination or route choice.

---

## 2. Scope Reality Check — read this before building

You told me this plan targets a **hackathon timeline** but explicitly rejected mocked backends. Those two constraints are in tension: everything below, fully built and fully real, is not realistically finishable in a few days by a small team. The honest way to satisfy "no mocks" under a real deadline is **breadth-for-depth trading**, not fake integrations.

**Rule for this build: one flagship, fully-real feature per pillar for the demo. Everything else in this document is a complete, buildable spec — not a promise that it ships by demo day.**

Flagship picks (all genuinely buildable with zero paid third-party accounts, see §7):

| Pillar | Flagship (must be real, must work live) | Why this one |
|---|---|---|
| Safety | **Live-location SOS page** (§5.1) | Uses only your own DB + browser geolocation + a `wa.me` link. No SMS vendor, no mocked "call". |
| Planning/AI | **Gogo tap-to-talk trip planner** (§5.2) | Reuses the Groq key you already have wired up. |
| Financial | **Receipt OCR → expense pre-fill** (§5.3) | Already on your own roadmap; one Groq vision call, feeds the *existing* split flow. |
| Corporate | **Org + policy + one real approval flow** (§5.5) | Schema and one end-to-end path (log → flag → approve), not the whole B2B suite. |

Chat + summarization (§5.4) and the rest of the corporate suite (SSO, PDF GST invoices, admin analytics) are specified in full below but are explicitly **Phase 3 / post-hackathon** unless time allows more. See §8 for the cut order.

---

## 3. New Data Model

All new tables use the existing ID/timestamp conventions. Add via a new `db/schema_phase2.sql`, applied after the existing `db/schema.sql`.

### 3.1 New Tables

**Safety**
| Table | Key Columns | Purpose |
|---|---|---|
| `emergency_contacts` | `id`, `user_id` FK, `name`, `phone`, `relationship`, `is_primary` | User's trusted contacts |
| `sos_events` | `id`, `user_id` FK, `trip_id` FK (nullable), `status` (`active`/`resolved`), `triggered_at`, `resolved_at` | One row per SOS activation |
| `sos_location_pings` | `id`, `sos_event_id` FK, `latitude`, `longitude`, `recorded_at` | Live-location trail while SOS is active |
| `safety_ratings` | `id`, `place_id` (Google Place ID), `rating` (1–5), `comment`, `submitted_by` FK, `created_at` | Crowdsourced safety score per place |

**Planning / Gogo**
| Table | Key Columns | Purpose |
|---|---|---|
| `gogo_sessions` | `id`, `user_id` FK, `trip_id` FK (nullable until converted), `interview_answers` JSONB, `generated_plan` JSONB, `status` (`in_progress`/`completed`/`converted`), `created_at` | One planning conversation |

**Financial / OCR**
| Table | Key Columns | Purpose |
|---|---|---|
| `receipt_extractions` | `id`, `trip_id` FK, `expense_id` FK (nullable until confirmed), `image_url`, `extracted_vendor`, `extracted_amount`, `extracted_date`, `extracted_time`, `confidence_score`, `raw_model_response` JSONB, `status` (`pending_review`/`confirmed`/`discarded`) | Staging area between upload and a real expense row |

**Chat**
| Table | Key Columns | Purpose |
|---|---|---|
| `trip_messages` | `id`, `trip_id` FK, `sender_id` FK participants, `content`, `sequence_num` BIGSERIAL, `created_at` | Trip chat log |
| `trip_chat_summaries` | `id`, `trip_id` FK, `summary_text`, `covers_up_to_sequence`, `generated_at` | Cached AI summaries so you don't re-summarize the whole thread every time |

**Corporate**
| Table | Key Columns | Purpose |
|---|---|---|
| `organizations` | `id`, `name`, `email_domain`, `billing_tier`, `created_at` | A company account |
| `organization_members` | `id`, `organization_id` FK, `user_id` FK, `role` (`org_admin`/`manager`/`employee`), `cost_center`, `monthly_spend_cap`, `status` | Employee ↔ org link |
| `expense_policies` | `id`, `organization_id` FK, `category`, `max_amount`, `requires_approval_above`, `created_at` | Per-category spend rules |
| `approvals` | `id`, `expense_id` FK, `organization_id` FK, `requested_by` FK, `approver_id` FK (nullable until decided), `status` (`pending`/`approved`/`rejected`), `decided_at` | Approval queue |

**Modify existing tables**
| Table | New Column | Purpose |
|---|---|---|
| `trips` | `organization_id` FK (nullable) | Tags a trip as corporate |
| `expenses` | `cost_center` VARCHAR (nullable) | Overrides the payer's default cost center for this line item |

### 3.2 New Event Types (append to the existing 33 in `events.event_type`)

```
SOS_TRIGGERED, SOS_RESOLVED, SAFETY_RATING_SUBMITTED,
GOGO_PLAN_GENERATED, GOGO_PLAN_CONVERTED_TO_TRIP,
RECEIPT_OCR_EXTRACTED, RECEIPT_OCR_CONFIRMED,
CHAT_MESSAGE_SENT, CHAT_SUMMARY_GENERATED,
ORG_CREATED, ORG_MEMBER_ADDED, EXPENSE_POLICY_SET,
APPROVAL_REQUESTED, APPROVAL_GRANTED, APPROVAL_REJECTED
```

---

## 4. New API Routes

| Route | Method / Action | Purpose |
|---|---|---|
| `/api/safety` | `POST action=sos-trigger` | Creates `sos_events` row, starts location trail, returns the shareable live-page URL |
| `/api/safety` | `POST action=sos-update` | Appends a `sos_location_pings` row (called every ~15s while SOS active) |
| `/api/safety` | `POST action=sos-resolve` | Marks SOS resolved |
| `/api/safety` | `GET action=nearby-police&lat=&lng=` | Proxies Google Places `type=police`, sorted by distance |
| `/api/safety` | `POST action=safety-rating` | Submit a crowdsourced rating for a place |
| `/api/safety` | `GET action=safety-score&placeId=` | Aggregate score (Places `user_ratings_total` proxy + community ratings) |
| `/api/emergency-contacts` | `GET` / `POST` / `DELETE` | CRUD for a user's trusted contacts |
| `/live/[sosEventId]` | page, not API | Public, read-only, auto-polling live map — this is the link sent to the emergency contact |
| `/api/gogo` | `POST action=start-interview` | Opens a `gogo_sessions` row, returns question 1 |
| `/api/gogo` | `POST action=answer` | Appends answer, returns next question or the generated plan |
| `/api/gogo` | `POST action=convert-to-trip` | Materializes `generated_plan` into a real trip + bookings via the existing trip/booking creation path |
| `/api/receipts` | `POST action=extract` | Image → Groq vision call → `receipt_extractions` row |
| `/api/receipts` | `POST action=confirm` | Extraction (possibly user-edited) → real expense via the existing `save-expense` path |
| `/api/chat` | `GET ?tripId=&sinceSeq=` | Poll new messages |
| `/api/chat` | `POST action=send` | Post a message |
| `/api/chat` | `POST action=summarize` | Groq call over the unsummarized message window, caches result |
| `/api/org` | `POST action=create` / `invite-member` / `set-policy` / `set-cost-center` | Org admin actions |
| `/api/org` | `GET action=members` | List org roster |
| `/api/approvals` | `GET ?orgId=` | Pending queue |
| `/api/approvals` | `POST action=decide` | Approve/reject; logs `APPROVAL_GRANTED`/`APPROVAL_REJECTED`, never deletes the underlying expense (event-sourced — matches existing philosophy) |

---

## 5. Feature Specs

### 5.1 Women's Safety Mode

**Activation:** a toggle in trip settings or global profile. On first activation, full-screen moment with the tagline, then a 30-second setup: add 1–3 emergency contacts.

**One-tap help:**
- **Call:** `tel:112` (India's unified emergency number) as the primary button; if a specific nearby police station has a phone number from Places, offer it as a secondary option. This is a real, working `tel:` link — a browser cannot silently place a call, so don't build toward that.
- **Nearest police stations:** `GET /api/safety?action=nearby-police`, sorted by distance, shown as a list + map pins.
- **SOS / live location (flagship, §2):**
  1. Tap SOS → `POST /api/safety?action=sos-trigger` → creates `sos_events` row, browser starts `navigator.geolocation.watchPosition`.
  2. Every ~15s, `POST /api/safety?action=sos-update` appends a `sos_location_pings` row.
  3. Response includes a link to `/live/[sosEventId]` — a public, unauthenticated, auto-refreshing page showing the latest position on a map.
  4. App opens a pre-filled `wa.me` link to the primary emergency contact with that live-page URL. This is a real, working share mechanism with zero third-party cost — do not represent it as sending an automatic SMS unless Twilio (or similar) is actually wired up and funded (see §7 — treat that as Phase 3).
  5. "I'm safe" button → `sos-resolve`.

**Safety-aware suggestions (not restrictions):** on hotel/route/place cards, show a "Community Safety Score (beta)" badge computed from `GET /api/safety?action=safety-score`. Be explicit in the UI that this is a review-density + community-rating proxy, not verified crime data — overclaiming this in a demo is a credibility risk with judges who ask "where's this data from?"

### 5.2 Gogo — AI Trip Planner

**Interaction model for this build:** tap-to-talk, not wake-word. A floating action button (`GogoFAB`) starts `webkitSpeechRecognition` on tap (Chrome/Edge); always show a typed-input fallback since Safari/Firefox support for the Speech API is inconsistent — voice is an enhancement, text is the reliable path. True hands-free "Hey Gogo" is out of scope here; revisit if/when there's a native app (wake-word engines like Porcupine need native audio access browsers don't give you).

**Flow:**
1. User opens Gogo → `POST /api/gogo?action=start-interview`.
2. 4–5 questions: destination/region, dates, number of travelers, budget range, and — **optional, clearly explained** — traveler genders, used only to decide whether to default-suggest Safety Mode and safety-weighted options. Never make this field required or silently collected.
3. Each answer → `POST /api/gogo?action=answer` → Groq call with the running `interview_answers` as context → next question, or on the last answer, a generated itinerary draft (`generated_plan`: suggested bookings with category/title/vendor/estimated_cost/time slots, plus a budget summary).
4. `GogoPlanPreviewModal` shows the draft. "Create this trip" → `POST /api/gogo?action=convert-to-trip` → creates the trip and bookings through the **existing** trip/booking creation code path (do not build a second trip-creation pipeline).

### 5.3 Bill OCR

1. `ReceiptUploadDropzone` → image → `POST /api/receipts?action=extract`.
2. Server sends the image to a Groq vision-capable model with a structured-JSON-only prompt (amount, vendor, date, time, confidence). Store the raw response in `raw_model_response` for debugging.
3. `ReceiptExtractionReviewModal` shows the extracted fields, editable, plus the existing "who paid how much" split UI (reuse `DynamicSplitDrawer` — the extraction is just a pre-fill, not a new split mechanism; `paid_by_splits` already exists on `expenses`).
4. Confirm → `POST /api/receipts?action=confirm` → goes through the **existing** `save-expense` action. Do not create a parallel expense-creation path.
5. Fallback: if Groq vision is unavailable or the user is offline, allow manual entry — never block expense logging on OCR succeeding.

### 5.4 In-App Chat + Summarization (Phase 3 unless time allows)

Distinct from the existing `ChatExpenseModal` (which parses one message into a structured expense) — this is a running conversation between trip members.

- **Transport:** short-interval polling (`GET /api/chat?tripId=&sinceSeq=` every 3–5s) rather than WebSockets — Vercel's serverless functions don't hold long-lived connections well, and polling needs zero new infrastructure. If real-time feels necessary later, evaluate a managed service (Pusher/Ably/Supabase Realtime) as an explicit, budgeted add — don't half-build a WebSocket layer under time pressure.
- **Summarization:** `POST /api/chat?action=summarize` sends the messages since `covers_up_to_sequence` to Groq, caches the result in `trip_chat_summaries` so re-opening the trip doesn't re-summarize from scratch.

### 5.5 Corporate / B2B Layer (full detail, as requested)

**Org creation & membership**
- `POST /api/org?action=create` — any authenticated user can create an org (becomes `org_admin`).
- `organizations.email_domain` enables a soft auto-join: at signup/login, if the user's email domain matches an org, offer "Join {Org}?" — no SSO needed for this to work.
- Roles: `org_admin` (manage policies, approve, invite), `manager` (approve within their team), `employee` (log expenses, no admin rights).

**Trip tagging:** a trip gets `organization_id` set at creation if the organizer chooses "Corporate trip" and belongs to an org. Non-corporate trips are unaffected — this must be fully backward-compatible with the existing consumer flow.

**Policies & approvals**
- `expense_policies` define, per category, a `max_amount` and `requires_approval_above`.
- On `save-expense` for an org-tagged trip: if `total_amount > requires_approval_above` for that category, auto-create an `approvals` row (`status=pending`) and log `APPROVAL_REQUESTED`. The expense still saves (keep the event-sourced, never-block philosophy) but is flagged "pending approval" in the UI until decided.
- `ApprovalQueueSection` (visible to `manager`/`org_admin`) lists pending items; `POST /api/approvals?action=decide` logs `APPROVAL_GRANTED` or `APPROVAL_REJECTED`. Rejection never deletes the expense — it's flagged, consistent with the existing audit-trail design.

**Cost centers & reporting**
- `organization_members.cost_center` is the default; `expenses.cost_center` can override per line item (e.g., a shared team dinner tagged to "Marketing" even though the payer defaults to "Engineering").
- Export: extend the existing `generateAccountingExportCSV()` with an org mode that includes cost center and approval status columns. A polished PDF/GST-formatted invoice is a real, non-trivial deliverable on its own — spec it, but treat the CSV as the demo-day artifact and the PDF as Phase 3.

**Explicitly out of scope for this build:** SAML/enterprise SSO (Google OAuth already covers most Workspace-using companies), usage-based billing, multi-org admin console. These are real Phase 3+ items, not to be faked for the demo.

---

## 6. New / Modified Components

| Area | Component | Notes |
|---|---|---|
| Safety | `SafetyModeToggle.tsx`, `SOSButton.tsx`, `EmergencyContactSetupModal.tsx`, `NearestPoliceStationsPanel.tsx`, `SafetyRatingWidget.tsx`, `SafetyModeOnboardingScreen.tsx`, `/live/[sosEventId]` page | `SOSButton` persists as a floating element whenever Safety Mode is on |
| Gogo | `GogoFAB.tsx`, `GogoInterviewModal.tsx`, `GogoPlanPreviewModal.tsx` | `GogoFAB` reuses `LiquidGlassButton` styling for visual consistency |
| OCR | `ReceiptUploadDropzone.tsx`, `ReceiptExtractionReviewModal.tsx` | Hands off into the existing `DynamicSplitDrawer` |
| Chat | `TripChatPanel.tsx`, `ChatSummaryCard.tsx` | New tab in `DashboardShell` |
| Corporate | `OrgDashboard.tsx`, `OrgMemberInviteModal.tsx`, `ExpensePolicyEditor.tsx`, `ApprovalQueueSection.tsx`, `CostCenterTagPicker.tsx`, `GstExportModal.tsx` | `CostCenterTagPicker` mounts inside the existing `DynamicSplitDrawer` |

---

## 7. Third-Party Services & Environment Variables

| Need | Choice for this build | New env var | Cost |
|---|---|---|---|
| Receipt OCR | Groq vision-capable model (existing key) | none (reuse `GROQ_API_KEY`) | already budgeted |
| Gogo conversation | Groq (existing key) | none | already budgeted |
| Nearest police / place data | Google Places API | `GOOGLE_PLACES_API_KEY` | free tier likely sufficient for a demo |
| SOS alert delivery | `wa.me` deep link (client-side, no server call needed) | none | free |
| Voice input for Gogo | Browser Web Speech API | none | free, Chrome/Edge only |
| **Not used in this build** | Twilio/SMS gateway, dedicated OCR vendor (Textract/Vision API), Pusher/Ably | — | flag as Phase 3 if you want automatic SMS or true real-time chat |

---

## 8. Build Sequence

**Day 1 — Safety flagship + schema**
- Apply `schema_phase2.sql` (all new tables + event types).
- `emergency_contacts` CRUD, `SOS` trigger/update/resolve, `/live/[id]` page, `tel:112` button, nearest-police panel.
- *Checkpoint: a real SOS can be triggered, a real link opens showing a live-updating position.*

**Day 2 — Gogo + OCR**
- Gogo interview flow (text-first, voice as enhancement), plan generation, convert-to-trip.
- Receipt OCR extract → review → confirm, wired into the existing split flow.
- *Checkpoint: a trip can be created purely by talking/typing to Gogo; a real receipt photo produces a real expense.*

**Day 3 — Corporate flagship + polish**
- Org creation, one policy, one real approval end-to-end (log expense over threshold → appears in queue → approve/reject).
- Safety community-rating badge (even with sparse seed data, label it "beta" honestly).
- Cut list if behind: chat/summarization first, then GST export polish, then safety ratings (keep SOS + police lookup — that's the most demo-critical safety piece).

**If a 4th day exists:** trip chat + summarization (§5.4), GST export polish, org admin dashboard polish.

---

## 9. Open Risks — flag these to the team, don't silently work around them

- **Groq vision availability/quality on receipts** varies with photo quality — budget time for a manual-correction path, don't assume first-pass extraction is demo-reliable.
- **Web Speech API browser support** is inconsistent outside Chrome/Edge — demo on a supported browser or lead with the typed-input path.
- **Geolocation accuracy** indoors/on mobile data can be poor — the live SOS page should show an accuracy radius, not just a pin, so it doesn't look broken when it's just imprecise.
- **"Community Safety Score" has no seed data on day one** — decide before demo whether to pre-seed a handful of ratings for the destinations you'll actually demo, or show it honestly as "not enough data yet" for others. Either is fine; silently showing a fake-looking score is not.
- **Corporate scope is the single biggest scope risk in this whole plan** — the approvals end-to-end path is the one thing worth protecting; everything else in §5.5 is legitimate spec, not a day-3 commitment.
