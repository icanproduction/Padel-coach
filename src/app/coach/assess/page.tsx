import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AssessmentForm } from './assessment-form'

export const dynamic = 'force-dynamic'

interface AssessPageProps {
  searchParams: Promise<{ player?: string; session?: string }>
}

export default async function AssessPage({ searchParams }: AssessPageProps) {
  const sp = await searchParams
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all players directly (coach layout already verified role)
  const { data: players, error: playersError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('role', 'player')
    .order('full_name')

  // Fetch coach's sessions
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, date, session_type, status')
    .eq('coach_id', user.id)
    .order('date', { ascending: false })

  const playersList = (players ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
  }))

  const sessionsList = (sessions ?? []).map((s) => ({
    id: s.id,
    date: s.date,
    session_type: s.session_type,
    status: s.status,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Assessment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Assess a player across 5 key padel parameters
        </p>
      </div>

      {playersError && (
        <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm">
          Error loading players: {playersError.message}
        </div>
      )}

      {playersList.length === 0 && !playersError && (
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No players registered yet. Players need to register and complete onboarding first.
          </p>
        </div>
      )}

      <AssessmentForm
        players={playersList}
        sessions={sessionsList}
        preselectedPlayerId={sp.player}
        preselectedSessionId={sp.session}
      />
    </div>
  )
}
