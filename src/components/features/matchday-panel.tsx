'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import {
  createMatchday,
  startMatchday,
  submitMatchScore,
  endMatchday,
  deleteMatchday,
} from '@/app/actions/matchday-actions'
import { calculateLeaderboard, getMaxPoints, validateScore } from '@/lib/matchday-engine'
import { cn } from '@/lib/utils'
import {
  Trophy,
  Play,
  Flag,
  Trash2,
  Check,
  Loader2,
  Users,
  Swords,
} from 'lucide-react'
import type { MatchdayFormat, MatchdayScoringType } from '@/types/database'

interface Player {
  id: string
  full_name: string
}

interface MatchdayData {
  matchday: {
    id: string
    session_id: string
    format: MatchdayFormat
    scoring_type: MatchdayScoringType
    status: string
    courts: number
    player_ids: string[]
  }
  matches: {
    id: string
    round_number: number
    court_number: number
    team_a_player1: string
    team_a_player2: string
    team_b_player1: string
    team_b_player2: string
    score_a: number | null
    score_b: number | null
    status: string
  }[]
}

interface MatchdayPanelProps {
  sessionId: string
  sessionType: string
  courts: number
  attendedPlayers: Player[]
  matchdayData: MatchdayData | null
  isCoachOrAdmin: boolean
}

export function MatchdayPanel({
  sessionId,
  sessionType,
  courts,
  attendedPlayers,
  matchdayData,
  isCoachOrAdmin,
}: MatchdayPanelProps) {
  // Only show for open_play sessions
  if (sessionType !== 'open_play') return null

  if (!matchdayData) {
    if (!isCoachOrAdmin) return null
    return <MatchdaySetup sessionId={sessionId} courts={courts} players={attendedPlayers} />
  }

  const { matchday, matches } = matchdayData

  if (matchday.status === 'setup') {
    return (
      <MatchdaySetupReady
        matchday={matchday}
        players={attendedPlayers}
        isCoachOrAdmin={isCoachOrAdmin}
      />
    )
  }

  return (
    <MatchdayLive
      matchday={matchday}
      matches={matches}
      players={attendedPlayers}
      isCoachOrAdmin={isCoachOrAdmin}
    />
  )
}

// =====================================================
// SETUP - Create Matchday
// =====================================================

function MatchdaySetup({
  sessionId,
  courts,
  players,
}: {
  sessionId: string
  courts: number
  players: Player[]
}) {
  const [format, setFormat] = useState<MatchdayFormat>('mexicano')
  const [scoring, setScoring] = useState<MatchdayScoringType>('points_32')
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(players.map(p => p.id))
  const [numCourts, setNumCourts] = useState(courts || 2)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  function togglePlayer(id: string) {
    setSelectedPlayers(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  function handleCreate() {
    startTransition(async () => {
      const result = await createMatchday({
        sessionId,
        format,
        scoringType: scoring,
        courts: numCourts,
        playerIds: selectedPlayers,
      })
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' })
      } else {
        toast({ title: 'Berhasil', description: 'Matchday dibuat!' })
        router.refresh()
      }
    })
  }

  const maxCourts = Math.floor(selectedPlayers.length / 4)

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Swords className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Matchday</h2>
      </div>

      {/* Format */}
      <div>
        <label className="text-sm font-medium mb-2 block">Format</label>
        <div className="flex gap-2">
          {(['americano', 'mexicano'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors capitalize',
                format === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Scoring */}
      <div>
        <label className="text-sm font-medium mb-2 block">Scoring</label>
        <div className="flex gap-2 flex-wrap">
          {([
            { value: 'points_16', label: '16 Poin' },
            { value: 'points_21', label: '21 Poin' },
            { value: 'points_32', label: '32 Poin' },
            { value: 'tennis', label: 'Tennis' },
          ] as const).map(s => (
            <button
              key={s.value}
              onClick={() => setScoring(s.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                scoring === s.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Courts */}
      <div>
        <label className="text-sm font-medium mb-2 block">Jumlah Court</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].filter(c => c <= maxCourts || c === 1).map(c => (
            <button
              key={c}
              onClick={() => setNumCourts(c)}
              className={cn(
                'w-12 h-10 rounded-lg text-sm font-medium transition-colors',
                numCourts === c
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Players */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Players ({selectedPlayers.length} dipilih, min {numCourts * 4})
        </label>
        <div className="flex flex-wrap gap-2">
          {players.map(p => (
            <button
              key={p.id}
              onClick={() => togglePlayer(p.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
                selectedPlayers.includes(p.id)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground border-border'
              )}
            >
              {p.full_name}
            </button>
          ))}
        </div>
      </div>

      {/* Create Button */}
      <button
        onClick={handleCreate}
        disabled={isPending || selectedPlayers.length < numCourts * 4}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
        Buat Matchday
      </button>
    </div>
  )
}

// =====================================================
// SETUP READY - Start
// =====================================================

function MatchdaySetupReady({
  matchday,
  players,
  isCoachOrAdmin,
}: {
  matchday: MatchdayData['matchday']
  players: Player[]
  isCoachOrAdmin: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const playerNames = matchday.player_ids
    .map(id => players.find(p => p.id === id)?.full_name || '?')
    .join(', ')

  function handleStart() {
    startTransition(async () => {
      const result = await startMatchday(matchday.id)
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' })
      } else {
        router.refresh()
      }
    })
  }

  function handleDelete() {
    if (!confirm('Hapus matchday ini?')) return
    startTransition(async () => {
      await deleteMatchday(matchday.id)
      router.refresh()
    })
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Matchday Ready</h2>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 capitalize">
          {matchday.format}
        </span>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p><strong>{matchday.player_ids.length}</strong> players · <strong>{matchday.courts}</strong> court · <strong>{matchday.scoring_type.replace('points_', '')} poin</strong></p>
        <p className="text-xs">{playerNames}</p>
      </div>

      {isCoachOrAdmin && (
        <div className="flex gap-2">
          <button
            onClick={handleStart}
            disabled={isPending}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Mulai Matchday
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2.5 border border-destructive text-destructive rounded-lg text-sm hover:bg-destructive/10 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

// =====================================================
// LIVE - Scoreboard + Score Input
// =====================================================

function MatchdayLive({
  matchday,
  matches,
  players,
  isCoachOrAdmin,
}: {
  matchday: MatchdayData['matchday']
  matches: MatchdayData['matches']
  players: Player[]
  isCoachOrAdmin: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const getName = (id: string) => players.find(p => p.id === id)?.full_name || '?'

  // Calculate leaderboard
  const completedMatches = matches
    .filter(m => m.status === 'completed' && m.score_a !== null)
    .map(m => ({
      team_a_player1: m.team_a_player1,
      team_a_player2: m.team_a_player2,
      team_b_player1: m.team_b_player1,
      team_b_player2: m.team_b_player2,
      score_a: m.score_a!,
      score_b: m.score_b!,
    }))

  const leaderboard = calculateLeaderboard(completedMatches, matchday.player_ids)

  // Group matches by round
  const rounds = new Map<number, typeof matches>()
  matches.forEach(m => {
    if (!rounds.has(m.round_number)) rounds.set(m.round_number, [])
    rounds.get(m.round_number)!.push(m)
  })

  const currentRound = Math.max(...matches.map(m => m.round_number))
  const isComplete = matchday.status === 'completed'

  function handleEnd() {
    if (!confirm('Akhiri matchday sekarang? Ranking berdasarkan round yang sudah selesai.')) return
    startTransition(async () => {
      const result = await endMatchday(matchday.id)
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' })
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold">
              {isComplete ? 'Matchday Selesai' : 'Matchday Live'}
            </h2>
          </div>
          <span className={cn(
            'text-xs font-medium px-2.5 py-1 rounded-full capitalize',
            isComplete ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          )}>
            {matchday.format} · Round {currentRound}
          </span>
        </div>

        {/* Leaderboard */}
        <div className="space-y-1">
          {leaderboard.map((entry, i) => (
            <div
              key={entry.playerId}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm',
                i === 0 && isComplete && 'bg-amber-50 border border-amber-200',
                i === 1 && isComplete && 'bg-gray-50 border border-gray-200',
                i === 2 && isComplete && 'bg-orange-50 border border-orange-200',
              )}
            >
              <span className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                i === 0 ? 'bg-amber-500 text-white' :
                i === 1 ? 'bg-gray-400 text-white' :
                i === 2 ? 'bg-orange-400 text-white' :
                'bg-muted text-muted-foreground'
              )}>
                {i + 1}
              </span>
              <span className="flex-1 font-medium truncate">{getName(entry.playerId)}</span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{entry.wins}W {entry.losses}L</span>
                <span className="font-bold text-foreground text-sm">{entry.totalPoints}</span>
              </div>
            </div>
          ))}
        </div>

        {/* End Button */}
        {isCoachOrAdmin && !isComplete && (
          <button
            onClick={handleEnd}
            disabled={isPending}
            className="mt-4 w-full py-2.5 border border-destructive text-destructive rounded-lg text-sm font-medium hover:bg-destructive/10 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Flag className="w-4 h-4" />
            Akhiri Matchday
          </button>
        )}
      </div>

      {/* Rounds */}
      {Array.from(rounds.entries())
        .sort(([a], [b]) => b - a) // newest first
        .map(([roundNum, roundMatches]) => (
          <div key={roundNum} className="bg-card rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Round {roundNum}</h3>
            <div className="space-y-3">
              {roundMatches.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  getName={getName}
                  scoringType={matchday.scoring_type}
                  isCoachOrAdmin={isCoachOrAdmin}
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}

// =====================================================
// MATCH CARD - Score Input
// =====================================================

function MatchCard({
  match,
  getName,
  scoringType,
  isCoachOrAdmin,
}: {
  match: MatchdayData['matches'][0]
  getName: (id: string) => string
  scoringType: string
  isCoachOrAdmin: boolean
}) {
  const [scoreA, setScoreA] = useState(match.score_a?.toString() || '')
  const [scoreB, setScoreB] = useState(match.score_b?.toString() || '')
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const isCompleted = match.status === 'completed'
  const maxPoints = getMaxPoints(scoringType)

  function handleSubmit() {
    const a = parseInt(scoreA)
    const b = parseInt(scoreB)
    if (isNaN(a) || isNaN(b)) {
      toast({ title: 'Error', description: 'Masukkan skor yang valid', variant: 'destructive' })
      return
    }

    startTransition(async () => {
      const result = await submitMatchScore(match.id, a, b)
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' })
      } else {
        router.refresh()
      }
    })
  }

  // Auto-fill other score for point-based
  function handleScoreAChange(val: string) {
    setScoreA(val)
    if (scoringType !== 'tennis' && val && maxPoints > 0) {
      const num = parseInt(val)
      if (!isNaN(num) && num >= 0 && num <= maxPoints) {
        setScoreB((maxPoints - num).toString())
      }
    }
  }

  return (
    <div className={cn(
      'rounded-lg border p-3',
      isCompleted ? 'border-border bg-muted/30' : 'border-primary/30 bg-primary/5'
    )}>
      <p className="text-[10px] text-muted-foreground mb-2">Court {match.court_number}</p>

      <div className="flex items-center gap-2">
        {/* Team A */}
        <div className="flex-1 text-right">
          <p className="text-xs font-medium">{getName(match.team_a_player1)}</p>
          <p className="text-xs text-muted-foreground">{getName(match.team_a_player2)}</p>
        </div>

        {/* Score */}
        {isCompleted ? (
          <div className="flex items-center gap-1.5 px-3">
            <span className={cn('text-lg font-bold', match.score_a! > match.score_b! ? 'text-green-600' : 'text-muted-foreground')}>
              {match.score_a}
            </span>
            <span className="text-xs text-muted-foreground">-</span>
            <span className={cn('text-lg font-bold', match.score_b! > match.score_a! ? 'text-green-600' : 'text-muted-foreground')}>
              {match.score_b}
            </span>
          </div>
        ) : isCoachOrAdmin ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={scoreA}
              onChange={e => handleScoreAChange(e.target.value)}
              className="w-12 h-9 text-center rounded-lg border border-input bg-background text-sm font-bold"
              min={0}
              max={scoringType !== 'tennis' ? maxPoints : undefined}
            />
            <span className="text-xs text-muted-foreground">-</span>
            <input
              type="number"
              value={scoreB}
              onChange={e => setScoreB(e.target.value)}
              className="w-12 h-9 text-center rounded-lg border border-input bg-background text-sm font-bold"
              min={0}
              max={scoringType !== 'tennis' ? maxPoints : undefined}
            />
            <button
              onClick={handleSubmit}
              disabled={isPending || !scoreA || !scoreB}
              className="p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground px-3">vs</span>
        )}

        {/* Team B */}
        <div className="flex-1">
          <p className="text-xs font-medium">{getName(match.team_b_player1)}</p>
          <p className="text-xs text-muted-foreground">{getName(match.team_b_player2)}</p>
        </div>
      </div>
    </div>
  )
}
