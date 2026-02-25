'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createLocation } from '@/app/actions/location-actions'
import type { Location } from '@/types/database'
import { Plus, X, Loader2, MapPin } from 'lucide-react'

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
    setFormData({
      name: '',
      address: '',
      google_maps_url: '',
      total_courts: 1,
      notes: '',
    })
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

      {/* Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPending) setShowForm(false)
          }}
        >
          <div className="bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-lg w-full sm:max-w-md max-h-[92vh] flex flex-col">
            {/* Handle bar (mobile) */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-2">
              <h2 className="text-lg font-bold">Add Location</h2>
              <button
                onClick={() => !isPending && setShowForm(false)}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3">
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="text-sm font-medium block mb-1.5">Venue Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Northside Padel Court"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="text-sm font-medium block mb-1.5">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Full address..."
                    rows={2}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    required
                  />
                </div>

                {/* Google Maps URL */}
                <div>
                  <label className="text-sm font-medium block mb-1.5">Google Maps URL</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="url"
                      value={formData.google_maps_url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, google_maps_url: e.target.value }))}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                </div>

                {/* Total Courts */}
                <div>
                  <label className="text-sm font-medium block mb-1.5">Total Courts</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => {
                      const isSelected = formData.total_courts === num
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, total_courts: num }))}
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

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium block mb-1.5">
                    Notes <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Operating hours, facilities, contact info..."
                    rows={2}
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
                  {isPending ? 'Adding Location...' : 'Add Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
