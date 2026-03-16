import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import type { Profile } from '@/types/database'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/login')

  // Fetch app logo
  const { data: logoSetting } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'logo_url')
    .single()

  return (
    <DashboardLayout user={profile as Profile} role="admin" logoUrl={logoSetting?.value ?? null}>
      {children}
    </DashboardLayout>
  )
}
