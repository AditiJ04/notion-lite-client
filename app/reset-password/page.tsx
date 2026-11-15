'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [updated, setUpdated] = useState(false)
  const [supabase] = useState(() => createClient())

  const rules = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Contains a letter', valid: /[A-Za-z]/.test(password) },
    { label: 'Contains a number', valid: /\d/.test(password) },
  ]
  const passwordValid = rules.every((rule) => rule.valid)

  useEffect(() => {
    let active = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setHasSession(Boolean(data.session))
      setCheckingSession(false)
    })

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setHasSession(Boolean(session))
        setCheckingSession(false)
      }
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!passwordValid) {
      setError('Password does not meet the requirements below.')
      return
    }
    if (password !== confirmation) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) {
      setError(updateError.message)
      return
    }

    await supabase.auth.signOut()
    setUpdated(true)
  }

  if (checkingSession) {
    return <StatusCard title="Verifying reset link…" />
  }

  if (updated) {
    return (
      <StatusCard
        title="Password updated"
        message="Your password has been changed. You can now sign in with your new password."
        linkLabel="Continue to login"
      />
    )
  }

  if (!hasSession) {
    return (
      <StatusCard
        title="Reset link is invalid"
        message="This link has expired or has already been used. Request a new password reset email."
        linkLabel="Return to login"
      />
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#12141C' }}>
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center mb-10 text-2xl" style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#E4E6F0' }}>
          Cowrite
        </Link>
        <div className="rounded-2xl p-8" style={{ backgroundColor: '#1A1D28', border: '1px solid #2A2E3D' }}>
          <h1 className="text-2xl mb-1" style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#E4E6F0' }}>
            Choose a new password
          </h1>
          <p className="text-sm mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }}>
            Use a password you have not used for this account before.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-xs mb-1.5" style={{ color: '#8B8FA3' }}>New password</label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 pr-14 text-sm outline-none"
                  style={{ border: '1px solid #2A2E3D', backgroundColor: '#12141C', color: '#E4E6F0' }}
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium" style={{ color: '#6C8EF5' }}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <ul className="mt-2 space-y-1">
                {rules.map((rule) => (
                  <li key={rule.label} className="text-xs flex items-center gap-1.5" style={{ color: rule.valid ? '#4ECDC4' : '#8B8FA3' }}>
                    <span>{rule.valid ? '✓' : '○'}</span>{rule.label}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-xs mb-1.5" style={{ color: '#8B8FA3' }}>Confirm new password</label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={{ border: '1px solid #2A2E3D', backgroundColor: '#12141C', color: '#E4E6F0' }}
              />
            </div>

            {error && <p className="text-xs rounded-lg px-3 py-2" style={{ color: '#E8645A', backgroundColor: 'rgba(232, 100, 90, 0.1)' }}>{error}</p>}

            <button type="submit" disabled={loading} className="w-full rounded-lg py-2.5 text-sm font-medium disabled:opacity-50" style={{ backgroundColor: '#6C8EF5', color: '#12141C' }}>
              {loading ? 'Updating password…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

function StatusCard({ title, message, linkLabel }: { title: string; message?: string; linkLabel?: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#12141C' }}>
      <div className="w-full max-w-sm text-center rounded-2xl p-8" style={{ backgroundColor: '#1A1D28', border: '1px solid #2A2E3D' }}>
        <h1 className="text-xl mb-2" style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#E4E6F0' }}>{title}</h1>
        {message && <p className="text-sm mb-6" style={{ color: '#8B8FA3' }}>{message}</p>}
        {linkLabel && <Link href="/login" className="text-sm font-medium" style={{ color: '#6C8EF5' }}>{linkLabel}</Link>}
      </div>
    </main>
  )
}
