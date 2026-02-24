-- =====================================================
-- Padel Coach Pro - Database Functions v2.0
-- =====================================================

BEGIN;

-- =====================================================
-- Calculate Grade from average score
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_grade(avg_score DECIMAL)
RETURNS TEXT AS $$
BEGIN
  IF avg_score >= 8.5 THEN RETURN 'Grade 5';
  ELSIF avg_score >= 7.0 THEN RETURN 'Grade 4';
  ELSIF avg_score >= 5.0 THEN RETURN 'Grade 3';
  ELSIF avg_score >= 3.0 THEN RETURN 'Grade 2';
  ELSE RETURN 'Grade 1';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- Determine Archetype from 5 parameter scores
-- =====================================================
-- Priority order: check patterns top to bottom, first match wins

CREATE OR REPLACE FUNCTION determine_archetype(
  r INTEGER,   -- reaction_to_ball
  s INTEGER,   -- swing_size
  sp INTEGER,  -- spacing_awareness
  rec INTEGER, -- recovery_habit
  d INTEGER    -- decision_making
)
RETURNS TEXT AS $$
DECLARE
  scores INTEGER[] := ARRAY[r, s, sp, rec, d];
  min_score INTEGER;
  max_score INTEGER;
  all_above_6 BOOLEAN;
  all_below_5 BOOLEAN;
BEGIN
  min_score := LEAST(r, s, sp, rec, d);
  max_score := GREATEST(r, s, sp, rec, d);
  all_above_6 := (r > 6 AND s > 6 AND sp > 6 AND rec > 6 AND d > 6);
  all_below_5 := (r < 5 AND s < 5 AND sp < 5 AND rec < 5 AND d < 5);

  -- The Learner: all scores below 5
  IF all_below_5 THEN RETURN 'The Learner'; END IF;

  -- The Natural: all scores above 6, relatively balanced
  IF all_above_6 THEN RETURN 'The Natural'; END IF;

  -- The Wild Card: high variance (spread > 4)
  IF (max_score - min_score) > 4 THEN RETURN 'The Wild Card'; END IF;

  -- The Thinker: Decision Making highest (7+), but Reaction/Recovery lower
  IF d >= 7 AND d >= GREATEST(r, s, sp, rec) AND (r < d - 2 OR rec < d - 2)
    THEN RETURN 'The Thinker'; END IF;

  -- The Athlete: Reaction + Recovery highest, Decision Making lower
  IF r >= 6 AND rec >= 6 AND (r + rec) > (d + sp) AND d < LEAST(r, rec)
    THEN RETURN 'The Athlete'; END IF;

  -- The Wall: Spacing + Swing consistent (6+), low Decision Making
  IF sp >= 6 AND s >= 6 AND d < 5
    THEN RETURN 'The Wall'; END IF;

  -- The Competitor: Decision Making + Recovery highest
  IF d >= 6 AND rec >= 6 AND (d + rec) >= (r + s + sp) * 2 / 3
    THEN RETURN 'The Competitor'; END IF;

  -- Default based on strongest area
  IF r >= GREATEST(s, sp, rec, d) THEN RETURN 'The Athlete'; END IF;
  IF d >= GREATEST(r, s, sp, rec) THEN RETURN 'The Thinker'; END IF;
  IF rec >= GREATEST(r, s, sp, d) THEN RETURN 'The Competitor'; END IF;

  RETURN 'The Learner';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMIT;
