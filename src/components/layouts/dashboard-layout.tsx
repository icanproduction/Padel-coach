'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import type { Profile, UserRole } from '@/types/database'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: Profile
  role: UserRole
}

export function DashboardLayout({ children, user, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="md:ml-64">
        <Header
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
