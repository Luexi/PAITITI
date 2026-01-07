# Paititi del Mar - Database Schema

## Overview

Multi-tenant database schema designed for restaurant reservation systems. Optimized for read-heavy workloads with proper indexing and Row-Level Security (RLS).

## Tables

### venues
Restaurant/venue configuration.

```sql
CREATE TABLE venues (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
  theme_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:** PRIMARY KEY on `id`

### opening_hours
Business hours per day of week.

```sql
CREATE TABLE opening_hours (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT FALSE,
  UNIQUE(venue_id, day_of_week)
);
```

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE on `(venue_id, day_of_week)`

### settings
Operational parameters.

```sql
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE UNIQUE,
  slot_minutes INTEGER DEFAULT 30,
  default_reservation_duration_minutes INTEGER DEFAULT 90,
  max_party_size INTEGER DEFAULT 10,
  min_notice_minutes INTEGER DEFAULT 120,
  max_days_ahead INTEGER DEFAULT 30
);
```

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE on `venue_id`

### tables
Restaurant table layout and capacity.

```sql
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
  shape VARCHAR(20) DEFAULT 'square',
  rotation NUMERIC DEFAULT 0
);
```

**Indexes:**
- PRIMARY KEY on `id`
- `idx_tables_venue` on `(venue_id)` WHERE `active = TRUE`

### reservations
Customer reservations.

```sql
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed',
  celebration_type VARCHAR(50),
  notes TEXT,
  table_id INTEGER REFERENCES tables(id) ON DELETE SET NULL,
  source VARCHAR(20) DEFAULT 'web',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- PRIMARY KEY on `id`
- `idx_reservations_venue_date` on `(venue_id, date, start_time)` WHERE `status NOT IN ('cancelled', 'no_show')`
- `idx_reservations_table_time` on `(table_id, date, start_time)` WHERE `status IN ('confirmed', 'seated')`
- `idx_reservations_created` on `(created_at DESC)`

**Status Values:** `pending`, `confirmed`, `seated`, `completed`, `cancelled`, `no_show`

**Source Values:** `web`, `whatsapp`, `messenger`, `walkin`

### blocks
Date/time blocks for closures or private events.

```sql
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
```

**Indexes:**
- PRIMARY KEY on `id`
- `idx_blocks_venue_datetime` on `(venue_id, start_datetime, end_datetime)`

### walkins
Customers without reservation.

```sql
CREATE TABLE walkins (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  table_id INTEGER REFERENCES tables(id) ON DELETE SET NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- PRIMARY KEY on `id`
- `idx_walkins_venue_active` on `(venue_id, start_time)` WHERE `status = 'active'`

### audit_log
Append-only audit trail.

```sql
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
```

**Indexes:**
- PRIMARY KEY on `id`
- `idx_audit_venue_created` on `(venue_id, created_at DESC)`

### staff_profiles
Admin user roles.

```sql
CREATE TABLE staff_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'manager', 'host')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, venue_id)
);
```

**Indexes:**
- PRIMARY KEY on `id`
- `idx_staff_user` on `(user_id)`
- UNIQUE on `(user_id, venue_id)`

## Row-Level Security (RLS)

All tables have RLS enabled.

### Public Access
- **SELECT:** `venues`, `opening_hours`, `settings`, `tables` (active only)
- **INSERT:** `reservations` (with source='web' and status='confirmed')

### Authenticated Staff Access
Staff users (verified via `staff_profiles`) have full CRUD access to all tables for their venue.

### Audit Log
- Staff can INSERT and SELECT
- Append-only (no UPDATE or DELETE)

## Relationships

```
venues (1) ──┬─> (N) opening_hours
             ├─> (1) settings
             ├─> (N) tables
             ├─> (N) reservations
             ├─> (N) blocks
             ├─> (N) walkins
             ├─> (N) audit_log
             └─> (N) staff_profiles

tables (1) ──┬─> (N) reservations (via table_id)
             └─> (N) walkins (via table_id)

auth.users (1) ──┬─> (N) blocks (via created_by)
                 ├─> (N) audit_log (via actor_user_id)
                 └─> (N) staff_profiles (via user_id)
```

## Performance Considerations

1. **Composite Indexes:** Used on frequently queried combinations (venue_id + date + time)
2. **Partial Indexes:** Only index active records (e.g., active tables, non-cancelled reservations)
3. **JSONB:** Used for flexible theme configuration and audit diffs
4. **Cascading Deletes:** Venue deletion cascades to all related data
5. **Foreign Keys:** All relationships enforced at database level

## Timezone Handling

- All TIMESTAMPTZ columns store UTC
- Application converts to venue's timezone (stored in `venues.timezone`)
- Default timezone: `America/Mexico_City`
