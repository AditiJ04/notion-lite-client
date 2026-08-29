'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmSent, setConfirmSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const passwordRules = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Contains a letter', valid: /[A-Za-z]/.test(password) },
    { label: 'Contains a number', valid: /\d/.test(password) },
  ]
  const passwordValid = passwordRules.every((r) => r.valid)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup' && !passwordValid) {
      setError('Password does not meet the requirements below.')
      return
    }

    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) setError(error.message)
      else router.push('/documents')
      return
    }

    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    if (data.session) {
      router.push('/documents')
    } else {
      setConfirmSent(true)
    }
  }

  if (confirmSent) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#12141C' }}>
        <div className="w-full max-w-sm text-center rounded-2xl p-8" style={{ backgroundColor: '#1A1D28', border: '1px solid #2A2E3D' }}>
          <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#E4E6F0' }} className="text-xl mb-2">
            Check your email
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }} className="text-sm mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back and log in.
          </p>
          <button
            onClick={() => { setConfirmSent(false); setMode('login') }}
            className="text-sm font-medium"
            style={{ color: '#6C8EF5', fontFamily: 'Inter, sans-serif' }}
          >
            Back to login
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#12141C' }}>
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center mb-10" style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#E4E6F0' }}>
          <span className="text-2xl">Cowrite</span>
        </Link>

        <div className="rounded-2xl p-8" style={{ backgroundColor: '#1A1D28', border: '1px solid #2A2E3D' }}>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#E4E6F0' }} className="text-2xl mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }} className="text-sm mb-6">
            {mode === 'login' ? 'Log in to keep writing.' : 'Start collaborating in seconds.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs mb-1.5" style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={{ fontFamily: 'Inter, sans-serif', border: '1px solid #2A2E3D', backgroundColor: '#12141C', color: '#E4E6F0' }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs mb-1.5" style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 pr-14 text-sm outline-none"
                  style={{ fontFamily: 'Inter, sans-serif', border: '1px solid #2A2E3D', backgroundColor: '#12141C', color: '#E4E6F0' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#6C8EF5' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {mode === 'signup' && (
                <ul className="mt-2 space-y-1">
                  {passwordRules.map((rule) => (
                    <li
                      key={rule.label}
                      className="text-xs flex items-center gap-1.5"
                      style={{ fontFamily: 'Inter, sans-serif', color: rule.valid ? '#4ECDC4' : '#8B8FA3' }}
                    >
                      <span>{rule.valid ? '✓' : '○'}</span>
                      {rule.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && (
              <p
                className="text-xs rounded-lg px-3 py-2"
                style={{ fontFamily: 'Inter, sans-serif', color: '#E8645A', backgroundColor: 'rgba(232, 100, 90, 0.1)' }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-medium transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#6C8EF5', color: '#12141C', fontFamily: 'Inter, sans-serif' }}
            >
              {loading ? (mode === 'login' ? 'Logging in…' : 'Creating account…') : (mode === 'login' ? 'Log in' : 'Sign up')}
            </button>
          </form>

          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            className="w-full text-center text-xs mt-5"
            style={{ fontFamily: 'Inter, sans-serif', color: '#8B8FA3' }}
          >
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span style={{ color: '#6C8EF5', fontWeight: 500 }}>{mode === 'login' ? 'Sign up' : 'Log in'}</span>
          </button>
        </div>
      </div>
    </main>
  )
}