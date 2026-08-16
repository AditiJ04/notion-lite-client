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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const supabase = createClient()

  const getAuthHeader = async () => {
    const { data } = await supabase.auth.getSession()
    return { Authorization: `Bearer ${data.session?.access_token}` }
  }

  useEffect(() => {
    let ignore = false
    const load = async () => {
      const headers = await getAuthHeader()
      const res = await fetch(`${apiUrl}/documents/${documentId}/versions`, { headers })
      const data = await res.json()
      if (!ignore) setVersions(data)
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

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E2DA' }}
    >
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #E5E2DA' }}>
        <h2
          style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#1B1B1F' }}
          className="text-sm"
        >
          Version history
        </h2>
      </div>

      <ul className="p-4 space-y-1">
        {versions.map((v) => (
          <li
            key={v.id}
            className="flex items-center justify-between rounded-lg px-2 py-2 -mx-2 hover:bg-[#FAFAF8] transition-colors"
          >
            <span
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#5A5650' }}
              className="text-xs"
            >
              {new Date(v.created_at).toLocaleString([], {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </span>
            <button
              onClick={() => handleRestore(v.id)}
              disabled={restoringId === v.id}
              className="text-xs font-medium transition-opacity hover:opacity-70 disabled:opacity-40"
              style={{ fontFamily: 'Inter, sans-serif', color: '#0EA5A0' }}
            >
              {restoringId === v.id ? 'Restoring…' : 'Restore'}
            </button>
          </li>
        ))}
        {versions.length === 0 && (
          <li style={{ fontFamily: 'Inter, sans-serif', color: '#8A8580' }} className="text-xs px-2">
            No versions yet
          </li>
        )}
      </ul>
    </div>
  )
}