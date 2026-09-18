/**
 * Demo usage statistics persisted to localStorage. Client-side only, no
 * backend — this is placeholder tracking for the dashboard until a real
 * data layer (stage 3+) is introduced.
 */

const STORAGE_KEY = 'uzlens_stats_v1'

export interface UzlensStats {
  analyses: number
  wordsAnalyzed: number
  conversions: number
  ocrDocs: number
  wordSearches: number
}

const DEFAULT_STATS: UzlensStats = {
  analyses: 0,
  wordsAnalyzed: 0,
  conversions: 0,
  ocrDocs: 0,
  wordSearches: 0,
}

function readStats(): UzlensStats {
  if (typeof window === 'undefined') return { ...DEFAULT_STATS }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATS }
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_STATS, ...parsed }
  } catch {
    return { ...DEFAULT_STATS }
  }
}

function writeStats(stats: UzlensStats) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // localStorage unavailable (private mode, quota) — fail silently, demo stats only.
  }
}

export function getStats(): UzlensStats {
  return readStats()
}

export function recordAnalysis(wordCount: number): UzlensStats {
  const stats = readStats()
  stats.analyses += 1
  stats.wordsAnalyzed += wordCount
  writeStats(stats)
  return stats
}

export function recordConversion(): UzlensStats {
  const stats = readStats()
  stats.conversions += 1
  writeStats(stats)
  return stats
}

export function recordOcr(): UzlensStats {
  const stats = readStats()
  stats.ocrDocs += 1
  writeStats(stats)
  return stats
}

export function recordWordSearch(): UzlensStats {
  const stats = readStats()
  stats.wordSearches += 1
  writeStats(stats)
  return stats
}
