import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SessionCard } from '@/components/features/session-card'
import { Users, UserCheck, CalendarDays, Play, Plus, Eye } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()

  // Fetch stats in parallel
  const [
    { count: playerCount },
    { count: coachCount },
    { count: sessionCount },
    { count: activeSessionCount },
    { data: recentSessions },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'player'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'coach'),
    supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress'),
    supabase
      .from('sessions')
      .select(`
        *,
        coach:profiles!sessions_coach_id_fkey(id, full_name, email, avatar_url),
        session_players(player_id, status),
        locations(id, name, maps_link)
      `)
      .order('date', { ascending: false })
      .limit(5),
  ])

  const stats = [
    {
      label: 'Total Players',
      value: playerCount ?? 0,
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Total Coaches',
      value: coachCount ?? 0,
      icon: UserCheck,
      color: 'text-emerald-600 bg-emerald-100',
    },
    {
      label: 'Total Sessions',
      value: sessionCount ?? 0,
      icon: CalendarDays,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      label: 'Active Sessions',
      value: activeSessionCount ?? 0,
      icon: Play,
      color: 'text-yellow-600 bg-yellow-100',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your padel coaching platform
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-card rounded-xl border border-border p-3"
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="space-y-2">
          <Link
            href="/admin/sessions?create=true"
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Create Session</p>
              <p className="text-xs text-muted-foreground">
                Schedule a new coaching session
              </p>
            </div>
          </Link>

          <Link
            href="/admin/players"
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">View Players</p>
              <p className="text-xs text-muted-foreground">
                Browse all registered players
              </p>
            </div>
          </Link>

          <Link
            href="/admin/coaches"
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">View Coaches</p>
              <p className="text-xs text-muted-foreground">
                Manage coaching staff
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Sessions</h2>
          <Link
            href="/admin/sessions"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {recentSessions && recentSessions.length > 0 ? (
          <div className="space-y-3">
            {recentSessions.map((session: any) => (
              <Link key={session.id} href={`/admin/sessions/${session.id}`}>
                <SessionCard
                  id={session.id}
                  date={session.date}
                  coachName={session.coach?.full_name ?? 'Unknown'}
                  sessionType={session.session_type}
                  locationName={session.locations?.name}
                  locationMapsLink={session.locations?.maps_link}
                  courtsBooked={session.courts_booked}
                  durationHours={session.duration_hours}
                  reclubUrl={session.reclub_url}
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
            <Link
              href="/admin/sessions?create=true"
              className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-primary hover:underline"
            >
              <Plus className="w-4 h-4" />
              Create Session
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
