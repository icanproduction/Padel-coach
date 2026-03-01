'use client'

import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Clock } from 'lucide-react'

export default function PendingApprovalPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold">Menunggu Persetujuan</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Akun coach kamu sedang menunggu persetujuan dari admin. Silakan hubungi admin untuk aktivasi akun.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 text-sm font-medium rounded-xl border border-border hover:bg-muted transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
