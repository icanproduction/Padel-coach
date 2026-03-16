import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendPushToUser } from '@/lib/push'

export const dynamic = 'force-dynamic'

/**
 * Cron job: Send H-1 reminder to players who joined sessions tomorrow
 * Should be called daily (e.g., via Vercel Cron at 8:00 AM)
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()

  // Get tomorrow's date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  // Find all sessions scheduled for tomorrow
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      id, date, session_type,
      coach:profiles!sessions_coach_id_fkey(full_name),
      locations(name)
    `)
    .eq('date', tomorrowStr)
    .in('status', ['scheduled', 'in_progress'])

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ message: 'No sessions tomorrow', sent: 0 })
  }

  let totalSent = 0

  for (const session of sessions) {
    // Get approved/pending players for this session
    const { data: participants } = await supabase
      .from('session_players')
      .select('player_id')
      .eq('session_id', session.id)
      .in('status', ['approved', 'pending'])

    if (!participants || participants.length === 0) continue

    const sessionDate = new Date(session.date)
    const dateStr = sessionDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    const timeStr = sessionDate.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })

    const coach = session.coach as unknown as { full_name: string } | null
    const location = session.locations as unknown as { name: string } | null
    const coachName = coach?.full_name || 'TBA'
    const locationName = location?.name || ''

    for (const participant of participants) {
      // Send push notification
      try {
        await sendPushToUser(participant.player_id, {
          title: 'Reminder: Session Besok!',
          body: `${dateStr} ${timeStr !== '00.00' ? `jam ${timeStr}` : ''}${locationName ? ` di ${locationName}` : ''} bersama Coach ${coachName}. Jangan lupa ya!`,
          url: `/player/sessions/${session.id}`,
        })
      } catch {
        // Continue even if individual push fails
      }

      // Save in-app notification
      await supabase.from('notifications').insert({
        user_id: participant.player_id,
        title: 'Reminder: Session Besok!',
        body: `Session ${dateStr}${locationName ? ` di ${locationName}` : ''} bersama Coach ${coachName}.`,
        url: `/player/sessions/${session.id}`,
      })

      totalSent++
    }
  }

  return NextResponse.json({ message: 'Reminders sent', sent: totalSent })
}
