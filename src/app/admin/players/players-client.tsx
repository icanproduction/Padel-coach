'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PlayerCard } from '@/components/features/player-card'
import { CreatePlayerForm } from '@/app/coach/players/create-player-form'
import { Users } from 'lucide-react'

interface AdminPlayersClientProps {
  players: any[]
}

export function AdminPlayersClient({ players }: AdminPlayersClientProps) {
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      {/* Add Player button */}
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Player
      </button>

      {/* Player list */}
      {players.length > 0 ? (
        <div className="space-y-3">
          {players.map((player: any) => {
            const pp = player.player_profiles?.[0] ?? player.player_profiles
            return (
              <PlayerCard
                key={player.id}
                id={player.id}
                name={player.full_name}
                avatarUrl={player.avatar_url}
                gender={pp?.gender}
                grade={pp?.current_grade ?? 'Unassessed'}
                archetype={pp?.current_archetype ?? 'Unassessed'}
                totalSessions={pp?.total_sessions ?? 0}
                href={`/coach/players/${player.id}`}
              />
            )
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No players registered yet. Add your first player.
          </p>
        </div>
      )}

      {/* Create Player Form (full-screen overlay) */}
      {showForm && <CreatePlayerForm onClose={() => setShowForm(false)} />}
    </>
  )
}
