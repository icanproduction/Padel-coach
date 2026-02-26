'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPlayer } from '@/app/actions/player-actions'
import { ArrowLeft, Loader2, User, AtSign, Phone } from 'lucide-react'

interface CreatePlayerFormProps {
  onClose: () => void
}

export function CreatePlayerForm({ onClose }: CreatePlayerFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    phone: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!formData.full_name.trim()) {
      setError('Nama harus diisi')
      return
    }
    if (!formData.username.trim()) {
      setError('Username harus diisi')
      return
    }
    if (formData.username.includes('@') || formData.username.includes(' ')) {
      setError('Username tidak boleh mengandung @ atau spasi')
      return
    }

    startTransition(async () => {
      const result = await createPlayer({
        full_name: formData.full_name.trim(),
        username: formData.username.trim(),
        phone: formData.phone || undefined,
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
        <h1 className="text-base font-semibold flex-1">New Player</h1>
      </div>

      {/* Scrollable form body */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-xl p-3">
              {error}
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-500/10 text-blue-600 text-sm rounded-xl p-3">
            Player akan dibuat dengan password default <strong>123456</strong>. Player bisa login dan ganti password sendiri.
          </div>

          {/* Full Name */}
          <section>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                placeholder="Nama lengkap player"
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
          </section>

          {/* Username */}
          <section>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Username
            </label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="username"
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>
          </section>

          {/* Phone */}
          <section>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Phone <span className="font-normal normal-case">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+628xxx"
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </section>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? 'Creating...' : 'Create Player'}
          </button>
        </div>
      </form>
    </div>
  )
}
