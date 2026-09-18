import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createWorker } from 'tesseract.js'
import { UploadCloud, ScanEye, Copy, Check, AlertTriangle, Save, LogIn } from 'lucide-react'
import { normalizeUzbekText } from '../lib/nlp/normalize'
import { latinToCyrillic } from '../lib/converter/latinToCyrillic'
import { cyrillicToLatin } from '../lib/converter/cyrillicToLatin'
import { recordOcr } from '../lib/stats/localStats'
import { useAuth } from '../lib/auth/AuthContext'
import { useToast } from '../lib/toast/ToastContext'
import { saveOcrDocument } from '../lib/api/history'

type Stage = 'idle' | 'loaded' | 'uploading' | 'recognizing' | 'cleaning' | 'done' | 'error'

const STEP_LABELS: { key: Stage; label: string }[] = [
  { key: 'uploading', label: 'Rasm yuklandi' },
  { key: 'recognizing', label: 'Matn aniqlanmoqda' },
  { key: 'cleaning', label: 'Matn tozalanmoqda' },
  { key: 'done', label: 'Natija tayyor' },
]

const MAX_FILE_SIZE = 12 * 1024 * 1024 // 12MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

export default function Ocr() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [error, setError] = useState<string | null>(null)
  const [originalText, setOriginalText] = useState('')
  const [rawResult, setRawResult] = useState('')
  const [confidence, setConfidence] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [saving, setSaving] = useState(false)

  const validateAndSetFile = (candidate: File | undefined) => {
    setError(null)
    if (!candidate) return
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      setError('Faqat JPG yoki PNG formatidagi rasmlar qabul qilinadi.')
      return
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setError("Rasm hajmi juda katta. Iltimos, 12 MB dan kichik rasm tanlang.")
      return
    }
    setFile(candidate)
    setImageUrl(URL.createObjectURL(candidate))
    setStage('loaded')
    setRawResult('')
    setOriginalText('')
    setConfidence(null)
  }

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSetFile(e.target.files?.[0])
  }

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    validateAndSetFile(e.dataTransfer.files?.[0])
  }, [])

  const runOcr = async () => {
    if (!file) return
    setError(null)
    setStage('uploading')

    try {
      await new Promise((r) => setTimeout(r, 300))
      setStage('recognizing')

      let worker
      try {
        worker = await createWorker('uzb')
      } catch {
        worker = await createWorker('eng')
      }

      const { data } = await worker.recognize(file)
      await worker.terminate()

      setStage('cleaning')
      const cleaned = normalizeUzbekText(data.text)
      await new Promise((r) => setTimeout(r, 200))

      setOriginalText(data.text)
      setRawResult(cleaned)
      setConfidence(typeof data.confidence === 'number' ? data.confidence : null)
      setStage('done')
      recordOcr()
    } catch (err) {
      console.error(err)
      setError("Matnni aniqlashda xatolik yuz berdi. Boshqa rasm bilan qayta urinib ko‘ring.")
      setStage('error')
    }
  }

  const copy = async () => {
    if (!rawResult) return
    await navigator.clipboard.writeText(rawResult)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const toLatin = () => setRawResult((t) => cyrillicToLatin(t))
  const toCyrillic = () => setRawResult((t) => latinToCyrillic(t))

  const sendToAnalyzer = () => {
    navigate('/app/analyze', { state: { text: rawResult } })
  }

  const handleSave = async () => {
    if (!rawResult) return
    if (!user) {
      showError('Natijani saqlash uchun tizimga kiring.')
      return
    }
    setSaving(true)
    const { error } = await saveOcrDocument({
      userId: user.id,
      filename: file?.name || 'rasm.png',
      originalText,
      cleanedText: rawResult,
      confidence,
    })
    setSaving(false)
    if (error) {
      showError('Saqlashda xatolik yuz berdi.')
      return
    }
    showSuccess('OCR natijasi saqlandi.')
  }

  const reset = () => {
    setFile(null)
    setImageUrl(null)
    setStage('idle')
    setRawResult('')
    setOriginalText('')
    setConfidence(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const activeStepIndex = STEP_LABELS.findIndex((s) => s.key === stage)

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex items-center gap-3">
        <ScanEye size={22} strokeWidth={1.75} className="text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">O‘zbekcha OCR</h1>
      </div>
      <p className="mt-2 max-w-xl text-sm text-[var(--text-dim)]">
        Rasmdagi o‘zbekcha matnni aniqlang. Aniqlash brauzeringizda, mahalliy ravishda
        ishlaydi.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Upload / preview */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-medium text-[var(--text-dim)]">Rasm</h2>

          {!imageUrl ? (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center transition-colors ${
                dragOver
                  ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                  : 'border-[var(--border-strong)] hover:border-[var(--accent-dim)]'
              }`}
            >
              <UploadCloud size={28} strokeWidth={1.5} className="text-[var(--text-faint)]" />
              <p className="mt-3 text-sm text-[var(--text)]">
                Rasmni shu yerga tashlang yoki tanlash uchun bosing
              </p>
              <p className="mt-1 text-xs text-[var(--text-faint)]">JPG yoki PNG, 12 MB gacha</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={onFileInput}
                className="hidden"
              />
            </div>
          ) : (
            <div className="mt-4">
              <img
                src={imageUrl}
                alt="Yuklangan rasm"
                className="max-h-80 w-full rounded-md border border-[var(--border)] object-contain"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={runOcr}
                  disabled={stage === 'uploading' || stage === 'recognizing' || stage === 'cleaning'}
                  className="rounded-md bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[#04121a] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Matnni aniqlash
                </button>
                <button
                  onClick={reset}
                  className="rounded-md border border-[var(--border-strong)] px-4 py-2 text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
                >
                  Boshqa rasm
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {(stage === 'uploading' || stage === 'recognizing' || stage === 'cleaning' || stage === 'done') && (
            <ol className="mt-6 space-y-2">
              {STEP_LABELS.map((step, i) => {
                const isActive = step.key === stage
                const isComplete = activeStepIndex > i || stage === 'done'
                return (
                  <li key={step.key} className="flex items-center gap-3 text-sm">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                        isComplete
                          ? 'border-[var(--accent)] bg-[var(--accent)] text-[#04121a]'
                          : isActive
                            ? 'border-[var(--accent)] text-[var(--accent)]'
                            : 'border-[var(--border-strong)] text-[var(--text-faint)]'
                      }`}
                    >
                      {isComplete ? '✓' : i + 1}
                    </span>
                    <span className={isActive || isComplete ? 'text-[var(--text)]' : 'text-[var(--text-faint)]'}>
                      {step.label}
                    </span>
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        {/* Result */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--text-dim)]">Ajratilgan matn</h2>
            {confidence !== null && (
              <span className="rounded-full border border-[var(--border-strong)] px-2.5 py-0.5 text-xs text-[var(--text-faint)]">
                Ishonch: {Math.round(confidence)}%
              </span>
            )}
          </div>

          <textarea
            value={rawResult}
            onChange={(e) => setRawResult(e.target.value)}
            rows={10}
            placeholder="Natija shu yerda ko‘rinadi..."
            className="mt-3 w-full resize-none rounded-md border border-[var(--border)] bg-[var(--bg)] p-4 text-[15px] leading-relaxed text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--accent-dim)]"
          />

          {stage === 'done' && (
            <p className="mt-2 text-xs text-[var(--text-faint)]">
              OCR natijasi avtomatik tekshirilishi tavsiya etiladi.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={copy}
              disabled={!rawResult}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-strong)] px-3.5 py-2 text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? <Check size={14} className="text-[var(--accent)]" /> : <Copy size={14} />}
              Nusxalash
            </button>
            <button
              onClick={toLatin}
              disabled={!rawResult}
              className="rounded-md border border-[var(--border-strong)] px-3.5 py-2 text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Lotinga
            </button>
            <button
              onClick={toCyrillic}
              disabled={!rawResult}
              className="rounded-md border border-[var(--border-strong)] px-3.5 py-2 text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Kirillga
            </button>
            <button
              onClick={handleSave}
              disabled={!rawResult || saving}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-strong)] px-3.5 py-2 text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {user ? <Save size={14} /> : <LogIn size={14} />}
              {saving ? 'Saqlanmoqda…' : 'Saqlash'}
            </button>
            <button
              onClick={sendToAnalyzer}
              disabled={!rawResult}
              className="ml-auto rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#04121a] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Matnni tahlil qilish
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
