'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Users,
  GraduationCap,
  MapPin,
  Megaphone,
  Award,
  Settings,
  TrendingUp,
  BookOpen,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/actions/auth-actions'
import type { Profile, UserRole } from '@/types/database'

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
    { label: 'Locations', href: '/admin/locations', icon: MapPin },
    { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
    { label: 'Badges', href: '/admin/badges', icon: Award },
  ],
  coach: [
    { label: 'Dashboard', href: '/coach', icon: LayoutDashboard },
    { label: 'Sessions', href: '/coach/sessions', icon: Calendar },
    { label: 'Players', href: '/coach/players', icon: Users },
    { label: 'Curriculum', href: '/coach/curriculum', icon: BookOpen },
  ],
  player: [
    { label: 'Dashboard', href: '/player', icon: LayoutDashboard },
    { label: 'Sessions', href: '/player/sessions', icon: Calendar },
    { label: 'Progress', href: '/player/progress', icon: TrendingUp },
    { label: 'Curriculum', href: '/player/assessments', icon: BookOpen },
  ],
}

const BOTTOM_ITEMS: Record<UserRole, NavItem[]> = {
  admin: [{ label: 'Settings', href: '/admin/settings', icon: Settings }],
  coach: [],
  player: [],
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  coach: 'Coach',
  player: 'Player',
}

interface RoleSidebarProps {
  user: Profile
  role: UserRole
  logoUrl?: string | null
}

export function RoleSidebar({ user, role, logoUrl }: RoleSidebarProps) {
  const pathname = usePathname()
  const items = NAV_ITEMS[role]
  const bottomItems = BOTTOM_ITEMS[role]

  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:flex-col bg-sidebar text-sidebar-foreground border-r border-border">
      {/* Logo / App Name */}
      <div className="flex items-center gap-3 h-16 px-6 border-b border-white/10">
        {logoUrl ? (
          <img src={logoUrl} alt="Loop Padel Club" className="h-8 w-auto object-contain" />
        ) : (
          <>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">L</span>
            </div>
            <span className="font-semibold text-sm">Loop Padel Club</span>
          </>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const isActive =
            item.href === `/${role}`
              ? pathname === item.href
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
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

      {/* Bottom section */}
      <div className="p-4 border-t border-white/10 space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
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

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.full_name}</p>
            <p className="text-xs text-sidebar-foreground/50">{ROLE_LABELS[role]}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="p-1.5 rounded hover:bg-white/10 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
