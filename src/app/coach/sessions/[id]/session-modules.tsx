'use client'

import { useState } from 'react'
import { Pencil, BookOpen } from 'lucide-react'
import { getModuleById, getCurriculumByModuleId } from '@/data/curriculum'
import { ModuleSelector } from './module-selector'

interface SessionModulesProps {
  sessionId: string
  selectedModules: string[]
  isCompleted: boolean
}

export function SessionModules({ sessionId, selectedModules, isCompleted }: SessionModulesProps) {
  const [showSelector, setShowSelector] = useState(false)

  // Resolve module names
  const moduleInfo = selectedModules
    .map(id => {
      const mod = getModuleById(id)
      const curriculum = getCurriculumByModuleId(id)
      return mod ? { id: mod.id, name: mod.name, curriculumName: curriculum?.name ?? '' } : null
    })
    .filter(Boolean) as { id: string; name: string; curriculumName: string }[]

  return (
    <>
      <div className="bg-card rounded-xl border border-border px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Modules
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
                  Select Modules
                </>
              )}
            </button>
          )}
        </div>

        {moduleInfo.length === 0 ? (
          <p className="text-xs text-muted-foreground">No modules selected yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {moduleInfo.map(mod => (
              <span
                key={mod.id}
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary"
              >
                {mod.name}
              </span>
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
