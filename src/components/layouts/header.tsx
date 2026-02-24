'use client'

import { Menu, LogOut, User } from 'lucide-react'
import { logout } from '@/app/actions/auth-actions'
import type { Profile } from '@/types/database'

interface HeaderProps {
  user: Profile
  onMenuClick: () => void
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-20 h-16 bg-background border-b border-border flex items-center justify-between px-4 md:px-6">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold hidden sm:block">Padel Coach Pro</h1>
      </div>

      {/* Right: user menu */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium">{user.full_name}</p>
          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
        </div>

        {/* Avatar dropdown - simple version without radix dropdown to avoid circular deps */}
        <div className="relative group">
          <button className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all">
            <div className="p-2">
              <div className="px-3 py-2 text-sm">
                <p className="font-medium">{user.full_name}</p>
                <p className="text-muted-foreground text-xs">{user.email}</p>
              </div>
              <div className="h-px bg-border my-1" />
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted text-left min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
