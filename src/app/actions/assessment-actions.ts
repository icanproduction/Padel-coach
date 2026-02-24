'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CreateAssessmentInput } from '@/types/database'

export async function createAssessment(input: CreateAssessmentInput & {
  average_score: number
  player_grade: string
  player_archetype: string
  recommended_next_modules?: string[]
}) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'coach' && profile.role !== 'admin')) {
      return { error: 'Only coaches can create assessments' }
    }

    // Validate scores 1-10
    const scores = [
      input.reaction_to_ball, input.swing_size, input.spacing_awareness,
      input.recovery_habit, input.decision_making,
    ]
    if (scores.some((s) => !Number.isInteger(s) || s < 1 || s > 10)) {
      return { error: 'All scores must be integers between 1 and 10' }
    }

    // Insert assessment
    const { data, error } = await supabase
      .from('assessments')
      .insert({
        player_id: input.player_id,
        coach_id: user.id,
        session_id: input.session_id || null,
        reaction_to_ball: input.reaction_to_ball,
        swing_size: input.swing_size,
        spacing_awareness: input.spacing_awareness,
        recovery_habit: input.recovery_habit,
        decision_making: input.decision_making,
        average_score: input.average_score,
        player_grade: input.player_grade,
        player_archetype: input.player_archetype,
        improvement_notes: input.improvement_notes || null,
        areas_to_focus: input.areas_to_focus || null,
        recommended_next_modules: input.recommended_next_modules || null,
      })
      .select()
      .single()

    if (error) return { error: error.message }

    // Update player_profiles with latest grade and archetype
    await supabase
      .from('player_profiles')
      .update({
        current_grade: input.player_grade,
        current_archetype: input.player_archetype,
      })
      .eq('player_id', input.player_id)

    revalidatePath('/coach/players')
    revalidatePath(`/coach/players/${input.player_id}`)
    revalidatePath('/player')
    revalidatePath('/player/progress')
    revalidatePath('/player/assessments')
    return { data }
  } catch {
    return { error: 'Failed to create assessment' }
  }
}

export async function getPlayerAssessments(playerId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        coach:profiles!assessments_coach_id_fkey(id, full_name, avatar_url),
        session:sessions(id, date, session_type)
      `)
      .eq('player_id', playerId)
      .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { data }
  } catch {
    return { error: 'Failed to fetch assessments' }
  }
}

export async function getSessionAssessments(sessionId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        player:profiles!assessments_player_id_fkey(id, full_name, avatar_url),
        coach:profiles!assessments_coach_id_fkey(id, full_name)
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { data }
  } catch {
    return { error: 'Failed to fetch session assessments' }
  }
}
