-- =====================================================
-- Padel Coach Pro - Change Order v5 Migration
-- =====================================================
-- Changes:
--   1. Add 'selected_modules' TEXT[] to sessions
--   2. Add 'drill_scores' JSONB to module_records
-- =====================================================
-- SAFE TO RE-RUN: Uses IF NOT EXISTS guards
-- =====================================================

BEGIN;

-- 1. Coach can select modules for a coaching session
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS selected_modules TEXT[];

-- 2. Store individual drill scores in module_records
-- Format: {"drill-id": score} e.g. {"serve-intro-1": 7, "serve-intro-2": 8}
ALTER TABLE module_records ADD COLUMN IF NOT EXISTS drill_scores JSONB;

COMMIT;
