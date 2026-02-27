import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Debug endpoint — DELETE after fixing login

export async function GET() {
  const results: Record<string, unknown> = {}
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Test 1: Direct GoTrue API call (bypass JS client)
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
      },
      body: JSON.stringify({
        email: 'admin@padel.local',
        password: 'password123',
      }),
    })
    const body = await res.json()
    results.gotrue_direct = {
      status: res.status,
      body: res.status === 200 ? { ok: true, userId: body.user?.id } : body,
    }
  } catch (e: unknown) {
    results.gotrue_direct = `CATCH: ${e instanceof Error ? e.message : String(e)}`
  }

  // Test 2: Check GoTrue health
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { 'apikey': anonKey },
    })
    results.gotrue_health = { status: res.status, body: await res.json() }
  } catch (e: unknown) {
    results.gotrue_health = `CATCH: ${e instanceof Error ? e.message : String(e)}`
  }

  // Test 3: Check auth.users via service role
  try {
    const sr = createServiceRoleClient()
    const { data, error } = await sr.auth.admin.listUsers({ perPage: 5 })
    if (error) {
      results.auth_users = `ERROR: ${error.message}`
    } else {
      results.auth_users = data.users.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        confirmed: u.email_confirmed_at ? true : false,
      }))
    }
  } catch (e: unknown) {
    results.auth_users = `CATCH: ${e instanceof Error ? e.message : String(e)}`
  }

  // Test 4: Check for auth hooks (custom_access_token)
  try {
    const sr = createServiceRoleClient()
    const { data, error } = await sr.rpc('pg_catalog.obj_description', {}).maybeSingle()
    // Alternative: check config directly
    results.auth_hooks_check = 'see gotrue_direct for real error'
  } catch {
    results.auth_hooks_check = 'skipped'
  }

  // Test 5: Check all functions in public schema
  try {
    const sr = createServiceRoleClient()
    const { data, error } = await sr.rpc('get_public_functions').maybeSingle()
    results.functions = error ? `cannot list (expected)` : data
  } catch {
    results.functions = 'skipped'
  }

  // Test 6: Try register (signUp) to compare
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
      },
      body: JSON.stringify({
        email: 'test-debug-123@padel.local',
        password: 'test123456',
      }),
    })
    const body = await res.json()
    results.gotrue_signup = {
      status: res.status,
      // Don't show full body, just key info
      has_user: !!body.user,
      has_session: !!body.session,
      error: body.error || body.msg || body.error_description || null,
    }

    // Cleanup: delete test user if created
    if (body.user?.id) {
      const sr = createServiceRoleClient()
      await sr.auth.admin.deleteUser(body.user.id)
      results.gotrue_signup_cleanup = 'deleted test user'
    }
  } catch (e: unknown) {
    results.gotrue_signup = `CATCH: ${e instanceof Error ? e.message : String(e)}`
  }

  return NextResponse.json(results, { headers: { 'Content-Type': 'application/json' } })
}
