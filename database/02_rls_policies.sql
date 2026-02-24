-- =====================================================
-- Padel Coach Pro - Row Level Security Policies v2.0
-- =====================================================

BEGIN;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_coach()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'coach';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_player()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'player';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_records ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

CREATE POLICY "admin_all_profiles" ON profiles
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Coaches can read all profiles (to see player names)
CREATE POLICY "coaches_read_all_profiles" ON profiles
  FOR SELECT USING (is_coach());

-- =====================================================
-- PLAYER PROFILES POLICIES
-- =====================================================

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

-- Coaches can update player grade/archetype after assessment
CREATE POLICY "coaches_update_player_profiles" ON player_profiles
  FOR UPDATE USING (is_coach()) WITH CHECK (is_coach());

-- =====================================================
-- SESSIONS POLICIES
-- =====================================================

CREATE POLICY "admin_all_sessions" ON sessions
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "coaches_manage_own_sessions" ON sessions
  FOR ALL USING (coach_id = auth.uid()) WITH CHECK (coach_id = auth.uid());

-- Players can view scheduled sessions
CREATE POLICY "players_read_sessions" ON sessions
  FOR SELECT USING (is_player());

-- =====================================================
-- SESSION PLAYERS POLICIES
-- =====================================================

CREATE POLICY "admin_all_session_players" ON session_players
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Coaches can manage participants in their sessions
CREATE POLICY "coaches_manage_session_players" ON session_players
  FOR ALL
  USING (
    session_id IN (SELECT id FROM sessions WHERE coach_id = auth.uid())
  )
  WITH CHECK (
    session_id IN (SELECT id FROM sessions WHERE coach_id = auth.uid())
  );

-- Players can view their own participation
CREATE POLICY "players_read_own_participation" ON session_players
  FOR SELECT USING (player_id = auth.uid());

-- Players can request to join (insert only, pending status)
CREATE POLICY "players_join_session" ON session_players
  FOR INSERT WITH CHECK (
    is_player() AND player_id = auth.uid() AND status = 'pending'
  );

-- =====================================================
-- ASSESSMENTS POLICIES
-- =====================================================

CREATE POLICY "admin_all_assessments" ON assessments
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Coaches can create assessments
CREATE POLICY "coaches_create_assessments" ON assessments
  FOR INSERT WITH CHECK (is_coach() AND coach_id = auth.uid());

-- Coaches can read all assessments
CREATE POLICY "coaches_read_assessments" ON assessments
  FOR SELECT USING (is_coach());

-- Coaches can update their own assessments
CREATE POLICY "coaches_update_own_assessments" ON assessments
  FOR UPDATE USING (coach_id = auth.uid()) WITH CHECK (coach_id = auth.uid());

-- Players can read their own assessments
CREATE POLICY "players_read_own_assessments" ON assessments
  FOR SELECT USING (player_id = auth.uid());

-- =====================================================
-- MODULE RECORDS POLICIES
-- =====================================================

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

COMMIT;
