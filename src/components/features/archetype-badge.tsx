import { cn } from '@/lib/utils'
import { Brain, Zap, Shield, Shuffle, BookOpen, Swords, Star } from 'lucide-react'

const ARCHETYPE_CONFIG: Record<string, {
  icon: React.ElementType
  color: string
  description: string
}> = {
  'The Thinker': {
    icon: Brain,
    color: 'bg-blue-100 text-blue-800',
    description: 'Good game sense but physically slow to execute',
  },
  'The Athlete': {
    icon: Zap,
    color: 'bg-orange-100 text-orange-800',
    description: 'Physically capable but needs tactical development',
  },
  'The Wall': {
    icon: Shield,
    color: 'bg-green-100 text-green-800',
    description: 'Solid fundamentals, plays safe, needs to learn when to attack',
  },
  'The Wild Card': {
    icon: Shuffle,
    color: 'bg-purple-100 text-purple-800',
    description: 'Inconsistent — brilliant moments mixed with basic errors',
  },
  'The Learner': {
    icon: BookOpen,
    color: 'bg-gray-100 text-gray-800',
    description: 'New player, needs foundational work across all areas',
  },
  'The Competitor': {
    icon: Swords,
    color: 'bg-red-100 text-red-800',
    description: 'Tactically aware and disciplined, ready for match play training',
  },
  'The Natural': {
    icon: Star,
    color: 'bg-emerald-100 text-emerald-800',
    description: 'Well-rounded player, focus on refinement',
  },
  'Unassessed': {
    icon: BookOpen,
    color: 'bg-gray-100 text-gray-500',
    description: 'Not yet assessed',
  },
}

interface ArchetypeBadgeProps {
  archetype: string
  showDescription?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function ArchetypeBadge({ archetype, showDescription = false, size = 'md', className }: ArchetypeBadgeProps) {
  const config = ARCHETYPE_CONFIG[archetype] || ARCHETYPE_CONFIG['Unassessed']
  const Icon = config.icon

  return (
    <div className={cn('inline-flex flex-col', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 font-medium rounded-full',
          size === 'sm' && 'px-2 py-0.5 text-xs',
          size === 'md' && 'px-3 py-1 text-sm',
          config.color
        )}
      >
        <Icon className={cn(size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
        {archetype}
      </span>
      {showDescription && (
        <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
      )}
    </div>
  )
}
