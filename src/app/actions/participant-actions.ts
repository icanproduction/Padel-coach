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

    // Auto-promote first waitlisted player
    await promoteFirstWaitlistedPlayer(supabase, sessionId)

    revalidatePath(`/coach/sessions/${sessionId}`)
    revalidatePath(`/admin/sessions/${sessionId}`)
    revalidatePath('/player/sessions')
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

    // Check capacity — count approved + pending players
    const { count } = await supabase
      .from('session_players')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .in('status', ['pending', 'approved', 'attended'])

    // If session is full, waitlist instead of rejecting
    const isFull = count !== null && count >= session.max_players
    const insertStatus = isFull ? 'waitlisted' : 'pending'

    // Insert
    const { error } = await supabase
      .from('session_players')
      .insert({
        session_id: sessionId,
        player_id: user.id,
        status: insertStatus,
      })

    if (error) {
      if (error.code === '23505') return { error: 'You have already requested to join this session' }
      return { error: error.message }
    }

    revalidatePath('/player/sessions')
    revalidatePath(`/coach/sessions/${sessionId}`)
    return {
      data: {
        success: true,
        status: insertStatus,
        message: isFull
          ? 'Session penuh. Kamu masuk ke waiting list.'
          : 'Request berhasil dikirim!',
      },
    }
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

    // Send push notification to player when approved
    if (status === 'approved') {
      try {
        const { sendPushToUser } = await import('@/lib/push')
        await sendPushToUser(playerId, {
          title: 'Request Approved!',
          body: 'Kamu sudah di-approve untuk join session. See you there!',
          url: '/player/sessions',
        })
      } catch {
        // Push notification failure should not block status update
      }
    }

    // Auto-promote first waitlisted player when a player is rejected/removed
    if (status === 'rejected') {
      await promoteFirstWaitlistedPlayer(supabase, sessionId)
    }

    revalidatePath(`/coach/sessions/${sessionId}`)
    revalidatePath(`/admin/sessions/${sessionId}`)
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

export async function requestCancelSession(sessionId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Verify current status is approved or pending
    const { data: participant } = await supabase
      .from('session_players')
      .select('status')
      .eq('session_id', sessionId)
      .eq('player_id', user.id)
      .single()

    if (!participant) return { error: 'You are not in this session' }
    if (participant.status !== 'approved' && participant.status !== 'pending') {
      return { error: 'Cancel request hanya bisa untuk status approved atau pending' }
    }

    const { error } = await supabase
      .from('session_players')
      .update({ status: 'cancel_requested' })
      .eq('session_id', sessionId)
      .eq('player_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/player/sessions')
    revalidatePath(`/admin/sessions/${sessionId}`)
    revalidatePath(`/coach/sessions/${sessionId}`)
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to request cancellation' }
  }
}

export async function approveCancelRequest(sessionId: string, playerId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Verify admin/coach role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'coach' && profile.role !== 'admin')) {
      return { error: 'Unauthorized' }
    }

    // Delete the player from session
    const { error } = await supabase
      .from('session_players')
      .delete()
      .eq('session_id', sessionId)
      .eq('player_id', playerId)

    if (error) return { error: error.message }

    // Auto-promote first waitlisted player
    await promoteFirstWaitlistedPlayer(supabase, sessionId)

    revalidatePath(`/admin/sessions/${sessionId}`)
    revalidatePath(`/coach/sessions/${sessionId}`)
    revalidatePath('/player/sessions')
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to approve cancel request' }
  }
}

// Helper: promote the first waitlisted player (by joined_at) to approved
async function promoteFirstWaitlistedPlayer(supabase: any, sessionId: string) {
  try {
    const { data: waitlisted } = await supabase
      .from('session_players')
      .select('player_id')
      .eq('session_id', sessionId)
      .eq('status', 'waitlisted')
      .order('joined_at', { ascending: true })
      .limit(1)
      .single()

    if (!waitlisted) return

    await supabase
      .from('session_players')
      .update({ status: 'approved' })
      .eq('session_id', sessionId)
      .eq('player_id', waitlisted.player_id)

    // Send push notification to promoted player
    try {
      const { sendPushToUser } = await import('@/lib/push')
      await sendPushToUser(waitlisted.player_id, {
        title: 'Slot Available!',
        body: 'Ada slot kosong dan kamu otomatis di-approve dari waiting list. See you there!',
        url: '/player/sessions',
      })
    } catch {
      // Push notification failure should not block promotion
    }
  } catch {
    // No waitlisted players or error - silently continue
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
