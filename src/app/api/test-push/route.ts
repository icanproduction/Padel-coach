import { NextResponse } from 'next/server'
import { sendPushToUser } from '@/lib/push'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Test push notification - sends to all users with push subscriptions
 * GET /api/test-push?secret=CRON_SECRET
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()

  // Get all push subscriptions
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ message: 'No subscriptions found', sent: 0 })
  }

  const results: { userId: string; status: string; error?: string }[] = []

  for (const sub of subscriptions) {
    try {
      await sendPushToUser(sub.user_id, {
        title: 'Test Notification',
        body: 'Push notification berhasil! Ini adalah test.',
        url: '/',
      })
      results.push({ userId: sub.user_id, status: 'sent' })
    } catch (err: any) {
      results.push({ userId: sub.user_id, status: 'failed', error: err.message })
    }
  }

  return NextResponse.json({
    message: 'Test push completed',
    totalSubscriptions: subscriptions.length,
    results,
  })
}
