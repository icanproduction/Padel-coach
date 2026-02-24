import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GradeBadge } from '@/components/features/grade-badge'
import { ArchetypeBadge } from '@/components/features/archetype-badge'
import { AssessmentRadarChart } from '@/components/features/radar-chart'
import { ProgressLineChart } from '@/components/features/progress-line-chart'
import { ASSESSMENT_PARAMETERS } from '@/types/database'
import { CURRICULUMS } from '@/data/curriculum'
import type { Assessment, ModuleRecord } from '@/types/database'
import { cn } from '@/lib/utils'
import { BarChart3, Target, TrendingUp, Hash } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PlayerProgressPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get player profile
  const { data: playerProfile } = await supabase
    .from('player_profiles')
    .select('*')
    .eq('player_id', user.id)
    .single()

  // Get all assessments (ascending for charts)
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('player_id', user.id)
    .order('created_at', { ascending: true })

  // Get module records
  const { data: moduleRecords } = await supabase
    .from('module_records')
    .select('*')
    .eq('player_id', user.id)

  const allAssessments = (assessments || []) as Assessment[]
  const allModuleRecords = (moduleRecords || []) as ModuleRecord[]
  const totalAssessments = allAssessments.length

  const currentGrade = playerProfile?.current_grade || 'Unassessed'
  const currentArchetype = playerProfile?.current_archetype || 'Unassessed'

  // Calculate overall average across all assessments
  const overallAverage =
    totalAssessments > 0
      ? allAssessments.reduce((sum, a) => sum + a.average_score, 0) / totalAssessments
      : 0

  // Build radar chart data: current (latest) + previous assessment overlay
  const latestAssessment = totalAssessments > 0 ? allAssessments[totalAssessments - 1] : null
  const previousAssessment = totalAssessments > 1 ? allAssessments[totalAssessments - 2] : null
  const hasPrevious = previousAssessment !== null

  const radarData = latestAssessment
    ? ASSESSMENT_PARAMETERS.map((param) => ({
        parameter: param.label,
        current: (latestAssessment as unknown as Record<string, unknown>)[param.key] as number,
        ...(hasPrevious
          ? { previous: (previousAssessment as unknown as Record<string, unknown>)[param.key] as number }
          : {}),
      }))
    : []

  // Build line chart data: all assessments over time
  const lineChartData = allAssessments.map((a) => ({
    date: a.created_at,
    average: a.average_score,
    reaction_to_ball: a.reaction_to_ball,
    swing_size: a.swing_size,
    spacing_awareness: a.spacing_awareness,
    recovery_habit: a.recovery_habit,
    decision_making: a.decision_making,
  }))

  // Build curriculum progress map
  // For each module, find the latest record status
  const moduleStatusMap: Record<string, 'not_started' | 'in_progress' | 'completed'> = {}
  for (const record of allModuleRecords) {
    const existing = moduleStatusMap[record.module_id]
    // A completed record always wins
    if (record.status === 'completed') {
      moduleStatusMap[record.module_id] = 'completed'
    } else if (record.status === 'in_progress' && existing !== 'completed') {
      moduleStatusMap[record.module_id] = 'in_progress'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">My Progress</h1>
        <p className="text-muted-foreground">Track your padel journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Grade</span>
          </div>
          <GradeBadge grade={currentGrade} size="sm" />
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Archetype</span>
          </div>
          <ArchetypeBadge archetype={currentArchetype} size="sm" />
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Avg Score</span>
          </div>
          <p className="text-xl font-bold">
            {overallAverage > 0 ? overallAverage.toFixed(1) : '---'}
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Assessments</span>
          </div>
          <p className="text-xl font-bold">{totalAssessments}</p>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">
          Skill Radar
          {hasPrevious && (
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              (current vs previous assessment)
            </span>
          )}
        </h2>
        {radarData.length > 0 ? (
          <AssessmentRadarChart data={radarData} showPrevious={hasPrevious} height={350} />
        ) : (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground text-sm">
            No assessments yet. Complete a session to see your skill radar.
          </div>
        )}
      </div>

      {/* Progress Line Chart */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Score History</h2>
        {lineChartData.length > 1 ? (
          <ProgressLineChart data={lineChartData} showParameters height={350} />
        ) : lineChartData.length === 1 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <p className="mb-2">Only 1 assessment recorded so far.</p>
            <p>Get another assessment to start tracking progress over time.</p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground text-sm">
            No assessment data to display yet.
          </div>
        )}
      </div>

      {/* Curriculum Progress */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Curriculum Progress</h2>
        <div className="space-y-5">
          {CURRICULUMS.map((curriculum) => {
            const modules = curriculum.modules
            const totalModules = modules.length
            const completedCount = modules.filter(
              (m) => moduleStatusMap[m.id] === 'completed'
            ).length
            const inProgressCount = modules.filter(
              (m) => moduleStatusMap[m.id] === 'in_progress'
            ).length
            const notStartedCount = totalModules - completedCount - inProgressCount

            return (
              <div key={curriculum.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-sm font-semibold">{curriculum.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {completedCount}/{totalModules} completed
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{curriculum.description}</p>

                {/* Progress bar segments */}
                <div className="flex gap-1 w-full h-3 rounded-full overflow-hidden">
                  {modules.map((mod) => {
                    const status = moduleStatusMap[mod.id] || 'not_started'
                    return (
                      <div
                        key={mod.id}
                        className={cn(
                          'flex-1 rounded-sm transition-all',
                          status === 'completed'
                            ? 'bg-emerald-500'
                            : status === 'in_progress'
                              ? 'bg-amber-400'
                              : 'bg-muted'
                        )}
                        title={`${mod.name}: ${status.replace('_', ' ')}`}
                      />
                    )
                  })}
                </div>

                {/* Module names below */}
                <div className="flex gap-1 mt-1">
                  {modules.map((mod) => {
                    const status = moduleStatusMap[mod.id] || 'not_started'
                    return (
                      <div key={mod.id} className="flex-1 text-center">
                        <span
                          className={cn(
                            'text-[10px] leading-tight block truncate',
                            status === 'completed'
                              ? 'text-emerald-600 font-medium'
                              : status === 'in_progress'
                                ? 'text-amber-600 font-medium'
                                : 'text-muted-foreground'
                          )}
                          title={mod.name}
                        >
                          {mod.name}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Legend for this curriculum */}
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                  {completedCount > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {completedCount} completed
                    </span>
                  )}
                  {inProgressCount > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      {inProgressCount} in progress
                    </span>
                  )}
                  {notStartedCount > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted" />
                      {notStartedCount} not started
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
