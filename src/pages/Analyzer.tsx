import { useEffect, useMemo, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Eraser, ScanText, Save, LogIn } from 'lucide-react'
import { computeStatistics, getWordFrequency } from '../lib/nlp/statistics'
import { detectScript, detectLanguageLabel } from '../lib/nlp/script'
import { normalizeUzbekText } from '../lib/nlp/normalize'
import { UZBEK_EXAMPLES } from '../lib/data/examples'
import { recordAnalysis } from '../lib/stats/localStats'
import { useAuth } from '../lib/auth/AuthContext'
import { useToast } from '../lib/toast/ToastContext'
import { saveAnalysis } from '../lib/api/history'

export default function Analyzer() {
  const location = useLocation()
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [input, setInput] = useState('')
  const [analyzed, setAnalyzed] = useState('')
  const [saving, setSaving] = useState(false)

  // Text handed off from OCR ("Matnni tahlil qilish") arrives via router state.
  useEffect(() => {
    const incoming = (location.state as { text?: string } | null)?.text
    if (incoming) {
      setInput(incoming)
      setAnalyzed(incoming)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  const hasResult = analyzed.trim().length > 0

  const stats = useMemo(() => computeStatistics(analyzed), [analyzed])
  const script = useMemo(() => detectScript(analyzed), [analyzed])
  const language = useMemo(() => detectLanguageLabel(analyzed), [analyzed])
  const frequency = useMemo(() => getWordFrequency(analyzed, 8), [analyzed])

  const scriptLabel: Record<string, string> = {
    latin: 'Lotin',
    cyrillic: 'Kiril',
    mixed: 'Aralash',
    unknown: 'Aniqlanmadi',
  }

  const handleSave = async () => {
    if (!hasResult) return
    if (!user) {
      showError('Natijani saqlash uchun tizimga kiring.')
      return
    }
    setSaving(true)
    const { error } = await saveAnalysis({
      userId: user.id,
      originalText: analyzed,
      normalizedText: normalizeUzbekText(analyzed),
      language,
      script,
      wordCount: stats.words,
      sentenceCount: stats.sentences,
    })
    setSaving(false)
    if (error) {
      showError('Saqlashda xatolik yuz berdi.')
      return
    }
    showSuccess('Tahlil saqlandi.')
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex items-center gap-3">
        <ScanText size={22} strokeWidth={1.75} className="text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Matn tahlili</h1>
      </div>
      <p className="mt-2 max-w-xl text-sm text-[var(--text-dim)]">
        O‘zbekcha matningizni kiriting — barcha hisob-kitob qurilmangizda, lokal ravishda
        bajariladi.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Left: input */}
        <div className="flex flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <label htmlFor="analyzer-input" className="text-sm font-medium text-[var(--text-dim)]">
            Matn
          </label>
          <textarea
            id="analyzer-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Bu yerga o‘zbekcha matn kiriting..."
            rows={12}
            className="mt-3 flex-1 resize-none rounded-md border border-[var(--border)] bg-[var(--bg)] p-4 font-[var(--font-body)] text-[15px] leading-relaxed text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--accent-dim)]"
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {UZBEK_EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setInput(ex.text)}
                  className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs text-[var(--text-dim)] transition-colors hover:border-[var(--accent-dim)] hover:text-[var(--text)]"
                >
                  Namuna {ex.id.replace('ex', '')}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setInput('')
                  setAnalyzed('')
                }}
                className="inline-flex items-center gap-2 rounded-md border border-[var(--border-strong)] px-4 py-2 text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
              >
                <Eraser size={15} />
                Tozalash
              </button>
              <button
                onClick={() => {
                  setAnalyzed(input)
                  recordAnalysis(computeStatistics(input).words)
                }}
                disabled={!input.trim()}
                className="rounded-md bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[#04121a] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Tahlil qilish
              </button>
            </div>
          </div>
        </div>

        {/* Right: results */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--text-dim)]">Natija</h2>
            {hasResult && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-strong)] px-3 py-1.5 text-xs text-[var(--text-dim)] transition-colors hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {user ? <Save size={13} /> : <LogIn size={13} />}
                {saving ? 'Saqlanmoqda…' : 'Saqlash'}
              </button>
            )}
          </div>

          {!hasResult ? (
            <div className="mt-6 flex h-64 flex-col items-center justify-center text-center">
              <p className="text-sm text-[var(--text-faint)]">
                Natijalarni ko‘rish uchun matn kiritib, "Tahlil qilish" tugmasini bosing.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatBox label="Til" value={language} />
                <StatBox label="Yozuv" value={scriptLabel[script]} />
                <StatBox label="Belgilar" value={stats.characters} />
                <StatBox label="So‘zlar" value={stats.words} />
                <StatBox label="Gaplar" value={stats.sentences} />
                <StatBox label="Paragraflar" value={stats.paragraphs} />
              </div>

              {frequency.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--text-faint)]">
                    Eng ko‘p ishlatilgan so‘zlar
                  </h3>
                  <p className="mt-1 text-xs text-[var(--text-faint)]">
                    So‘z pasportini ko‘rish uchun bosing
                  </p>
                  <ul className="mt-3 space-y-2">
                    {frequency.map((f) => (
                      <li key={f.word} className="flex items-center gap-3">
                        <Link
                          to={`/app/word?w=${encodeURIComponent(f.word)}`}
                          className="w-24 shrink-0 truncate text-sm text-[var(--text)] underline decoration-[var(--border-strong)] underline-offset-2 transition-colors hover:text-[var(--accent)]"
                        >
                          {f.word}
                        </Link>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
                          <div
                            className="h-full rounded-full bg-[var(--accent)]"
                            style={{ width: `${(f.count / frequency[0].count) * 100}%` }}
                          />
                        </div>
                        <span className="w-6 shrink-0 text-right text-xs text-[var(--text-faint)]">
                          {f.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-4 py-3">
      <div className="text-lg font-semibold text-[var(--text)]">{value}</div>
      <div className="mt-0.5 text-xs text-[var(--text-faint)]">{label}</div>
    </div>
  )
}
