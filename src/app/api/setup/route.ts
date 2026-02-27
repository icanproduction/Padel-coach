import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Temporary setup endpoint — DELETE after use
// Visit: http://localhost:3001/api/setup

const ACCOUNTS = [
  { username: 'admin', password: 'password123', full_name: 'Admin ICAN', role: 'admin' },
  { username: 'coach', password: 'password123', full_name: 'Coach Carlos', role: 'coach' },
]

export async function GET() {
  const supabase = createServiceRoleClient()
  const results: string[] = []

  for (const account of ACCOUNTS) {
    const email = `${account.username}@padel.local`

    // Try to create user directly
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        full_name: account.full_name,
        role: account.role,
        username: account.username,
      },
    })

    if (error) {
      // If user already exists, try to delete and recreate
      if (error.message.includes('already') || error.message.includes('exists')) {
        // Find user by querying profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single()

        if (profile) {
          await supabase.auth.admin.deleteUser(profile.id)
          results.push(`Deleted old ${account.role}: ${profile.id}`)

          // Retry create
          const { data: retryData, error: retryError } = await supabase.auth.admin.createUser({
            email,
            password: account.password,
            email_confirm: true,
            user_metadata: {
              full_name: account.full_name,
              role: account.role,
              username: account.username,
            },
          })

          if (retryError) {
            results.push(`FAILED ${account.role} (retry): ${retryError.message}`)
          } else {
            results.push(`Created ${account.role}: ${retryData.user.id} (${account.username} / ${account.password})`)
          }
        } else {
          results.push(`FAILED ${account.role}: ${error.message} (no profile found to delete)`)
        }
      } else {
        results.push(`FAILED ${account.role}: ${error.message}`)
      }
    } else {
      results.push(`Created ${account.role}: ${data.user.id} (${account.username} / ${account.password})`)
    }
  }

  // Verify profiles exist
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, full_name, role')
    .in('role', ['admin', 'coach'])

  return NextResponse.json({
    message: 'Setup complete. DELETE this file after use!',
    results,
    profiles: profiles ?? [],
  })
}
