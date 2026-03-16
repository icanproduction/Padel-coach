'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/app/actions/notification-actions'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  body: string
  url: string
  is_read: boolean
  created_at: string
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fetch notifications on mount and periodically
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Every 30s
    return () => clearInterval(interval)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchNotifications() {
    const result = await getNotifications()
    setNotifications(result.data as Notification[])
    setUnreadCount(result.unreadCount)
  }

  async function handleNotificationClick(notif: Notification) {
    if (!notif.is_read) {
      await markNotificationRead(notif.id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
    setOpen(false)
    router.push(notif.url)
  }

  async function handleMarkAllRead() {
    setLoading(true)
    await markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
    setLoading(false)
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Baru saja'
    if (mins < 60) return `${mins}m lalu`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}j lalu`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}h lalu`
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-accent transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="fixed inset-x-3 top-14 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 max-h-[70vh] bg-card rounded-xl border border-border shadow-lg overflow-hidden z-[60]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Notifikasi</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[calc(70vh-52px)]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Belum ada notifikasi</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-border/50 hover:bg-accent transition-colors flex gap-3',
                    !notif.is_read && 'bg-primary/5'
                  )}
                >
                  {/* Unread dot */}
                  <div className="pt-1.5 flex-shrink-0">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      notif.is_read ? 'bg-transparent' : 'bg-primary'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm',
                      notif.is_read ? 'font-normal' : 'font-semibold'
                    )}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notif.body}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {timeAgo(notif.created_at)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
