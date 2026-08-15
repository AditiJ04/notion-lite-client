'use client'
import CollaborativeEditor from '@/components/CollaborativeEditor'

export default function TestEditorPage() {
  return (
    <CollaborativeEditor
      documentId="test-doc-1"
      userName="Tester"
      userColor="#ff0000"
    />
  )
}