import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { GradeBadge } from '@/components/features/grade-badge'
import { ArchetypeBadge } from '@/components/features/archetype-badge'
import { AssessmentRadarChart } from '@/components/features/radar-chart'
import { OpenPlayReadiness } from '@/components/features/open-play-readiness'
import { ASSESSMENT_PARAMETERS } from '@/types/database'
import { ArrowRight, BarChart3, CalendarDays, Trophy, ClipboardList, Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function PlayerDashboard() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'player') redirect('/login')

  // Get player profile
  const { data: playerProfile } = await supabase
    .from('player_profiles')
    .select('*')
    .eq('player_id', user.id)
    .single()

  // Get latest assessment
  const { data: latestAssessment } = await supabase
    .from('assessments')
    .select(`
      *,
      coach:profiles!assessments_coach_id_fkey(id, full_name)
    `)
    .eq('player_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Get last attended session date
  const { data: lastSession } = await supabase
    .from('session_players')
    .select(`
      session:sessions(date)
    `)
    .eq('player_id', user.id)
    .eq('status', 'attended')
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Get next upcoming session
  const today = new Date().toISOString().split('T')[0]
  const { data: nextSession } = await supabase
    .from('session_players')
    .select(`
      session:sessions(
        id, date, session_type,
        coach:profiles!sessions_coach_id_fkey(full_name)
      )
    `)
    .eq('player_id', user.id)
    .in('status', ['approved', 'pending'])
    .limit(10)

  // Filter for future sessions and pick the earliest
  const upcomingSession = nextSession
    ?.map((r) => r.session as unknown as { id: string; date: string; session_type: string; coach: { full_name: string } | null })
    ?.filter((s) => s && s.date >= today)
    ?.sort((a, b) => a.date.localeCompare(b.date))?.[0] ?? null

  const currentGrade = playerProfile?.current_grade || 'Unassessed'
  const currentArchetype = playerProfile?.current_archetype || 'Unassessed'
  const totalSessions = playerProfile?.total_sessions || 0
  const lastSessionDate = (lastSession?.session as unknown as { date: string } | null)?.date || null
  const averageScore = latestAssessment?.average_score || 0

  // Build radar chart data from latest assessment
  const radarData = latestAssessment
    ? ASSESSMENT_PARAMETERS.map((param) => ({
        parameter: param.label,
        current: (latestAssessment as Record<string, unknown>)[param.key] as number,
      }))
    : []

  // Greeting based on time
  const hour = new Date().getHours()
  const greeting = hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam'
  const firstName = profile.full_name.split(' ')[0]

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
        <div className="relative z-10">
          <p className="text-sm font-medium opacity-90">{greeting}</p>
          <h1 className="text-2xl font-bold mt-0.5">{firstName}!</h1>

          {/* Grade & Archetype Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
              {currentGrade}
            </span>
            <span className="bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium px-3 py-1 rounded-full">
              {currentArchetype}
            </span>
          </div>

          {/* Next Session Card */}
          {upcomingSession && (
            <div className="mt-4 bg-white/15 backdrop-blur-sm rounded-xl p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80 mb-1.5">Next Session</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 opacity-80" />
                <span className="text-sm font-semibold">
                  {new Date(upcomingSession.date).toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                  {' · '}
                  {new Date(upcomingSession.date).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {upcomingSession.coach && (
                <p className="text-xs opacity-80 mt-1 ml-6">
                  Coach {upcomingSession.coach.full_name}
                </p>
              )}
            </div>
          )}
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -right-2 w-20 h-20 rounded-full bg-white/5" />
        <div className="absolute top-1/2 -right-10 w-32 h-32 rounded-full bg-white/5" />
      </div>

      {/* Current Status Card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Current Status</h2>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <GradeBadge grade={currentGrade} size="lg" />
          <ArchetypeBadge archetype={currentArchetype} size="md" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Sessions</p>
            <p className="text-2xl font-bold">{totalSessions}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last Session</p>
            <p className="text-2xl font-bold">
              {lastSessionDate
                ? new Date(lastSessionDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })
                : '---'}
            </p>
          </div>
        </div>
      </div>

      {/* Radar Chart + Open Play Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mini Radar Chart */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Skill Overview</h3>
          {radarData.length > 0 ? (
            <AssessmentRadarChart data={radarData} height={250} />
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
              No assessments yet
            </div>
          )}
        </div>

        {/* Open Play Readiness */}
        <OpenPlayReadiness averageScore={averageScore} />
      </div>

      {/* Latest Assessment Summary */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-muted-foreground">Latest Assessment</h2>
          {latestAssessment && (
            <span className="text-xs text-muted-foreground">
              {new Date(latestAssessment.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          )}
        </div>

        {latestAssessment ? (
          <div className="space-y-3">
            {latestAssessment.coach && (
              <p className="text-xs text-muted-foreground mb-3">
                Assessed by{' '}
                <span className="font-medium text-foreground">
                  {(latestAssessment.coach as { full_name: string }).full_name}
                </span>
              </p>
            )}
            {ASSESSMENT_PARAMETERS.map((param) => {
              const score = (latestAssessment as Record<string, unknown>)[param.key] as number
              return (
                <div key={param.key} className="flex items-center justify-between gap-3">
                  <span className="text-sm flex-shrink-0">{param.label}</span>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          score >= 7
                            ? 'bg-emerald-500'
                            : score >= 5
                              ? 'bg-amber-500'
                              : 'bg-red-400'
                        )}
                        style={{ width: `${(score / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">{score}</span>
                  </div>
                </div>
              )
            })}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-sm font-medium">Average</span>
              <span className="text-lg font-bold text-primary">
                {latestAssessment.average_score.toFixed(1)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No assessments yet. Join a session to get assessed by a coach.
          </p>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/player/progress"
          className="flex items-center justify-between bg-card rounded-xl border border-border p-4 hover:bg-accent transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">View Full Progress</p>
              <p className="text-xs text-muted-foreground">Charts, curriculum & history</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>

        <Link
          href="/player/sessions"
          className="flex items-center justify-between bg-card rounded-xl border border-border p-4 hover:bg-accent transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">Browse Sessions</p>
              <p className="text-xs text-muted-foreground">Join upcoming sessions</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>

        <Link
          href="/player/assessments"
          className="flex items-center justify-between bg-card rounded-xl border border-border p-4 hover:bg-accent transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">Assessment History</p>
              <p className="text-xs text-muted-foreground">All past evaluations</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>

        <div className="flex items-center justify-between bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">Current Average</p>
              <p className="text-xs text-muted-foreground">
                {averageScore > 0 ? `${averageScore.toFixed(1)} / 10` : 'Not assessed'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
