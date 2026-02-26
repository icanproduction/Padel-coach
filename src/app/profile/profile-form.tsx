'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile, updateUsername } from '@/app/actions/profile-actions'
import { logout } from '@/app/actions/auth-actions'
import { GradeBadge } from '@/components/features/grade-badge'
import { ArchetypeBadge } from '@/components/features/archetype-badge'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Check,
  Loader2,
  LogOut,
  AtSign,
  Phone,
  Calendar,
  User,
  Shield,
} from 'lucide-react'
import type { Profile, PlayerProfile } from '@/types/database'

interface ProfileFormProps {
  profile: Profile
  playerProfile: PlayerProfile | null
}

export function ProfileForm({ profile, playerProfile }: ProfileFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState(profile.full_name)
  const [username, setUsername] = useState(profile.username || '')
  const [phone, setPhone] = useState(profile.phone || '')
  const [dateOfBirth, setDateOfBirth] = useState(profile.date_of_birth || '')

  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const hasProfileChanges =
    fullName !== profile.full_name ||
    (phone || '') !== (profile.phone || '') ||
    (dateOfBirth || '') !== (profile.date_of_birth || '')

  const hasUsernameChange = username !== (profile.username || '')

  const hasChanges = hasProfileChanges || hasUsernameChange

  function handleSave() {
    setError(null)
    setSaved(false)

    if (!fullName.trim()) {
      setError('Name is required')
      return
    }

    if (!username.trim()) {
      setError('Username is required')
      return
    }

    if (username.includes('@') || username.includes(' ')) {
      setError('Username tidak boleh mengandung @ atau spasi')
      return
    }

    startTransition(async () => {
      // Update username first if changed
      if (hasUsernameChange) {
        const usernameResult = await updateUsername(username.toLowerCase().trim())
        if (usernameResult.error) {
          setError(usernameResult.error)
          return
        }
      }

      // Update other profile fields
      if (hasProfileChanges) {
        const result = await updateProfile({
          full_name: fullName.trim(),
          phone: phone || null,
          date_of_birth: dateOfBirth || null,
        })

        if (result.error) {
          setError(result.error)
          return
        }
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Avatar & Role */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">{profile.full_name}</p>
          <p className="text-sm text-muted-foreground capitalize flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            {profile.role}
          </p>
        </div>

        {/* Grade & Archetype for players */}
        {playerProfile && (
          <div className="flex items-center gap-2">
            <GradeBadge grade={playerProfile.current_grade || 'Unassessed'} size="sm" />
            <ArchetypeBadge archetype={playerProfile.current_archetype || 'Unassessed'} size="sm" />
          </div>
        )}
      </div>

      {/* Error / Success */}
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm">
          {error}
        </div>
      )}
      {saved && (
        <div className="bg-green-500/10 text-green-600 rounded-xl p-3 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          Profile updated!
        </div>
      )}

      {/* Edit Form */}
      <div className="space-y-4">
        {/* Username */}
        <div className="bg-card rounded-xl border border-border p-4">
          <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mb-2">
            <AtSign className="w-3.5 h-3.5" />
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="username"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>

        {/* Full Name */}
        <div className="bg-card rounded-xl border border-border p-4">
          <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mb-2">
            <User className="w-3.5 h-3.5" />
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Your full name"
          />
        </div>

        {/* Phone */}
        <div className="bg-card rounded-xl border border-border p-4">
          <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mb-2">
            <Phone className="w-3.5 h-3.5" />
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="+62 8xx xxxx xxxx"
          />
        </div>

        {/* Date of Birth */}
        <div className="bg-card rounded-xl border border-border p-4">
          <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5" />
            Date of Birth
          </label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Player Stats (read-only) */}
      {playerProfile && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold">Player Info</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Total Sessions</p>
              <p className="font-semibold">{playerProfile.total_sessions}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Experience</p>
              <p className="font-semibold capitalize">
                {playerProfile.experience_level?.replace(/_/g, ' ') || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Goal</p>
              <p className="font-semibold capitalize">
                {playerProfile.primary_goal
                  ? playerProfile.primary_goal.split(',').map(g => g.replace(/_/g, ' ')).join(', ')
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Frequency</p>
              <p className="font-semibold capitalize">
                {playerProfile.playing_frequency_goal?.replace(/_/g, ' ') || '-'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Member since */}
      <div className="bg-card rounded-xl border border-border p-4">
        <p className="text-xs text-muted-foreground">Member since</p>
        <p className="text-sm font-medium">
          {new Date(profile.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isPending || !hasChanges}
        className={cn(
          'w-full min-h-[48px] rounded-xl font-semibold text-sm transition-all',
          'bg-primary text-primary-foreground hover:opacity-90',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2'
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : saved ? (
          <>
            <Check className="w-4 h-4" />
            Saved!
          </>
        ) : (
          'Save Changes'
        )}
      </button>

      {/* Logout Button */}
      <form action={logout}>
        <button
          type="submit"
          className="w-full min-h-[48px] rounded-xl font-semibold text-sm border border-destructive text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </form>
    </div>
  )
}
