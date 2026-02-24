'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getModuleContent } from '@/data/module-content'
import { recordModuleCompletion } from '@/app/actions/module-actions'
import { ScoreSlider } from '@/components/features/score-slider'
import { cn } from '@/lib/utils'
import {
  Target,
  AlertCircle,
  Crosshair,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Lightbulb,
  Loader2,
  ChevronDown,
} from 'lucide-react'

interface ModuleOption {
  id: string
  name: string
  curriculumId: string
  curriculumName: string
  drills: { id: string; name: string }[]
}

interface CoachModeFormProps {
  modules: ModuleOption[]
  preselectedModuleId?: string
  preselectedPlayerId?: string
  preselectedSessionId?: string
}

export function CoachModeForm({
  modules,
  preselectedModuleId,
  preselectedPlayerId,
  preselectedSessionId,
}: CoachModeFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [selectedModuleId, setSelectedModuleId] = useState(preselectedModuleId ?? '')
  const [playerId, setPlayerId] = useState(preselectedPlayerId ?? '')
  const [drillsCompleted, setDrillsCompleted] = useState<string[]>([])
  const [moduleScore, setModuleScore] = useState(5)
  const [notes, setNotes] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedModule = useMemo(
    () => modules.find((m) => m.id === selectedModuleId),
    [modules, selectedModuleId]
  )

  const moduleContent = useMemo(
    () => (selectedModuleId ? getModuleContent(selectedModuleId) : null),
    [selectedModuleId]
  )

  function toggleDrill(drillId: string) {
    setDrillsCompleted((prev) =>
      prev.includes(drillId) ? prev.filter((d) => d !== drillId) : [...prev, drillId]
    )
  }

  function handleModuleChange(moduleId: string) {
    setSelectedModuleId(moduleId)
    setDrillsCompleted([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!selectedModuleId || !selectedModule) {
      setError('Please select a module')
      return
    }
    if (!playerId) {
      setError('Player ID is required. Navigate here from a session or player page.')
      return
    }

    startTransition(async () => {
      const result = await recordModuleCompletion({
        player_id: playerId,
        session_id: preselectedSessionId,
        curriculum_id: selectedModule.curriculumId,
        module_id: selectedModuleId,
        module_score: moduleScore,
        drills_completed: drillsCompleted,
        status: drillsCompleted.length === selectedModule.drills.length ? 'completed' : 'in_progress',
        notes: notes || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          if (playerId) {
            router.push(`/coach/players/${playerId}`)
          } else {
            router.push('/coach')
          }
        }, 1500)
      }
    })
  }

  // Success state
  if (success) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <div>
          <h2 className="text-xl font-bold">Module Recorded!</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedModule?.name} - Score: {moduleScore}/10
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Redirecting...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Module Selection */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <label className="text-sm font-semibold">Select Module</label>
        <div className="relative">
          <select
            value={selectedModuleId}
            onChange={(e) => handleModuleChange(e.target.value)}
            className="w-full min-h-[44px] bg-background border border-border rounded-lg px-3 py-2 pr-10 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Choose a module...</option>
            {modules.map((mod) => (
              <option key={mod.id} value={mod.id}>
                {mod.curriculumName} &rarr; {mod.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Module Content */}
      {moduleContent && (
        <>
          {/* Objective */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Objective</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {moduleContent.objective}
            </p>
          </div>

          {/* Game Problem */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-semibold">Game Problem</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {moduleContent.gameProblem}
            </p>
          </div>

          {/* Technical Focus */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold">Technical Focus</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {moduleContent.technicalFocus}
            </p>
          </div>

          {/* Success Indicators */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <h3 className="text-sm font-semibold">Success Indicators</h3>
            </div>
            <ul className="space-y-2">
              {moduleContent.successIndicators.map((indicator, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-800 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {indicator}
                </li>
              ))}
            </ul>
          </div>

          {/* Cone Setup */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-semibold">Cone Setup</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {moduleContent.coneSetup}
            </p>
          </div>

          {/* Coaching Cues */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-cyan-500" />
              <h3 className="text-sm font-semibold">Coaching Cues</h3>
            </div>
            <ul className="space-y-2">
              {moduleContent.coachingCues.map((cue, i) => (
                <li
                  key={i}
                  className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 italic"
                >
                  &ldquo;{cue}&rdquo;
                </li>
              ))}
            </ul>
          </div>

          {/* Aha Statement */}
          <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-primary">Aha! Statement</h3>
            </div>
            <p className="text-sm leading-relaxed font-medium">
              {moduleContent.ahaStatement}
            </p>
          </div>
        </>
      )}

      {/* Drill Checklist */}
      {selectedModule && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold">
            Drill Checklist ({drillsCompleted.length}/{selectedModule.drills.length})
          </h3>
          <div className="space-y-2">
            {selectedModule.drills.map((drill) => (
              <label
                key={drill.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors min-h-[44px]',
                  drillsCompleted.includes(drill.id)
                    ? 'border-green-300 bg-green-50'
                    : 'border-border bg-background hover:bg-muted/50'
                )}
              >
                <input
                  type="checkbox"
                  checked={drillsCompleted.includes(drill.id)}
                  onChange={() => toggleDrill(drill.id)}
                  className="w-5 h-5 rounded border-border text-green-600 focus:ring-green-500/50 accent-green-600"
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    drillsCompleted.includes(drill.id)
                      ? 'line-through text-muted-foreground'
                      : ''
                  )}
                >
                  {drill.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Module Score */}
      {selectedModule && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-4">
          <ScoreSlider
            label="Module Score"
            description="How well did the player perform on this module overall?"
            value={moduleScore}
            onChange={setModuleScore}
          />
        </div>
      )}

      {/* Notes */}
      {selectedModule && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <label className="text-sm font-semibold">Session Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observations, adjustments made, player feedback..."
            rows={4}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}

      {/* Submit */}
      {selectedModule && (
        <button
          type="submit"
          disabled={isPending || !selectedModuleId}
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
              Saving...
            </>
          ) : (
            'Record Module Completion'
          )}
        </button>
      )}
    </form>
  )
}
