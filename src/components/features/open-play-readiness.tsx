import { cn } from '@/lib/utils'

interface OpenPlayReadinessProps {
  averageScore: number
  className?: string
}

function getReadiness(avg: number) {
  if (avg >= 7.5) return { status: 'ready', label: 'Ready for Open Play', description: "You're ready to join open play sessions!", color: 'bg-grade-5', percentage: 100 }
  if (avg >= 6) return { status: 'almost', label: 'Almost Ready', description: 'Refining technique for open play', color: 'bg-grade-4', percentage: 75 }
  if (avg >= 4) return { status: 'getting_there', label: 'Getting There', description: 'Building core skills', color: 'bg-grade-3', percentage: 50 }
  return { status: 'not_ready', label: 'Focus on Fundamentals', description: 'Keep working on the basics', color: 'bg-grade-2', percentage: 25 }
}

export function OpenPlayReadiness({ averageScore, className }: OpenPlayReadinessProps) {
  const readiness = getReadiness(averageScore)

  return (
    <div className={cn('bg-card rounded-xl border border-border p-4', className)}>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Open Play Readiness</h3>
      <p className="text-lg font-semibold mb-1">{readiness.label}</p>
      <p className="text-xs text-muted-foreground mb-3">{readiness.description}</p>

      {/* Progress bar */}
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', readiness.color)}
          style={{ width: `${readiness.percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
        <span>Beginner</span>
        <span>Open Play</span>
      </div>
    </div>
  )
}
