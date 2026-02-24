import { getAllPlayers } from '@/app/actions/player-actions'
import { PlayerCard } from '@/components/features/player-card'
import { Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CoachPlayersPage() {
  const { data: players, error } = await getAllPlayers()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Players</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and assess all registered players
        </p>
      </div>

      {/* Player Count */}
      {players && players.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{players.length} player{players.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Player Grid */}
      {players && players.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {players.map((player: any) => {
            const playerProfile = Array.isArray(player.player_profiles)
              ? player.player_profiles[0]
              : player.player_profiles

            return (
              <PlayerCard
                key={player.id}
                id={player.id}
                name={player.full_name}
                avatarUrl={player.avatar_url}
                grade={playerProfile?.current_grade ?? 'Unassessed'}
                archetype={playerProfile?.current_archetype ?? 'Unassessed'}
                totalSessions={playerProfile?.total_sessions ?? 0}
                href={`/coach/players/${player.id}`}
              />
            )
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No players registered yet</p>
        </div>
      )}
    </div>
  )
}
