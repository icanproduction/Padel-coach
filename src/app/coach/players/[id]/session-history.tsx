'use client'

import Link from 'next/link'
import { Calendar, Clock, Target, ClipboardList } from 'lucide-react'
import { getModuleById } from '@/data/curriculum'

interface SessionRecord {
  session_id: string
  status: string
  session: {
    id: string
    date: string
    session_type: string
    status: string
    coach: {
      id: string
      full_name: string
    }
  }
}

interface Assessment {
  id: string
  session_id: string | null
  average_score: number
  player_grade: string
}

interface ModuleRecord {
  session_id: string | null
  module_id: string
  module_score: number | null
}

interface SessionHistoryProps {
  playerSessions: SessionRecord[]
  assessments: Assessment[]
  moduleRecords: ModuleRecord[]
}

const TYPE_LABELS: Record<string, string> = {
  discovery: 'Discovery',
  coaching_drilling: 'Coaching & Drilling',
  open_play: 'Open Play',
}

const TYPE_STYLES: Record<string, string> = {
  discovery: 'bg-purple-100 text-purple-800',
  coaching_drilling: 'bg-blue-100 text-blue-800',
  open_play: 'bg-green-100 text-green-800',
}

export function SessionHistory({ playerSessions, assessments, moduleRecords }: SessionHistoryProps) {
  if (playerSessions.length === 0) {
    return (
      <div>
        <h2 className="text-base font-semibold mb-3">Session History</h2>
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <p className="text-xs text-muted-foreground">No sessions yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-base font-semibold mb-3">Session History</h2>
      <div className="space-y-3">
        {playerSessions.map(ps => {
          const s = ps.session
          if (!s) return null

          const sessionDate = new Date(s.date)
          const dateStr = sessionDate.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          })
          const timeStr = sessionDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          })

          // Type-specific info
          const isDiscovery = s.session_type === 'discovery'
          const isCoaching = s.session_type === 'coaching_drilling'

          // Find assessment for this session (discovery)
          const sessionAssessment = isDiscovery
            ? assessments.find(a => a.session_id === s.id)
            : null

          // Find module records for this session (coaching)
          const sessionModules = isCoaching
            ? moduleRecords.filter(r => r.session_id === s.id)
            : []

          return (
            <Link
              key={s.id}
              href={`/coach/sessions/${s.id}`}
              className="block bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium">{dateStr}</span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeStr}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Coach: {s.coach?.full_name ?? 'Unknown'}
                  </p>

                  {/* Discovery: show assessment result */}
                  {isDiscovery && sessionAssessment && (
                    <div className="flex items-center gap-2 mt-2">
                      <ClipboardList className="w-3 h-3 text-purple-600" />
                      <span className="text-xs font-medium text-purple-600">
                        {sessionAssessment.player_grade} — Avg: {sessionAssessment.average_score}/10
                      </span>
                    </div>
                  )}

                  {/* Coaching: show modules scored */}
                  {isCoaching && sessionModules.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Target className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      {sessionModules.map(mr => {
                        const mod = getModuleById(mr.module_id)
                        return (
                          <span
                            key={mr.module_id}
                            className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
                          >
                            {mod?.name ?? mr.module_id}: {mr.module_score ?? '—'}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>

                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                  TYPE_STYLES[s.session_type] ?? 'bg-gray-100 text-gray-800'
                }`}>
                  {TYPE_LABELS[s.session_type] ?? s.session_type}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
