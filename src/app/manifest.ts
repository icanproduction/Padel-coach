import type { MetadataRoute } from 'next'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const supabase = createServiceRoleClient()

  const { data: settings } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['app_name', 'pwa_icon_url'])

  const appName = settings?.find((s: { key: string }) => s.key === 'app_name')?.value || 'Loop Padel Club'
  const pwaIconUrl = settings?.find((s: { key: string }) => s.key === 'pwa_icon_url')?.value || null

  const icons: MetadataRoute.Manifest['icons'] = pwaIconUrl
    ? [
        { src: pwaIconUrl, sizes: '192x192', type: 'image/png' },
        { src: pwaIconUrl, sizes: '512x512', type: 'image/png' },
      ]
    : [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ]

  return {
    name: appName,
    short_name: appName.length > 12 ? appName.slice(0, 12) : appName,
    description: 'Player Development System - Diagnostic, Prescription & Progress Tracking',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#00d69d',
    orientation: 'portrait',
    icons,
  }
}
