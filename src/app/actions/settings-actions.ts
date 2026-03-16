'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAppSettings() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')

  if (error) return { error: error.message }

  const settings: Record<string, string | null> = {}
  data?.forEach((row: { key: string; value: string | null }) => {
    settings[row.key] = row.value
  })

  return { data: settings }
}

export async function updateAppSetting(key: string, value: string | null) {
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
    .from('app_settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)

  if (error) return { error: error.message }

  revalidatePath('/admin/settings')
  revalidatePath('/')
  return { success: true }
}

export async function uploadLogo(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return { error: 'Admin only' }

  const file = formData.get('logo') as File
  if (!file || file.size === 0) return { error: 'No file provided' }

  // Validate file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'File harus berupa PNG, JPG, WebP, atau SVG' }
  }

  // Max 2MB
  if (file.size > 2 * 1024 * 1024) {
    return { error: 'Ukuran file maksimal 2MB' }
  }

  const ext = file.name.split('.').pop()
  const fileName = `logo.${ext}`

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('app-assets')
    .upload(fileName, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('app-assets')
    .getPublicUrl(fileName)

  // Save URL to settings
  const { error: updateError } = await supabase
    .from('app_settings')
    .update({ value: urlData.publicUrl, updated_at: new Date().toISOString() })
    .eq('key', 'logo_url')

  if (updateError) return { error: updateError.message }

  revalidatePath('/admin/settings')
  revalidatePath('/')
  return { data: urlData.publicUrl }
}

export async function uploadPwaIcon(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return { error: 'Admin only' }

  const file = formData.get('pwa_icon') as File
  if (!file || file.size === 0) return { error: 'No file provided' }

  if (!['image/png'].includes(file.type)) {
    return { error: 'PWA icon harus berupa file PNG' }
  }

  if (file.size > 2 * 1024 * 1024) {
    return { error: 'Ukuran file maksimal 2MB' }
  }

  // Upload as pwa-icon.png
  const { error: uploadError } = await supabase.storage
    .from('app-assets')
    .upload('pwa-icon.png', file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: urlData } = supabase.storage
    .from('app-assets')
    .getPublicUrl('pwa-icon.png')

  // Save URL to settings
  const { error: upsertError } = await supabase
    .from('app_settings')
    .upsert(
      { key: 'pwa_icon_url', value: urlData.publicUrl, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )

  if (upsertError) return { error: upsertError.message }

  revalidatePath('/admin/settings')
  revalidatePath('/manifest.json')
  return { data: urlData.publicUrl }
}

export async function removeLogo() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return { error: 'Admin only' }

  // Remove from storage (try common extensions)
  for (const ext of ['png', 'jpg', 'jpeg', 'webp', 'svg']) {
    await supabase.storage.from('app-assets').remove([`logo.${ext}`])
  }

  // Clear URL in settings
  const { error } = await supabase
    .from('app_settings')
    .update({ value: null, updated_at: new Date().toISOString() })
    .eq('key', 'logo_url')

  if (error) return { error: error.message }

  revalidatePath('/admin/settings')
  revalidatePath('/')
  return { success: true }
}
