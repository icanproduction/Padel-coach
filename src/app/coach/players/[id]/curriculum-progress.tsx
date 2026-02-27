'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { CURRICULUMS } from '@/data/curriculum'

interface ModuleRecord {
  curriculum_id: string
  module_id: string
  module_score: number | null
  session_id: string | null
  created_at: string
  session?: {
    id: string
    date: string
    session_type: string
    status: string
  } | null
}

interface CurriculumProgressProps {
  moduleRecords: ModuleRecord[]
}

const MODULE_COLORS = [
  '#4a90d9',
  '#f59e0b',
  '#8b5cf6',
]

export function CurriculumProgress({ moduleRecords }: CurriculumProgressProps) {
  const [activeTab, setActiveTab] = useState(CURRICULUMS[0].id)
  const activeCurriculum = CURRICULUMS.find(c => c.id === activeTab)

  if (!activeCurriculum) return null

  // Get records for this curriculum, grouped by session date
  const curriculumRecords = moduleRecords
    .filter(r => r.curriculum_id === activeTab && r.module_score !== null)
    .sort((a, b) => {
      const dateA = a.session?.date ?? a.created_at
      const dateB = b.session?.date ?? b.created_at
      return new Date(dateA).getTime() - new Date(dateB).getTime()
    })

  // Group by session (using session date as key)
  const sessionMap = new Map<string, { date: string; records: typeof curriculumRecords }>()
  for (const record of curriculumRecords) {
    const key = record.session?.date ?? record.created_at
    const existing = sessionMap.get(key)
    if (existing) {
      existing.records.push(record)
    } else {
      sessionMap.set(key, { date: key, records: [record] })
    }
  }

  // Build chart data: each session = one data point
  const chartData = Array.from(sessionMap.values()).map((session, idx) => {
    const point: Record<string, string | number | null> = {
      label: `Session ${idx + 1}`,
      date: session.date,
    }
    for (const mod of activeCurriculum.modules) {
      const record = session.records.find(r => r.module_id === mod.id)
      point[mod.id] = record?.module_score ?? null
    }
    return point
  })

  const hasData = chartData.length > 0

  return (
    <div>
      <h2 className="text-base font-semibold mb-3">Progress</h2>

      {/* Curriculum tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
        {CURRICULUMS.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveTab(c.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === c.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {c.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Chart */}
      {hasData ? (
        <div className="bg-card rounded-xl border border-border p-3">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickCount={6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {activeCurriculum.modules.map((mod, idx) => (
                <Line
                  key={mod.id}
                  type="monotone"
                  dataKey={mod.id}
                  stroke={MODULE_COLORS[idx % MODULE_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name={mod.name}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <p className="text-xs text-muted-foreground">
            No coaching data yet for {activeCurriculum.name}.
          </p>
        </div>
      )}
    </div>
  )
}
