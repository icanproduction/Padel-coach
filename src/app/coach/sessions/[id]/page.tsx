import { getSessionById } from '@/app/actions/session-actions'
import { getSessionAssessments } from '@/app/actions/assessment-actions'
import { SessionCard } from '@/components/features/session-card'
import { GradeBadge } from '@/components/features/grade-badge'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ClipboardList, User } from 'lucide-react'
import { SessionStatusActions } from '../session-status-actions'
import { ParticipantActions } from './participant-actions'

export const dynamic = 'force-dynamic'

interface SessionDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const { id } = await params

  const [sessionResult, assessmentsResult] = await Promise.all([
    getSessionById(id),
    getSessionAssessments(id),
  ])

  if (sessionResult.error || !sessionResult.data) {
    notFound()
  }

  const session = sessionResult.data as any
  const assessments = (assessmentsResult.data ?? []) as any[]

  // Group players by status
  const sessionPlayers = session.session_players ?? []
  const pendingPlayers = sessionPlayers.filter((p: any) => p.status === 'pending')
  const approvedPlayers = sessionPlayers.filter((p: any) => p.status === 'approved')
  const attendedPlayers = sessionPlayers.filter((p: any) => p.status === 'attended')
  const noShowPlayers = sessionPlayers.filter((p: any) => p.status === 'no_show')
  const rejectedPlayers = sessionPlayers.filter((p: any) => p.status === 'rejected')

  const isActiveOrCompleted = session.status === 'in_progress' || session.status === 'completed'

  // Check which players already have assessments for this session
  const assessedPlayerIds = new Set(assessments.map((a: any) => a.player_id))

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/coach/sessions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Sessions
      </Link>

      {/* Session Info Card */}
      <SessionCard
        id={session.id}
        date={session.date}
        coachName={session.coach?.full_name ?? 'Unknown'}
        sessionType={session.session_type}
        locationName={session.locations?.name}
        courtsBooked={session.courts_booked}
        durationHours={session.duration_hours}
        status={session.status}
        maxPlayers={session.max_players}
        playerCount={approvedPlayers.length + attendedPlayers.length}
        notes={session.notes}
        actions={
          <SessionStatusActions
            sessionId={session.id}
            currentStatus={session.status}
          />
        }
      />

      {/* Pending Requests */}
      {pendingPlayers.length > 0 && session.status !== 'completed' && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Pending Requests ({pendingPlayers.length})
          </h2>
          <div className="space-y-2">
            {pendingPlayers.map((sp: any) => (
              <PlayerRow
                key={sp.player_id}
                player={sp.profiles}
                status="pending"
                sessionId={session.id}
                sessionStatus={session.status}
                isAssessed={assessedPlayerIds.has(sp.player_id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Approved Players */}
      {approvedPlayers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Approved ({approvedPlayers.length})
          </h2>
          <div className="space-y-2">
            {approvedPlayers.map((sp: any) => (
              <PlayerRow
                key={sp.player_id}
                player={sp.profiles}
                status="approved"
                sessionId={session.id}
                sessionStatus={session.status}
                isAssessed={assessedPlayerIds.has(sp.player_id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Attended Players */}
      {attendedPlayers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Attended ({attendedPlayers.length})
          </h2>
          <div className="space-y-2">
            {attendedPlayers.map((sp: any) => (
              <PlayerRow
                key={sp.player_id}
                player={sp.profiles}
                status="attended"
                sessionId={session.id}
                sessionStatus={session.status}
                isAssessed={assessedPlayerIds.has(sp.player_id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Show */}
      {noShowPlayers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
            No Show ({noShowPlayers.length})
          </h2>
          <div className="space-y-2">
            {noShowPlayers.map((sp: any) => (
              <PlayerRow
                key={sp.player_id}
                player={sp.profiles}
                status="no_show"
                sessionId={session.id}
                sessionStatus={session.status}
                isAssessed={assessedPlayerIds.has(sp.player_id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rejected */}
      {rejectedPlayers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
            Rejected ({rejectedPlayers.length})
          </h2>
          <div className="space-y-2 opacity-50">
            {rejectedPlayers.map((sp: any) => (
              <PlayerRow
                key={sp.player_id}
                player={sp.profiles}
                status="rejected"
                sessionId={session.id}
                sessionStatus={session.status}
                isAssessed={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sessionPlayers.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <User className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">No players yet</p>
          <p className="text-xs text-muted-foreground">
            Players will appear here when they request to join this session.
          </p>
        </div>
      )}

      {/* Session Assessments */}
      {assessments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Session Assessments ({assessments.length})
          </h2>
          <div className="space-y-3">
            {assessments.map((assessment: any) => (
              <Link
                key={assessment.id}
                href={`/coach/players/${assessment.player_id}`}
                className="block bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                      {assessment.player?.full_name
                        ?.split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) ?? '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {assessment.player?.full_name ?? 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Avg: {assessment.average_score}/10
                      </p>
                    </div>
                  </div>
                  <GradeBadge grade={assessment.player_grade} size="sm" showLabel={false} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PlayerRow({
  player,
  status,
  sessionId,
  sessionStatus,
  isAssessed,
}: {
  player: any
  status: string
  sessionId: string
  sessionStatus: string
  isAssessed: boolean
}) {
  const initials = player?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?'

  const statusBadgeColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    attended: 'bg-green-100 text-green-800',
    no_show: 'bg-red-100 text-red-800',
    rejected: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between gap-3">
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
            <p className="text-sm font-medium">{player?.full_name ?? 'Unknown'}</p>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize ${
                statusBadgeColors[status] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Participant status actions */}
          <ParticipantActions
            sessionId={sessionId}
            playerId={player?.id}
            currentStatus={status}
            sessionStatus={sessionStatus}
          />

          {/* Assess Player button */}
          {(status === 'approved' || status === 'attended') && !isAssessed && (
            <Link
              href={`/coach/assess?player=${player?.id}&session=${sessionId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium min-h-[36px] bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Assess
            </Link>
          )}

          {isAssessed && (
            <span className="text-[10px] text-green-600 font-medium">Assessed</span>
          )}
        </div>
      </div>
    </div>
  )
}
