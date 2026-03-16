'use client'

import { BottomNav } from './bottom-nav'
import { Header } from './header'
import { RoleSidebar } from './role-sidebar'
import type { Profile, UserRole } from '@/types/database'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: Profile
  role: UserRole
  logoUrl?: string | null
}

export function DashboardLayout({ children, user, role, logoUrl }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar - hidden on mobile */}
      <RoleSidebar user={user} role={role} logoUrl={logoUrl} />

      {/* Mobile header - hidden on desktop */}
      <div className="lg:hidden">
        <Header user={user} logoUrl={logoUrl} />
      </div>

      {/* Main content - mobile: compact, desktop: wide */}
      <main className="px-4 py-4 pb-24 max-w-lg mx-auto lg:ml-64 lg:max-w-4xl lg:mx-0 lg:pb-8 lg:px-8 lg:py-6">
        {children}
      </main>

      {/* Mobile bottom nav - hidden on desktop */}
      <div className="lg:hidden">
        <BottomNav role={role} />
      </div>
    </div>
  )
}
