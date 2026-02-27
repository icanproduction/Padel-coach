import { cn } from '@/lib/utils'
import { Calendar, Clock, Users, User, MapPin, Link2 } from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
}

const TYPE_STYLES: Record<string, string> = {
  discovery: 'bg-purple-100 text-purple-800',
  coaching_drilling: 'bg-blue-100 text-blue-800',
  open_play: 'bg-green-100 text-green-800',
}

const TYPE_LABELS: Record<string, string> = {
  discovery: 'Discovery',
  coaching_drilling: 'Coaching & Drilling',
  open_play: 'Open Play',
}

interface SessionCardProps {
  id: string
  date: string
  coachName: string
  sessionType: string
  status: string
  maxPlayers: number
  playerCount?: number
  locationName?: string | null
  locationMapsLink?: string | null
  courtsBooked?: number | null
  durationHours?: number
  reclubUrl?: string | null
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
  locationName,
  locationMapsLink,
  courtsBooked,
  durationHours,
  reclubUrl,
  notes,
  actions,
  className,
}: SessionCardProps) {
  const isOpenPlay = sessionType === 'open_play'
  const sessionDate = new Date(date)
  const dateStr = sessionDate.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  const timeStr = sessionDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const details: string[] = []
  if (courtsBooked && courtsBooked > 0) {
    details.push(`${courtsBooked} Court${courtsBooked > 1 ? 's' : ''}`)
  }
  if (durationHours && durationHours > 0) {
    details.push(`${durationHours} Hr${durationHours > 1 ? 's' : ''}`)
  }

  return (
    <div className={cn('bg-card rounded-xl border border-border p-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
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

          {/* Location */}
          {locationName && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {locationMapsLink ? (
                <a
                  href={locationMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="truncate text-primary hover:underline"
                >
                  {locationName}
                </a>
              ) : (
                <span className="truncate">{locationName}</span>
              )}
            </div>
          )}

          {/* Courts & Duration */}
          {details.length > 0 && (
            <div className="flex items-center gap-2 mt-1 ml-5 text-xs text-muted-foreground">
              {details.map((d, i) => (
                <span key={i} className="bg-muted px-2 py-0.5 rounded-full">{d}</span>
              ))}
            </div>
          )}

          {/* Players */}
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>
              {isOpenPlay
                ? `${playerCount} player${playerCount !== 1 ? 's' : ''} joined`
                : `${playerCount}/${maxPlayers} players`}
            </span>
          </div>

          {/* ReClub link */}
          {reclubUrl && (
            <a
              href={reclubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium text-primary hover:underline max-w-full"
            >
              <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Book via ReClub</span>
            </a>
          )}

          {notes && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{notes}</p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full capitalize',
              STATUS_STYLES[status] || 'bg-gray-100 text-gray-800'
            )}
          >
            {status.replace('_', ' ')}
          </span>
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              TYPE_STYLES[sessionType] || 'bg-gray-100 text-gray-800'
            )}
          >
            {TYPE_LABELS[sessionType] || sessionType.replace('_', ' ')}
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
