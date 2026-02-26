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
      {/* Left: avatar → profile */}
      <Link href="/profile" className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
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
        <span className="text-sm font-medium">{user.full_name}</span>
      </Link>

      {/* Right: app logo */}
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
          <span className="text-[10px] font-bold text-primary-foreground">P</span>
        </div>
      </div>
    </header>
  )
}
