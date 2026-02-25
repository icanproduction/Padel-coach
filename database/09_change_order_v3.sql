-- =====================================================
-- Padel Coach Pro - Change Order v3 Migration
-- =====================================================
-- Changes:
--   1. Add 'open_play' session type
--   2. Make courts_booked nullable (NULL for Open Play)
--   3. Add reclub_url field to sessions
-- =====================================================
-- SAFE TO RE-RUN: Uses IF NOT EXISTS and IF EXISTS guards
-- =====================================================

BEGIN;

-- 1. Update session_type constraint (3 types now)
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_session_type_check;

ALTER TABLE sessions ADD CONSTRAINT sessions_session_type_check
  CHECK (session_type IN ('discovery', 'coaching_drilling', 'open_play'));

-- 2. Make courts_booked nullable (for Open Play — unlimited courts)
ALTER TABLE sessions ALTER COLUMN courts_booked DROP NOT NULL;
ALTER TABLE sessions ALTER COLUMN courts_booked DROP DEFAULT;

-- 3. Add ReClub URL field (optional link for booking)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS reclub_url TEXT;

-- 4. Add duration 4hrs option (update: already DECIMAL so no constraint needed)
-- Duration options now: 1, 1.5, 2, 2.5, 3, 4

COMMIT;
