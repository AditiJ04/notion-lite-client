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
}: {
  documentId: string
  pendingSelection: { from: number; to: number; text: string } | null
  onCommentAdded: () => void
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const supabase = createClient()

  const getAuthHeader = async () => {
    const { data } = await supabase.auth.getSession()
    return { Authorization: `Bearer ${data.session?.access_token}` }
  }

  // Used after adding a new comment, to refresh the list on demand
  const loadComments = async () => {
    const headers = await getAuthHeader()
    const res = await fetch(`${apiUrl}/documents/${documentId}/comments`, { headers })
    setComments(await res.json())
  }

  // Initial load, done safely inside the effect itself
  useEffect(() => {
    let ignore = false

    const load = async () => {
      const headers = await getAuthHeader()
      const res = await fetch(`${apiUrl}/documents/${documentId}/comments`, { headers })
      const data = await res.json()
      if (!ignore) setComments(data)
    }

    load()

    return () => {
      ignore = true
    }
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

  return (
    <div className="w-72 border-l p-4">
      <h2 className="font-semibold mb-3">Comments</h2>

      {pendingSelection && (
        <div className="mb-2 p-2 bg-yellow-50 text-xs rounded">
          Commenting on: `{pendingSelection.text}`
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={pendingSelection ? 'Add a comment...' : 'Select text first'}
          disabled={!pendingSelection}
          className="flex-1 border rounded px-2 py-1 text-sm"
        />
        <button
          onClick={handleAddComment}
          disabled={!pendingSelection}
          className="bg-black text-white text-sm px-3 rounded disabled:opacity-40"
        >
          Add
        </button>
      </div>

      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="text-sm border-b pb-2">
            <p>{c.content}</p>
            <p className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</p>
          </li>
        ))}
        {comments.length === 0 && <li className="text-gray-400 text-sm">No comments yet</li>}
      </ul>
    </div>
  )
}