'use client'
import { Editor } from '@tiptap/react'

const TEXT_COLORS = ['#E4E6F0', '#E8645A', '#4ECDC4', '#8B7CF6', '#FFB454']
const HIGHLIGHT_COLORS = ['#FFB454', '#4ECDC4', '#6C8EF5', '#B98CF0']

export default function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  return (
    <div
      className="flex items-center gap-4 px-4 py-2"
      style={{ borderBottom: '1px solid #2A2E3D', backgroundColor: '#212533' }}
    >
      <div className="flex items-center gap-1">
        <span style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }} className="text-xs mr-1">
          Text
        </span>
        {TEXT_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => editor.chain().focus().setColor(color).run()}
            className="w-5 h-5 rounded-full transition-transform hover:scale-110"
            style={{
              backgroundColor: color,
              border: editor.isActive('textStyle', { color }) ? '2px solid #E4E6F0' : '1px solid #2A2E3D',
            }}
            title={color}
          />
        ))}
        <button
          onClick={() => editor.chain().focus().unsetColor().run()}
          className="text-xs px-2 py-1 rounded"
          style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3', border: '1px solid #2A2E3D' }}
        >
          Reset
        </button>
      </div>

      <div className="w-px h-5" style={{ backgroundColor: '#2A2E3D' }} />

      <div className="flex items-center gap-1">
        <span style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }} className="text-xs mr-1">
          Highlight
        </span>
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
            className="w-5 h-5 rounded-full transition-transform hover:scale-110"
            style={{
              backgroundColor: color,
              border: editor.isActive('highlight', { color }) ? '2px solid #E4E6F0' : '1px solid #2A2E3D',
            }}
            title={color}
          />
        ))}
        <button
          onClick={() => editor.chain().focus().unsetHighlight().run()}
          className="text-xs px-2 py-1 rounded"
          style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3', border: '1px solid #2A2E3D' }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}