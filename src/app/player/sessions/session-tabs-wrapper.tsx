'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CalendarDays, Clock, CalendarCheck } from 'lucide-react'

type Tab = 'available' | 'upcoming' | 'past'

interface SessionTabsWrapperProps {
  availableCount: number
  upcomingCount: number
  pastCount: number
  availableContent: React.ReactNode
  upcomingContent: React.ReactNode
  pastContent: React.ReactNode
}

export function SessionTabsWrapper({
  availableCount,
  upcomingCount,
  pastCount,
  availableContent,
  upcomingContent,
  pastContent,
}: SessionTabsWrapperProps) {
  const [activeTab, setActiveTab] = useState<Tab>('available')

  const tabs = [
    { key: 'available' as Tab, label: 'Available', count: availableCount, icon: CalendarDays },
    { key: 'upcoming' as Tab, label: 'My Sessions', count: upcomingCount, icon: Clock },
    { key: 'past' as Tab, label: 'Past', count: pastCount, icon: CalendarCheck },
  ]

  return (
    <div className="space-y-4">
      {/* Tab Bar */}
      <div className="flex bg-muted rounded-xl p-1 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                  activeTab === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted-foreground/20 text-muted-foreground'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'available' && availableContent}
      {activeTab === 'upcoming' && upcomingContent}
      {activeTab === 'past' && pastContent}
    </div>
  )
}
