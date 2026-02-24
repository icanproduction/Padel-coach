import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SessionCard } from '@/components/features/session-card'
import { SessionsClient } from './sessions-client'
import { CalendarDays } from 'lucide-react'
import type { Profile } from '@/types/database'

interface PageProps {
  searchParams: Promise<{ create?: string }>
}

export default async function AdminSessionsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createServerSupabaseClient()

  // Fetch sessions and coaches in parallel
  const [sessionsResult, coachesResult] = await Promise.all([
    supabase
      .from('sessions')
      .select(`
        *,
        coach:profiles!sessions_coach_id_fkey(id, full_name, email, avatar_url),
        session_players(player_id, status)
      `)
      .order('date', { ascending: false }),
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'coach')
      .order('full_name'),
  ])

  const sessions = sessionsResult.data
  const coaches = (coachesResult.data as Profile[]) ?? []
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
        <SessionsClient coaches={coaches} defaultOpen={defaultOpen} />
      </div>

      {/* Sessions list */}
      {sessionsResult.error ? (
        <div className="bg-card rounded-xl border border-destructive/50 p-6 text-center">
          <p className="text-sm text-destructive">
            Failed to load sessions: {sessionsResult.error.message}
          </p>
        </div>
      ) : sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session: any) => (
            <Link key={session.id} href={`/admin/sessions/${session.id}`}>
              <SessionCard
                id={session.id}
                date={session.date}
                coachName={session.coach?.full_name ?? 'Unknown'}
                sessionType={session.session_type}
                status={session.status}
                maxPlayers={session.max_players}
                playerCount={
                  session.session_players?.filter(
                    (p: any) =>
                      p.status === 'approved' || p.status === 'attended'
                  ).length ?? 0
                }
                notes={session.notes}
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No sessions found. Create your first session to get started.
          </p>
        </div>
      )}
    </div>
  )
}
