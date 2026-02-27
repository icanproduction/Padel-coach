'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { ArrowLeft, Loader2, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CURRICULUMS } from '@/data/curriculum'
import { saveSessionModules } from '@/app/actions/session-actions'

interface ModuleSelectorProps {
  sessionId: string
  initialSelected: string[]
  onClose: () => void
}

export function ModuleSelector({ sessionId, initialSelected, onClose }: ModuleSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected))
  const [isPending, startTransition] = useTransition()
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

  function toggleModule(moduleId: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
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
          Back and Save
        </button>
        <h1 className="text-base font-semibold flex-1 text-right">Select Modules</h1>
        <span className="text-xs text-muted-foreground">{selected.size} selected</span>
      </div>

      {/* Curriculum list */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-6">
          {CURRICULUMS.map(curriculum => (
            <div key={curriculum.id}>
              <h3 className="text-sm font-semibold mb-3">{curriculum.name}</h3>
              <div className="space-y-2">
                {curriculum.modules.map(mod => {
                  const isSelected = selected.has(mod.id)
                  return (
                    <button
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      disabled={isPending}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card hover:bg-muted/50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground/30'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{mod.name}</p>
                        <p className="text-xs text-muted-foreground">{mod.drills.length} drills</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
