'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getBadges() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  return { data: data ?? [] }
}

export async function createBadge(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return { error: 'Admin only' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const imageFile = formData.get('image') as File

  if (!name?.trim()) return { error: 'Nama badge wajib diisi' }

  let imageUrl: string | null = null

  // Upload image if provided
  if (imageFile && imageFile.size > 0) {
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(imageFile.type)) {
      return { error: 'Format gambar harus PNG, JPG, WebP, atau SVG' }
    }
    if (imageFile.size > 2 * 1024 * 1024) {
      return { error: 'Ukuran gambar maksimal 2MB' }
    }

    const ext = imageFile.name.split('.').pop()
    const fileName = `badges/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('app-assets')
      .upload(fileName, imageFile, { upsert: true })

    if (uploadError) return { error: uploadError.message }

    const { data: urlData } = supabase.storage
      .from('app-assets')
      .getPublicUrl(fileName)

    imageUrl = urlData.publicUrl
  }

  const { error } = await supabase
    .from('badges')
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      image_url: imageUrl,
      created_by: user.id,
    })

  if (error) return { error: error.message }

  revalidatePath('/admin/badges')
  return { success: true }
}

export async function deleteBadge(badgeId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return { error: 'Admin only' }

  // Delete player_badges first
  await supabase.from('player_badges').delete().eq('badge_id', badgeId)

  const { error } = await supabase.from('badges').delete().eq('id', badgeId)
  if (error) return { error: error.message }

  revalidatePath('/admin/badges')
  return { success: true }
}

export async function giveBadgeToPlayer(badgeId: string, playerId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return { error: 'Admin only' }

  const { error } = await supabase
    .from('player_badges')
    .upsert(
      { player_id: playerId, badge_id: badgeId, given_by: user.id },
      { onConflict: 'player_id,badge_id' }
    )

  if (error) return { error: error.message }

  // Get badge name for notification
  const { data: badge } = await supabase
    .from('badges')
    .select('name')
    .eq('id', badgeId)
    .single()

  // Send push notification
  try {
    const { sendPushToUser } = await import('@/lib/push')
    await sendPushToUser(playerId, {
      title: 'Badge Baru! 🏆',
      body: `Kamu mendapat badge "${badge?.name || 'Achievement'}"!`,
      url: '/player',
    })
  } catch {
    // Push failure should not block
  }

  revalidatePath('/admin/badges')
  revalidatePath(`/player`)
  revalidatePath(`/profile`)
  return { success: true }
}

export async function removeBadgeFromPlayer(badgeId: string, playerId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return { error: 'Admin only' }

  const { error } = await supabase
    .from('player_badges')
    .delete()
    .eq('badge_id', badgeId)
    .eq('player_id', playerId)

  if (error) return { error: error.message }

  revalidatePath('/admin/badges')
  return { success: true }
}

export async function getPlayerBadges(playerId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('player_badges')
    .select('*, badge:badges(*)')
    .eq('player_id', playerId)
    .order('given_at', { ascending: false })

  if (error) return { data: [] }
  return { data: data ?? [] }
}
