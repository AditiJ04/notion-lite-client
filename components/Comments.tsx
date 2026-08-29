'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ConfirmDialog from './ConfirmDialog'

interface Comment {
  id: string
  content: string
  selection: { from: number; to: number } | null
  created_at: string
  user_id: string
}

export default function Comments({
  documentId,
  pendingSelection,
  onCommentAdded,
  onCommentClick,
}: {
  documentId: string
  pendingSelection: { from: number; to: number; text: string } | null
  onCommentAdded: () => void
  onCommentClick: (from: number, to: number) => void
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const supabase = createClient()

  const getAuthHeader = async () => {
    const { data } = await supabase.auth.getSession()
    return { Authorization: `Bearer ${data.session?.access_token}` }
  }

  const loadComments = async () => {
    const headers = await getAuthHeader()
    const res = await fetch(`${apiUrl}/documents/${documentId}/comments`, { headers })
    if (res.ok) setComments(await res.json())
  }

  useEffect(() => {
    let ignore = false
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user && !ignore) setCurrentUserId(data.user.id)

      const headers = await getAuthHeader()
      const res = await fetch(`${apiUrl}/documents/${documentId}/comments`, { headers })
      if (res.ok) {
        const data = await res.json()
        if (!ignore) setComments(data)
      }
    }
    load()
    return () => { ignore = true }
  }, [documentId])

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    const headers = await getAuthHeader()
    await fetch(`${apiUrl}/documents/${documentId}/comments`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newComment,
        selection: pendingSelection ? { from: pendingSelection.from, to: pendingSelection.to } : null,
      }),
    })
    setNewComment('')
    onCommentAdded()
    loadComments()
  }

  const confirmDelete = async () => {
    if (!confirmDeleteId) return
    setDeletingId(confirmDeleteId)
    const headers = await getAuthHeader()
    await fetch(`${apiUrl}/documents/${documentId}/comments/${confirmDeleteId}`, {
      method: 'DELETE',
      headers,
    })
    setDeletingId(null)
    setConfirmDeleteId(null)
    loadComments()
  }

  const timeAgo = (iso: string) => {
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1A1D28', border: '1px solid #2A2E3D' }}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #2A2E3D' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#E4E6F0' }} className="text-sm">
          Comments
        </h2>
      </div>

      <div className="p-4">
        {pendingSelection ? (
          <div
            className="mb-3 px-3 py-2 rounded-lg text-xs italic"
            style={{ fontFamily: 'Inter, sans-serif', backgroundColor: 'rgba(255,180,84,0.12)', color: '#FFB454', borderLeft: '3px solid #FFB454' }}
          >
            `{pendingSelection.text}`
          </div>
        ) : (
          <p className="mb-3 text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }}>
            Select text in the document to comment on it.
          </p>
        )}

        <div className="flex gap-2 mb-5">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            placeholder={pendingSelection ? 'Add a comment…' : 'Select text first'}
            disabled={!pendingSelection}
            className="flex-1 rounded-lg px-3 py-2 text-sm outline-none disabled:opacity-50"
            style={{ fontFamily: 'Inter, sans-serif', border: '1px solid #2A2E3D', backgroundColor: '#12141C', color: '#E4E6F0' }}
          />
          <button
            onClick={handleAddComment}
            disabled={!pendingSelection}
            className="rounded-lg px-4 text-sm font-medium transition-opacity disabled:opacity-30 hover:opacity-90"
            style={{ backgroundColor: '#FFB454', color: '#12141C', fontFamily: 'Inter, sans-serif' }}
          >
            Add
          </button>
        </div>

        <ul className="space-y-3">
          {(showAll ? comments : comments.slice(0, 5)).map((c) => (
            <li key={c.id} className="pl-3 py-1 group" style={{ borderLeft: '2px solid #FFB454' }}>
              <div className="flex items-start justify-between gap-2">
                <p
                  onClick={() => c.selection && onCommentClick(c.selection.from, c.selection.to)}
                  className="text-sm flex-1 transition-opacity hover:opacity-70"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#E4E6F0', cursor: c.selection ? 'pointer' : 'default' }}
                >
                  {c.content}
                </p>
                {c.user_id === currentUserId && (
                  <button
                    onClick={() => setConfirmDeleteId(c.id)}
                    disabled={deletingId === c.id}
                    className="text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-70 disabled:opacity-40 shrink-0"
                    style={{ color: '#E8645A' }}
                  >
                    {deletingId === c.id ? '…' : '✕'}
                  </button>
                )}
              </div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', color: '#8B8FA3' }} className="text-[10px] mt-1">
                {timeAgo(c.created_at)}
              </p>
            </li>
          ))}

          {comments.length === 0 && (
            <li style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }} className="text-xs">
              No comments yet
            </li>
          )}

          {comments.length > 5 && (
            <li>
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-xs font-medium"
                style={{ fontFamily: 'Inter, sans-serif', color: '#6C8EF5' }}
              >
                {showAll ? 'Show less' : `Show ${comments.length - 5} more`}
              </button>
            </li>
          )}
        </ul>
      </div>

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete this comment?"
        message="This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}