import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SessionCard } from '@/components/features/session-card'
import { CalendarDays } from 'lucide-react'
import { SessionStatusActions } from './session-status-actions'
import { CoachCreateSessionForm } from './create-session-form'

export const dynamic = 'force-dynamic'

export default async function CoachSessionsPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all sessions for this coach
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select(`
      *,
      coach:profiles!sessions_coach_id_fkey(id, full_name, email, avatar_url),
      session_players(player_id, status)
    `)
    .eq('coach_id', user.id)
    .order('date', { ascending: false })

  const allSessions = sessions ?? []
  const upcomingSessions = allSessions.filter(
    (s: any) => s.status === 'scheduled' || s.status === 'in_progress'
  )
  const completedSessions = allSessions.filter((s: any) => s.status === 'completed')

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
        <CoachCreateSessionForm coachId={user.id} />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm">
          {error.message}
        </div>
      )}

      {/* Upcoming / Active Sessions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Upcoming & Active ({upcomingSessions.length})
        </h2>

        {upcomingSessions.length > 0 ? (
          <div className="space-y-3">
            {upcomingSessions.map((session: any) => {
              const playerCount = session.session_players?.filter(
                (p: any) => p.status === 'approved' || p.status === 'attended'
              ).length ?? 0

              return (
                <Link key={session.id} href={`/coach/sessions/${session.id}`}>
                  <SessionCard
                    id={session.id}
                    date={session.date}
                    coachName={session.coach?.full_name ?? 'You'}
                    sessionType={session.session_type}
                    status={session.status}
                    maxPlayers={session.max_players}
                    playerCount={playerCount}
                    notes={session.notes}
                    actions={
                      <SessionStatusActions
                        sessionId={session.id}
                        currentStatus={session.status}
                      />
                    }
                  />
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming sessions</p>
          </div>
        )}
      </div>

      {/* Completed Sessions */}
      {completedSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Completed ({completedSessions.length})
          </h2>
          <div className="space-y-3">
            {completedSessions.map((session: any) => {
              const playerCount = session.session_players?.filter(
                (p: any) => p.status === 'attended'
              ).length ?? 0

              return (
                <Link key={session.id} href={`/coach/sessions/${session.id}`}>
                  <SessionCard
                    id={session.id}
                    date={session.date}
                    coachName={session.coach?.full_name ?? 'You'}
                    sessionType={session.session_type}
                    status={session.status}
                    maxPlayers={session.max_players}
                    playerCount={playerCount}
                    notes={session.notes}
                  />
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {allSessions.length === 0 && !error && (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">No sessions yet</p>
          <p className="text-xs text-muted-foreground">
            Tap &quot;New Session&quot; to create your first session.
          </p>
        </div>
      )}
    </div>
  )
}
