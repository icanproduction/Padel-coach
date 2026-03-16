import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { QueryProvider } from '@/components/providers/query-provider'
import { createServiceRoleClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Loop Padel Club',
  description: 'Player development system - Diagnostic, Prescription & Progress tracking for padel coaching',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Loop Padel Club',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#00d69d',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Fetch PWA icon URL from settings
  const supabase = createServiceRoleClient()
  const { data: iconSetting } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'pwa_icon_url')
    .single()

  const pwaIconUrl = iconSetting?.value || '/icons/icon-192.png'

  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href={pwaIconUrl} />
        <link rel="apple-touch-icon" sizes="180x180" href={pwaIconUrl} />
        <link rel="apple-touch-icon" sizes="152x152" href={pwaIconUrl} />
        <link rel="apple-touch-icon" sizes="120x120" href={pwaIconUrl} />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  )
}
