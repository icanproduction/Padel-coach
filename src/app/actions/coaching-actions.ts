'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface DrillScoreModule {
  curriculum_id: string
  module_id: string
  drill_scores: Record<string, number>
  notes?: string
}

export async function saveCoachingScores(input: {
  session_id: string
  player_id: string
  modules: DrillScoreModule[]
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
      return { error: 'Only coaches can score sessions' }
    }

    for (const mod of input.modules) {
      // Calculate module_score = average of drill scores
      const scores = Object.values(mod.drill_scores)
      const moduleScore = scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : null

      const drillIds = Object.keys(mod.drill_scores)

      // Delete existing record for this player+session+module (allow re-scoring)
      await supabase
        .from('module_records')
        .delete()
        .eq('session_id', input.session_id)
        .eq('player_id', input.player_id)
        .eq('module_id', mod.module_id)

      // Insert new record
      const { error } = await supabase
        .from('module_records')
        .insert({
          session_id: input.session_id,
          player_id: input.player_id,
          coach_id: user.id,
          curriculum_id: mod.curriculum_id,
          module_id: mod.module_id,
          module_score: moduleScore,
          drills_completed: drillIds,
          drill_scores: mod.drill_scores,
          status: 'completed',
          notes: mod.notes || null,
        })

      if (error) return { error: error.message }
    }

    revalidatePath(`/coach/sessions/${input.session_id}`)
    revalidatePath(`/coach/players/${input.player_id}`)
    revalidatePath('/player/progress')
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to save coaching scores' }
  }
}

export async function getSessionModuleRecords(sessionId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
      .from('module_records')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at')

    if (error) return { error: error.message }
    return { data }
  } catch {
    return { error: 'Failed to fetch session module records' }
  }
}
