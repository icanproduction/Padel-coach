'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createSession } from '@/app/actions/session-actions'
import type { Profile, SessionType } from '@/types/database'
import { X, Loader2, Sparkles, Target, ClipboardCheck, MapPin } from 'lucide-react'

interface CreateSessionFormProps {
  coaches: Profile[]
  onClose: () => void
}

const SESSION_TYPES: {
  value: SessionType
  label: string
  description: string
  icon: React.ElementType
  color: string
}[] = [
  {
    value: 'discovery',
    label: 'Discovery',
    description: 'First-time player assessment',
    icon: Sparkles,
    color: 'border-purple-300 bg-purple-50 text-purple-700 ring-purple-500',
  },
  {
    value: 'regular',
    label: 'Regular',
    description: 'Standard coaching session',
    icon: Target,
    color: 'border-blue-300 bg-blue-50 text-blue-700 ring-blue-500',
  },
  {
    value: 'assessment_only',
    label: 'Assessment',
    description: 'Skills evaluation only',
    icon: ClipboardCheck,
    color: 'border-orange-300 bg-orange-50 text-orange-700 ring-orange-500',
  },
]

const PLAYER_OPTIONS = [1, 2, 3, 4]

export function CreateSessionForm({ coaches, onClose }: CreateSessionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    coach_id: coaches[0]?.id ?? '',
    date: '',
    session_type: 'regular' as SessionType,
    max_players: 4,
    location: '',
    notes: '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!formData.coach_id) {
      setError('Please select a coach')
      return
    }
    if (!formData.date) {
      setError('Please select a date and time')
      return
    }

    startTransition(async () => {
      const result = await createSession({
        coach_id: formData.coach_id,
        date: new Date(formData.date).toISOString(),
        session_type: formData.session_type,
        max_players: formData.max_players,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        onClose()
        router.refresh()
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-lg w-full sm:max-w-md max-h-[92vh] flex flex-col">
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="text-lg font-bold">New Session</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Coach */}
          <div>
            <label className="text-sm font-medium block mb-2">Coach</label>
            <select
              name="coach_id"
              value={formData.coach_id}
              onChange={handleChange}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {coaches.length === 0 && <option value="">No coaches available</option>}
              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Session Type — Card Selector */}
          <div>
            <label className="text-sm font-medium block mb-2">Session Type</label>
            <div className="grid grid-cols-3 gap-2">
              {SESSION_TYPES.map((type) => {
                const Icon = type.icon
                const isSelected = formData.session_type === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, session_type: type.value }))
                    }
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                      isSelected
                        ? `${type.color} ring-2`
                        : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/40'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-semibold">{type.label}</span>
                    <span className="text-[10px] leading-tight opacity-80">
                      {type.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="text-sm font-medium block mb-2">Date & Time</label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium block mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Court 1, Padel Arena Jakarta"
                className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Max Players — Button Group */}
          <div>
            <label className="text-sm font-medium block mb-2">Max Players</label>
            <div className="grid grid-cols-4 gap-2">
              {PLAYER_OPTIONS.map((num) => {
                const isSelected = formData.max_players === num
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, max_players: num }))}
                    className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/40'
                    }`}
                  >
                    {num}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium block mb-2">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Focus areas, special instructions..."
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
          </div>

          {/* Sticky Submit Button */}
          <div className="sticky bottom-0 px-4 py-4 border-t border-border bg-card safe-area-bottom">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? 'Creating Session...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
