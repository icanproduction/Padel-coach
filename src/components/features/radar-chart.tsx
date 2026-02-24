'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface RadarChartData {
  parameter: string
  current: number
  previous?: number
}

interface AssessmentRadarChartProps {
  data: RadarChartData[]
  showPrevious?: boolean
  height?: number
}

export function AssessmentRadarChart({ data, showPrevious = false, height = 300 }: AssessmentRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="parameter"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 10]}
          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          tickCount={6}
        />
        {showPrevious && (
          <Radar
            name="Previous"
            dataKey="previous"
            stroke="#94a3b8"
            fill="#94a3b8"
            fillOpacity={0.15}
            strokeWidth={1}
            strokeDasharray="5 5"
          />
        )}
        <Radar
          name="Current"
          dataKey="current"
          stroke="#00d4aa"
          fill="#00d4aa"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        {showPrevious && <Legend />}
      </RadarChart>
    </ResponsiveContainer>
  )
}
