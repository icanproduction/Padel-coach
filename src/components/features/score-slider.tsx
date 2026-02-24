'use client'

import { cn } from '@/lib/utils'

interface ScoreSliderProps {
  label: string
  description?: string
  value: number
  onChange: (value: number) => void
  className?: string
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'bg-grade-5'
  if (score >= 6) return 'bg-grade-4'
  if (score >= 4) return 'bg-grade-3'
  if (score >= 2) return 'bg-grade-2'
  return 'bg-grade-1'
}

function getScoreLabel(score: number): string {
  if (score >= 9) return 'Excellent'
  if (score >= 7) return 'Consistent'
  if (score >= 5) return 'Developing'
  if (score >= 3) return 'Occasional'
  return 'Cannot perform'
}

export function ScoreSlider({ label, description, value, onChange, className }: ScoreSliderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium">{label}</label>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="text-right">
          <span className={cn(
            'inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold text-white',
            getScoreColor(value)
          )}>
            {value}
          </span>
        </div>
      </div>

      {/* Custom range slider with large touch target */}
      <div className="relative">
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-8
            [&::-webkit-slider-thumb]:h-8
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-8
            [&::-moz-range-thumb]:h-8
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-white
            [&::-moz-range-thumb]:shadow-lg
            [&::-moz-range-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) ${((value - 1) / 9) * 100}%, hsl(var(--border)) ${((value - 1) / 9) * 100}%)`,
          }}
        />
        {/* Score labels */}
        <div className="flex justify-between mt-1 px-1">
          <span className="text-[10px] text-muted-foreground">1</span>
          <span className="text-[10px] text-muted-foreground">5</span>
          <span className="text-[10px] text-muted-foreground">10</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">{getScoreLabel(value)}</p>
    </div>
  )
}
