'use client'

import Link from 'next/link'
import { BottomNav } from './bottom-nav'
import { Header } from './header'
import { RoleSidebar } from './role-sidebar'
import { PullToRefresh } from '@/components/features/pull-to-refresh'
import { NotificationBell } from '@/components/features/notification-bell'
import type { Profile, UserRole } from '@/types/database'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: Profile
  role: UserRole
  logoUrl?: string | null
}

export function DashboardLayout({ children, user, role, logoUrl }: DashboardLayoutProps) {
  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar - hidden on mobile */}
      <RoleSidebar user={user} role={role} logoUrl={logoUrl} />

      {/* Mobile header - hidden on desktop */}
      <div className="lg:hidden">
        <Header user={user} logoUrl={logoUrl} />
      </div>

      {/* Desktop top bar - hidden on mobile */}
      <div className="hidden lg:block lg:ml-64">
        <header className="sticky top-0 z-40 h-14 bg-card/80 backdrop-blur-sm border-b border-border flex items-center justify-end px-8 gap-3">
          <NotificationBell />
          <Link href="/profile" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <span className="text-sm font-medium">{user.full_name}</span>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
          </Link>
        </header>
      </div>

      {/* Main content with pull-to-refresh */}
      <PullToRefresh>
        <main className="px-4 py-4 pb-24 max-w-lg mx-auto lg:ml-64 lg:max-w-none lg:pb-8 lg:px-8 lg:py-6">
          {children}
        </main>
      </PullToRefresh>

      {/* Mobile bottom nav - hidden on desktop */}
      <div className="lg:hidden">
        <BottomNav role={role} />
      </div>
    </div>
  )
}
