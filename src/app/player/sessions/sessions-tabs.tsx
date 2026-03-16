'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SessionCard } from '@/components/features/session-card'
import { JoinButton } from './join-button'
import { cn } from '@/lib/utils'
import { CalendarDays, Clock, CalendarCheck } from 'lucide-react'

const PARTICIPANT_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  attended: 'bg-green-100 text-green-800',
  no_show: 'bg-gray-100 text-gray-600',
}

type Tab = 'available' | 'my-sessions' | 'past'

interface SessionsTabsProps {
  availableSessions: any[]
  upcomingSessions: any[]
  pastSessions: any[]
}

export function SessionsTabs({ availableSessions, upcomingSessions, pastSessions }: SessionsTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('available')

  const tabs: { key: Tab; label: string; count: number; icon: React.ElementType }[] = [
    { key: 'available', label: 'Available', count: availableSessions.length, icon: CalendarDays },
    { key: 'my-sessions', label: 'My Sessions', count: upcomingSessions.length, icon: Clock },
    { key: 'past', label: 'Past', count: pastSessions.length, icon: CalendarCheck },
  ]

  return (
    <div className="space-y-4">
      {/* Tab Bar */}
      <div className="flex bg-muted rounded-xl p-1 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                  activeTab === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted-foreground/20 text-muted-foreground'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'available' && (
        <div>
          {availableSessions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {availableSessions.map((session) => {
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
                Belum ada session tersedia. Cek kembali nanti!
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-sessions' && (
        <div>
          {upcomingSessions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {upcomingSessions.map((record) => {
                const session = record.session as {
                  id: string; date: string; session_type: string; status: string
                  max_players: number; location: string | null; notes: string | null
                  coach: { id: string; full_name: string } | null
                } | null
                if (!session) return null

                return (
                  <SessionCard
                    key={`${record.session_id}-${record.player_id}`}
                    id={session.id}
                    date={session.date}
                    coachName={session.coach?.full_name || 'TBA'}
                    sessionType={session.session_type}
                    locationName={session.location}
                    status={session.status}
                    maxPlayers={session.max_players}
                    notes={session.notes}
                    actions={
                      <span className={cn(
                        'text-xs font-medium px-2.5 py-1 rounded-full capitalize',
                        PARTICIPANT_STATUS_STYLES[record.status] || 'bg-gray-100 text-gray-600'
                      )}>
                        {record.status === 'pending' ? 'Pending Approval' : record.status}
                      </span>
                    }
                  />
                )
              })}
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Belum ada session. Cek tab Available untuk join session!
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <div>
          {pastSessions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pastSessions.map((record) => {
                const session = record.session as {
                  id: string; date: string; session_type: string; status: string
                  max_players: number; location: string | null; notes: string | null
                  coach: { id: string; full_name: string } | null
                } | null
                if (!session) return null

                return (
                  <Link key={`past-${record.session_id}-${record.player_id}`} href={`/player/sessions/${session.id}`}>
                    <SessionCard
                      id={session.id}
                      date={session.date}
                      coachName={session.coach?.full_name || 'TBA'}
                      sessionType={session.session_type}
                      locationName={session.location}
                      status={session.status}
                      maxPlayers={session.max_players}
                      notes={session.notes}
                      actions={
                        <span className={cn(
                          'text-xs font-medium px-2.5 py-1 rounded-full capitalize',
                          PARTICIPANT_STATUS_STYLES[record.status] || 'bg-gray-100 text-gray-600'
                        )}>
                          {record.status}
                        </span>
                      }
                    />
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <CalendarCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Belum ada session yang sudah selesai.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
