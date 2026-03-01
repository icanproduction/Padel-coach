'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SessionDot {
  id: string
  date: string
  status: string
  sessionType: string
}

interface SessionCalendarProps {
  sessions: SessionDot[]
  currentMonth: Date
  selectedDate: string | null
  onMonthChange: (date: Date) => void
  onDateSelect: (date: string | null) => void
}

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const STATUS_DOT: Record<string, string> = {
  scheduled: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  completed: 'bg-green-500',
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function SessionCalendar({
  sessions,
  currentMonth,
  selectedDate,
  onMonthChange,
  onDateSelect,
}: SessionCalendarProps) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Group sessions by date key
  const sessionsByDate = new Map<string, SessionDot[]>()
  for (const s of sessions) {
    const d = new Date(s.date)
    const key = toDateKey(d)
    const arr = sessionsByDate.get(key) || []
    arr.push(s)
    sessionsByDate.set(key, arr)
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  // Monday-based: 0=Mon, 6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7
  const totalDays = lastDay.getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(d)
  // Fill remaining to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  const todayKey = toDateKey(new Date())

  function prevMonth() {
    onMonthChange(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    onMonthChange(new Date(year, month + 1, 1))
  }

  function handleDateClick(day: number) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onDateSelect(selectedDate === key ? null : key)
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-sm font-semibold">
          {MONTHS[month]} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-0">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="h-10" />
          }

          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const daySessions = sessionsByDate.get(key) || []
          const isToday = key === todayKey
          const isSelected = key === selectedDate

          return (
            <button
              key={key}
              onClick={() => handleDateClick(day)}
              className={`h-10 flex flex-col items-center justify-center rounded-lg transition-colors relative ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : isToday
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'hover:bg-muted'
              }`}
            >
              <span className="text-xs">{day}</span>
              {daySessions.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {daySessions.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-primary-foreground/70' : (STATUS_DOT[s.status] || 'bg-gray-400')
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[10px] text-muted-foreground">Scheduled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-[10px] text-muted-foreground">In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[10px] text-muted-foreground">Completed</span>
        </div>
      </div>
    </div>
  )
}
