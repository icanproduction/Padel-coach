'use client'

import { useState } from 'react'
import { CreateSessionForm } from './create-session-form'
import type { Profile, Location } from '@/types/database'
import { Plus } from 'lucide-react'

interface SessionsClientProps {
  coaches: Profile[]
  locations: Location[]
  defaultOpen?: boolean
}

export function SessionsClient({ coaches, locations, defaultOpen = false }: SessionsClientProps) {
  const [showForm, setShowForm] = useState(defaultOpen)

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Create Session
      </button>

      {showForm && (
        <CreateSessionForm
          coaches={coaches}
          locations={locations}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  )
}
