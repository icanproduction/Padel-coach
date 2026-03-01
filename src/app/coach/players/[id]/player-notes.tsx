'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send, Trash2 } from 'lucide-react'
import { addPlayerNote, deletePlayerNote } from '@/app/actions/note-actions'

interface NoteWithCoach {
  id: string
  note: string
  coach_id: string
  created_at: string
  coach: { full_name: string }
}

interface PlayerNotesProps {
  playerId: string
  currentCoachId: string
  notes: NoteWithCoach[]
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function PlayerNotes({ playerId, currentCoachId, notes }: PlayerNotesProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [noteText, setNoteText] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleAdd() {
    if (!noteText.trim() || isPending) return
    startTransition(async () => {
      await addPlayerNote(playerId, noteText)
      setNoteText('')
      router.refresh()
    })
  }

  function handleDelete(noteId: string) {
    setDeletingId(noteId)
    startTransition(async () => {
      await deletePlayerNote(noteId)
      setDeletingId(null)
      router.refresh()
    })
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h2 className="text-base font-semibold mb-3">Coach Notes</h2>

      {/* Add note input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Tulis catatan..."
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          onClick={handleAdd}
          disabled={isPending || !noteText.trim()}
          className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5 text-sm font-medium"
        >
          {isPending && !deletingId ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="text-xs text-muted-foreground">Belum ada catatan.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-muted/50 rounded-lg px-3 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed">{note.note}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    {note.coach?.full_name} &middot; {formatDate(note.created_at)}
                  </p>
                </div>
                {note.coach_id === currentCoachId && (
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={isPending}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                  >
                    {deletingId === note.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
