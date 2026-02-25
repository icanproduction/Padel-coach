'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createLocation } from '@/app/actions/location-actions'
import type { Location } from '@/types/database'
import { Plus, X, Loader2 } from 'lucide-react'

interface LocationsClientProps {
  locations: Location[]
}

export function LocationsClient({ locations }: LocationsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    google_maps_url: '',
    total_courts: 1,
    notes: '',
  })

  function resetForm() {
    setFormData({ name: '', address: '', google_maps_url: '', total_courts: 1, notes: '' })
    setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('Please enter a location name')
      return
    }
    if (!formData.address.trim()) {
      setError('Please enter an address')
      return
    }
    if (!formData.google_maps_url.trim()) {
      setError('Please enter a Google Maps URL')
      return
    }

    startTransition(async () => {
      const result = await createLocation({
        name: formData.name.trim(),
        address: formData.address.trim(),
        google_maps_url: formData.google_maps_url.trim(),
        total_courts: formData.total_courts,
        notes: formData.notes.trim() || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setShowForm(false)
        resetForm()
        router.refresh()
      }
    })
  }

  return (
    <>
      <button
        onClick={() => {
          resetForm()
          setShowForm(true)
        }}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Location
      </button>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPending) setShowForm(false)
          }}
        >
          <div className="bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-lg w-full sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h2 className="text-base font-bold">Add Location</h2>
              <button
                onClick={() => !isPending && setShowForm(false)}
                className="p-1 rounded-lg hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <form id="add-location-form" onSubmit={handleSubmit} className="px-4 pb-3 space-y-3">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-xs rounded-lg p-2.5">
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Venue Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Northside Padel Court"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Full address..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>

                {/* Google Maps URL */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Google Maps URL</label>
                  <input
                    type="url"
                    value={formData.google_maps_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, google_maps_url: e.target.value }))}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>

                {/* Courts + Notes side by side */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Courts</label>
                    <select
                      value={formData.total_courts}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, total_courts: parseInt(e.target.value) }))
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n} court{n > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                      Notes <span className="font-normal">(opt)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Hours, contact..."
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Submit — pinned bottom */}
            <div className="px-4 py-3 border-t border-border bg-card">
              <button
                type="submit"
                form="add-location-form"
                disabled={isPending}
                className="w-full py-3 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending ? 'Adding...' : 'Add Location'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
