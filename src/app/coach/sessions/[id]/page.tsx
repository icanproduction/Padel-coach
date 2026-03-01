import { getSessionById } from '@/app/actions/session-actions'
import { getSessionAssessments } from '@/app/actions/assessment-actions'
import { getSessionModuleRecords } from '@/app/actions/coaching-actions'
import { getAllPlayers } from '@/app/actions/player-actions'
import { SessionCard } from '@/components/features/session-card'
import { GradeBadge } from '@/components/features/grade-badge'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { SessionStatusActions } from '../session-status-actions'
import { SessionCoachingWrapper } from './session-coaching-wrapper'
import { SessionPlayerSlots } from './session-player-slots'
import { ParticipantActions } from './participant-actions'
import { ShareSessionButton } from './share-session-button'

export const dynamic = 'force-dynamic'

interface SessionDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const { id } = await params

  const [sessionResult, assessmentsResult, playersResult, moduleRecordsResult] = await Promise.all([
    getSessionById(id),
    getSessionAssessments(id),
    getAllPlayers(),
    getSessionModuleRecords(id),
  ])

  if (sessionResult.error || !sessionResult.data) {
    notFound()
  }

  const session = sessionResult.data as any
  const assessments = (assessmentsResult.data ?? []) as any[]
  const moduleRecords = ((moduleRecordsResult.data ?? []) as any[]).map((r: any) => ({
    player_id: r.player_id as string,
    module_id: r.module_id as string,
    drill_scores: r.drill_scores as Record<string, number> | null,
  }))
  const allPlayers = ((playersResult.data as any[]) ?? []).map((p: any) => ({
    id: p.id,
    full_name: p.full_name,
    username: p.username || '',
    avatar_url: p.avatar_url,
  }))

  const isCoaching = session.session_type === 'coaching_drilling'
  const isDiscovery = session.session_type === 'discovery'
  const selectedModules: string[] = session.selected_modules ?? []

  // Group players by status
  const sessionPlayers = session.session_players ?? []
  const pendingPlayers = sessionPlayers.filter((p: any) => p.status === 'pending')
  const approvedPlayers = sessionPlayers.filter((p: any) => p.status === 'approved')
  const attendedPlayers = sessionPlayers.filter((p: any) => p.status === 'attended')
  const noShowPlayers = sessionPlayers.filter((p: any) => p.status === 'no_show')
  const rejectedPlayers = sessionPlayers.filter((p: any) => p.status === 'rejected')

  // Check which players already have assessments for this session
  const assessedPlayerIds = assessments.map((a: any) => a.player_id)

  // Active players for coaching mode (approved + attended)
  const activePlayers = [...approvedPlayers, ...attendedPlayers].map((sp: any) => ({
    id: sp.player_id as string,
    name: (sp.profiles?.full_name ?? 'Unknown') as string,
    avatar_url: (sp.profiles?.avatar_url ?? null) as string | null,
  }))

  // Session card data
  const cardData = {
    id: session.id,
    date: session.date,
    coachName: session.coach?.full_name ?? 'Unknown',
    sessionType: session.session_type,
    locationName: session.locations?.name,
    locationMapsLink: session.locations?.maps_link,
    courtsBooked: session.courts_booked,
    durationHours: session.duration_hours,
    reclubUrl: session.reclub_url,
    status: session.status,
    maxPlayers: session.max_players,
    playerCount: approvedPlayers.length + attendedPlayers.length,
    notes: session.notes,
  }

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

      {/* Session Info Card + Modules (coaching uses wrapper, others use plain card) */}
      {isCoaching ? (
        <SessionCoachingWrapper
          sessionId={session.id}
          sessionStatus={session.status}
          selectedModules={selectedModules}
          players={activePlayers}
          moduleRecords={moduleRecords}
          cardData={cardData}
        />
      ) : (
        <SessionCard
          {...cardData}
          actions={
            <SessionStatusActions
              sessionId={session.id}
              currentStatus={session.status}
            />
          }
        />
      )}

      {/* Share Button */}
      {session.status !== 'completed' && (
        <ShareSessionButton
          sessionId={session.id}
          date={session.date}
          coachName={session.coach?.full_name ?? 'Coach'}
          sessionType={session.session_type}
          locationName={session.locations?.name}
          maxPlayers={session.max_players}
          playerCount={approvedPlayers.length + attendedPlayers.length}
        />
      )}

      {/* Visual Player Slots */}
      <div className="bg-card rounded-xl border border-border px-4 py-4">
        <SessionPlayerSlots
          sessionId={session.id}
          maxPlayers={session.max_players}
          sessionType={session.session_type}
          sessionStatus={session.status}
          sessionPlayers={sessionPlayers}
          allPlayers={allPlayers}
          assessedPlayerIds={assessedPlayerIds}
          selectedModules={selectedModules}
          moduleRecords={moduleRecords}
        />
      </div>

      {/* Pending Requests */}
      {pendingPlayers.length > 0 && session.status !== 'completed' && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Pending Requests ({pendingPlayers.length})
          </h2>
          <div className="space-y-2">
            {pendingPlayers.map((sp: any) => (
              <div key={sp.player_id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {sp.profiles?.full_name
                        ?.split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) ?? '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{sp.profiles?.full_name ?? 'Unknown'}</p>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                        pending
                      </span>
                    </div>
                  </div>
                  <ParticipantActions
                    sessionId={session.id}
                    playerId={sp.player_id}
                    currentStatus="pending"
                    sessionStatus={session.status}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Show */}
      {noShowPlayers.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            No Show ({noShowPlayers.length})
          </h2>
          <div className="space-y-2 opacity-60">
            {noShowPlayers.map((sp: any) => (
              <div key={sp.player_id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-xs font-semibold">
                  {sp.profiles?.full_name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) ?? '?'}
                </div>
                <p className="text-sm">{sp.profiles?.full_name ?? 'Unknown'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected */}
      {rejectedPlayers.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            Rejected ({rejectedPlayers.length})
          </h2>
          <div className="space-y-2 opacity-40">
            {rejectedPlayers.map((sp: any) => (
              <div key={sp.player_id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-semibold">
                  {sp.profiles?.full_name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) ?? '?'}
                </div>
                <p className="text-sm">{sp.profiles?.full_name ?? 'Unknown'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session Assessments — discovery only */}
      {isDiscovery && assessments.length > 0 && (
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

      {/* Coaching Scores Summary — coaching_drilling only */}
      {isCoaching && moduleRecords.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Coaching Scores
          </h2>
          <div className="space-y-3">
            {(() => {
              // Group by player
              const playerMap = new Map<string, typeof moduleRecords>()
              for (const r of moduleRecords) {
                const arr = playerMap.get(r.player_id) || []
                arr.push(r)
                playerMap.set(r.player_id, arr)
              }
              return Array.from(playerMap.entries()).map(([playerId, records]) => {
                const player = sessionPlayers.find((p: any) => p.player_id === playerId)
                const name = player?.profiles?.full_name ?? 'Unknown'
                // Compute overall avg across all drill scores
                const allScores = records.flatMap(r =>
                  r.drill_scores ? Object.values(r.drill_scores) : []
                )
                const avg = allScores.length > 0
                  ? (allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length).toFixed(1)
                  : '—'

                return (
                  <Link
                    key={playerId}
                    href={`/coach/players/${playerId}`}
                    className="block bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                          {name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{name}</p>
                          <p className="text-xs text-muted-foreground">
                            {records.length} module{records.length !== 1 ? 's' : ''} scored
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-primary">{avg}</span>
                    </div>
                  </Link>
                )
              })
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
