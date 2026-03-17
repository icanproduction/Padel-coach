'use client'

import { useState } from 'react'
import { SessionCard } from '@/components/features/session-card'
import { JoinButton } from './join-button'
import { CalendarDays, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

type TypeFilter = 'all' | 'coaching_drilling' | 'discovery' | 'open_play'

interface AvailableSessionsProps {
  sessions: any[]
}

export function AvailableSessions({ sessions }: AvailableSessionsProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [dateFilter, setDateFilter] = useState('')

  const filtered = sessions.filter((session) => {
    if (typeFilter !== 'all' && session.session_type !== typeFilter) return false
    if (dateFilter) {
      const sessionDate = session.date.split('T')[0]
      if (sessionDate !== dateFilter) return false
    }
    return true
  })

  const typeOptions: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: 'Semua' },
    { value: 'coaching_drilling', label: 'Coaching' },
    { value: 'open_play', label: 'Open Play' },
    { value: 'discovery', label: 'Discovery' },
  ]

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type filter pills */}
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

        {/* Date filter */}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-8 px-2 rounded-full border border-input bg-background text-xs"
        />
        {dateFilter && (
          <button
            onClick={() => setDateFilter('')}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Reset
          </button>
        )}
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((session) => {
            const coach = session.coach as { id: string; full_name: string } | null
            const players = (session.session_players as { player_id: string; status: string }[]) || []
            const activePlayerCount = players.filter(
              (p) => p.status === 'pending' || p.status === 'approved' || p.status === 'attended'
            ).length

            return (
              <SessionCard
                key={session.id}
                id={session.id}
                date={session.date}
                coachName={coach?.full_name || 'TBA'}
                sessionType={session.session_type}
                locationName={session.location}
                status={session.status}
                maxPlayers={session.max_players}
                playerCount={activePlayerCount}
                pricePax={session.price_per_pax}
                notes={session.notes}
                actions={<JoinButton sessionId={session.id} />}
              />
            )
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {sessions.length === 0
              ? 'Belum ada session tersedia. Cek kembali nanti!'
              : 'Tidak ada session yang cocok dengan filter.'}
          </p>
        </div>
      )}
    </div>
  )
}
