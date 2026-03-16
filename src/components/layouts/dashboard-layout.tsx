'use client'

import { BottomNav } from './bottom-nav'
import { Header } from './header'
import { AdminSidebar } from './admin-sidebar'
import type { Profile, UserRole } from '@/types/database'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: Profile
  role: UserRole
  logoUrl?: string | null
}

export function DashboardLayout({ children, user, role, logoUrl }: DashboardLayoutProps) {
  // Admin gets desktop sidebar layout
  if (role === 'admin') {
    return (
      <div className="min-h-screen bg-background">
        {/* Desktop sidebar - hidden on mobile */}
        <AdminSidebar user={user} logoUrl={logoUrl} />

        {/* Mobile header - hidden on desktop */}
        <div className="lg:hidden">
          <Header user={user} logoUrl={logoUrl} />
        </div>

        {/* Main content */}
        <main className="px-4 py-4 pb-24 max-w-lg mx-auto lg:ml-64 lg:max-w-none lg:pb-8 lg:px-8 lg:py-6">
          {children}
        </main>

        {/* Mobile bottom nav - hidden on desktop */}
        <div className="lg:hidden">
          <BottomNav role={role} />
        </div>
      </div>
    )
  }

  // Coach & Player keep mobile-only layout
  return (
    <div className="min-h-screen bg-background">
      <Header user={user} logoUrl={logoUrl} />

      <main className="px-4 py-4 pb-24 max-w-lg mx-auto">
        {children}
      </main>

      <BottomNav role={role} />
    </div>
  )
}
