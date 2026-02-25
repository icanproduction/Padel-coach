import { createServerSupabaseClient } from '@/lib/supabase/server'
import { MapPin, ExternalLink } from 'lucide-react'
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
        <LocationsClient locations={allLocations} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-xl p-4">
          Failed to load locations: {error.message}
        </div>
      )}

      {/* Locations list */}
      {allLocations.length > 0 ? (
        <div className="space-y-3">
          {allLocations.map((loc) => (
            <div
              key={loc.id}
              className="bg-card rounded-xl border border-border p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <h3 className="font-semibold text-sm">{loc.name}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {loc.total_courts} court{loc.total_courts > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    {loc.address}
                  </p>
                  {loc.notes && (
                    <p className="text-xs text-muted-foreground/75 mt-1 ml-6">
                      {loc.notes}
                    </p>
                  )}
                </div>
                <a
                  href={loc.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors flex-shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in Maps
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No locations found. Add your first padel court location.
          </p>
        </div>
      )}
    </div>
  )
}
