'use client'

import { BottomNav } from './bottom-nav'
import { Header } from './header'
import type { Profile, UserRole } from '@/types/database'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: Profile
  role: UserRole
}

export function DashboardLayout({ children, user, role }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="px-4 py-4 pb-24 max-w-lg mx-auto">
        {children}
      </main>

      <BottomNav role={role} />
    </div>
  )
}
