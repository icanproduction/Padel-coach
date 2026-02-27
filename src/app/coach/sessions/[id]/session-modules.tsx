'use client'

import { useState } from 'react'
import { Pencil, BookOpen } from 'lucide-react'
import { getDrillWithContext } from '@/data/curriculum'
import { ModuleSelector } from './module-selector'

interface SessionModulesProps {
  sessionId: string
  selectedModules: string[] // now stores drill IDs
  isCompleted: boolean
}

export function SessionModules({ sessionId, selectedModules, isCompleted }: SessionModulesProps) {
  const [showSelector, setShowSelector] = useState(false)

  // Group selected drills by module
  const moduleMap = new Map<string, { moduleName: string; drills: { id: string; name: string }[] }>()
  for (const drillId of selectedModules) {
    const ctx = getDrillWithContext(drillId)
    if (!ctx) continue
    if (!moduleMap.has(ctx.module.id)) {
      moduleMap.set(ctx.module.id, { moduleName: ctx.module.name, drills: [] })
    }
    moduleMap.get(ctx.module.id)!.drills.push({ id: ctx.drill.id, name: ctx.drill.name })
  }

  return (
    <>
      <div className="bg-card rounded-xl border border-border px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Drills
          </h2>
          {!isCompleted && (
            <button
              onClick={() => setShowSelector(true)}
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              {selectedModules.length > 0 ? (
                <>
                  <Pencil className="w-3 h-3" />
                  Edit
                </>
              ) : (
                <>
                  <BookOpen className="w-3 h-3" />
                  Pilih Drills
                </>
              )}
            </button>
          )}
        </div>

        {moduleMap.size === 0 ? (
          <p className="text-xs text-muted-foreground">Belum ada drills dipilih.</p>
        ) : (
          <div className="space-y-3">
            {Array.from(moduleMap.entries()).map(([moduleId, group]) => (
              <div key={moduleId}>
                <p className="text-[10px] font-semibold text-muted-foreground mb-1">{group.moduleName}</p>
                <div className="flex flex-wrap gap-1">
                  {group.drills.map(drill => (
                    <span
                      key={drill.id}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary"
                    >
                      {drill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showSelector && (
        <ModuleSelector
          sessionId={sessionId}
          initialSelected={selectedModules}
          onClose={() => setShowSelector(false)}
        />
      )}
    </>
  )
}
