import { useState } from 'react'
import { ArrowLeftRight, Copy, Check, ArrowRightLeft } from 'lucide-react'
import { latinToCyrillic } from '../lib/converter/latinToCyrillic'
import { cyrillicToLatin } from '../lib/converter/cyrillicToLatin'
import { recordConversion } from '../lib/stats/localStats'

export default function Converter() {
  const [latin, setLatin] = useState("Mehmondo‘stlik o‘zbek xalqining muhim qadriyatlaridan biridir.")
  const [cyrillic, setCyrillic] = useState('')
  const [copied, setCopied] = useState<'latin' | 'cyrillic' | null>(null)

  const toCyrillic = () => {
    setCyrillic(latinToCyrillic(latin))
    recordConversion()
  }
  const toLatin = () => {
    setLatin(cyrillicToLatin(cyrillic))
    recordConversion()
  }

  const swap = () => {
    setLatin(cyrillic ? cyrillicToLatin(cyrillic) : latin)
    setCyrillic(latin ? latinToCyrillic(latin) : cyrillic)
    recordConversion()
  }

  const copy = async (which: 'latin' | 'cyrillic') => {
    const text = which === 'latin' ? latin : cyrillic
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(which)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex items-center gap-3">
        <ArrowLeftRight size={22} strokeWidth={1.75} className="text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Lotin ↔ Kiril</h1>
      </div>
      <p className="mt-2 max-w-xl text-sm text-[var(--text-dim)]">
        O‘zbek tiliga xos harflarni (o‘, g‘, q, h, x) to‘g‘ri hisobga olgan holda ikki yozuv
        orasida o‘giring.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={toCyrillic}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#04121a] transition-opacity hover:opacity-90"
        >
          Kirillga o‘tkazish
        </button>
        <button
          onClick={toLatin}
          className="rounded-md border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--accent-dim)]"
        >
          Lotinga o‘tkazish
        </button>
        <button
          onClick={swap}
          className="inline-flex items-center gap-2 rounded-md border border-[var(--border-strong)] px-4 py-2 text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
        >
          <ArrowRightLeft size={15} />
          Almashtirish
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel
          title="Lotin"
          value={latin}
          onChange={setLatin}
          onCopy={() => copy('latin')}
          copied={copied === 'latin'}
        />
        <Panel
          title="Kiril"
          value={cyrillic}
          onChange={setCyrillic}
          onCopy={() => copy('cyrillic')}
          copied={copied === 'cyrillic'}
        />
      </div>
    </div>
  )
}

function Panel({
  title,
  value,
  onChange,
  onCopy,
  copied,
}: {
  title: string
  value: string
  onChange: (v: string) => void
  onCopy: () => void
  copied: boolean
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--text-dim)]">{title}</h2>
        <button
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-faint)] transition-colors hover:text-[var(--text)]"
        >
          {copied ? <Check size={13} className="text-[var(--accent)]" /> : <Copy size={13} />}
          {copied ? 'Nusxalandi' : 'Nusxalash'}
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        placeholder={title === 'Lotin' ? "o‘zbekcha matn..." : 'ўзбекча матн...'}
        className="mt-3 w-full resize-none rounded-md border border-[var(--border)] bg-[var(--bg)] p-4 font-[var(--font-body)] text-[15px] leading-relaxed text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--accent-dim)]"
      />
    </div>
  )
}
