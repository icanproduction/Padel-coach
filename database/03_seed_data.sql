-- =====================================================
-- Padel Coach Pro - Seed Data v2.0
-- =====================================================
-- NOTE: Users must be created via Supabase Auth first.
-- After creating users, replace the UUIDs below.
--
-- Test accounts to create in Supabase Auth Dashboard:
--   admin@padelcoach.pro / password123
--   coach@padelcoach.pro / password123
--   player@padelcoach.pro / password123
-- =====================================================

BEGIN;

DO $$
DECLARE
  -- Replace these with actual UUIDs from Supabase Auth
  admin_id UUID := '00000000-0000-0000-0000-000000000001'::UUID;
  coach_id UUID := '00000000-0000-0000-0000-000000000002'::UUID;
  player_id UUID := '00000000-0000-0000-0000-000000000003'::UUID;
  session_1_id UUID;
  session_2_id UUID;
  assessment_1_id UUID;
BEGIN

  -- =====================================================
  -- PROFILES
  -- =====================================================

  INSERT INTO profiles (id, full_name, email, phone, role, avatar_url)
  VALUES
    (admin_id, 'Admin Padel Coach', 'admin@padelcoach.pro', '+628123456789', 'admin', NULL),
    (coach_id, 'Carlos Rodriguez', 'coach@padelcoach.pro', '+628987654321', 'coach', NULL),
    (player_id, 'Maria Santos', 'player@padelcoach.pro', '+628111222333', 'player', NULL)
  ON CONFLICT (id) DO NOTHING;

  -- =====================================================
  -- PLAYER PROFILES
  -- =====================================================

  INSERT INTO player_profiles (
    player_id, experience_level, previous_racket_sport, primary_goal,
    fears_concerns, playing_frequency_goal, current_grade, current_archetype,
    total_sessions, onboarding_completed
  )
  VALUES (
    player_id, 'play_sometimes', 'Tennis', 'improve_technique',
    'Backhand needs work, glass wall play is intimidating',
    '2x_week', 'Grade 2', 'The Athlete',
    3, TRUE
  )
  ON CONFLICT (player_id) DO NOTHING;

  -- =====================================================
  -- SESSIONS
  -- =====================================================

  -- Completed session (1 week ago)
  INSERT INTO sessions (date, created_by, coach_id, session_type, status, max_players, notes)
  VALUES (
    NOW() - INTERVAL '7 days',
    admin_id,
    coach_id,
    'discovery',
    'completed',
    4,
    'Discovery session - initial assessment for Maria'
  )
  RETURNING id INTO session_1_id;

  -- Upcoming session
  INSERT INTO sessions (date, created_by, coach_id, session_type, status, max_players, notes)
  VALUES (
    NOW() + INTERVAL '3 days',
    admin_id,
    coach_id,
    'regular',
    'scheduled',
    4,
    'Ball Control and Court Awareness focus'
  )
  RETURNING id INTO session_2_id;

  -- =====================================================
  -- SESSION PLAYERS
  -- =====================================================

  IF session_1_id IS NOT NULL THEN
    INSERT INTO session_players (session_id, player_id, status)
    VALUES (session_1_id, player_id, 'attended')
    ON CONFLICT DO NOTHING;
  END IF;

  IF session_2_id IS NOT NULL THEN
    INSERT INTO session_players (session_id, player_id, status)
    VALUES (session_2_id, player_id, 'approved')
    ON CONFLICT DO NOTHING;
  END IF;

  -- =====================================================
  -- ASSESSMENTS
  -- =====================================================

  -- Initial assessment (1 month ago)
  INSERT INTO assessments (
    player_id, coach_id, session_id,
    reaction_to_ball, swing_size, spacing_awareness, recovery_habit, decision_making,
    average_score, player_grade, player_archetype,
    improvement_notes, areas_to_focus, recommended_next_modules
  )
  VALUES (
    player_id, coach_id, NULL,
    3, 3, 2, 3, 2,
    2.6, 'Grade 1', 'The Learner',
    'First assessment. Maria is new to padel but has tennis background.',
    ARRAY['spacing_awareness', 'decision_making'],
    ARRAY['serve-introduction', 'short-swing-control']
  );

  -- Recent assessment (1 week ago, from discovery session)
  IF session_1_id IS NOT NULL THEN
    INSERT INTO assessments (
      player_id, coach_id, session_id,
      reaction_to_ball, swing_size, spacing_awareness, recovery_habit, decision_making,
      average_score, player_grade, player_archetype,
      improvement_notes, areas_to_focus, recommended_next_modules
    )
    VALUES (
      player_id, coach_id, session_1_id,
      5, 4, 3, 6, 3,
      4.2, 'Grade 2', 'The Athlete',
      'Good improvement in reaction and recovery. Tennis background showing. Need to work on spacing and decision making for padel-specific situations.',
      ARRAY['spacing_awareness', 'decision_making'],
      ARRAY['spacing-awareness', 'recovery-position', 'short-swing-control']
    )
    RETURNING id INTO assessment_1_id;
  END IF;

  -- =====================================================
  -- MODULE RECORDS
  -- =====================================================

  IF assessment_1_id IS NOT NULL AND session_1_id IS NOT NULL THEN
    INSERT INTO module_records (
      assessment_id, session_id, player_id, coach_id,
      curriculum_id, module_id, module_score,
      drills_completed, status, notes
    )
    VALUES (
      assessment_1_id, session_1_id, player_id, coach_id,
      'serve-return-foundation', 'serve-introduction', 5,
      ARRAY['drop-contact-feel', 'static-underhand-serve'],
      'in_progress',
      'Good grasp of basic serve motion. Needs more practice on placement.'
    );
  END IF;

END $$;

COMMIT;
