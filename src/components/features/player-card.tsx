import Link from 'next/link'
import { cn } from '@/lib/utils'
import { GradeBadge } from './grade-badge'
import { ArchetypeBadge } from './archetype-badge'

interface PlayerCardProps {
  id: string
  name: string
  avatarUrl?: string | null
  grade: string
  archetype: string
  totalSessions: number
  href?: string
  className?: string
}

export function PlayerCard({
  id,
  name,
  avatarUrl,
  grade,
  archetype,
  totalSessions,
  href,
  className,
}: PlayerCardProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const content = (
    <div
      className={cn(
        'bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow',
        href && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{name}</h3>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <GradeBadge grade={grade} size="sm" showLabel={false} />
            <ArchetypeBadge archetype={archetype} size="sm" />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            {totalSessions} session{totalSessions !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
