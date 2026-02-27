import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'
import { AdminPlayersClient } from './players-client'
import type { PlayerWithProfile } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function AdminPlayersPage() {
  const supabase = await createServerSupabaseClient()

  const { data: players, error } = await supabase
    .from('profiles')
    .select(`
      *,
      player_profiles(*)
    `)
    .eq('role', 'player')
    .order('full_name')

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Players</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {players?.length ?? 0} registered player{(players?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-card rounded-xl border border-destructive/50 p-6 text-center">
          <p className="text-sm text-destructive">Failed to load players: {error.message}</p>
        </div>
      )}

      {/* Client component with add button + player list */}
      <AdminPlayersClient players={(players as any[]) ?? []} />
    </div>
  )
}
