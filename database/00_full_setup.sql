-- =====================================================
-- Padel Coach Pro - FULL DATABASE SETUP
-- =====================================================
-- Run this in a FRESH Supabase project SQL Editor
-- Creates all tables, indexes, triggers, and RLS policies
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
  username TEXT NOT NULL UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'coach', 'player')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- =====================================================
-- 2. PLAYER PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS player_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  experience_level TEXT CHECK (experience_level IN ('never_played', 'tried_once', 'play_sometimes', 'play_regularly')),
  previous_racket_sport TEXT,
  primary_goal TEXT,
  fears_concerns TEXT,
  playing_frequency_goal TEXT CHECK (playing_frequency_goal IN ('1x_week', '2x_week', '3x_week', 'more')),
  current_grade TEXT DEFAULT 'Unassessed',
  current_archetype TEXT DEFAULT 'Unassessed',
  total_sessions INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_player_profiles_player_id ON player_profiles(player_id);
CREATE INDEX IF NOT EXISTS idx_player_profiles_grade ON player_profiles(current_grade);

-- =====================================================
-- 3. LOCATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  courts INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  reclub_link TEXT,
  maps_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. SESSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES profiles(id),
  coach_id UUID NOT NULL REFERENCES profiles(id),
  session_type TEXT DEFAULT 'coaching_drilling' CHECK (session_type IN ('discovery', 'coaching_drilling', 'open_play')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  max_players INTEGER DEFAULT 4 CHECK (max_players > 0),
  notes TEXT,
  location_id UUID REFERENCES locations(id),
  courts_booked INTEGER,
  duration_hours NUMERIC DEFAULT 1.5,
  reclub_url TEXT,
  selected_modules TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_coach_id ON sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- =====================================================
-- 5. SESSION PLAYERS
-- =====================================================

CREATE TABLE IF NOT EXISTS session_players (
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'attended', 'no_show')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (session_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_session_players_player_id ON session_players(player_id);
CREATE INDEX IF NOT EXISTS idx_session_players_status ON session_players(status);

-- =====================================================
-- 6. ASSESSMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id),
  reaction_to_ball INTEGER NOT NULL CHECK (reaction_to_ball BETWEEN 1 AND 10),
  swing_size INTEGER NOT NULL CHECK (swing_size BETWEEN 1 AND 10),
  spacing_awareness INTEGER NOT NULL CHECK (spacing_awareness BETWEEN 1 AND 10),
  recovery_habit INTEGER NOT NULL CHECK (recovery_habit BETWEEN 1 AND 10),
  decision_making INTEGER NOT NULL CHECK (decision_making BETWEEN 1 AND 10),
  average_score DECIMAL(3,1) NOT NULL,
  player_grade TEXT NOT NULL,
  player_archetype TEXT NOT NULL,
  improvement_notes TEXT,
  areas_to_focus TEXT[],
  recommended_next_modules TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_player_id ON assessments(player_id);
CREATE INDEX IF NOT EXISTS idx_assessments_coach_id ON assessments(coach_id);
CREATE INDEX IF NOT EXISTS idx_assessments_session_id ON assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);

-- =====================================================
-- 7. MODULE RECORDS
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
  drill_scores JSONB DEFAULT '{}',
  drills_completed TEXT[],
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_module_records_player_id ON module_records(player_id);
CREATE INDEX IF NOT EXISTS idx_module_records_session_id ON module_records(session_id);
CREATE INDEX IF NOT EXISTS idx_module_records_module ON module_records(curriculum_id, module_id);

-- =====================================================
-- TRIGGERS: Auto-update updated_at
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

-- =====================================================
-- TRIGGER: Auto-create profile on auth signup
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'player'),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );

  IF COALESCE(NEW.raw_user_meta_data->>'role', 'player') = 'player' THEN
    INSERT INTO public.player_profiles (player_id)
    VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- RLS: Simple policies (app-level auth handles roles)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON profiles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_all" ON player_profiles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_all" ON sessions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_all" ON session_players
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_all" ON assessments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_all" ON module_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_all" ON locations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Also allow anon to read locations (for public pages)
CREATE POLICY "anon_read_locations" ON locations
  FOR SELECT TO anon USING (true);

COMMIT;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
