'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RequestAccessScreen({ documentId }: { documentId: string }) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'sending'>('idle')
  const supabase = createClient()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const getAuthHeader = async () => {
    const { data } = await supabase.auth.getSession()
    return { Authorization: `Bearer ${data.session?.access_token}` }
  }

  useEffect(() => {
    let ignore = false
    const check = async () => {
      const headers = await getAuthHeader()
      const res = await fetch(`${apiUrl}/documents/${documentId}/my-request`, { headers })
      const existing = await res.json()
      if (!ignore && existing?.status === 'pending') setStatus('pending')
    }
    check()
    return () => { ignore = true }
  }, [documentId])

  const handleRequest = async () => {
    setStatus('sending')
    const headers = await getAuthHeader()
    await fetch(`${apiUrl}/documents/${documentId}/request-access`, {
      method: 'POST',
      headers,
    })
    setStatus('pending')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#F6F4EF' }}>
      <div className="text-center rounded-2xl p-10 max-w-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E2DA' }}>
        {status === 'pending' ? (
          <>
            <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#1B1B1F' }} className="text-xl mb-2">
              Request sent
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#8A8580' }} className="text-sm mb-6">
              The owner has been notified. You&apos;ll get access once they approve your request.
            </p>
          </>
        ) : (
          <>
            <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#1B1B1F' }} className="text-xl mb-2">
              You don&apos;t have access to this document
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#8A8580' }} className="text-sm mb-6">
              Request access and the owner will be able to approve you.
            </p>
            <button
              onClick={handleRequest}
              disabled={status === 'sending'}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: '#5B4EF2', fontFamily: 'Inter, sans-serif' }}
            >
              {status === 'sending' ? 'Sending…' : 'Request access'}
            </button>
          </>
        )}
        <div className="mt-6">
          <Link href="/documents" className="text-xs" style={{ color: '#8A8580', fontFamily: 'Inter, sans-serif' }}>
            ← Back to documents
          </Link>
        </div>
      </div>
    </main>
  )
}