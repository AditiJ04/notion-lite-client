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
      if (!ignore) setDocuments(docs)
    }

    load()

    return () => {
      ignore = true
    }
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
    setCreating(false)
    router.push(`/documents/${doc.id}`)
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Your Documents</h1>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="bg-black text-white text-sm px-4 py-2 rounded disabled:opacity-50"
        >
          {creating ? 'Creating...' : '+ New Document'}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">Logged in as {userEmail}</p>

      <ul className="space-y-2">
        {documents.map((doc) => (
          <li key={doc.id}>
            <Link href={`/documents/${doc.id}`} className="text-blue-600 hover:underline">
              {doc.title}
            </Link>
          </li>
        ))}
      </ul>

      {documents.length === 0 && <p className="text-gray-400">No documents yet.</p>}
    </div>
  )
}