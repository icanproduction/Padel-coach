'use server'

import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { OnboardingInput, Gender } from '@/types/database'

export async function createPlayer(input: {
  full_name: string
  email: string
  phone?: string
  gender: Gender
}): Promise<{ data?: { userId: string }; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Check role: only coach or admin can create players
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'coach')) {
      return { error: 'Unauthorized' }
    }

    const email = input.email.toLowerCase().trim()

    // Create user via service role client (bypasses email confirmation)
    const adminClient = createServiceRoleClient()
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: '123456',
      email_confirm: true,
      user_metadata: {
        full_name: input.full_name,
        role: 'player',
        phone: input.phone || null,
      },
    })

    if (authError) return { error: authError.message }
    if (!authData.user) return { error: 'Failed to create player' }

    // Set gender on player_profiles (created by trigger)
    await supabase
      .from('player_profiles')
      .update({ gender: input.gender })
      .eq('player_id', authData.user.id)

    revalidatePath('/coach/players')
    return { data: { userId: authData.user.id } }
  } catch {
    return { error: 'Failed to create player' }
  }
}

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
        gender: input.gender,
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

export async function createCoach(input: {
  full_name: string
  email: string
  phone?: string
}): Promise<{ data?: { userId: string }; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return { error: 'Only admin can create coaches' }
    }

    const email = input.email.toLowerCase().trim()

    const adminClient = createServiceRoleClient()
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: '123456',
      email_confirm: true,
      user_metadata: {
        full_name: input.full_name,
        role: 'coach',
        phone: input.phone || null,
      },
    })

    if (authError) return { error: authError.message }
    if (!authData.user) return { error: 'Failed to create coach' }

    // Admin-created coaches are auto-approved
    await supabase
      .from('profiles')
      .update({ is_approved: true })
      .eq('id', authData.user.id)

    revalidatePath('/admin/coaches')
    return { data: { userId: authData.user.id } }
  } catch {
    return { error: 'Failed to create coach' }
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

export async function approveCoach(coachId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return { error: 'Only admin can approve coaches' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true })
      .eq('id', coachId)
      .eq('role', 'coach')

    if (error) return { error: error.message }

    revalidatePath('/admin/coaches')
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to approve coach' }
  }
}

export async function unapproveCoach(coachId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return { error: 'Only admin can manage coaches' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: false })
      .eq('id', coachId)
      .eq('role', 'coach')

    if (error) return { error: error.message }

    revalidatePath('/admin/coaches')
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to unapprove coach' }
  }
}

export async function updateCoach(coachId: string, input: {
  full_name: string
  email: string
  phone?: string
}): Promise<{ data?: { success: boolean }; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return { error: 'Only admin can edit coaches' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: input.full_name.trim(),
        email: input.email.toLowerCase().trim(),
        phone: input.phone || null,
      })
      .eq('id', coachId)
      .eq('role', 'coach')

    if (error) return { error: error.message }

    revalidatePath('/admin/coaches')
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to update coach' }
  }
}

export async function deleteCoach(coachId: string): Promise<{ data?: { success: boolean }; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return { error: 'Only admin can delete coaches' }
    }

    // Clear foreign key references in sessions
    const adminClient = createServiceRoleClient()
    await adminClient
      .from('sessions')
      .update({ created_by: null })
      .eq('created_by', coachId)
    await adminClient
      .from('sessions')
      .update({ coach_id: user.id })
      .eq('coach_id', coachId)

    // Delete related records
    await adminClient.from('session_players').delete().eq('player_id', coachId)
    await adminClient.from('session_comments').delete().eq('author_id', coachId)
    await adminClient.from('assessments').delete().eq('coach_id', coachId)
    await adminClient.from('push_subscriptions').delete().eq('user_id', coachId)
    await adminClient.from('notifications').delete().eq('user_id', coachId)

    // Delete from profiles table
    const { error } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', coachId)
      .eq('role', 'coach')

    if (error) return { error: error.message }

    // Delete from auth.users
    try {
      await adminClient.auth.admin.deleteUser(coachId)
    } catch {
      // Auth user deletion failure should not block
    }

    revalidatePath('/admin/coaches')
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to delete coach' }
  }
}
