'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  GraduationCap,
  CircleDot,
  ExternalLink,
} from 'lucide-react'

interface Drill {
  id: string
  name: string
}

interface Module {
  id: string
  name: string
  drills: Drill[]
}

interface CurriculumData {
  id: string
  name: string
  description: string
  modules: Module[]
}

interface CurriculumAccordionProps {
  curriculums: CurriculumData[]
}

export function CurriculumAccordion({ curriculums }: CurriculumAccordionProps) {
  const [expandedCurriculums, setExpandedCurriculums] = useState<Set<string>>(new Set())
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  function toggleCurriculum(id: string) {
    setExpandedCurriculums((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleModule(id: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const CURRICULUM_COLORS = [
    'border-l-blue-500',
    'border-l-orange-500',
    'border-l-green-500',
    'border-l-purple-500',
    'border-l-red-500',
    'border-l-cyan-500',
  ]

  return (
    <div className="space-y-3">
      {curriculums.map((curriculum, index) => {
        const isExpanded = expandedCurriculums.has(curriculum.id)
        const colorClass = CURRICULUM_COLORS[index % CURRICULUM_COLORS.length]

        return (
          <div
            key={curriculum.id}
            className={cn(
              'bg-card rounded-xl border border-border overflow-hidden border-l-4',
              colorClass
            )}
          >
            {/* Curriculum Header */}
            <button
              onClick={() => toggleCurriculum(curriculum.id)}
              className="w-full flex items-start justify-between p-4 min-h-[44px] text-left"
            >
              <div className="flex items-start gap-3 flex-1">
                <BookOpen className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">{curriculum.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {curriculum.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {curriculum.modules.length} modules &middot;{' '}
                    {curriculum.modules.reduce((acc, m) => acc + m.drills.length, 0)} drills
                  </p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
              )}
            </button>

            {/* Modules */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-2">
                {curriculum.modules.map((module, moduleIndex) => {
                  const isModuleExpanded = expandedModules.has(module.id)

                  return (
                    <div
                      key={module.id}
                      className="bg-muted/30 rounded-lg border border-border overflow-hidden"
                    >
                      {/* Module Header */}
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between p-3 min-h-[44px] text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {moduleIndex + 1}
                          </span>
                          <div>
                            <span className="text-sm font-medium">{module.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {module.drills.length} drills
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/coach/assess/coach-mode?module=${module.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[10px] text-primary font-medium hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Guide
                          </Link>
                          {isModuleExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {/* Drills */}
                      {isModuleExpanded && (
                        <div className="px-3 pb-3 space-y-1.5">
                          {module.drills.map((drill, drillIndex) => (
                            <div
                              key={drill.id}
                              className="flex items-center gap-2.5 pl-8 py-1.5"
                            >
                              <CircleDot className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs text-muted-foreground">
                                {drillIndex + 1}. {drill.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
