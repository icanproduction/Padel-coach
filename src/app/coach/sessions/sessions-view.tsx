'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CalendarDays, List } from 'lucide-react'
import { SessionCard } from '@/components/features/session-card'
import { SessionStatusActions } from './session-status-actions'
import { SessionCalendar } from './session-calendar'

interface SessionData {
  id: string
  date: string
  status: string
  session_type: string
  max_players: number
  notes: string | null
  courts_booked: number | null
  duration_hours: number
  reclub_url: string | null
  coach: { full_name: string } | null
  session_players: { player_id: string; status: string }[]
  locations: { name: string; maps_link: string | null } | null
}

interface SessionsViewProps {
  sessions: SessionData[]
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function SessionsView({ sessions }: SessionsViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const upcomingSessions = sessions.filter(
    (s) => s.status === 'scheduled' || s.status === 'in_progress'
  )
  const completedSessions = sessions.filter((s) => s.status === 'completed')

  // Calendar dot data
  const calendarDots = sessions.map((s) => ({
    id: s.id,
    date: s.date,
    status: s.status,
    sessionType: s.session_type,
  }))

  // Filtered sessions when a date is selected
  const filteredSessions = selectedDate
    ? sessions.filter((s) => toDateKey(new Date(s.date)) === selectedDate)
    : null

  function getPlayerCount(session: SessionData) {
    if (session.status === 'completed') {
      return session.session_players?.filter((p) => p.status === 'attended').length ?? 0
    }
    return session.session_players?.filter(
      (p) => p.status === 'approved' || p.status === 'attended'
    ).length ?? 0
  }

  function renderSessionCard(session: SessionData, showActions = false) {
    return (
      <Link key={session.id} href={`/coach/sessions/${session.id}`}>
        <SessionCard
          id={session.id}
          date={session.date}
          coachName={session.coach?.full_name ?? 'You'}
          sessionType={session.session_type}
          locationName={session.locations?.name}
          locationMapsLink={session.locations?.maps_link}
          courtsBooked={session.courts_booked}
          durationHours={session.duration_hours}
          reclubUrl={session.reclub_url}
          status={session.status}
          maxPlayers={session.max_players}
          playerCount={getPlayerCount(session)}
          notes={session.notes}
          actions={
            showActions && session.status !== 'completed' ? (
              <SessionStatusActions
                sessionId={session.id}
                currentStatus={session.status}
              />
            ) : undefined
          }
        />
      </Link>
    )
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex bg-muted rounded-lg p-1 gap-1">
        <button
          onClick={() => { setViewMode('list'); setSelectedDate(null) }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'list'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground'
          }`}
        >
          <List className="w-4 h-4" />
          List
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'calendar'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Calendar
        </button>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <>
          <SessionCalendar
            sessions={calendarDots}
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            onMonthChange={setCurrentMonth}
            onDateSelect={setSelectedDate}
          />

          {/* Filtered sessions for selected date */}
          {filteredSessions && (
            <div>
              <h2 className="text-sm font-semibold mb-2">
                {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} on{' '}
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h2>
              <div className="space-y-3">
                {filteredSessions.map((s) => renderSessionCard(s, true))}
              </div>
            </div>
          )}

          {filteredSessions && filteredSessions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Tidak ada session pada tanggal ini.
            </p>
          )}

          {/* All sessions list below calendar when no date selected */}
          {!selectedDate && sessions.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-2 text-muted-foreground">
                Semua Session ({sessions.length})
              </h2>
              <div className="space-y-3">
                {sessions.map((s) => renderSessionCard(s))}
              </div>
            </div>
          )}
        </>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Upcoming / Active */}
          <div>
            <h2 className="text-lg font-semibold mb-3">
              Upcoming & Active ({upcomingSessions.length})
            </h2>

            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.map((s) => renderSessionCard(s, true))}
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border p-6 text-center">
                <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming sessions</p>
              </div>
            )}
          </div>

          {/* Completed */}
          {completedSessions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">
                Completed ({completedSessions.length})
              </h2>
              <div className="space-y-3">
                {completedSessions.map((s) => renderSessionCard(s))}
              </div>
            </div>
          )}

          {/* Empty */}
          {sessions.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">No sessions yet</p>
              <p className="text-xs text-muted-foreground">
                Tap &quot;New Session&quot; to create your first session.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
