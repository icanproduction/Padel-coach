'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAnnouncements() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') return { error: 'Admin only' }

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) return { error: error.message }
    return { data: data || [] }
  } catch {
    return { error: 'Failed to fetch announcements' }
  }
}

export async function createAnnouncement(title: string, message: string, targetRole: 'all' | 'player' | 'coach') {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') return { error: 'Admin only' }

    if (!title.trim() || !message.trim()) return { error: 'Title and message are required' }

    const { error } = await supabase
      .from('announcements')
      .insert({
        title: title.trim(),
        message: message.trim(),
        target_role: targetRole,
        created_by: user.id,
      })

    if (error) return { error: error.message }

    // Send push notifications to target role(s)
    try {
      const { sendPushToRole } = await import('@/lib/push')
      const payload = {
        title: `📢 ${title.trim()}`,
        body: message.trim().slice(0, 150),
        url: '/',
      }

      if (targetRole === 'all') {
        await Promise.allSettled([
          sendPushToRole('player', payload),
          sendPushToRole('coach', payload),
        ])
      } else {
        await sendPushToRole(targetRole, payload)
      }
    } catch {
      // Push notification failure should not block announcement creation
    }

    revalidatePath('/admin')
    revalidatePath('/admin/announcements')
    return { data: { success: true } }
  } catch {
    return { error: 'Failed to create announcement' }
  }
}
