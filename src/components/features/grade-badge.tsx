import { cn } from '@/lib/utils'
import { GRADE_LABELS } from '@/types/database'

const GRADE_COLORS: Record<string, string> = {
  'Grade 1': 'bg-grade-1 text-white',
  'Grade 2': 'bg-grade-2 text-white',
  'Grade 3': 'bg-grade-3 text-gray-900',
  'Grade 4': 'bg-grade-4 text-white',
  'Grade 5': 'bg-grade-5 text-gray-900',
  'Unassessed': 'bg-gray-200 text-gray-600',
}

interface GradeBadgeProps {
  grade: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function GradeBadge({ grade, size = 'md', showLabel = true, className }: GradeBadgeProps) {
  const colorClass = GRADE_COLORS[grade] || GRADE_COLORS['Unassessed']
  const label = GRADE_LABELS[grade] || 'Unknown'

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        size === 'lg' && 'px-4 py-1.5 text-base',
        colorClass,
        className
      )}
    >
      {grade}{showLabel && ` — ${label}`}
    </span>
  )
}
