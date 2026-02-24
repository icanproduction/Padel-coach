'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { OnboardingInput } from '@/types/database'

export async function getAllPlayers() {
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
      return { error: 'Unauthorized' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        player_profiles(*)
      `)
      .eq('role', 'player')
      .order('full_name')

    if (error) return { error: error.message }
    return { data }
  } catch {
    return { error: 'Failed to fetch players' }
  }
}

export async function getPlayerById(playerId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        player_profiles(*)
      `)
      .eq('id', playerId)
      .eq('role', 'player')
      .single()

    if (error) return { error: error.message }
    return { data }
  } catch {
    return { error: 'Failed to fetch player' }
  }
}

export async function getPlayerProgress(playerId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Get all assessments for progress charts
    const { data: assessments, error: assessError } = await supabase
      .from('assessments')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: true })

    if (assessError) return { error: assessError.message }

    // Get module records for curriculum progress
    const { data: moduleRecords, error: moduleError } = await supabase
      .from('module_records')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false })

    if (moduleError) return { error: moduleError.message }

    return { data: { assessments: assessments || [], moduleRecords: moduleRecords || [] } }
  } catch {
    return { error: 'Failed to fetch player progress' }
  }
}

export async function completeOnboarding(input: OnboardingInput) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
      .from('player_profiles')
      .update({
        experience_level: input.experience_level,
        previous_racket_sport: input.previous_racket_sport || null,
        primary_goal: input.primary_goal,
        fears_concerns: input.fears_concerns || null,
        playing_frequency_goal: input.playing_frequency_goal,
        onboarding_completed: true,
      })
      .eq('player_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/player')
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to complete onboarding' }
  }
}

export async function getAllCoaches() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'coach')
      .order('full_name')

    if (error) return { error: error.message }
    return { data }
  } catch {
    return { error: 'Failed to fetch coaches' }
  }
}
