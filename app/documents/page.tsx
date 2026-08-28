'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Document {
  id: string
  title: string
  updated_at: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [userEmail, setUserEmail] = useState('')
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const getAuthHeader = async () => {
    const { data } = await supabase.auth.getSession()
    return { Authorization: `Bearer ${data.session?.access_token}` }
  }

  const loadDocuments = async () => {
    const headers = await getAuthHeader()
    const res = await fetch(`${apiUrl}/documents`, { headers })
    setDocuments(await res.json())
  }

  useEffect(() => {
    let ignore = false
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user && !ignore) setUserEmail(data.user.email ?? '')

      const headers = await getAuthHeader()
      const res = await fetch(`${apiUrl}/documents`, { headers })
      const docs = await res.json()
      if (!ignore) {
        setDocuments(docs)
        setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  const handleCreate = async () => {
    setCreating(true)
    const headers = await getAuthHeader()
    const res = await fetch(`${apiUrl}/documents`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Untitled' }),
    })
    const doc = await res.json()
    router.push(`/documents/${doc.id}`)
  }

  const handleDelete = async (e: React.MouseEvent, docId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this document? This cannot be undone.')) return
    setDeletingId(docId)
    const headers = await getAuthHeader()
    await fetch(`${apiUrl}/documents/${docId}`, { method: 'DELETE', headers })
    setDeletingId(null)
    loadDocuments()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const sameDay = d.toDateString() === now.toDateString()
    return sameDay
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#12141C' }}>
      <nav className="flex items-center justify-between px-8 py-6 max-w-4xl mx-auto">
        <Link href="/" style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#E4E6F0' }} className="text-xl">
          Notion‑lite
        </Link>
        <div className="flex items-center gap-4">
          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#8B8FA3' }} className="text-xs">
            {userEmail}
          </span>
          <button
            onClick={handleSignOut}
            className="text-xs font-medium transition-opacity hover:opacity-70"
            style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }}
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#E4E6F0' }} className="text-3xl">
            Your documents
          </h1>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="rounded-full px-5 py-2.5 text-sm font-medium transition-opacity disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: '#6C8EF5', color: '#12141C', fontFamily: 'Inter, sans-serif' }}
          >
            {creating ? 'Creating…' : '+ New document'}
          </button>
        </div>

        {loading ? (
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }} className="text-sm">
            Loading…
          </p>
        ) : documents.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: '#1A1D28', border: '1px dashed #2A2E3D' }}>
            <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#E4E6F0' }} className="text-lg mb-1">
              Nothing here yet
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }} className="text-sm">
              Create your first document to start writing.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id}>
                <Link
                  href={`/documents/${doc.id}`}
                  className="flex items-center justify-between rounded-xl px-5 py-4 transition-colors hover:bg-[#1A1D28] group"
                  style={{ border: '1px solid transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2A2E3D')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                >
                  <span style={{ fontFamily: 'Inter, sans-serif', color: '#E4E6F0' }} className="text-sm font-medium">
                    {doc.title || 'Untitled'}
                  </span>

                  <div className="flex items-center gap-4">
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#8B8FA3' }} className="text-xs">
                      {formatDate(doc.updated_at)}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, doc.id)}
                      disabled={deletingId === doc.id}
                      title="Delete document"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-[rgba(232,100,90,0.15)] disabled:opacity-50"
                      style={{ color: '#E8645A' }}
                    >
                      {deletingId === doc.id ? (
                        <span style={{ fontFamily: 'Inter, sans-serif' }} className="text-xs">…</span>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}