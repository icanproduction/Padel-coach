-- =====================================================
-- Padel Coach Pro - Reset RLS (Simple)
-- =====================================================
-- Run in Supabase SQL Editor
-- Drops all complex policies and replaces with simple ones
-- =====================================================

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- 1. DROP ALL EXISTING POLICIES
-- =====================================================

-- profiles
DROP POLICY IF EXISTS "admin_all_profiles" ON profiles;
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "coaches_read_all_profiles" ON profiles;
DROP POLICY IF EXISTS "allow_all" ON profiles;

-- player_profiles
DROP POLICY IF EXISTS "admin_all_player_profiles" ON player_profiles;
DROP POLICY IF EXISTS "players_read_own_player_profile" ON player_profiles;
DROP POLICY IF EXISTS "players_update_own_player_profile" ON player_profiles;
DROP POLICY IF EXISTS "players_insert_own_player_profile" ON player_profiles;
DROP POLICY IF EXISTS "coaches_read_all_player_profiles" ON player_profiles;
DROP POLICY IF EXISTS "coaches_update_player_profiles" ON player_profiles;
DROP POLICY IF EXISTS "allow_all" ON player_profiles;

-- sessions
DROP POLICY IF EXISTS "admin_all_sessions" ON sessions;
DROP POLICY IF EXISTS "coaches_manage_own_sessions" ON sessions;
DROP POLICY IF EXISTS "players_read_sessions" ON sessions;
DROP POLICY IF EXISTS "allow_all" ON sessions;

-- session_players
DROP POLICY IF EXISTS "admin_all_session_players" ON session_players;
DROP POLICY IF EXISTS "coaches_manage_session_players" ON session_players;
DROP POLICY IF EXISTS "players_read_own_participation" ON session_players;
DROP POLICY IF EXISTS "players_join_session" ON session_players;
DROP POLICY IF EXISTS "allow_all" ON session_players;

-- assessments
DROP POLICY IF EXISTS "admin_all_assessments" ON assessments;
DROP POLICY IF EXISTS "coaches_create_assessments" ON assessments;
DROP POLICY IF EXISTS "coaches_read_assessments" ON assessments;
DROP POLICY IF EXISTS "coaches_update_own_assessments" ON assessments;
DROP POLICY IF EXISTS "players_read_own_assessments" ON assessments;
DROP POLICY IF EXISTS "allow_all" ON assessments;

-- module_records
DROP POLICY IF EXISTS "admin_all_module_records" ON module_records;
DROP POLICY IF EXISTS "coaches_create_module_records" ON module_records;
DROP POLICY IF EXISTS "coaches_read_module_records" ON module_records;
DROP POLICY IF EXISTS "coaches_update_own_module_records" ON module_records;
DROP POLICY IF EXISTS "players_read_own_module_records" ON module_records;
DROP POLICY IF EXISTS "allow_all" ON module_records;

-- locations
DROP POLICY IF EXISTS "Anyone can read active locations" ON locations;
DROP POLICY IF EXISTS "Admin can insert locations" ON locations;
DROP POLICY IF EXISTS "Admin can update locations" ON locations;
DROP POLICY IF EXISTS "Admin can delete locations" ON locations;
DROP POLICY IF EXISTS "allow_all" ON locations;

-- =====================================================
-- 2. DROP OLD HELPER FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS get_user_role() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS is_coach() CASCADE;
DROP FUNCTION IF EXISTS is_player() CASCADE;

-- =====================================================
-- 3. ENABLE RLS + SIMPLE POLICIES
-- =====================================================
-- One policy per table: authenticated users can do everything
-- App-level code handles authorization (role checks in server actions)

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

-- =====================================================
-- 4. RECREATE AUTH TRIGGER
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

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
-- 5. CLEANUP: Remove orphaned data
-- =====================================================

DELETE FROM profiles WHERE id NOT IN (SELECT id FROM auth.users);

-- =====================================================
-- 6. RELOAD SCHEMA CACHE
-- =====================================================

NOTIFY pgrst, 'reload schema';
