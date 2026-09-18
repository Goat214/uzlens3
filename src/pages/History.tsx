import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  History as HistoryIcon,
  ScanText,
  ScanEye,
  Search,
  Trash2,
  ExternalLink,
  Inbox,
  AlertTriangle,
  LogIn,
  Loader2,
} from 'lucide-react'
import { useAuth } from '../lib/auth/AuthContext'
import { useToast } from '../lib/toast/ToastContext'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  fetchAnalyses,
  fetchOcrDocuments,
  fetchWordSearchHistory,
  deleteAnalysis,
  deleteOcrDocument,
  deleteWordSearch,
} from '../lib/api/history'
import type { AnalysisRow, OcrDocumentRow, WordSearchHistoryRow } from '../lib/supabase-types'

type Kind = 'analysis' | 'ocr' | 'word'
type Tab = 'all' | Kind

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'Barchasi' },
  { key: 'analysis', label: 'Tahlil' },
  { key: 'ocr', label: 'OCR' },
  { key: 'word', label: 'So‘z qidiruvi' },
]

interface Item {
  id: string
  kind: Kind
  title: string
  preview: string
  createdAt: string
}

function truncate(text: string, max = 140): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > max ? `${clean.slice(0, max)}…` : clean
}

function toItems(analyses: AnalysisRow[], ocr: OcrDocumentRow[], words: WordSearchHistoryRow[]): Item[] {
  const a: Item[] = analyses.map((row) => ({
    id: row.id,
    kind: 'analysis' as const,
    title: row.language ? `${row.language} tahlili` : 'Matn tahlili',
    preview: truncate(row.original_text || ''),
    createdAt: row.created_at,
  }))
  const o: Item[] = ocr.map((row) => ({
    id: row.id,
    kind: 'ocr' as const,
    title: row.filename || 'OCR hujjat',
    preview: truncate(row.cleaned_text || row.original_text || ''),
    createdAt: row.created_at,
  }))
  const w: Item[] = words.map((row) => ({
    id: row.id,
    kind: 'word' as const,
    title: row.word,
    preview: 'So‘z pasportida qidirilgan',
    createdAt: row.created_at,
  }))
  return [...a, ...o, ...w].sort(
    (x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime(),
  )
}

const KIND_META: Record<Kind, { icon: typeof ScanText; label: string }> = {
  analysis: { icon: ScanText, label: 'Tahlil' },
  ocr: { icon: ScanEye, label: 'OCR' },
  word: { icon: Search, label: "So‘z qidiruvi" },
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([])
  const [ocrDocs, setOcrDocs] = useState<OcrDocumentRow[]>([])
  const [wordSearches, setWordSearches] = useState<WordSearchHistoryRow[]>([])
  const [pendingDelete, setPendingDelete] = useState<Item | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const [aRes, oRes, wRes] = await Promise.all([
      fetchAnalyses(user.id),
      fetchOcrDocuments(user.id),
      fetchWordSearchHistory(user.id),
    ])
    if (aRes.error || oRes.error || wRes.error) {
      setError(aRes.error || oRes.error || wRes.error)
    }
    setAnalyses(aRes.data)
    setOcrDocs(oRes.data)
    setWordSearches(wRes.data)
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (user) load()
  }, [user, load])

  const items = useMemo(() => toItems(analyses, ocrDocs, wordSearches), [analyses, ocrDocs, wordSearches])
  const filtered = tab === 'all' ? items : items.filter((i) => i.kind === tab)

  const openItem = (item: Item) => {
    if (item.kind === 'analysis') {
      const row = analyses.find((r) => r.id === item.id)
      navigate('/app/analyze', { state: { text: row?.original_text ?? '' } })
    } else if (item.kind === 'ocr') {
      const row = ocrDocs.find((r) => r.id === item.id)
      navigate('/app/analyze', { state: { text: row?.cleaned_text || row?.original_text || '' } })
    } else {
      navigate(`/app/word?w=${encodeURIComponent(item.title)}`)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    const { kind, id } = pendingDelete
    const result =
      kind === 'analysis'
        ? await deleteAnalysis(id)
        : kind === 'ocr'
          ? await deleteOcrDocument(id)
          : await deleteWordSearch(id)

    setDeleting(false)
    setPendingDelete(null)

    if (result.error) {
      showError('O‘chirishda xatolik yuz berdi.')
      return
    }

    if (kind === 'analysis') setAnalyses((prev) => prev.filter((r) => r.id !== id))
    else if (kind === 'ocr') setOcrDocs((prev) => prev.filter((r) => r.id !== id))
    else setWordSearches((prev) => prev.filter((r) => r.id !== id))

    showSuccess('Yozuv o‘chirildi.')
  }

  if (!authLoading && !user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="flex items-center gap-3">
          <HistoryIcon size={22} strokeWidth={1.75} className="text-[var(--accent)]" />
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tarix</h1>
        </div>
        <div className="mt-10 flex flex-col items-center rounded-lg border border-dashed border-[var(--border-strong)] py-16 text-center">
          <LogIn size={26} strokeWidth={1.5} className="text-[var(--text-faint)]" />
          <p className="mt-3 text-sm text-[var(--text)]">
            Tarixni ko‘rish uchun tizimga kiring.
          </p>
          <p className="mt-1 max-w-sm text-sm text-[var(--text-faint)]">
            Mehmon sifatida ham barcha vositalardan foydalanishingiz mumkin — faqat natijalar
            saqlanmaydi.
          </p>
          <Link
            to="/login"
            className="mt-5 rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[#04121a] transition-opacity hover:opacity-90"
          >
            Tizimga kirish
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <div className="flex items-center gap-3">
        <HistoryIcon size={22} strokeWidth={1.75} className="text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tarix</h1>
      </div>
      <p className="mt-2 text-sm text-[var(--text-dim)]">
        Saqlangan tahlillar, OCR hujjatlar va so‘z qidiruvlaringiz.
      </p>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              tab === t.key
                ? 'bg-[var(--accent)] text-[#04121a]'
                : 'border border-[var(--border-strong)] text-[var(--text-dim)] hover:text-[var(--text)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {authLoading || loading ? (
        <div className="mt-14 flex flex-col items-center justify-center text-center">
          <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
          <p className="mt-3 text-sm text-[var(--text-faint)]">Yuklanmoqda…</p>
        </div>
      ) : error ? (
        <div className="mt-8 flex items-start gap-2 rounded-md border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>Ma’lumotlarni yuklashda xatolik yuz berdi: {error}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-lg border border-dashed border-[var(--border-strong)] py-16 text-center">
          <Inbox size={26} strokeWidth={1.5} className="text-[var(--text-faint)]" />
          <p className="mt-3 text-sm text-[var(--text)]">Hozircha yozuv yo‘q</p>
          <p className="mt-1 text-sm text-[var(--text-faint)]">
            Tahlil, OCR yoki so‘z qidiruvidan so‘ng "Saqlash" tugmasini bosing.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {filtered.map((item) => {
            const Icon = KIND_META[item.kind].icon
            return (
              <li
                key={`${item.kind}-${item.id}`}
                className="flex items-start gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border-strong)] text-[var(--accent)]">
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="truncate text-[15px] font-medium text-[var(--text)]">
                      {item.title}
                    </span>
                    <span className="rounded-full border border-[var(--border-strong)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--text-faint)]">
                      {KIND_META[item.kind].label}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-[var(--text-dim)]">{item.preview}</p>
                  <p className="mt-1 text-xs text-[var(--text-faint)]">
                    {new Date(item.createdAt).toLocaleString('uz-UZ')}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => openItem(item)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-strong)] px-3 py-1.5 text-xs text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
                  >
                    <ExternalLink size={13} />
                    Ochish
                  </button>
                  <button
                    onClick={() => setPendingDelete(item)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-strong)] px-3 py-1.5 text-xs text-red-300 transition-colors hover:border-red-900/50 hover:text-red-200"
                  >
                    <Trash2 size={13} />
                    O‘chirish
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Yozuvni o‘chirish"
        description={`"${pendingDelete?.title ?? ''}" yozuvini o‘chirmoqchimisiz? Bu amalni bekor qilib bo‘lmaydi.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
