import { getAnnouncements } from '@/app/actions/announcement-actions'
import { AnnouncementForm } from './announcement-form'
import { Megaphone } from 'lucide-react'

export const dynamic = 'force-dynamic'

const TARGET_LABELS: Record<string, string> = {
  all: 'Semua',
  player: 'Player',
  coach: 'Coach',
}

export default async function AdminAnnouncementsPage() {
  const result = await getAnnouncements()
  const announcements = result.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Announcements</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kirim pengumuman ke player dan coach
        </p>
      </div>

      {/* Error */}
      {result.error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-xl p-4">
          {result.error}
        </div>
      )}

      {/* Form */}
      <AnnouncementForm />

      {/* Past Announcements */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Riwayat Pengumuman</h2>

        {announcements.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Belum ada pengumuman</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a: any) => (
              <div
                key={a.id}
                className="bg-card border border-border rounded-xl p-4 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm">{a.title}</h3>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full whitespace-nowrap">
                    {TARGET_LABELS[a.target_role] || a.target_role}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {a.message}
                </p>
                <p className="text-xs text-muted-foreground/60">
                  {new Date(a.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
