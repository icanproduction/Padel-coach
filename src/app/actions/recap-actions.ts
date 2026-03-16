'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSessionRecap(sessionId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        coach:profiles!sessions_coach_id_fkey(id, full_name, avatar_url),
        locations(id, name, address, maps_link)
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) return { error: 'Session not found' }

    // Get player's participation record (includes coach_feedback)
    const { data: participation } = await supabase
      .from('session_players')
      .select('*')
      .eq('session_id', sessionId)
      .eq('player_id', user.id)
      .single()

    // Get profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Access check: must be participant, coach, or admin
    const isParticipant = !!participation
    const isCoach = profile?.role === 'coach' || profile?.role === 'admin'
    const isSessionCoach = session.coach_id === user.id

    if (!isParticipant && !isCoach) {
      return { error: 'You are not part of this session' }
    }

    // Get assessments for this player in this session (discovery)
    const { data: assessment } = await supabase
      .from('assessments')
      .select(`
        *,
        coach:profiles!assessments_coach_id_fkey(id, full_name)
      `)
      .eq('session_id', sessionId)
      .eq('player_id', user.id)
      .maybeSingle()

    // Get module records for this player in this session (coaching_drilling)
    const { data: moduleRecords } = await supabase
      .from('module_records')
      .select('*')
      .eq('session_id', sessionId)
      .eq('player_id', user.id)
      .order('created_at')

    return {
      data: {
        session,
        participation,
        assessment,
        moduleRecords: moduleRecords || [],
        isCoach,
        isSessionCoach,
      },
    }
  } catch {
    return { error: 'Failed to fetch session recap' }
  }
}

export async function saveCoachFeedback(
  sessionId: string,
  playerId: string,
  feedback: string
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Only coaches and admins can write feedback
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'coach' && profile.role !== 'admin')) {
      return { error: 'Only coaches can write feedback' }
    }

    const { error } = await supabase
      .from('session_players')
      .update({ coach_feedback: feedback.trim() || null })
      .eq('session_id', sessionId)
      .eq('player_id', playerId)

    if (error) return { error: error.message }

    revalidatePath(`/coach/sessions/${sessionId}`)
    revalidatePath(`/player/sessions/${sessionId}`)
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to save feedback' }
  }
}
