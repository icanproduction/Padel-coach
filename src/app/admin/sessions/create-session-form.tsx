'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createSession } from '@/app/actions/session-actions'
import type { Profile, Location, SessionType } from '@/types/database'
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Dumbbell,
  Gamepad2,
  Link2,
} from 'lucide-react'

interface CreateSessionFormProps {
  coaches: Profile[]
  locations: Location[]
  onClose: () => void
}

const SESSION_TYPES: {
  value: SessionType
  label: string
  icon: React.ElementType
  activeClass: string
}[] = [
  {
    value: 'discovery',
    label: 'Discovery',
    icon: Sparkles,
    activeClass: 'bg-purple-500/10 border-purple-500 text-purple-600',
  },
  {
    value: 'coaching_drilling',
    label: 'Coaching',
    icon: Dumbbell,
    activeClass: 'bg-blue-500/10 border-blue-500 text-blue-600',
  },
  {
    value: 'open_play',
    label: 'Open Play',
    icon: Gamepad2,
    activeClass: 'bg-green-500/10 border-green-500 text-green-600',
  },
]

const DURATION_OPTIONS = [1, 2, 3, 4]
const PLAYER_OPTIONS = [1, 2, 3, 4]

export function CreateSessionForm({ coaches, locations, onClose }: CreateSessionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    coach_id: coaches[0]?.id ?? '',
    date: '',
    time: '07:00',
    session_type: 'coaching_drilling' as SessionType,
    max_players: 4,
    location_id: '',
    courts_booked: 1,
    duration_hours: 1,
    reclub_url: '',
    notes: '',
  })

  const isOpenPlay = formData.session_type === 'open_play'
  const selectedLocation = locations.find((l) => l.id === formData.location_id)
  const maxCourts = selectedLocation?.courts ?? 5

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!formData.coach_id) {
      setError('Please select a coach')
      return
    }
    if (!formData.date) {
      setError('Pilih tanggal dulu')
      return
    }

    startTransition(async () => {
      const dateTime = `${formData.date}T${formData.time}`
      const result = await createSession({
        coach_id: formData.coach_id,
        date: new Date(dateTime).toISOString(),
        session_type: formData.session_type,
        max_players: isOpenPlay ? 99 : formData.max_players,
        location_id: formData.location_id || undefined,
        courts_booked: isOpenPlay ? null : formData.courts_booked,
        duration_hours: formData.duration_hours,
        reclub_url: formData.reclub_url || undefined,
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
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border bg-card">
        <button
          type="button"
          onClick={() => !isPending && onClose()}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold flex-1">New Session</h1>
      </div>

      {/* Scrollable form body — button is inside, below notes */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-xl p-3">
              {error}
            </div>
          )}

          {/* Session Type */}
          <section>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Session Type
            </label>
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
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? type.activeClass
                        : 'border-transparent bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] font-semibold leading-tight">{type.label}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Coach */}
          <section>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Coach
            </label>
            <select
              value={formData.coach_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, coach_id: e.target.value }))}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {coaches.length === 0 && <option value="">No coaches available</option>}
              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.full_name}
                </option>
              ))}
            </select>
          </section>

          {/* Date & Time — separate inputs */}
          <div className="grid grid-cols-2 gap-3">
            <section>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                Tanggal
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </section>
            <section>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                Jam
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </section>
          </div>

          {/* Location */}
          <section>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Location
            </label>
            <select
              value={formData.location_id}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  location_id: e.target.value,
                  courts_booked: 1,
                }))
              }
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
            >
              <option value="">Select location...</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.courts} courts)
                </option>
              ))}
            </select>
          </section>

          {/* Duration — pill buttons */}
          <section>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Duration
            </label>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map((d) => {
                const isSelected = formData.duration_hours === d
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, duration_hours: d }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    {d}h
                  </button>
                )
              })}
            </div>
          </section>

          {/* Courts + Players — pill buttons (hidden for Open Play) */}
          {!isOpenPlay && (
            <div className="grid grid-cols-2 gap-4">
              <section>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  Courts
                </label>
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(maxCourts, 4) }, (_, i) => i + 1).map((n) => {
                    const isSelected = formData.courts_booked === n
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, courts_booked: n }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        {n}
                      </button>
                    )
                  })}
                </div>
              </section>

              <section>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  Max Players
                </label>
                <div className="flex gap-2">
                  {PLAYER_OPTIONS.map((n) => {
                    const isSelected = formData.max_players === n
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, max_players: n }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        {n}
                      </button>
                    )
                  })}
                </div>
              </section>
            </div>
          )}

          {/* ReClub Link */}
          <section>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Link ReClub <span className="font-normal normal-case">(optional)</span>
            </label>
            <div className="relative">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="url"
                value={formData.reclub_url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, reclub_url: e.target.value }))
                }
                placeholder="https://reclub.co/id/m/..."
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </section>

          {/* Notes */}
          <section>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Notes <span className="font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder={
                isOpenPlay
                  ? 'e.g. Bring own balls, Level 3+ only...'
                  : 'Focus areas, instructions...'
              }
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </section>

          {/* Submit button — inline below notes */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? 'Creating...' : 'Create Session'}
          </button>
        </div>
      </form>
    </div>
  )
}
