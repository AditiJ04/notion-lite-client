'use client'

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ backgroundColor: '#1A1D28', border: '1px solid #2A2E3D' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#E4E6F0' }} className="text-lg mb-2">
          {title}
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }} className="text-sm mb-6">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
            style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3', border: '1px solid #2A2E3D' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
            style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF', backgroundColor: '#E8645A' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}