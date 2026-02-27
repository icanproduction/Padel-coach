'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { RecordModuleInput } from '@/types/database'

export async function recordModuleCompletion(input: RecordModuleInput) {
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
      return { error: 'Only coaches can record module completions' }
    }

    // Check if there's an existing in_progress record for this player+module
    const { data: existing } = await supabase
      .from('module_records')
      .select('id')
      .eq('player_id', input.player_id)
      .eq('curriculum_id', input.curriculum_id)
      .eq('module_id', input.module_id)
      .eq('status', 'in_progress')
      .single()

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('module_records')
        .update({
          module_score: input.module_score || null,
          drills_completed: input.drills_completed || null,
          status: input.status,
          notes: input.notes || null,
          session_id: input.session_id || null,
          assessment_id: input.assessment_id || null,
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) return { error: error.message }
      revalidatePath(`/coach/players/${input.player_id}`)
      revalidatePath('/player/progress')
      return { data }
    }

    // Insert new
    const { data, error } = await supabase
      .from('module_records')
      .insert({
        player_id: input.player_id,
        coach_id: user.id,
        session_id: input.session_id || null,
        assessment_id: input.assessment_id || null,
        curriculum_id: input.curriculum_id,
        module_id: input.module_id,
        module_score: input.module_score || null,
        drills_completed: input.drills_completed || null,
        status: input.status,
        notes: input.notes || null,
      })
      .select()
      .single()

    if (error) return { error: error.message }

    revalidatePath(`/coach/players/${input.player_id}`)
    revalidatePath('/player/progress')
    return { data }
  } catch {
    return { error: 'Failed to record module completion' }
  }
}

export async function getPlayerModuleProgress(playerId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
      .from('module_records')
      .select(`
        *,
        coach:profiles!module_records_coach_id_fkey(id, full_name),
        session:sessions(id, date, session_type, status)
      `)
      .eq('player_id', playerId)
      .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { data }
  } catch {
    return { error: 'Failed to fetch module progress' }
  }
}
