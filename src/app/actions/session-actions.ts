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
        price_per_pax: input.price_per_pax || null,
        notes: input.notes || null,
      })
      .select()
      .single()

    if (error) return { error: error.message }

    // Send push notification to all players about new session
    try {
      const { sendPushToRole } = await import('@/lib/push')
      const sessionDate = new Date(input.date).toLocaleDateString('id-ID', {
        weekday: 'short', day: 'numeric', month: 'short',
      })
      await sendPushToRole('player', {
        title: 'Session Baru!',
        body: `Ada session baru tanggal ${sessionDate}. Yuk join!`,
        url: '/player/sessions',
      })
    } catch {
      // Push notification failure should not block session creation
    }

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

    // When session starts, auto-mark all approved players as attended
    if (status === 'in_progress') {
      // Get all approved players
      const { data: approvedPlayers } = await supabase
        .from('session_players')
        .select('player_id')
        .eq('session_id', sessionId)
        .eq('status', 'approved')

      if (approvedPlayers && approvedPlayers.length > 0) {
        // Mark all as attended
        await supabase
          .from('session_players')
          .update({ status: 'attended' })
          .eq('session_id', sessionId)
          .eq('status', 'approved')

        // Increment total_sessions for each player
        for (const p of approvedPlayers) {
          const { data: playerProfile } = await supabase
            .from('player_profiles')
            .select('total_sessions')
            .eq('player_id', p.player_id)
            .single()

          if (playerProfile) {
            await supabase
              .from('player_profiles')
              .update({ total_sessions: (playerProfile.total_sessions || 0) + 1 })
              .eq('player_id', p.player_id)
          }
        }
      }
    }

    revalidatePath('/admin/sessions')
    revalidatePath('/coach/sessions')
    revalidatePath(`/coach/sessions/${sessionId}`)
    revalidatePath('/player/sessions')
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

export async function deleteSession(sessionId: string) {
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
      return { error: 'Only admin or coach can delete sessions' }
    }

    // Delete session players first
    await supabase
      .from('session_players')
      .delete()
      .eq('session_id', sessionId)

    // Delete session comments
    await supabase
      .from('session_comments')
      .delete()
      .eq('session_id', sessionId)

    // Delete the session
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)

    if (error) return { error: error.message }

    revalidatePath('/admin/sessions')
    revalidatePath('/coach/sessions')
    revalidatePath('/player/sessions')
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to delete session' }
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
          coach_feedback,
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
