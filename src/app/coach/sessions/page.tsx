import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CoachCreateSessionForm } from './create-session-form'
import { SessionsView } from './sessions-view'
import type { Location } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function CoachSessionsPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch sessions and locations in parallel
  const [sessionsResult, locationsResult] = await Promise.all([
    supabase
      .from('sessions')
      .select(`
        *,
        coach:profiles!sessions_coach_id_fkey(id, full_name, email, avatar_url),
        session_players(player_id, status),
        locations(id, name, address, maps_link, courts)
      `)
      .eq('coach_id', user.id)
      .order('date', { ascending: false }),
    supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .order('name'),
  ])

  const sessions = (sessionsResult.data ?? []) as any[]
  const error = sessionsResult.error
  const locations = (locationsResult.data as Location[]) ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Sessions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your coaching sessions
          </p>
        </div>
        <CoachCreateSessionForm coachId={user.id} locations={locations} />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm">
          {error.message}
        </div>
      )}

      {/* Sessions List + Calendar Toggle */}
      <SessionsView sessions={sessions} />
    </div>
  )
}
