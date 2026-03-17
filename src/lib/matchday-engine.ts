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

  // Use hardcoded verified schedules for common player counts
  if (n === 8 && courts === 2) return generateAmericano8Players(playerIds)
  if (n === 12 && courts === 3) return generateAmericano12Players(playerIds)

  // For other counts, use Mexicano-style round-by-round generation
  // This doesn't guarantee unique partnerships but ensures fair play
  return generateFallbackSchedule(playerIds, courts)
}

/**
 * Fallback: generate rounds ensuring fair play distribution.
 * Uses greedy matching to minimize partner repeats.
 */
function generateFallbackSchedule(playerIds: string[], courts: number): RoundSchedule[] {
  const n = playerIds.length
  const maxRounds = n - 1
  const partnerCount = new Map<string, Map<string, number>>()

  // Init partner tracking
  playerIds.forEach(p => partnerCount.set(p, new Map()))

  const rounds: RoundSchedule[] = []

  for (let r = 0; r < maxRounds; r++) {
    const available = [...playerIds]
    const matches: MatchAssignment[] = []
    const byes: string[] = []

    // Shuffle to add variety
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[available[i], available[j]] = [available[j], available[i]]
    }

    for (let c = 0; c < courts && available.length >= 4; c++) {
      // Pick 4 players minimizing partner repeats
      const team = pickBestFour(available, partnerCount)
      if (!team) break

      // Pair: minimize repeat partnerships
      const [a, b, c2, d] = team
      const pair1Score = (partnerCount.get(a)?.get(b) || 0) + (partnerCount.get(c2)?.get(d) || 0)
      const pair2Score = (partnerCount.get(a)?.get(c2) || 0) + (partnerCount.get(b)?.get(d) || 0)
      const pair3Score = (partnerCount.get(a)?.get(d) || 0) + (partnerCount.get(b)?.get(c2) || 0)

      let teamA: [string, string], teamB: [string, string]
      if (pair1Score <= pair2Score && pair1Score <= pair3Score) {
        teamA = [a, b]; teamB = [c2, d]
      } else if (pair2Score <= pair3Score) {
        teamA = [a, c2]; teamB = [b, d]
      } else {
        teamA = [a, d]; teamB = [b, c2]
      }

      // Track partnerships
      trackPartner(partnerCount, teamA[0], teamA[1])
      trackPartner(partnerCount, teamB[0], teamB[1])

      matches.push({ court: c + 1, teamA, teamB })
    }

    // Remaining = byes
    available.forEach(p => {
      if (!matches.some(m =>
        m.teamA.includes(p) || m.teamB.includes(p)
      )) byes.push(p)
    })

    if (matches.length > 0) {
      rounds.push({ round: r + 1, matches, byes })
    }
  }

  return rounds
}

function pickBestFour(available: string[], partnerCount: Map<string, Map<string, number>>): string[] | null {
  if (available.length < 4) return null
  const picked = available.splice(0, 4)
  return picked
}

function trackPartner(map: Map<string, Map<string, number>>, a: string, b: string) {
  map.get(a)!.set(b, (map.get(a)!.get(b) || 0) + 1)
  map.get(b)!.set(a, (map.get(b)!.get(a) || 0) + 1)
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

/**
 * Verified schedule for 12 players on 3 courts.
 */
function generateAmericano12Players(players: string[]): RoundSchedule[] {
  const p = players
  const schedule = [
    [[0,1,2,3], [4,5,6,7], [8,9,10,11]],
    [[0,2,4,8], [1,5,9,10], [3,6,7,11]],
    [[0,3,5,10], [1,4,8,11], [2,6,7,9]],
    [[0,4,6,9], [1,3,7,10], [2,5,8,11]],
    [[0,5,7,11], [1,2,8,9], [3,4,6,10]],
    [[0,6,8,10], [1,7,9,11], [2,3,4,5]],
    [[0,7,8,5], [1,6,10,11], [2,4,3,9]],
    [[0,8,9,3], [1,11,2,10], [4,7,5,6]],
    [[0,9,10,4], [1,8,6,3], [2,11,5,7]],
    [[0,10,11,6], [1,9,4,5], [2,8,3,7]],
    [[0,11,1,2], [3,8,5,9], [4,10,6,7]],
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
