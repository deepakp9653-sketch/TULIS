-- GroupTrip Ledger PostgreSQL Schema for Neon Database

CREATE TABLE IF NOT EXISTS trips (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  base_currency VARCHAR(10) DEFAULT 'USD',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget_ceiling NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS participants (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  avatar_url TEXT,
  is_organizer BOOLEAN DEFAULT FALSE,
  status VARCHAR(32) DEFAULT 'active', -- active, removed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  category VARCHAR(32) NOT NULL, -- transport, lodging, activity, food, other
  title VARCHAR(255) NOT NULL,
  vendor VARCHAR(255),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  estimated_cost NUMERIC(12, 2) DEFAULT 0.00,
  actual_cost NUMERIC(12, 2) DEFAULT 0.00,
  status VARCHAR(32) DEFAULT 'confirmed', -- confirmed, pending, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_participants (
  booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE,
  participant_id VARCHAR(64) REFERENCES participants(id) ON DELETE CASCADE,
  PRIMARY KEY (booking_id, participant_id)
);

CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  split_method VARCHAR(32) NOT NULL, -- equal, weighted, line_item, room_tier, organizer_subsidy
  paid_by_id VARCHAR(64) REFERENCES participants(id),
  category VARCHAR(32) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expense_allocations (
  id VARCHAR(64) PRIMARY KEY,
  expense_id VARCHAR(64) REFERENCES expenses(id) ON DELETE CASCADE,
  participant_id VARCHAR(64) REFERENCES participants(id) ON DELETE CASCADE,
  amount_owed NUMERIC(12, 2) NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  payer_id VARCHAR(64) REFERENCES participants(id),
  payee_id VARCHAR(64) REFERENCES participants(id),
  amount NUMERIC(12, 2) NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
  event_type VARCHAR(64) NOT NULL,
  payload_json JSONB NOT NULL,
  actor_id VARCHAR(64),
  sequence_num BIGSERIAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_trip_seq ON events(trip_id, sequence_num);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_participants_trip ON participants(trip_id);
