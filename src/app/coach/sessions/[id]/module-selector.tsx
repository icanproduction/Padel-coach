'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { ArrowLeft, Loader2, Check } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState(0)
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

  function handleBack() {
    if (isPending) return
    saveAndClose(selected)
  }

  const activeCurriculum = CURRICULUMS[activeTab]

  // Split 6 curriculums into 2 rows of 3
  const row1 = CURRICULUMS.slice(0, 3)
  const row2 = CURRICULUMS.slice(3, 6)

  function TabButton({ curriculum, index }: { curriculum: typeof CURRICULUMS[0]; index: number }) {
    const drillCount = curriculum.modules.flatMap(m => m.drills).filter(d => selected.has(d.id)).length
    const isActive = activeTab === index
    return (
      <button
        onClick={() => setActiveTab(index)}
        className={`flex-1 px-2 py-2 text-[11px] font-medium text-center rounded-lg border transition-colors relative ${
          isActive
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border bg-card text-muted-foreground hover:text-foreground'
        }`}
      >
        <span className="line-clamp-1">{curriculum.name.split('(')[0].trim()}</span>
        {drillCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[9px] font-bold bg-primary text-primary-foreground rounded-full px-1">
            {drillCount}
          </span>
        )}
      </button>
    )
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

      {/* 2-row tab grid: 3 per row */}
      <div className="bg-card border-b border-border px-3 py-2.5 space-y-1.5">
        <div className="flex gap-1.5">
          {row1.map((c, i) => (
            <TabButton key={c.id} curriculum={c} index={i} />
          ))}
        </div>
        <div className="flex gap-1.5">
          {row2.map((c, i) => (
            <TabButton key={c.id} curriculum={c} index={i + 3} />
          ))}
        </div>
      </div>

      {/* Drills list for active curriculum */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
          {activeCurriculum.modules.map(mod => {
            const drillIds = mod.drills.map(d => d.id)
            const selectedCount = drillIds.filter(id => selected.has(id)).length
            const allSelected = selectedCount === drillIds.length

            return (
              <div key={mod.id}>
                {/* Module header — tap to toggle all */}
                <button
                  onClick={() => toggleModule(mod.id, drillIds)}
                  disabled={isPending}
                  className="flex items-center gap-2 mb-2 w-full text-left"
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    allSelected
                      ? 'border-primary bg-primary'
                      : selectedCount > 0
                        ? 'border-primary bg-primary/30'
                        : 'border-muted-foreground/30'
                  }`}>
                    {allSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                  </div>
                  <span className="text-sm font-semibold">{mod.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {selectedCount}/{drillIds.length}
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
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-colors text-left ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-card hover:bg-muted/50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground/30'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                        </div>
                        <span className="text-xs font-medium">{drill.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Extra scroll space so bottom drills are reachable above nav */}
          <div className="h-32" />
        </div>
      </div>
    </div>
  )
}
