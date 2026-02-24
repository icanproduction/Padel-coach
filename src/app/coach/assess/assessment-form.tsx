'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ScoreSlider } from '@/components/features/score-slider'
import { GradeBadge } from '@/components/features/grade-badge'
import { ArchetypeBadge } from '@/components/features/archetype-badge'
import {
  calculateAverageScore,
  calculateGrade,
  determineArchetype,
  recommendModules,
} from '@/lib/assessment-engine'
import { createAssessment } from '@/app/actions/assessment-actions'
import { ASSESSMENT_PARAMETERS, SCORING_GUIDE } from '@/types/database'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, CheckCircle2, Loader2, Info } from 'lucide-react'

interface Player {
  id: string
  full_name: string
  avatar_url: string | null
}

interface SessionOption {
  id: string
  date: string
  session_type: string
  status: string
}

interface AssessmentFormProps {
  players: Player[]
  sessions: SessionOption[]
  preselectedPlayerId?: string
  preselectedSessionId?: string
}

export function AssessmentForm({
  players,
  sessions,
  preselectedPlayerId,
  preselectedSessionId,
}: AssessmentFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form state
  const [playerId, setPlayerId] = useState(preselectedPlayerId ?? '')
  const [sessionId, setSessionId] = useState(preselectedSessionId ?? '')
  const [scores, setScores] = useState({
    reaction_to_ball: 5,
    swing_size: 5,
    spacing_awareness: 5,
    recovery_habit: 5,
    decision_making: 5,
  })
  const [improvementNotes, setImprovementNotes] = useState('')
  const [areasToFocus, setAreasToFocus] = useState<string[]>([])
  const [showScoringGuide, setShowScoringGuide] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Live preview calculations
  const livePreview = useMemo(() => {
    const avgScore = calculateAverageScore(scores)
    const grade = calculateGrade(avgScore)
    const archetype = determineArchetype(scores)
    const recommendations = recommendModules(scores)
    return { avgScore, grade, archetype, recommendations }
  }, [scores])

  function updateScore(key: string, value: number) {
    setScores((prev) => ({ ...prev, [key]: value }))
  }

  function toggleAreaToFocus(key: string) {
    setAreasToFocus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!playerId) {
      setError('Please select a player')
      return
    }

    startTransition(async () => {
      const result = await createAssessment({
        player_id: playerId,
        session_id: sessionId || undefined,
        reaction_to_ball: scores.reaction_to_ball,
        swing_size: scores.swing_size,
        spacing_awareness: scores.spacing_awareness,
        recovery_habit: scores.recovery_habit,
        decision_making: scores.decision_making,
        average_score: livePreview.avgScore,
        player_grade: livePreview.grade,
        player_archetype: livePreview.archetype,
        improvement_notes: improvementNotes || undefined,
        areas_to_focus: areasToFocus.length > 0 ? areasToFocus : undefined,
        recommended_next_modules: livePreview.recommendations.map((r) => r.moduleId),
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        // Redirect to player detail after a brief moment
        setTimeout(() => {
          router.push(`/coach/players/${playerId}`)
        }, 1500)
      }
    })
  }

  // Success state
  if (success) {
    const selectedPlayer = players.find((p) => p.id === playerId)
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <div>
          <h2 className="text-xl font-bold">Assessment Saved!</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedPlayer?.full_name} has been assessed as{' '}
            <strong>{livePreview.grade}</strong> ({livePreview.archetype})
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Redirecting to player profile...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Player Selection */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <label className="text-sm font-semibold">Select Player *</label>
        <select
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          className="w-full min-h-[44px] bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
        >
          <option value="">Choose a player...</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.full_name}
            </option>
          ))}
        </select>

        {/* Optional Session Link */}
        {sessions.length > 0 && (
          <div>
            <label className="text-xs text-muted-foreground font-medium">
              Link to Session (optional)
            </label>
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-full min-h-[44px] bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mt-1"
            >
              <option value="">No session linked</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {new Date(session.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}{' '}
                  - {session.session_type.replace('_', ' ')} ({session.status.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Scoring Guide (Expandable) */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setShowScoringGuide(!showScoringGuide)}
          className="w-full flex items-center justify-between p-4 min-h-[44px] text-left"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Scoring Guide</span>
          </div>
          {showScoringGuide ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {showScoringGuide && (
          <div className="px-4 pb-4 pt-0 space-y-2">
            {SCORING_GUIDE.map((guide) => (
              <div
                key={guide.range}
                className="flex items-center gap-3 text-sm"
              >
                <span className="font-mono font-bold text-primary w-10 text-center">
                  {guide.range}
                </span>
                <span className="text-muted-foreground">{guide.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Score Sliders */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-6">
        <h2 className="text-sm font-semibold">Assessment Scores</h2>
        {ASSESSMENT_PARAMETERS.map((param) => (
          <ScoreSlider
            key={param.key}
            label={param.label}
            description={param.description}
            value={scores[param.key as keyof typeof scores]}
            onChange={(value) => updateScore(param.key, value)}
          />
        ))}
      </div>

      {/* LIVE PREVIEW */}
      <div className="bg-card rounded-xl border-2 border-primary/30 p-4 space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live Preview
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {/* Average Score */}
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <p className="text-[10px] text-muted-foreground font-medium">Average</p>
            <p className="text-2xl font-bold text-primary">{livePreview.avgScore}</p>
          </div>

          {/* Grade */}
          <div className="bg-muted/50 rounded-lg p-3 flex flex-col items-center justify-center">
            <p className="text-[10px] text-muted-foreground font-medium mb-1">Grade</p>
            <GradeBadge grade={livePreview.grade} size="sm" showLabel={false} />
          </div>

          {/* Archetype */}
          <div className="bg-muted/50 rounded-lg p-3 flex flex-col items-center justify-center">
            <p className="text-[10px] text-muted-foreground font-medium mb-1">Archetype</p>
            <ArchetypeBadge archetype={livePreview.archetype} size="sm" />
          </div>
        </div>

        {/* Recommended Modules */}
        {livePreview.recommendations.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground font-medium mb-2">
              Recommended Modules
            </p>
            <div className="space-y-1.5">
              {livePreview.recommendations.map((rec) => (
                <div
                  key={rec.moduleId}
                  className="flex items-start gap-2 text-xs"
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                      rec.priority === 'high'
                        ? 'bg-red-500'
                        : rec.priority === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    )}
                  />
                  <div>
                    <span className="font-medium">{rec.moduleName}</span>
                    <span className="text-muted-foreground ml-1">({rec.curriculumName})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Improvement Notes */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <label className="text-sm font-semibold">Improvement Notes</label>
        <textarea
          value={improvementNotes}
          onChange={(e) => setImprovementNotes(e.target.value)}
          placeholder="Notes on what the player should work on, observations from the session..."
          rows={4}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Areas to Focus */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <label className="text-sm font-semibold">Areas to Focus</label>
        <p className="text-xs text-muted-foreground">
          Select the areas this player should prioritize
        </p>
        <div className="space-y-2">
          {ASSESSMENT_PARAMETERS.map((param) => (
            <label
              key={param.key}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors min-h-[44px]',
                areasToFocus.includes(param.key)
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background hover:bg-muted/50'
              )}
            >
              <input
                type="checkbox"
                checked={areasToFocus.includes(param.key)}
                onChange={() => toggleAreaToFocus(param.key)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/50 accent-primary"
              />
              <div>
                <span className="text-sm font-medium">{param.label}</span>
                <p className="text-xs text-muted-foreground">{param.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || !playerId}
        className={cn(
          'w-full min-h-[52px] rounded-xl font-semibold text-base transition-all',
          'bg-primary text-primary-foreground hover:opacity-90',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2'
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving Assessment...
          </>
        ) : (
          'Submit Assessment'
        )}
      </button>
    </form>
  )
}
