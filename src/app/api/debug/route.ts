import { createServiceRoleClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Debug endpoint — DELETE after fixing login
// Tests both service role and anon key connections

export async function GET() {
  const results: Record<string, unknown> = {}

  // Test 1: Service role client (bypasses RLS)
  try {
    const sr = createServiceRoleClient()
    const { data, error } = await sr.from('profiles').select('id, username, role').limit(3)
    results.service_role = error ? `ERROR: ${error.message}` : { ok: true, count: data?.length }
  } catch (e: unknown) {
    results.service_role = `CATCH: ${e instanceof Error ? e.message : String(e)}`
  }

  // Test 2: Anon key client (goes through RLS)
  try {
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error } = await anon.from('profiles').select('id, username, role').limit(3)
    results.anon_key = error ? `ERROR: ${error.message} (code: ${error.code}, details: ${error.details})` : { ok: true, count: data?.length }
  } catch (e: unknown) {
    results.anon_key = `CATCH: ${e instanceof Error ? e.message : String(e)}`
  }

  // Test 3: Anon key — simpler query (just count)
  try {
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { count, error } = await anon.from('profiles').select('*', { count: 'exact', head: true })
    results.anon_count = error ? `ERROR: ${error.message}` : { ok: true, count }
  } catch (e: unknown) {
    results.anon_count = `CATCH: ${e instanceof Error ? e.message : String(e)}`
  }

  // Test 4: Auth — try signing in as admin
  try {
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error } = await anon.auth.signInWithPassword({
      email: 'admin@padel.local',
      password: 'password123',
    })
    if (error) {
      results.auth_signin = `ERROR: ${error.message}`
    } else {
      results.auth_signin = { ok: true, userId: data.user?.id }

      // Test 5: Query profiles with authenticated session
      const { data: profile, error: profileError } = await anon
        .from('profiles')
        .select('id, username, role')
        .eq('id', data.user.id)
        .single()

      results.auth_query = profileError
        ? `ERROR: ${profileError.message} (code: ${profileError.code}, details: ${profileError.details})`
        : { ok: true, profile }
    }
  } catch (e: unknown) {
    results.auth_signin = `CATCH: ${e instanceof Error ? e.message : String(e)}`
  }

  // Env check
  results.env = {
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `SET (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20)}...)` : 'MISSING',
    service_role: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
  }

  return NextResponse.json(results, { headers: { 'Content-Type': 'application/json' } })
}
