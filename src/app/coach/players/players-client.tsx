'use client'

import { useState } from 'react'
import { CreatePlayerForm } from './create-player-form'
import { Plus } from 'lucide-react'

export function PlayersClient() {
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Player
      </button>

      {showForm && (
        <CreatePlayerForm onClose={() => setShowForm(false)} />
      )}
    </>
  )
}
