-- =====================================================
-- Padel Coach Pro - Change Order v4 Migration
-- =====================================================
-- Changes:
--   1. Add 'username' column to profiles (UNIQUE)
--   2. Backfill existing users with email prefix
--   3. Update handle_new_user() trigger for username
--   4. Drop primary_goal CHECK constraint (allow multi-select)
-- =====================================================
-- SAFE TO RE-RUN: Uses IF NOT EXISTS / IF EXISTS guards
-- =====================================================

BEGIN;

-- =====================================================
-- PART A: Username column
-- =====================================================

-- 1. Add username column (nullable first for backfill)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- 2. Backfill existing users: use email prefix as username
UPDATE profiles SET username = split_part(email, '@', 1) WHERE username IS NULL;

-- 3. Deduplicate: for rows with same username, append _N suffix
DO $$
DECLARE
  dup RECORD;
  usr RECORD;
  counter INT;
BEGIN
  FOR dup IN (
    SELECT username AS uname FROM profiles
    GROUP BY username HAVING COUNT(*) > 1
  ) LOOP
    counter := 1;
    FOR usr IN (
      SELECT id FROM profiles
      WHERE username = dup.uname
      ORDER BY created_at ASC
    ) LOOP
      IF counter > 1 THEN
        UPDATE profiles SET username = dup.uname || '_' || counter
        WHERE id = usr.id;
      END IF;
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;

-- 4. Make username NOT NULL + UNIQUE
ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- =====================================================
-- PART B: Multi-select for onboarding fields
-- =====================================================

-- Drop primary_goal CHECK constraint to allow comma-separated values
ALTER TABLE player_profiles DROP CONSTRAINT IF EXISTS player_profiles_primary_goal_check;

-- =====================================================
-- PART C: Update auth trigger
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

  -- Auto-create player_profiles for player role
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'player') = 'player' THEN
    INSERT INTO public.player_profiles (player_id)
    VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
