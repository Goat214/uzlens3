import { Eye } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-8 text-sm text-[var(--text-faint)] sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <Eye size={16} strokeWidth={1.75} className="text-[var(--accent-dim)]" />
          <span>UZLENS — O‘zbek tilini raqamli ko‘z bilan ko‘ring.</span>
        </div>
        <span>MVP · 1-bosqich</span>
      </div>
    </footer>
  )
}
