import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SessionCard } from '@/components/features/session-card'
import { GradeBadge } from '@/components/features/grade-badge'
import { ArchetypeBadge } from '@/components/features/archetype-badge'
import { ClipboardList, CalendarDays, Plus, ChevronRight, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CoachDashboard() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get coach profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'coach') redirect('/login')

  // Get today's date in ISO format for filtering
  const today = new Date().toISOString().split('T')[0]

  // Get upcoming sessions (scheduled or in_progress, date >= today)
  const { data: upcomingSessions } = await supabase
    .from('sessions')
    .select(`
      *,
      coach:profiles!sessions_coach_id_fkey(id, full_name, email, avatar_url),
      session_players(player_id, status),
      locations(id, name)
    `)
    .eq('coach_id', user.id)
    .gte('date', today)
    .in('status', ['scheduled', 'in_progress'])
    .order('date', { ascending: true })
    .limit(5)

  // Get recent assessments by this coach (last 5)
  const { data: recentAssessments } = await supabase
    .from('assessments')
    .select(`
      *,
      player:profiles!assessments_player_id_fkey(id, full_name, avatar_url)
    `)
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Stats
  const { count: totalAssessments } = await supabase
    .from('assessments')
    .select('*', { count: 'exact', head: true })
    .eq('coach_id', user.id)

  const upcomingCount = upcomingSessions?.length ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {profile.full_name}
          </p>
        </div>
        <Link
          href="/coach/sessions"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium text-sm min-h-[44px] hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Session
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <ClipboardList className="w-4 h-4" />
            <span className="text-xs font-medium">Total Assessments</span>
          </div>
          <p className="text-2xl font-bold">{totalAssessments ?? 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CalendarDays className="w-4 h-4" />
            <span className="text-xs font-medium">Upcoming Sessions</span>
          </div>
          <p className="text-2xl font-bold">{upcomingCount}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/coach/players"
          className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow flex items-center gap-3 min-h-[44px]"
        >
          <Users className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">View Players</span>
        </Link>
        <Link
          href="/coach/sessions"
          className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow flex items-center gap-3 min-h-[44px]"
        >
          <CalendarDays className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">My Sessions</span>
        </Link>
      </div>

      {/* Upcoming Sessions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Upcoming Sessions</h2>
          <Link
            href="/coach/sessions"
            className="text-sm text-primary font-medium flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {upcomingSessions && upcomingSessions.length > 0 ? (
          <div className="space-y-3">
            {upcomingSessions.map((session: any) => (
              <Link key={session.id} href={`/coach/sessions/${session.id}`}>
                <SessionCard
                  id={session.id}
                  date={session.date}
                  coachName={session.coach?.full_name ?? 'Unknown'}
                  sessionType={session.session_type}
                  locationName={session.locations?.name}
                  courtsBooked={session.courts_booked}
                  durationHours={session.duration_hours}
                  status={session.status}
                  maxPlayers={session.max_players}
                  playerCount={session.session_players?.filter(
                    (p: any) => p.status === 'approved' || p.status === 'attended'
                  ).length ?? 0}
                  notes={session.notes}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">No upcoming sessions</p>
          </div>
        )}
      </div>

      {/* Recent Assessments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Assessments</h2>
          <Link
            href="/coach/players"
            className="text-sm text-primary font-medium flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentAssessments && recentAssessments.length > 0 ? (
          <div className="space-y-3">
            {recentAssessments.map((assessment: any) => (
              <Link
                key={assessment.id}
                href={`/coach/players/${assessment.player_id}`}
                className="block bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {assessment.player?.full_name
                        ?.split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) ?? '?'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {assessment.player?.full_name ?? 'Unknown Player'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Avg: {assessment.average_score}/10 &middot;{' '}
                        {new Date(assessment.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <GradeBadge grade={assessment.player_grade} size="sm" showLabel={false} />
                    <ArchetypeBadge archetype={assessment.player_archetype} size="sm" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">No assessments yet</p>
            <Link
              href="/coach/assess"
              className="text-sm text-primary font-medium mt-2 inline-block"
            >
              Create your first assessment
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
