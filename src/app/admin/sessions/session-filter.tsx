'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SessionCard } from '@/components/features/session-card'
import { cn } from '@/lib/utils'
import { CalendarDays } from 'lucide-react'

type TimeFilter = 'upcoming' | 'past'
type TypeFilter = 'all' | 'coaching_drilling' | 'open_play' | 'discovery'

interface SessionFilterProps {
  sessions: any[]
}

export function SessionFilter({ sessions }: SessionFilterProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  const now = new Date()

  const filtered = sessions.filter((session) => {
    // Time filter
    const sessionDate = new Date(session.date)
    if (timeFilter === 'upcoming') {
      if (sessionDate < now && session.status === 'completed') return false
    } else {
      if (sessionDate >= now || session.status !== 'completed') return false
    }

    // Type filter
    if (typeFilter !== 'all' && session.session_type !== typeFilter) return false

    return true
  })

  const typeOptions: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: 'Semua' },
    { value: 'coaching_drilling', label: 'Coaching' },
    { value: 'open_play', label: 'Open Play' },
    { value: 'discovery', label: 'Discovery' },
  ]

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-3">
        {/* Time filter */}
        <div className="flex bg-muted rounded-xl p-1 gap-1">
          <button
            onClick={() => setTimeFilter('upcoming')}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
              timeFilter === 'upcoming'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Upcoming
          </button>
          <button
            onClick={() => setTimeFilter('past')}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
              timeFilter === 'past'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Past
          </button>
        </div>

        {/* Type filter */}
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                typeFilter === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Session List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((session: any) => (
            <Link key={session.id} href={`/admin/sessions/${session.id}`}>
              <SessionCard
                id={session.id}
                date={session.date}
                coachName={session.coach?.full_name ?? 'Unknown'}
                sessionType={session.session_type}
                locationName={session.locations?.name}
                locationMapsLink={session.locations?.maps_link}
                courtsBooked={session.courts_booked}
                durationHours={session.duration_hours}
                reclubUrl={session.reclub_url}
                pricePax={session.price_per_pax}
                status={session.status}
                maxPlayers={session.max_players}
                playerCount={
                  session.session_players?.filter(
                    (p: any) => p.status === 'approved' || p.status === 'attended'
                  ).length ?? 0
                }
                notes={session.notes}
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {timeFilter === 'upcoming'
              ? 'Tidak ada session yang akan datang.'
              : 'Tidak ada session yang sudah selesai.'}
          </p>
        </div>
      )}
    </div>
  )
}
