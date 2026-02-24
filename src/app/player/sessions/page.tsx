import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SessionCard } from '@/components/features/session-card'
import { JoinButton } from './join-button'
import { cn } from '@/lib/utils'
import { CalendarDays, CalendarCheck, Clock } from 'lucide-react'

const PARTICIPANT_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  attended: 'bg-green-100 text-green-800',
  no_show: 'bg-gray-100 text-gray-600',
}

export default async function PlayerSessionsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get all scheduled sessions with player counts
  const { data: allSessions } = await supabase
    .from('sessions')
    .select(`
      *,
      coach:profiles!sessions_coach_id_fkey(id, full_name, avatar_url),
      session_players(player_id, status)
    `)
    .eq('status', 'scheduled')
    .order('date', { ascending: true })

  // Get this player's session records
  const { data: mySessionRecords } = await supabase
    .from('session_players')
    .select(`
      *,
      session:sessions(
        *,
        coach:profiles!sessions_coach_id_fkey(id, full_name, avatar_url)
      )
    `)
    .eq('player_id', user.id)
    .order('joined_at', { ascending: false })

  const sessions = allSessions || []
  const myRecords = mySessionRecords || []

  // Set of session IDs the player has already joined
  const joinedSessionIds = new Set(myRecords.map((r) => r.session_id))

  // Available sessions: scheduled sessions the player hasn't joined
  const availableSessions = sessions.filter((s) => !joinedSessionIds.has(s.id))

  // My sessions: separate into upcoming and past
  const now = new Date()
  const upcomingSessions = myRecords.filter((r) => {
    const session = r.session as { date: string; status: string } | null
    if (!session) return false
    return new Date(session.date) >= now || session.status === 'scheduled'
  })
  const pastSessions = myRecords.filter((r) => {
    const session = r.session as { date: string; status: string } | null
    if (!session) return false
    return new Date(session.date) < now && session.status !== 'scheduled'
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Sessions</h1>
        <p className="text-muted-foreground">Browse and manage your coaching sessions</p>
      </div>

      {/* Available Sessions */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Available Sessions</h2>
        </div>

        {availableSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableSessions.map((session) => {
              const coach = session.coach as { id: string; full_name: string } | null
              const players = (session.session_players as { player_id: string; status: string }[]) || []
              const activePlayerCount = players.filter(
                (p) => p.status === 'pending' || p.status === 'approved' || p.status === 'attended'
              ).length

              return (
                <SessionCard
                  key={session.id}
                  id={session.id}
                  date={session.date}
                  coachName={coach?.full_name || 'TBA'}
                  sessionType={session.session_type}
                  status={session.status}
                  maxPlayers={session.max_players}
                  playerCount={activePlayerCount}
                  notes={session.notes}
                  actions={<JoinButton sessionId={session.id} />}
                />
              )
            })}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No available sessions at the moment. Check back later!
            </p>
          </div>
        )}
      </section>

      {/* My Sessions - Upcoming */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">My Upcoming Sessions</h2>
        </div>

        {upcomingSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingSessions.map((record) => {
              const session = record.session as {
                id: string
                date: string
                session_type: string
                status: string
                max_players: number
                notes: string | null
                coach: { id: string; full_name: string } | null
              } | null

              if (!session) return null

              return (
                <SessionCard
                  key={`${record.session_id}-${record.player_id}`}
                  id={session.id}
                  date={session.date}
                  coachName={session.coach?.full_name || 'TBA'}
                  sessionType={session.session_type}
                  status={session.status}
                  maxPlayers={session.max_players}
                  notes={session.notes}
                  actions={
                    <span
                      className={cn(
                        'text-xs font-medium px-2.5 py-1 rounded-full capitalize',
                        PARTICIPANT_STATUS_STYLES[record.status] || 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {record.status === 'pending' ? 'Pending Approval' : record.status}
                    </span>
                  }
                />
              )
            })}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No upcoming sessions. Browse available sessions above to join one!
            </p>
          </div>
        )}
      </section>

      {/* My Sessions - Past */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CalendarCheck className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-semibold">Past Sessions</h2>
        </div>

        {pastSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastSessions.map((record) => {
              const session = record.session as {
                id: string
                date: string
                session_type: string
                status: string
                max_players: number
                notes: string | null
                coach: { id: string; full_name: string } | null
              } | null

              if (!session) return null

              return (
                <SessionCard
                  key={`past-${record.session_id}-${record.player_id}`}
                  id={session.id}
                  date={session.date}
                  coachName={session.coach?.full_name || 'TBA'}
                  sessionType={session.session_type}
                  status={session.status}
                  maxPlayers={session.max_players}
                  notes={session.notes}
                  actions={
                    <span
                      className={cn(
                        'text-xs font-medium px-2.5 py-1 rounded-full capitalize',
                        PARTICIPANT_STATUS_STYLES[record.status] || 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {record.status}
                    </span>
                  }
                />
              )
            })}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <CalendarCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No past sessions yet.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
