'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerUser } from '@/app/actions/auth-actions'

export function RegisterForm() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'player' | 'coach'>('player')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (username.includes('@') || username.includes(' ')) {
      setError('Username tidak boleh mengandung @ atau spasi')
      setLoading(false)
      return
    }

    const result = await registerUser({
      username,
      password,
      full_name: fullName,
      role,
      phone: phone || undefined,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Redirect based on role
    if (role === 'player') {
      router.push('/onboarding')
    } else {
      router.push('/coach')
    }
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">I am a</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('player')}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors min-h-[44px] ${
                role === 'player'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              Player
            </button>
            <button
              type="button"
              onClick={() => setRole('coach')}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors min-h-[44px] ${
                role === 'coach'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              Coach
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1.5">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label htmlFor="reg-username" className="block text-sm font-medium text-foreground mb-1.5">
            Username
          </label>
          <input
            id="reg-username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="username"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
            Phone <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="+628xxx"
          />
        </div>

        <div>
          <label htmlFor="reg-password" className="block text-sm font-medium text-foreground mb-1.5">
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Minimum 6 characters"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  )
}
