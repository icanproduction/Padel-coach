-- =====================================================
-- Padel Coach Pro - Database Schema v2.0
-- =====================================================
-- Based on: Technical Brief v1
-- Purpose: Player Development System
--   Diagnostic → Prescription → Progress
--
-- Tables:
--   1. profiles (extends Supabase Auth)
--   2. player_profiles (onboarding + grade/archetype)
--   3. sessions (coaching sessions)
--   4. session_players (junction)
--   5. assessments (5-parameter diagnostic)
--   6. module_records (curriculum completion)
-- =====================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'coach', 'player')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- =====================================================
-- 2. PLAYER PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS player_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  experience_level TEXT CHECK (experience_level IN ('never_played', 'tried_once', 'play_sometimes', 'play_regularly')),
  previous_racket_sport TEXT,
  primary_goal TEXT CHECK (primary_goal IN ('learn_basics', 'improve_technique', 'competitive_play', 'fitness', 'social_fun')),
  fears_concerns TEXT,
  playing_frequency_goal TEXT CHECK (playing_frequency_goal IN ('1x_week', '2x_week', '3x_week', 'more')),
  current_grade TEXT DEFAULT 'Unassessed',
  current_archetype TEXT DEFAULT 'Unassessed',
  total_sessions INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_player_profiles_player_id ON player_profiles(player_id);
CREATE INDEX idx_player_profiles_grade ON player_profiles(current_grade);

-- =====================================================
-- 3. SESSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES profiles(id),
  coach_id UUID NOT NULL REFERENCES profiles(id),
  session_type TEXT DEFAULT 'regular' CHECK (session_type IN ('discovery', 'regular', 'assessment_only')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  max_players INTEGER DEFAULT 4 CHECK (max_players > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_coach_id ON sessions(coach_id);
CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_sessions_status ON sessions(status);

-- =====================================================
-- 4. SESSION PLAYERS
-- =====================================================

CREATE TABLE IF NOT EXISTS session_players (
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'attended', 'no_show')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (session_id, player_id)
);

CREATE INDEX idx_session_players_player_id ON session_players(player_id);
CREATE INDEX idx_session_players_status ON session_players(status);

-- =====================================================
-- 5. ASSESSMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id),

  -- 5 assessment parameters (1-10)
  reaction_to_ball INTEGER NOT NULL CHECK (reaction_to_ball BETWEEN 1 AND 10),
  swing_size INTEGER NOT NULL CHECK (swing_size BETWEEN 1 AND 10),
  spacing_awareness INTEGER NOT NULL CHECK (spacing_awareness BETWEEN 1 AND 10),
  recovery_habit INTEGER NOT NULL CHECK (recovery_habit BETWEEN 1 AND 10),
  decision_making INTEGER NOT NULL CHECK (decision_making BETWEEN 1 AND 10),

  -- Auto-calculated
  average_score DECIMAL(3,1) NOT NULL,
  player_grade TEXT NOT NULL,
  player_archetype TEXT NOT NULL,

  -- Coach notes
  improvement_notes TEXT,
  areas_to_focus TEXT[],
  recommended_next_modules TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessments_player_id ON assessments(player_id);
CREATE INDEX idx_assessments_coach_id ON assessments(coach_id);
CREATE INDEX idx_assessments_session_id ON assessments(session_id);
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX idx_assessments_player_date ON assessments(player_id, created_at DESC);

-- =====================================================
-- 6. MODULE RECORDS
-- =====================================================

CREATE TABLE IF NOT EXISTS module_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id),

  curriculum_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  module_score INTEGER CHECK (module_score BETWEEN 1 AND 10),
  drills_completed TEXT[],
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_module_records_player_id ON module_records(player_id);
CREATE INDEX idx_module_records_session_id ON module_records(session_id);
CREATE INDEX idx_module_records_module ON module_records(curriculum_id, module_id);
CREATE INDEX idx_module_records_status ON module_records(status);

-- =====================================================
-- TRIGGER: Auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER player_profiles_updated_at
  BEFORE UPDATE ON player_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMIT;
