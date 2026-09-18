/**
 * Local text statistics for Uzbek text: characters, words, sentences,
 * paragraphs, and word frequency — all computed client-side, no network.
 */

export function countCharacters(text: string, includeSpaces = true): number {
  if (!text) return 0
  return includeSpaces ? text.length : text.replace(/\s/g, '').length
}

export function countWords(text: string): number {
  if (!text.trim()) return 0
  const matches = text.trim().match(/[\p{L}\p{N}\u02BB'’]+/gu)
  return matches ? matches.length : 0
}

export function countSentences(text: string): number {
  if (!text.trim()) return 0
  const matches = text
    .trim()
    .split(/[.!?…]+(?:\s|$)/)
    .map((s) => s.trim())
    .filter(Boolean)
  return matches.length
}

export function countParagraphs(text: string): number {
  if (!text.trim()) return 0
  return text
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean).length
}

export interface WordFrequencyEntry {
  word: string
  count: number
}

/** Returns the most frequent words in descending order of count. */
export function getWordFrequency(text: string, limit = 10): WordFrequencyEntry[] {
  const matches = text.toLowerCase().match(/[\p{L}\u02BB']+/gu) ?? []
  const counts = new Map<string, number>()
  for (const word of matches) {
    counts.set(word, (counts.get(word) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, limit)
}

export interface TextStatistics {
  characters: number
  charactersNoSpaces: number
  words: number
  sentences: number
  paragraphs: number
  averageWordLength: number
}

export function computeStatistics(text: string): TextStatistics {
  const characters = countCharacters(text, true)
  const charactersNoSpaces = countCharacters(text, false)
  const words = countWords(text)
  const sentences = countSentences(text)
  const paragraphs = countParagraphs(text)
  const averageWordLength = words > 0 ? Math.round((charactersNoSpaces / words) * 10) / 10 : 0

  return { characters, charactersNoSpaces, words, sentences, paragraphs, averageWordLength }
}
