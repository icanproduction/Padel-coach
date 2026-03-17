import { createServerSupabaseClient } from '@/lib/supabase/server'
import { BadgeManager } from './badge-manager'

export const dynamic = 'force-dynamic'

export default async function AdminBadgesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: badges } = await supabase
    .from('badges')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: players } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('role', 'player')
    .order('full_name')

  const { data: playerBadges } = await supabase
    .from('player_badges')
    .select('*, badge:badges(name, image_url), player:profiles!player_badges_player_id_fkey(id, full_name)')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Achievement Badges</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Buat badge dan berikan ke player
        </p>
      </div>

      <BadgeManager
        badges={badges ?? []}
        players={players ?? []}
        playerBadges={playerBadges ?? []}
      />
    </div>
  )
}
