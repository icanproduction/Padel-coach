'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(input: {
  full_name: string
  phone?: string | null
  date_of_birth?: string | null
}): Promise<{ data?: { success: boolean }; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: input.full_name,
        phone: input.phone || null,
        date_of_birth: input.date_of_birth || null,
      })
      .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/profile')
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to update profile' }
  }
}

export async function updateUsername(
  newUsername: string
): Promise<{ data?: { success: boolean }; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const username = newUsername.toLowerCase().trim()

    if (!username || username.includes('@') || username.includes(' ')) {
      return { error: 'Username tidak valid' }
    }

    // Check uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', user.id)
      .single()

    if (existing) return { error: 'Username sudah dipakai' }

    // Update profiles table only (no longer syncing email)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', user.id)

    if (profileError) return { error: profileError.message }

    revalidatePath('/profile')
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to update username' }
  }
}
