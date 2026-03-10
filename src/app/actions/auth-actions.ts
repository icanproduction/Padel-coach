'use server'

import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { Profile } from '@/types/database'

const EMAIL_DOMAIN = 'padel.app'

export async function loginUser(input: {
  username: string
  password: string
}): Promise<{ data?: { role: string; isApproved: boolean }; error?: string }> {
  try {
    const username = input.username.toLowerCase().trim()
    const email = `${username}@${EMAIL_DOMAIN}`

    const supabase = await createServerSupabaseClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: input.password,
    })

    if (signInError) {
      if (signInError.message.includes('Invalid login')) {
        return { error: 'Username atau password salah' }
      }
      return { error: signInError.message }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_approved')
      .eq('id', data.user.id)
      .single()

    if (!profile) return { error: 'Profile tidak ditemukan' }

    return { data: { role: profile.role, isApproved: profile.is_approved ?? true } }
  } catch {
    return { error: 'Gagal login' }
  }
}

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
    const username = input.username.toLowerCase().trim()

    // Check username uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (existing) return { error: 'Username sudah dipakai' }

    const email = `${username}@${EMAIL_DOMAIN}`

    // Use service role client to bypass email validation & rate limits
    const adminClient = createServiceRoleClient()
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.full_name,
        role: input.role,
        phone: input.phone || null,
        username,
      },
    })

    if (authError) return { error: authError.message }
    if (!authData.user) return { error: 'Registration failed' }

    return { data: { userId: authData.user.id } }
  } catch {
    return { error: 'Registration failed' }
  }
}
