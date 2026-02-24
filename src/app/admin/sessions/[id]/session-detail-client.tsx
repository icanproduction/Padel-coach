'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateSessionStatus } from '@/app/actions/session-actions'
import { updateParticipantStatus } from '@/app/actions/participant-actions'
import type { SessionStatus, ParticipantStatus } from '@/types/database'
import { Loader2, Play, CheckCircle, UserCheck, UserX } from 'lucide-react'

interface SessionStatusButtonsProps {
  sessionId: string
  currentStatus: SessionStatus
}

export function SessionStatusButtons({ sessionId, currentStatus }: SessionStatusButtonsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleStatusUpdate(newStatus: SessionStatus) {
    setError(null)
    startTransition(async () => {
      const result = await updateSessionStatus(sessionId, newStatus)
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <div className="flex items-center gap-2">
        {currentStatus === 'scheduled' && (
          <button
            onClick={() => handleStatusUpdate('in_progress')}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Start Session
          </button>
        )}
        {currentStatus === 'in_progress' && (
          <button
            onClick={() => handleStatusUpdate('completed')}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Complete Session
          </button>
        )}
        {currentStatus === 'completed' && (
          <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4" />
            Session Completed
          </span>
        )}
      </div>
    </div>
  )
}

interface PlayerStatusButtonsProps {
  sessionId: string
  playerId: string
  currentStatus: ParticipantStatus
}

export function PlayerStatusButtons({ sessionId, playerId, currentStatus }: PlayerStatusButtonsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleUpdate(newStatus: ParticipantStatus) {
    startTransition(async () => {
      await updateParticipantStatus(sessionId, playerId, newStatus)
      router.refresh()
    })
  }

  if (currentStatus === 'pending') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleUpdate('approved')}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
          Approve
        </button>
        <button
          onClick={() => handleUpdate('rejected')}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserX className="w-3 h-3" />}
          Reject
        </button>
      </div>
    )
  }

  if (currentStatus === 'approved') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
          Approved
        </span>
        <button
          onClick={() => handleUpdate('attended')}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
          Mark Attended
        </button>
      </div>
    )
  }

  const statusStyles: Record<string, string> = {
    attended: 'text-blue-700 bg-blue-100',
    rejected: 'text-red-700 bg-red-100',
    no_show: 'text-gray-700 bg-gray-100',
  }

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusStyles[currentStatus] ?? 'text-gray-700 bg-gray-100'}`}>
      {currentStatus.replace('_', ' ')}
    </span>
  )
}
