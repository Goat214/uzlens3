import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Eye, LogIn, LogOut, History } from 'lucide-react'
import { useAuth } from '../lib/auth/AuthContext'
import { useToast } from '../lib/toast/ToastContext'

const NAV_LINKS = [
  { to: '/', label: 'Bosh sahifa' },
  { to: '/app/analyze', label: 'Tahlil' },
  { to: '/app/convert', label: 'Konverter' },
  { to: '/app/ocr', label: 'OCR' },
  { to: '/app/word', label: 'So‘z' },
  { to: '/app/dictionary', label: 'Lug‘at' },
  { to: '/about', label: 'Loyiha haqida' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { user, loading, signOut } = useAuth()
  const { showSuccess } = useToast()

  const handleSignOut = async () => {
    await signOut()
    showSuccess('Tizimdan chiqdingiz.')
    navigate('/')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition-colors ${
      isActive ? 'text-[var(--text)]' : 'text-[var(--text-dim)] hover:text-[var(--text)]'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <Eye size={20} strokeWidth={1.75} className="text-[var(--accent)]" />
          <span className="font-[var(--font-display)] text-[17px] font-semibold tracking-tight">
            UZLENS
          </span>
        </NavLink>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {!loading && user && (
            <NavLink
              to="/app/history"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
            >
              <History size={15} />
              Tarix
            </NavLink>
          )}

          {!loading && user ? (
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-strong)] px-3.5 py-2 text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
              title={user.email ?? undefined}
            >
              <LogOut size={14} />
              Chiqish
            </button>
          ) : !loading ? (
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-strong)] px-3.5 py-2 text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
            >
              <LogIn size={14} />
              Kirish
            </button>
          ) : null}

          <button
            onClick={() => navigate('/app')}
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#04121a] transition-opacity hover:opacity-90"
          >
            Boshlash
          </button>
        </div>

        <button
          className="text-[var(--text)] lg:hidden"
          aria-label={open ? 'Menyuni yopish' : 'Menyuni ochish'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                {link.label}
              </NavLink>
            ))}

            {!loading && user && (
              <NavLink
                to="/app/history"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
              >
                <History size={15} />
                Tarix
              </NavLink>
            )}

            {!loading && user ? (
              <button
                onClick={() => {
                  setOpen(false)
                  handleSignOut()
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-strong)] px-4 py-2 text-sm text-[var(--text-dim)]"
              >
                <LogOut size={14} />
                Chiqish
              </button>
            ) : !loading ? (
              <button
                onClick={() => {
                  setOpen(false)
                  navigate('/login')
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-strong)] px-4 py-2 text-sm text-[var(--text-dim)]"
              >
                <LogIn size={14} />
                Kirish
              </button>
            ) : null}

            <button
              onClick={() => {
                setOpen(false)
                navigate('/app')
              }}
              className="mt-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#04121a]"
            >
              Boshlash
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
