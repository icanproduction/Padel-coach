-- =====================================================
-- Seed Locations Data
-- =====================================================
-- Run AFTER 00_full_setup.sql
-- Adds maps_link column if not exists, then seeds locations
-- =====================================================

-- Add maps_link column if not exists
ALTER TABLE locations ADD COLUMN IF NOT EXISTS maps_link TEXT;

-- Insert locations
INSERT INTO locations (name, address, courts, is_active, maps_link) VALUES
(
  'Anfa Arena',
  'Rooftop KTC Mall, Jl. Pulau Putri, Kelapa Gading, Jakarta Utara',
  3,
  true,
  'https://www.google.com/maps/search/Anfa+Arena+Padel+Kelapa+Gading+Jakarta'
),
(
  'Bara Padel Court',
  'Jl. Industri No.6 Blok C/1, Gunung Sahari Utara, Kemayoran, Jakarta Pusat',
  2,
  true,
  'https://www.google.com/maps/search/Bara+Padel+Court+Kemayoran+Jakarta'
),
(
  'Metro Sport Center',
  'Metro Sunter Plaza Lt. 4, Jl. Danau Sunter Utara, Tanjung Priok, Jakarta Utara',
  2,
  true,
  'https://www.google.com/maps/search/Metro+Sport+Center+Padel+Sunter+Jakarta'
),
(
  'The 40/0 Club',
  'Jl. Agung Indah 4, Sunter Agung, Tanjung Priok, Jakarta Utara',
  3,
  true,
  'https://www.google.com/maps/search/The+40+0+Club+Padel+Sunter+Jakarta'
),
(
  'The Palm Padel',
  'Jl. Griya Sejahtera No. 1, Sunter Agung, Jakarta Utara',
  3,
  true,
  'https://www.google.com/maps/search/The+Palm+Padel+Sunter+Jakarta'
),
(
  'Fivestar Signature Club',
  'D-8/1 Jl. Sunter Garden Raya, Tanjung Priok, Jakarta Utara',
  4,
  true,
  'https://www.google.com/maps/search/Fivestar+Signature+Club+Sunter+Jakarta'
),
(
  'Master Padel',
  'Jl. Yos Sudarso, Sunter Jaya, Tanjung Priok, Jakarta Utara',
  8,
  true,
  'https://www.google.com/maps/search/Master+Padel+Sunter+Jakarta'
),
(
  'Padel Go Blast',
  'Jl. Danau Sunter Utara No. A/2, Papanggo, Tanjung Priok, Jakarta Utara',
  3,
  true,
  'https://www.google.com/maps/search/Padel+Go+Blast+Sunter+Jakarta'
);
