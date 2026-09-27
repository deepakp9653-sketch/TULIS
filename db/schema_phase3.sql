-- ========================================================
-- TULIS PHASE 3 DDL: ALL ADDITIVE ROADMAP SCHEMAS
-- Covers features F1.3 through F-M5 (Phases 2-6)
-- Strict Invariant: 100% Additive (No existing tables dropped)
-- ========================================================

-- 1. GROUP CONSENSUS VOTING (F1.3)
CREATE TABLE IF NOT EXISTS gogo_plan_votes (
  id VARCHAR(64) PRIMARY KEY,
  gogo_session_id VARCHAR(64) REFERENCES gogo_sessions(id) ON DELETE CASCADE,
  participant_id VARCHAR(64) REFERENCES participants(id) ON DELETE CASCADE,
  activity_ref VARCHAR(128) NOT NULL,
  vote VARCHAR(16) NOT NULL CHECK (vote IN ('yes', 'no', 'maybe')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_gogo_vote UNIQUE(gogo_session_id, participant_id, activity_ref)
);
CREATE INDEX IF NOT EXISTS idx_gogo_votes_session ON gogo_plan_votes(gogo_session_id);

-- 2. VENDOR RELIABILITY SIGNALS (F3.1)
CREATE TABLE IF NOT EXISTS vendor_reliability_signals (
  id VARCHAR(64) PRIMARY KEY,
  vendor_name VARCHAR(255) NOT NULL,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  signal_type VARCHAR(64) NOT NULL, -- 'COST_SURGE' | 'REFUND_DELAY' | 'ACCURATE_ESTIMATE'
  delta_value NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vendor_reliability ON vendor_reliability_signals(LOWER(vendor_name));

-- 3. PARTIAL-ATTENDANCE CALENDAR MATRIX (F3.2)
CREATE TABLE IF NOT EXISTS participant_attendance (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  participant_id VARCHAR(64) REFERENCES participants(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  present BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_participant_attendance UNIQUE(trip_id, participant_id, attendance_date)
);
CREATE INDEX IF NOT EXISTS idx_attendance_trip ON participant_attendance(trip_id, attendance_date);

-- 4. CAPABILITY-SCOPED DELEGATION (F2.3)
CREATE TABLE IF NOT EXISTS participant_capabilities (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  participant_id VARCHAR(64) REFERENCES participants(id) ON DELETE CASCADE,
  capability VARCHAR(64) NOT NULL, -- 'manage_itinerary' | 'invite_guests' | 'approve_disputes' | 'export_ledgers'
  granted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_trip_part_cap UNIQUE(trip_id, participant_id, capability)
);
CREATE INDEX IF NOT EXISTS idx_capabilities_trip ON participant_capabilities(trip_id);

-- 5. PASSIVE CHECK-IN SYSTEM (F5.3)
CREATE TABLE IF NOT EXISTS checkin_schedules (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  participant_id VARCHAR(64) REFERENCES participants(id) ON DELETE CASCADE,
  interval_hours INT DEFAULT 4,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS checkin_responses (
  id VARCHAR(64) PRIMARY KEY,
  schedule_id VARCHAR(64) REFERENCES checkin_schedules(id) ON DELETE CASCADE,
  prompted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  responded_at TIMESTAMP WITH TIME ZONE,
  missed BOOLEAN DEFAULT FALSE,
  location_lat NUMERIC(10, 7),
  location_lng NUMERIC(10, 7),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_checkin_schedule ON checkin_responses(schedule_id);

-- 6. DOCUMENT / COMPLIANCE EXPIRY TRACKER (FC.7)
CREATE TABLE IF NOT EXISTS travel_documents (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE SET NULL,
  document_type VARCHAR(64) NOT NULL, -- 'Passport' | 'Visa' | 'Driver License' | 'ID'
  document_number VARCHAR(128),
  country VARCHAR(64) DEFAULT 'India',
  expiry_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_docs_user ON travel_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_docs_org ON travel_documents(organization_id);

-- 7. FORWARDED EMAIL BOOKING INGESTION (F3.3)
CREATE TABLE IF NOT EXISTS booking_extractions (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  raw_source TEXT NOT NULL,
  extracted_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(32) DEFAULT 'pending', -- 'pending' | 'accepted' | 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_extractions_trip ON booking_extractions(trip_id);

-- 8. LIVE SQUAD LOGISTICS & RENDEZVOUS (F3.4)
CREATE TABLE IF NOT EXISTS trip_location_shares (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  participant_id VARCHAR(64) REFERENCES participants(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT TRUE,
  last_ping_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_trip_loc_share UNIQUE(trip_id, participant_id)
);

CREATE TABLE IF NOT EXISTS trip_location_pings (
  id VARCHAR(64) PRIMARY KEY,
  share_id VARCHAR(64) REFERENCES trip_location_shares(id) ON DELETE CASCADE,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_location_pings_share ON trip_location_pings(share_id, created_at DESC);

-- 9. POOL CONTRIBUTION MODE (COMMON KITTY / POT) (F-M2)
CREATE TABLE IF NOT EXISTS pool_contributions (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  participant_id VARCHAR(64) REFERENCES participants(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  note TEXT DEFAULT 'Common Pot Contribution',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pool_trip ON pool_contributions(trip_id);

-- 10. TRIP TEMPLATES & SKELETON MARKETPLACE (F-M4)
CREATE TABLE IF NOT EXISTS trip_templates (
  id VARCHAR(64) PRIMARY KEY,
  creator_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  description TEXT,
  visibility VARCHAR(32) DEFAULT 'public', -- 'public' | 'squad_only'
  itinerary_skeleton JSONB NOT NULL DEFAULT '[]'::jsonb,
  fork_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_templates_dest ON trip_templates(LOWER(destination));

-- 11. ADDITIVE ENHANCEMENTS TO EXISTING CORE TABLES
ALTER TABLE expense_policies ADD COLUMN IF NOT EXISTS second_tier_threshold NUMERIC(12, 2);
ALTER TABLE expense_policies ADD COLUMN IF NOT EXISTS second_tier_role VARCHAR(32);
ALTER TABLE expense_policies ADD COLUMN IF NOT EXISTS per_diem_rate NUMERIC(12, 2);
ALTER TABLE expense_policies ADD COLUMN IF NOT EXISTS per_diem_destination VARCHAR(255);
ALTER TABLE expense_policies ADD COLUMN IF NOT EXISTS per_diem_grade VARCHAR(64);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmation_code VARCHAR(128);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_pool_expense BOOLEAN DEFAULT FALSE;
