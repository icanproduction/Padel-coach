import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SessionsClient } from './sessions-client'
import { SessionFilter } from './session-filter'
import type { Profile, Location } from '@/types/database'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ create?: string }>
}

export default async function AdminSessionsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createServerSupabaseClient()

  // Fetch sessions, coaches, and locations in parallel
  const [sessionsResult, coachesResult, locationsResult] = await Promise.all([
    supabase
      .from('sessions')
      .select(`
        *,
        coach:profiles!sessions_coach_id_fkey(id, full_name, email, avatar_url),
        session_players(player_id, status),
        locations(id, name, address, maps_link, courts)
      `)
      .order('date', { ascending: false })
      .limit(100),
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'coach')
      .order('full_name'),
    supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .order('name'),
  ])

  const sessions = sessionsResult.data ?? []
  const coaches = (coachesResult.data as Profile[]) ?? []
  const locations = (locationsResult.data as Location[]) ?? []
  const defaultOpen = params?.create === 'true'

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sessions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage coaching sessions
          </p>
        </div>
        <SessionsClient coaches={coaches} locations={locations} defaultOpen={defaultOpen} />
      </div>

      {/* Filtered sessions */}
      {sessionsResult.error ? (
        <div className="bg-card rounded-xl border border-destructive/50 p-6 text-center">
          <p className="text-sm text-destructive">
            Failed to load sessions: {sessionsResult.error.message}
          </p>
        </div>
      ) : (
        <SessionFilter sessions={sessions} />
      )}
    </div>
  )
}
