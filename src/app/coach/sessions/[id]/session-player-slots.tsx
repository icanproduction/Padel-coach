'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Search, Loader2, ClipboardList, Target, ArrowLeft } from 'lucide-react'
import { addPlayerToSession, removePlayerFromSession } from '@/app/actions/participant-actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DrillScoringForm } from './drill-scoring-form'

interface SessionPlayer {
  player_id: string
  status: string
  profiles: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
  }
}

interface PickerPlayer {
  id: string
  full_name: string
  username: string
  avatar_url: string | null
}

interface ExistingModuleRecord {
  player_id: string
  module_id: string
  drill_scores: Record<string, number> | null
}

interface SessionPlayerSlotsProps {
  sessionId: string
  maxPlayers: number
  sessionType: string
  sessionStatus: string
  sessionPlayers: SessionPlayer[]
  allPlayers: PickerPlayer[]
  assessedPlayerIds: string[]
  selectedModules: string[]
  moduleRecords: ExistingModuleRecord[]
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function SessionPlayerSlots({
  sessionId,
  maxPlayers,
  sessionType,
  sessionStatus,
  sessionPlayers,
  allPlayers,
  assessedPlayerIds,
  selectedModules,
  moduleRecords,
}: SessionPlayerSlotsProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [scoringPlayerId, setScoringPlayerId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const isOpenPlay = sessionType === 'open_play'
  const isCoaching = sessionType === 'coaching_drilling'
  const isDiscovery = sessionType === 'discovery'
  const isCompleted = sessionStatus === 'completed'

  // Active players (approved + attended)
  const activePlayers = sessionPlayers.filter(
    p => p.status === 'approved' || p.status === 'attended'
  )

  // Number of visual slots
  const slotCount = isOpenPlay
    ? activePlayers.length + (isCompleted ? 0 : 1)
    : maxPlayers

  // Players already in session (any status, to exclude from picker)
  const existingPlayerIds = new Set(sessionPlayers.map(p => p.player_id))

  // Available players for picker
  const availablePlayers = allPlayers.filter(p => !existingPlayerIds.has(p.id))
  const filteredPlayers = searchQuery
    ? availablePlayers.filter(p =>
        p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availablePlayers

  // Players that have been scored in this coaching session
  const scoredPlayerIds = new Set(moduleRecords.map(r => r.player_id))

  function handleAddPlayer(playerId: string) {
    startTransition(async () => {
      await addPlayerToSession(sessionId, playerId)
      setShowPicker(false)
      setSearchQuery('')
      router.refresh()
    })
  }

  function handleRemovePlayer(playerId: string) {
    startTransition(async () => {
      await removePlayerFromSession(sessionId, playerId)
      router.refresh()
    })
  }

  // Find scoring player info
  const scoringPlayer = scoringPlayerId
    ? activePlayers.find(p => p.player_id === scoringPlayerId)
    : null

  return (
    <>
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Players {!isOpenPlay && `(${activePlayers.length}/${maxPlayers})`}
          {isOpenPlay && `(${activePlayers.length})`}
        </h2>

        <div className="flex flex-wrap justify-evenly gap-x-3 gap-y-8 pb-2">
          {Array.from({ length: slotCount }).map((_, i) => {
            const player = activePlayers[i]

            if (player) {
              // Filled slot
              const isAssessed = assessedPlayerIds.includes(player.player_id)
              const isScored = scoredPlayerIds.has(player.player_id)
              const isActive = sessionStatus === 'in_progress' || sessionStatus === 'completed'
              const hasModulesSelected = selectedModules.length > 0

              return (
                <div key={player.player_id} className="relative flex flex-col items-center gap-2.5" style={{ width: 68 }}>
                  {/* Remove button — top-right of slot */}
                  {!isCompleted && (
                    <button
                      onClick={() => handleRemovePlayer(player.player_id)}
                      className="absolute -top-2 right-0 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm z-10"
                      disabled={isPending}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}

                  {/* Avatar circle */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold overflow-hidden">
                      {player.profiles?.avatar_url ? (
                        <img
                          src={player.profiles.avatar_url}
                          alt={player.profiles.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        getInitials(player.profiles?.full_name || '?')
                      )}
                    </div>

                    {/* Status dot */}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                      player.status === 'attended' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                  </div>

                  {/* Player name */}
                  <span className="text-xs text-center font-medium leading-tight line-clamp-2">
                    {player.profiles?.full_name || 'Unknown'}
                  </span>

                  {/* Action buttons based on session type */}
                  {isActive && isDiscovery && !isAssessed && (
                    <Link
                      href={`/coach/assess?player=${player.player_id}&session=${sessionId}`}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <ClipboardList className="w-3 h-3" />
                      Assess
                    </Link>
                  )}
                  {isDiscovery && isAssessed && (
                    <span className="text-[10px] text-green-600 font-medium">Assessed</span>
                  )}

                  {isActive && isCoaching && hasModulesSelected && !isScored && (
                    <button
                      onClick={() => setScoringPlayerId(player.player_id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Target className="w-3 h-3" />
                      Score
                    </button>
                  )}
                  {isCoaching && isScored && (
                    <button
                      onClick={() => setScoringPlayerId(player.player_id)}
                      className="text-[10px] text-green-600 font-medium hover:underline"
                    >
                      Scored
                    </button>
                  )}
                </div>
              )
            } else {
              // Empty slot
              const canAdd = !isCompleted
              return (
                <div key={`empty-${i}`} className="flex flex-col items-center gap-2.5" style={{ width: 68 }}>
                  {canAdd ? (
                    <button
                      onClick={() => setShowPicker(true)}
                      className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                      ) : (
                        <Plus className="w-5 h-5 text-muted-foreground/50" />
                      )}
                    </button>
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/15" />
                  )}
                  <span className="text-xs text-muted-foreground/40">
                    {canAdd ? 'Add' : ''}
                  </span>
                </div>
              )
            }
          })}
        </div>
      </div>

      {/* Player Picker Overlay — matches full-screen overlay pattern */}
      {showPicker && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          {/* Top bar */}
          <div className="flex items-center gap-3 px-4 h-14 border-b border-border bg-card">
            <button
              type="button"
              onClick={() => { setShowPicker(false); setSearchQuery('') }}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-accent transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold flex-1">Add Player</h1>
          </div>

          {/* Search + list */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari player..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              </div>

              {/* Player List */}
              {filteredPlayers.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {availablePlayers.length === 0
                      ? 'Semua player sudah ada di session ini'
                      : 'Tidak ada player yang cocok'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPlayers.map(player => (
                    <button
                      key={player.id}
                      onClick={() => handleAddPlayer(player.id)}
                      disabled={isPending}
                      className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow disabled:opacity-50"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0 overflow-hidden">
                        {player.avatar_url ? (
                          <img
                            src={player.avatar_url}
                            alt={player.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          getInitials(player.full_name)
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">{player.full_name}</p>
                        <p className="text-xs text-muted-foreground">@{player.username}</p>
                      </div>
                      {isPending && (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Drill Scoring Overlay */}
      {scoringPlayer && (
        <DrillScoringForm
          sessionId={sessionId}
          playerId={scoringPlayer.player_id}
          playerName={scoringPlayer.profiles?.full_name || 'Unknown'}
          selectedModules={selectedModules}
          existingRecords={moduleRecords.filter(r => r.player_id === scoringPlayer.player_id)}
          onClose={() => setScoringPlayerId(null)}
        />
      )}
    </>
  )
}
