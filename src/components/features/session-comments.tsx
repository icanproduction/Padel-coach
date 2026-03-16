'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { addSessionComment, deleteSessionComment } from '@/app/actions/comment-actions'
import { MessageCircle, Send, Loader2, Trash2 } from 'lucide-react'

interface Comment {
  id: string
  session_id: string
  author_id: string
  message: string
  created_at: string
  author: {
    id: string
    full_name: string
    avatar_url: string | null
    role: string
  }
}

interface SessionCommentsProps {
  sessionId: string
  currentUserId: string
  currentUserRole: string
  comments: Comment[]
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Baru saja'
  if (diffMin < 60) return `${diffMin}m lalu`
  if (diffHr < 24) return `${diffHr}j lalu`
  if (diffDay < 7) return `${diffDay}h lalu`
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

const ROLE_BADGE: Record<string, { label: string; style: string }> = {
  coach: { label: 'Coach', style: 'bg-blue-100 text-blue-700' },
  admin: { label: 'Admin', style: 'bg-purple-100 text-purple-700' },
}

export function SessionComments({
  sessionId,
  currentUserId,
  currentUserRole,
  comments,
}: SessionCommentsProps) {
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments.length])

  function handleSend() {
    if (!message.trim() || isPending) return
    const msg = message
    setMessage('')
    startTransition(async () => {
      await addSessionComment(sessionId, msg)
    })
  }

  function handleDelete(commentId: string) {
    setDeletingId(commentId)
    startTransition(async () => {
      await deleteSessionComment(commentId)
      setDeletingId(null)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
        <MessageCircle className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Discussion Box ({comments.length})
        </h2>
      </div>

      {/* Messages */}
      <div className="px-4 py-3 space-y-3 max-h-80 overflow-y-auto">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Belum ada diskusi. Mulai percakapan!
          </p>
        )}

        {comments.map((comment) => {
          const isOwn = comment.author_id === currentUserId
          const roleBadge = ROLE_BADGE[comment.author.role]

          return (
            <div
              key={comment.id}
              className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold overflow-hidden ${
                comment.author.role === 'coach' ? 'bg-blue-100 text-blue-700' :
                comment.author.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                'bg-primary/10 text-primary'
              }`}>
                {comment.author.avatar_url ? (
                  <img
                    src={comment.author.avatar_url}
                    alt={comment.author.full_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  getInitials(comment.author.full_name)
                )}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-3.5 py-2 ${
                  isOwn
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted rounded-tl-sm'
                }`}>
                  {/* Author name + role badge */}
                  {!isOwn && (
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-semibold">{comment.author.full_name}</span>
                      {roleBadge && (
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${roleBadge.style}`}>
                          {roleBadge.label}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{comment.message}</p>
                </div>
                <div className={`flex items-center gap-1.5 mt-0.5 px-1 ${isOwn ? 'justify-end' : ''}`}>
                  <span className={`text-[10px] ${isOwn ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    {formatTime(comment.created_at)}
                  </span>
                  {isOwn && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="text-muted-foreground/50 hover:text-destructive transition-colors"
                    >
                      {deletingId === comment.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-border">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tulis pesan..."
          rows={1}
          className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none min-h-[40px] max-h-[100px]"
        />
        <button
          onClick={handleSend}
          disabled={isPending || !message.trim()}
          className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}
