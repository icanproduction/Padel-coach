import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SettingsForm } from './settings-form'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: settingsRows } = await supabase
    .from('app_settings')
    .select('key, value')

  const settings: Record<string, string | null> = {}
  settingsRows?.forEach((row: { key: string; value: string | null }) => {
    settings[row.key] = row.value
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola konfigurasi aplikasi
        </p>
      </div>

      <SettingsForm
        appName={settings.app_name ?? 'Loop Padel Club'}
        logoUrl={settings.logo_url ?? null}
      />
    </div>
  )
}
