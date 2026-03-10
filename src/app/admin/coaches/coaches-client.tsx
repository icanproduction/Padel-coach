'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createCoach, approveCoach, unapproveCoach, updateCoach } from '@/app/actions/player-actions'
import type { Profile } from '@/types/database'
import {
  Plus,
  X,
  Loader2,
  Mail,
  Phone,
  UserCheck,
  User,
  CheckCircle2,
  XCircle,
  Search,
  Pencil,
} from 'lucide-react'

interface CoachesClientProps {
  coaches: Profile[]
}

export function CoachesClient({ coaches }: CoachesClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingCoach, setEditingCoach] = useState<Profile | null>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
  })

  const [editData, setEditData] = useState({
    full_name: '',
    email: '',
    phone: '',
  })

  function resetForm() {
    setFormData({ full_name: '', email: '', phone: '' })
    setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!formData.full_name.trim()) {
      setError('Nama harus diisi')
      return
    }
    if (!formData.email.trim()) {
      setError('Email harus diisi')
      return
    }

    startTransition(async () => {
      const result = await createCoach({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone || undefined,
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

  function handleApprove(coachId: string) {
    setActionId(coachId)
    startTransition(async () => {
      await approveCoach(coachId)
      setActionId(null)
      router.refresh()
    })
  }

  function handleUnapprove(coachId: string) {
    setActionId(coachId)
    startTransition(async () => {
      await unapproveCoach(coachId)
      setActionId(null)
      router.refresh()
    })
  }

  function openEdit(coach: Profile) {
    setEditingCoach(coach)
    setEditData({
      full_name: coach.full_name,
      email: coach.email,
      phone: coach.phone || '',
    })
    setError(null)
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingCoach) return
    setError(null)

    if (!editData.full_name.trim()) {
      setError('Nama harus diisi')
      return
    }
    if (!editData.email.trim()) {
      setError('Email harus diisi')
      return
    }

    startTransition(async () => {
      const result = await updateCoach(editingCoach.id, {
        full_name: editData.full_name.trim(),
        email: editData.email.trim(),
        phone: editData.phone || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setEditingCoach(null)
        router.refresh()
      }
    })
  }

  // Filter by search
  const filtered = coaches.filter((c) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q))
    )
  })

  // Sort: pending first, then active
  const sortedCoaches = [...filtered].sort((a, b) => {
    if (a.is_approved === b.is_approved) return 0
    return a.is_approved ? 1 : -1
  })

  return (
    <>
      {/* Search + Add Coach */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari coach..."
            className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Coach
        </button>
      </div>

      {/* Coach list */}
      {sortedCoaches.length > 0 ? (
        <div className="space-y-3 mt-4">
          {sortedCoaches.map((coach) => {
            const initials = coach.full_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)

            return (
              <div
                key={coach.id}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                    coach.is_approved
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {coach.avatar_url ? (
                      <img
                        src={coach.avatar_url}
                        alt={coach.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate">
                        {coach.full_name}
                      </h3>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        coach.is_approved
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {coach.is_approved ? 'Active' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{coach.email}</span>
                    </div>
                    {coach.phone && (
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{coach.phone}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Joined{' '}
                      {new Date(coach.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Edit button */}
                  <button
                    onClick={() => openEdit(coach)}
                    className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground flex-shrink-0"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>

                {/* Approve / Unapprove buttons */}
                <div className="mt-3 pt-3 border-t border-border flex gap-2">
                  {!coach.is_approved ? (
                    <button
                      onClick={() => handleApprove(coach.id)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {actionId === coach.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnapprove(coach.id)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {actionId === coach.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      Unapprove
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8 text-center mt-4">
          <UserCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {searchQuery ? 'Tidak ada coach yang cocok.' : 'No coaches registered yet. Add your first coach.'}
          </p>
        </div>
      )}

      {/* Add Coach Form Modal */}
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
              <h2 className="text-base font-bold">Add Coach</h2>
              <button
                onClick={() => !isPending && setShowForm(false)}
                className="p-1 rounded-lg hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <form id="add-coach-form" onSubmit={handleSubmit} className="px-4 pb-3 space-y-3">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-xs rounded-lg p-2.5">
                    {error}
                  </div>
                )}

                <div className="bg-blue-500/10 text-blue-600 text-xs rounded-lg p-2.5">
                  Coach dibuat dengan password default <strong>123456</strong>.
                </div>

                {/* Full Name */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Nama lengkap coach"
                      className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                      className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                      autoCapitalize="none"
                      autoCorrect="off"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Phone <span className="font-normal">(opt)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+628xxx"
                      className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Submit */}
            <div className="px-4 py-3 border-t border-border bg-card">
              <button
                type="submit"
                form="add-coach-form"
                disabled={isPending}
                className="w-full py-3 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending ? 'Adding...' : 'Add Coach'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Coach Modal */}
      {editingCoach && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPending) setEditingCoach(null)
          }}
        >
          <div className="bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-lg w-full sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h2 className="text-base font-bold">Edit Coach</h2>
              <button
                onClick={() => !isPending && setEditingCoach(null)}
                className="p-1 rounded-lg hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <form id="edit-coach-form" onSubmit={handleEditSubmit} className="px-4 pb-3 space-y-3">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-xs rounded-lg p-2.5">
                    {error}
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={editData.full_name}
                      onChange={(e) => setEditData((prev) => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Nama lengkap coach"
                      className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                      className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                      autoCapitalize="none"
                      autoCorrect="off"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Phone <span className="font-normal">(opt)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+628xxx"
                      className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Submit */}
            <div className="px-4 py-3 border-t border-border bg-card">
              <button
                type="submit"
                form="edit-coach-form"
                disabled={isPending}
                className="w-full py-3 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
