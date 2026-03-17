'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { createAnnouncement } from '@/app/actions/announcement-actions'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const TARGET_OPTIONS = [
  { value: 'all', label: 'Semua' },
  { value: 'player', label: 'Player' },
  { value: 'coach', label: 'Coach' },
] as const

type TargetRole = 'all' | 'player' | 'coach'

export function AnnouncementForm() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [targetRole, setTargetRole] = useState<TargetRole>('all')
  const [sending, setSending] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !message.trim()) {
      toast({ title: 'Error', description: 'Judul dan pesan harus diisi', variant: 'destructive' })
      return
    }

    setSending(true)
    const result = await createAnnouncement(title.trim(), message.trim(), targetRole)
    setSending(false)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Berhasil', description: 'Pengumuman berhasil dikirim' })
      setTitle('')
      setMessage('')
      setTargetRole('all')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 space-y-4">
      <h2 className="text-lg font-semibold">Buat Pengumuman</h2>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Judul</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul pengumuman..."
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={sending}
        />
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Pesan</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Isi pengumuman..."
          rows={4}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          disabled={sending}
        />
      </div>

      {/* Target Role Pills */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Kirim ke</label>
        <div className="flex gap-2">
          {TARGET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTargetRole(opt.value)}
              disabled={sending}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                targetRole === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={sending || !title.trim() || !message.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
      >
        <Send className="w-4 h-4" />
        {sending ? 'Mengirim...' : 'Kirim Pengumuman'}
      </button>
    </form>
  )
}
