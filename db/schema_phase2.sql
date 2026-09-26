-- ========================================================
-- TULIS PHASE 2 DATABASE SCHEMA
-- ========================================================

-- 1. EMERGENCY CONTACTS & SAFETY
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  relationship VARCHAR(64) DEFAULT 'Friend',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user ON emergency_contacts(user_id);

CREATE TABLE IF NOT EXISTS sos_events (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE SET NULL,
  status VARCHAR(32) DEFAULT 'active', -- 'active' | 'resolved'
  initial_latitude NUMERIC(10, 7),
  initial_longitude NUMERIC(10, 7),
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_sos_events_user ON sos_events(user_id);

CREATE TABLE IF NOT EXISTS sos_location_pings (
  id VARCHAR(64) PRIMARY KEY,
  sos_event_id VARCHAR(64) REFERENCES sos_events(id) ON DELETE CASCADE,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  accuracy_meters NUMERIC(8, 2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sos_pings_event ON sos_location_pings(sos_event_id, recorded_at ASC);

CREATE TABLE IF NOT EXISTS safety_ratings (
  id VARCHAR(64) PRIMARY KEY,
  place_id VARCHAR(255) NOT NULL,
  place_name VARCHAR(255),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  submitted_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_safety_ratings_place ON safety_ratings(place_id);

-- 2. GOGO AI PLANNING SESSIONS
CREATE TABLE IF NOT EXISTS gogo_sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE SET NULL,
  interview_answers JSONB DEFAULT '{}'::jsonb,
  generated_plan JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(32) DEFAULT 'in_progress', -- 'in_progress' | 'completed' | 'converted'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_gogo_sessions_user ON gogo_sessions(user_id);

-- 3. RECEIPT OCR EXTRACTIONS
CREATE TABLE IF NOT EXISTS receipt_extractions (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  expense_id VARCHAR(64) REFERENCES expenses(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  extracted_vendor VARCHAR(255),
  extracted_amount NUMERIC(12, 2),
  extracted_date VARCHAR(64),
  extracted_time VARCHAR(64),
  extracted_category VARCHAR(64),
  confidence_score NUMERIC(4, 2),
  raw_model_response JSONB,
  status VARCHAR(32) DEFAULT 'pending_review', -- 'pending_review' | 'confirmed' | 'discarded'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_receipts_trip ON receipt_extractions(trip_id);

-- 4. IN-APP TRIP CHAT & AI SUMMARIES
CREATE TABLE IF NOT EXISTS trip_messages (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  sender_id VARCHAR(64) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_avatar TEXT,
  content TEXT NOT NULL,
  sequence_num BIGSERIAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_trip_messages_seq ON trip_messages(trip_id, sequence_num ASC);

CREATE TABLE IF NOT EXISTS trip_chat_summaries (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  action_items JSONB DEFAULT '[]'::jsonb,
  covers_up_to_sequence BIGINT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_chat_summaries_trip ON trip_chat_summaries(trip_id);

-- 5. CORPORATE B2B SUITE
CREATE TABLE IF NOT EXISTS organizations (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email_domain VARCHAR(255),
  billing_tier VARCHAR(32) DEFAULT 'growth',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_orgs_domain ON organizations(email_domain);

CREATE TABLE IF NOT EXISTS organization_members (
  id VARCHAR(64) PRIMARY KEY,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(32) DEFAULT 'employee', -- 'org_admin' | 'manager' | 'employee'
  cost_center VARCHAR(128) DEFAULT 'General',
  monthly_spend_cap NUMERIC(12, 2) DEFAULT 50000.00,
  status VARCHAR(32) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);

CREATE TABLE IF NOT EXISTS expense_policies (
  id VARCHAR(64) PRIMARY KEY,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  category VARCHAR(64) NOT NULL,
  max_amount NUMERIC(12, 2) NOT NULL,
  requires_approval_above NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_policies_org ON expense_policies(organization_id);

CREATE TABLE IF NOT EXISTS approvals (
  id VARCHAR(64) PRIMARY KEY,
  expense_id VARCHAR(64) REFERENCES expenses(id) ON DELETE CASCADE,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  requested_by VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  approver_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(32) DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  policy_violation_reason TEXT,
  decided_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_approvals_org_status ON approvals(organization_id, status);

-- 6. EXTEND EXISTING TABLES
ALTER TABLE trips ADD COLUMN IF NOT EXISTS organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS cost_center VARCHAR(128);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS approval_status VARCHAR(32) DEFAULT 'approved';
