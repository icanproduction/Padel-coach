'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LogIn, UserPlus, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { joinSession } from '@/app/actions/participant-actions'

interface JoinButtonProps {
  sessionId: string
  isLoggedIn: boolean
  userRole: string | null
  playerStatus: string | null
  isFull: boolean
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
  pending: {
    icon: <Clock className="w-4 h-4" />,
    label: 'Menunggu Approval',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  approved: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: 'Kamu Sudah Terdaftar',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  attended: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: 'Sudah Hadir',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  rejected: {
    icon: <XCircle className="w-4 h-4" />,
    label: 'Ditolak',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
}

export function JoinButton({ sessionId, isLoggedIn, userRole, playerStatus, isFull }: JoinButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [joined, setJoined] = useState(false)

  // Already has a status
  if (playerStatus) {
    const config = STATUS_CONFIG[playerStatus]
    if (config) {
      return (
        <div className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium ${config.className}`}>
          {config.icon}
          {config.label}
        </div>
      )
    }
  }

  // Just joined
  if (joined) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 rounded-xl border bg-yellow-100 text-yellow-800 border-yellow-200 text-sm font-medium">
        <Clock className="w-4 h-4" />
        Menunggu Approval
      </div>
    )
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <a
        href={`/login?redirectedFrom=/session/${sessionId}`}
        className="w-full py-3.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <LogIn className="w-4 h-4" />
        Login untuk Join
      </a>
    )
  }

  // Not a player
  if (userRole !== 'player') {
    return (
      <div className="text-center text-sm text-muted-foreground py-3">
        Hanya player yang bisa join session.
      </div>
    )
  }

  // Full
  if (isFull) {
    return (
      <div className="text-center text-sm text-muted-foreground py-3">
        Session sudah penuh.
      </div>
    )
  }

  function handleJoin() {
    setError(null)
    startTransition(async () => {
      const result = await joinSession(sessionId)
      if (result.error) {
        setError(result.error)
      } else {
        setJoined(true)
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="bg-destructive/10 text-destructive text-xs rounded-lg p-2.5 text-center">
          {error}
        </div>
      )}
      <button
        onClick={handleJoin}
        disabled={isPending}
        className="w-full py-3.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
        {isPending ? 'Joining...' : 'Request to Join'}
      </button>
    </div>
  )
}
