'use client'

import Link from 'next/link'
import { NotificationBell } from '@/components/features/notification-bell'
import type { Profile } from '@/types/database'

interface HeaderProps {
  user: Profile
  logoUrl?: string | null
}

export function Header({ user, logoUrl }: HeaderProps) {
  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-40 h-14 bg-card border-b border-border flex items-center justify-between px-4">
      {/* Left: app logo */}
      <div className="flex items-center gap-1.5">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Loop Padel Club"
            className="h-8 w-auto object-contain"
          />
        ) : (
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary-foreground">L</span>
          </div>
        )}
      </div>

      {/* Right: bell + avatar */}
      <div className="flex items-center gap-2">
        <NotificationBell />
        <Link href="/profile" className="flex items-center gap-2">
          <span className="text-sm font-medium hidden sm:inline">{user.full_name}</span>
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
        </Link>
      </div>
    </header>
  )
}
