'use client'

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

interface ProgressDataPoint {
  date: string
  average?: number
  reaction_to_ball?: number
  swing_size?: number
  spacing_awareness?: number
  recovery_habit?: number
  decision_making?: number
}

interface ProgressLineChartProps {
  data: ProgressDataPoint[]
  showParameters?: boolean
  height?: number
}

const PARAMETER_COLORS: Record<string, string> = {
  average: '#00d4aa',
  reaction_to_ball: '#4a90d9',
  swing_size: '#f59e0b',
  spacing_awareness: '#8b5cf6',
  recovery_habit: '#ef4444',
  decision_making: '#22c55e',
}

const PARAMETER_LABELS: Record<string, string> = {
  average: 'Average',
  reaction_to_ball: 'Reaction',
  swing_size: 'Swing Size',
  spacing_awareness: 'Spacing',
  recovery_habit: 'Recovery',
  decision_making: 'Decision',
}

export function ProgressLineChart({ data, showParameters = false, height = 300 }: ProgressLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={(val) => {
            const d = new Date(val)
            return `${d.getDate()}/${d.getMonth() + 1}`
          }}
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
          labelFormatter={(val) => new Date(val).toLocaleDateString()}
        />
        <Legend wrapperStyle={{ fontSize: '11px' }} />

        <Line
          type="monotone"
          dataKey="average"
          stroke={PARAMETER_COLORS.average}
          strokeWidth={3}
          dot={{ r: 4 }}
          name={PARAMETER_LABELS.average}
        />

        {showParameters && (
          <>
            <Line type="monotone" dataKey="reaction_to_ball" stroke={PARAMETER_COLORS.reaction_to_ball} strokeWidth={1.5} dot={{ r: 3 }} name={PARAMETER_LABELS.reaction_to_ball} />
            <Line type="monotone" dataKey="swing_size" stroke={PARAMETER_COLORS.swing_size} strokeWidth={1.5} dot={{ r: 3 }} name={PARAMETER_LABELS.swing_size} />
            <Line type="monotone" dataKey="spacing_awareness" stroke={PARAMETER_COLORS.spacing_awareness} strokeWidth={1.5} dot={{ r: 3 }} name={PARAMETER_LABELS.spacing_awareness} />
            <Line type="monotone" dataKey="recovery_habit" stroke={PARAMETER_COLORS.recovery_habit} strokeWidth={1.5} dot={{ r: 3 }} name={PARAMETER_LABELS.recovery_habit} />
            <Line type="monotone" dataKey="decision_making" stroke={PARAMETER_COLORS.decision_making} strokeWidth={1.5} dot={{ r: 3 }} name={PARAMETER_LABELS.decision_making} />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
