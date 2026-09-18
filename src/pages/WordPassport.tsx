import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { IdCard, Search, BookX } from 'lucide-react'
import { findWord, getCyrillic } from '../lib/data/dictionary'
import { recordWordSearch } from '../lib/stats/localStats'
import { useAuth } from '../lib/auth/AuthContext'
import { saveWordSearch } from '../lib/api/history'

export default function WordPassport() {
  const [params, setParams] = useSearchParams()
  const { user } = useAuth()
  const initial = params.get('w') ?? ''
  const [query, setQuery] = useState(initial)
  const [searched, setSearched] = useState(initial)

  const entry = useMemo(() => (searched ? findWord(searched) : undefined), [searched])
  const cyrillic = entry ? getCyrillic(entry) : ''

  useEffect(() => {
    const w = params.get('w')
    if (w && w !== searched) {
      setQuery(w)
      setSearched(w)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const runSearch = (word: string) => {
    const trimmed = word.trim()
    if (!trimmed) return
    setSearched(trimmed)
    setParams({ w: trimmed })
    recordWordSearch()
    if (user) {
      saveWordSearch(user.id, trimmed).catch(() => {
        // Silent fail — word history is a nice-to-have, never block search.
      })
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="flex items-center gap-3">
        <IdCard size={22} strokeWidth={1.75} className="text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">So‘z pasporti</h1>
      </div>
      <p className="mt-2 text-sm text-[var(--text-dim)]">
        Biror o‘zbekcha so‘zni kiriting — uning to‘liq raqamli pasportini ko‘ring.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          runSearch(query)
        }}
        className="mt-8 flex gap-3"
      >
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="masalan: mehmondo‘stlik"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-3 pl-10 pr-4 text-[15px] text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--accent-dim)]"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-medium text-[#04121a] transition-opacity hover:opacity-90"
        >
          Qidirish
        </button>
      </form>

      {searched && !entry && (
        <div className="mt-10 flex flex-col items-center rounded-lg border border-dashed border-[var(--border-strong)] py-14 text-center">
          <BookX size={26} strokeWidth={1.5} className="text-[var(--text-faint)]" />
          <p className="mt-3 text-sm text-[var(--text)]">Bu so‘z bazada topilmadi.</p>
          <p className="mt-1 max-w-sm text-sm text-[var(--text-faint)]">
            AI orqali izohlash keyingi bosqichda mavjud bo‘ladi.
          </p>
          <Link
            to="/app/dictionary"
            className="mt-4 text-sm text-[var(--accent)] underline underline-offset-4"
          >
            Lug‘atni ko‘rish
          </Link>
        </div>
      )}

      {entry && (
        <div className="mt-10 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] bg-[var(--surface-2)] px-7 py-7">
            <span className="text-xs uppercase tracking-wide text-[var(--text-faint)]">
              So‘z pasporti
            </span>
            <h2 className="mt-2 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--accent)] sm:text-4xl">
              {entry.latin.toLocaleUpperCase('en')}
            </h2>
          </div>

          <div className="divide-y divide-[var(--border)]">
            <Row label="Ma'nosi" value={entry.definition} />
            <Row label="So‘z turkumi" value={entry.partOfSpeech} />
            <div className="grid sm:grid-cols-2 sm:divide-x sm:divide-[var(--border)]">
              <Row label="Lotin" value={entry.latin} mono />
              <Row label="Kiril" value={cyrillic} mono />
            </div>
            {entry.english && <Row label="Inglizcha" value={entry.english} />}
            {entry.root && <Row label="Ildiz" value={entry.root} mono />}
            {entry.structure && <Row label="Tuzilishi" value={entry.structure} mono />}
            {entry.relatedWords.length > 0 && (
              <div className="px-7 py-5">
                <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-faint)]">
                  Bog‘liq so‘zlar
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {entry.relatedWords.map((w) => (
                    <button
                      key={w}
                      onClick={() => runSearch(w)}
                      className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-sm text-[var(--text-dim)] transition-colors hover:border-[var(--accent-dim)] hover:text-[var(--text)]"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="px-7 py-5">
              <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-faint)]">
                Misol
              </div>
              <p className="mt-2 text-[15px] italic leading-relaxed text-[var(--text)]">
                “{entry.example}”
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="px-7 py-5">
      <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-faint)]">
        {label}
      </div>
      <p
        className={`mt-2 text-[15px] leading-relaxed text-[var(--text)] ${mono ? 'font-[var(--font-mono)]' : ''}`}
      >
        {value}
      </p>
    </div>
  )
}
