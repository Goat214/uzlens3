const SECTIONS = [
  {
    title: 'Muammo',
    body: "O‘zbek tilidagi raqamli kontent turli yozuv, format va imlo ko‘rinishlarida mavjud.",
  },
  {
    title: 'Yechim',
    body: 'UZLENS matnni yagona raqamli til qatlamida qayta ishlashga yordam beradi.',
  },
  {
    title: 'Vision',
    body: "O‘zbek tili uchun kengaytiriladigan NLP platforma yaratish.",
  },
]

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <span className="text-xs uppercase tracking-wide text-[var(--text-faint)]">
        Loyiha haqida
      </span>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        UZLENS nima uchun yaratildi
      </h1>

      <div className="mt-10 divide-y divide-[var(--border)] border-t border-[var(--border)]">
        {SECTIONS.map((s) => (
          <div key={s.title} className="grid gap-2 py-8 sm:grid-cols-[160px_1fr] sm:gap-8">
            <h2 className="font-[var(--font-display)] text-base font-medium text-[var(--accent)]">
              {s.title}
            </h2>
            <p className="text-[15px] leading-relaxed text-[var(--text-dim)]">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
