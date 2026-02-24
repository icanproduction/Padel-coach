import { CURRICULUMS } from '@/data/curriculum'
import { CurriculumAccordion } from './curriculum-accordion'
import { BookOpen } from 'lucide-react'

export default function CurriculumPage() {
  // Transform data for the client component
  const curriculumData = CURRICULUMS.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    modules: c.modules.map((m) => ({
      id: m.id,
      name: m.name,
      drills: m.drills.map((d) => ({
        id: d.id,
        name: d.name,
      })),
    })),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Curriculum</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse all {CURRICULUMS.length} curriculums and {CURRICULUMS.reduce((acc, c) => acc + c.modules.length, 0)} modules
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Structured Learning Path</p>
          <p className="text-xs text-muted-foreground mt-1">
            Each curriculum contains 3 progressive modules. Each module has 3 drills that build
            on each other. Use Coach Mode during sessions to follow the module guide.
          </p>
        </div>
      </div>

      {/* Curriculum List */}
      <CurriculumAccordion curriculums={curriculumData} />
    </div>
  )
}
