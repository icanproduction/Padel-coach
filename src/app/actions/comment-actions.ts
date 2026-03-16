'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSessionComments(sessionId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Check access: must be participant, session coach, or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    const isCoach = profile?.role === 'coach'

    if (!isAdmin) {
      if (isCoach) {
        // Coach can see comments for sessions they coach
        const { data: session } = await supabase
          .from('sessions')
          .select('coach_id')
          .eq('id', sessionId)
          .single()

        if (!session || session.coach_id !== user.id) {
          // Not the session coach, check if participant
          const { data: participation } = await supabase
            .from('session_players')
            .select('player_id')
            .eq('session_id', sessionId)
            .eq('player_id', user.id)
            .maybeSingle()

          if (!participation) return { error: 'Access denied' }
        }
      } else {
        // Player: must be participant
        const { data: participation } = await supabase
          .from('session_players')
          .select('player_id')
          .eq('session_id', sessionId)
          .eq('player_id', user.id)
          .maybeSingle()

        if (!participation) return { error: 'Access denied' }
      }
    }

    const { data, error } = await supabase
      .from('session_comments')
      .select(`
        *,
        author:profiles!session_comments_author_id_fkey(id, full_name, avatar_url, role)
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) return { error: error.message }
    return { data: data || [] }
  } catch {
    return { error: 'Failed to fetch comments' }
  }
}

export async function addSessionComment(sessionId: string, message: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    if (!message.trim()) return { error: 'Message cannot be empty' }

    // Check access: must be participant, session coach, or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'

    if (!isAdmin) {
      const isCoach = profile?.role === 'coach'

      if (isCoach) {
        const { data: session } = await supabase
          .from('sessions')
          .select('coach_id')
          .eq('id', sessionId)
          .single()

        if (!session || session.coach_id !== user.id) {
          const { data: participation } = await supabase
            .from('session_players')
            .select('player_id')
            .eq('session_id', sessionId)
            .eq('player_id', user.id)
            .maybeSingle()

          if (!participation) return { error: 'Access denied' }
        }
      } else {
        const { data: participation } = await supabase
          .from('session_players')
          .select('player_id')
          .eq('session_id', sessionId)
          .eq('player_id', user.id)
          .maybeSingle()

        if (!participation) return { error: 'Access denied' }
      }
    }

    const { error } = await supabase
      .from('session_comments')
      .insert({
        session_id: sessionId,
        author_id: user.id,
        message: message.trim(),
      })

    if (error) return { error: error.message }

    revalidatePath(`/coach/sessions/${sessionId}`)
    revalidatePath(`/player/sessions/${sessionId}`)
    revalidatePath(`/admin/sessions/${sessionId}`)
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to add comment' }
  }
}

export async function deleteSessionComment(commentId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Only allow deleting own comments
    const { data: comment } = await supabase
      .from('session_comments')
      .select('session_id')
      .eq('id', commentId)
      .eq('author_id', user.id)
      .single()

    if (!comment) return { error: 'Comment not found or not yours' }

    const { error } = await supabase
      .from('session_comments')
      .delete()
      .eq('id', commentId)
      .eq('author_id', user.id)

    if (error) return { error: error.message }

    revalidatePath(`/coach/sessions/${comment.session_id}`)
    revalidatePath(`/player/sessions/${comment.session_id}`)
    revalidatePath(`/admin/sessions/${comment.session_id}`)
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to delete comment' }
  }
}
