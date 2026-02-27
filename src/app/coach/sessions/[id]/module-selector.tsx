'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { ArrowLeft, Loader2, Check, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CURRICULUMS } from '@/data/curriculum'
import { saveSessionModules } from '@/app/actions/session-actions'

interface ModuleSelectorProps {
  sessionId: string
  initialSelected: string[] // drill IDs
  onClose: () => void
}

export function ModuleSelector({ sessionId, initialSelected, onClose }: ModuleSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected))
  const [isPending, startTransition] = useTransition()
  const [expandedCurriculums, setExpandedCurriculums] = useState<Set<string>>(() => {
    // Auto-expand curriculums that have selected drills
    const expanded = new Set<string>()
    for (const c of CURRICULUMS) {
      if (c.modules.some(m => m.drills.some(d => initialSelected.includes(d.id)))) {
        expanded.add(c.id)
      }
    }
    return expanded
  })
  const router = useRouter()
  const savingRef = useRef(false)

  const saveAndClose = useCallback((currentSelected: Set<string>) => {
    if (savingRef.current) return
    savingRef.current = true
    startTransition(async () => {
      await saveSessionModules(sessionId, Array.from(currentSelected))
      router.refresh()
      onClose()
    })
  }, [sessionId, onClose, router, startTransition])

  function toggleDrill(drillId: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(drillId)) {
        next.delete(drillId)
      } else {
        next.add(drillId)
      }
      return next
    })
  }

  function toggleModule(moduleId: string, drillIds: string[]) {
    setSelected(prev => {
      const next = new Set(prev)
      const allSelected = drillIds.every(id => next.has(id))
      if (allSelected) {
        drillIds.forEach(id => next.delete(id))
      } else {
        drillIds.forEach(id => next.add(id))
      }
      return next
    })
  }

  function toggleCurriculum(curriculumId: string) {
    setExpandedCurriculums(prev => {
      const next = new Set(prev)
      if (next.has(curriculumId)) {
        next.delete(curriculumId)
      } else {
        next.add(curriculumId)
      }
      return next
    })
  }

  function handleBack() {
    if (isPending) return
    saveAndClose(selected)
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border bg-card">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 p-1.5 -ml-1.5 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ArrowLeft className="w-5 h-5" />
          )}
        </button>
        <h1 className="text-base font-semibold flex-1">Pilih Drills</h1>
        <span className="text-xs text-muted-foreground font-medium">{selected.size} dipilih</span>
      </div>

      {/* Scrollable curriculum cards */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-4 pb-32 space-y-3">
          {CURRICULUMS.map(curriculum => {
            const allDrills = curriculum.modules.flatMap(m => m.drills)
            const selectedCount = allDrills.filter(d => selected.has(d.id)).length
            const isExpanded = expandedCurriculums.has(curriculum.id)

            return (
              <div key={curriculum.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Curriculum header — tap to expand/collapse */}
                <button
                  onClick={() => toggleCurriculum(curriculum.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{curriculum.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {curriculum.modules.length} modules &middot; {allDrills.length} drills
                    </p>
                  </div>
                  {selectedCount > 0 && (
                    <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0">
                      {selectedCount}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Expanded: modules & drills */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
                    {curriculum.modules.map(mod => {
                      const drillIds = mod.drills.map(d => d.id)
                      const modSelectedCount = drillIds.filter(id => selected.has(id)).length
                      const allSelected = modSelectedCount === drillIds.length

                      return (
                        <div key={mod.id}>
                          {/* Module header — tap to toggle all drills */}
                          <button
                            onClick={() => toggleModule(mod.id, drillIds)}
                            disabled={isPending}
                            className="flex items-center gap-2 mb-2 w-full text-left"
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              allSelected
                                ? 'border-primary bg-primary'
                                : modSelectedCount > 0
                                  ? 'border-primary bg-primary/30'
                                  : 'border-muted-foreground/30'
                            }`}>
                              {allSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                            </div>
                            <span className="text-xs font-semibold flex-1">{mod.name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {modSelectedCount}/{drillIds.length}
                            </span>
                          </button>

                          {/* Individual drills */}
                          <div className="space-y-1.5 ml-6">
                            {mod.drills.map(drill => {
                              const isSelected = selected.has(drill.id)
                              return (
                                <button
                                  key={drill.id}
                                  onClick={() => toggleDrill(drill.id)}
                                  disabled={isPending}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors text-left ${
                                    isSelected
                                      ? 'border-primary bg-primary/5'
                                      : 'border-border hover:bg-muted/50'
                                  }`}
                                >
                                  <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                    isSelected
                                      ? 'border-primary bg-primary'
                                      : 'border-muted-foreground/30'
                                  }`}>
                                    {isSelected && <Check className="w-2 h-2 text-primary-foreground" />}
                                  </div>
                                  <span className="text-xs font-medium">{drill.name}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
