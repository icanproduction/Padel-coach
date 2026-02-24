import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import type { Profile } from '@/types/database'

export default async function PlayerLayout({
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

  if (!profile || profile.role !== 'player') redirect('/login')

  // Check onboarding
  const { data: playerProfile } = await supabase
    .from('player_profiles')
    .select('onboarding_completed')
    .eq('player_id', user.id)
    .single()

  if (playerProfile && !playerProfile.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <DashboardLayout user={profile as Profile} role="player">
      {children}
    </DashboardLayout>
  )
}
