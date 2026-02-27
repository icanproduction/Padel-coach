'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { CURRICULUMS } from '@/data/curriculum'

interface ModuleRecord {
  curriculum_id: string
  module_id: string
  module_score: number | null
  session_id: string | null
  created_at: string
}

interface SkillOverviewProps {
  moduleRecords: ModuleRecord[]
}

const BAR_COLORS = [
  '#4a90d9',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#22c55e',
  '#00d4aa',
]

export function SkillOverview({ moduleRecords }: SkillOverviewProps) {
  // For each curriculum, compute score = avg of latest module scores
  const chartData = CURRICULUMS.map((curriculum, idx) => {
    const moduleScores: number[] = []

    for (const mod of curriculum.modules) {
      const records = moduleRecords
        .filter(r => r.module_id === mod.id && r.module_score !== null)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      if (records.length > 0 && records[0].module_score !== null) {
        moduleScores.push(records[0].module_score)
      }
    }

    const avg = moduleScores.length > 0
      ? Math.round((moduleScores.reduce((a, b) => a + b, 0) / moduleScores.length) * 10) / 10
      : 0

    // Short label for X axis
    const shortName = curriculum.name.split(' ')[0]

    return {
      name: shortName,
      fullName: curriculum.name,
      score: avg,
      modulesScored: moduleScores.length,
      totalModules: curriculum.modules.length,
      color: BAR_COLORS[idx % BAR_COLORS.length],
    }
  })

  const hasAnyScore = chartData.some(d => d.score > 0)

  return (
    <div>
      <h2 className="text-base font-semibold mb-3">Skill Overview</h2>
      <div className="bg-card rounded-xl border border-border p-4">
        {hasAnyScore ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
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
                formatter={(value: number, _name: string, props: any) => [
                  `${value}/10`,
                  props.payload.fullName,
                ]}
                labelFormatter={() => ''}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="py-8 text-center">
            <p className="text-xs text-muted-foreground">
              No coaching scores yet. Score drills in coaching sessions to see skill overview.
            </p>
          </div>
        )}

        {/* Score labels below chart */}
        {hasAnyScore && (
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
            {chartData.map((c, idx) => (
              <div key={idx} className="text-center">
                <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: c.color }} />
                <p className="text-[10px] text-muted-foreground leading-tight line-clamp-1">{c.fullName}</p>
                <p className="text-sm font-bold" style={{ color: c.color }}>
                  {c.score > 0 ? c.score : '—'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
