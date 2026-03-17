-- =============================================
-- 1. Add 'waitlisted' and 'cancel_requested' to session_players status
-- =============================================
-- Note: session_players.status is text, no enum constraint to alter

-- 2. Add price_per_pax to sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS price_per_pax integer DEFAULT NULL;

-- =============================================
-- 3. Achievement Badges
-- =============================================
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS player_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  given_by uuid REFERENCES auth.users(id),
  given_at timestamptz DEFAULT now(),
  UNIQUE(player_id, badge_id)
);

-- RLS for badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Admin can manage badges" ON badges FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS for player_badges
ALTER TABLE player_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read player_badges" ON player_badges FOR SELECT USING (true);
CREATE POLICY "Admin can manage player_badges" ON player_badges FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- 4. Announcements
-- =============================================
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  target_role text DEFAULT 'all', -- 'all', 'player', 'coach'
  created_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Admin can manage announcements" ON announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
