import { getSessionRecap } from '@/app/actions/recap-actions'
import { getSessionComments } from '@/app/actions/comment-actions'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, MapPin, User, MessageSquare, Star } from 'lucide-react'
import { SessionComments } from '@/components/features/session-comments'
import { ASSESSMENT_PARAMETERS } from '@/types/database'
import { CURRICULUMS } from '@/data/curriculum'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

function getModuleName(moduleId: string): string {
  for (const c of CURRICULUMS) {
    for (const m of c.modules) {
      if (m.id === moduleId) return m.name
    }
  }
  return moduleId
}

function getDrillName(moduleId: string, drillId: string): string {
  for (const c of CURRICULUMS) {
    for (const m of c.modules) {
      if (m.id === moduleId) {
        const drill = m.drills.find(d => d.id === drillId)
        if (drill) return drill.name
      }
    }
  }
  return drillId
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600'
  if (score >= 5) return 'text-yellow-600'
  return 'text-red-600'
}

function getScoreBg(score: number): string {
  if (score >= 8) return 'bg-green-100'
  if (score >= 5) return 'bg-yellow-100'
  return 'bg-red-100'
}

export default async function PlayerSessionRecapPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const [recapResult, commentsResult] = await Promise.all([
    getSessionRecap(id),
    getSessionComments(id),
  ])

  if (recapResult.error || !recapResult.data) {
    notFound()
  }

  const { session, participation, assessment, moduleRecords } = recapResult.data
  const comments = commentsResult.data || []

  const sessionDate = new Date(session.date)
  const dateStr = sessionDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeStr = sessionDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const isDiscovery = session.session_type === 'discovery'
  const isCoaching = session.session_type === 'coaching_drilling'

  const typeLabels: Record<string, string> = {
    discovery: 'Discovery',
    coaching_drilling: 'Coaching & Drilling',
    open_play: 'Open Play',
  }

  const typeStyles: Record<string, string> = {
    discovery: 'bg-purple-100 text-purple-800',
    coaching_drilling: 'bg-blue-100 text-blue-800',
    open_play: 'bg-green-100 text-green-800',
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/player/sessions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </Link>

      {/* Session Info Card */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeStyles[session.session_type] ?? 'bg-gray-100'}`}>
            {typeLabels[session.session_type] ?? session.session_type}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800 capitalize">
            {session.status.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{dateStr}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{timeStr} • {session.duration_hours} jam</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-muted-foreground" />
          <span>Coach: <span className="font-medium">{(session.coach as any)?.full_name ?? 'Unknown'}</span></span>
        </div>
        {(session as any).locations && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{(session as any).locations.name}</span>
          </div>
        )}
      </div>

      {/* Coach Feedback */}
      {participation?.coach_feedback && (
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Feedback dari Coach
            </h2>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {participation.coach_feedback}
          </p>
        </div>
      )}

      {/* Discovery Assessment Scores */}
      {isDiscovery && assessment && (
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Assessment Scores
            </h2>
          </div>

          {/* Average Score */}
          <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-primary/5">
            <span className="text-sm font-medium">Rata-rata</span>
            <span className="text-lg font-bold text-primary">{assessment.average_score}/10</span>
          </div>

          {/* Grade & Archetype */}
          <div className="flex gap-2 mb-4">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              {assessment.player_grade}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
              {assessment.player_archetype}
            </span>
          </div>

          {/* Individual Scores */}
          <div className="space-y-3">
            {ASSESSMENT_PARAMETERS.map((param) => {
              const score = (assessment as any)[param.key] as number
              return (
                <div key={param.key} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{param.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${score * 10}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold w-6 text-right ${getScoreColor(score)}`}>
                      {score}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Improvement Notes */}
          {assessment.improvement_notes && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Catatan Coach:</p>
              <p className="text-sm whitespace-pre-wrap">{assessment.improvement_notes}</p>
            </div>
          )}

          {/* Areas to Focus */}
          {assessment.areas_to_focus && assessment.areas_to_focus.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Area Fokus:</p>
              <div className="flex flex-wrap gap-1.5">
                {assessment.areas_to_focus.map((area: string) => (
                  <span
                    key={area}
                    className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Coaching/Drilling Module Scores */}
      {isCoaching && moduleRecords.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Drill Scores
            </h2>
          </div>

          <div className="space-y-4">
            {moduleRecords.map((record: any) => {
              const moduleName = getModuleName(record.module_id)
              const drillScores = record.drill_scores as Record<string, number> | null

              return (
                <div key={record.id} className="space-y-2">
                  <p className="text-sm font-semibold">{moduleName}</p>

                  {drillScores && Object.entries(drillScores).map(([drillId, score]) => (
                    <div key={drillId} className="flex items-center justify-between pl-3">
                      <span className="text-xs text-muted-foreground flex-1">
                        {getDrillName(record.module_id, drillId)}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getScoreBg(score)} ${getScoreColor(score)}`}>
                        {score}/10
                      </span>
                    </div>
                  ))}

                  {record.module_score && (
                    <div className="flex items-center justify-between pl-3 pt-1 border-t border-border/50">
                      <span className="text-xs font-medium">Module Average</span>
                      <span className="text-sm font-bold text-primary">{record.module_score}/10</span>
                    </div>
                  )}

                  {record.notes && (
                    <p className="text-xs text-muted-foreground pl-3 italic">{record.notes}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* No scores message */}
      {!assessment && moduleRecords.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <Star className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Belum ada skor untuk session ini.
          </p>
        </div>
      )}

      {/* Session Notes */}
      {session.notes && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Session Notes
          </h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{session.notes}</p>
        </div>
      )}

      {/* Comments Section */}
      <SessionComments
        sessionId={id}
        currentUserId={user.id}
        currentUserRole={profile?.role || 'player'}
        comments={comments}
      />
    </div>
  )
}
