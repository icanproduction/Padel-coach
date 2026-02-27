'use client'

import { useState, useTransition, useMemo } from 'react'
import { ArrowLeft, ArrowRight, Loader2, ChevronDown, Target, AlertCircle, Crosshair, CheckCircle2, MapPin, MessageCircle, Lightbulb } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getModuleById, getCurriculumByModuleId } from '@/data/curriculum'
import { getModuleContent } from '@/data/module-content'
import { saveCoachingScores } from '@/app/actions/coaching-actions'
import { ScoreSlider } from '@/components/features/score-slider'

interface Player {
  id: string
  name: string
  avatar_url: string | null
}

interface ExistingModuleRecord {
  player_id: string
  module_id: string
  drill_scores: Record<string, number> | null
}

interface CoachingModeProps {
  sessionId: string
  selectedModules: string[]
  players: Player[]
  existingRecords: ExistingModuleRecord[]
  onClose: () => void
}

interface DrillStep {
  moduleId: string
  moduleName: string
  curriculumName: string
  curriculumId: string
  drillId: string
  drillName: string
  drillIndexInModule: number // 0, 1, 2
  totalDrillsInModule: number
}

interface PlayerDrillScore {
  score: number
  notes: string
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function CoachingMode({
  sessionId,
  selectedModules,
  players,
  existingRecords,
  onClose,
}: CoachingModeProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Build flat drill steps from selected modules
  const drillSteps = useMemo<DrillStep[]>(() => {
    const steps: DrillStep[] = []
    for (const moduleId of selectedModules) {
      const mod = getModuleById(moduleId)
      const curriculum = getCurriculumByModuleId(moduleId)
      if (!mod || !curriculum) continue
      for (let i = 0; i < mod.drills.length; i++) {
        steps.push({
          moduleId: mod.id,
          moduleName: mod.name,
          curriculumName: curriculum.name,
          curriculumId: curriculum.id,
          drillId: mod.drills[i].id,
          drillName: mod.drills[i].name,
          drillIndexInModule: i,
          totalDrillsInModule: mod.drills.length,
        })
      }
    }
    return steps
  }, [selectedModules])

  const [currentStep, setCurrentStep] = useState(0)
  const [phase, setPhase] = useState<'drill' | 'summary'>('drill')

  // All scores: drillId -> playerId -> { score, notes }
  const [allScores, setAllScores] = useState<Record<string, Record<string, PlayerDrillScore>>>(() => {
    const initial: Record<string, Record<string, PlayerDrillScore>> = {}
    for (const step of drillSteps) {
      initial[step.drillId] = {}
      for (const player of players) {
        // Pre-fill from existing records
        const existing = existingRecords.find(
          r => r.player_id === player.id && r.module_id === step.moduleId
        )
        initial[step.drillId][player.id] = {
          score: existing?.drill_scores?.[step.drillId] ?? 5,
          notes: '',
        }
      }
    }
    return initial
  })

  const current = drillSteps[currentStep]
  const isLastDrill = currentStep === drillSteps.length - 1
  const isFirstDrill = currentStep === 0
  const moduleContent = current ? getModuleContent(current.moduleId) : null
  const isFirstDrillOfModule = current?.drillIndexInModule === 0

  function setPlayerScore(drillId: string, playerId: string, score: number) {
    setAllScores(prev => ({
      ...prev,
      [drillId]: {
        ...prev[drillId],
        [playerId]: { ...prev[drillId]?.[playerId], score },
      },
    }))
  }

  function setPlayerNotes(drillId: string, playerId: string, notes: string) {
    setAllScores(prev => ({
      ...prev,
      [drillId]: {
        ...prev[drillId],
        [playerId]: { ...prev[drillId]?.[playerId], notes },
      },
    }))
  }

  function handleNext() {
    if (isLastDrill) {
      setPhase('summary')
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  function handleBackFromSummary() {
    setPhase('drill')
  }

  function handleSaveAll() {
    startTransition(async () => {
      // Build payload per player
      for (const player of players) {
        const modulesMap = new Map<string, { curriculum_id: string; module_id: string; drill_scores: Record<string, number> }>()

        for (const step of drillSteps) {
          const key = step.moduleId
          if (!modulesMap.has(key)) {
            modulesMap.set(key, {
              curriculum_id: step.curriculumId,
              module_id: step.moduleId,
              drill_scores: {},
            })
          }
          const playerScore = allScores[step.drillId]?.[player.id]
          if (playerScore) {
            modulesMap.get(key)!.drill_scores[step.drillId] = playerScore.score
          }
        }

        await saveCoachingScores({
          session_id: sessionId,
          player_id: player.id,
          modules: Array.from(modulesMap.values()),
        })
      }

      router.refresh()
      onClose()
    })
  }

  // --- SUMMARY VIEW ---
  if (phase === 'summary') {
    // Group by module
    const moduleGroups = new Map<string, { moduleName: string; drills: DrillStep[] }>()
    for (const step of drillSteps) {
      if (!moduleGroups.has(step.moduleId)) {
        moduleGroups.set(step.moduleId, { moduleName: step.moduleName, drills: [] })
      }
      moduleGroups.get(step.moduleId)!.drills.push(step)
    }

    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border bg-card">
          <button
            type="button"
            onClick={handleBackFromSummary}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold flex-1">Session Summary</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
            {Array.from(moduleGroups.entries()).map(([moduleId, group]) => (
              <div key={moduleId} className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-sm font-semibold mb-3">{group.moduleName}</h3>
                {group.drills.map(drill => (
                  <div key={drill.drillId} className="mb-3 last:mb-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">{drill.drillName}</p>
                    <div className="flex flex-wrap gap-2">
                      {players.map(player => {
                        const score = allScores[drill.drillId]?.[player.id]?.score ?? 5
                        return (
                          <span key={player.id} className="inline-flex items-center gap-1.5 text-xs bg-muted px-2 py-1 rounded-lg">
                            <span className="font-medium">{player.name.split(' ')[0]}</span>
                            <span className="font-bold text-primary">{score}</span>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {/* Module avg per player */}
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[10px] text-muted-foreground font-medium mb-1.5">Module Average</p>
                  <div className="flex flex-wrap gap-2">
                    {players.map(player => {
                      const drillScores = group.drills.map(d => allScores[d.drillId]?.[player.id]?.score ?? 5)
                      const avg = (drillScores.reduce((a, b) => a + b, 0) / drillScores.length).toFixed(1)
                      return (
                        <span key={player.id} className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg font-medium">
                          {player.name.split(' ')[0]}: {avg}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleSaveAll}
                disabled={isPending}
                className="w-full py-3.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending ? 'Saving...' : 'Save & Complete'}
              </button>
              <button
                onClick={onClose}
                className="w-full py-3.5 text-sm font-medium rounded-xl border border-border hover:bg-muted transition-colors"
              >
                Back to Session
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- DRILL VIEW ---
  if (!current) return null

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border bg-card">
        <button
          type="button"
          onClick={isFirstDrill ? onClose : handlePrev}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center">
          <span className="text-xs text-muted-foreground">
            Drill {currentStep + 1} of {drillSteps.length}
          </span>
        </div>
        <div className="w-8" /> {/* spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
          {/* Drill header */}
          <div>
            <p className="text-xs text-muted-foreground font-medium">{current.curriculumName} &rsaquo; {current.moduleName}</p>
            <h2 className="text-lg font-bold mt-1">{current.drillName}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Drill {current.drillIndexInModule + 1} of {current.totalDrillsInModule} in this module
            </p>
          </div>

          {/* Module guide — 2-column grid */}
          {moduleContent && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <CollapsibleSection icon={<Target className="w-3.5 h-3.5 text-primary" />} title="Objective">
                  <p className="text-sm text-muted-foreground leading-relaxed">{moduleContent.objective}</p>
                </CollapsibleSection>
                <CollapsibleSection icon={<AlertCircle className="w-3.5 h-3.5 text-orange-500" />} title="Game Problem">
                  <p className="text-sm text-muted-foreground leading-relaxed">{moduleContent.gameProblem}</p>
                </CollapsibleSection>
                <CollapsibleSection icon={<Crosshair className="w-3.5 h-3.5 text-blue-500" />} title="Technical Focus">
                  <p className="text-sm text-muted-foreground leading-relaxed">{moduleContent.technicalFocus}</p>
                </CollapsibleSection>
                <CollapsibleSection icon={<CheckCircle2 className="w-3.5 h-3.5 text-green-500" />} title="Success Indicators">
                  <ul className="space-y-1">
                    {moduleContent.successIndicators.map((ind, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-xs text-green-600 mt-0.5">{i + 1}.</span>
                        {ind}
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
                <CollapsibleSection icon={<MapPin className="w-3.5 h-3.5 text-purple-500" />} title="Cone Setup">
                  <p className="text-sm text-muted-foreground leading-relaxed">{moduleContent.coneSetup}</p>
                </CollapsibleSection>
                <CollapsibleSection icon={<MessageCircle className="w-3.5 h-3.5 text-cyan-500" />} title="Coaching Cues">
                  <ul className="space-y-1.5">
                    {moduleContent.coachingCues.map((cue, i) => (
                      <li key={i} className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5 italic">
                        &ldquo;{cue}&rdquo;
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              </div>

              {/* Aha Statement — always visible */}
              <div className="bg-primary/5 rounded-xl border border-primary/20 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">Aha!</span>
                </div>
                <p className="text-sm leading-relaxed font-medium">{moduleContent.ahaStatement}</p>
              </div>
            </div>
          )}

          {/* Score Players */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Score Players
            </h3>
            <div className="space-y-4">
              {players.map(player => {
                const drillScore = allScores[current.drillId]?.[player.id] ?? { score: 5, notes: '' }
                return (
                  <div key={player.id} className="bg-card rounded-xl border border-border p-4">
                    {/* Player header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0 overflow-hidden">
                        {player.avatar_url ? (
                          <img src={player.avatar_url} alt={player.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          getInitials(player.name)
                        )}
                      </div>
                      <span className="text-sm font-medium">{player.name}</span>
                    </div>

                    {/* Score slider */}
                    <ScoreSlider
                      label="Score"
                      value={drillScore.score}
                      onChange={val => setPlayerScore(current.drillId, player.id, val)}
                    />

                    {/* Notes */}
                    <textarea
                      value={drillScore.notes}
                      onChange={e => setPlayerNotes(current.drillId, player.id, e.target.value)}
                      placeholder="Notes (optional)..."
                      rows={1}
                      className="w-full mt-3 bg-background border border-border rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Next Drill / View Summary button */}
          <button
            onClick={handleNext}
            className="w-full py-3.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {isLastDrill ? 'View Summary' : (
              <>
                Next Drill
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Collapsible section — closed by default
function CollapsibleSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
      >
        {icon}
        <span className="text-xs font-semibold flex-1">{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  )
}
