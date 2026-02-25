-- =====================================================
-- Padel Coach Pro - Change Order v2 Migration
-- =====================================================
-- Changes:
--   1. Create locations table with seed data
--   2. Update sessions: session_type constraint, add location_id, courts_booked, duration_hours
--   3. Update assessments: add is_active flag
-- =====================================================
-- SAFE TO RE-RUN: Uses IF NOT EXISTS and IF EXISTS guards
-- =====================================================

BEGIN;

-- =====================================================
-- 1. LOCATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  google_maps_url TEXT NOT NULL,
  total_courts INTEGER DEFAULT 1,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. SEED LOCATIONS (only if table is empty)
-- =====================================================

INSERT INTO locations (name, address, google_maps_url, total_courts, notes)
SELECT 'Fivestar Signature Club Sunter',
       'D-8/1 Jalan Sunter Garden Raya, Tanjung Priok, Jakarta Utara 14350',
       'https://maps.app.goo.gl/FivestarSunter',
       2,
       'Indoor courts. WA: 0859-2000-8334'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Fivestar Signature Club Sunter');

INSERT INTO locations (name, address, google_maps_url, total_courts, notes)
SELECT 'Northside Padel Court',
       'Jl. Agung Perkasa 9, Sunter Agung, Tanjung Priok, Jakarta Utara',
       'https://maps.app.goo.gl/NorthsidePadel',
       3,
       '3 Extreme Super Panoramic Courts. Wajib sepatu padel/tennis non-marking sole. IG: @northside.padel'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Northside Padel Court');

INSERT INTO locations (name, address, google_maps_url, total_courts, notes)
SELECT 'BARA Padel Court',
       'Jl. Industri No.6 Blok C/1, Gunung Sahari Utara, Kemayoran, Jakarta Pusat 10610',
       'https://maps.app.goo.gl/BaraPadel',
       2,
       'Termasuk 2 dus air mineral. Reservasi tidak bisa dibatalkan.'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'BARA Padel Court');

INSERT INTO locations (name, address, google_maps_url, total_courts, notes)
SELECT 'The Palm Padel',
       'Jl. Griya Sejahtera No. 1, Sunter Agung, Jakarta Utara',
       'https://maps.app.goo.gl/PalmPadel',
       3,
       '3 Premium Padel Courts. Coaching equipment available for rent. IG: @thepalm.padel'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'The Palm Padel');

INSERT INTO locations (name, address, google_maps_url, total_courts, notes)
SELECT 'Anfa Arena Padel',
       'Rooftop KTC Mall, Jl. Pulau Putri RT2/9, Kelapa Gading Barat, Jakarta Utara',
       'https://maps.app.goo.gl/AnfaArena',
       3,
       'Rooftop venue. Open daily 6AM-12MN. Juga ada futsal & basket. IG: @anfaarena'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Anfa Arena Padel');

-- =====================================================
-- 3. UPDATE SESSIONS TABLE
-- =====================================================

-- Step 1: Drop the old constraint FIRST (before updating data)
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_session_type_check;

-- Step 2: Now update existing data (safe because constraint is gone)
UPDATE sessions SET session_type = 'coaching_drilling' WHERE session_type = 'regular';
UPDATE sessions SET session_type = 'coaching_drilling' WHERE session_type = 'assessment_only';

-- Step 3: Add new constraint
ALTER TABLE sessions ADD CONSTRAINT sessions_session_type_check
  CHECK (session_type IN ('discovery', 'coaching_drilling'));

-- Change default
ALTER TABLE sessions ALTER COLUMN session_type SET DEFAULT 'coaching_drilling';

-- Add new columns
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS courts_booked INTEGER DEFAULT 1;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS duration_hours DECIMAL(3,1) DEFAULT 1.0;

-- =====================================================
-- 4. UPDATE ASSESSMENTS TABLE
-- =====================================================

-- Add is_active flag for archiving old assessments
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- =====================================================
-- 5. RLS FOR LOCATIONS
-- =====================================================

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Drop policies first if they exist (safe for re-run)
DROP POLICY IF EXISTS "Anyone can read active locations" ON locations;
DROP POLICY IF EXISTS "Admin can insert locations" ON locations;
DROP POLICY IF EXISTS "Admin can update locations" ON locations;
DROP POLICY IF EXISTS "Admin can delete locations" ON locations;

-- Everyone can read active locations
CREATE POLICY "Anyone can read active locations"
  ON locations FOR SELECT
  USING (is_active = true);

-- Only admin can insert/update/delete locations
CREATE POLICY "Admin can insert locations"
  ON locations FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can update locations"
  ON locations FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can delete locations"
  ON locations FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

COMMIT;
