'use client'
import { Suspense, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, LogIn, Loader2, ShieldCheck } from 'lucide-react'
import { login } from '@/lib/admin-client'
import { useToast } from '@/components/admin/Toast'

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--admin-bg)' }} />}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { toast } = useToast()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login(username.trim(), password)
      toast('Welcome back', 'success')
      const from = params.get('from')
      router.replace(from && from.startsWith('/admin') ? from : '/admin')
    } catch (err: any) {
      const msg = err.message === 'invalid_credentials'
        ? 'Invalid username or password'
        : `Login failed: ${err.message}`
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: 'var(--admin-bg)',
    }}>
      <form
        onSubmit={handleSubmit}
        className="admin-card"
        style={{ width: '100%', maxWidth: 380, padding: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'var(--admin-accent-soft)',
            border: '1px solid var(--admin-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--admin-accent)',
          }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>Admin Studio</div>
            <div style={{ fontSize: 12, color: 'var(--admin-muted)' }}>Sign in to continue</div>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="admin-label">Username</label>
          <input
            className="admin-input"
            autoComplete="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="admin-label">Password</label>
          <input
            type="password"
            className="admin-input"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        {error && (
          <div style={{
            marginBottom: 14, padding: '10px 12px', borderRadius: 8,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: 'var(--admin-danger)', fontSize: 13,
          }}>
            <Lock size={12} style={{ display: 'inline', marginRight: 6 }} />
            {error}
          </div>
        )}

        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          style={{ width: '100%', height: 42 }}
          disabled={submitting}
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <div style={{ marginTop: 18, fontSize: 11, color: 'var(--admin-subtle)', textAlign: 'center' }}>
          Single-admin private panel. All requests logged.
        </div>
      </form>
    </div>
  )
}
