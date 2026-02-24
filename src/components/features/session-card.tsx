import { cn } from '@/lib/utils'
import { Calendar, Clock, Users, User } from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
}

const TYPE_STYLES: Record<string, string> = {
  discovery: 'bg-purple-100 text-purple-800',
  regular: 'bg-gray-100 text-gray-800',
  assessment_only: 'bg-orange-100 text-orange-800',
}

interface SessionCardProps {
  id: string
  date: string
  coachName: string
  sessionType: string
  status: string
  maxPlayers: number
  playerCount?: number
  notes?: string | null
  actions?: React.ReactNode
  className?: string
}

export function SessionCard({
  date,
  coachName,
  sessionType,
  status,
  maxPlayers,
  playerCount = 0,
  notes,
  actions,
  className,
}: SessionCardProps) {
  const sessionDate = new Date(date)
  const dateStr = sessionDate.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
  const timeStr = sessionDate.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className={cn('bg-card rounded-xl border border-border p-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {/* Date & time */}
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              {dateStr}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {timeStr}
            </span>
          </div>

          {/* Coach */}
          <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
            <User className="w-3.5 h-3.5" />
            <span>Coach: {coachName}</span>
          </div>

          {/* Players */}
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{playerCount}/{maxPlayers} players</span>
          </div>

          {notes && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{notes}</p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-col items-end gap-1.5">
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full capitalize',
            STATUS_STYLES[status] || 'bg-gray-100 text-gray-800'
          )}>
            {status.replace('_', ' ')}
          </span>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full capitalize',
            TYPE_STYLES[sessionType] || 'bg-gray-100 text-gray-800'
          )}>
            {sessionType.replace('_', ' ')}
          </span>
        </div>
      </div>

      {actions && (
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
