import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ScanText,
  ArrowLeftRight,
  ScanEye,
  Library,
  Inbox,
  History as HistoryIcon,
  Loader2,
} from 'lucide-react'
import { getStats, type UzlensStats } from '../lib/stats/localStats'
import { useAuth } from '../lib/auth/AuthContext'
import {
  countAnalyses,
  countOcrDocuments,
  countWordSearches,
  fetchAnalyses,
  fetchOcrDocuments,
  fetchWordSearchHistory,
} from '../lib/api/history'
import type { AnalysisRow, OcrDocumentRow, WordSearchHistoryRow } from '../lib/supabase-types'

const QUICK_ACTIONS = [
  { to: '/app/analyze', icon: ScanText, title: 'Matn tahlili', desc: 'Statistika va til aniqlash' },
  { to: '/app/convert', icon: ArrowLeftRight, title: 'Lotin ↔ Kiril', desc: 'Yozuvni o‘girish' },
  { to: '/app/ocr', icon: ScanEye, title: 'OCR', desc: 'Rasmdan matn ajratish' },
  { to: '/app/dictionary', icon: Library, title: 'Lug‘at', desc: "So‘zlarni qidirish" },
]

interface RecentItem {
  key: string
  title: string
  subtitle: string
  createdAt: string
}

function buildRecent(a: AnalysisRow[], o: OcrDocumentRow[], w: WordSearchHistoryRow[]): RecentItem[] {
  const items: RecentItem[] = [
    ...a.map((r) => ({
      key: `a-${r.id}`,
      title: r.language ? `${r.language} tahlili` : 'Matn tahlili',
      subtitle: `${r.word_count} so‘z`,
      createdAt: r.created_at,
    })),
    ...o.map((r) => ({
      key: `o-${r.id}`,
      title: r.filename || 'OCR hujjat',
      subtitle: 'OCR natijasi',
      createdAt: r.created_at,
    })),
    ...w.map((r) => ({
      key: `w-${r.id}`,
      title: r.word,
      subtitle: "So‘z qidiruvi",
      createdAt: r.created_at,
    })),
  ]
  return items
    .sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())
    .slice(0, 5)
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()

  // Guest (local) stats
  const [localStats, setLocalStats] = useState<UzlensStats | null>(null)

  // Authenticated (Supabase) stats
  const [cloudLoading, setCloudLoading] = useState(false)
  const [cloudCounts, setCloudCounts] = useState<{ analyses: number; ocr: number; words: number } | null>(
    null,
  )
  const [recent, setRecent] = useState<RecentItem[]>([])

  useEffect(() => {
    if (!user) setLocalStats(getStats())
  }, [user])

  useEffect(() => {
    if (!user) return
    let active = true
    setCloudLoading(true)
    Promise.all([
      countAnalyses(user.id),
      countOcrDocuments(user.id),
      countWordSearches(user.id),
      fetchAnalyses(user.id, 5),
      fetchOcrDocuments(user.id, 5),
      fetchWordSearchHistory(user.id, 5),
    ]).then(([analysesCount, ocrCount, wordsCount, aRes, oRes, wRes]) => {
      if (!active) return
      setCloudCounts({ analyses: analysesCount, ocr: ocrCount, words: wordsCount })
      setRecent(buildRecent(aRes.data, oRes.data, wRes.data))
      setCloudLoading(false)
    })
    return () => {
      active = false
    }
  }, [user])

  const statCards = useMemo(() => {
    if (user && cloudCounts) {
      return [
        { label: 'Tahlillar', value: cloudCounts.analyses },
        { label: 'OCR hujjatlar', value: cloudCounts.ocr },
        { label: 'So‘z qidiruvlari', value: cloudCounts.words },
      ]
    }
    const s = localStats ?? { analyses: 0, wordsAnalyzed: 0, conversions: 0, ocrDocs: 0, wordSearches: 0 }
    return [
      { label: 'Tahlil', value: s.analyses },
      { label: "So‘z", value: s.wordsAnalyzed },
      { label: 'Konvertatsiya', value: s.conversions },
      { label: 'OCR hujjatlar', value: s.ocrDocs },
      { label: 'Qidirilgan so‘zlar', value: s.wordSearches },
    ]
  }, [user, cloudCounts, localStats])

  const hasLocalActivity = localStats
    ? localStats.analyses + localStats.conversions + localStats.ocrDocs + localStats.wordSearches > 0
    : false

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">UZLENS Workspace</h1>
      <p className="mt-2 text-sm text-[var(--text-dim)]">
        {user
          ? 'Statistikangiz va so‘nggi faoliyatingiz — Supabase orqali saqlanadi.'
          : 'Matningizni tahlil qiling, rasmdan matn ajrating yoki so‘z pasportini ko‘ring — mehmon rejimida barchasi lokal ishlaydi.'}
      </p>

      {/* Quick actions */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {QUICK_ACTIONS.map(({ to, icon: Icon, title, desc }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--accent-dim)]"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border-strong)] text-[var(--accent)]">
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <div>
                <div className="text-[15px] font-medium">{title}</div>
                <div className="text-sm text-[var(--text-dim)]">{desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      {user && cloudLoading ? (
        <div className="mt-10 flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] py-10 text-sm text-[var(--text-faint)]">
          <Loader2 size={16} className="animate-spin" />
          Statistika yuklanmoqda…
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 divide-x divide-y divide-[var(--border)] overflow-hidden rounded-lg border border-[var(--border)] sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-5">
          {statCards.map((card) => (
            <div key={card.label} className="bg-[var(--surface)] px-4 py-6 text-center">
              <div className="font-[var(--font-display)] text-2xl font-semibold text-[var(--accent)] sm:text-3xl">
                {card.value}
              </div>
              <div className="mt-1 text-xs text-[var(--text-dim)] sm:text-sm">{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent activity */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--text-dim)]">So‘nggi faoliyat</h2>
          {user && (
            <Link
              to="/app/history"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] underline underline-offset-4"
            >
              <HistoryIcon size={13} />
              Barcha tarixni ko‘rish
            </Link>
          )}
        </div>

        {user ? (
          !cloudLoading && recent.length > 0 ? (
            <ul className="mt-4 divide-y divide-[var(--border)] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
              {recent.map((item) => (
                <li key={item.key} className="flex items-center justify-between px-5 py-3.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm text-[var(--text)]">{item.title}</div>
                    <div className="text-xs text-[var(--text-faint)]">{item.subtitle}</div>
                  </div>
                  <span className="shrink-0 text-xs text-[var(--text-faint)]">
                    {new Date(item.createdAt).toLocaleDateString('uz-UZ')}
                  </span>
                </li>
              ))}
            </ul>
          ) : !cloudLoading ? (
            <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border-strong)] py-16 text-center">
              <Inbox size={28} strokeWidth={1.5} className="text-[var(--text-faint)]" />
              <p className="mt-3 text-sm text-[var(--text-dim)]">Hozircha faoliyat yo‘q</p>
              <p className="mt-1 text-sm text-[var(--text-faint)]">
                Tahlil yoki OCR natijasini saqlaganingizda shu yerda ko‘rinadi.
              </p>
            </div>
          ) : null
        ) : (
          !hasLocalActivity && (
            <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border-strong)] py-16 text-center">
              <Inbox size={28} strokeWidth={1.5} className="text-[var(--text-faint)]" />
              <p className="mt-3 text-sm text-[var(--text-dim)]">Hozircha faoliyat yo‘q</p>
              <p className="mt-1 text-sm text-[var(--text-faint)]">
                Tahlil, konvertatsiya yoki OCR qilinganda shu yerda ko‘rinadi. Bular — demo
                statistika, faqat shu qurilmada saqlanadi.
              </p>
            </div>
          )
        )}
        {!user && hasLocalActivity && (
          <p className="mt-3 text-xs text-[var(--text-faint)]">
            Bu — mehmon rejimidagi demo statistika (faqat shu brauzerda saqlanadi).{' '}
            <Link to="/register" className="text-[var(--accent)] underline underline-offset-4">
              Ro‘yxatdan o‘ting
            </Link>{' '}
            va natijalaringizni bulutda saqlang.
          </p>
        )}
      </div>
    </div>
  )
}
