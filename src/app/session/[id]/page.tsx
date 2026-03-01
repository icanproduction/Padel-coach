import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Calendar, Clock, User, MapPin, Users } from 'lucide-react'
import { JoinButton } from './join-button'

export const dynamic = 'force-dynamic'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const TYPE_LABELS: Record<string, string> = {
  discovery: 'Discovery',
  coaching_drilling: 'Coaching & Drilling',
  open_play: 'Open Play',
}

interface PublicSessionPageProps {
  params: Promise<{ id: string }>
}

export default async function PublicSessionPage({ params }: PublicSessionPageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: session } = await supabase
    .from('sessions')
    .select(`
      *,
      coach:profiles!sessions_coach_id_fkey(id, full_name),
      session_players(player_id, status),
      locations(name, address, maps_link)
    `)
    .eq('id', id)
    .single()

  if (!session) notFound()

  const sessionDate = new Date(session.date)
  const dateStr = `${DAYS[sessionDate.getDay()]} ${sessionDate.getDate()} ${MONTHS[sessionDate.getMonth()]} ${sessionDate.getFullYear()}`
  const timeStr = `${String(sessionDate.getHours()).padStart(2, '0')}:${String(sessionDate.getMinutes()).padStart(2, '0')}`

  const approvedCount = session.session_players?.filter(
    (p: any) => p.status === 'approved' || p.status === 'attended'
  ).length ?? 0
  const slotsLeft = session.max_players - approvedCount

  // Check if current user is logged in and their status
  const { data: { user } } = await supabase.auth.getUser()
  let userRole: string | null = null
  let playerStatus: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    userRole = profile?.role ?? null

    if (userRole === 'player') {
      const existing = session.session_players?.find(
        (p: any) => p.player_id === user.id
      )
      playerStatus = existing?.status ?? null
    }
  }

  const isCompleted = session.status === 'completed'

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            {TYPE_LABELS[session.session_type] ?? session.session_type}
          </span>
          <h1 className="text-xl font-bold mt-3">Padel Session</h1>
        </div>

        {/* Session details card */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{dateStr}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{timeStr}</span>
            {session.duration_hours && (
              <span className="text-muted-foreground">({session.duration_hours} hr{session.duration_hours > 1 ? 's' : ''})</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>Coach: {(session.coach as any)?.full_name ?? 'TBA'}</span>
          </div>
          {session.locations && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{(session.locations as any).name}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>
              {approvedCount}/{session.max_players} players
              {slotsLeft > 0 && !isCompleted && (
                <span className="text-primary font-medium ml-1">({slotsLeft} slot{slotsLeft > 1 ? 's' : ''} left)</span>
              )}
              {slotsLeft <= 0 && !isCompleted && (
                <span className="text-destructive font-medium ml-1">(Full)</span>
              )}
            </span>
          </div>
          {session.courts_booked && session.courts_booked > 0 && (
            <div className="text-xs text-muted-foreground ml-7">
              {session.courts_booked} court{session.courts_booked > 1 ? 's' : ''} booked
            </div>
          )}
          {session.notes && (
            <p className="text-sm text-muted-foreground border-t border-border pt-3">{session.notes}</p>
          )}
        </div>

        {/* Join button */}
        {!isCompleted && (
          <JoinButton
            sessionId={id}
            isLoggedIn={!!user}
            userRole={userRole}
            playerStatus={playerStatus}
            isFull={slotsLeft <= 0}
          />
        )}

        {isCompleted && (
          <div className="text-center text-sm text-muted-foreground py-4">
            Session ini sudah selesai.
          </div>
        )}
      </div>
    </div>
  )
}
