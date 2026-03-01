import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getPlayerById } from '@/app/actions/player-actions'
import { getPlayerAssessments } from '@/app/actions/assessment-actions'
import { getPlayerModuleProgress } from '@/app/actions/module-actions'
import { getPlayerSessions } from '@/app/actions/participant-actions'
import { getPlayerNotes } from '@/app/actions/note-actions'
import { GradeBadge } from '@/components/features/grade-badge'
import { ArchetypeBadge } from '@/components/features/archetype-badge'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ClipboardList, CalendarDays } from 'lucide-react'
import { SkillOverview } from './skill-overview'
import { CurriculumProgress } from './curriculum-progress'
import { SessionHistory } from './session-history'
import { PlayerNotes } from './player-notes'

export const dynamic = 'force-dynamic'

interface PlayerDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const { id } = await params

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [playerResult, assessmentsResult, moduleProgressResult, playerSessionsResult, notesResult] =
    await Promise.all([
      getPlayerById(id),
      getPlayerAssessments(id),
      getPlayerModuleProgress(id),
      getPlayerSessions(id),
      getPlayerNotes(id),
    ])

  if (playerResult.error || !playerResult.data) {
    notFound()
  }

  const player = playerResult.data as any
  const assessments = (assessmentsResult.data ?? []) as any[]
  const moduleRecords = (moduleProgressResult.data ?? []) as any[]
  const playerSessions = ((playerSessionsResult.data ?? []) as any[])
    .filter((ps: any) => ps.session)
  const notes = (notesResult.data ?? []) as any[]
  const currentCoachId = user?.id ?? ''

  const playerProfile = Array.isArray(player.player_profiles)
    ? player.player_profiles[0]
    : player.player_profiles

  const latestAssessment = assessments[0] ?? null

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
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold truncate">{player.full_name}</h1>
              {playerProfile?.gender && (
                <span className="text-sm text-muted-foreground">
                  {playerProfile.gender === 'male' ? '♂' : '♀'}
                </span>
              )}
            </div>
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
                {assessments.length} assessment{assessments.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Overview — bar chart graphic (top position) */}
      <SkillOverview moduleRecords={moduleRecords} />

      {/* Progress — per curriculum tabs + line chart */}
      <CurriculumProgress moduleRecords={moduleRecords} />

      {/* Discovery Assessment — score numbers */}
      {latestAssessment && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Discovery Assessment</h2>
            <Link
              href={`/coach/assess?player=${id}`}
              className="text-xs font-medium text-primary hover:underline"
            >
              Re-assess
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {latestAssessment.player_grade} — Avg: {latestAssessment.average_score}/10
            {latestAssessment.coach?.full_name && (
              <> — by {latestAssessment.coach.full_name}</>
            )}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <ScoreCell label="Reaction" value={latestAssessment.reaction_to_ball} />
            <ScoreCell label="Swing Size" value={latestAssessment.swing_size} />
            <ScoreCell label="Spacing" value={latestAssessment.spacing_awareness} />
            <ScoreCell label="Recovery" value={latestAssessment.recovery_habit} />
            <ScoreCell label="Decision" value={latestAssessment.decision_making} />
            <ScoreCell label="Average" value={latestAssessment.average_score} highlight />
          </div>
        </div>
      )}

      {/* No assessment — CTA */}
      {!latestAssessment && (
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium mb-1">No discovery assessment yet</p>
          <p className="text-xs text-muted-foreground mb-3">
            Run a discovery session to assess this player.
          </p>
          <Link
            href={`/coach/assess?player=${id}`}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <ClipboardList className="w-4 h-4" />
            Assess Player
          </Link>
        </div>
      )}

      {/* Session History */}
      <SessionHistory
        playerSessions={playerSessions}
        assessments={assessments}
        moduleRecords={moduleRecords}
      />

      {/* Coach Notes */}
      <PlayerNotes
        playerId={id}
        currentCoachId={currentCoachId}
        notes={notes}
      />
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
