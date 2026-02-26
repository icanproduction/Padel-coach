'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from '@/app/actions/player-actions'
import type { ExperienceLevel, PlayingFrequency } from '@/types/database'

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: 'never_played', label: 'Never Played' },
  { value: 'tried_once', label: 'Tried Once' },
  { value: 'play_sometimes', label: 'Play Sometimes' },
  { value: 'play_regularly', label: 'Play Regularly' },
]

const GOAL_OPTIONS: { value: string; label: string }[] = [
  { value: 'learn_basics', label: 'Learn Basics' },
  { value: 'improve_technique', label: 'Improve Technique' },
  { value: 'competitive_play', label: 'Competitive Play' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'social_fun', label: 'Social / Fun' },
]

const FREQUENCY_OPTIONS: { value: PlayingFrequency; label: string }[] = [
  { value: '1x_week', label: '1x per week' },
  { value: '2x_week', label: '2x per week' },
  { value: '3x_week', label: '3x per week' },
  { value: 'more', label: 'More than 3x' },
]

const RACKET_SPORTS = ['Tennis', 'Badminton', 'Squash', 'Table Tennis', 'Other']

export function OnboardingForm() {
  const [step, setStep] = useState(1)
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>('')
  const [racketSports, setRacketSports] = useState<string[]>([])
  const [primaryGoals, setPrimaryGoals] = useState<string[]>([])
  const [fears, setFears] = useState('')
  const [frequency, setFrequency] = useState<PlayingFrequency | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const totalSteps = 4

  const canProceed = () => {
    switch (step) {
      case 1: return experienceLevel !== ''
      case 2: return primaryGoals.length > 0
      case 3: return frequency !== ''
      case 4: return true
      default: return false
    }
  }

  const toggleRacketSport = (sport: string) => {
    setRacketSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    )
  }

  const toggleGoal = (goal: string) => {
    setPrimaryGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
  }

  const handleSubmit = async () => {
    if (!experienceLevel || primaryGoals.length === 0 || !frequency) return
    setLoading(true)
    setError(null)

    const result = await completeOnboarding({
      experience_level: experienceLevel,
      previous_racket_sport: racketSports.length > 0 ? racketSports.join(',') : undefined,
      primary_goal: primaryGoals.join(','),
      fears_concerns: fears || undefined,
      playing_frequency_goal: frequency,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/player')
    router.refresh()
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Progress indicator */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Experience + Racket Sports */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Padel Experience</h2>
          <p className="text-sm text-muted-foreground">How would you describe your padel experience?</p>
          <div className="grid grid-cols-1 gap-2">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setExperienceLevel(opt.value)}
                className={`p-4 rounded-lg border-2 text-left text-sm font-medium transition-colors min-h-[44px] ${
                  experienceLevel === opt.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium mb-1.5">
              Previous racket sport? <span className="text-muted-foreground font-normal">(pilih semua yang sesuai)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {RACKET_SPORTS.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => toggleRacketSport(sport)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    racketSports.includes(sport)
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>
            {racketSports.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1.5">Tidak ada? Lanjut saja!</p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Goals (multi-select) */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Goals</h2>
          <p className="text-sm text-muted-foreground">What do you want to achieve? (pilih semua yang sesuai)</p>
          <div className="grid grid-cols-1 gap-2">
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleGoal(opt.value)}
                className={`p-4 rounded-lg border-2 text-left text-sm font-medium transition-colors min-h-[44px] ${
                  primaryGoals.includes(opt.value)
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Frequency */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Playing Frequency</h2>
          <p className="text-sm text-muted-foreground">How often do you want to play?</p>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFrequency(opt.value)}
                className={`p-4 rounded-lg border-2 text-center text-sm font-medium transition-colors min-h-[44px] ${
                  frequency === opt.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Fears/Concerns */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Anything We Should Know?</h2>
          <p className="text-sm text-muted-foreground">
            Any fears, concerns, or areas you&apos;d like to focus on? (Optional)
          </p>
          <textarea
            value={fears}
            onChange={(e) => setFears(e.target.value)}
            placeholder="e.g., afraid of the glass walls, weak backhand..."
            className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="px-4 py-2.5 text-sm font-medium rounded-lg border border-border hover:bg-muted disabled:opacity-0 min-h-[44px] transition-colors"
        >
          Back
        </button>

        {step < totalSteps ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 min-h-[44px] transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 min-h-[44px] transition-colors"
          >
            {loading ? 'Saving...' : 'Complete Setup'}
          </button>
        )}
      </div>
    </div>
  )
}
