'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CreateSessionInput, Session, SessionStatus } from '@/types/database'

export async function createSession(input: CreateSessionInput) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'coach')) {
      return { error: 'Only admin or coach can create sessions' }
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        date: input.date,
        created_by: user.id,
        coach_id: input.coach_id,
        session_type: input.session_type,
        max_players: input.max_players,
        location_id: input.location_id || null,
        courts_booked: input.session_type === 'open_play' ? null : (input.courts_booked || 1),
        duration_hours: input.duration_hours || 1.0,
        reclub_url: input.reclub_url || null,
        notes: input.notes || null,
      })
      .select()
      .single()

    if (error) return { error: error.message }

    revalidatePath('/admin/sessions')
    revalidatePath('/coach/sessions')
    revalidatePath('/player/sessions')
    return { data }
  } catch {
    return { error: 'Failed to create session' }
  }
}

export async function updateSessionStatus(sessionId: string, status: SessionStatus) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
      .from('sessions')
      .update({ status })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) return { error: error.message }

    revalidatePath('/admin/sessions')
    revalidatePath('/coach/sessions')
    revalidatePath(`/coach/sessions/${sessionId}`)
    return { data }
  } catch {
    return { error: 'Failed to update session' }
  }
}

export async function getAllSessions(filters?: { status?: SessionStatus; coach_id?: string }) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    let query = supabase
      .from('sessions')
      .select(`
        *,
        coach:profiles!sessions_coach_id_fkey(id, full_name, email, avatar_url),
        session_players(player_id, status),
        locations(id, name, address, maps_link, courts)
      `)
      .order('date', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.coach_id) {
      query = query.eq('coach_id', filters.coach_id)
    }

    const { data, error } = await query

    if (error) return { error: error.message }
    return { data }
  } catch {
    return { error: 'Failed to fetch sessions' }
  }
}

export async function saveSessionModules(sessionId: string, moduleIds: string[]) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'coach')) {
      return { error: 'Only coaches can select modules' }
    }

    const { error } = await supabase
      .from('sessions')
      .update({ selected_modules: moduleIds })
      .eq('id', sessionId)

    if (error) return { error: error.message }

    revalidatePath(`/coach/sessions/${sessionId}`)
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to save session modules' }
  }
}

export async function getSessionById(sessionId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        coach:profiles!sessions_coach_id_fkey(id, full_name, email, avatar_url, role),
        session_players(
          player_id,
          status,
          joined_at,
          profiles:profiles!session_players_player_id_fkey(id, full_name, email, avatar_url)
        ),
        locations(id, name, address, maps_link, courts)
      `)
      .eq('id', sessionId)
      .single()

    if (error) return { error: error.message }
    return { data }
  } catch {
    return { error: 'Failed to fetch session' }
  }
}
