'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  generateAmericanoSchedule,
  generateMexicanoRound,
  calculateLeaderboard,
  validateScore,
} from '@/lib/matchday-engine'
import type { MatchdayFormat, MatchdayScoringType } from '@/types/database'

export async function createMatchday(input: {
  sessionId: string
  format: MatchdayFormat
  scoringType: MatchdayScoringType
  courts: number
  playerIds: string[]
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'coach')) {
    return { error: 'Only admin/coach can create matchday' }
  }

  if (input.playerIds.length < 4) return { error: 'Minimal 4 player' }
  if (input.courts < 1) return { error: 'Minimal 1 court' }
  if (input.playerIds.length < input.courts * 4) {
    return { error: `Butuh minimal ${input.courts * 4} player untuk ${input.courts} court` }
  }

  // Create matchday
  const { data: matchday, error } = await supabase
    .from('matchdays')
    .insert({
      session_id: input.sessionId,
      format: input.format,
      scoring_type: input.scoringType,
      status: 'setup',
      courts: input.courts,
      player_ids: input.playerIds,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'Session ini sudah punya matchday' }
    return { error: error.message }
  }

  revalidatePath(`/admin/sessions/${input.sessionId}`)
  revalidatePath(`/coach/sessions/${input.sessionId}`)
  return { data: matchday }
}

export async function startMatchday(matchdayId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: matchday } = await supabase
    .from('matchdays')
    .select('*')
    .eq('id', matchdayId)
    .single()

  if (!matchday) return { error: 'Matchday not found' }
  if (matchday.status !== 'setup') return { error: 'Matchday already started' }

  // Generate first round
  if (matchday.format === 'americano') {
    // Generate ALL rounds upfront
    const schedule = generateAmericanoSchedule(matchday.player_ids, matchday.courts)

    const matchInserts = schedule.flatMap(round =>
      round.matches.map(match => ({
        matchday_id: matchdayId,
        round_number: round.round,
        court_number: match.court,
        team_a_player1: match.teamA[0],
        team_a_player2: match.teamA[1],
        team_b_player1: match.teamB[0],
        team_b_player2: match.teamB[1],
        status: round.round === 1 ? 'in_progress' : 'pending',
      }))
    )

    const { error: insertError } = await supabase
      .from('matchday_matches')
      .insert(matchInserts)

    if (insertError) return { error: insertError.message }
  } else {
    // Mexicano: generate only round 1 (random)
    const standings = matchday.player_ids.map((id: string) => ({
      playerId: id,
      totalPoints: 0,
      matchesPlayed: 0,
    }))

    const round1 = generateMexicanoRound(standings, matchday.courts, 1, new Map())

    const matchInserts = round1.map(match => ({
      matchday_id: matchdayId,
      round_number: 1,
      court_number: match.court,
      team_a_player1: match.teamA[0],
      team_a_player2: match.teamA[1],
      team_b_player1: match.teamB[0],
      team_b_player2: match.teamB[1],
      status: 'in_progress' as const,
    }))

    const { error: insertError } = await supabase
      .from('matchday_matches')
      .insert(matchInserts)

    if (insertError) return { error: insertError.message }
  }

  // Update status
  await supabase
    .from('matchdays')
    .update({ status: 'in_progress' })
    .eq('id', matchdayId)

  revalidatePath(`/admin/sessions/${matchday.session_id}`)
  revalidatePath(`/coach/sessions/${matchday.session_id}`)
  revalidatePath(`/session/${matchday.session_id}`)
  return { success: true }
}

export async function submitMatchScore(
  matchId: string,
  scoreA: number,
  scoreB: number
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Get match and matchday
  const { data: match } = await supabase
    .from('matchday_matches')
    .select('*, matchday:matchdays(*)')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Match not found' }

  const matchday = match.matchday as any

  // Validate score
  const validationError = validateScore(scoreA, scoreB, matchday.scoring_type)
  if (validationError) return { error: validationError }

  // Update match score
  const { error } = await supabase
    .from('matchday_matches')
    .update({
      score_a: scoreA,
      score_b: scoreB,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', matchId)

  if (error) return { error: error.message }

  // Check if all matches in this round are completed
  const { data: roundMatches } = await supabase
    .from('matchday_matches')
    .select('status')
    .eq('matchday_id', matchday.id)
    .eq('round_number', match.round_number)

  const allRoundComplete = roundMatches?.every((m: any) => m.status === 'completed')

  if (allRoundComplete) {
    if (matchday.format === 'americano') {
      // Americano: activate next round's matches
      const nextRound = match.round_number + 1
      const { data: nextMatches } = await supabase
        .from('matchday_matches')
        .select('id')
        .eq('matchday_id', matchday.id)
        .eq('round_number', nextRound)

      if (nextMatches && nextMatches.length > 0) {
        await supabase
          .from('matchday_matches')
          .update({ status: 'in_progress' })
          .eq('matchday_id', matchday.id)
          .eq('round_number', nextRound)
      } else {
        // No more rounds — matchday complete
        await supabase
          .from('matchdays')
          .update({ status: 'completed' })
          .eq('id', matchday.id)
      }
    } else {
      // Mexicano: generate next round based on current standings
      const { data: allMatches } = await supabase
        .from('matchday_matches')
        .select('*')
        .eq('matchday_id', matchday.id)
        .eq('status', 'completed')

      const completedMatches = (allMatches || []).map((m: any) => ({
        team_a_player1: m.team_a_player1,
        team_a_player2: m.team_a_player2,
        team_b_player1: m.team_b_player1,
        team_b_player2: m.team_b_player2,
        score_a: m.score_a,
        score_b: m.score_b,
      }))

      const leaderboard = calculateLeaderboard(completedMatches, matchday.player_ids)
      const nextRound = match.round_number + 1

      // Check if we should continue (max rounds = players - 1)
      const maxRounds = matchday.player_ids.length - 1
      if (nextRound > maxRounds) {
        await supabase
          .from('matchdays')
          .update({ status: 'completed' })
          .eq('id', matchday.id)
      } else {
        // Generate next round
        const standings = leaderboard.map(e => ({
          playerId: e.playerId,
          totalPoints: e.totalPoints,
          matchesPlayed: e.matchesPlayed,
        }))

        const nextMatches = generateMexicanoRound(
          standings,
          matchday.courts,
          nextRound,
          new Map()
        )

        const inserts = nextMatches.map(m => ({
          matchday_id: matchday.id,
          round_number: nextRound,
          court_number: m.court,
          team_a_player1: m.teamA[0],
          team_a_player2: m.teamA[1],
          team_b_player1: m.teamB[0],
          team_b_player2: m.teamB[1],
          status: 'in_progress' as const,
        }))

        await supabase.from('matchday_matches').insert(inserts)
      }
    }
  }

  revalidatePath(`/admin/sessions/${matchday.session_id}`)
  revalidatePath(`/coach/sessions/${matchday.session_id}`)
  revalidatePath(`/session/${matchday.session_id}`)
  return { success: true }
}

export async function endMatchday(matchdayId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: matchday } = await supabase
    .from('matchdays')
    .select('session_id')
    .eq('id', matchdayId)
    .single()

  if (!matchday) return { error: 'Matchday not found' }

  await supabase
    .from('matchdays')
    .update({ status: 'completed' })
    .eq('id', matchdayId)

  // Cancel any pending/in_progress matches
  await supabase
    .from('matchday_matches')
    .update({ status: 'completed' })
    .eq('matchday_id', matchdayId)
    .in('status', ['pending', 'in_progress'])

  revalidatePath(`/admin/sessions/${matchday.session_id}`)
  revalidatePath(`/coach/sessions/${matchday.session_id}`)
  revalidatePath(`/session/${matchday.session_id}`)
  return { success: true }
}

export async function getMatchday(sessionId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: matchday } = await supabase
    .from('matchdays')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (!matchday) return { data: null }

  const { data: matches } = await supabase
    .from('matchday_matches')
    .select('*')
    .eq('matchday_id', matchday.id)
    .order('round_number')
    .order('court_number')

  return { data: { matchday, matches: matches || [] } }
}

export async function deleteMatchday(matchdayId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: matchday } = await supabase
    .from('matchdays')
    .select('session_id')
    .eq('id', matchdayId)
    .single()

  if (!matchday) return { error: 'Matchday not found' }

  await supabase.from('matchday_matches').delete().eq('matchday_id', matchdayId)
  await supabase.from('matchdays').delete().eq('id', matchdayId)

  revalidatePath(`/admin/sessions/${matchday.session_id}`)
  revalidatePath(`/coach/sessions/${matchday.session_id}`)
  return { success: true }
}
