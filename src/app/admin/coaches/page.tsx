import { createServerSupabaseClient } from '@/lib/supabase/server'
import { UserCheck, Mail, Phone } from 'lucide-react'
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
      <div>
        <h1 className="text-2xl font-bold">Coaches</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {coaches?.length ?? 0} registered coach{(coaches?.length ?? 0) !== 1 ? 'es' : ''}
        </p>
      </div>

      {/* Coach list */}
      {error ? (
        <div className="bg-card rounded-xl border border-destructive/50 p-6 text-center">
          <p className="text-sm text-destructive">Failed to load coaches: {error.message}</p>
        </div>
      ) : coaches && coaches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coaches.map((coach: Profile) => {
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
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
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

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {coach.full_name}
                    </h3>

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
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <UserCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No coaches registered yet.
          </p>
        </div>
      )}
    </div>
  )
}
