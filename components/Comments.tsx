'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const supabase = createClient()

  const getAuthHeader = async () => {
    const { data } = await supabase.auth.getSession()
    return { Authorization: `Bearer ${data.session?.access_token}` }
  }

  const loadComments = async () => {
    const headers = await getAuthHeader()
    const res = await fetch(`${apiUrl}/documents/${documentId}/comments`, { headers })
    setComments(await res.json())
  }

  useEffect(() => {
    let ignore = false
    const load = async () => {
      const headers = await getAuthHeader()
      const res = await fetch(`${apiUrl}/documents/${documentId}/comments`, { headers })
      const data = await res.json()
      if (!ignore) setComments(data)
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
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E2DA' }}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #E5E2DA' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#1B1B1F' }} className="text-sm">
          Comments
        </h2>
      </div>

      <div className="p-4">
        {pendingSelection ? (
          <div
            className="mb-3 px-3 py-2 rounded-lg text-xs italic"
            style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#FDF3DA', color: '#8A6D1F', borderLeft: '3px solid #F5B942' }}
          >
            &ldquo;{pendingSelection.text}&rdquo;
          </div>
        ) : (
          <p className="mb-3 text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#8A8580' }}>
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
            style={{ fontFamily: 'Inter, sans-serif', border: '1px solid #E5E2DA' }}
          />
          <button
            onClick={handleAddComment}
            disabled={!pendingSelection}
            className="rounded-lg px-4 text-sm font-medium text-white transition-opacity disabled:opacity-30 hover:opacity-90"
            style={{ backgroundColor: '#F5B942', fontFamily: 'Inter, sans-serif' }}
          >
            Add
          </button>
        </div>

        <ul className="space-y-3">
          {comments.map((c) => (
            <li
              key={c.id}
              onClick={() => c.selection && onCommentClick(c.selection.from, c.selection.to)}
              className="pl-3 py-1 transition-opacity hover:opacity-70"
              style={{
                borderLeft: '2px solid #F5B942',
                cursor: c.selection ? 'pointer' : 'default',
              }}
            >
              <p style={{ fontFamily: 'Inter, sans-serif', color: '#1B1B1F' }} className="text-sm">
                {c.content}
              </p>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', color: '#8A8580' }} className="text-[10px] mt-1">
                {timeAgo(c.created_at)}
              </p>
            </li>
          ))}
          {comments.length === 0 && (
            <li style={{ fontFamily: 'Inter, sans-serif', color: '#8A8580' }} className="text-xs">
              No comments yet
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}