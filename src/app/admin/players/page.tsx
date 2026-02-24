import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PlayerCard } from '@/components/features/player-card'
import { Users } from 'lucide-react'
import type { PlayerWithProfile } from '@/types/database'

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
      <div>
        <h1 className="text-2xl font-bold">Players</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {players?.length ?? 0} registered player{(players?.length ?? 0) !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Player grid */}
      {error ? (
        <div className="bg-card rounded-xl border border-destructive/50 p-6 text-center">
          <p className="text-sm text-destructive">Failed to load players: {error.message}</p>
        </div>
      ) : players && players.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player: any) => {
            const pp = player.player_profiles?.[0] ?? player.player_profiles
            return (
              <PlayerCard
                key={player.id}
                id={player.id}
                name={player.full_name}
                avatarUrl={player.avatar_url}
                grade={pp?.current_grade ?? 'Unassessed'}
                archetype={pp?.current_archetype ?? 'Unassessed'}
                totalSessions={pp?.total_sessions ?? 0}
                href={`/admin/players/${player.id}`}
              />
            )
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No players registered yet.
          </p>
        </div>
      )}
    </div>
  )
}
