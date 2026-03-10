'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { PlayerCard } from '@/components/features/player-card'
import { CreatePlayerForm } from '@/app/coach/players/create-player-form'
import { Users } from 'lucide-react'

interface AdminPlayersClientProps {
  players: any[]
}

export function AdminPlayersClient({ players }: AdminPlayersClientProps) {
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = players.filter((p: any) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q))
    )
  })

  return (
    <>
      {/* Search + Add Player */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari player..."
            className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Player
        </button>
      </div>

      {/* Player list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((player: any) => {
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
            {searchQuery ? 'Tidak ada player yang cocok.' : 'No players registered yet. Add your first player.'}
          </p>
        </div>
      )}

      {/* Create Player Form (full-screen overlay) */}
      {showForm && <CreatePlayerForm onClose={() => setShowForm(false)} />}
    </>
  )
}
