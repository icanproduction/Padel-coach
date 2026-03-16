'use client'

import { useState, useTransition } from 'react'
import { saveCoachFeedback } from '@/app/actions/recap-actions'
import { Loader2, Send, Check } from 'lucide-react'

interface CoachFeedbackFormProps {
  sessionId: string
  playerId: string
  playerName: string
  existingFeedback: string | null
}

export function CoachFeedbackForm({
  sessionId,
  playerId,
  playerName,
  existingFeedback,
}: CoachFeedbackFormProps) {
  const [feedback, setFeedback] = useState(existingFeedback || '')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(false)
    startTransition(async () => {
      const result = await saveCoachFeedback(sessionId, playerId, feedback)
      if (!result.error) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    })
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">
        Feedback untuk {playerName}
      </label>
      <div className="flex gap-2">
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Tulis feedback untuk player..."
          rows={2}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
        <button
          onClick={handleSave}
          disabled={isPending}
          className="self-end px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}
