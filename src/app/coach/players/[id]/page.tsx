import { getPlayerById } from '@/app/actions/player-actions'
import { getPlayerAssessments } from '@/app/actions/assessment-actions'
import { GradeBadge } from '@/components/features/grade-badge'
import { ArchetypeBadge } from '@/components/features/archetype-badge'
import { AssessmentRadarChart } from '@/components/features/radar-chart'
import { ProgressLineChart } from '@/components/features/progress-line-chart'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ClipboardList, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react'

interface PlayerDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const { id } = await params

  const [playerResult, assessmentsResult] = await Promise.all([
    getPlayerById(id),
    getPlayerAssessments(id),
  ])

  if (playerResult.error || !playerResult.data) {
    notFound()
  }

  const player = playerResult.data as any
  const assessments = (assessmentsResult.data ?? []) as any[]
  const playerProfile = Array.isArray(player.player_profiles)
    ? player.player_profiles[0]
    : player.player_profiles

  const latestAssessment = assessments[0] ?? null
  const previousAssessment = assessments.length >= 2 ? assessments[1] : null
  const hasTwoOrMore = assessments.length >= 2

  // Build radar chart data from latest (and optionally previous) assessment
  const radarData = latestAssessment
    ? [
        {
          parameter: 'Reaction',
          current: latestAssessment.reaction_to_ball,
          ...(previousAssessment ? { previous: previousAssessment.reaction_to_ball } : {}),
        },
        {
          parameter: 'Swing Size',
          current: latestAssessment.swing_size,
          ...(previousAssessment ? { previous: previousAssessment.swing_size } : {}),
        },
        {
          parameter: 'Spacing',
          current: latestAssessment.spacing_awareness,
          ...(previousAssessment ? { previous: previousAssessment.spacing_awareness } : {}),
        },
        {
          parameter: 'Recovery',
          current: latestAssessment.recovery_habit,
          ...(previousAssessment ? { previous: previousAssessment.recovery_habit } : {}),
        },
        {
          parameter: 'Decision',
          current: latestAssessment.decision_making,
          ...(previousAssessment ? { previous: previousAssessment.decision_making } : {}),
        },
      ]
    : []

  // Build progress line chart data (chronological order)
  const progressData = [...assessments]
    .reverse()
    .map((a: any) => ({
      date: a.created_at,
      average: a.average_score,
      reaction_to_ball: a.reaction_to_ball,
      swing_size: a.swing_size,
      spacing_awareness: a.spacing_awareness,
      recovery_habit: a.recovery_habit,
      decision_making: a.decision_making,
    }))

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/coach/players"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Players
      </Link>

      {/* Player Header */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold flex-shrink-0">
            {player.avatar_url ? (
              <img
                src={player.avatar_url}
                alt={player.full_name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              player.full_name
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{player.full_name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <GradeBadge grade={playerProfile?.current_grade ?? 'Unassessed'} size="sm" />
              <ArchetypeBadge archetype={playerProfile?.current_archetype ?? 'Unassessed'} size="sm" />
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                {playerProfile?.total_sessions ?? 0} sessions
              </span>
              <span className="flex items-center gap-1">
                <ClipboardList className="w-3.5 h-3.5" />
                {assessments.length} assessments
              </span>
            </div>
          </div>
        </div>

        {/* Assess Button */}
        <Link
          href={`/coach/assess?player=${id}`}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium text-sm min-h-[44px] hover:opacity-90 transition-opacity"
        >
          <ClipboardList className="w-4 h-4" />
          Assess This Player
        </Link>
      </div>

      {/* Radar Chart */}
      {latestAssessment && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h2 className="text-base font-semibold mb-1">Skill Overview</h2>
          <p className="text-xs text-muted-foreground mb-3">
            {hasTwoOrMore
              ? 'Current assessment vs previous assessment'
              : 'Latest assessment results'}
          </p>
          <AssessmentRadarChart data={radarData} showPrevious={hasTwoOrMore} height={280} />
        </div>
      )}

      {/* Progress Line Chart */}
      {assessments.length >= 2 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h2 className="text-base font-semibold mb-1">Progress Over Time</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Score trends across all assessments
          </p>
          <ProgressLineChart data={progressData} showParameters={true} height={280} />
        </div>
      )}

      {/* No assessments state */}
      {assessments.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">No assessments yet</p>
          <p className="text-xs text-muted-foreground mb-4">
            Create the first assessment for this player.
          </p>
          <Link
            href={`/coach/assess?player=${id}`}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium text-sm min-h-[44px] hover:opacity-90 transition-opacity"
          >
            <ClipboardList className="w-4 h-4" />
            Create Assessment
          </Link>
        </div>
      )}

      {/* Assessment History */}
      {assessments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Assessment History</h2>
          <div className="space-y-3">
            {assessments.map((assessment: any) => (
              <div
                key={assessment.id}
                className="bg-card rounded-xl border border-border p-4"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(assessment.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      by {assessment.coach?.full_name ?? 'Unknown Coach'}
                      {assessment.session
                        ? ` | ${assessment.session.session_type?.replace('_', ' ')} session`
                        : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <GradeBadge grade={assessment.player_grade} size="sm" showLabel={false} />
                    <ArchetypeBadge archetype={assessment.player_archetype} size="sm" />
                  </div>
                </div>

                {/* Scores grid */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <ScoreCell label="Reaction" value={assessment.reaction_to_ball} />
                  <ScoreCell label="Swing" value={assessment.swing_size} />
                  <ScoreCell label="Spacing" value={assessment.spacing_awareness} />
                  <ScoreCell label="Recovery" value={assessment.recovery_habit} />
                  <ScoreCell label="Decision" value={assessment.decision_making} />
                  <ScoreCell label="Average" value={assessment.average_score} highlight />
                </div>

                {/* Notes */}
                {assessment.improvement_notes && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Notes</p>
                    <p className="text-sm">{assessment.improvement_notes}</p>
                  </div>
                )}

                {/* Areas to focus */}
                {assessment.areas_to_focus && assessment.areas_to_focus.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Areas to Focus</p>
                    <div className="flex flex-wrap gap-1.5">
                      {assessment.areas_to_focus.map((area: string) => (
                        <span
                          key={area}
                          className="text-xs bg-muted px-2 py-0.5 rounded-full capitalize"
                        >
                          {area.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreCell({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-lg p-2 text-center ${
        highlight ? 'bg-primary/10' : 'bg-muted/50'
      }`}
    >
      <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-primary' : ''}`}>{value}</p>
    </div>
  )
}
