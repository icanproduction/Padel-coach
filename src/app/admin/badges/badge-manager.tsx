'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { createBadge, deleteBadge, giveBadgeToPlayer, removeBadgeFromPlayer } from '@/app/actions/badge-actions'
import { Plus, Trash2, Award, Upload, UserPlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Badge {
  id: string
  name: string
  description: string | null
  image_url: string | null
  created_at: string
}

interface Player {
  id: string
  full_name: string
  avatar_url: string | null
}

interface PlayerBadge {
  id: string
  player_id: string
  badge_id: string
  badge: { name: string; image_url: string | null } | null
  player: { id: string; full_name: string } | null
}

interface BadgeManagerProps {
  badges: Badge[]
  players: Player[]
  playerBadges: PlayerBadge[]
}

export function BadgeManager({ badges, players, playerBadges }: BadgeManagerProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [givingBadgeId, setGivingBadgeId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await createBadge(formData)
    setLoading(false)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Berhasil', description: 'Badge berhasil dibuat' })
      setShowCreate(false)
      router.refresh()
    }
  }

  async function handleDelete(badgeId: string) {
    if (!confirm('Hapus badge ini? Semua player yang memiliki badge ini akan kehilangannya.')) return
    const result = await deleteBadge(badgeId)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      router.refresh()
    }
  }

  async function handleGive(badgeId: string, playerId: string) {
    setLoading(true)
    const result = await giveBadgeToPlayer(badgeId, playerId)
    setLoading(false)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Berhasil', description: 'Badge diberikan ke player' })
      setGivingBadgeId(null)
      router.refresh()
    }
  }

  async function handleRemove(badgeId: string, playerId: string) {
    const result = await removeBadgeFromPlayer(badgeId, playerId)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Badge Button */}
      {!showCreate ? (
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Buat Badge Baru
        </button>
      ) : (
        <form onSubmit={handleCreate} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Badge Baru</h2>
            <button type="button" onClick={() => setShowCreate(false)} className="p-1 text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="text-sm font-medium">Nama Badge *</label>
            <input
              name="name"
              required
              className="w-full mt-1 h-10 rounded-lg border border-input bg-background px-3 text-sm"
              placeholder="e.g. 10 Sessions Completed"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Deskripsi</label>
            <input
              name="description"
              className="w-full mt-1 h-10 rounded-lg border border-input bg-background px-3 text-sm"
              placeholder="e.g. Menyelesaikan 10 sesi latihan"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Gambar Badge</label>
            <div className="mt-1">
              <input
                ref={fileRef}
                type="file"
                name="image"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                id="badge-image"
              />
              <label
                htmlFor="badge-image"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm cursor-pointer hover:bg-accent transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Gambar
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Badge'}
          </button>
        </form>
      )}

      {/* Badge List */}
      <div className="space-y-4">
        {badges.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Award className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Belum ada badge. Buat badge pertama!</p>
          </div>
        ) : (
          badges.map((badge) => {
            const holders = playerBadges.filter((pb) => pb.badge_id === badge.id)
            const holderIds = new Set(holders.map((h) => h.player_id))
            const availablePlayers = players.filter((p) => !holderIds.has(p.id))

            return (
              <div key={badge.id} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-start gap-4">
                  {/* Badge Image */}
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {badge.image_url ? (
                      <img src={badge.image_url} alt={badge.name} className="w-full h-full object-cover" />
                    ) : (
                      <Award className="w-7 h-7 text-muted-foreground" />
                    )}
                  </div>

                  {/* Badge Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{badge.name}</h3>
                    {badge.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {holders.length} player memiliki badge ini
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGivingBadgeId(givingBadgeId === badge.id ? null : badge.id)}
                      className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
                      title="Berikan ke player"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(badge.id)}
                      className="p-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
                      title="Hapus badge"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Give Badge Panel */}
                {givingBadgeId === badge.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium mb-2">Berikan ke Player:</p>
                    {availablePlayers.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Semua player sudah memiliki badge ini</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {availablePlayers.map((player) => (
                          <button
                            key={player.id}
                            onClick={() => handleGive(badge.id, player.id)}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                          >
                            <Plus className="w-3 h-3" />
                            {player.full_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Current Holders */}
                {holders.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex flex-wrap gap-2">
                      {holders.map((h) => (
                        <span
                          key={h.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full text-xs"
                        >
                          {h.player?.full_name}
                          <button
                            onClick={() => handleRemove(badge.id, h.player_id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
