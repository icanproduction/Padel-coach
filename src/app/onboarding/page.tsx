import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingForm } from './onboarding-form'

export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'player') redirect('/login')

  // Check if already onboarded
  const { data: playerProfile } = await supabase
    .from('player_profiles')
    .select('onboarding_completed')
    .eq('player_id', user.id)
    .single()

  if (playerProfile?.onboarding_completed) redirect('/player')

  return (
    <div className="min-h-screen bg-[#f7f8fc] py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome, {profile.full_name}!</h1>
          <p className="text-muted-foreground mt-2">
            Tell us about yourself so we can personalize your experience
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  )
}
