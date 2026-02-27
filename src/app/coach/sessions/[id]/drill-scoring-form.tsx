'use client'

import { useState, useTransition } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getModuleById, getCurriculumByModuleId } from '@/data/curriculum'
import { saveCoachingScores } from '@/app/actions/coaching-actions'
import { ScoreSlider } from '@/components/features/score-slider'

interface ExistingRecord {
  module_id: string
  drill_scores: Record<string, number> | null
}

interface DrillScoringFormProps {
  sessionId: string
  playerId: string
  playerName: string
  selectedModules: string[]
  existingRecords: ExistingRecord[]
  onClose: () => void
}

export function DrillScoringForm({
  sessionId,
  playerId,
  playerName,
  selectedModules,
  existingRecords,
  onClose,
}: DrillScoringFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Build module info from curriculum data
  const modules = selectedModules
    .map(moduleId => {
      const mod = getModuleById(moduleId)
      const curriculum = getCurriculumByModuleId(moduleId)
      if (!mod || !curriculum) return null
      return { ...mod, curriculumId: curriculum.id, curriculumName: curriculum.name }
    })
    .filter(Boolean) as {
      id: string
      name: string
      curriculumId: string
      curriculumName: string
      drills: { id: string; name: string }[]
    }[]

  // State: { drillId: score } for all drills across all modules
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    for (const mod of modules) {
      const existing = existingRecords.find(r => r.module_id === mod.id)
      for (const drill of mod.drills) {
        initial[drill.id] = existing?.drill_scores?.[drill.id] ?? 5
      }
    }
    return initial
  })

  function getModuleAvg(drillIds: string[]): string {
    const filled = drillIds.map(id => scores[id]).filter((v): v is number => typeof v === 'number')
    if (filled.length === 0) return '—'
    return (filled.reduce((a, b) => a + b, 0) / filled.length).toFixed(1)
  }

  function handleSave() {
    startTransition(async () => {
      const modulesPayload = modules
        .map(mod => {
          const drillScores: Record<string, number> = {}
          for (const drill of mod.drills) {
            drillScores[drill.id] = scores[drill.id] ?? 5
          }
          return {
            curriculum_id: mod.curriculumId,
            module_id: mod.id,
            drill_scores: drillScores,
          }
        })

      const result = await saveCoachingScores({
        session_id: sessionId,
        player_id: playerId,
        modules: modulesPayload,
      })

      if (!result.error) {
        onClose()
        router.refresh()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border bg-card">
        <button
          type="button"
          onClick={() => !isPending && onClose()}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold truncate">Score: {playerName}</h1>
        </div>
      </div>

      {/* Drill list */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-6">
          {modules.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">No modules selected for this session.</p>
            </div>
          ) : (
            modules.map(mod => {
              const drillIds = mod.drills.map(d => d.id)
              const avg = getModuleAvg(drillIds)

              return (
                <div key={mod.id}>
                  {/* Module header */}
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold">{mod.name}</h3>
                    <span className="text-xs font-medium text-primary">
                      Avg: {avg}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{mod.curriculumName}</p>

                  {/* Drills with sliders */}
                  <div className="space-y-3">
                    {mod.drills.map(drill => (
                      <div
                        key={drill.id}
                        className="p-3 rounded-xl border border-border bg-card"
                      >
                        <ScoreSlider
                          label={drill.name}
                          value={scores[drill.id] ?? 5}
                          onChange={val => setScores(prev => ({ ...prev, [drill.id]: val }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Save button */}
      <div className="p-4 border-t border-border bg-card">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full py-3.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? 'Saving...' : 'Save Scores'}
        </button>
      </div>
    </div>
  )
}
