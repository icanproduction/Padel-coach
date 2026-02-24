'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { Profile } from '@/types/database'

export async function logout() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getCurrentUser(): Promise<{
  data?: { userId: string; profile: Profile }
  error?: string
}> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !profile) return { error: 'Profile not found' }

    return { data: { userId: user.id, profile: profile as Profile } }
  } catch {
    return { error: 'Failed to get current user' }
  }
}

export async function registerUser(input: {
  email: string
  password: string
  full_name: string
  role: 'coach' | 'player'
  phone?: string
}): Promise<{ data?: { userId: string }; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
    })

    if (authError) return { error: authError.message }
    if (!authData.user) return { error: 'Registration failed' }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: input.full_name,
        email: input.email,
        phone: input.phone || null,
        role: input.role,
      })

    if (profileError) return { error: profileError.message }

    // If player, create player_profiles record
    if (input.role === 'player') {
      await supabase
        .from('player_profiles')
        .insert({ player_id: authData.user.id })
    }

    return { data: { userId: authData.user.id } }
  } catch {
    return { error: 'Registration failed' }
  }
}
