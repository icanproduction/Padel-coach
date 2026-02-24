'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Users,
  GraduationCap,
  ClipboardCheck,
  TrendingUp,
  ClipboardList,
  BookOpen,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/database'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  admin: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Sessions', href: '/admin/sessions', icon: Calendar },
    { label: 'Players', href: '/admin/players', icon: Users },
    { label: 'Coaches', href: '/admin/coaches', icon: GraduationCap },
  ],
  coach: [
    { label: 'Dashboard', href: '/coach', icon: LayoutDashboard },
    { label: 'My Sessions', href: '/coach/sessions', icon: Calendar },
    { label: 'Players', href: '/coach/players', icon: Users },
    { label: 'Assess', href: '/coach/assess', icon: ClipboardCheck },
    { label: 'Curriculum', href: '/coach/curriculum', icon: BookOpen },
  ],
  player: [
    { label: 'Dashboard', href: '/player', icon: LayoutDashboard },
    { label: 'My Progress', href: '/player/progress', icon: TrendingUp },
    { label: 'Sessions', href: '/player/sessions', icon: Calendar },
    { label: 'Assessments', href: '/player/assessments', icon: ClipboardList },
  ],
}

interface SidebarProps {
  role: UserRole
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const items = NAV_ITEMS[role]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-in-out',
          'md:translate-x-0 md:z-30',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
          <Link href={`/${role}`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">P</span>
            </div>
            <span className="font-semibold text-sm">Padel Coach Pro</span>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {items.map((item) => {
            const isActive =
              item.href === `/${role}`
                ? pathname === item.href
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  'min-h-[44px]', // Large touch target
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Role badge */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="px-3 py-2 rounded-lg bg-white/5 text-xs text-sidebar-foreground/50 capitalize">
            {role} Account
          </div>
        </div>
      </aside>
    </>
  )
}
