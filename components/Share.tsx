'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Collaborator {
  id: string
  role: string
  users: { id: string; name: string; email: string }
}

export default function Share({ documentId }: { documentId: string }) {
  const [open, setOpen] = useState(false)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'editor' | 'viewer'>('editor')
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const supabase = createClient()

  const getAuthHeader = async () => {
    const { data } = await supabase.auth.getSession()
    return { Authorization: `Bearer ${data.session?.access_token}` }
  }

  const loadCollaborators = async () => {
    const headers = await getAuthHeader()
    const res = await fetch(`${apiUrl}/documents/${documentId}/collaborators`, { headers })
    if (res.ok) setCollaborators(await res.json())
  }

  useEffect(() => {
    if (!open) return
    let ignore = false
    const load = async () => {
      const headers = await getAuthHeader()
      const res = await fetch(`${apiUrl}/documents/${documentId}/collaborators`, { headers })
      if (res.ok && !ignore) setCollaborators(await res.json())
    }
    load()
    return () => { ignore = true }
  }, [open])

  const handleInvite = async () => {
    if (!email.trim()) return
    setError('')
    setSearching(true)
    const headers = await getAuthHeader()

    const searchRes = await fetch(
      `${apiUrl}/documents/users/search?email=${encodeURIComponent(email.trim())}`,
      { headers }
    )

    if (!searchRes.ok) {
      setSearching(false)
      setError('No user found with that email')
      return
    }

    const user = await searchRes.json()

    const inviteRes = await fetch(`${apiUrl}/documents/${documentId}/collaborators`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, role }),
    })

    setSearching(false)

    if (!inviteRes.ok) {
      setError('Could not add collaborator (already invited?)')
      return
    }

    setEmail('')
    loadCollaborators()
  }

  const handleRoleChange = async (collaboratorId: string, newRole: string) => {
    const headers = await getAuthHeader()
    await fetch(`${apiUrl}/documents/${documentId}/collaborators/${collaboratorId}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    loadCollaborators()
  }

  const handleRemove = async (collaboratorId: string) => {
    const headers = await getAuthHeader()
    await fetch(`${apiUrl}/documents/${documentId}/collaborators/${collaboratorId}`, {
      method: 'DELETE',
      headers,
    })
    loadCollaborators()
  }

  const handleShareLink = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Notion-lite document',
          text: 'Join me on this document',
          url,
        })
      } catch {
        // user cancelled the share sheet — do nothing
      }
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full px-4 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
        style={{ fontFamily: 'Inter, sans-serif', backgroundColor: 'rgba(108,142,245,0.15)', color: '#6C8EF5' }}
      >
        Share
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden z-20"
            style={{ backgroundColor: '#1A1D28', border: '1px solid #2A2E3D', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
          >
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #2A2E3D' }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#E4E6F0' }} className="text-sm">
                Share this document
              </h2>
            </div>

            <div className="p-4">
              <button
                onClick={handleShareLink}
                className="w-full flex items-center justify-center gap-2 rounded-lg py-2 mb-4 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ backgroundColor: '#212533', color: '#E4E6F0', fontFamily: 'Inter, sans-serif', border: '1px solid #2A2E3D' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {copied ? 'Link copied!' : 'Share document link'}
              </button>

              <p className="text-xs mb-4 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }}>
                Anyone with this link can request access
              </p>

              <div className="flex gap-2 mb-2">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                  placeholder="Email address"
                  className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ fontFamily: 'Inter, sans-serif', border: '1px solid #2A2E3D', backgroundColor: '#12141C', color: '#E4E6F0' }}
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                  className="rounded-lg px-2 text-xs outline-none"
                  style={{ fontFamily: 'Inter, sans-serif', border: '1px solid #2A2E3D', backgroundColor: '#12141C', color: '#E4E6F0' }}
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <button
                onClick={handleInvite}
                disabled={searching || !email.trim()}
                className="w-full rounded-lg py-2 text-sm font-medium transition-opacity disabled:opacity-40 hover:opacity-90"
                style={{ backgroundColor: '#6C8EF5', color: '#12141C', fontFamily: 'Inter, sans-serif' }}
              >
                {searching ? 'Inviting…' : 'Invite'}
              </button>

              {error && (
                <p className="text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif', color: '#E8645A' }}>
                  {error}
                </p>
              )}

              <div className="mt-4 pt-4" style={{ borderTop: '1px solid #2A2E3D' }}>
                <p className="text-xs mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }}>
                  People with access
                </p>
                <ul className="space-y-2">
                  {collaborators.map((c) => (
                    <li key={c.id} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm truncate" style={{ fontFamily: 'Inter, sans-serif', color: '#E4E6F0' }}>
                          {c.users.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={c.role}
                          onChange={(e) => handleRoleChange(c.id, e.target.value)}
                          className="text-xs rounded px-1 py-0.5 outline-none"
                          style={{ fontFamily: 'Inter, sans-serif', border: '1px solid #2A2E3D', backgroundColor: '#12141C', color: '#8B8FA3' }}
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button
                          onClick={() => handleRemove(c.id)}
                          className="text-xs hover:opacity-70"
                          style={{ color: '#E8645A' }}
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  ))}
                  {collaborators.length === 0 && (
                    <li style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }} className="text-xs">
                      Only you have access
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}