/**
 * Matchday Scheduling Engine
 * Supports Americano (pre-generated) and Mexicano (dynamic) formats
 */

interface MatchAssignment {
  court: number
  teamA: [string, string]
  teamB: [string, string]
}

interface RoundSchedule {
  round: number
  matches: MatchAssignment[]
  byes: string[] // players sitting out this round
}

// =====================================================
// AMERICANO - Circle/Berger Method
// =====================================================

/**
 * Generate full Americano schedule where every player partners with every other exactly once.
 * Uses the circle method (Berger tables).
 */
export function generateAmericanoSchedule(playerIds: string[], courts: number): RoundSchedule[] {
  const n = playerIds.length
  if (n < 4) throw new Error('Need at least 4 players')

  // Pad to even number if needed
  const players = [...playerIds]
  const hasGhost = n % 2 !== 0
  if (hasGhost) players.push('__ghost__')

  const totalPlayers = players.length
  const playersPerRound = courts * 4
  const rounds: RoundSchedule[] = []

  // For 8 players, use verified hardcoded schedule
  if (n === 8 && courts === 2) {
    return generateAmericano8Players(playerIds)
  }

  // General Berger/circle method
  const fixed = players[0]
  const rotating = players.slice(1)

  for (let r = 0; r < totalPlayers - 1; r++) {
    // Build current arrangement
    const arrangement = [fixed, ...rotating]

    // Create pairs from outside-in
    const pairs: [string, string][] = []
    for (let i = 0; i < arrangement.length / 2; i++) {
      const p1 = arrangement[i]
      const p2 = arrangement[arrangement.length - 1 - i]
      if (p1 !== '__ghost__' && p2 !== '__ghost__') {
        pairs.push([p1, p2])
      }
    }

    // Group pairs into matches (2 pairs per match = 4 players)
    const matches: MatchAssignment[] = []
    const usedInRound = new Set<string>()
    const byes: string[] = []

    for (let c = 0; c < courts && pairs.length >= 2; c++) {
      const teamA = pairs.shift()!
      const teamB = pairs.shift()!
      matches.push({
        court: c + 1,
        teamA,
        teamB,
      })
      teamA.forEach(p => usedInRound.add(p))
      teamB.forEach(p => usedInRound.add(p))
    }

    // Anyone not in a match is on bye
    playerIds.forEach(p => {
      if (!usedInRound.has(p)) byes.push(p)
    })

    rounds.push({ round: r + 1, matches, byes })

    // Rotate: move last to first position
    rotating.unshift(rotating.pop()!)
  }

  return rounds
}

/**
 * Verified schedule for 8 players on 2 courts.
 * Every player partners with every other exactly once in 7 rounds.
 */
function generateAmericano8Players(players: string[]): RoundSchedule[] {
  const p = players
  // Hardcoded verified Whist tournament schedule (0-indexed)
  const schedule = [
    [[0, 1, 2, 5], [3, 6, 4, 7]], // Round 1
    [[0, 2, 3, 7], [1, 5, 4, 6]], // Round 2
    [[0, 3, 1, 6], [2, 7, 4, 5]], // Round 3
    [[0, 4, 2, 6], [1, 7, 3, 5]], // Round 4
    [[0, 5, 3, 4], [1, 2, 6, 7]], // Round 5
    [[0, 6, 5, 7], [1, 3, 2, 4]], // Round 6
    [[0, 7, 1, 4], [2, 3, 5, 6]], // Round 7
  ]

  return schedule.map((round, i) => ({
    round: i + 1,
    matches: round.map((match, c) => ({
      court: c + 1,
      teamA: [p[match[0]], p[match[1]]] as [string, string],
      teamB: [p[match[2]], p[match[3]]] as [string, string],
    })),
    byes: [],
  }))
}

// =====================================================
// MEXICANO - Dynamic Pairing Based on Standings
// =====================================================

interface PlayerStanding {
  playerId: string
  totalPoints: number
  matchesPlayed: number
}

/**
 * Generate next Mexicano round based on current standings.
 * Pairs: 1st+4th vs 2nd+3rd within each bracket of 4.
 */
export function generateMexicanoRound(
  standings: PlayerStanding[],
  courts: number,
  roundNumber: number,
  partnerHistory: Map<string, Set<string>>
): MatchAssignment[] {
  const playersPerRound = courts * 4

  // Sort by total points descending, then by matches played ascending (prioritize less played)
  const sorted = [...standings].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
    return a.matchesPlayed - b.matchesPlayed
  })

  // Take top players for this round (those with fewest matches first if more players than slots)
  let activePlayers: string[]
  if (sorted.length > playersPerRound) {
    // Prioritize players with fewer matches
    const byMatches = [...sorted].sort((a, b) => a.matchesPlayed - b.matchesPlayed)
    activePlayers = byMatches.slice(0, playersPerRound).map(p => p.playerId)
    // Re-sort active players by points for pairing
    activePlayers.sort((a, b) => {
      const sa = sorted.find(s => s.playerId === a)!
      const sb = sorted.find(s => s.playerId === b)!
      return sb.totalPoints - sa.totalPoints
    })
  } else {
    activePlayers = sorted.map(p => p.playerId)
  }

  // For round 1, shuffle randomly
  if (roundNumber === 1) {
    for (let i = activePlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[activePlayers[i], activePlayers[j]] = [activePlayers[j], activePlayers[i]]
    }
  }

  // Group into brackets of 4 and pair: 1st+4th vs 2nd+3rd
  const matches: MatchAssignment[] = []
  for (let c = 0; c < courts; c++) {
    const bracketStart = c * 4
    if (bracketStart + 3 >= activePlayers.length) break

    const bracket = activePlayers.slice(bracketStart, bracketStart + 4)

    if (roundNumber === 1) {
      // Random pairing for round 1
      matches.push({
        court: c + 1,
        teamA: [bracket[0], bracket[1]],
        teamB: [bracket[2], bracket[3]],
      })
    } else {
      // Mexicano pairing: 1st+4th vs 2nd+3rd
      matches.push({
        court: c + 1,
        teamA: [bracket[0], bracket[3]],
        teamB: [bracket[1], bracket[2]],
      })
    }
  }

  return matches
}

// =====================================================
// LEADERBOARD CALCULATION
// =====================================================

interface CompletedMatch {
  team_a_player1: string
  team_a_player2: string
  team_b_player1: string
  team_b_player2: string
  score_a: number
  score_b: number
}

export interface LeaderboardEntry {
  playerId: string
  totalPoints: number
  matchesPlayed: number
  wins: number
  losses: number
  draws: number
  pointsFor: number
  pointsAgainst: number
}

/**
 * Calculate leaderboard from completed matches
 */
export function calculateLeaderboard(
  matches: CompletedMatch[],
  playerIds: string[]
): LeaderboardEntry[] {
  const stats = new Map<string, LeaderboardEntry>()

  // Initialize all players
  playerIds.forEach(id => {
    stats.set(id, {
      playerId: id,
      totalPoints: 0,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      pointsFor: 0,
      pointsAgainst: 0,
    })
  })

  // Process each completed match
  matches.forEach(match => {
    const teamAPlayers = [match.team_a_player1, match.team_a_player2]
    const teamBPlayers = [match.team_b_player1, match.team_b_player2]

    teamAPlayers.forEach(p => {
      const s = stats.get(p)
      if (!s) return
      s.matchesPlayed++
      s.totalPoints += match.score_a
      s.pointsFor += match.score_a
      s.pointsAgainst += match.score_b
      if (match.score_a > match.score_b) s.wins++
      else if (match.score_a < match.score_b) s.losses++
      else s.draws++
    })

    teamBPlayers.forEach(p => {
      const s = stats.get(p)
      if (!s) return
      s.matchesPlayed++
      s.totalPoints += match.score_b
      s.pointsFor += match.score_b
      s.pointsAgainst += match.score_a
      if (match.score_b > match.score_a) s.wins++
      else if (match.score_b < match.score_a) s.losses++
      else s.draws++
    })
  })

  // Sort: total points desc, then wins desc, then point differential desc
  return Array.from(stats.values()).sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
    if (b.wins !== a.wins) return b.wins - a.wins
    const diffA = a.pointsFor - a.pointsAgainst
    const diffB = b.pointsFor - b.pointsAgainst
    return diffB - diffA
  })
}

/**
 * Get max points for a scoring type
 */
export function getMaxPoints(scoringType: string): number {
  switch (scoringType) {
    case 'points_16': return 16
    case 'points_21': return 21
    case 'points_32': return 32
    case 'tennis': return 0 // variable
    default: return 32
  }
}

/**
 * Validate score input
 */
export function validateScore(scoreA: number, scoreB: number, scoringType: string): string | null {
  if (scoreA < 0 || scoreB < 0) return 'Skor tidak boleh negatif'
  if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB)) return 'Skor harus bilangan bulat'

  if (scoringType === 'tennis') {
    // Tennis: no total constraint, just non-negative
    return null
  }

  const maxPoints = getMaxPoints(scoringType)
  if (scoreA + scoreB !== maxPoints) {
    return `Total skor harus ${maxPoints} (sekarang ${scoreA + scoreB})`
  }

  return null
}
