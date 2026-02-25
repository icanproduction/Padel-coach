'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createSession } from '@/app/actions/session-actions'
import type { Location, SessionType } from '@/types/database'
import { Plus, X, Loader2, Sparkles, Dumbbell, MapPin, ExternalLink } from 'lucide-react'

interface CoachCreateSessionFormProps {
  coachId: string
  locations: Location[]
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
    value: 'coaching_drilling',
    label: 'Coaching & Drilling',
    description: 'Modules, drills & scoring',
    icon: Dumbbell,
    color: 'border-blue-300 bg-blue-50 text-blue-700 ring-blue-500',
  },
]

const PLAYER_OPTIONS = [1, 2, 3, 4]
const DURATION_OPTIONS = [1, 1.5, 2, 2.5, 3]

export function CoachCreateSessionForm({ coachId, locations }: CoachCreateSessionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    date: '',
    session_type: 'coaching_drilling' as SessionType,
    max_players: 4,
    location_id: '',
    courts_booked: 1,
    duration_hours: 1,
    notes: '',
  })

  const selectedLocation = locations.find(l => l.id === formData.location_id)
  const maxCourts = selectedLocation?.total_courts ?? 10

  function resetForm() {
    setFormData({
      date: '',
      session_type: 'coaching_drilling',
      max_players: 4,
      location_id: '',
      courts_booked: 1,
      duration_hours: 1,
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
        location_id: formData.location_id || undefined,
        courts_booked: formData.courts_booked,
        duration_hours: formData.duration_hours,
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

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose()
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
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3">
                    {error}
                  </div>
                )}

                {/* Session Type — Card Selector */}
                <div>
                  <label className="text-sm font-medium block mb-2">Session Type</label>
                  <div className="grid grid-cols-2 gap-2">
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
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>

                {/* Location — Dropdown */}
                <div>
                  <label className="text-sm font-medium block mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                      value={formData.location_id}
                      onChange={(e) => {
                        const locId = e.target.value
                        setFormData((prev) => ({
                          ...prev,
                          location_id: locId,
                          courts_booked: 1,
                        }))
                      }}
                      className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                    >
                      <option value="">Select location...</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} ({loc.total_courts} courts)
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedLocation && (
                    <div className="mt-2 px-3 py-2 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                      <p>{selectedLocation.address}</p>
                      {selectedLocation.notes && (
                        <p className="mt-1 opacity-75">{selectedLocation.notes}</p>
                      )}
                      <a
                        href={selectedLocation.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open in Maps
                      </a>
                    </div>
                  )}
                </div>

                {/* Courts Booked & Duration — Side by Side */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Courts Booked */}
                  <div>
                    <label className="text-sm font-medium block mb-2">Courts</label>
                    <div className="flex gap-1.5">
                      {Array.from({ length: Math.min(maxCourts, 4) }, (_, i) => i + 1).map((num) => {
                        const isSelected = formData.courts_booked === num
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, courts_booked: num }))}
                            className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
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

                  {/* Duration */}
                  <div>
                    <label className="text-sm font-medium block mb-2">Duration (hrs)</label>
                    <select
                      value={formData.duration_hours}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, duration_hours: parseFloat(e.target.value) }))
                      }
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {DURATION_OPTIONS.map((d) => (
                        <option key={d} value={d}>
                          {d} {d === 1 ? 'hour' : 'hours'}
                        </option>
                      ))}
                    </select>
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
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
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
      )}
    </>
  )
}
