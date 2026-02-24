-- =====================================================
-- Padel Coach Pro - Drop Old Schema
-- =====================================================
-- Run this FIRST before creating new schema
-- Drops all old tables, functions, and triggers
-- =====================================================

BEGIN;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS player_progress_snapshots CASCADE;
DROP TABLE IF EXISTS skill_assessments CASCADE;
DROP TABLE IF EXISTS session_participants CASCADE;
DROP TABLE IF EXISTS coaching_sessions CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS skill_categories CASCADE;
DROP TABLE IF EXISTS coaches CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop old functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS is_coach() CASCADE;
DROP FUNCTION IF EXISTS is_player() CASCADE;
DROP FUNCTION IF EXISTS get_current_player_id() CASCADE;
DROP FUNCTION IF EXISTS get_current_coach_id() CASCADE;

COMMIT;
