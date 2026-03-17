'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { requestCancelSession } from '@/app/actions/participant-actions'
import { X, Loader2 } from 'lucide-react'

interface CancelButtonProps {
  sessionId: string
}

export function CancelButton({ sessionId }: CancelButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)
  const router = useRouter()

  function handleCancel(e: React.MouseEvent) {
    e.preventDefault() // Prevent Link navigation
    e.stopPropagation()

    if (!confirming) {
      setConfirming(true)
      return
    }

    startTransition(async () => {
      const res = await requestCancelSession(sessionId)
      if (res.error) {
        setResult({ error: res.error })
        setConfirming(false)
      } else {
        setResult({ success: true })
        router.refresh()
      }
    })
  }

  function handleDismiss(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setConfirming(false)
  }

  if (result?.success) {
    return (
      <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
        Cancel Requested
      </span>
    )
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1" onClick={e => e.preventDefault()}>
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="text-xs font-medium px-2 py-1 rounded-full bg-destructive text-destructive-foreground flex items-center gap-1"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          Ya, Cancel
        </button>
        <button
          onClick={handleDismiss}
          className="text-xs font-medium px-2 py-1 rounded-full border border-border"
        >
          Batal
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleCancel}
      className="text-xs font-medium px-2 py-1 rounded-full border border-orange-300 text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-1"
    >
      <X className="w-3 h-3" />
      Cancel
    </button>
  )
}
