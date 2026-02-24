import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SessionStatusButtons, PlayerStatusButtons } from './session-detail-client'
import {
  Calendar,
  Clock,
  User,
  Users,
  ArrowLeft,
  FileText,
  Tag,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminSessionDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: session, error } = await supabase
    .from('sessions')
    .select(`
      *,
      coach:profiles!sessions_coach_id_fkey(id, full_name, email, avatar_url),
      session_players(
        player_id,
        status,
        joined_at,
        profiles:profiles!session_players_player_id_fkey(id, full_name, email, avatar_url)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !session) {
    notFound()
  }

  const sessionDate = new Date(session.date)
  const dateStr = sessionDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeStr = sessionDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const approvedCount =
    session.session_players?.filter(
      (p: any) => p.status === 'approved' || p.status === 'attended'
    ).length ?? 0

  const pendingPlayers =
    session.session_players?.filter((p: any) => p.status === 'pending') ?? []
  const otherPlayers =
    session.session_players?.filter((p: any) => p.status !== 'pending') ?? []

  const statusStyles: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
  }

  const typeStyles: Record<string, string> = {
    discovery: 'bg-purple-100 text-purple-800',
    regular: 'bg-gray-100 text-gray-800',
    assessment_only: 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/sessions"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sessions
      </Link>

      {/* Session info card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                  statusStyles[session.status] ?? 'bg-gray-100 text-gray-800'
                }`}
              >
                {session.status.replace('_', ' ')}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                  typeStyles[session.session_type] ?? 'bg-gray-100 text-gray-800'
                }`}
              >
                {session.session_type.replace('_', ' ')}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{dateStr}</span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{timeStr}</span>
            </div>

            {/* Coach */}
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>
                Coach: <span className="font-medium">{(session.coach as any)?.full_name ?? 'Unknown'}</span>
              </span>
            </div>

            {/* Players */}
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>
                {approvedCount}/{session.max_players} players
              </span>
            </div>

            {/* Notes */}
            {session.notes && (
              <div className="flex items-start gap-2 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="text-muted-foreground">{session.notes}</p>
              </div>
            )}
          </div>

          {/* Status management */}
          <SessionStatusButtons
            sessionId={session.id}
            currentStatus={session.status}
          />
        </div>
      </div>

      {/* Pending requests */}
      {pendingPlayers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Pending Requests ({pendingPlayers.length})
          </h2>
          <div className="space-y-2">
            {pendingPlayers.map((sp: any) => {
              const player = sp.profiles
              const initials = (player?.full_name ?? '??')
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

              return (
                <div
                  key={sp.player_id}
                  className="bg-card rounded-xl border border-yellow-200 p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {player?.avatar_url ? (
                        <img
                          src={player.avatar_url}
                          alt={player.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {player?.full_name ?? 'Unknown Player'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {player?.email}
                      </p>
                    </div>
                  </div>
                  <PlayerStatusButtons
                    sessionId={session.id}
                    playerId={sp.player_id}
                    currentStatus={sp.status}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All players */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Players ({otherPlayers.length})
        </h2>
        {otherPlayers.length > 0 ? (
          <div className="space-y-2">
            {otherPlayers.map((sp: any) => {
              const player = sp.profiles
              const initials = (player?.full_name ?? '??')
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

              return (
                <div
                  key={sp.player_id}
                  className="bg-card rounded-xl border border-border p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {player?.avatar_url ? (
                        <img
                          src={player.avatar_url}
                          alt={player.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {player?.full_name ?? 'Unknown Player'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {player?.email}
                      </p>
                    </div>
                  </div>
                  <PlayerStatusButtons
                    sessionId={session.id}
                    playerId={sp.player_id}
                    currentStatus={sp.status}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No players in this session yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
