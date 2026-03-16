import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  const body = await request.json()

  // Delete old subscriptions for this user
  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)

  // Insert new subscription
  const { error } = await supabase
    .from('push_subscriptions')
    .insert({
      user_id: user.id,
      endpoint: body.endpoint,
      p256dh: body.p256dh,
      auth: body.auth,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, userId: user.id })
}
