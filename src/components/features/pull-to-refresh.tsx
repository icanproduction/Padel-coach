'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface PullToRefreshProps {
  children: React.ReactNode
}

export function PullToRefresh({ children }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const threshold = 80

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
      setPulling(true)
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pulling || refreshing) return
    const diff = e.touches[0].clientY - startY.current
    if (diff > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(diff * 0.4, 120))
    }
  }, [pulling, refreshing])

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true)
      setPullDistance(50)
      router.refresh()
      setTimeout(() => {
        setRefreshing(false)
        setPullDistance(0)
        setPulling(false)
      }, 1000)
    } else {
      setPullDistance(0)
      setPulling(false)
    }
  }, [pullDistance, refreshing, router])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: true })
    el.addEventListener('touchend', handleTouchEnd)

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return (
    <div ref={containerRef} className="relative">
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: pullDistance > 0 ? pullDistance : 0 }}
      >
        <Loader2
          className={`w-5 h-5 text-primary transition-transform ${
            refreshing ? 'animate-spin' : ''
          }`}
          style={{
            transform: refreshing ? undefined : `rotate(${pullDistance * 3}deg)`,
            opacity: Math.min(pullDistance / threshold, 1),
          }}
        />
      </div>
      {children}
    </div>
  )
}
