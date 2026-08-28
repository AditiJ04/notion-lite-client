'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface VersionSummary {
  id: string
  created_at: string
  created_by: string | null
}

export default function VersionHistory({
  documentId,
  onRestore,
}: {
  documentId: string
  onRestore: (base64Data: string) => void
}) {
  const [versions, setVersions] = useState<VersionSummary[]>([])
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const supabase = createClient()

  const getAuthHeader = async () => {
    const { data } = await supabase.auth.getSession()
    return { Authorization: `Bearer ${data.session?.access_token}` }
  }

  const loadVersions = async () => {
    const headers = await getAuthHeader()
    const res = await fetch(`${apiUrl}/documents/${documentId}/versions`, { headers })
    if (res.ok) setVersions(await res.json())
  }

  useEffect(() => {
    let ignore = false
    const load = async () => {
      const headers = await getAuthHeader()
      const res = await fetch(`${apiUrl}/documents/${documentId}/versions`, { headers })
      if (res.ok) {
        const data = await res.json()
        if (!ignore) setVersions(data)
      }
    }
    load()
    return () => { ignore = true }
  }, [documentId])

  const handleRestore = async (versionId: string) => {
    setRestoringId(versionId)
    const headers = await getAuthHeader()
    const res = await fetch(`${apiUrl}/documents/${documentId}/versions/${versionId}`, { headers })
    const version = await res.json()
    const snapshot = version.content_snapshot as { data: string }
    onRestore(snapshot.data)
    setRestoringId(null)
  }

  const handleDelete = async (versionId: string) => {
    if (!confirm('Delete this version? This cannot be undone.')) return
    setDeletingId(versionId)
    const headers = await getAuthHeader()
    await fetch(`${apiUrl}/documents/${documentId}/versions/${versionId}`, {
      method: 'DELETE',
      headers,
    })
    setDeletingId(null)
    loadVersions()
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1A1D28', border: '1px solid #2A2E3D' }}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #2A2E3D' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#E4E6F0' }} className="text-sm">
          Version history
        </h2>
      </div>

      <ul className="p-4 space-y-1">
        {(showAll ? versions : versions.slice(0, 5)).map((v) => (
          <li
            key={v.id}
            className="flex items-center justify-between rounded-lg px-2 py-2 -mx-2 hover:bg-[#212533] transition-colors group"
          >
            <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#8B8FA3' }} className="text-xs">
              {new Date(v.created_at).toLocaleString([], {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleRestore(v.id)}
                disabled={restoringId === v.id}
                className="text-xs font-medium transition-opacity hover:opacity-70 disabled:opacity-40"
                style={{ fontFamily: 'Inter, sans-serif', color: '#4ECDC4' }}
              >
                {restoringId === v.id ? 'Restoring…' : 'Restore'}
              </button>
              <button
                onClick={() => handleDelete(v.id)}
                disabled={deletingId === v.id}
                className="text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-70 disabled:opacity-40"
                style={{ fontFamily: 'Inter, sans-serif', color: '#E8645A' }}
              >
                {deletingId === v.id ? '…' : '✕'}
              </button>
            </div>
          </li>
        ))}

        {versions.length === 0 && (
          <li style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }} className="text-xs px-2">
            No versions yet
          </li>
        )}

        {versions.length > 5 && (
          <li className="pt-2">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs font-medium"
              style={{ fontFamily: 'Inter, sans-serif', color: '#6C8EF5' }}
            >
              {showAll ? 'Show less' : `Show ${versions.length - 5} more`}
            </button>
          </li>
        )}
      </ul>
    </div>
  )
}