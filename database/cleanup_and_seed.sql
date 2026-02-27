-- =====================================================
-- Padel Coach Pro - Cleanup & Seed Accounts
-- =====================================================
-- Run in Supabase SQL Editor
-- =====================================================

-- 1. Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- 2. Clean up orphaned data
DELETE FROM module_records WHERE player_id NOT IN (SELECT id FROM profiles);
DELETE FROM assessments WHERE player_id NOT IN (SELECT id FROM profiles);
DELETE FROM session_players WHERE player_id NOT IN (SELECT id FROM profiles);
DELETE FROM player_profiles WHERE player_id NOT IN (SELECT id FROM profiles);
DELETE FROM profiles WHERE id NOT IN (SELECT id FROM auth.users);

-- 3. Ensure trigger is up to date
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

-- 4. Remove old admin & coach if they exist
DO $$
DECLARE
  old_id UUID;
BEGIN
  -- Remove old admin
  SELECT id INTO old_id FROM auth.users WHERE email = 'admin@padel.local';
  IF old_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = old_id;  -- cascades to profiles, identities
  END IF;

  -- Remove old coach
  SELECT id INTO old_id FROM auth.users WHERE email = 'coach@padel.local';
  IF old_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = old_id;
  END IF;
END $$;

-- 5. Create admin account
DO $$
DECLARE
  new_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, role, aud, confirmation_token
  ) VALUES (
    new_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@padel.local',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin ICAN","role":"admin","username":"admin"}',
    NOW(), NOW(), 'authenticated', 'authenticated', ''
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, provider, identity_data,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    new_id, new_id, 'admin@padel.local', 'email',
    jsonb_build_object('sub', new_id::text, 'email', 'admin@padel.local'),
    NOW(), NOW(), NOW()
  );

  RAISE NOTICE 'Admin created: %', new_id;
END $$;

-- 6. Create coach account
DO $$
DECLARE
  new_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, role, aud, confirmation_token
  ) VALUES (
    new_id,
    '00000000-0000-0000-0000-000000000000',
    'coach@padel.local',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Coach Carlos","role":"coach","username":"coach"}',
    NOW(), NOW(), 'authenticated', 'authenticated', ''
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, provider, identity_data,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    new_id, new_id, 'coach@padel.local', 'email',
    jsonb_build_object('sub', new_id::text, 'email', 'coach@padel.local'),
    NOW(), NOW(), NOW()
  );

  RAISE NOTICE 'Coach created: %', new_id;
END $$;

-- 7. Verify
SELECT id, username, full_name, role, email FROM profiles ORDER BY role;

-- 8. Reload schema cache again after changes
NOTIFY pgrst, 'reload schema';
