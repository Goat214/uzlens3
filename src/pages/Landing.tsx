import { Link } from 'react-router-dom'
import { ArrowRight, ScanText, SpellCheck, ArrowLeftRight, BookOpenText } from 'lucide-react'

const PIPELINE = ['MATN', "O‘ZBEK TILINI ANIQLASH", 'NORMALIZATSIYA', 'TAHLIL', "RAQAMLI MA'LUMOT"]

const FEATURES = [
  {
    icon: ScanText,
    title: 'Matn tahlili',
    desc: 'Belgilar, so‘zlar, gaplar va paragraflarni lahzada hisoblang.',
  },
  {
    icon: SpellCheck,
    title: 'Imlo va normalizatsiya',
    desc: "Apostrof va bo‘shliqlarni yagona standart ko‘rinishga keltiring.",
  },
  {
    icon: ArrowLeftRight,
    title: 'Lotin ↔ Kiril',
    desc: "O‘zbekcha maxsus harflarni buzmasdan ikki yozuv orasida o‘giring.",
  },
  {
    icon: BookOpenText,
    title: "O‘zbekcha so‘zlar",
    desc: 'Matningizdagi eng ko‘p ishlatilgan so‘zlarni aniqlang.',
  },
]

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grid-fade absolute inset-0 h-[560px]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs text-[var(--text-dim)]">
              Raqamlashtirish tanlovi · MVP 1-bosqich
            </span>
            <h1 className="mt-6 text-[42px] font-semibold leading-[1.08] tracking-tight sm:text-[56px]">
              UZLENS
            </h1>
            <p className="mt-3 font-[var(--font-display)] text-xl text-[var(--accent)] sm:text-2xl">
              O‘zbek tilini raqamli ko‘z bilan ko‘ring.
            </p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--text-dim)]">
              Matn va raqamli kontentdagi o‘zbek tilini tahlil qilish, tozalash va yagona
              formatga keltirish uchun yaratilgan platforma.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/app/analyze"
                className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-medium text-[#04121a] transition-opacity hover:opacity-90"
              >
                Matnni tahlil qilish
                <ArrowRight size={16} />
              </Link>
              <a
                href="#pipeline"
                className="text-sm text-[var(--text-dim)] underline decoration-[var(--border-strong)] underline-offset-4 transition-colors hover:text-[var(--text)]"
              >
                Qanday ishlaydi?
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section id="pipeline" className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-lg font-medium text-[var(--text-dim)]">Ishlash jarayoni</h2>
          <div className="mt-8 flex flex-col items-start gap-0 sm:flex-row sm:items-center sm:gap-0">
            {PIPELINE.map((step, i) => (
              <div key={step} className="flex items-center gap-4 sm:contents">
                <div className="flex items-center gap-3 py-3 sm:flex-col sm:items-start sm:py-0">
                  <span className="font-[var(--font-mono)] text-xs text-[var(--text-faint)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-[var(--font-display)] text-sm font-medium tracking-tight text-[var(--text)] sm:mt-2">
                    {step}
                  </span>
                </div>
                {i < PIPELINE.length - 1 && (
                  <div className="ml-1 h-6 w-px bg-[var(--border-strong)] sm:ml-4 sm:h-px sm:w-10 sm:flex-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-px overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[var(--bg)] p-6">
                <Icon size={20} strokeWidth={1.5} className="text-[var(--accent)]" />
                <h3 className="mt-4 text-[15px] font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-dim)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
