'use client'

import { Share2 } from 'lucide-react'

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const TYPE_LABELS: Record<string, string> = {
  discovery: 'Discovery',
  coaching_drilling: 'Coaching & Drilling',
  open_play: 'Open Play',
}

interface ShareSessionButtonProps {
  sessionId: string
  date: string
  coachName: string
  sessionType: string
  locationName?: string | null
  maxPlayers: number
  playerCount: number
}

export function ShareSessionButton({
  sessionId,
  date,
  coachName,
  sessionType,
  locationName,
  maxPlayers,
  playerCount,
}: ShareSessionButtonProps) {
  function handleShare() {
    const sessionDate = new Date(date)
    const dateStr = `${DAYS[sessionDate.getDay()]}, ${sessionDate.getDate()} ${MONTHS[sessionDate.getMonth()]} ${sessionDate.getFullYear()}`
    const timeStr = `${String(sessionDate.getHours()).padStart(2, '0')}:${String(sessionDate.getMinutes()).padStart(2, '0')}`
    const slotsLeft = maxPlayers - playerCount

    const appUrl = window.location.origin
    const sessionUrl = `${appUrl}/session/${sessionId}`

    let message = `*Padel Session* \n\n`
    message += `${TYPE_LABELS[sessionType] ?? sessionType}\n`
    message += `${dateStr} | ${timeStr}\n`
    message += `Coach: ${coachName}\n`
    if (locationName) message += `Lokasi: ${locationName}\n`
    message += `Slot: ${playerCount}/${maxPlayers}`
    if (slotsLeft > 0) message += ` (${slotsLeft} tersisa)`
    message += `\n\nJoin di sini:\n${sessionUrl}`

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors"
    >
      <Share2 className="w-3.5 h-3.5" />
      Share
    </button>
  )
}
