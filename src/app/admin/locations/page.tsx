import { createServerSupabaseClient } from '@/lib/supabase/server'
import { LocationsClient } from './locations-client'
import type { Location } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function AdminLocationsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: locations, error } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('name')

  const allLocations = (locations as Location[]) ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Locations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage padel court locations
          </p>
        </div>
        {/* Add button is inside LocationsClient */}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-xl p-4">
          Failed to load locations: {error.message}
        </div>
      )}

      {/* Client component renders cards + add/edit/delete */}
      <LocationsClient locations={allLocations} />
    </div>
  )
}
