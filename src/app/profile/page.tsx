import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from './profile-form'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Get player profile if player
  let playerProfile = null
  if (profile.role === 'player') {
    const { data } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('player_id', user.id)
      .single()
    playerProfile = data
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 h-14 bg-card border-b border-border flex items-center px-4">
        <button
          onClick={undefined}
          className="text-sm text-muted-foreground"
        >
        </button>
        <h1 className="text-base font-semibold flex-1 text-center">My Profile</h1>
        <div className="w-8" />
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        <ProfileForm profile={profile} playerProfile={playerProfile} />
      </main>
    </div>
  )
}
