// =============================================================================
// Padel Coach Pro - Assessment Engine
// Pure functions for scoring, grading, archetype detection, and module
// recommendation. No database calls - all logic is deterministic.
// =============================================================================

import {
  CURRICULUMS,
  PARAMETER_CURRICULUM_MAP,
  getModuleById,
  getCurriculumById,
  getNextModuleInCurriculum,
} from '@/data/curriculum'

// =============================================================================
// TYPES
// =============================================================================

export interface AssessmentScores {
  reaction_to_ball: number
  swing_size: number
  spacing_awareness: number
  recovery_habit: number
  decision_making: number
}

export interface ModuleRecommendation {
  moduleId: string
  moduleName: string
  curriculumName: string
  reason: string
  priority: 'high' | 'medium' | 'low'
}

export type GradeLevel = 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 4' | 'Grade 5'

export type ArchetypeName =
  | 'The Learner'
  | 'The Natural'
  | 'The Wild Card'
  | 'The Thinker'
  | 'The Athlete'
  | 'The Wall'
  | 'The Competitor'
  | 'The Balanced'

export type OpenPlayStatus = 'not_ready' | 'getting_there' | 'almost_ready' | 'ready'

export interface OpenPlayReadiness {
  status: OpenPlayStatus
  label: string
  description: string
}

// =============================================================================
// SCORE CALCULATION
// =============================================================================

/**
 * Calculates the average of all 5 assessment parameter scores.
 * Returns a decimal rounded to 1 decimal place.
 *
 * @param scores - The 5 assessment parameter scores (each 1-10)
 * @returns Average score rounded to 1 decimal place
 */
export function calculateAverageScore(scores: AssessmentScores): number {
  const values = [
    scores.reaction_to_ball,
    scores.swing_size,
    scores.spacing_awareness,
    scores.recovery_habit,
    scores.decision_making,
  ]
  const sum = values.reduce((acc, val) => acc + val, 0)
  const avg = sum / values.length
  return Math.round(avg * 10) / 10
}

// =============================================================================
// GRADE CALCULATION
// =============================================================================

/**
 * Determines the grade level based on the average score.
 *
 * Grade 1: 1.0 - 2.9 (Beginner)
 * Grade 2: 3.0 - 4.9 (Elementary)
 * Grade 3: 5.0 - 6.9 (Intermediate)
 * Grade 4: 7.0 - 8.4 (Advanced)
 * Grade 5: 8.5 - 10.0 (Expert)
 *
 * @param avgScore - The average score (1.0 to 10.0)
 * @returns Grade string (e.g., "Grade 1")
 */
export function calculateGrade(avgScore: number): GradeLevel {
  if (avgScore < 3.0) return 'Grade 1'
  if (avgScore < 5.0) return 'Grade 2'
  if (avgScore < 7.0) return 'Grade 3'
  if (avgScore < 8.5) return 'Grade 4'
  return 'Grade 5'
}

// =============================================================================
// ARCHETYPE DETECTION
// =============================================================================

/**
 * Determines the player archetype based on the pattern of their scores.
 * Archetypes describe the player's natural tendencies and strengths.
 *
 * Archetypes (checked in order of specificity):
 * - The Learner:     All scores < 5 (new to padel, everything needs work)
 * - The Natural:     All scores > 6 (naturally talented, well-rounded)
 * - The Wild Card:   Spread > 4 (huge variance, inconsistent across skills)
 * - The Thinker:     Decision highest (7+), Reaction/Recovery lower
 * - The Athlete:     Reaction + Recovery highest, Decision lower
 * - The Wall:        Spacing + Swing consistent (6+), low Decision
 * - The Competitor:  Decision + Recovery highest
 * - The Balanced:    Fallback when no specific pattern matches
 *
 * @param scores - The 5 assessment parameter scores
 * @returns Archetype name string
 */
export function determineArchetype(scores: AssessmentScores): ArchetypeName {
  const {
    reaction_to_ball,
    swing_size,
    spacing_awareness,
    recovery_habit,
    decision_making,
  } = scores

  const allValues = [
    reaction_to_ball,
    swing_size,
    spacing_awareness,
    recovery_habit,
    decision_making,
  ]

  const maxScore = Math.max(...allValues)
  const minScore = Math.min(...allValues)
  const spread = maxScore - minScore

  // The Learner: all < 5
  if (allValues.every((v) => v < 5)) {
    return 'The Learner'
  }

  // The Natural: all > 6
  if (allValues.every((v) => v > 6)) {
    return 'The Natural'
  }

  // The Wild Card: spread > 4
  if (spread > 4) {
    return 'The Wild Card'
  }

  // The Thinker: Decision highest (7+), Reaction/Recovery lower
  if (
    decision_making >= 7 &&
    decision_making >= maxScore &&
    (reaction_to_ball < decision_making - 1 || recovery_habit < decision_making - 1)
  ) {
    return 'The Thinker'
  }

  // The Athlete: Reaction + Recovery highest, Decision lower
  const physicalAvg = (reaction_to_ball + recovery_habit) / 2
  if (
    physicalAvg >= 6 &&
    reaction_to_ball >= decision_making + 1 &&
    recovery_habit >= decision_making + 1
  ) {
    return 'The Athlete'
  }

  // The Wall: Spacing + Swing consistent (6+), low Decision
  if (
    spacing_awareness >= 6 &&
    swing_size >= 6 &&
    decision_making < spacing_awareness - 1 &&
    decision_making < swing_size - 1
  ) {
    return 'The Wall'
  }

  // The Competitor: Decision + Recovery highest
  if (
    decision_making >= 6 &&
    recovery_habit >= 6 &&
    decision_making >= swing_size &&
    decision_making >= spacing_awareness &&
    recovery_habit >= swing_size &&
    recovery_habit >= spacing_awareness
  ) {
    return 'The Competitor'
  }

  // Fallback
  return 'The Balanced'
}

// =============================================================================
// MODULE RECOMMENDATION
// =============================================================================

/**
 * Recommends up to 3 training modules based on assessment scores and
 * previously completed modules.
 *
 * Logic (from brief Section 5.2 + 5.3):
 * 1. If ALL scores <= 3: start with absolute basics (Serve Introduction,
 *    Short Swing Control, Cooperative Rally)
 * 2. For each parameter scoring <= 4: recommend the mapped curriculum/module
 * 3. Skip already-completed modules; suggest the next module in that curriculum
 * 4. Include 1 "strength" module from the player's highest-scoring area
 * 5. Maximum 3 recommendations returned
 *
 * @param scores - The 5 assessment parameter scores
 * @param completedModuleIds - Array of module IDs the player has already completed
 * @returns Array of up to 3 ModuleRecommendation objects, sorted by priority
 */
export function recommendModules(
  scores: AssessmentScores,
  completedModuleIds: string[] = []
): ModuleRecommendation[] {
  const recommendations: ModuleRecommendation[] = []
  const addedModuleIds = new Set<string>()

  const allValues = [
    scores.reaction_to_ball,
    scores.swing_size,
    scores.spacing_awareness,
    scores.recovery_habit,
    scores.decision_making,
  ]

  // --- Rule 1: If ALL scores <= 3, start with absolute basics ---
  if (allValues.every((v) => v <= 3)) {
    const basicModules = [
      {
        moduleId: 'serve-introduction',
        reason: 'Foundation starting point: build a reliable serve to start every point.',
      },
      {
        moduleId: 'short-swing-control',
        reason: 'Core fundamental: develop a compact swing for consistent ball contact.',
      },
      {
        moduleId: 'cooperative-rally',
        reason: 'Essential skill: learn to sustain rallies and keep the ball in play.',
      },
    ]

    for (const basic of basicModules) {
      if (recommendations.length >= 3) break

      let targetModuleId = basic.moduleId

      // If already completed, find the next module in the same curriculum
      if (completedModuleIds.includes(targetModuleId)) {
        const next = getNextModuleInCurriculum(targetModuleId)
        if (next && !completedModuleIds.includes(next.id)) {
          targetModuleId = next.id
        } else {
          continue // Skip entirely if no next module available
        }
      }

      if (addedModuleIds.has(targetModuleId)) continue

      const mod = getModuleById(targetModuleId)
      if (!mod) continue

      const curriculum = getCurriculumById(mod.curriculumId)
      if (!curriculum) continue

      recommendations.push({
        moduleId: targetModuleId,
        moduleName: mod.name,
        curriculumName: curriculum.name,
        reason: basic.reason,
        priority: 'high',
      })
      addedModuleIds.add(targetModuleId)
    }

    return recommendations
  }

  // --- Rule 2: For each parameter <= 4, recommend the mapped module ---
  const paramEntries: { param: string; score: number }[] = [
    { param: 'reaction_to_ball', score: scores.reaction_to_ball },
    { param: 'swing_size', score: scores.swing_size },
    { param: 'spacing_awareness', score: scores.spacing_awareness },
    { param: 'recovery_habit', score: scores.recovery_habit },
    { param: 'decision_making', score: scores.decision_making },
  ]

  // Sort by score ascending so the weakest areas get priority
  const weakParams = paramEntries
    .filter((p) => p.score <= 4)
    .sort((a, b) => a.score - b.score)

  for (const weak of weakParams) {
    if (recommendations.length >= 2) break // Reserve 1 slot for strength module

    const mappings = PARAMETER_CURRICULUM_MAP[weak.param]
    if (!mappings || mappings.length === 0) continue

    for (const mapping of mappings) {
      if (recommendations.length >= 2) break

      let targetModuleId = mapping.priorityModuleId

      // Rule 3: Skip completed modules, suggest next in curriculum
      if (completedModuleIds.includes(targetModuleId)) {
        const next = getNextModuleInCurriculum(targetModuleId)
        if (next && !completedModuleIds.includes(next.id)) {
          targetModuleId = next.id
        } else {
          // Try to find any uncompleted module in this curriculum
          const curriculum = getCurriculumById(mapping.curriculumId)
          if (curriculum) {
            const uncompleted = curriculum.modules.find(
              (m) => !completedModuleIds.includes(m.id) && !addedModuleIds.has(m.id)
            )
            if (uncompleted) {
              targetModuleId = uncompleted.id
            } else {
              continue // All modules in this curriculum are completed
            }
          } else {
            continue
          }
        }
      }

      if (addedModuleIds.has(targetModuleId)) continue

      const mod = getModuleById(targetModuleId)
      if (!mod) continue

      const curriculum = getCurriculumById(mod.curriculumId)
      if (!curriculum) continue

      const paramLabel = formatParamName(weak.param)
      recommendations.push({
        moduleId: targetModuleId,
        moduleName: mod.name,
        curriculumName: curriculum.name,
        reason: `Your ${paramLabel} score is ${weak.score}/10. This module will help strengthen that area.`,
        priority: 'high',
      })
      addedModuleIds.add(targetModuleId)
    }
  }

  // --- Rule 4: Include 1 "strength" module from the highest scoring area ---
  if (recommendations.length < 3) {
    const strengthModule = findStrengthModule(scores, completedModuleIds, addedModuleIds)
    if (strengthModule) {
      recommendations.push(strengthModule)
      addedModuleIds.add(strengthModule.moduleId)
    }
  }

  // --- Fill remaining slots with next-priority weak areas if needed ---
  if (recommendations.length < 3) {
    for (const weak of weakParams) {
      if (recommendations.length >= 3) break

      const mappings = PARAMETER_CURRICULUM_MAP[weak.param]
      if (!mappings) continue

      for (const mapping of mappings) {
        if (recommendations.length >= 3) break

        const curriculum = getCurriculumById(mapping.curriculumId)
        if (!curriculum) continue

        const uncompleted = curriculum.modules.find(
          (m) => !completedModuleIds.includes(m.id) && !addedModuleIds.has(m.id)
        )
        if (!uncompleted) continue

        recommendations.push({
          moduleId: uncompleted.id,
          moduleName: uncompleted.name,
          curriculumName: curriculum.name,
          reason: `Continue building on ${formatParamName(weak.param)} through progressive training.`,
          priority: 'medium',
        })
        addedModuleIds.add(uncompleted.id)
      }
    }
  }

  // --- Rule 5: Max 3 recommendations ---
  return recommendations.slice(0, 3)
}

// =============================================================================
// STRENGTH MODULE FINDER (internal helper)
// =============================================================================

/**
 * Finds an appropriate "strength" module for the player's highest-scoring area.
 * Maps high-scoring parameters to advanced modules in the corresponding curriculum.
 */
function findStrengthModule(
  scores: AssessmentScores,
  completedModuleIds: string[],
  addedModuleIds: Set<string>
): ModuleRecommendation | null {
  // Map parameters to curriculum areas for strength building
  const strengthMap: Record<string, { curriculumId: string; label: string }> = {
    reaction_to_ball: { curriculumId: 'rally-management', label: 'Reaction to Ball' },
    swing_size: { curriculumId: 'ball-control', label: 'Swing Control' },
    spacing_awareness: { curriculumId: 'court-awareness', label: 'Spacing Awareness' },
    recovery_habit: { curriculumId: 'court-awareness', label: 'Recovery Habit' },
    decision_making: { curriculumId: 'rally-management', label: 'Decision Making' },
  }

  // Find the highest-scoring parameter
  const paramEntries = [
    { param: 'reaction_to_ball', score: scores.reaction_to_ball },
    { param: 'swing_size', score: scores.swing_size },
    { param: 'spacing_awareness', score: scores.spacing_awareness },
    { param: 'recovery_habit', score: scores.recovery_habit },
    { param: 'decision_making', score: scores.decision_making },
  ]

  // Sort descending by score
  const sorted = [...paramEntries].sort((a, b) => b.score - a.score)

  for (const entry of sorted) {
    const mapping = strengthMap[entry.param]
    if (!mapping) continue

    const curriculum = getCurriculumById(mapping.curriculumId)
    if (!curriculum) continue

    // Find the most advanced uncompleted module in this curriculum
    const modules = [...curriculum.modules].reverse() // Start from the most advanced
    for (const mod of modules) {
      if (!completedModuleIds.includes(mod.id) && !addedModuleIds.has(mod.id)) {
        return {
          moduleId: mod.id,
          moduleName: mod.name,
          curriculumName: curriculum.name,
          reason: `Your ${mapping.label} is a strength (${entry.score}/10). This module builds on that foundation to take it further.`,
          priority: 'low',
        }
      }
    }
  }

  // If no strength module found in primary areas, pick any uncompleted module
  for (const curriculum of CURRICULUMS) {
    for (const mod of curriculum.modules) {
      if (!completedModuleIds.includes(mod.id) && !addedModuleIds.has(mod.id)) {
        return {
          moduleId: mod.id,
          moduleName: mod.name,
          curriculumName: curriculum.name,
          reason: 'Recommended to broaden your overall padel skills.',
          priority: 'low',
        }
      }
    }
  }

  return null
}

// =============================================================================
// OPEN PLAY READINESS
// =============================================================================

/**
 * Determines the player's readiness for open (unguided) play based on
 * their average assessment score.
 *
 * Status levels:
 * - not_ready:      avgScore < 3.0
 * - getting_there:  avgScore 3.0 - 4.9
 * - almost_ready:   avgScore 5.0 - 6.9
 * - ready:          avgScore >= 7.0
 *
 * @param avgScore - The average of all 5 assessment parameters
 * @returns Object with status, human-readable label, and description
 */
export function getOpenPlayReadiness(avgScore: number): OpenPlayReadiness {
  if (avgScore < 3.0) {
    return {
      status: 'not_ready',
      label: 'Building Foundations',
      description:
        'Focus on the basics first. Work through the foundational modules to build reliable skills before jumping into open play. Structured drills and cooperative rallies are your best friend right now.',
    }
  }

  if (avgScore < 5.0) {
    return {
      status: 'getting_there',
      label: 'Getting There',
      description:
        'You are making progress and developing core skills. Continue with guided drills and start incorporating short cooperative rallies. Open play is on the horizon but structured practice will accelerate your growth.',
    }
  }

  if (avgScore < 7.0) {
    return {
      status: 'almost_ready',
      label: 'Almost Ready',
      description:
        'Your skills are solid and you are close to being ready for open play. Focus on the Rally Management curriculum to bridge the gap. Try guided point play with coach intervention to simulate real match situations.',
    }
  }

  return {
    status: 'ready',
    label: 'Ready for Open Play',
    description:
      'You have a strong foundation across all skill areas. You are ready to play open padel and apply what you have learned in real match situations. Continue to refine your game through competitive play and targeted training.',
  }
}

// =============================================================================
// UTILITY HELPERS
// =============================================================================

/**
 * Formats a snake_case parameter name into a human-readable label.
 */
function formatParamName(param: string): string {
  const labels: Record<string, string> = {
    reaction_to_ball: 'Reaction to Ball',
    swing_size: 'Swing Size',
    spacing_awareness: 'Spacing Awareness',
    recovery_habit: 'Recovery Habit',
    decision_making: 'Decision Making',
  }
  return labels[param] || param.replace(/_/g, ' ')
}

/**
 * Validates that all assessment scores are within the valid range (1-10).
 * Returns true if all scores are valid, false otherwise.
 */
export function validateScores(scores: AssessmentScores): boolean {
  const values = [
    scores.reaction_to_ball,
    scores.swing_size,
    scores.spacing_awareness,
    scores.recovery_habit,
    scores.decision_making,
  ]
  return values.every((v) => typeof v === 'number' && v >= 1 && v <= 10)
}

/**
 * Returns a summary object combining all assessment results for a given score set.
 * Useful for generating a complete assessment report in one call.
 */
export function generateAssessmentSummary(
  scores: AssessmentScores,
  completedModuleIds: string[] = []
): {
  averageScore: number
  grade: GradeLevel
  archetype: ArchetypeName
  openPlayReadiness: OpenPlayReadiness
  recommendations: ModuleRecommendation[]
} {
  const averageScore = calculateAverageScore(scores)
  return {
    averageScore,
    grade: calculateGrade(averageScore),
    archetype: determineArchetype(scores),
    openPlayReadiness: getOpenPlayReadiness(averageScore),
    recommendations: recommendModules(scores, completedModuleIds),
  }
}
