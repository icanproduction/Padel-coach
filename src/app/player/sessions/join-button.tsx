'use client'

import { useState } from 'react'
import { joinSession } from '@/app/actions/participant-actions'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface JoinButtonProps {
  sessionId: string
  className?: string
}

export function JoinButton({ sessionId, className }: JoinButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)

  async function handleJoin() {
    setIsLoading(true)
    setResult(null)

    const response = await joinSession(sessionId)

    if (response.error) {
      setResult({ error: response.error })
    } else {
      setResult({ success: true })
    }

    setIsLoading(false)
  }

  if (result?.success) {
    return (
      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
        Request Sent
      </span>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleJoin}
        disabled={isLoading}
        className={cn(
          'text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center gap-1.5',
          className
        )}
      >
        {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
        {isLoading ? 'Joining...' : 'Request to Join'}
      </button>
      {result?.error && (
        <p className="text-xs text-red-500">{result.error}</p>
      )}
    </div>
  )
}
