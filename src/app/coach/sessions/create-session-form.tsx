'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createSession } from '@/app/actions/session-actions'
import type { SessionType } from '@/types/database'
import { Plus, X, Loader2 } from 'lucide-react'

interface CoachCreateSessionFormProps {
  coachId: string
}

const SESSION_TYPES: { value: SessionType; label: string }[] = [
  { value: 'discovery', label: 'Discovery' },
  { value: 'regular', label: 'Regular' },
  { value: 'assessment_only', label: 'Assessment Only' },
]

export function CoachCreateSessionForm({ coachId }: CoachCreateSessionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    date: '',
    session_type: 'regular' as SessionType,
    max_players: 4,
    notes: '',
  })

  function resetForm() {
    setFormData({
      date: '',
      session_type: 'regular',
      max_players: 4,
      notes: '',
    })
    setError(null)
  }

  function handleOpen() {
    resetForm()
    setIsOpen(true)
  }

  function handleClose() {
    if (!isPending) setIsOpen(false)
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'max_players' ? parseInt(value) || 1 : value,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!formData.date) {
      setError('Please select a date and time')
      return
    }

    startTransition(async () => {
      const result = await createSession({
        coach_id: coachId,
        date: new Date(formData.date).toISOString(),
        session_type: formData.session_type,
        max_players: formData.max_players,
        notes: formData.notes || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setIsOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <>
      {/* Create Button */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Session
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl border border-border shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Create Session</h2>
              <button
                onClick={handleClose}
                className="p-1 rounded-md hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3">
                  {error}
                </div>
              )}

              {/* Date & Time */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              {/* Session Type */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">
                  Session Type
                </label>
                <select
                  name="session_type"
                  value={formData.session_type}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {SESSION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Players */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">
                  Max Players
                </label>
                <input
                  type="number"
                  name="max_players"
                  value={formData.max_players}
                  onChange={handleChange}
                  min={1}
                  max={20}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Session description, focus areas, etc."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isPending ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
