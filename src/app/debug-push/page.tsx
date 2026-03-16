'use client'

import { useState, useEffect } from 'react'

export default function DebugPushPage() {
  const [log, setLog] = useState<string[]>([])

  function addLog(msg: string) {
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  async function runDiagnostics() {
    // 1. Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true
    addLog(`Display mode: ${isStandalone ? 'STANDALONE (PWA)' : 'BROWSER'}`)

    // 2. Check Notification API
    if (!('Notification' in window)) {
      addLog('ERROR: Notification API not supported')
      return
    }
    addLog(`Notification permission: ${Notification.permission}`)

    // 3. Check Service Worker
    if (!('serviceWorker' in navigator)) {
      addLog('ERROR: Service Worker not supported')
      return
    }

    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      addLog('ERROR: No service worker registered')
      return
    }
    addLog(`SW registered: scope=${registration.scope}`)
    addLog(`SW active: ${registration.active ? 'YES' : 'NO'}`)
    addLog(`SW waiting: ${registration.waiting ? 'YES' : 'NO'}`)
    addLog(`SW installing: ${registration.installing ? 'YES' : 'NO'}`)

    // 4. Check Push Manager
    if (!('pushManager' in registration)) {
      addLog('ERROR: Push Manager not available')
      return
    }
    addLog('Push Manager: available')

    // 5. Check existing subscription
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      addLog(`Push subscription: ACTIVE`)
      addLog(`Endpoint: ${subscription.endpoint.substring(0, 80)}...`)
    } else {
      addLog('Push subscription: NONE')
    }

    // 6. Check VAPID key
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    addLog(`VAPID key: ${vapidKey ? 'SET (' + vapidKey.substring(0, 20) + '...)' : 'MISSING'}`)
  }

  async function testSubscribe() {
    addLog('--- Testing Subscribe ---')
    try {
      const permission = await Notification.requestPermission()
      addLog(`Permission result: ${permission}`)

      if (permission !== 'granted') {
        addLog('ERROR: Permission not granted')
        return
      }

      const registration = await navigator.serviceWorker.ready
      addLog('SW ready')

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      const padding = '='.repeat((4 - (vapidKey.length % 4)) % 4)
      const base64 = (vapidKey + padding).replace(/-/g, '+').replace(/_/g, '/')
      const rawData = window.atob(base64)
      const outputArray = new Uint8Array(rawData.length)
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: outputArray.buffer as ArrayBuffer,
      })
      addLog(`Subscribed! Endpoint: ${subscription.endpoint.substring(0, 80)}...`)

      // Save to server
      const sub = subscription.toJSON()
      const res = await fetch('/api/debug-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          p256dh: sub.keys!.p256dh,
          auth: sub.keys!.auth,
        }),
      })
      const data = await res.json()
      addLog(`Save result: ${JSON.stringify(data)}`)
    } catch (err: any) {
      addLog(`ERROR: ${err.message}`)
    }
  }

  async function testLocalNotification() {
    addLog('--- Testing Local Notification ---')
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification('Test Lokal', {
        body: 'Ini notifikasi langsung dari browser, bukan push.',
        icon: '/icons/icon-192.png',
      })
      addLog('Local notification sent! Check your screen.')
    } catch (err: any) {
      addLog(`ERROR: ${err.message}`)
    }
  }

  async function testServerPush() {
    addLog('--- Testing Server Push ---')
    try {
      const res = await fetch(`/api/test-push?secret=${prompt('Enter CRON_SECRET:')}`)
      const data = await res.json()
      addLog(`Server push result: ${JSON.stringify(data)}`)
    } catch (err: any) {
      addLog(`ERROR: ${err.message}`)
    }
  }

  return (
    <div style={{ padding: 16, fontFamily: 'monospace', fontSize: 13 }}>
      <h2>Push Notification Debug</h2>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button
          onClick={testLocalNotification}
          style={{ padding: '8px 16px', background: '#00d69d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold' }}
        >
          Test Local Notif
        </button>
        <button
          onClick={testSubscribe}
          style={{ padding: '8px 16px', background: '#0057ff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold' }}
        >
          Re-Subscribe
        </button>
        <button
          onClick={testServerPush}
          style={{ padding: '8px 16px', background: '#e00', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold' }}
        >
          Test Server Push
        </button>
        <button
          onClick={() => runDiagnostics()}
          style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold' }}
        >
          Re-check
        </button>
      </div>

      <div style={{ background: '#111', color: '#0f0', padding: 12, borderRadius: 8, maxHeight: '60vh', overflow: 'auto' }}>
        {log.map((line, i) => (
          <div key={i} style={{ marginBottom: 4, color: line.includes('ERROR') ? '#f55' : '#0f0' }}>
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}
