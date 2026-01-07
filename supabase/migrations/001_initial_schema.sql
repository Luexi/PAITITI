-- Paititi del Mar - Initial Database Schema
-- Migration 001: Core tables for multi-tenant reservation system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- VENUES: Multi-tenant support
-- ============================================================================
CREATE TABLE venues (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
  theme_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- OPENING HOURS: Business hours per day
-- ============================================================================
CREATE TABLE opening_hours (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT FALSE,
  UNIQUE(venue_id, day_of_week)
);

-- ============================================================================
-- SETTINGS: Operational parameters
-- ============================================================================
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE UNIQUE,
  slot_minutes INTEGER DEFAULT 30 CHECK (slot_minutes > 0),
  default_reservation_duration_minutes INTEGER DEFAULT 90 CHECK (default_reservation_duration_minutes > 0),
  max_party_size INTEGER DEFAULT 10 CHECK (max_party_size > 0),
  min_notice_minutes INTEGER DEFAULT 120 CHECK (min_notice_minutes >= 0),
  max_days_ahead INTEGER DEFAULT 30 CHECK (max_days_ahead > 0)
);

-- ============================================================================
-- TABLES: Restaurant table layout
-- ============================================================================
CREATE TABLE tables (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  label VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  active BOOLEAN DEFAULT TRUE,
  x NUMERIC DEFAULT 0,
  y NUMERIC DEFAULT 0,
  w NUMERIC DEFAULT 100,
  h NUMERIC DEFAULT 100,
  shape VARCHAR(20) DEFAULT 'square' CHECK (shape IN ('square', 'circle', 'rectangle')),
  rotation NUMERIC DEFAULT 0
);

CREATE INDEX idx_tables_venue ON tables(venue_id) WHERE active = TRUE;

-- ============================================================================
-- RESERVATIONS: Customer reservations
-- ============================================================================
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
  celebration_type VARCHAR(50),
  notes TEXT,
  table_id INTEGER REFERENCES tables(id) ON DELETE SET NULL,
  source VARCHAR(20) DEFAULT 'web' CHECK (source IN ('web', 'whatsapp', 'messenger', 'walkin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimized indexes for queries
CREATE INDEX idx_reservations_venue_date ON reservations(venue_id, date, start_time) WHERE status NOT IN ('cancelled', 'no_show');
CREATE INDEX idx_reservations_table_time ON reservations(table_id, date, start_time) WHERE status IN ('confirmed', 'seated');
CREATE INDEX idx_reservations_created ON reservations(created_at DESC);

-- ============================================================================
-- BLOCKS: Date/time blocks (closures, private events)
-- ============================================================================
CREATE TABLE blocks (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason VARCHAR(255) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_datetime > start_datetime)
);

CREATE INDEX idx_blocks_venue_datetime ON blocks(venue_id, start_datetime, end_datetime);

-- ============================================================================
-- WALK-INS: Customers without reservation
-- ============================================================================
CREATE TABLE walkins (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  table_id INTEGER REFERENCES tables(id) ON DELETE SET NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_walkins_venue_active ON walkins(venue_id, start_time) WHERE status = 'active';

-- ============================================================================
-- AUDIT LOG: Track all changes (append-only)
-- ============================================================================
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  diff_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_venue_created ON audit_log(venue_id, created_at DESC);

-- ============================================================================
-- STAFF PROFILES: Admin roles
-- ============================================================================
CREATE TABLE staff_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'manager', 'host')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, venue_id)
);

CREATE INDEX idx_staff_user ON staff_profiles(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE walkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

-- Public read access to venue info (for website)
CREATE POLICY "Public can view venues" ON venues FOR SELECT USING (true);
CREATE POLICY "Public can view opening hours" ON opening_hours FOR SELECT USING (true);
CREATE POLICY "Public can view settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public can view active tables" ON tables FOR SELECT USING (active = true);

-- Public can insert reservations (rate limiting handled by Edge Function)
CREATE POLICY "Public can create reservations" ON reservations 
  FOR INSERT WITH CHECK (source = 'web' AND status = 'confirmed');

-- Authenticated staff can do everything
CREATE POLICY "Staff can manage venues" ON venues 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles 
      WHERE staff_profiles.user_id = auth.uid() 
      AND staff_profiles.venue_id = venues.id
    )
  );

CREATE POLICY "Staff can manage opening hours" ON opening_hours 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles 
      WHERE staff_profiles.user_id = auth.uid() 
      AND staff_profiles.venue_id = opening_hours.venue_id
    )
  );

CREATE POLICY "Staff can manage settings" ON settings 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles 
      WHERE staff_profiles.user_id = auth.uid() 
      AND staff_profiles.venue_id = settings.venue_id
    )
  );

CREATE POLICY "Staff can manage tables" ON tables 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles 
      WHERE staff_profiles.user_id = auth.uid() 
      AND staff_profiles.venue_id = tables.venue_id
    )
  );

CREATE POLICY "Staff can manage reservations" ON reservations 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles 
      WHERE staff_profiles.user_id = auth.uid() 
      AND staff_profiles.venue_id = reservations.venue_id
    )
  );

CREATE POLICY "Staff can manage blocks" ON blocks 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles 
      WHERE staff_profiles.user_id = auth.uid() 
      AND staff_profiles.venue_id = blocks.venue_id
    )
  );

CREATE POLICY "Staff can manage walkins" ON walkins 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles 
      WHERE staff_profiles.user_id = auth.uid() 
      AND staff_profiles.venue_id = walkins.venue_id
    )
  );

-- Audit log: insert only (append-only)
CREATE POLICY "Staff can insert audit logs" ON audit_log 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff_profiles 
      WHERE staff_profiles.user_id = auth.uid() 
      AND staff_profiles.venue_id = audit_log.venue_id
    )
  );

CREATE POLICY "Staff can view audit logs" ON audit_log 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM staff_profiles 
      WHERE staff_profiles.user_id = auth.uid() 
      AND staff_profiles.venue_id = audit_log.venue_id
    )
  );

CREATE POLICY "Staff can view profiles" ON staff_profiles 
  FOR SELECT USING (user_id = auth.uid());
