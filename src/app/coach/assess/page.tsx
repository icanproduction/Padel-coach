import { getAllPlayers } from '@/app/actions/player-actions'
import { getAllSessions } from '@/app/actions/session-actions'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AssessmentForm } from './assessment-form'

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

  // Fetch players for the dropdown
  const { data: players } = await getAllPlayers()

  // Fetch coach's sessions for optional session linkage
  const { data: sessions } = await getAllSessions({ coach_id: user.id })

  const playersList = (players ?? []).map((p: any) => ({
    id: p.id,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
  }))

  const sessionsList = (sessions ?? []).map((s: any) => ({
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

      <AssessmentForm
        players={playersList}
        sessions={sessionsList}
        preselectedPlayerId={sp.player}
        preselectedSessionId={sp.session}
      />
    </div>
  )
}
