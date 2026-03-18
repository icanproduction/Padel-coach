'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addPlayerToSession } from '@/app/actions/participant-actions'
import { Plus, Search, Loader2, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Player {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
}

interface AddPlayerFormProps {
  sessionId: string
  allPlayers: Player[]
  existingPlayerIds: string[]
}

export function AddPlayerForm({ sessionId, allPlayers, existingPlayerIds }: AddPlayerFormProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const availablePlayers = allPlayers.filter(
    (p) => !existingPlayerIds.includes(p.id) &&
      (p.full_name.toLowerCase().includes(search.toLowerCase()) ||
       p.email.toLowerCase().includes(search.toLowerCase()))
  )

  function handleAdd(playerId: string) {
    startTransition(async () => {
      await addPlayerToSession(sessionId, playerId)
      router.refresh()
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        Add Player
      </button>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Add Player</h3>
        <button onClick={() => { setOpen(false); setSearch('') }} className="text-xs text-muted-foreground hover:text-foreground">
          Tutup
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau email..."
          className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm"
          autoFocus
        />
      </div>

      {/* Player List */}
      <div className="max-h-48 overflow-y-auto space-y-1">
        {availablePlayers.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">
            {search ? 'Tidak ditemukan' : 'Semua player sudah di-add'}
          </p>
        ) : (
          availablePlayers.slice(0, 10).map((player) => (
            <button
              key={player.id}
              onClick={() => handleAdd(player.id)}
              disabled={isPending}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {player.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{player.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{player.email}</p>
              </div>
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <Plus className="w-4 h-4 text-primary" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
