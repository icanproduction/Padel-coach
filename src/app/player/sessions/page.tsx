import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SessionCard } from '@/components/features/session-card'
import { JoinButton } from './join-button'
import { CancelButton } from './cancel-button'
import { cn } from '@/lib/utils'
import { CalendarDays, CalendarCheck, Clock } from 'lucide-react'
import { SessionTabsWrapper } from './session-tabs-wrapper'
import { AvailableSessions } from './available-sessions'

const PARTICIPANT_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  attended: 'bg-green-100 text-green-800',
  no_show: 'bg-gray-100 text-gray-600',
  waitlisted: 'bg-gray-100 text-gray-800',
  cancel_requested: 'bg-orange-100 text-orange-800',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  attended: 'Attended',
  no_show: 'No Show',
  waitlisted: 'Waitlisted',
  cancel_requested: 'Cancel Requested',
}

export const dynamic = 'force-dynamic'

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

  const renderAvailable = () => (
    <AvailableSessions sessions={availableSessions} />
  )

  const renderUpcoming = () => (
    upcomingSessions.length > 0 ? (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {upcomingSessions.map((record) => {
          const session = record.session as {
            id: string; date: string; session_type: string; status: string
            max_players: number; location: string | null; price_per_pax: number | null
            notes: string | null; coach: { id: string; full_name: string } | null
          } | null
          if (!session) return null
          const canCancel = record.status === 'approved' || record.status === 'pending'
          return (
            <Link key={`${record.session_id}-${record.player_id}`} href={`/player/sessions/${session.id}`}>
              <SessionCard
                id={session.id}
                date={session.date}
                coachName={session.coach?.full_name || 'TBA'}
                sessionType={session.session_type}
                locationName={session.location}
                status={session.status}
                maxPlayers={session.max_players}
                pricePax={session.price_per_pax}
                notes={session.notes}
                actions={
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', PARTICIPANT_STATUS_STYLES[record.status] || 'bg-gray-100 text-gray-600')}>
                      {STATUS_LABELS[record.status] || record.status}
                    </span>
                    {canCancel && <CancelButton sessionId={session.id} />}
                  </div>
                }
              />
            </Link>
          )
        })}
      </div>
    ) : (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Belum ada session. Cek tab Available untuk join!</p>
      </div>
    )
  )

  const renderPast = () => (
    pastSessions.length > 0 ? (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {pastSessions.map((record) => {
          const session = record.session as {
            id: string; date: string; session_type: string; status: string
            max_players: number; location: string | null; price_per_pax: number | null
            notes: string | null; coach: { id: string; full_name: string } | null
          } | null
          if (!session) return null
          return (
            <Link key={`past-${record.session_id}-${record.player_id}`} href={`/player/sessions/${session.id}`}>
              <SessionCard
                id={session.id}
                date={session.date}
                coachName={session.coach?.full_name || 'TBA'}
                sessionType={session.session_type}
                locationName={session.location}
                status={session.status}
                maxPlayers={session.max_players}
                pricePax={session.price_per_pax}
                notes={session.notes}
                actions={
                  <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', PARTICIPANT_STATUS_STYLES[record.status] || 'bg-gray-100 text-gray-600')}>
                    {STATUS_LABELS[record.status] || record.status}
                  </span>
                }
              />
            </Link>
          )
        })}
      </div>
    ) : (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <CalendarCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Belum ada session yang sudah selesai.</p>
      </div>
    )
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sessions</h1>
        <p className="text-muted-foreground">Browse and manage your coaching sessions</p>
      </div>

      <SessionTabsWrapper
        availableCount={availableSessions.length}
        upcomingCount={upcomingSessions.length}
        pastCount={pastSessions.length}
        availableContent={renderAvailable()}
        upcomingContent={renderUpcoming()}
        pastContent={renderPast()}
      />
    </div>
  )
}
