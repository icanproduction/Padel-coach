import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SessionsTabs } from './sessions-tabs'

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Sessions</h1>
        <p className="text-muted-foreground">Browse and manage your coaching sessions</p>
      </div>

      {/* Tabbed Content */}
      <SessionsTabs
        availableSessions={availableSessions}
        upcomingSessions={upcomingSessions}
        pastSessions={pastSessions}
      />
    </div>
  )
}
