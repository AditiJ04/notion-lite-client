'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { io, Socket } from 'socket.io-client'
import { useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from 'react'

export interface CollaborativeEditorHandle {
  restoreVersion: (base64Data: string) => void
  getSelection: () => { from: number; to: number; text: string } | null
}

interface Props {
  documentId: string
  userName: string
  userColor: string
}

const CollaborativeEditor = forwardRef<CollaborativeEditorHandle, Props>(
  function CollaborativeEditor({ documentId, userName, userColor }, ref) {
    const ydoc = useMemo(() => new Y.Doc(), [documentId])
    const socketRef = useRef<Socket | null>(null)

    useEffect(() => {
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!)
      socketRef.current = socket
      socket.emit('join-document', documentId)

      const updateHandler = (update: Uint8Array, origin: unknown) => {
        if (origin === 'remote') return // don't echo back updates that came FROM the server
        socket.emit('yjs-update', { documentId, update })
      }
      ydoc.on('update', updateHandler)

      socket.on('yjs-update', (update: ArrayBuffer | Uint8Array) => {
        Y.applyUpdate(ydoc, new Uint8Array(update), 'remote')
      })

      return () => {
        ydoc.off('update', updateHandler)
        socket.disconnect()
        socketRef.current = null
      }
    }, [documentId])

    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({ undoRedo: false }),
        Collaboration.configure({ document: ydoc }),
      ],
    })

    useImperativeHandle(ref, () => ({
      restoreVersion: (base64Data: string) => {
        const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

        const oldDoc = new Y.Doc()
        Y.applyUpdate(oldDoc, bytes)

        const oldFragment = oldDoc.getXmlFragment('default')
        const currentFragment = ydoc.getXmlFragment('default')

        const clonedNodes = oldFragment.toArray().map((node) => node.clone())

        ydoc.transact(() => {
          currentFragment.delete(0, currentFragment.length)
          currentFragment.insert(0, clonedNodes as (Y.XmlElement | Y.XmlText)[])
        })
      },

      getSelection: () => {
        if (!editor) return null
        const { from, to } = editor.state.selection
        if (from === to) return null // nothing selected, just a cursor
        const text = editor.state.doc.textBetween(from, to, ' ')
        return { from, to, text }
      },
    }))

    return <EditorContent editor={editor} className="prose max-w-none p-4" />
  }
)

export default CollaborativeEditor