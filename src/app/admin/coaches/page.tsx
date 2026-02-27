import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CoachesClient } from './coaches-client'
import type { Profile } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function AdminCoachesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: coaches, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'coach')
    .order('full_name')

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coaches</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {coaches?.length ?? 0} registered coach{(coaches?.length ?? 0) !== 1 ? 'es' : ''}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-card rounded-xl border border-destructive/50 p-6 text-center">
          <p className="text-sm text-destructive">Failed to load coaches: {error.message}</p>
        </div>
      )}

      {/* Client component with add button + coach list */}
      <CoachesClient coaches={(coaches as Profile[]) ?? []} />
    </div>
  )
}
