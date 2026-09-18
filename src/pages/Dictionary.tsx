import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Library } from 'lucide-react'
import { searchWords } from '../lib/data/dictionary'

export default function Dictionary() {
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchWords(query), [query])
  const total = useMemo(() => searchWords('').length, [])

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <div className="flex items-center gap-3">
        <Library size={22} strokeWidth={1.75} className="text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Lug‘at</h1>
      </div>
      <p className="mt-2 text-sm text-[var(--text-dim)]">
        Lokal demo lug‘at — {total} o‘zbekcha so‘z va ularning izohlari.
      </p>

      <div className="relative mt-8">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="So‘z qidiring..."
          className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-3 pl-10 pr-4 text-[15px] text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--accent-dim)]"
        />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {results.map((entry) => (
          <Link
            key={entry.id}
            to={`/app/word?w=${encodeURIComponent(entry.latin)}`}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--accent-dim)]"
          >
            <div className="flex items-center justify-between">
              <span className="font-[var(--font-display)] text-base font-medium">
                {entry.latin}
              </span>
              <span className="rounded-full border border-[var(--border-strong)] px-2 py-0.5 text-[11px] text-[var(--text-faint)]">
                {entry.partOfSpeech}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-[var(--text-dim)]">{entry.definition}</p>
          </Link>
        ))}

        {results.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-[var(--border-strong)] py-12 text-center text-sm text-[var(--text-faint)]">
            Hech qanday so‘z topilmadi.
          </div>
        )}
      </div>
    </div>
  )
}
