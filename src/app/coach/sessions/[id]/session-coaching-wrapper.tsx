'use client'

import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { SessionCard } from '@/components/features/session-card'
import { SessionStatusActions } from '../session-status-actions'
import { SessionModules } from './session-modules'
import { CoachingMode } from './coaching-mode'

interface Player {
  id: string
  name: string
  avatar_url: string | null
}

interface ExistingModuleRecord {
  player_id: string
  module_id: string
  drill_scores: Record<string, number> | null
}

interface SessionCardData {
  id: string
  date: string
  coachName: string
  sessionType: string
  locationName?: string | null
  locationMapsLink?: string | null
  courtsBooked?: number | null
  durationHours?: number
  reclubUrl?: string | null
  status: string
  maxPlayers: number
  playerCount: number
  notes?: string | null
}

interface SessionCoachingWrapperProps {
  sessionId: string
  sessionStatus: string
  selectedModules: string[]
  players: Player[]
  moduleRecords: ExistingModuleRecord[]
  cardData: SessionCardData
}

export function SessionCoachingWrapper({
  sessionId,
  sessionStatus,
  selectedModules,
  players,
  moduleRecords,
  cardData,
}: SessionCoachingWrapperProps) {
  const [showCoachingMode, setShowCoachingMode] = useState(false)
  const isInProgress = sessionStatus === 'in_progress'
  const hasModules = selectedModules.length > 0

  return (
    <>
      {/* Session Info Card with status actions */}
      <SessionCard
        {...cardData}
        actions={
          <SessionStatusActions
            sessionId={sessionId}
            currentStatus={sessionStatus}
            onStartSession={hasModules ? () => setShowCoachingMode(true) : undefined}
          />
        }
      />

      {/* Modules Section */}
      <SessionModules
        sessionId={sessionId}
        selectedModules={selectedModules}
        isCompleted={sessionStatus === 'completed'}
      />

      {/* Enter Coaching Mode button */}
      {isInProgress && hasModules && players.length > 0 && (
        <button
          onClick={() => setShowCoachingMode(true)}
          className="w-full py-3 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Enter Coaching Mode
        </button>
      )}

      {/* Coaching Mode Overlay */}
      {showCoachingMode && (
        <CoachingMode
          sessionId={sessionId}
          selectedModules={selectedModules}
          players={players}
          existingRecords={moduleRecords}
          onClose={() => setShowCoachingMode(false)}
        />
      )}
    </>
  )
}
