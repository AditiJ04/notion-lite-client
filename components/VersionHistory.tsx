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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const supabase = createClient()

  const getAuthHeader = async () => {
    const { data } = await supabase.auth.getSession()
    return { Authorization: `Bearer ${data.session?.access_token}` }
  }

  useEffect(() => {
    getAuthHeader().then((headers) => {
      fetch(`${apiUrl}/documents/${documentId}/versions`, { headers })
        .then((res) => res.json())
        .then(setVersions)
    })
  }, [documentId])

  const handleRestore = async (versionId: string) => {
    const headers = await getAuthHeader()
    const res = await fetch(`${apiUrl}/documents/${documentId}/versions/${versionId}`, { headers })
    const version = await res.json()
    console.log('Fetched version for restore:', version)
    const snapshot = version.content_snapshot as { data: string }
    onRestore(snapshot.data)
  }

  return (
    <div className="w-64 border-l p-4">
      <h2 className="font-semibold mb-3">Version History</h2>
      <ul className="space-y-2">
        {versions.map((v) => (
          <li key={v.id} className="text-sm flex justify-between items-center">
            <span>{new Date(v.created_at).toLocaleString()}</span>
            <button
              onClick={() => handleRestore(v.id)}
              className="text-blue-600 hover:underline text-xs"
            >
              Restore
            </button>
          </li>
        ))}
        {versions.length === 0 && <li className="text-gray-400 text-sm">No versions yet</li>}
      </ul>
    </div>
  )
}