// =====================================================
// Padel Coach Pro - Database TypeScript Types v2.0
// =====================================================
// Based on Technical Brief v1

// =====================================================
// ENUMS & CONSTANTS
// =====================================================

export type UserRole = 'admin' | 'coach' | 'player'

export type ExperienceLevel = 'never_played' | 'tried_once' | 'play_sometimes' | 'play_regularly'

export type PrimaryGoal = 'learn_basics' | 'improve_technique' | 'competitive_play' | 'fitness' | 'social_fun'

export type PlayingFrequency = '1x_week' | '2x_week' | '3x_week' | 'more'

export type SessionType = 'discovery' | 'regular' | 'assessment_only'

export type SessionStatus = 'scheduled' | 'in_progress' | 'completed'

export type ParticipantStatus = 'pending' | 'approved' | 'rejected' | 'attended' | 'no_show'

export type ModuleStatus = 'not_started' | 'in_progress' | 'completed'

export type PlayerGrade = 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 4' | 'Grade 5' | 'Unassessed'

export type PlayerArchetype =
  | 'The Thinker'
  | 'The Athlete'
  | 'The Wall'
  | 'The Wild Card'
  | 'The Learner'
  | 'The Competitor'
  | 'The Natural'
  | 'Unassessed'

export const GRADE_LABELS: Record<string, string> = {
  'Grade 1': 'Foundation',
  'Grade 2': 'Developing',
  'Grade 3': 'Competent',
  'Grade 4': 'Proficient',
  'Grade 5': 'Advanced',
  'Unassessed': 'Unassessed',
}

export const ASSESSMENT_PARAMETERS = [
  { key: 'reaction_to_ball', label: 'Reaction to Ball', description: 'How quickly and appropriately the player reacts to incoming ball' },
  { key: 'swing_size', label: 'Swing Size', description: 'Whether the player uses appropriate swing length for the situation' },
  { key: 'spacing_awareness', label: 'Spacing Awareness', description: "Player's ability to position at correct distance from the ball" },
  { key: 'recovery_habit', label: 'Recovery Habit', description: 'Whether the player returns to ready position after each shot' },
  { key: 'decision_making', label: 'Decision Making', description: 'Shot selection quality and reading the game situation' },
] as const

export const SCORING_GUIDE = [
  { range: '1-2', label: 'No awareness / Cannot perform' },
  { range: '3-4', label: 'Occasional, inconsistent' },
  { range: '5-6', label: 'Developing, sometimes correct' },
  { range: '7-8', label: 'Consistent, reliable under normal pressure' },
  { range: '9-10', label: 'Excellent, maintains under high pressure' },
]

// =====================================================
// TABLE TYPES
// =====================================================

export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  date_of_birth: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface PlayerProfile {
  id: string
  player_id: string
  experience_level: ExperienceLevel | null
  previous_racket_sport: string | null
  primary_goal: PrimaryGoal | null
  fears_concerns: string | null
  playing_frequency_goal: PlayingFrequency | null
  current_grade: string
  current_archetype: string
  total_sessions: number
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  date: string
  created_by: string | null
  coach_id: string
  session_type: SessionType
  status: SessionStatus
  max_players: number
  location: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SessionPlayer {
  session_id: string
  player_id: string
  status: ParticipantStatus
  joined_at: string
}

export interface Assessment {
  id: string
  session_id: string | null
  player_id: string
  coach_id: string
  reaction_to_ball: number
  swing_size: number
  spacing_awareness: number
  recovery_habit: number
  decision_making: number
  average_score: number
  player_grade: string
  player_archetype: string
  improvement_notes: string | null
  areas_to_focus: string[] | null
  recommended_next_modules: string[] | null
  created_at: string
}

export interface ModuleRecord {
  id: string
  assessment_id: string | null
  session_id: string | null
  player_id: string
  coach_id: string
  curriculum_id: string
  module_id: string
  module_score: number | null
  drills_completed: string[] | null
  status: ModuleStatus
  notes: string | null
  created_at: string
}

// =====================================================
// JOINED / EXTENDED TYPES
// =====================================================

export interface SessionWithCoach extends Session {
  coach: Profile
}

export interface SessionWithDetails extends Session {
  coach: Profile
  session_players: (SessionPlayer & { profiles: Profile })[]
}

export interface AssessmentWithRelations extends Assessment {
  coach: Profile
  player: Profile
  session?: Session | null
}

export interface PlayerWithProfile extends Profile {
  player_profiles: PlayerProfile
}

// =====================================================
// INPUT TYPES (for forms / server actions)
// =====================================================

export interface CreateSessionInput {
  date: string
  coach_id: string
  session_type: SessionType
  max_players: number
  location?: string
  notes?: string
}

export interface AssessmentScoresInput {
  reaction_to_ball: number
  swing_size: number
  spacing_awareness: number
  recovery_habit: number
  decision_making: number
}

export interface CreateAssessmentInput extends AssessmentScoresInput {
  player_id: string
  session_id?: string
  improvement_notes?: string
  areas_to_focus?: string[]
}

export interface OnboardingInput {
  experience_level: ExperienceLevel
  previous_racket_sport?: string
  primary_goal: PrimaryGoal
  fears_concerns?: string
  playing_frequency_goal: PlayingFrequency
}

export interface RecordModuleInput {
  session_id?: string
  assessment_id?: string
  player_id: string
  curriculum_id: string
  module_id: string
  module_score?: number
  drills_completed?: string[]
  status: ModuleStatus
  notes?: string
}
