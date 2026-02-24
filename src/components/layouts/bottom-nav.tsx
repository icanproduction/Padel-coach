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
    { label: 'Home', href: '/admin', icon: LayoutDashboard },
    { label: 'Sessions', href: '/admin/sessions', icon: Calendar },
    { label: 'Players', href: '/admin/players', icon: Users },
    { label: 'Coaches', href: '/admin/coaches', icon: GraduationCap },
  ],
  coach: [
    { label: 'Home', href: '/coach', icon: LayoutDashboard },
    { label: 'Sessions', href: '/coach/sessions', icon: Calendar },
    { label: 'Assess', href: '/coach/assess', icon: ClipboardCheck },
    { label: 'Players', href: '/coach/players', icon: Users },
    { label: 'Drills', href: '/coach/curriculum', icon: BookOpen },
  ],
  player: [
    { label: 'Home', href: '/player', icon: LayoutDashboard },
    { label: 'Progress', href: '/player/progress', icon: TrendingUp },
    { label: 'Sessions', href: '/player/sessions', icon: Calendar },
    { label: 'History', href: '/player/assessments', icon: ClipboardList },
  ],
}

interface BottomNavProps {
  role: UserRole
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname()
  const items = NAV_ITEMS[role]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
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
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors',
                'min-w-[44px] min-h-[44px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              <span className={cn(
                'text-[10px] leading-tight',
                isActive ? 'font-semibold' : 'font-medium'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
