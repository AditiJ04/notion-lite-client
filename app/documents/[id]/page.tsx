'use client'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef, useState } from 'react'
import CollaborativeEditor, { CollaborativeEditorHandle } from '@/components/CollaborativeEditor'
import VersionHistory from '@/components/VersionHistory'
import Comments from '@/components/Comments'

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<{ name: string; color: string } | null>(null)
  const [pendingSelection, setPendingSelection] = useState<
    { from: number; to: number; text: string } | null
  >(null)
  const editorRef = useRef<CollaborativeEditorHandle>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ name: data.user.email ?? 'Anonymous', color: '#3b82f6' })
      }
    })
  }, [])

  if (!user) return <p className="p-8">Loading...</p>

  const handleRestore = (base64Data: string) => {
    editorRef.current?.restoreVersion(base64Data)
  }

  const handleCheckSelection = () => {
    const selection = editorRef.current?.getSelection() ?? null
    setPendingSelection(selection)
  }

  return (
    <div className="flex">
      <div className="flex-1">
        <div className="p-2 border-b">
          <button
            onClick={handleCheckSelection}
            className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
          >
            💬 Comment on selection
          </button>
        </div>
        <CollaborativeEditor
          ref={editorRef}
          documentId={id}
          userName={user.name}
          userColor={user.color}
        />
      </div>
      <div className="flex flex-col">
        <Comments
          documentId={id}
          pendingSelection={pendingSelection}
          onCommentAdded={() => setPendingSelection(null)}
        />
        <VersionHistory documentId={id} onRestore={handleRestore} />
      </div>
    </div>
  )
}