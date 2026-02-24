'use client'

import { useTransition } from 'react'
import { updateParticipantStatus } from '@/app/actions/participant-actions'
import { cn } from '@/lib/utils'
import { Check, X, UserCheck, UserX, Loader2 } from 'lucide-react'

interface ParticipantActionsProps {
  sessionId: string
  playerId: string
  currentStatus: string
  sessionStatus: string
}

export function ParticipantActions({
  sessionId,
  playerId,
  currentStatus,
  sessionStatus,
}: ParticipantActionsProps) {
  const [isPending, startTransition] = useTransition()

  function handleUpdate(
    newStatus: 'approved' | 'rejected' | 'attended' | 'no_show',
    e: React.MouseEvent
  ) {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      await updateParticipantStatus(sessionId, playerId, newStatus)
    })
  }

  if (isPending) {
    return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
  }

  // For pending players: show approve/reject
  if (currentStatus === 'pending' && sessionStatus !== 'completed') {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={(e) => handleUpdate('approved', e)}
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium min-h-[32px]',
            'bg-green-100 text-green-800 hover:bg-green-200 transition-colors'
          )}
        >
          <Check className="w-3.5 h-3.5" />
          Approve
        </button>
        <button
          onClick={(e) => handleUpdate('rejected', e)}
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium min-h-[32px]',
            'bg-red-100 text-red-800 hover:bg-red-200 transition-colors'
          )}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  // For approved players when session is in_progress or completed: mark attended/no_show
  if (
    currentStatus === 'approved' &&
    (sessionStatus === 'in_progress' || sessionStatus === 'completed')
  ) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={(e) => handleUpdate('attended', e)}
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium min-h-[32px]',
            'bg-green-100 text-green-800 hover:bg-green-200 transition-colors'
          )}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Attended
        </button>
        <button
          onClick={(e) => handleUpdate('no_show', e)}
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium min-h-[32px]',
            'bg-red-100 text-red-800 hover:bg-red-200 transition-colors'
          )}
        >
          <UserX className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return null
}
