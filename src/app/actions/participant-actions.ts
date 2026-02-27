'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ParticipantStatus } from '@/types/database'

export async function addPlayerToSession(sessionId: string, playerId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Verify coach/admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'coach' && profile.role !== 'admin')) {
      return { error: 'Unauthorized' }
    }

    // Insert with approved status (coach adds directly)
    const { error } = await supabase
      .from('session_players')
      .insert({
        session_id: sessionId,
        player_id: playerId,
        status: 'approved',
      })

    if (error) {
      if (error.code === '23505') return { error: 'Player sudah ada di session ini' }
      return { error: error.message }
    }

    revalidatePath(`/coach/sessions/${sessionId}`)
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to add player' }
  }
}

export async function removePlayerFromSession(sessionId: string, playerId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
      .from('session_players')
      .delete()
      .eq('session_id', sessionId)
      .eq('player_id', playerId)

    if (error) return { error: error.message }

    revalidatePath(`/coach/sessions/${sessionId}`)
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to remove player' }
  }
}

export async function joinSession(sessionId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Verify player role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'player') {
      return { error: 'Only players can join sessions' }
    }

    // Check session exists and is scheduled
    const { data: session } = await supabase
      .from('sessions')
      .select('id, status, max_players')
      .eq('id', sessionId)
      .single()

    if (!session) return { error: 'Session not found' }
    if (session.status !== 'scheduled') return { error: 'Session is not open for joining' }

    // Check capacity
    const { count } = await supabase
      .from('session_players')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .in('status', ['pending', 'approved', 'attended'])

    if (count !== null && count >= session.max_players) {
      return { error: 'Session is full' }
    }

    // Insert
    const { error } = await supabase
      .from('session_players')
      .insert({
        session_id: sessionId,
        player_id: user.id,
        status: 'pending',
      })

    if (error) {
      if (error.code === '23505') return { error: 'You have already requested to join this session' }
      return { error: error.message }
    }

    revalidatePath('/player/sessions')
    revalidatePath(`/coach/sessions/${sessionId}`)
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to join session' }
  }
}

export async function updateParticipantStatus(
  sessionId: string,
  playerId: string,
  status: ParticipantStatus
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
      .from('session_players')
      .update({ status })
      .eq('session_id', sessionId)
      .eq('player_id', playerId)

    if (error) return { error: error.message }

    // If attended, increment player total_sessions
    if (status === 'attended') {
      const { data: playerProfile } = await supabase
        .from('player_profiles')
        .select('total_sessions')
        .eq('player_id', playerId)
        .single()

      if (playerProfile) {
        await supabase
          .from('player_profiles')
          .update({ total_sessions: (playerProfile.total_sessions || 0) + 1 })
          .eq('player_id', playerId)
      }
    }

    revalidatePath(`/coach/sessions/${sessionId}`)
    revalidatePath('/player/sessions')
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to update participant status' }
  }
}

export async function getSessionPlayers(sessionId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
      .from('session_players')
      .select(`
        *,
        profiles:profiles!session_players_player_id_fkey(
          id, full_name, email, avatar_url
        )
      `)
      .eq('session_id', sessionId)
      .order('joined_at')

    if (error) return { error: error.message }
    return { data }
  } catch {
    return { error: 'Failed to fetch session players' }
  }
}

export async function getPlayerSessions(playerId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
      .from('session_players')
      .select(`
        *,
        session:sessions(
          *,
          coach:profiles!sessions_coach_id_fkey(id, full_name, avatar_url)
        )
      `)
      .eq('player_id', playerId)
      .order('joined_at', { ascending: false })

    if (error) return { error: error.message }
    return { data }
  } catch {
    return { error: 'Failed to fetch player sessions' }
  }
}
