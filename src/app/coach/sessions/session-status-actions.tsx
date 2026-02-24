'use client'

import { useTransition } from 'react'
import { updateSessionStatus } from '@/app/actions/session-actions'
import { cn } from '@/lib/utils'
import { Play, CheckCircle2, Loader2 } from 'lucide-react'

interface SessionStatusActionsProps {
  sessionId: string
  currentStatus: string
}

export function SessionStatusActions({ sessionId, currentStatus }: SessionStatusActionsProps) {
  const [isPending, startTransition] = useTransition()

  function handleStatusChange(newStatus: 'in_progress' | 'completed', e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      await updateSessionStatus(sessionId, newStatus)
    })
  }

  if (isPending) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Updating...
      </span>
    )
  }

  if (currentStatus === 'scheduled') {
    return (
      <button
        onClick={(e) => handleStatusChange('in_progress', e)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium min-h-[36px]',
          'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors'
        )}
      >
        <Play className="w-3.5 h-3.5" />
        Start Session
      </button>
    )
  }

  if (currentStatus === 'in_progress') {
    return (
      <button
        onClick={(e) => handleStatusChange('completed', e)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium min-h-[36px]',
          'bg-green-100 text-green-800 hover:bg-green-200 transition-colors'
        )}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        Complete Session
      </button>
    )
  }

  return null
}
