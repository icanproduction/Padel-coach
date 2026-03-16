import webpush from 'web-push'
import { createServiceRoleClient } from '@/lib/supabase/server'

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:admin@looppadel.club',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

interface PushPayload {
  title: string
  body: string
  url?: string
  icon?: string
}

/**
 * Send push notification to a specific user
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  const supabase = createServiceRoleClient()

  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subscriptions || subscriptions.length === 0) return

  const notification = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || '/',
    icon: payload.icon || '/icons/icon-192.png',
  })

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        notification
      ).catch(async (err) => {
        // Remove expired/invalid subscriptions
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint)
        }
      })
    )
  )

  return results
}

/**
 * Send push notification to multiple users
 */
export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  await Promise.allSettled(
    userIds.map((userId) => sendPushToUser(userId, payload))
  )
}

/**
 * Send push notification to all users with a specific role
 */
export async function sendPushToRole(role: 'admin' | 'coach' | 'player', payload: PushPayload) {
  const supabase = createServiceRoleClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', role)

  if (!profiles || profiles.length === 0) return

  await sendPushToUsers(
    profiles.map((p) => p.id),
    payload
  )
}
