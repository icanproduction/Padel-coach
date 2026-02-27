-- Add gender column to player_profiles
-- Run in Supabase SQL Editor

ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female'));
