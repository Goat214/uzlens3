import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn, Mail, Lock, AlertTriangle, Eye } from 'lucide-react'
import { useAuth } from '../lib/auth/AuthContext'
import { useToast } from '../lib/toast/ToastContext'

export default function Login() {
  const { user, loading, signIn, configured } = useAuth()
  const { showSuccess } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/app'

  useEffect(() => {
    if (!loading && user) navigate(redirectTo, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signIn(email.trim(), password)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    showSuccess('Xush kelibsiz!')
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-6 py-14">
      <div className="flex items-center gap-3">
        <Eye size={22} strokeWidth={1.75} className="text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tizimga kirish</h1>
      </div>
      <p className="mt-2 text-sm text-[var(--text-dim)]">
        Natijalaringizni saqlash va shaxsiy tarixni ko‘rish uchun tizimga kiring.
      </p>

      {!configured && (
        <div className="mt-6 flex items-start gap-2 rounded-md border border-amber-900/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-300">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>Supabase sozlanmagan. .env.example asosida .env faylini to‘ldiring.</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="login-email" className="text-sm font-medium text-[var(--text-dim)]">
            Email
          </label>
          <div className="relative mt-2">
            <Mail
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
            />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="siz@example.com"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-3 pl-10 pr-4 text-[15px] text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--accent-dim)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="text-sm font-medium text-[var(--text-dim)]">
            Parol
          </label>
          <div className="relative mt-2">
            <Lock
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
            />
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-3 pl-10 pr-4 text-[15px] text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--accent-dim)]"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-medium text-[#04121a] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogIn size={16} />
          {submitting ? 'Kirilmoqda…' : 'Kirish'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-dim)]">
        Hisobingiz yo‘qmi?{' '}
        <Link to="/register" className="text-[var(--accent)] underline underline-offset-4">
          Ro‘yxatdan o‘tish
        </Link>
      </p>
    </div>
  )
}
