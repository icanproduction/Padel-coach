-- Clear all player data (keep coach/admin accounts)
-- Run in Supabase SQL Editor

BEGIN;

-- 1. Delete module records
DELETE FROM module_records;

-- 2. Delete assessments
DELETE FROM assessments;

-- 3. Delete session participants
DELETE FROM session_players;

-- 4. Delete sessions
DELETE FROM sessions;

-- 5. Delete player profiles
DELETE FROM player_profiles;

-- 6. Delete player accounts from profiles
DELETE FROM profiles WHERE role = 'player';

-- 7. Delete player auth users (profiles with role='player' already deleted above)
-- This deletes from auth.users where the user was a player
-- Note: only works if you have service_role access
DELETE FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

COMMIT;
