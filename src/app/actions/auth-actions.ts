'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { Profile } from '@/types/database'

const EMAIL_DOMAIN = 'padel.local'

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
  username: string
  password: string
  full_name: string
  role: 'coach' | 'player'
  phone?: string
}): Promise<{ data?: { userId: string }; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    // Check username uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', input.username.toLowerCase())
      .single()

    if (existing) return { error: 'Username sudah dipakai' }

    const email = `${input.username.toLowerCase()}@${EMAIL_DOMAIN}`

    // Pass metadata - the database trigger (handle_new_user) will
    // auto-create profiles and player_profiles rows
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        data: {
          full_name: input.full_name,
          role: input.role,
          phone: input.phone || null,
          username: input.username.toLowerCase(),
        },
      },
    })

    if (authError) return { error: authError.message }
    if (!authData.user) return { error: 'Registration failed' }

    return { data: { userId: authData.user.id } }
  } catch {
    return { error: 'Registration failed' }
  }
}
