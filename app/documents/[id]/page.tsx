'use client'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef, useState } from 'react'
import { Editor } from '@tiptap/react'
import EditorToolbar from '@/components/EditorToolbar'
import Link from 'next/link'
import CollaborativeEditor, { CollaborativeEditorHandle } from '@/components/CollaborativeEditor'
import VersionHistory from '@/components/VersionHistory'
import Comments from '@/components/Comments'
import Share from '@/components/Share'
import RequestAccessScreen from '@/components/RequestAccessScreen'

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; color: string } | null>(null)
  const [title, setTitle] = useState('')
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [pendingSelection, setPendingSelection] = useState<{ from: number; to: number; text: string } | null>(null)
  const editorRef = useRef<CollaborativeEditorHandle>(null)
  const supabase = createClient()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const getAuthHeader = async () => {
    const { data } = await supabase.auth.getSession()
    return { Authorization: `Bearer ${data.session?.access_token}` }
  }

  useEffect(() => {
    let ignore = false
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user && !ignore) setUser({ name: data.user.email ?? 'Anonymous', color: '#6C8EF5' })

      const headers = await getAuthHeader()
      const res = await fetch(`${apiUrl}/documents/${id}`, { headers })

      if (!ignore) {
        if (res.status === 403 || res.status === 404) {
          setAccessDenied(true)
        } else if (res.ok) {
          const doc = await res.json()
          setTitle(doc.title ?? 'Untitled')
        }
        setCheckingAccess(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [id])

  if (!user || checkingAccess) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#12141C', fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }}
      >
        Loading…
      </main>
    )
  }

  if (accessDenied) {
    return <RequestAccessScreen documentId={id} />
  }

  const handleRestore = (base64Data: string) => {
    editorRef.current?.restoreVersion(base64Data)
  }

  const handleCheckSelection = () => {
    setPendingSelection(editorRef.current?.getSelection() ?? null)
  }

  const handleCommentClick = (from: number, to: number) => {
    editorRef.current?.focusComment(from, to)
  }

  const handleTitleBlur = async () => {
    const headers = await getAuthHeader()
    await fetch(`${apiUrl}/documents/${id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
  }

  const handleDelete = async () => {
    if (!confirm('Delete this document? This cannot be undone.')) return
    const headers = await getAuthHeader()
    await fetch(`${apiUrl}/documents/${id}`, { method: 'DELETE', headers })
    router.push('/documents')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#12141C' }}>
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid #2A2E3D', backgroundColor: '#1A1D28' }}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Link
            href="/documents"
            style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }}
            className="text-sm hover:opacity-70 transition-opacity shrink-0"
          >
            ← Documents
          </Link>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="text-sm font-medium outline-none bg-transparent min-w-0 flex-1"
            style={{ fontFamily: 'Inter, sans-serif', color: '#E4E6F0' }}
          />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Share documentId={id} />
          <button
            onClick={handleCheckSelection}
            className="rounded-full px-4 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
            style={{ fontFamily: 'Inter, sans-serif', backgroundColor: 'rgba(255,180,84,0.15)', color: '#FFB454' }}
          >
            💬 Comment on selection
          </button>
          <button
            onClick={handleDelete}
            className="text-xs font-medium transition-opacity hover:opacity-70"
            style={{ fontFamily: 'Inter, sans-serif', color: '#E8645A' }}
          >
            Delete
          </button>
          <button
            onClick={handleSignOut}
            className="text-xs font-medium transition-opacity hover:opacity-70"
            style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_320px] gap-6 px-6 py-8">
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1A1D28', border: '1px solid #2A2E3D' }}>
          <EditorToolbar editor={editorInstance} />
          <CollaborativeEditor
            ref={(instance) => {
              editorRef.current = instance
              if (instance) setEditorInstance(instance.getEditor())
            }}
            documentId={id}
            userName={user.name}
            userColor={user.color}
          />
        </div>

        <div className="space-y-6">
          <Comments
            documentId={id}
            pendingSelection={pendingSelection}
            onCommentAdded={() => setPendingSelection(null)}
            onCommentClick={handleCommentClick}
          />
          <VersionHistory documentId={id} onRestore={handleRestore} />
        </div>
      </div>
    </main>
  )
}