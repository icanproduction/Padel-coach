import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GradeBadge } from '@/components/features/grade-badge'
import { ArchetypeBadge } from '@/components/features/archetype-badge'
import { ASSESSMENT_PARAMETERS } from '@/types/database'
import { getModuleById } from '@/data/curriculum'
import { cn } from '@/lib/utils'
import { ClipboardList, MessageSquare, Target, BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PlayerAssessmentsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get all assessments with coach info, ordered by date desc
  const { data: assessments } = await supabase
    .from('assessments')
    .select(`
      *,
      coach:profiles!assessments_coach_id_fkey(id, full_name, avatar_url)
    `)
    .eq('player_id', user.id)
    .order('created_at', { ascending: false })

  const allAssessments = assessments || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Assessment History</h1>
        <p className="text-muted-foreground">
          All evaluations from your coaching sessions ({allAssessments.length} total)
        </p>
      </div>

      {allAssessments.length > 0 ? (
        <div className="space-y-4">
          {allAssessments.map((assessment, index) => {
            const coach = assessment.coach as { id: string; full_name: string; avatar_url: string | null } | null
            const isLatest = index === 0

            return (
              <div
                key={assessment.id}
                className={cn(
                  'bg-card rounded-xl border p-6',
                  isLatest ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border'
                )}
              >
                {/* Header: Date + Coach + Latest badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">
                        {new Date(assessment.created_at).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      {isLatest && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          Latest
                        </span>
                      )}
                    </div>
                    {coach && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Coach: {coach.full_name}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <GradeBadge grade={assessment.player_grade} size="sm" />
                    <ArchetypeBadge archetype={assessment.player_archetype} size="sm" />
                  </div>
                </div>

                {/* Scores */}
                <div className="space-y-2.5 mb-4">
                  {ASSESSMENT_PARAMETERS.map((param) => {
                    const score = (assessment as Record<string, unknown>)[param.key] as number
                    return (
                      <div key={param.key} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-muted-foreground flex-shrink-0 w-32">
                          {param.label}
                        </span>
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <div className="w-28 h-2 bg-muted rounded-full overflow-hidden">
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
                          <span
                            className={cn(
                              'text-sm font-semibold w-8 text-right',
                              score >= 7
                                ? 'text-emerald-600'
                                : score >= 5
                                  ? 'text-amber-600'
                                  : 'text-red-500'
                            )}
                          >
                            {score}
                          </span>
                        </div>
                      </div>
                    )
                  })}

                  {/* Average */}
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-sm font-medium">Average Score</span>
                    <span className="text-lg font-bold text-primary">
                      {assessment.average_score.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Notes sections */}
                <div className="space-y-3">
                  {assessment.improvement_notes && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Improvement Notes
                        </span>
                      </div>
                      <p className="text-sm">{assessment.improvement_notes}</p>
                    </div>
                  )}

                  {assessment.areas_to_focus && assessment.areas_to_focus.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Target className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                          Areas to Focus
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {assessment.areas_to_focus.map((area: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {assessment.recommended_next_modules &&
                    assessment.recommended_next_modules.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                            Recommended Modules
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {assessment.recommended_next_modules.map(
                            (moduleId: string, i: number) => {
                              const mod = getModuleById(moduleId)
                              return (
                                <span
                                  key={i}
                                  className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full"
                                >
                                  {mod ? mod.name : moduleId}
                                </span>
                              )
                            }
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-1">No Assessments Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Join a coaching session to receive your first skill assessment. Your coach will evaluate
            your performance across 5 key parameters.
          </p>
        </div>
      )}
    </div>
  )
}
