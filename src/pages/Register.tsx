import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, AlertTriangle, CheckCircle2, Eye } from 'lucide-react'
import { useAuth } from '../lib/auth/AuthContext'

export default function Register() {
  const { user, loading, signUp, configured } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!loading && user && !success) navigate('/app', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Parol kamida 6 belgidan iborat bo‘lishi kerak.')
      return
    }

    setSubmitting(true)
    const { error } = await signUp(email.trim(), password)
    setSubmitting(false)

    if (error) {
      setError(error)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-6 py-14 text-center">
        <div className="flex flex-col items-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--accent-dim)] bg-[var(--surface)] text-[var(--accent)]">
            <CheckCircle2 size={22} />
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            Ro‘yxatdan o‘tish muvaffaqiyatli.
          </h1>
          <p className="mt-2 max-w-sm text-sm text-[var(--text-dim)]">
            Endi tizimga kirishingiz mumkin. Agar loyihada email tasdiqlash yoqilgan bo‘lsa, avval
            pochtangizni tekshiring.
          </p>
          <Link
            to="/login"
            className="mt-6 rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-medium text-[#04121a] transition-opacity hover:opacity-90"
          >
            Tizimga kirish
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-6 py-14">
      <div className="flex items-center gap-3">
        <Eye size={22} strokeWidth={1.75} className="text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ro‘yxatdan o‘tish</h1>
      </div>
      <p className="mt-2 text-sm text-[var(--text-dim)]">
        Bepul hisob yarating — natijalaringiz va tarixingiz saqlanadi.
      </p>

      {!configured && (
        <div className="mt-6 flex items-start gap-2 rounded-md border border-amber-900/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-300">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>Supabase sozlanmagan. .env.example asosida .env faylini to‘ldiring.</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="register-email" className="text-sm font-medium text-[var(--text-dim)]">
            Email
          </label>
          <div className="relative mt-2">
            <Mail
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
            />
            <input
              id="register-email"
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
          <label htmlFor="register-password" className="text-sm font-medium text-[var(--text-dim)]">
            Parol
          </label>
          <div className="relative mt-2">
            <Lock
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
            />
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kamida 6 belgi"
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
          <UserPlus size={16} />
          {submitting ? 'Yaratilmoqda…' : 'Ro‘yxatdan o‘tish'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-dim)]">
        Hisobingiz bormi?{' '}
        <Link to="/login" className="text-[var(--accent)] underline underline-offset-4">
          Tizimga kirish
        </Link>
      </p>
    </div>
  )
}
