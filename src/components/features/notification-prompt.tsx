'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, X } from 'lucide-react'
import { subscribePush, unsubscribePush } from '@/app/actions/push-actions'
import { cn } from '@/lib/utils'

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray.buffer as ArrayBuffer
}

export function NotificationPrompt() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported')
      return
    }
    setPermission(Notification.permission)

    // Check if already dismissed (persists across sessions)
    if (localStorage.getItem('notif-dismissed') === 'true') {
      setDismissed(true)
    }
  }, [])

  async function handleEnable() {
    setLoading(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        // Get service worker registration
        const registration = await navigator.serviceWorker.ready

        // Subscribe to push
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ),
        })

        // Save to server
        const sub = subscription.toJSON()
        await subscribePush({
          endpoint: sub.endpoint!,
          keys: {
            p256dh: sub.keys!.p256dh!,
            auth: sub.keys!.auth!,
          },
        })
      }
    } catch (err) {
      console.error('Failed to subscribe:', err)
    }
    setLoading(false)
  }

  async function handleDisable() {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
      }
      await unsubscribePush()
      setPermission('default')
    } catch (err) {
      console.error('Failed to unsubscribe:', err)
    }
    setLoading(false)
  }

  function handleDismiss() {
    setDismissed(true)
    localStorage.setItem('notif-dismissed', 'true')
  }

  // Don't show if unsupported, already granted, or denied, or dismissed
  if (permission === 'unsupported' || permission === 'denied' || dismissed) {
    return null
  }

  // Already granted - show toggle off option in a subtle way
  if (permission === 'granted') {
    return null
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Bell className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Aktifkan Notifikasi</p>
        <p className="text-xs text-muted-foreground">
          Dapatkan update session & assessment terbaru
        </p>
      </div>
      <button
        onClick={handleEnable}
        disabled={loading}
        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex-shrink-0"
      >
        {loading ? 'Loading...' : 'Aktifkan'}
      </button>
      <button
        onClick={handleDismiss}
        className="p-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

/**
 * Toggle button for notification settings (used in profile/settings)
 */
export function NotificationToggle() {
  const [permission, setPermission] = useState<string>('default')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unsupported')
      return
    }
    setPermission(Notification.permission)
  }, [])

  async function handleToggle() {
    setLoading(true)
    if (permission === 'granted') {
      // Disable
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) await subscription.unsubscribe()
        await unsubscribePush()
        setPermission('default')
      } catch (err) {
        console.error(err)
      }
    } else {
      // Enable
      try {
        const result = await Notification.requestPermission()
        setPermission(result)
        if (result === 'granted') {
          const registration = await navigator.serviceWorker.ready
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
            ),
          })
          const sub = subscription.toJSON()
          await subscribePush({
            endpoint: sub.endpoint!,
            keys: { p256dh: sub.keys!.p256dh!, auth: sub.keys!.auth! },
          })
        }
      } catch (err) {
        console.error(err)
      }
    }
    setLoading(false)
  }

  if (permission === 'unsupported') return null

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        'flex items-center gap-3 w-full p-4 rounded-xl border border-border transition-colors',
        permission === 'granted' ? 'bg-primary/5' : 'bg-card hover:bg-accent'
      )}
    >
      {permission === 'granted' ? (
        <Bell className="w-5 h-5 text-primary" />
      ) : (
        <BellOff className="w-5 h-5 text-muted-foreground" />
      )}
      <div className="flex-1 text-left">
        <p className="text-sm font-medium">Push Notifications</p>
        <p className="text-xs text-muted-foreground">
          {permission === 'granted' ? 'Notifikasi aktif' : 'Notifikasi nonaktif'}
        </p>
      </div>
      <div className={cn(
        'w-10 h-6 rounded-full transition-colors flex items-center px-0.5',
        permission === 'granted' ? 'bg-primary' : 'bg-muted'
      )}>
        <div className={cn(
          'w-5 h-5 rounded-full bg-white shadow transition-transform',
          permission === 'granted' ? 'translate-x-4' : 'translate-x-0'
        )} />
      </div>
    </button>
  )
}
