'use client'

import Link from 'next/link'
import type { Profile } from '@/types/database'

interface HeaderProps {
  user: Profile
}

export function Header({ user }: HeaderProps) {
  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-40 h-14 bg-card border-b border-border flex items-center justify-between px-4">
      {/* Left: logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-xs font-bold text-primary-foreground">P</span>
        </div>
        <span className="font-semibold text-sm">Padel Coach Pro</span>
      </div>

      {/* Right: avatar → profile page */}
      <Link href="/profile" className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs font-medium leading-tight">{user.full_name}</p>
          <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
        </div>

        <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
      </Link>
    </header>
  )
}
