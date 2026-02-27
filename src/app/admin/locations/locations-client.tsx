'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createLocation, updateLocation, deleteLocation } from '@/app/actions/location-actions'
import type { Location } from '@/types/database'
import { Plus, X, Loader2, MapPin, ExternalLink, Pencil, Trash2 } from 'lucide-react'

interface LocationsClientProps {
  locations: Location[]
}

type FormMode = 'add' | 'edit'

export function LocationsClient({ locations }: LocationsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>('add')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    maps_link: '',
    courts: 1,
  })

  function resetForm() {
    setFormData({ name: '', address: '', maps_link: '', courts: 1 })
    setEditingId(null)
    setFormMode('add')
    setError(null)
  }

  function openAdd() {
    resetForm()
    setShowForm(true)
  }

  function openEdit(loc: Location) {
    setFormData({
      name: loc.name,
      address: loc.address || '',
      maps_link: loc.maps_link || '',
      courts: loc.courts,
    })
    setEditingId(loc.id)
    setFormMode('edit')
    setError(null)
    setShowForm(true)
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

    startTransition(async () => {
      if (formMode === 'edit' && editingId) {
        const result = await updateLocation(editingId, {
          name: formData.name.trim(),
          address: formData.address.trim(),
          courts: formData.courts,
          maps_link: formData.maps_link.trim() || undefined,
        })
        if (result.error) {
          setError(result.error)
        } else {
          setShowForm(false)
          resetForm()
          router.refresh()
        }
      } else {
        const result = await createLocation({
          name: formData.name.trim(),
          address: formData.address.trim(),
          courts: formData.courts,
          maps_link: formData.maps_link.trim() || undefined,
        })
        if (result.error) {
          setError(result.error)
        } else {
          setShowForm(false)
          resetForm()
          router.refresh()
        }
      }
    })
  }

  function handleDelete(locationId: string) {
    startTransition(async () => {
      const result = await deleteLocation(locationId)
      if (result.error) {
        setError(result.error)
      } else {
        setConfirmDeleteId(null)
        router.refresh()
      }
    })
  }

  return (
    <>
      {/* Add button (rendered in header via page.tsx) */}
      <button
        onClick={openAdd}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Location
      </button>

      {/* Location cards */}
      {locations.length > 0 ? (
        <div className="space-y-3 mt-6">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="bg-card rounded-xl border border-border p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <h3 className="font-semibold text-sm truncate">{loc.name}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                      {loc.courts} court{loc.courts > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6 truncate">
                    {loc.address}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {loc.maps_link && (
                    <a
                      href={loc.maps_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => openEdit(loc)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(loc.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Delete confirmation */}
              {confirmDeleteId === loc.id && (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-3">
                  <p className="text-xs text-destructive">Hapus {loc.name}?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      disabled={isPending}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-accent transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleDelete(loc.id)}
                      disabled={isPending}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                      Hapus
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8 text-center mt-6">
          <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No locations found. Add your first padel court location.
          </p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
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
              <h2 className="text-base font-bold">
                {formMode === 'edit' ? 'Edit Location' : 'Add Location'}
              </h2>
              <button
                onClick={() => !isPending && setShowForm(false)}
                className="p-1 rounded-lg hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <form id="location-form" onSubmit={handleSubmit} className="px-4 pb-3 space-y-3">
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

                {/* Courts */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Courts</label>
                  <select
                    value={formData.courts}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, courts: parseInt(e.target.value) }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        {n} court{n > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Google Maps Link */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Google Maps Link <span className="font-normal">(opt)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.maps_link}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maps_link: e.target.value }))}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </form>
            </div>

            {/* Submit — pinned bottom */}
            <div className="px-4 py-3 border-t border-border bg-card">
              <button
                type="submit"
                form="location-form"
                disabled={isPending}
                className="w-full py-3 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending
                  ? (formMode === 'edit' ? 'Saving...' : 'Adding...')
                  : (formMode === 'edit' ? 'Save Changes' : 'Add Location')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
