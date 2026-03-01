'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPlayerNotes(playerId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
      .from('coach_notes')
      .select('*, coach:profiles!coach_notes_coach_id_fkey(full_name)')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { data }
  } catch {
    return { error: 'Failed to fetch notes' }
  }
}

export async function addPlayerNote(playerId: string, note: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'coach') {
      return { error: 'Only coaches can add notes' }
    }

    const { error } = await supabase
      .from('coach_notes')
      .insert({
        player_id: playerId,
        coach_id: user.id,
        note: note.trim(),
      })

    if (error) return { error: error.message }

    revalidatePath(`/coach/players/${playerId}`)
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to add note' }
  }
}

export async function deletePlayerNote(noteId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Only allow deleting own notes
    const { error } = await supabase
      .from('coach_notes')
      .delete()
      .eq('id', noteId)
      .eq('coach_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/coach/players')
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to delete note' }
  }
}
