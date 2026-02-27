-- Create admin account
-- Run in Supabase SQL Editor

-- First, clean up any partial admin data from previous attempts
DELETE FROM profiles WHERE email = 'admin@padel.local';
DELETE FROM auth.identities WHERE provider_id = 'admin@padel.local';
DELETE FROM auth.users WHERE email = 'admin@padel.local';

-- Create admin user (trigger will auto-create profile)
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, role, aud, confirmation_token
  )
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@padel.local',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Admin ICAN", "role": "admin", "username": "admin"}',
    NOW(), NOW(), 'authenticated', 'authenticated', ''
  )
  RETURNING id INTO new_user_id;

  -- Create identity record
  INSERT INTO auth.identities (
    id, user_id, provider_id, provider, identity_data,
    last_sign_in_at, created_at, updated_at
  )
  VALUES (
    new_user_id,
    new_user_id,
    'admin@padel.local',
    'email',
    jsonb_build_object('sub', new_user_id::text, 'email', 'admin@padel.local'),
    NOW(), NOW(), NOW()
  );

  RAISE NOTICE 'Admin created: %', new_user_id;
END $$;
