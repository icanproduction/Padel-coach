import { getAllModules, getCurriculumByModuleId } from '@/data/curriculum'
import { CoachModeForm } from './coach-mode-form'

interface CoachModePageProps {
  searchParams: Promise<{ module?: string; player?: string; session?: string }>
}

export default async function CoachModePage({ searchParams }: CoachModePageProps) {
  const sp = await searchParams

  // Get all modules for the dropdown
  const allModules = getAllModules().map((m) => {
    const curriculum = getCurriculumByModuleId(m.id)
    return {
      id: m.id,
      name: m.name,
      curriculumId: m.curriculumId,
      curriculumName: curriculum?.name ?? '',
      drills: m.drills.map((d) => ({ id: d.id, name: d.name })),
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Coach Mode</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Module guide and drill tracking during a session
        </p>
      </div>

      <CoachModeForm
        modules={allModules}
        preselectedModuleId={sp.module}
        preselectedPlayerId={sp.player}
        preselectedSessionId={sp.session}
      />
    </div>
  )
}
