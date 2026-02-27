// =============================================================================
// Padel Coach Pro - Curriculum Data
// Complete curriculum structure: 6 Curriculums > 18 Modules > Drills
// =============================================================================

export interface Drill {
  id: string
  name: string
}

export interface Module {
  id: string
  name: string
  curriculumId: string
  drills: Drill[]
}

export interface Curriculum {
  id: string
  name: string
  description: string
  modules: Module[]
}

// =============================================================================
// CURRICULUM DATA
// =============================================================================

export const CURRICULUMS: Curriculum[] = [
  // =========================================================================
  // 1. SERVE & RETURN FOUNDATION
  // =========================================================================
  {
    id: 'serve-return-foundation',
    name: 'Serve & Return Foundation',
    description:
      'Build a reliable underhand serve and stable return. Focus on consistency, placement, and transitioning from serve into rally-ready position.',
    modules: [
      {
        id: 'serve-introduction',
        name: 'Serve Introduction',
        curriculumId: 'serve-return-foundation',
        drills: [
          { id: 'serve-intro-1', name: 'Drop & Contact Feel' },
          { id: 'serve-intro-2', name: 'Static Underhand Serve' },
          { id: 'serve-intro-3', name: 'Serve Direction Control' },
        ],
      },
      {
        id: 'serve-and-go',
        name: 'Serve & Go',
        curriculumId: 'serve-return-foundation',
        drills: [
          { id: 'serve-go-1', name: 'Serve + Freeze Position' },
          { id: 'serve-go-2', name: 'Serve → Ready Step' },
          { id: 'serve-go-3', name: 'Serve → First Ball Rally' },
        ],
      },
      {
        id: 'return-stability',
        name: 'Return Stability',
        curriculumId: 'serve-return-foundation',
        drills: [
          { id: 'return-stab-1', name: 'Return Block Feed' },
          { id: 'return-stab-2', name: 'Controlled Return Middle' },
          { id: 'return-stab-3', name: 'Return Cooperative Rally' },
        ],
      },
    ],
  },

  // =========================================================================
  // 2. BALL CONTROL (GROUNDSTROKE)
  // =========================================================================
  {
    id: 'ball-control',
    name: 'Ball Control (Groundstroke)',
    description:
      'Develop compact swing mechanics, absorb pace effectively, and control direction from the baseline. Foundation for consistent groundstroke rallies.',
    modules: [
      {
        id: 'short-swing-control',
        name: 'Short Swing Control',
        curriculumId: 'ball-control',
        drills: [
          { id: 'short-swing-1', name: 'Static Block Feed' },
          { id: 'short-swing-2', name: 'Offset Control Feed' },
          { id: 'short-swing-3', name: 'Cooperative Rally Baseline' },
        ],
      },
      {
        id: 'pace-absorption',
        name: 'Pace Absorption',
        curriculumId: 'ball-control',
        drills: [
          { id: 'pace-abs-1', name: 'Passive Block Contact' },
          { id: 'pace-abs-2', name: 'Medium Pace Absorb Feed' },
          { id: 'pace-abs-3', name: 'Controlled Redirection Rally' },
        ],
      },
      {
        id: 'direction-control',
        name: 'Direction Control',
        curriculumId: 'ball-control',
        drills: [
          { id: 'dir-ctrl-1', name: 'Middle Target Feed' },
          { id: 'dir-ctrl-2', name: 'Cross vs Straight Control' },
          { id: 'dir-ctrl-3', name: 'Cooperative Direction Rally' },
        ],
      },
    ],
  },

  // =========================================================================
  // 3. COURT AWARENESS
  // =========================================================================
  {
    id: 'court-awareness',
    name: 'Court Awareness',
    description:
      'Develop spatial intelligence on the padel court. Learn recovery positioning, spacing relative to the ball and partner, and lane responsibility in doubles.',
    modules: [
      {
        id: 'recovery-position',
        name: 'Recovery Position',
        curriculumId: 'court-awareness',
        drills: [
          { id: 'recovery-pos-1', name: 'Shadow Hit & Recover' },
          { id: 'recovery-pos-2', name: 'Feed + Recover Cone' },
          { id: 'recovery-pos-3', name: 'Rally + Recover Rule' },
        ],
      },
      {
        id: 'spacing-awareness',
        name: 'Spacing Awareness',
        curriculumId: 'court-awareness',
        drills: [
          { id: 'spacing-aw-1', name: 'Distance Recognition Feed' },
          { id: 'spacing-aw-2', name: 'Move Before Hit Drill' },
          { id: 'spacing-aw-3', name: 'Live Spacing Rally' },
        ],
      },
      {
        id: 'partner-lane-awareness',
        name: 'Partner Lane Awareness',
        curriculumId: 'court-awareness',
        drills: [
          { id: 'partner-lane-1', name: 'Left/Right Responsibility Walkthrough' },
          { id: 'partner-lane-2', name: 'Cooperative Lane Rally' },
          { id: 'partner-lane-3', name: 'Guided Doubles Simulation' },
        ],
      },
    ],
  },

  // =========================================================================
  // 4. WALL SURVIVAL
  // =========================================================================
  {
    id: 'wall-survival',
    name: 'Wall Survival',
    description:
      'Learn to read, accept, and play balls off the back and side glass. Build comfort letting balls pass and timing contact after the bounce off the wall.',
    modules: [
      {
        id: 'let-ball-pass',
        name: 'Let Ball Pass',
        curriculumId: 'wall-survival',
        drills: [
          { id: 'let-pass-1', name: 'Let Pass Observation' },
          { id: 'let-pass-2', name: 'Pass & Catch' },
          { id: 'let-pass-3', name: 'Soft Return After Glass' },
        ],
      },
      {
        id: 'back-glass-control',
        name: 'Back Glass Control',
        curriculumId: 'wall-survival',
        drills: [
          { id: 'back-glass-1', name: 'Single Bounce Glass Feed' },
          { id: 'back-glass-2', name: 'Glass Timing Contact' },
          { id: 'back-glass-3', name: 'Glass Rally Cooperative' },
        ],
      },
      {
        id: 'side-glass-introduction',
        name: 'Side Glass Introduction',
        curriculumId: 'wall-survival',
        drills: [
          { id: 'side-glass-1', name: 'Angle Observation' },
          { id: 'side-glass-2', name: 'Side Glass Catch' },
          { id: 'side-glass-3', name: 'Controlled Side Glass Return' },
        ],
      },
    ],
  },

  // =========================================================================
  // 5. NET SURVIVAL
  // =========================================================================
  {
    id: 'net-survival',
    name: 'Net Survival',
    description:
      'Build confidence and stability at the net. Develop volley technique, learn net positioning and recovery, and introduce the bandeja overhead.',
    modules: [
      {
        id: 'volley-stability',
        name: 'Volley Stability',
        curriculumId: 'net-survival',
        drills: [
          { id: 'volley-stab-1', name: 'Static Volley Block' },
          { id: 'volley-stab-2', name: 'Coach Feed Volley Line' },
          { id: 'volley-stab-3', name: 'Cooperative Volley Rally' },
        ],
      },
      {
        id: 'net-positioning',
        name: 'Net Positioning',
        curriculumId: 'net-survival',
        drills: [
          { id: 'net-pos-1', name: 'Step & Stop Position' },
          { id: 'net-pos-2', name: 'Volley Recover Drill' },
          { id: 'net-pos-3', name: 'Net Control Rally' },
        ],
      },
      {
        id: 'bandeja-introduction',
        name: 'Bandeja Introduction',
        curriculumId: 'net-survival',
        drills: [
          { id: 'bandeja-intro-1', name: 'Overhead Contact Feel' },
          { id: 'bandeja-intro-2', name: 'Soft Bandeja Feed' },
          { id: 'bandeja-intro-3', name: 'Bandeja Recovery Drill' },
        ],
      },
    ],
  },

  // =========================================================================
  // 6. RALLY MANAGEMENT
  // =========================================================================
  {
    id: 'rally-management',
    name: 'Rally Management',
    description:
      'Learn to sustain rallies, recognize attack vs defense situations, and apply decision-making under game-like conditions. The bridge to open play.',
    modules: [
      {
        id: 'cooperative-rally',
        name: 'Cooperative Rally',
        curriculumId: 'rally-management',
        drills: [
          { id: 'coop-rally-1', name: 'No Winner Rally' },
          { id: 'coop-rally-2', name: 'Tempo Control Rally' },
          { id: 'coop-rally-3', name: '10 Ball Challenge' },
        ],
      },
      {
        id: 'attack-vs-defense',
        name: 'Attack vs Defense Awareness',
        curriculumId: 'rally-management',
        drills: [
          { id: 'atk-def-1', name: 'Color Call Decision Drill' },
          { id: 'atk-def-2', name: 'Defensive Reset Rally' },
          { id: 'atk-def-3', name: 'Transition Rally' },
        ],
      },
      {
        id: 'open-play-simulation',
        name: 'Open Play Simulation',
        curriculumId: 'rally-management',
        drills: [
          { id: 'open-play-1', name: 'Guided Point Play' },
          { id: 'open-play-2', name: 'Coach Intervention Rally' },
          { id: 'open-play-3', name: 'Scenario Game Play' },
        ],
      },
    ],
  },
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Returns a flat array of all modules across all curriculums.
 */
export function getAllModules(): Module[] {
  return CURRICULUMS.flatMap((curriculum) => curriculum.modules)
}

/**
 * Finds a module by its ID across all curriculums.
 */
export function getModuleById(moduleId: string): Module | undefined {
  for (const curriculum of CURRICULUMS) {
    const found = curriculum.modules.find((m) => m.id === moduleId)
    if (found) return found
  }
  return undefined
}

/**
 * Finds a curriculum by its ID.
 */
export function getCurriculumById(curriculumId: string): Curriculum | undefined {
  return CURRICULUMS.find((c) => c.id === curriculumId)
}

/**
 * Gets the curriculum that contains a given module ID.
 */
export function getCurriculumByModuleId(moduleId: string): Curriculum | undefined {
  return CURRICULUMS.find((c) => c.modules.some((m) => m.id === moduleId))
}

/**
 * Finds a drill by its ID and returns it with its module and curriculum context.
 */
export function getDrillWithContext(drillId: string): {
  drill: Drill
  module: Module
  curriculum: Curriculum
} | undefined {
  for (const curriculum of CURRICULUMS) {
    for (const mod of curriculum.modules) {
      const drill = mod.drills.find((d) => d.id === drillId)
      if (drill) return { drill, module: mod, curriculum }
    }
  }
  return undefined
}

/**
 * Gets the next module in the same curriculum after the given module ID.
 * Returns undefined if the module is the last in its curriculum.
 */
export function getNextModuleInCurriculum(moduleId: string): Module | undefined {
  for (const curriculum of CURRICULUMS) {
    const index = curriculum.modules.findIndex((m) => m.id === moduleId)
    if (index !== -1 && index < curriculum.modules.length - 1) {
      return curriculum.modules[index + 1]
    }
  }
  return undefined
}

// =============================================================================
// PARAMETER → CURRICULUM MAPPING
// Maps low-scoring assessment parameters to recommended curriculum/module pairs.
// Used when a parameter score is <= 4 to suggest targeted training.
// =============================================================================

export const PARAMETER_CURRICULUM_MAP: Record<
  string,
  { curriculumId: string; priorityModuleId: string }[]
> = {
  reaction_to_ball: [
    {
      curriculumId: 'rally-management',
      priorityModuleId: 'cooperative-rally',
    },
  ],
  swing_size: [
    {
      curriculumId: 'ball-control',
      priorityModuleId: 'short-swing-control',
    },
  ],
  spacing_awareness: [
    {
      curriculumId: 'court-awareness',
      priorityModuleId: 'spacing-awareness',
    },
  ],
  recovery_habit: [
    {
      curriculumId: 'court-awareness',
      priorityModuleId: 'recovery-position',
    },
  ],
  decision_making: [
    {
      curriculumId: 'rally-management',
      priorityModuleId: 'attack-vs-defense',
    },
  ],
}
