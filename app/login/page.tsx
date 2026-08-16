'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    setLoading(false)
    if (!error) {
      router.push('/documents')
    } else {
      setError(error.message)
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: '#F6F4EF' }}
    >
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="block text-center mb-10"
          style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#1B1B1F' }}
        >
          <span className="text-2xl">Notion‑lite</span>
        </Link>

        <div
          className="rounded-2xl p-8"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E2DA' }}
        >
          <h1
            style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#1B1B1F' }}
            className="text-2xl mb-1"
          >
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p
            style={{ fontFamily: 'Inter, sans-serif', color: '#8A8580' }}
            className="text-sm mb-6"
          >
            {mode === 'login'
              ? 'Log in to keep writing.'
              : 'Start collaborating in seconds.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs mb-1.5"
                style={{ fontFamily: 'Inter, sans-serif', color: '#5A5650' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  border: '1px solid #E5E2DA',
                  backgroundColor: '#FAFAF8',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#5B4EF2')}
                onBlur={(e) => (e.target.style.borderColor = '#E5E2DA')}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs mb-1.5"
                style={{ fontFamily: 'Inter, sans-serif', color: '#5A5650' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  border: '1px solid #E5E2DA',
                  backgroundColor: '#FAFAF8',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#5B4EF2')}
                onBlur={(e) => (e.target.style.borderColor = '#E5E2DA')}
              />
            </div>

            {error && (
              <p
                className="text-xs rounded-lg px-3 py-2"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#B3261E',
                  backgroundColor: '#FBEAE9',
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#5B4EF2', fontFamily: 'Inter, sans-serif' }}
            >
              {loading
                ? mode === 'login'
                  ? 'Logging in…'
                  : 'Creating account…'
                : mode === 'login'
                  ? 'Log in'
                  : 'Sign up'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError('')
            }}
            className="w-full text-center text-xs mt-5 hover:opacity-70 transition-opacity"
            style={{ fontFamily: 'Inter, sans-serif', color: '#5A5650' }}
          >
            {mode === 'login'
              ? "Don't have an account? "
              : 'Already have an account? '}
            <span style={{ color: '#5B4EF2', fontWeight: 500 }}>
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </span>
          </button>
        </div>
      </div>
    </main>
  )
}