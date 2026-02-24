-- =====================================================
-- Fix RLS policies for coach to read all players
-- Run this in Supabase SQL Editor
-- =====================================================

-- Re-create helper functions with proper SECURITY DEFINER
-- These bypass RLS when checking the current user's role
DROP FUNCTION IF EXISTS get_user_role() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS is_coach() CASCADE;
DROP FUNCTION IF EXISTS is_player() CASCADE;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_coach()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'coach';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_player()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'player';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-create all policies (drop first to avoid conflicts)
-- PROFILES
DROP POLICY IF EXISTS "admin_all_profiles" ON profiles;
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "coaches_read_all_profiles" ON profiles;

CREATE POLICY "admin_all_profiles" ON profiles
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "coaches_read_all_profiles" ON profiles
  FOR SELECT USING (is_coach());

-- PLAYER PROFILES
DROP POLICY IF EXISTS "admin_all_player_profiles" ON player_profiles;
DROP POLICY IF EXISTS "players_read_own_player_profile" ON player_profiles;
DROP POLICY IF EXISTS "players_update_own_player_profile" ON player_profiles;
DROP POLICY IF EXISTS "players_insert_own_player_profile" ON player_profiles;
DROP POLICY IF EXISTS "coaches_read_all_player_profiles" ON player_profiles;
DROP POLICY IF EXISTS "coaches_update_player_profiles" ON player_profiles;

CREATE POLICY "admin_all_player_profiles" ON player_profiles
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "players_read_own_player_profile" ON player_profiles
  FOR SELECT USING (player_id = auth.uid());
CREATE POLICY "players_update_own_player_profile" ON player_profiles
  FOR UPDATE USING (player_id = auth.uid()) WITH CHECK (player_id = auth.uid());
CREATE POLICY "players_insert_own_player_profile" ON player_profiles
  FOR INSERT WITH CHECK (player_id = auth.uid());
CREATE POLICY "coaches_read_all_player_profiles" ON player_profiles
  FOR SELECT USING (is_coach());
CREATE POLICY "coaches_update_player_profiles" ON player_profiles
  FOR UPDATE USING (is_coach()) WITH CHECK (is_coach());

-- SESSIONS
DROP POLICY IF EXISTS "admin_all_sessions" ON sessions;
DROP POLICY IF EXISTS "coaches_manage_own_sessions" ON sessions;
DROP POLICY IF EXISTS "players_read_sessions" ON sessions;

CREATE POLICY "admin_all_sessions" ON sessions
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "coaches_manage_own_sessions" ON sessions
  FOR ALL USING (coach_id = auth.uid()) WITH CHECK (coach_id = auth.uid());
CREATE POLICY "players_read_sessions" ON sessions
  FOR SELECT USING (is_player());

-- SESSION PLAYERS
DROP POLICY IF EXISTS "admin_all_session_players" ON session_players;
DROP POLICY IF EXISTS "coaches_manage_session_players" ON session_players;
DROP POLICY IF EXISTS "players_read_own_participation" ON session_players;
DROP POLICY IF EXISTS "players_join_session" ON session_players;

CREATE POLICY "admin_all_session_players" ON session_players
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "coaches_manage_session_players" ON session_players
  FOR ALL
  USING (session_id IN (SELECT id FROM sessions WHERE coach_id = auth.uid()))
  WITH CHECK (session_id IN (SELECT id FROM sessions WHERE coach_id = auth.uid()));
CREATE POLICY "players_read_own_participation" ON session_players
  FOR SELECT USING (player_id = auth.uid());
CREATE POLICY "players_join_session" ON session_players
  FOR INSERT WITH CHECK (
    is_player() AND player_id = auth.uid() AND status = 'pending'
  );

-- ASSESSMENTS
DROP POLICY IF EXISTS "admin_all_assessments" ON assessments;
DROP POLICY IF EXISTS "coaches_create_assessments" ON assessments;
DROP POLICY IF EXISTS "coaches_read_assessments" ON assessments;
DROP POLICY IF EXISTS "coaches_update_own_assessments" ON assessments;
DROP POLICY IF EXISTS "players_read_own_assessments" ON assessments;

CREATE POLICY "admin_all_assessments" ON assessments
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "coaches_create_assessments" ON assessments
  FOR INSERT WITH CHECK (is_coach() AND coach_id = auth.uid());
CREATE POLICY "coaches_read_assessments" ON assessments
  FOR SELECT USING (is_coach());
CREATE POLICY "coaches_update_own_assessments" ON assessments
  FOR UPDATE USING (coach_id = auth.uid()) WITH CHECK (coach_id = auth.uid());
CREATE POLICY "players_read_own_assessments" ON assessments
  FOR SELECT USING (player_id = auth.uid());

-- MODULE RECORDS
DROP POLICY IF EXISTS "admin_all_module_records" ON module_records;
DROP POLICY IF EXISTS "coaches_create_module_records" ON module_records;
DROP POLICY IF EXISTS "coaches_read_module_records" ON module_records;
DROP POLICY IF EXISTS "coaches_update_own_module_records" ON module_records;
DROP POLICY IF EXISTS "players_read_own_module_records" ON module_records;

CREATE POLICY "admin_all_module_records" ON module_records
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "coaches_create_module_records" ON module_records
  FOR INSERT WITH CHECK (is_coach() AND coach_id = auth.uid());
CREATE POLICY "coaches_read_module_records" ON module_records
  FOR SELECT USING (is_coach());
CREATE POLICY "coaches_update_own_module_records" ON module_records
  FOR UPDATE USING (coach_id = auth.uid()) WITH CHECK (coach_id = auth.uid());
CREATE POLICY "players_read_own_module_records" ON module_records
  FOR SELECT USING (player_id = auth.uid());
